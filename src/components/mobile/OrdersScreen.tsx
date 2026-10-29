import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

interface OrdersScreenProps {
  onOpenTracking: (order: Order) => void;
  onStartShopping: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onOpenTracking,
  onStartShopping,
}) => {
  const { orders, t, formatPrice } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit';
    }
    if (filter === 'delivered') {
      return order.status === 'delivered';
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Truck className="w-3 h-3" />
            <span>In Transit</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      {/* Header & Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>{t('myOrders')}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
            {orders.length}
          </span>
        </h2>
      </div>

      {/* Segmented Filter */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'active' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active ({orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
            filter === 'delivered' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'delivered').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center p-6 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Package className="w-10 h-10 text-slate-600" />
          <div className="text-sm font-semibold text-slate-300">No orders found</div>
          <p className="text-xs text-slate-400 max-w-xs">
            You don't have any orders matching this category yet.
          </p>
          <button
            onClick={onStartShopping}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider"
          >
            {t('startShopping')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOpenTracking(order)}
              className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 shadow-sm transition-all cursor-pointer space-y-3"
            >
              {/* Order Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.deliveryZone}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-white">
                    {formatPrice(order.total)}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Items Thumbnails */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex -space-x-2 overflow-hidden">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.product.image}
                      alt={item.product.name}
                      className="inline-block w-8 h-8 rounded-lg object-cover ring-2 ring-slate-900 bg-slate-950"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center ring-2 ring-slate-900">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-300 truncate flex-1 ml-2">
                  {order.items[0]?.product.name}
                  {order.items.length > 1 && ` and ${order.items.length - 1} more`}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 shrink-0"
                >
                  <span>{t('trackOrder')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rider preview if in transit */}
              {order.status === 'in_transit' && order.assignedRider && (
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Rider: <strong>{order.assignedRider.name}</strong> is on the way</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                    ETA 25m
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

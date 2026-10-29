import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  Phone,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  PhoneOff,
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const { t, formatPrice } = useApp();
  const [callRiderSim, setCallRiderSim] = useState<boolean>(false);
  const [callConnected, setCallConnected] = useState<boolean>(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState<boolean>(false);

  const startRiderCall = () => {
    setCallRiderSim(true);
    setCallConnected(false);
    setTimeout(() => {
      setCallConnected(true);
    }, 2000);
  };

  const endRiderCall = () => {
    setCallRiderSim(false);
    setCallConnected(false);
  };

  const statusColor =
    order.status === 'delivered'
      ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
      : order.status === 'in_transit'
      ? 'bg-amber-950/80 border-amber-700/60 text-amber-300'
      : order.status === 'processing'
      ? 'bg-sky-950/80 border-sky-700/60 text-sky-300'
      : order.status === 'cancelled'
      ? 'bg-rose-950/80 border-rose-700/60 text-rose-300'
      : 'bg-slate-800/80 border-slate-700 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {t('trackOrder')}
                </h3>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvoicePrint(true)}
              title="Print Receipt"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Tracking Details */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${statusColor}`}>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {t('orderStatus')}
              </div>
              <div className="text-base font-black capitalize mt-0.5">
                {order.status.replace('_', ' ')}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">
                {order.paymentMethod === 'momo_mtn'
                  ? 'MTN MoMo (*182#)'
                  : order.paymentMethod === 'airtel_money'
                  ? 'Airtel Money'
                  : order.paymentMethod === 'card'
                  ? 'Bank Card'
                  : 'Cash on Delivery'}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Rider Information (if assigned) */}
          {order.assignedRider && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 border border-slate-700">
                  {order.assignedRider.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-slate-400">{t('assignedCourier')}</div>
                  <div className="text-sm font-bold text-white">{order.assignedRider.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{order.assignedRider.vehicle}</div>
                </div>
              </div>

              <button
                onClick={startRiderCall}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('callRider')}</span>
              </button>
            </div>
          )}

          {/* Visual Step Progress Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Real-Time Courier Tracking Timeline
            </h4>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {order.trackingSteps.map((step, idx) => (
                <div key={step.id || idx} className="relative flex items-start gap-4">
                  <div
                    className={`relative z-10 w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                      step.completed
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : step.current
                        ? 'bg-sky-500 text-white font-bold ring-4 ring-sky-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h5
                        className={`text-sm font-bold ${
                          step.completed || step.current ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h5>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {step.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1.5 font-medium">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{step.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Details */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              {t('deliveryDestination')}
            </div>
            <div className="text-white font-medium">{order.userName} ({order.userPhone})</div>
            <div className="text-slate-400">{order.deliveryAddress}</div>
            <div className="text-amber-400/90 font-medium">{order.deliveryZone}</div>
            {order.notes && (
              <div className="text-slate-400 italic pt-1 border-t border-slate-800/80">
                "{order.notes}"
              </div>
            )}
          </div>

          {/* Ordered Items summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Items in this Shipment ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>
            <div className="divide-y divide-slate-800 bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{item.product.name}</div>
                      <div className="text-slate-400 mt-0.5">
                        Qty: {item.quantity}
                        {item.selectedSize && ` · Size: ${item.selectedSize}`}
                        {item.selectedColor && ` · ${item.selectedColor}`}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-amber-400 shrink-0 text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Totals */}
          <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>{t('vatTax')}</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>{t('deliveryFee')}</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>{t('discount')}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>{t('totalAmount')}</span>
              <span className="text-amber-400 font-black">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Modal: Call Rider Simulator */}
        {callRiderSim && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 animate-pulse">
              <PhoneCall className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">{order.assignedRider?.name}</h4>
            <div className="text-sm text-slate-400 font-mono mt-1">{order.assignedRider?.phone}</div>
            <div className="text-xs text-emerald-400 font-semibold mt-2">
              {callConnected ? '● Connected (00:14) - "Hello, I am near Rwamagana market!"' : 'Dialing rider on MTN Rwanda...'}
            </div>

            <button
              onClick={endRiderCall}
              className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        )}

        {/* Modal: Print Receipt Preview */}
        {showInvoicePrint && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col text-slate-900 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">D&G E-COMMERCE RWANDA</h2>
                <p className="text-xs text-slate-600">Rwamagana Commercial District, Eastern Province</p>
                <p className="text-xs text-slate-600">Tel: +250 788 456 789 · Email: contact@dg-rwanda.rw</p>
              </div>
              <button
                onClick={() => setShowInvoicePrint(false)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-xs">
              <div className="font-bold text-slate-800">OFFICIAL RECEIPT / INVOICE</div>
              <div className="text-slate-600">Order Ref: <strong>{order.orderNumber}</strong></div>
              <div className="text-slate-600">Date: {new Date(order.createdAt).toLocaleString()}</div>
              <div className="text-slate-600">Customer: {order.userName} ({order.userPhone})</div>
              <div className="text-slate-600">Address: {order.deliveryAddress}, {order.deliveryZone}</div>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-300 my-2">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-2 text-left">Item</th>
                  <th className="border border-slate-300 p-2 text-center">Qty</th>
                  <th className="border border-slate-300 p-2 text-right">Price</th>
                  <th className="border border-slate-300 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 font-medium">{it.product.name}</td>
                    <td className="border border-slate-300 p-2 text-center">{it.quantity}</td>
                    <td className="border border-slate-300 p-2 text-right">{it.product.price.toLocaleString()} RWF</td>
                    <td className="border border-slate-300 p-2 text-right font-bold">{(it.product.price * it.quantity).toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right text-xs space-y-1 mt-3">
              <div>Subtotal: {order.subtotal.toLocaleString()} RWF</div>
              <div>Delivery: {order.deliveryFee.toLocaleString()} RWF</div>
              <div>VAT (18%): {order.tax.toLocaleString()} RWF</div>
              <div className="text-base font-bold text-slate-900 pt-1 border-t">
                Total Paid: {order.total.toLocaleString()} RWF
              </div>
            </div>

            <div className="mt-8 text-center text-[11px] text-slate-500 border-t pt-4">
              Murakoze guhahira muri D&G E-Commerce Rwamagana! Thank you for shopping with us!
            </div>

            <div className="mt-6 flex justify-end gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold"
              >
                Print to PDF
              </button>
              <button
                onClick={() => setShowInvoicePrint(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HomeScreen } from './HomeScreen';
import { CartScreen } from './CartScreen';
import { OrdersScreen } from './OrdersScreen';
import { ProfileScreen } from './ProfileScreen';
import { ProductModal } from './ProductModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { Product, Order } from '../../types';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Package,
  User,
  Wifi,
  Battery,
  Signal,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const MobileShell: React.FC = () => {
  const {
    mobileDevice,
    cartCount,
    orders,
    t,
    user,
    selectedProduct,
    setSelectedProduct,
    activeTrackingOrder,
    setActiveTrackingOrder,
    openAuthModal,
  } = useApp();

  // Active Mobile Tab
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'cart' | 'orders' | 'profile'>('home');

  const pendingOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
      case 'catalog':
        return (
          <HomeScreen
            onOpenProduct={(prod) => setSelectedProduct(prod)}
            onOpenCart={() => setActiveTab('cart')}
          />
        );
      case 'cart':
        return (
          <CartScreen
            onContinueShopping={() => setActiveTab('home')}
            onOrderCompleted={() => setActiveTab('orders')}
            onOpenAuth={() => openAuthModal('login')}
          />
        );
      case 'orders':
        return (
          <OrdersScreen
            onOpenTracking={(ord) => setActiveTrackingOrder(ord)}
            onStartShopping={() => setActiveTab('home')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onOpenAuth={() => openAuthModal('login')}
            onOpenOrders={() => setActiveTab('orders')}
          />
        );
      default:
        return null;
    }
  };

  // Device framing classes
  const isChassis = mobileDevice !== 'responsive';

  return (
    <div className="flex justify-center items-center py-4 px-2 sm:px-4">
      {/* Phone Body Frame */}
      <div
        className={`relative w-full transition-all duration-300 flex flex-col overflow-hidden bg-slate-950 text-slate-100 ${
          isChassis
            ? 'max-w-[420px] h-[860px] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-slate-700/50'
            : 'max-w-4xl min-h-[820px] rounded-2xl border border-slate-800 shadow-xl'
        }`}
      >
        {/* Hardware Status Bar (iOS / Android) */}
        {isChassis && (
          <div className="relative z-30 pt-3 px-6 pb-2 flex items-center justify-between text-xs text-slate-200 select-none">
            {/* Clock */}
            <span className="font-semibold text-xs tracking-tight">09:41</span>

            {/* Dynamic Island / Camera Punch Hole */}
            {mobileDevice === 'iphone' ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center gap-2 px-2 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
              </div>
            ) : (
              <div className="absolute left-1/2 -translate-x-1/2 top-3 w-4 h-4 rounded-full bg-slate-900 border border-slate-800 shadow-inner"></div>
            )}

            {/* Right Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Mobile Header Bar */}
        <div className="z-20 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
              D&G
            </div>
            <div>
              <div className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
                <span>D&G Rwanda</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                <span>Rwamagana Hub</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Scrollable Screen Body */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 no-scrollbar">
          {renderActiveScreen()}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">{t('home')}</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'catalog' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px]">{t('catalog')}</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'cart' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px]">{t('cart')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'orders' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            {pendingOrdersCount > 0 && (
              <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
            <span className="text-[10px]">{t('orders')}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">{t('profile')}</span>
          </button>
        </div>

        {/* Chassis Home Bar Indicator (iOS) */}
        {isChassis && mobileDevice === 'iphone' && (
          <div className="py-1 bg-slate-950 flex justify-center">
            <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCart={() => {
            setSelectedProduct(null);
            setActiveTab('cart');
          }}
        />
      )}

      {/* Order Tracking Modal */}
      {activeTrackingOrder && (
        <OrderTrackingModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
        />
      )}
    </div>
  );
};

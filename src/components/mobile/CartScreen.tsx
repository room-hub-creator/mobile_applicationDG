import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Smartphone,
  CreditCard,
  Banknote,
  Truck,
} from 'lucide-react';

interface CartScreenProps {
  onContinueShopping: () => void;
  onOrderCompleted: () => void;
  onOpenAuth: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onContinueShopping,
  onOrderCompleted,
  onOpenAuth,
}) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    deliveryZone,
    setDeliveryZone,
    couponCode,
    applyCoupon,
    placeOrder,
    user,
    formatPrice,
    t,
    settings,
  } = useApp();

  const [inputCoupon, setInputCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo_mtn' | 'airtel_money' | 'card' | 'cod'>('momo_mtn');
  const [momoPhone, setMomoPhone] = useState(user?.phone || '+250 788 123 456');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Rwamagana Town, Near Market');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [momoModalPrompt, setMomoModalPrompt] = useState(false);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    applyCoupon(inputCoupon);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'momo_mtn' || paymentMethod === 'airtel_money') {
      // Show simulated Mobile Money confirmation prompt (*182# USSD popup)
      setMomoModalPrompt(true);
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setIsSubmitting(true);
    const result = await placeOrder({
      paymentMethod,
      paymentPhone: momoPhone,
      deliveryAddress,
      deliveryZone:
        deliveryZone === 'rwamagana'
          ? 'Rwamagana Town'
          : deliveryZone === 'kigali'
          ? 'Kigali City'
          : 'Eastern Province',
      notes,
    });

    setIsSubmitting(false);
    setMomoModalPrompt(false);

    if (result.success) {
      onOrderCompleted();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('cartEmpty')}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{t('cartEmptySub')}</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          {t('startShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>{t('shoppingCart')}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </h2>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:underline font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Cart Items List */}
      <div className="divide-y divide-slate-800 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {cart.map((item, index) => (
          <div key={`${item.product.id}-${index}`} className="p-3.5 flex gap-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                  {item.selectedSize && item.selectedColor && ' · '}
                  {item.selectedColor && `Color: ${item.selectedColor}`}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                <div className="text-xs font-black text-amber-400">
                  {formatPrice(item.product.price * item.quantity)}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher Code */}
      <form onSubmit={handleApplyVoucher} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={inputCoupon}
            onChange={(e) => setInputCoupon(e.target.value)}
            placeholder={t('couponPlaceholder')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition-colors"
        >
          {t('apply')}
        </button>
      </form>
      {couponCode && (
        <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 px-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Voucher "{couponCode}" applied: -5,000 RWF</span>
        </div>
      )}

      {/* Delivery Zone Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('deliveryZone')}</span>
        </label>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="zone"
                value="rwamagana"
                checked={deliveryZone === 'rwamagana'}
                onChange={() => setDeliveryZone('rwamagana')}
                className="accent-amber-500"
              />
              <span>{t('rwamaganaTown')}</span>
            </div>
            <span className="font-bold text-amber-400">
              {subtotal >= settings.freeDeliveryThreshold ? 'FREE' : formatPrice(settings.deliveryFees.rwamagana)}
            </span>
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="zone"
                value="kigali"
                checked={deliveryZone === 'kigali'}
                onChange={() => setDeliveryZone('kigali')}
                className="accent-amber-500"
              />
              <span>{t('kigaliExpress')}</span>
            </div>
            <span className="font-bold text-amber-400">
              {subtotal >= settings.freeDeliveryThreshold ? 'FREE' : formatPrice(settings.deliveryFees.kigali)}
            </span>
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="zone"
                value="easternProvince"
                checked={deliveryZone === 'easternProvince'}
                onChange={() => setDeliveryZone('easternProvince')}
                className="accent-amber-500"
              />
              <span>{t('easternProvince')}</span>
            </div>
            <span className="font-bold text-amber-400">
              {subtotal >= settings.freeDeliveryThreshold ? 'FREE' : formatPrice(settings.deliveryFees.easternProvince)}
            </span>
          </label>
        </div>

        {/* Address Input */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            {t('deliveryAddress')}
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Specific house, sector or commercial building in Rwamagana"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {t('selectPaymentMethod')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {settings.paymentGateways.mtnMoMo && (
            <button
              type="button"
              onClick={() => setPaymentMethod('momo_mtn')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                paymentMethod === 'momo_mtn'
                  ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <div>MTN MoMo (*182#)</div>
                <div className="text-[10px] text-slate-400 font-normal">Rwanda Instant Push</div>
              </div>
            </button>
          )}

          {settings.paymentGateways.airtelMoney && (
            <button
              type="button"
              onClick={() => setPaymentMethod('airtel_money')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                paymentMethod === 'airtel_money'
                  ? 'border-rose-400 bg-rose-500/15 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div>Airtel Money</div>
                <div className="text-[10px] text-slate-400 font-normal">Rwanda MoMo</div>
              </div>
            </button>
          )}

          {settings.paymentGateways.card && (
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                paymentMethod === 'card'
                  ? 'border-sky-400 bg-sky-500/15 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div>Bank Card</div>
                <div className="text-[10px] text-slate-400 font-normal">Visa / Mastercard</div>
              </div>
            </button>
          )}

          {settings.paymentGateways.cashOnDelivery && (
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                paymentMethod === 'cod'
                  ? 'border-emerald-400 bg-emerald-500/15 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div>Cash on Delivery</div>
                <div className="text-[10px] text-slate-400 font-normal">Pay Rider in Person</div>
              </div>
            </button>
          )}
        </div>

        {/* Mobile Money Phone Number */}
        {(paymentMethod === 'momo_mtn' || paymentMethod === 'airtel_money') && (
          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {paymentMethod === 'momo_mtn' ? t('momoPhonePrompt') : t('airtelPhonePrompt')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder="+250 788 123 456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex justify-between text-slate-400">
          <span>{t('subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {settings.vatEnabled && (
          <div className="flex justify-between text-slate-400">
            <span>{t('vatTax')}</span>
            <span>{formatPrice(tax)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>{t('deliveryFee')}</span>
          <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : ''}>
            {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span>{t('discount')}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
          <span>{t('totalAmount')}</span>
          <span className="text-amber-400">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>{t('orderProcessing')}</span>
        ) : (
          <>
            <span>{t('placeOrder')}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Simulated USSD MoMo Prompt Dialog */}
      {momoModalPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in zoom-in-95 duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-2xl p-5 text-center text-slate-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">
                {paymentMethod === 'momo_mtn' ? 'MTN Mobile Money Rwanda' : 'Airtel Money Rwanda'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                USSD Push prompt sent to <strong>{momoPhone}</strong>.
              </p>
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
                "Pay D&G Rwamagana {formatPrice(total)}? Enter PIN on your phone to authorize."
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMomoModalPrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeOrderPlacement}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
              >
                {isSubmitting ? 'Verifying...' : 'Authorize PIN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Check } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onOpenCart }) => {
  const { t, formatPrice, addToCart, language } = useApp();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Multilingual description & name resolution
  const productName =
    language === 'rw' && product.nameRw
      ? product.nameRw
      : language === 'fr' && product.nameFr
      ? product.nameFr
      : language === 'sw' && product.nameSw
      ? product.nameSw
      : product.name;

  const productDesc =
    language === 'rw' && product.descriptionRw
      ? product.descriptionRw
      : language === 'fr' && product.descriptionFr
      ? product.descriptionFr
      : language === 'sw' && product.descriptionSw
      ? product.descriptionSw
      : product.description;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    onClose();
    if (onOpenCart) onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-950/70 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Main Image */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center">
            <img
              src={activeImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-amber-500/90 text-slate-950 text-xs font-bold rounded-md backdrop-blur-xs">
                {product.stock} {t('itemsLeft')}
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-rose-600/90 text-white text-xs font-bold rounded-md backdrop-blur-xs">
                {t('outOfStock')}
              </span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-amber-400' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Header */}
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-amber-400 mb-1">
              {t(product.category)} · D&G Rwamagana
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
              {productName}
            </h2>

            {/* Price & Rating */}
            <div className="flex items-baseline justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount})</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
            {productDesc}
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t('selectSize')}: <span className="text-amber-400">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedSize === size
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t('selectColor')}: <span className="text-amber-400">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border-t border-slate-800 pt-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {t('specifications')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400">{key}</div>
                    <div className="font-medium text-slate-200 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Guarantee perks */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400 text-center">
            <div className="flex flex-col items-center gap-1 p-2 bg-slate-950/40 rounded-lg">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Fast Rwamagana Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-slate-950/40 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-slate-950/40 rounded-lg">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              <span>Easy Store Return</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 font-bold"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
              className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 font-bold"
            >
              +
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              product.stock === 0
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </>
            )}
          </button>

          {/* Buy Now button */}
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-md ${
              product.stock === 0
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
            }`}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

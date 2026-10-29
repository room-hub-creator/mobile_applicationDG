import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, Product } from '../../types';
import {
  Search,
  SlidersHorizontal,
  Star,
  Plus,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface HomeScreenProps {
  onOpenProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenProduct, onOpenCart }) => {
  const { products, t, formatPrice, addToCart, language, currency } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(60000);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t('allCategories') },
    { key: 'clothes', label: t('clothes') },
    { key: 'shoes', label: t('shoes') },
    { key: 'bags', label: t('bags') },
    { key: 'household', label: t('household') },
    { key: 'jewellery', label: t('jewellery') },
    { key: 'cosmetics', label: t('cosmetics') },
  ];

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (p.price > priceMax) {
        return false;
      }

      // Search filter across multilingual fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          p.name.toLowerCase().includes(q) ||
          (p.nameRw && p.nameRw.toLowerCase().includes(q)) ||
          (p.nameFr && p.nameFr.toLowerCase().includes(q)) ||
          (p.nameSw && p.nameSw.toLowerCase().includes(q));
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchDesc) return false;
      }

      return true;
    });
  }, [products, selectedCategory, priceMax, searchQuery]);

  return (
    <div className="space-y-4 pb-20">
      {/* Search & Filter Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilters || priceMax < 60000
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Price & Search Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{t('priceRange')}</span>
            <span className="text-amber-400 font-bold font-mono">
              Up to {formatPrice(priceMax)}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={65000}
            step={2500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{formatPrice(10000)}</span>
            <span>{formatPrice(35000)}</span>
            <span>{formatPrice(65000)}</span>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setPriceMax(60000);
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              {t('resetFilters')}
            </button>
          </div>
        </div>
      )}

      {/* Hero Promo Banner */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/20 p-4 sm:p-5 shadow-lg">
          <div className="relative z-10 max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Rwamagana Special Offer</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              D&G Rwanda New Season Collection
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Authentic Rwandan Kitenge, handcrafted bags, Ankole horn jewellery & cosmetics.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                Code: RWANDA2026
              </span>
              <span className="text-[10px] text-slate-400">5,000 RWF off</span>
            </div>
          </div>
          <div className="absolute right-2 -bottom-2 w-28 h-28 opacity-60 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80"
              alt="Promo"
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Category Segmented Scrollable Filter */}
      <div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
        <span>
          Showing <strong className="text-white">{filteredProducts.length}</strong> items
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </span>
        <span className="text-amber-400 font-medium">Free delivery over {formatPrice(50000)}</span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">{t('noProductsFound')}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPriceMax(60000);
            }}
            className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const prodName =
              language === 'rw' && product.nameRw
                ? product.nameRw
                : language === 'fr' && product.nameFr
                ? product.nameFr
                : language === 'sw' && product.nameSw
                ? product.nameSw
                : product.name;

            return (
              <div
                key={product.id}
                onClick={() => onOpenProduct(product)}
                className="group relative bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={prodName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNewArrival && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded uppercase">
                      New
                    </span>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold rounded">
                      {product.stock} left
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-rose-900/90 text-white text-[10px] font-bold rounded">
                      Sold out
                    </span>
                  )}

                  {/* Quick Add to Cart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.stock === 0}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 flex items-center justify-center shadow-md transition-all active:scale-95"
                    title={t('addToCart')}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {t(product.category)}
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-amber-400 transition-colors">
                      {prodName}
                    </h3>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-amber-400">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

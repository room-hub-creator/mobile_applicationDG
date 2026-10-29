import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  ExternalLink,
  Bot,
  User,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Product } from '../../types';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiOpen,
    setIsAiOpen,
    aiMessages,
    sendAiMessage,
    isAiLoading,
    formatPrice,
    addToCart,
    setSelectedProduct,
    user,
    activeView,
    language,
  } = useApp();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdminMode = activeView === 'admin' || user?.role === 'admin' || user?.role === 'manager';

  const suggestionChips = isAdminMode
    ? [
        'Analyze low stock and inventory alerts',
        'Summarize gross sales & top category',
        'Draft promo for Rwamagana customers',
        'Check average order value in RWF',
      ]
    : [
        'Recommend traditional wedding Umushanana',
        'How do I pay with MTN MoMo (*182#)?',
        'Show organic Rwandan cosmetics',
        'What are the delivery fees in Rwamagana?',
        'Muraho! Ni ibihe bicuruzwa bihendutse?',
      ];

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    sendAiMessage(msg, isAdminMode ? 'admin' : 'customer');
    setInput('');
  };

  useEffect(() => {
    if (isAiOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiOpen]);

  if (!isAiOpen) {
    return (
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all group"
        title="Open D&G AI Assistant"
      >
        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">
          {isAdminMode ? 'D&G AI Analyst' : 'D&G Shopping AI'}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-md h-[560px] max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm text-white">
                {isAdminMode ? 'D&G Store & Inventory AI' : 'Diane · D&G Shopping AI'}
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAdminMode
                ? 'Operations & Business Analyst'
                : 'Personal Stylist & Rwamagana Guide'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiOpen(false)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 px-1">
              {msg.role === 'user' ? (
                <span>You · {msg.timestamp}</span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  <span>D&G AI · {msg.timestamp}</span>
                </span>
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
              }`}
            >
              {msg.content}
            </div>

            {/* Suggested Products list if provided by AI */}
            {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
              <div className="mt-2 space-y-2 w-full max-w-[90%]">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Recommended Items in Rwamagana:
                </div>
                {msg.suggestedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2.5"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate text-[11px]">{p.name}</div>
                      <div className="text-amber-400 font-bold text-[10px] mt-0.5">
                        {formatPrice(p.price)} · Stock: {p.stock}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black"
                      >
                        +Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-amber-300 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Consulting D&G store inventory in Rwamagana...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex gap-1.5 no-scrollbar">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] whitespace-nowrap transition-colors border border-slate-700/60"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isAdminMode
              ? 'Ask AI about inventory, sales, pricing...'
              : 'Ask Diane about outfits, sizes, MoMo payment...'
          }
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isAiLoading}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

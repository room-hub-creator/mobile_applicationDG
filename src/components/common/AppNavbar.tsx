import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  LayoutDashboard,
  FlaskConical,
  Globe,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  UserX,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { Language, Currency } from '../../types';

export const AppNavbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    mobileDevice,
    setMobileDevice,
    language,
    setLanguage,
    t,
    currency,
    setCurrency,
    networkStatus,
    setNetworkStatus,
    user,
    logout,
    openAuthModal,
    cartCount,
    isAiOpen,
    setIsAiOpen,
    impersonatedUser,
    originalAdminUser,
    stopImpersonation,
  } = useApp();

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Ikinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  ];

  return (
    <>
      {/* Impersonation Banner when Admin is working as customer */}
      {impersonatedUser && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              <strong>ADMIN IMPERSONATION:</strong> You are currently operating as{' '}
              <strong>{impersonatedUser.name}</strong> ({impersonatedUser.email}).
            </span>
          </div>

          <button
            onClick={stopImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-black shadow transition-colors"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Exit & Return to Admin</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-xl tracking-tight shadow-md">
              D&G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">D&G E-Commerce</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Rwamagana, Rwanda
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('brandTagline')}
              </p>
            </div>
          </div>

          {/* View Switcher (Customer Mobile / Admin / Testing) */}
          <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeView === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Mobile App</span>
              {cartCount > 0 && activeView !== 'customer' && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeView === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Admin Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('testing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeView === 'testing'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span className="hidden md:inline">API & Tests</span>
            </button>
          </div>

          {/* Right Tools: AI, Device, Currency, Language, User */}
          <div className="flex items-center gap-2">
            {/* AI Assistant Quick Toggle */}
            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
              title="Open Gemini AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Device Chassis toggle when in Mobile view */}
            {activeView === 'customer' && (
              <div className="hidden lg:flex items-center p-0.5 bg-slate-800/80 rounded-md border border-slate-700/60 text-xs">
                <button
                  onClick={() => setMobileDevice('iphone')}
                  title="iPhone 16 Pro simulator"
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    mobileDevice === 'iphone' ? 'bg-slate-700 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  iOS
                </button>
                <button
                  onClick={() => setMobileDevice('pixel')}
                  title="Google Pixel 9 simulator"
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    mobileDevice === 'pixel' ? 'bg-slate-700 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setMobileDevice('responsive')}
                  title="Full Responsive Web Mode"
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    mobileDevice === 'responsive' ? 'bg-slate-700 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Full
                </button>
              </div>
            )}

            {/* Currency Toggle */}
            <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700/60 p-0.5 text-xs">
              <button
                onClick={() => setCurrency('RWF')}
                className={`px-2 py-1 rounded font-semibold text-[11px] ${
                  currency === 'RWF' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RWF
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded font-semibold text-[11px] ${
                  currency === 'USD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD
              </button>
            </div>

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 text-xs text-slate-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-44 rounded-lg bg-slate-900 border border-slate-750 shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setLangOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                        language === l.code ? 'text-amber-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Network Simulator Toggle */}
            <div className="relative hidden sm:block">
              <select
                value={networkStatus}
                onChange={(e) => setNetworkStatus(e.target.value as any)}
                className={`text-[11px] font-medium py-1.5 px-2 rounded-md border transition-colors cursor-pointer appearance-none bg-slate-800/80 ${
                  networkStatus === 'online'
                    ? 'border-emerald-600/50 text-emerald-300'
                    : networkStatus === 'slow3g'
                    ? 'border-amber-600/50 text-amber-300'
                    : 'border-rose-600/50 text-rose-300'
                }`}
                title="Simulate network connectivity condition"
              >
                <option value="online">● Online (Fiber)</option>
                <option value="slow3g">▲ Slow 3G / Cellular</option>
                <option value="offline">✕ Offline Mode</option>
              </select>
            </div>

            {/* User Account / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-xs transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-amber-400/40" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <div className="font-semibold text-xs leading-none text-white max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-amber-400 leading-none capitalize mt-0.5">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-750 shadow-2xl p-2.5 z-50 text-xs space-y-2"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                      <div className="font-bold text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-amber-300 font-mono truncate">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          {user.role}
                        </span>
                        {user.district && (
                          <span className="text-[10px] text-slate-400">
                            {user.district}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveView('customer');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-left transition-colors"
                      >
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>Mobile Store View</span>
                      </button>

                      {(user.role === 'admin' || user.role === 'manager') && (
                        <button
                          onClick={() => {
                            setActiveView('admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-left transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-400" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 text-left transition-colors border-t border-slate-800/80 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

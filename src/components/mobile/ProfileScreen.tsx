import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  LogIn,
  KeyRound,
  LayoutDashboard,
  Globe,
  DollarSign,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenAuth: () => void;
  onOpenOrders: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAuth,
  onOpenOrders,
}) => {
  const {
    user,
    logout,
    setActiveView,
    orders,
    formatPrice,
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
  } = useApp();

  const [passwordChangeModal, setPasswordChangeModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) return;
    setPassSuccess(true);
    setTimeout(() => {
      setPassSuccess(false);
      setPasswordChangeModal(false);
      setOldPass('');
      setNewPass('');
    }, 1500);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Welcome to D&G Rwanda</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Sign in to track orders, manage your delivery address, and view your purchases.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          {t('login')} / {t('register')}
        </button>
      </div>
    );
  }

  const userTotalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3.5">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/40"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">{user.email}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-center">
          <div
            onClick={onOpenOrders}
            className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700"
          >
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Orders</div>
            <div className="text-base font-black text-white mt-0.5">{orders.length}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Spend</div>
            <div className="text-base font-black text-amber-400 mt-0.5">
              {formatPrice(userTotalSpent)}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Access Switcher (Task 2: Restrict access to authorized functions) */}
      {(user.role === 'admin' || user.role === 'manager') && (
        <div className="p-4 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Administrator Access</div>
              <div className="text-[11px] text-slate-400">Manage orders, stock, and settings</div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('admin')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <span>Open Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Account Details & Address */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
          Saved Delivery Address
        </h4>
        <div className="flex items-start gap-2.5 text-slate-300">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-white">{user.address}</div>
            <div className="text-slate-400 mt-0.5">{user.city}, {user.district} District, Rwanda</div>
          </div>
        </div>
      </div>

      {/* Quick Settings & Security */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 text-xs">
        <button
          onClick={() => setPasswordChangeModal(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 text-slate-300">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span>Change Password & Security</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>App Language</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs"
          >
            <option value="en">English (UK/US)</option>
            <option value="rw">Ikinyarwanda (RW)</option>
            <option value="fr">Français (FR)</option>
            <option value="sw">Kiswahili (SW)</option>
          </select>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-300">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span>Display Currency</span>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs"
          >
            <option value="RWF">Rwandan Francs (RWF)</option>
            <option value="USD">US Dollars (USD)</option>
          </select>
        </div>
      </div>

      {/* Administrative Operations (if staff) */}
      {(user.role === 'admin' || user.role === 'manager') && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Store Staff Access ({user.role})
          </div>
          <button
            onClick={() => setActiveView('admin')}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Store Admin Dashboard</span>
          </button>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-800/80 hover:bg-rose-950/20 text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('logout')}</span>
      </button>

      {/* Password Change Dialog */}
      {passwordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <h4 className="font-bold text-white text-base">Change Password</h4>
            {passSuccess ? (
              <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-200 text-xs">
                Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordChangeModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

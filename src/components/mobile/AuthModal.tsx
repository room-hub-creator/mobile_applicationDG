import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MailCheck,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'recovery';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { t, login, register, recoverPassword, resetPassword } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'enter_code'>(defaultMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, defaultMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dispatched Email Preview modal state
  const [dispatchedEmail, setDispatchedEmail] = useState<any>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.message || 'Invalid credentials');
        }
      } else if (mode === 'register') {
        const result = await register({
          name,
          email,
          phone,
          password,
          address: address || 'Rwamagana Town',
        });
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.message || 'Registration failed');
        }
      } else if (mode === 'recovery') {
        // Request reset email
        const result = await recoverPassword(email);
        if (result.success) {
          setDispatchedEmail(result.dispatchedEmail);
          setResetCode(result.code || '');
          setSuccessMessage(result.message);
          setMode('enter_code');
        } else {
          setErrorMessage(result.message);
        }
      } else if (mode === 'enter_code') {
        // Verify code & reset password
        if (password !== confirmPassword) {
          setErrorMessage('New passwords do not match.');
          setLoading(false);
          return;
        }

        const result = await resetPassword(email, resetCode, password);
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Kicker */}
        <div className="text-center mb-5">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 items-center justify-center font-black text-slate-950 text-xl shadow-lg mb-2">
            D&G
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {mode === 'login'
              ? t('login')
              : mode === 'register'
              ? t('register')
              : mode === 'recovery'
              ? 'Password Recovery by Email'
              : 'Enter Reset Code'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your orders and fast checkout'
              : mode === 'register'
              ? 'Join D&G Rwamagana for exclusive Rwandan fashion and deals'
              : mode === 'recovery'
              ? 'Enter your registered email to receive an official password reset link and 6-digit verification code.'
              : `We dispatched an official reset email to ${email}`}
          </p>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Interactive "View Dispatched Email Preview" Button when in enter_code mode */}
        {mode === 'enter_code' && dispatchedEmail && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <MailCheck className="w-4 h-4 text-amber-400" />
                <span>Email Dispatched to {dispatchedEmail.to}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreview(true)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>View Email</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>Code: <strong className="font-mono text-amber-400">{dispatchedEmail.code}</strong></span>
              <button
                type="button"
                onClick={() => setResetCode(dispatchedEmail.code)}
                className="text-[11px] text-amber-400 underline font-semibold"
              >
                Auto-fill Code
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Innocent Ishimwe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('phoneNumber')} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('deliveryAddress')}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Rwamagana Commercial Street"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field (for login, register, and recovery) */}
          {mode !== 'enter_code' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('email')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Reset Code Input (when in enter_code mode) */}
          {mode === 'enter_code' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                6-Digit Verification Code (from Email) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. DG-842910"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Password fields */}
          {(mode === 'login' || mode === 'register' || mode === 'enter_code') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  {mode === 'enter_code' ? 'New Password *' : `${t('password')} *`}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Confirm Password field in enter_code mode */}
          {mode === 'enter_code' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === 'login' ? (
              <>
                <span>{t('login')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'register' ? (
              <>
                <span>{t('register')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'recovery' ? (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Password Reset Email</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Update Password</span>
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <>
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                {t('register')}
              </button>
            </>
          ) : mode === 'register' ? (
            <>
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                {t('login')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className="text-amber-400 font-semibold hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>

      {/* Dispatched Email Preview Modal */}
      {showEmailPreview && dispatchedEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Simulated Email Client: {dispatchedEmail.to}</span>
              </div>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div><strong>From:</strong> D&G Rwanda Security &lt;security@dg-rwanda.rw&gt;</div>
              <div><strong>To:</strong> {dispatchedEmail.to}</div>
              <div><strong>Subject:</strong> {dispatchedEmail.subject}</div>
              <div><strong>Dispatched:</strong> {new Date(dispatchedEmail.sentAt).toLocaleString()}</div>
            </div>

            <div
              className="p-4 overflow-y-auto flex-1 bg-slate-950"
              dangerouslySetInnerHTML={{ __html: dispatchedEmail.html }}
            />

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">Code: <strong className="font-mono text-amber-400">{dispatchedEmail.code}</strong></span>
              <button
                onClick={() => {
                  setResetCode(dispatchedEmail.code);
                  setShowEmailPreview(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Use Code & Return to Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Product,
  Order,
  CartItem,
  Language,
  Currency,
  SystemSettings,
  AiChatMessage,
} from '../types';
import { translations } from '../i18n/translations';
import { initialSettings } from '../server/mockData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Multilingual & Currency
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatPrice: (rwfAmount: number) => string;

  // View state & Device emulator
  activeView: 'customer' | 'admin' | 'testing';
  setActiveView: (view: 'customer' | 'admin' | 'testing') => void;
  mobileDevice: 'iphone' | 'pixel' | 'responsive';
  setMobileDevice: (device: 'iphone' | 'pixel' | 'responsive') => void;
  networkStatus: 'online' | 'slow3g' | 'offline';
  setNetworkStatus: (status: 'online' | 'slow3g' | 'offline') => void;

  // Auth & Authorization
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string; dispatchedEmail?: any; code?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; message: string; user?: User }>;

  // Auth Modal Controls
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'recovery';
  openAuthModal: (mode?: 'login' | 'register' | 'recovery') => void;
  closeAuthModal: () => void;

  // Admin Impersonation ("Allow admin to work as him")
  impersonatedUser: User | null;
  originalAdminUser: User | null;
  impersonateCustomer: (targetUser: User) => void;
  stopImpersonation: () => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  couponCode: string;
  discount: number;
  applyCoupon: (code: string) => boolean;
  deliveryZone: string;
  setDeliveryZone: (zone: string) => void;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;

  // Orders & Tracking
  orders: Order[];
  refreshOrders: () => Promise<void>;
  placeOrder: (orderPayload: Partial<Order>) => Promise<{ success: boolean; order?: Order; error?: string }>;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Products & Modals
  products: Product[];
  refreshProducts: () => Promise<void>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // System Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;

  // AI Assistant
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  aiMessages: AiChatMessage[];
  sendAiMessage: (message: string, mode?: 'customer' | 'admin') => Promise<void>;
  isAiLoading: boolean;

  // Toast feedback
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('RWF');
  const [activeView, setActiveView] = useState<'customer' | 'admin' | 'testing'>('customer');
  const [mobileDevice, setMobileDevice] = useState<'iphone' | 'pixel' | 'responsive'>('iphone');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'slow3g' | 'offline'>('online');

  // Real user authentication state (persisted to localStorage)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('dg_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('dg_token') || null;
    } catch {
      return null;
    }
  });

  // Auth modal global controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'recovery'>('login');

  const openAuthModal = (mode: 'login' | 'register' | 'recovery' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Impersonation state
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryZone, setDeliveryZone] = useState<string>('rwamagana');

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    {
      id: 'ai-init-1',
      role: 'assistant',
      content:
        'Muraho! I am Diane, your D&G Rwamagana AI Assistant. Need advice on traditional Rwandan wedding wear, handcrafted shoes, cosmetics, or fast MoMo delivery?',
      timestamp: 'Just now',
    },
  ]);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper translation
  const t = (key: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return key;
  };

  // Price formatting
  const formatPrice = (rwfAmount: number): string => {
    if (currency === 'USD') {
      const usd = rwfAmount / (settings.rwfToUsdRate || 1420);
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(rwfAmount).toLocaleString('en-US')} RWF`;
  };

  // Fetch initial products
  const refreshProducts = async () => {
    if (networkStatus === 'offline') {
      showToast('Network error: Device is currently simulated offline.', 'error');
      return;
    }
    try {
      if (networkStatus === 'slow3g') {
        await new Promise((r) => setTimeout(r, 1200));
      }
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      console.warn('API fetch products error:', err);
    }
  };

  // Fetch orders with role authorization headers
  const refreshOrders = async () => {
    if (networkStatus === 'offline') return;
    try {
      const headers: Record<string, string> = {
        'x-user-role': user?.role || 'guest',
        'x-user-id': user?.id || '',
      };
      const url =
        user?.role === 'admin' || user?.role === 'manager'
          ? '/api/orders'
          : user
          ? `/api/orders?userId=${user.id}`
          : '/api/orders';
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      console.warn('API fetch orders error:', err);
    }
  };

  // Fetch system settings
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err: any) {
      console.warn('API fetch settings error:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshOrders();
    refreshSettings();
  }, [networkStatus, user?.id, user?.role]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedSize: size || product.sizes?.[0],
            selectedColor: color || product.colors?.[0],
          },
        ];
      }
    });

    showToast(`${product.name} added to cart`, 'success');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'RWANDA2026' || clean === 'DGSTART' || clean === 'RWAMAGANA') {
      const discountVal = 5000;
      setCouponCode(clean);
      setDiscount(discountVal);
      showToast(`Voucher ${clean} applied! 5,000 RWF off`, 'success');
      return true;
    } else {
      showToast('Invalid coupon code. Try RWANDA2026 or DGSTART', 'error');
      return false;
    }
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = settings.vatEnabled ? Math.round(subtotal * (settings.vatRatePercent / 100)) : 0;

  let deliveryFee = 0;
  if (subtotal > 0) {
    if (subtotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      if (deliveryZone === 'rwamagana') deliveryFee = settings.deliveryFees.rwamagana;
      else if (deliveryZone === 'kigali') deliveryFee = settings.deliveryFees.kigali;
      else if (deliveryZone === 'easternProvince') deliveryFee = settings.deliveryFees.easternProvince;
      else deliveryFee = settings.deliveryFees.otherProvinces;
    }
  }

  const total = Math.max(0, subtotal + tax + deliveryFee - discount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Authentication
  const login = async (email: string, pass: string) => {
    if (networkStatus === 'offline') {
      return { success: false, message: 'Network offline. Check your connection.' };
    }
    try {
      if (networkStatus === 'slow3g') await new Promise((r) => setTimeout(r, 1200));

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      localStorage.setItem('dg_user', JSON.stringify(data.user));
      localStorage.setItem('dg_token', data.token);
      setUser(data.user);
      setToken(data.token);
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const register = async (userData: any) => {
    if (networkStatus === 'offline') {
      return { success: false, message: 'Network offline.' };
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed' };
      }

      localStorage.setItem('dg_user', JSON.stringify(data.user));
      localStorage.setItem('dg_token', data.token);
      setUser(data.user);
      setToken(data.token);
      closeAuthModal();
      showToast('Registration successful! Welcome to D&G Rwanda.', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('dg_user');
    localStorage.removeItem('dg_token');
    setUser(null);
    setToken(null);
    setImpersonatedUser(null);
    setOriginalAdminUser(null);
    showToast('You have been logged out.', 'info');
  };

  const recoverPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || data.message || 'Email was not found in D&G database.',
        };
      }
      return {
        success: true,
        message: data.message,
        dispatchedEmail: data.dispatchedEmail,
        code: data.code,
      };
    } catch (err: any) {
      return { success: false, message: 'Failed to request password recovery email.' };
    }
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to reset password.' };
      }

      if (data.user && data.token) {
        localStorage.setItem('dg_user', JSON.stringify(data.user));
        localStorage.setItem('dg_token', data.token);
        setUser(data.user);
        setToken(data.token);
      }
      showToast('Password reset successful! You are now logged in.', 'success');
      return { success: true, message: data.message, user: data.user };
    } catch (err: any) {
      return { success: false, message: 'Network error during password reset.' };
    }
  };

  // Admin Impersonation: "Allow admin to works as him"
  const impersonateCustomer = (targetUser: User) => {
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      showToast('Only Store Administrators can impersonate customers.', 'error');
      return;
    }
    setOriginalAdminUser(user);
    setImpersonatedUser(targetUser);
    setUser(targetUser);
    setActiveView('customer');
    showToast(`Admin Impersonation: Now working as ${targetUser.name}`, 'info');
  };

  const stopImpersonation = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setImpersonatedUser(null);
      setOriginalAdminUser(null);
      setActiveView('admin');
      showToast('Exited impersonation mode. Returned to Administrator account.', 'success');
    }
  };

  // AI Assistant Chat Caller
  const sendAiMessage = async (content: string, mode: 'customer' | 'admin' = 'customer') => {
    if (!content.trim()) return;

    const userMsg: AiChatMessage = {
      id: `usr-msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          mode,
          language,
          userRole: user?.role || 'customer',
        }),
      });

      const data = await res.json();
      const assistantMsg: AiChatMessage = {
        id: `ai-msg-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Muraho! I'm here to assist your shopping in Rwamagana.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProducts || [],
      };

      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Muraho! I am currently operating offline. You can browse our collection or ask about payment and shipping in Rwamagana.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Place Order
  const placeOrder = async (orderPayload: Partial<Order>) => {
    if (networkStatus === 'offline') {
      return { success: false, error: 'Cannot complete purchase: Device is offline.' };
    }
    try {
      if (networkStatus === 'slow3g') await new Promise((r) => setTimeout(r, 1400));

      const payload = {
        userId: user?.id || 'guest-1',
        userName: user?.name || 'Walk-in Customer',
        userEmail: user?.email || 'customer@dg-rwanda.rw',
        userPhone: orderPayload.paymentPhone || user?.phone || '+250 788 123 456',
        items: cart,
        subtotal,
        tax,
        deliveryFee,
        discount,
        total,
        currency,
        deliveryZone:
          deliveryZone === 'rwamagana'
            ? 'Rwamagana Town'
            : deliveryZone === 'kigali'
            ? 'Kigali City'
            : 'Eastern Province',
        ...orderPayload,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || 'customer',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to place order' };
      }

      clearCart();
      await refreshOrders();
      await refreshProducts();
      setActiveTrackingOrder(data.order);
      showToast(`Order ${data.order.orderNumber} placed successfully!`, 'success');
      return { success: true, order: data.order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while placing order' };
    }
  };

  // Settings update
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.role || 'guest',
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        showToast('System settings saved successfully!', 'success');
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || 'Authorization failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        formatPrice,
        activeView,
        setActiveView,
        mobileDevice,
        setMobileDevice,
        networkStatus,
        setNetworkStatus,
        user,
        token,
        login,
        register,
        logout,
        recoverPassword,
        resetPassword,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        impersonatedUser,
        originalAdminUser,
        impersonateCustomer,
        stopImpersonation,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        couponCode,
        discount,
        applyCoupon,
        deliveryZone,
        setDeliveryZone,
        subtotal,
        tax,
        deliveryFee,
        total,
        orders,
        refreshOrders,
        placeOrder,
        activeTrackingOrder,
        setActiveTrackingOrder,
        products,
        refreshProducts,
        selectedProduct,
        setSelectedProduct,
        settings,
        updateSettings,
        isAiOpen,
        setIsAiOpen,
        aiMessages,
        sendAiMessage,
        isAiLoading,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

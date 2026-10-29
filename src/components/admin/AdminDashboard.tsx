import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Product,
  User,
  Order,
  OrderStatus,
  ProductCategory,
  SystemSettings,
} from '../../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Shield,
  Download,
  RefreshCw,
  Phone,
  MapPin,
  Save,
  Check,
  Eye,
  Sliders,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Database,
  Upload,
  HardDrive,
  Server,
  FileCode,
  Mail,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    t,
    formatPrice,
    currency,
    settings,
    updateSettings,
    products,
    refreshProducts,
    orders,
    refreshOrders,
    showToast,
    user: currentUser,
    openAuthModal,
    setActiveView,
    impersonateCustomer,
    setIsAiOpen,
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'database' | 'settings' | 'reports'>('overview');

  // Dashboard metrics from API
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Database Management state
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [dbTables, setDbTables] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [activeCollection, setActiveCollection] = useState<'users' | 'products' | 'orders' | 'passwordResets'>('users');
  const [dbSearch, setDbSearch] = useState('');
  const [isCreateDbModal, setIsCreateDbModal] = useState(false);
  const [isRestoreModal, setIsRestoreModal] = useState(false);
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [selectedResetEmailPreview, setSelectedResetEmailPreview] = useState<any>(null);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'manager' | 'admin'>('customer');

  // Users management state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Products management state
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductModal, setIsAddProductModal] = useState(false);

  // Order status update modal
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [trackingNote, setTrackingNote] = useState('');
  const [riderName, setRiderName] = useState('Emmanuel Nshimiyimana');
  const [riderPhone, setRiderPhone] = useState('+250 788 777 999');

  // Settings form state
  const [formSettings, setFormSettings] = useState<SystemSettings>({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);

  // Reports state
  const [reportType, setReportType] = useState<'products' | 'sales' | 'customers' | 'performance'>('products');
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Authorization Check: Customer role cannot view Admin Dashboard
  const isAuthorizedAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Fetch metrics & users
  const fetchMetrics = async () => {
    if (!isAuthorizedAdminOrManager) return;
    setLoadingMetrics(true);
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'x-user-role': currentUser?.role || 'guest' },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn('Metrics fetch error:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAuthorizedAdminOrManager) return;
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'x-user-role': currentUser?.role || 'guest' },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.warn('Users fetch error:', err);
    }
  };

  const fetchReport = async (type: string) => {
    if (!isAuthorizedAdminOrManager) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/admin/reports?type=${type}`, {
        headers: { 'x-user-role': currentUser?.role || 'guest' },
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.warn('Report fetch error:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Database Management Handlers
  const fetchDatabaseInfo = async () => {
    if (!isAuthorizedAdminOrManager) return;
    setLoadingDb(true);
    try {
      const res = await fetch('/api/admin/database', {
        headers: { 'x-user-role': currentUser?.role || 'guest' },
      });
      if (res.ok) {
        const data = await res.json();
        setDbInfo(data.info);
        setDbTables(data.tables);
      }
    } catch (err) {
      console.warn('Failed to fetch DB info:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleCreateDatabase = async (seedDefaults: boolean) => {
    try {
      const res = await fetch('/api/admin/database/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({ seedDefaults }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setIsCreateDbModal(false);
        await fetchDatabaseInfo();
        await refreshProducts();
        await refreshOrders();
        await fetchMetrics();
        await fetchUsers();
      } else {
        showToast(data.error || 'Failed to create database', 'error');
      }
    } catch (err) {
      showToast('Network error creating database', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset D&G Rwanda database to factory catalog and user accounts?')) return;
    try {
      const res = await fetch('/api/admin/database/reset', {
        method: 'POST',
        headers: { 'x-user-role': currentUser?.role || 'admin' },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        await fetchDatabaseInfo();
        await refreshProducts();
        await refreshOrders();
        await fetchMetrics();
        await fetchUsers();
      } else {
        showToast(data.error || 'Failed to reset database', 'error');
      }
    } catch (err) {
      showToast('Network error resetting database', 'error');
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbTables || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dg_rwanda_database_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Database backup JSON exported successfully', 'success');
  };

  const handleRestoreDatabase = async () => {
    if (!restoreJsonText.trim()) {
      showToast('Please paste a valid JSON database schema.', 'error');
      return;
    }
    try {
      const parsed = JSON.parse(restoreJsonText);
      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setIsRestoreModal(false);
        setRestoreJsonText('');
        await fetchDatabaseInfo();
        await refreshProducts();
        await refreshOrders();
        await fetchMetrics();
        await fetchUsers();
      } else {
        showToast(data.error || 'Restore failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid JSON syntax in backup file', 'error');
    }
  };

  const handleCreateUserInDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone || '+250 788 123 456',
          role: newUserRole,
          address: 'Rwamagana District',
          city: 'Rwamagana',
          district: 'Rwamagana',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`User ${newUserName} created in database!`, 'success');
        setIsAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        await fetchDatabaseInfo();
        await fetchUsers();
      } else {
        showToast(data.error || 'Failed to create user', 'error');
      }
    } catch (err) {
      showToast('Error creating user in database', 'error');
    }
  };

  useEffect(() => {
    if (isAuthorizedAdminOrManager) {
      fetchMetrics();
      fetchUsers();
      fetchDatabaseInfo();
    }
    setFormSettings({ ...settings });
  }, [settings, currentUser?.role]);

  useEffect(() => {
    if (activeTab === 'reports' && isAuthorizedAdminOrManager) {
      fetchReport(reportType);
    }
    if (activeTab === 'database' && isAuthorizedAdminOrManager) {
      fetchDatabaseInfo();
    }
  }, [activeTab, reportType, isAuthorizedAdminOrManager]);

  // Authorization Guard: Screen rendered when user has Customer role
  if (!isAuthorizedAdminOrManager) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-rose-800/60 rounded-3xl text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Authorization Restricted
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Administrator Privileges Required
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
            You are currently signed in as <strong>{currentUser?.name || 'Customer'}</strong> ({currentUser?.email}).
            Store administration, inventory controls, customer database, and system settings are restricted to authorized store staff.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveView('customer')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Return to Customer Store
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In with Store Admin Account</span>
          </button>
        </div>
      </div>
    );
  }

  // Order status submit
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    try {
      const res = await fetch(`/api/orders/${updatingOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNote,
          riderName,
          riderPhone,
        }),
      });

      if (res.ok) {
        showToast(`Order ${updatingOrder.orderNumber} updated to ${newStatus}`, 'success');
        setUpdatingOrder(null);
        await refreshOrders();
        await fetchMetrics();
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Product Save/Update
  const handleSaveProduct = async (prodData: Partial<Product>) => {
    try {
      const isEdit = !!prodData.id;
      const url = isEdit ? `/api/products/${prodData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify(prodData),
      });

      if (res.ok) {
        showToast(`Product ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        setEditingProduct(null);
        setIsAddProductModal(false);
        await refreshProducts();
        await fetchMetrics();
      }
    } catch (err) {
      showToast('Failed to save product', 'error');
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from store inventory?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || 'admin' },
      });
      if (res.ok) {
        showToast('Product removed from catalog', 'info');
        await refreshProducts();
        await fetchMetrics();
      }
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  // Quick Restock
  const handleQuickRestock = async (product: Product, amount: number) => {
    try {
      const newStock = product.stock + amount;
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({ stock: newStock }),
      });
      showToast(`Restocked ${product.name} (+${amount})`, 'success');
      await refreshProducts();
    } catch (err) {
      showToast('Failed to restock product', 'error');
    }
  };

  // User role toggle
  const handleToggleUserRole = async (u: User) => {
    const nextRole = u.role === 'customer' ? 'manager' : u.role === 'manager' ? 'admin' : 'customer';
    try {
      const res = await fetch(`/api/auth/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        showToast(`Updated ${u.name}'s role to ${nextRole}`, 'success');
        await fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  // User status toggle
  const handleToggleUserStatus = async (u: User) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/auth/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Account ${nextStatus}: ${u.name}`, 'info');
        await fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // User Deletion (Admin privilege)
  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUser?.id) {
      showToast('You cannot delete your own currently signed-in account', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email}) from database?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${u.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || 'admin' },
      });
      if (res.ok) {
        showToast(`User ${u.name} removed from database`, 'info');
        await fetchUsers();
        await fetchMetrics();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Network error deleting user', 'error');
    }
  };

  // User Edit Save (Admin privilege)
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
        },
        body: JSON.stringify(editingUser),
      });
      if (res.ok) {
        showToast(`User ${editingUser.name} updated successfully!`, 'success');
        setEditingUser(null);
        await fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch (err) {
      showToast('Network error updating user', 'error');
    }
  };

  // Order Deletion (Admin privilege)
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderNumber} from database?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || 'admin' },
      });
      if (res.ok) {
        showToast(`Order #${orderNumber} deleted`, 'info');
        await refreshOrders();
        await fetchMetrics();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete order', 'error');
      }
    } catch (err) {
      showToast('Network error deleting order', 'error');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const ok = await updateSettings(formSettings);
    setSavingSettings(false);
  };

  // Export CSV
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              D&G Rwamagana Retail Management System
            </span>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold">
              Role: {currentUser?.role?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Store Administration & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product inventory, customer accounts, live order tracking, and system configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Store Analyst</span>
          </button>

          <button
            onClick={() => {
              fetchMetrics();
              refreshOrders();
              refreshProducts();
              showToast('Admin data refreshed', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddProductModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Delivery ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Accounts & Impersonation ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Studio & Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & Export (Task 7)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {formatPrice(metrics?.totalRevenue || 142920)}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+14.8% vs last week</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {metrics?.totalOrders || orders.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {orders.filter((o) => o.status === 'in_transit').length} out for delivery right now
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Registered Customers</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {usersList.length || 5}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Rwamagana, Kigali & Eastern Province
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Inventory Health</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {products.length} Products
              </div>
              <div className="text-[11px] text-amber-400 font-semibold mt-1">
                {products.filter((p) => p.stock <= 5).length} items need restock
              </div>
            </div>
          </div>

          {/* Low Stock Alerts & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Catalog Distribution by Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { cat: 'clothes', label: 'Clothes', count: products.filter((p) => p.category === 'clothes').length },
                  { cat: 'shoes', label: 'Shoes', count: products.filter((p) => p.category === 'shoes').length },
                  { cat: 'bags', label: 'Bags', count: products.filter((p) => p.category === 'bags').length },
                  { cat: 'household', label: 'Household', count: products.filter((p) => p.category === 'household').length },
                  { cat: 'jewellery', label: 'Jewellery', count: products.filter((p) => p.category === 'jewellery').length },
                  { cat: 'cosmetics', label: 'Cosmetics', count: products.filter((p) => p.category === 'cosmetics').length },
                ].map((item) => (
                  <div key={item.cat} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400 font-semibold">{item.label}</div>
                    <div className="text-lg font-black text-white mt-1">{item.count} items</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Low Stock Alert</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Threshold: ≤ 5</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {products
                  .filter((p) => p.stock <= 5)
                  .map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{p.name}</div>
                        <div className="text-amber-400 font-bold mt-0.5">
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} units remaining`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickRestock(p, 10)}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-bold text-[11px] shrink-0 border border-amber-500/30"
                      >
                        +10 Restock
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="py-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Categories</option>
                <option value="clothes">Clothes</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
                <option value="household">Household Equipment</option>
                <option value="jewellery">Jewellery</option>
                <option value="cosmetics">Cosmetics</option>
              </select>

              <button
                onClick={() => setIsAddProductModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3 font-bold">Product</th>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Price (RWF / USD)</th>
                    <th className="p-3 font-bold text-center">Stock</th>
                    <th className="p-3 font-bold text-center">Rating</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {products
                    .filter((p) => {
                      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
                      if (productSearch.trim()) {
                        const q = productSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate max-w-xs">{prod.name}</div>
                              {prod.nameRw && (
                                <div className="text-[10px] text-amber-400/90 truncate">{prod.nameRw}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 uppercase text-[11px] text-slate-400 font-semibold">
                          {prod.category}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-amber-400">{formatPrice(prod.price)}</div>
                          <div className="text-[10px] text-slate-400">
                            ${(prod.price / settings.rwfToUsdRate).toFixed(2)} USD
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              prod.stock === 0
                                ? 'bg-rose-500/20 text-rose-300'
                                : prod.stock <= 5
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-400">
                          ★ {prod.rating} ({prod.reviewsCount})
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              title="Edit product"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {currentUser?.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                title="Delete product"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Customer Orders Across Rwanda
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total orders recorded: {orders.length}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3 font-bold">Order Ref</th>
                    <th className="p-3 font-bold">Customer & Contact</th>
                    <th className="p-3 font-bold">Destination</th>
                    <th className="p-3 font-bold">Payment Method</th>
                    <th className="p-3 font-bold">Total Amount</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-right">Courier & Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {o.orderNumber}
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-bold">{o.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.userPhone}</div>
                        <div className="text-[10px] text-slate-400">{o.userEmail}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        <div className="font-medium text-white">{o.deliveryZone}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{o.deliveryAddress}</div>
                      </td>
                      <td className="p-3">
                        <span className="capitalize">{o.paymentMethod.replace('_', ' ')}</span>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase">{o.paymentStatus}</div>
                      </td>
                      <td className="p-3 font-black text-amber-400">
                        {formatPrice(o.total)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                            o.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : o.status === 'in_transit'
                              ? 'bg-amber-500/20 text-amber-300'
                              : o.status === 'processing'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setUpdatingOrder(o);
                              setNewStatus(o.status);
                              setRiderName(o.assignedRider?.name || 'Emmanuel Nshimiyimana');
                              setRiderPhone(o.assignedRider?.phone || '+250 788 777 999');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm"
                          >
                            Update Status
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                              title="Delete Order"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT & IMPERSONATION */}
      {activeTab === 'users' && (
        <div className="py-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, phone, email, district..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddUserModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => handleExportCSV(usersList, 'DG_Rwanda_Users_Export')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Users to CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3 font-bold">Customer</th>
                    <th className="p-3 font-bold">Contact Phone & Location</th>
                    <th className="p-3 font-bold">Role</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-center">Lifetime Orders</th>
                    <th className="p-3 font-bold text-right">Lifetime Spend</th>
                    <th className="p-3 font-bold text-right">Admin Actions & "Work As Him"</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {usersList
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.phone.includes(q) ||
                        u.district.toLowerCase().includes(q)
                      );
                    })
                    .map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white">{usr.name}</div>
                              <div className="text-[10px] text-slate-400">{usr.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-slate-200">{usr.phone}</div>
                          <div className="text-[10px] text-slate-400">{usr.district}, Rwanda</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              usr.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : usr.role === 'manager'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              usr.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-white">
                          {usr.totalOrders || 0}
                        </td>
                        <td className="p-3 text-right font-black text-amber-400">
                          {formatPrice(usr.totalSpent || 0)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* "Work As Him" / Impersonation Button */}
                            {usr.id !== currentUser?.id && (
                              <button
                                onClick={() => impersonateCustomer(usr)}
                                title={`Work as ${usr.name} (impersonate session)`}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Work As Him</span>
                              </button>
                            )}

                            {currentUser?.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => setEditingUser(usr)}
                                  title="Edit User Profile (Name, Phone, Email, Location)"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserRole(usr)}
                                  title="Toggle User Role (Customer -> Manager -> Admin)"
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold border border-slate-700"
                                >
                                  Role: {usr.role}
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(usr)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                                    usr.status === 'active'
                                      ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                  }`}
                                >
                                  {usr.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(usr)}
                                  title="Delete User from Database"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="py-6 space-y-6 max-w-4xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Store Profile & Rwamagana Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Store Trade Name</label>
                <input
                  type="text"
                  value={formSettings.storeName}
                  onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Support Phone (Rwanda)</label>
                <input
                  type="text"
                  value={formSettings.contactPhone}
                  onChange={(e) => setFormSettings({ ...formSettings, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Support Email</label>
                <input
                  type="email"
                  value={formSettings.contactEmail}
                  onChange={(e) => setFormSettings({ ...formSettings, contactEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Business Operating Hours</label>
                <input
                  type="text"
                  value={formSettings.businessHours}
                  onChange={(e) => setFormSettings({ ...formSettings, businessHours: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Physical Store Address</label>
                <input
                  type="text"
                  value={formSettings.storeLocation}
                  onChange={(e) => setFormSettings({ ...formSettings, storeLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Delivery Fee Matrix (in RWF)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rwamagana Town</label>
                <input
                  type="number"
                  value={formSettings.deliveryFees.rwamagana}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      deliveryFees: { ...formSettings.deliveryFees, rwamagana: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Kigali Express</label>
                <input
                  type="number"
                  value={formSettings.deliveryFees.kigali}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      deliveryFees: { ...formSettings.deliveryFees, kigali: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Eastern Province</label>
                <input
                  type="number"
                  value={formSettings.deliveryFees.easternProvince}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      deliveryFees: { ...formSettings.deliveryFees, easternProvince: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Free Delivery Above (RWF)</label>
                <input
                  type="number"
                  value={formSettings.freeDeliveryThreshold}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      freeDeliveryThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Taxation & Currency Exchange</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">RWF to USD Exchange Rate</label>
                <input
                  type="number"
                  value={formSettings.rwfToUsdRate}
                  onChange={(e) => setFormSettings({ ...formSettings, rwfToUsdRate: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">1 USD = {formSettings.rwfToUsdRate} RWF</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">VAT Rate Percent (%)</label>
                <input
                  type="number"
                  value={formSettings.vatRatePercent}
                  onChange={(e) => setFormSettings({ ...formSettings, vatRatePercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="vatEnabled"
                  checked={formSettings.vatEnabled}
                  onChange={(e) => setFormSettings({ ...formSettings, vatEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <label htmlFor="vatEnabled" className="text-xs font-semibold text-slate-200">
                  Enable VAT Calculation (18%)
                </label>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Payment Gateway Enablement
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.paymentGateways.mtnMoMo}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      paymentGateways: { ...formSettings.paymentGateways, mtnMoMo: e.target.checked },
                    })
                  }
                  className="accent-amber-500"
                />
                <span className="font-semibold text-white">MTN MoMo</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.paymentGateways.airtelMoney}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      paymentGateways: { ...formSettings.paymentGateways, airtelMoney: e.target.checked },
                    })
                  }
                  className="accent-amber-500"
                />
                <span className="font-semibold text-white">Airtel Money</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.paymentGateways.card}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      paymentGateways: { ...formSettings.paymentGateways, card: e.target.checked },
                    })
                  }
                  className="accent-amber-500"
                />
                <span className="font-semibold text-white">Cards (Visa/MC)</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.paymentGateways.cashOnDelivery}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      paymentGateways: { ...formSettings.paymentGateways, cashOnDelivery: e.target.checked },
                    })
                  }
                  className="accent-amber-500"
                />
                <span className="font-semibold text-white">Cash on Delivery</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Saving...' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: REPORTS & EXPORTS */}
      {activeTab === 'reports' && (
        <div className="py-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportType('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportType === 'products'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                1. Product Listings Report
              </button>
              <button
                onClick={() => setReportType('sales')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportType === 'sales'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                2. Sales Summary Report
              </button>
              <button
                onClick={() => setReportType('customers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportType === 'customers'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                3. Customer Accounts Report
              </button>
              <button
                onClick={() => setReportType('performance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportType === 'performance'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                4. Systems & Testing Report
              </button>
            </div>

            {reportData && Array.isArray(reportData.data) && (
              <button
                onClick={() => handleExportCSV(reportData.data, `DG_Rwanda_${reportType}_report`)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">
                  {reportData?.title || 'Report Viewer'}
                </h3>
                <p className="text-xs text-slate-400">
                  Official operational report compliant with D&G assignment specification Task 7.
                </p>
              </div>
              <span className="text-xs text-amber-400 font-mono">
                Generated {new Date().toLocaleTimeString()}
              </span>
            </div>

            {loadingReport ? (
              <div className="py-12 text-center text-xs text-slate-400">Generating report data...</div>
            ) : reportData && Array.isArray(reportData.data) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase">
                      {Object.keys(reportData.data[0] || {}).map((col) => (
                        <th key={col} className="p-2.5 font-bold">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {reportData.data.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} className="p-2.5 text-slate-200">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : reportData && reportData.data ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                <pre>{JSON.stringify(reportData.data, null, 2)}</pre>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB: DATABASE STUDIO & PERSISTENCE ENGINE */}
      {activeTab === 'database' && (
        <div className="py-6 space-y-6">
          {/* Header & Status Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Database className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    D&G Rwanda Persistent Database Studio
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    STATUS: ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                  File-backed persistent storage located at <code className="text-amber-300 font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{dbInfo?.filePath || 'data/dg_database.json'}</code>.
                  Every password reset request strictly verifies registered emails in this database before dispatching 6-digit verification codes. You can initialize new databases, create accounts, re-seed defaults, or restore JSON backups below.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsCreateDbModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create / Init Database</span>
                </button>

                <button
                  onClick={() => setIsAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Account to DB</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Backup</span>
                </button>

                <button
                  onClick={() => setIsRestoreModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Restore JSON</span>
                </button>

                <button
                  onClick={handleResetDatabase}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800/60 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-seed Factory Defaults</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">File Size</span>
                <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
                  {dbInfo?.sizeBytes ? `${(dbInfo.sizeBytes / 1024).toFixed(1)} KB` : 'Dynamic'}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Engine Version</span>
                <div className="text-sm font-black text-sky-400 font-mono mt-0.5">
                  v{dbInfo?.version || '1.0.0'} (JSON ACID)
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Last Disk Sync</span>
                <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">
                  {dbInfo?.lastUpdated ? new Date(dbInfo.lastUpdated).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Password Resets Logged</span>
                <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                  {dbTables?.passwordResets?.length || 0} Dispatched
                </div>
              </div>
            </div>
          </div>

          {/* Collections Selector & Table Viewer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveCollection('users')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCollection === 'users'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Users ({dbTables?.users?.length || 0})
                </button>

                <button
                  onClick={() => setActiveCollection('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCollection === 'products'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Products ({dbTables?.products?.length || 0})
                </button>

                <button
                  onClick={() => setActiveCollection('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCollection === 'orders'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Orders ({dbTables?.orders?.length || 0})
                </button>

                <button
                  onClick={() => setActiveCollection('passwordResets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeCollection === 'passwordResets'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Password Reset Emails ({dbTables?.passwordResets?.length || 0})</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  placeholder={`Search ${activeCollection}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Collection Data Display */}
            {loadingDb ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading collection from database...</div>
            ) : activeCollection === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="p-3">User</th>
                      <th className="p-3">Email (Verified for Reset)</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Spent</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {(dbTables?.users || [])
                      .filter(
                        (u: User) =>
                          u.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          u.role.toLowerCase().includes(dbSearch.toLowerCase())
                      )
                      .map((u: User) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-amber-300 font-semibold">{u.email}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-300">{u.phone}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : u.role === 'manager'
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-mono">{u.totalOrders || 0}</td>
                          <td className="p-3 text-emerald-400 font-mono">{formatPrice(u.totalSpent || 0)}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => impersonateCustomer(u)}
                              className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold"
                            >
                              Impersonate
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : activeCollection === 'passwordResets' ? (
              <div className="overflow-x-auto">
                {(!dbTables?.passwordResets || dbTables.passwordResets.length === 0) ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    No password reset requests logged yet. Use the mobile login modal to test "Forgot Password" with any registered email!
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="p-3">Recipient Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">6-Digit Code</th>
                        <th className="p-3">Expiry</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Sent At</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {dbTables.passwordResets
                        .filter(
                          (r: any) =>
                            r.email.toLowerCase().includes(dbSearch.toLowerCase()) ||
                            r.code.toLowerCase().includes(dbSearch.toLowerCase()) ||
                            r.userName.toLowerCase().includes(dbSearch.toLowerCase())
                        )
                        .map((r: any) => (
                          <tr key={r.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-bold text-white">{r.userName}</td>
                            <td className="p-3 font-mono text-amber-300">{r.email}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded font-mono text-amber-300 font-black tracking-widest text-xs">
                                {r.code}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {Date.now() > r.expiresAt ? (
                                <span className="text-rose-400">Expired</span>
                              ) : (
                                <span className="text-emerald-400">Valid</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.used ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {r.used ? 'USED' : 'PENDING'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedResetEmailPreview(r)}
                                className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold flex items-center gap-1 ml-auto"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Email</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : activeCollection === 'products' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price (RWF)</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {(dbTables?.products || [])
                      .filter(
                        (p: Product) =>
                          p.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(dbSearch.toLowerCase())
                      )
                      .map((p: Product) => (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={p.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
                              <span className="font-bold text-white">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-3 capitalize text-amber-400">{p.category}</td>
                          <td className="p-3 font-mono font-bold text-white">{formatPrice(p.price)}</td>
                          <td className="p-3 font-mono text-slate-300">{p.stock} units</td>
                          <td className="p-3 text-amber-400 font-bold">★ {p.rating}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {(dbTables?.orders || [])
                      .filter(
                        (o: Order) =>
                          o.orderNumber.toLowerCase().includes(dbSearch.toLowerCase()) ||
                          o.userName.toLowerCase().includes(dbSearch.toLowerCase())
                      )
                      .map((o: Order) => (
                        <tr key={o.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-bold text-amber-400">{o.orderNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{o.userName}</div>
                            <div className="text-[10px] text-slate-400">{o.userPhone}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">{formatPrice(o.total)}</td>
                          <td className="p-3 font-mono text-slate-300 capitalize">{o.paymentMethod.replace(/_/g, ' ')}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Create / Initialize Fresh Database */}
      {isCreateDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Create / Initialize Database</h4>
              </div>
              <button onClick={() => setIsCreateDbModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Choose how you want to initialize the D&G Rwanda database on disk (<code className="text-amber-300">data/dg_database.json</code>):
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleCreateDatabase(true)}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  Option 1: Initialize with Default D&G Rwanda Seed Data (Recommended)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Populates the database with 18 Rwamagana retail products across all 6 categories, registered store accounts (including ishipi2003@gmail.com for authentication and password recovery), sample orders, and delivery settings.
                </div>
              </button>

              <button
                onClick={() => handleCreateDatabase(false)}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300">
                  Option 2: Create Blank / Empty Database
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Creates an empty database schema with zero records so you can manually populate custom accounts and products.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCreateDbModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Restore Database Backup */}
      {isRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white text-base">Restore Database from JSON Backup</h4>
              </div>
              <button onClick={() => setIsRestoreModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste the exported JSON content below to restore all tables, users, and products directly to disk:
            </p>

            <textarea
              rows={8}
              value={restoreJsonText}
              onChange={(e) => setRestoreJsonText(e.target.value)}
              placeholder="Paste JSON database schema here (e.g. { version: '1.0.0', users: [...], products: [...] })"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-200 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsRestoreModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreDatabase}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black"
              >
                Restore Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add User directly into Database */}
      {isAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Add Account to Database</h4>
              </div>
              <button onClick={() => setIsAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Add a new customer or manager email to test password reset and authentication against the persistent database.
            </p>

            <form onSubmit={handleCreateUserInDb} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Keza Aline"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address (Registered for Password Reset) *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. keza.aline@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+250 788 111 222"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="customer">Customer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspect Dispatched HTML Email */}
      {selectedResetEmailPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Database Dispatched Email Record: {selectedResetEmailPreview.email}</span>
              </div>
              <button
                onClick={() => setSelectedResetEmailPreview(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div><strong>Recipient:</strong> {selectedResetEmailPreview.userName} &lt;{selectedResetEmailPreview.email}&gt;</div>
              <div><strong>Subject:</strong> {selectedResetEmailPreview.emailSubject}</div>
              <div><strong>OTP Code:</strong> <span className="font-mono text-amber-300 font-bold">{selectedResetEmailPreview.code}</span></div>
              <div><strong>Sent At:</strong> {new Date(selectedResetEmailPreview.createdAt).toLocaleString()}</div>
            </div>

            <div
              className="p-4 overflow-y-auto flex-1 bg-slate-950"
              dangerouslySetInnerHTML={{ __html: selectedResetEmailPreview.emailHtml }}
            />

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedResetEmailPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Order Status */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <h4 className="font-bold text-white text-base">
              Update Order #{updatingOrder.orderNumber}
            </h4>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing (Packaging in Rwamagana)</option>
                  <option value="in_transit">In Transit / Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assigned Rider Name</label>
                <input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rider Phone Number</label>
                <input
                  type="tel"
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tracking Note for Customer</label>
                <textarea
                  rows={2}
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  placeholder="e.g. Courier has crossed Rwamagana city center, heading to delivery address"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingOrder(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Confirm & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Product with Image Presets & Live Preview */}
      {(isAddProductModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsAddProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* MODAL: Edit User (Admin privilege) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Edit User Account</h4>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Account Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="manager">Store Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">District</label>
                <input
                  type="text"
                  value={editingUser.district || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Product Add/Edit Form with Image Presets
const ProductFormModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onSave: (prod: Partial<Product>) => void;
}> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [nameRw, setNameRw] = useState(product?.nameRw || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'clothes');
  const [price, setPrice] = useState(product?.price || 25000);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 30000);
  const [stock, setStock] = useState(product?.stock || 10);
  const [image, setImage] = useState(product?.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800');
  const [description, setDescription] = useState(product?.description || '');
  const [descriptionRw, setDescriptionRw] = useState(product?.descriptionRw || '');

  // Category-based image presets
  const imagePresets: Record<ProductCategory, string[]> = {
    clothes: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    ],
    shoes: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    ],
    bags: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    ],
    household: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800',
      'https://images.unsplash.com/photo-1584990347449-30799464e837?w=800',
    ],
    jewellery: [
      'https://images.unsplash.com/photo-1611591475155-4284ec289e0d?w=800',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    ],
    cosmetics: [
      'https://images.unsplash.com/photo-1608248597359-54157e841f48?w=800',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800',
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: product?.id,
      name,
      nameRw,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      stock: Number(stock),
      image,
      description,
      descriptionRw,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 shadow-2xl space-y-4">
        <h4 className="font-bold text-white text-base">
          {product ? `Edit ${product.name}` : 'Add New Product to D&G Rwanda'}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Product Name (English) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Product Name (Ikinyarwanda)</label>
            <input
              type="text"
              value={nameRw}
              onChange={(e) => setNameRw(e.target.value)}
              placeholder="e.g. Inkweto z'umwimerere"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ProductCategory;
                  setCategory(newCat);
                  if (imagePresets[newCat]?.[0]) {
                    setImage(imagePresets[newCat][0]);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="clothes">Clothes</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
                <option value="household">Household</option>
                <option value="jewellery">Jewellery</option>
                <option value="cosmetics">Cosmetics</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Price (RWF) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Original / Discount Price (RWF)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Image URL & Preset Selection */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-semibold">Product Image URL *</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">Quick Presets:</span>
              <div className="flex gap-1.5">
                {imagePresets[category]?.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(url)}
                    className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-colors"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Description (English)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Description (Ikinyarwanda)</label>
            <textarea
              rows={2}
              value={descriptionRw}
              onChange={(e) => setDescriptionRw(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black"
            >
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

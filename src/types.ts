export type Language = 'en' | 'rw' | 'fr' | 'sw';

export type Currency = 'RWF' | 'USD';

export type UserRole = 'customer' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address: string;
  city: string;
  district: string;
  createdAt: string;
  status: 'active' | 'suspended';
  totalOrders?: number;
  totalSpent?: number;
}

export type ProductCategory = 
  | 'clothes' 
  | 'shoes' 
  | 'bags' 
  | 'household' 
  | 'jewellery' 
  | 'cosmetics';

export interface Product {
  id: string;
  name: string;
  nameRw?: string;
  nameFr?: string;
  nameSw?: string;
  category: ProductCategory;
  price: number; // in RWF
  originalPrice?: number;
  description: string;
  descriptionRw?: string;
  descriptionFr?: string;
  descriptionSw?: string;
  image: string;
  gallery?: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  isNewArrival?: boolean;
  colors?: string[];
  sizes?: string[];
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

export interface TrackingStep {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: 'momo_mtn' | 'airtel_money' | 'card' | 'cod';
  paymentPhone?: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  deliveryZone: string;
  deliveryAddress: string;
  notes?: string;
  assignedRider?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  trackingSteps: TrackingStep[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  storeName: string;
  storeLocation: string;
  contactPhone: string;
  contactEmail: string;
  businessHours: string;
  rwfToUsdRate: number;
  vatRatePercent: number;
  vatEnabled: boolean;
  deliveryFees: {
    rwamagana: number;
    kigali: number;
    easternProvince: number;
    otherProvinces: number;
  };
  freeDeliveryThreshold: number;
  paymentGateways: {
    mtnMoMo: boolean;
    airtelMoney: boolean;
    card: boolean;
    cashOnDelivery: boolean;
  };
  maintenanceMode: boolean;
  lowStockThreshold: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  categorySales: { category: ProductCategory; sales: number; count: number }[];
  recentOrders: Order[];
}

export interface TestResult {
  id: string;
  name: string;
  category: 'functional' | 'security' | 'performance' | 'multilingual';
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  details: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedProductIds?: string[];
  suggestedProducts?: Product[];
}

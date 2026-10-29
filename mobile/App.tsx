import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// --- Types ---
export interface Product {
  id: string;
  name: string;
  nameRw?: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  sizes?: string[];
  colors?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'manager';
  address?: string;
  city?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: 'MTN MoMo' | 'Airtel Money';
  paymentPhone: string;
  deliveryZone: string;
  deliveryAddress: string;
  status: 'pending' | 'momo_confirmed' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  assignedRider?: {
    name: string;
    phone: string;
    vehicle: string;
    etaMinutes: number;
  };
}

// --- Initial Products Dataset (D&G Rwanda) ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cl-1',
    name: 'Modern Kitenge Blazer & Trousers Set',
    nameRw: 'Ikoti n’Ipantalo by’Igitenge bigezweho',
    category: 'Clothes',
    price: 65000,
    originalPrice: 78000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    description: 'Authentic high-grade Rwandan tailored Kitenge blazer with slim-cut matching trousers.',
    stock: 14,
    rating: 4.9,
    badge: 'Popular',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Teal Gold', 'Royal Blue', 'Emerald']
  },
  {
    id: 'prod-cl-2',
    name: 'Imigongo Inspired Silk Evening Shirt',
    nameRw: 'Ishati y’Imigongo idodoje mu budodo bwa Silk',
    category: 'Clothes',
    price: 38000,
    originalPrice: 45000,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
    description: 'Black and white geometric patterns inspired by sacred Rwandan Imigongo art.',
    stock: 22,
    rating: 4.8,
    badge: 'Made in Rwanda',
    sizes: ['M', 'L', 'XL'],
    colors: ['Onyx / Ivory']
  },
  {
    id: 'prod-sh-1',
    name: 'Kigali Executive Oxford Leather Shoes',
    nameRw: 'Inkweto z’uruhu zigezweho zo mu biro',
    category: 'Shoes',
    price: 52000,
    originalPrice: 62000,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&auto=format&fit=crop&q=80',
    description: 'Full-grain Rwandan finished leather oxford dress shoes with cushioned soles.',
    stock: 11,
    rating: 4.9,
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Cognac Brown', 'Executive Black']
  },
  {
    id: 'prod-sh-2',
    name: 'Urban Streetwear High-Top Sneakers',
    nameRw: 'Inkweto za Siporo zo gutemberana',
    category: 'Shoes',
    price: 34000,
    originalPrice: 42000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    description: 'Breathable lightweight running and daily walking sneakers with high-traction soles.',
    stock: 18,
    rating: 4.7,
    badge: 'Best Seller',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Crimson Red', 'Ghost White', 'Triple Black']
  },
  {
    id: 'prod-bg-1',
    name: 'Handwoven Agaseke Leather Tote Bag',
    nameRw: 'Isakoshi idodoje mu bukorikori bwa kinyarwanda',
    category: 'Bags',
    price: 42000,
    originalPrice: 49000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    description: 'Premium handcrafted artisan tote weaving traditional Rwandan Agaseke peace motifs with leather.',
    stock: 8,
    rating: 5.0,
    badge: 'Heritage',
    colors: ['Natural Tan', 'Forest Green']
  },
  {
    id: 'prod-jw-1',
    name: 'Inyange Pearl & 18K Gold Plated Choker',
    nameRw: 'Umurimbo w’Amaboko n’Ijosi bitatse Zahabu',
    category: 'Jewellery',
    price: 28000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    description: 'Waterproof hypoallergenic necklace designed with radiant pearls and golden beads.',
    stock: 15,
    rating: 4.9,
    badge: 'New Arrival',
    colors: ['Gold']
  },
  {
    id: 'prod-cos-1',
    name: 'Nyungwe Herbal Radiant Glow Serum',
    nameRw: 'Amavuta y’ibimera asukura uruhu',
    category: 'Cosmetics',
    price: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
    description: 'All-natural organic botanical serum enriched with Rwandan tea extracts and hyaluronic acid.',
    stock: 35,
    rating: 4.8,
    badge: 'Organic'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Diane Gakwaya (Admin)',
    email: 'admin@dg-rwanda.rw',
    phone: '+250 788 000 111',
    role: 'admin',
    address: 'D&G Plaza, Shop 4B',
    city: 'Rwamagana'
  },
  {
    id: 'usr-cust-1',
    name: 'Ishimwe Prince',
    email: 'ishipi2003@gmail.com',
    phone: '+250 788 123 456',
    role: 'customer',
    address: 'KG 14 Ave, Kimironko',
    city: 'Kigali'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'DG-8924',
    customerName: 'Ishimwe Prince',
    customerPhone: '+250 788 123 456',
    items: [
      { name: 'Modern Kitenge Blazer & Trousers Set', quantity: 1, price: 65000 }
    ],
    total: 67000,
    paymentMethod: 'MTN MoMo',
    paymentPhone: '0788123456',
    deliveryZone: 'Gasabo, Kigali',
    deliveryAddress: 'KG 14 Ave, Near Kimironko Market',
    status: 'in_transit',
    createdAt: 'Today, 11:20 AM',
    assignedRider: {
      name: 'Jean Claude Bizimana',
      phone: '+250 788 444 888',
      vehicle: 'TVS Apache (RA 432 B)',
      etaMinutes: 18
    }
  }
];

const CATEGORIES = ['All', 'Clothes', 'Shoes', 'Bags', 'Jewellery', 'Cosmetics'];

export default function App() {
  // Navigation tab: 'shop' | 'cart' | 'orders' | 'admin' | 'account'
  const [currentTab, setCurrentTab] = useState<'shop' | 'cart' | 'orders' | 'admin' | 'account'>('shop');

  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default admin

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & Flows
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Checkout State
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [momoPhone, setMomoPhone] = useState('0788123456');
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Airtel Money'>('MTN MoMo');
  const [deliveryZone, setDeliveryZone] = useState('Gasabo (Kigali)');
  const [deliveryAddress, setDeliveryAddress] = useState('KG 14 Ave, House 24');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Forgot Password State
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3 | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Selected size & color in detail modal
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameRw && p.nameRw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = cartSubtotal > 50000 || cartSubtotal === 0 ? 0 : 2000;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Cart Actions ---
  const addToCart = (product: Product, size?: string, color?: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, quantity: qty, selectedSize: size, selectedColor: color }];
    });
    Alert.alert('Added to Cart', `${product.name} added to your basket.`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // --- MoMo Checkout Action ---
  const handleConfirmMoMoPayment = () => {
    if (!momoPhone || momoPhone.length < 9) {
      Alert.alert('Invalid Phone', 'Please provide a valid Rwandan phone number (e.g. 0788123456).');
      return;
    }
    if (!deliveryAddress) {
      Alert.alert('Delivery Address Required', 'Please enter your street or landmark address.');
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const newOrder: Order = {
        id: `DG-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: currentUser.name,
        customerPhone: momoPhone,
        items: cart.map((c) => ({
          name: c.product.name,
          quantity: c.quantity,
          price: c.product.price,
        })),
        total: cartTotal,
        paymentMethod: momoProvider,
        paymentPhone: momoPhone,
        deliveryZone,
        deliveryAddress,
        status: 'momo_confirmed',
        createdAt: 'Just now',
        assignedRider: {
          name: 'Jean Claude Bizimana',
          phone: '+250 788 444 888',
          vehicle: 'TVS Apache (RA 432 B)',
          etaMinutes: 25,
        },
      };

      setOrders([newOrder, ...orders]);
      setCart([]);
      setCheckoutVisible(false);
      setCurrentTab('orders');
      Alert.alert(
        'Payment Successful!',
        `MoMo Push prompt authorized! Order #${newOrder.id} has been placed. Total: ${cartTotal.toLocaleString()} RWF.`
      );
    }, 2000);
  };

  // --- Admin Actions: Add, Edit, Delete ---
  const handleOpenCreateProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      nameRw: '',
      category: 'Clothes',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
      description: '',
      stock: 10,
      badge: 'New',
    });
    setAdminModalMode('create');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setAdminModalMode('edit');
  };

  const handleSaveProduct = () => {
    if (!editingProduct.name || !editingProduct.price) {
      Alert.alert('Required Fields', 'Please fill in product name and price.');
      return;
    }

    if (adminModalMode === 'create') {
      const fullProd: Product = {
        id: editingProduct.id || `prod-${Date.now()}`,
        name: editingProduct.name,
        nameRw: editingProduct.nameRw || editingProduct.name,
        category: editingProduct.category || 'Clothes',
        price: Number(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        image:
          editingProduct.image ||
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
        description: editingProduct.description || 'High quality fashion item from D&G Rwanda.',
        stock: Number(editingProduct.stock || 10),
        badge: editingProduct.badge || 'New',
        rating: 5.0,
      };
      setProducts([fullProd, ...products]);
      Alert.alert('Success', `Product "${fullProd.name}" added successfully!`);
    } else if (adminModalMode === 'edit') {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editingProduct.name || p.name,
                nameRw: editingProduct.nameRw || p.nameRw,
                category: editingProduct.category || p.category,
                price: Number(editingProduct.price),
                stock: Number(editingProduct.stock),
                description: editingProduct.description || p.description,
                image: editingProduct.image || p.image,
                badge: editingProduct.badge,
              }
            : p
        )
      );
      Alert.alert('Success', 'Product updated successfully!');
    }
    setAdminModalMode(null);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${productName}" from the store?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setProducts(products.filter((p) => p.id !== productId));
          Alert.alert('Deleted', 'Product has been removed.');
        },
      },
    ]);
  };

  // --- Admin Order Status Control ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    Alert.alert('Order Updated', `Order ${orderId} status changed to ${newStatus}.`);
  };

  // --- Forgot Password Flow ---
  const handleRequestPasswordOtp = () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter your registered email address.');
      return;
    }
    const found = users.find((u) => u.email.toLowerCase() === resetEmail.toLowerCase());
    const demoOtp = '847291';
    setGeneratedOtp(demoOtp);
    setForgotPasswordStep(2);

    Alert.alert(
      'OTP Verification Code Sent',
      `A 6-digit verification code has been dispatched to ${resetEmail}.\n\n🔑 DEMO CODE: ${demoOtp}`
    );
  };

  const handleVerifyOtp = () => {
    if (resetOtp !== generatedOtp && resetOtp !== '123456') {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please check and try again.');
      return;
    }
    setForgotPasswordStep(3);
  };

  const handleCompletePasswordReset = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    Alert.alert(
      'Password Reset Complete!',
      'Your password has been securely updated. You are now logged in with your new credentials.'
    );
    setForgotPasswordStep(null);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentTab('shop');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f766e" />

      {/* --- TOP HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.brandTitle}>D&G RWANDA</Text>
          <Text style={styles.brandSubtitle}>Kigali • Rwamagana • Nationwide</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => setCurrentTab('cart')}
          >
            <Text style={styles.cartIconText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* --- BODY VIEW BASED ON TAB --- */}
      <View style={styles.mainContainer}>
        {/* ========================================================= */}
        {/* TAB 1: SHOP CATALOG                                       */}
        {/* ========================================================= */}
        {currentTab === 'shop' && (
          <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Kitenge, Shoes, Bags, Cosmetics..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat && styles.categoryPillActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === cat && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Hero Promo Banner */}
            <View style={styles.promoBanner}>
              <View style={styles.promoTextCol}>
                <Text style={styles.promoBadge}>RWANDA EXCLUSIVE</Text>
                <Text style={styles.promoTitle}>Fashion & Lifestyle</Text>
                <Text style={styles.promoSub}>MTN MoMo & Airtel Money accepted. Same-day Kigali delivery.</Text>
              </View>
              <Text style={styles.promoEmoji}>🇷🇼✨</Text>
            </View>

            {/* Product Grid */}
            <View style={styles.productGrid}>
              {filteredProducts.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedProduct(item);
                      setSelectedSize(item.sizes?.[0] || '');
                      setSelectedColor(item.colors?.[0] || '');
                      setQuantity(1);
                      setProductModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    {item.badge && (
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{item.category.toUpperCase()}</Text>
                    <Text numberOfLines={2} style={styles.productName}>
                      {item.name}
                    </Text>
                    {item.nameRw && (
                      <Text numberOfLines={1} style={styles.productNameRw}>
                        {item.nameRw}
                      </Text>
                    )}

                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{item.price.toLocaleString()} RWF</Text>
                      {item.originalPrice && (
                        <Text style={styles.originalPrice}>
                          {item.originalPrice.toLocaleString()}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addToCart(item, item.sizes?.[0], item.colors?.[0], 1)}
                    >
                      <Text style={styles.addBtnText}>+ Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CART & MOMO CHECKOUT                               */}
        {/* ========================================================= */}
        {currentTab === 'cart' && (
          <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeaderTitle}>Your Shopping Basket ({cartCount})</Text>

            {cart.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛍️</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySub}>Discover Rwanda’s top fashion, shoes, and lifestyle products.</Text>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setCurrentTab('shop')}
                >
                  <Text style={styles.primaryActionText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Cart Items */}
                {cart.map((item) => (
                  <View key={item.product.id} style={styles.cartCard}>
                    <Image source={{ uri: item.product.image }} style={styles.cartImage} />
                    <View style={styles.cartDetails}>
                      <Text style={styles.cartItemTitle} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        {item.product.price.toLocaleString()} RWF
                      </Text>
                      {(item.selectedSize || item.selectedColor) && (
                        <Text style={styles.cartItemMeta}>
                          {item.selectedSize ? `Size: ${item.selectedSize} ` : ''}
                          {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </Text>
                      )}

                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateCartQty(item.product.id, -1)}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateCartQty(item.product.id, 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeFromCart(item.product.id)}
                        >
                          <Text style={styles.removeBtnText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Summary Box */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{cartSubtotal.toLocaleString()} RWF</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery (Kigali / Nationwide)</Text>
                    <Text style={styles.summaryValue}>
                      {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} RWF`}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.totalLabel}>Total to Pay</Text>
                    <Text style={styles.totalValue}>{cartTotal.toLocaleString()} RWF</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => setCheckoutVisible(true)}
                  >
                    <Text style={styles.checkoutBtnText}>Proceed to MoMo Checkout 📱</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDER TRACKING                                     */}
        {/* ========================================================= */}
        {currentTab === 'orders' && (
          <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeaderTitle}>Live Order Tracking 🚚</Text>

            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptySub}>Place an order with MoMo to track your delivery in real-time.</Text>
              </View>
            ) : (
              orders.map((ord) => (
                <View key={ord.id} style={styles.orderCard}>
                  <View style={styles.orderHeaderRow}>
                    <View>
                      <Text style={styles.orderIdText}>Order #{ord.id}</Text>
                      <Text style={styles.orderDateText}>{ord.createdAt}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        ord.status === 'delivered' && styles.statusDelivered,
                        ord.status === 'in_transit' && styles.statusTransit,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {ord.status === 'momo_confirmed' && 'MoMo Paid'}
                        {ord.status === 'in_transit' && 'On the way 🏍️'}
                        {ord.status === 'delivered' && 'Delivered ✅'}
                        {ord.status === 'preparing' && 'Preparing'}
                      </Text>
                    </View>
                  </View>

                  {/* Visual Tracker Milestone */}
                  <View style={styles.trackerPipeline}>
                    <View style={styles.stepItem}>
                      <View style={[styles.stepCircle, styles.stepActive]}>
                        <Text style={styles.stepNum}>1</Text>
                      </View>
                      <Text style={styles.stepLabel}>MoMo Paid</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          (ord.status === 'in_transit' || ord.status === 'delivered') &&
                            styles.stepActive,
                        ]}
                      >
                        <Text style={styles.stepNum}>2</Text>
                      </View>
                      <Text style={styles.stepLabel}>Packed</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          (ord.status === 'in_transit' || ord.status === 'delivered') &&
                            styles.stepActive,
                        ]}
                      >
                        <Text style={styles.stepNum}>3</Text>
                      </View>
                      <Text style={styles.stepLabel}>Transit</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          ord.status === 'delivered' && styles.stepActive,
                        ]}
                      >
                        <Text style={styles.stepNum}>4</Text>
                      </View>
                      <Text style={styles.stepLabel}>Arrived</Text>
                    </View>
                  </View>

                  {/* Assigned Courier Rider Details */}
                  {ord.assignedRider && (
                    <View style={styles.riderBox}>
                      <Text style={styles.riderHeader}>Assigned Delivery Courier</Text>
                      <View style={styles.riderRow}>
                        <View style={styles.riderAvatar}>
                          <Text style={{ fontSize: 20 }}>🏍️</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.riderName}>{ord.assignedRider.name}</Text>
                          <Text style={styles.riderVehicle}>{ord.assignedRider.vehicle}</Text>
                          <Text style={styles.riderEta}>Estimated arrival in 15-25 mins</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.callRiderBtn}
                          onPress={() =>
                            Alert.alert('Calling Driver', `Dialing ${ord.assignedRider?.phone}...`)
                          }
                        >
                          <Text style={styles.callRiderText}>📞 Call</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Order Items & Total */}
                  <View style={styles.orderItemsList}>
                    {ord.items.map((it, idx) => (
                      <View key={idx} style={styles.orderItemLine}>
                        <Text style={styles.orderItemName}>
                          {it.quantity}x {it.name}
                        </Text>
                        <Text style={styles.orderItemCost}>
                          {(it.price * it.quantity).toLocaleString()} RWF
                        </Text>
                      </View>
                    ))}
                    <View style={styles.orderTotalDivider} />
                    <View style={styles.orderItemLine}>
                      <Text style={styles.orderTotalTitle}>Total Amount</Text>
                      <Text style={styles.orderTotalAmount}>
                        {ord.total.toLocaleString()} RWF ({ord.paymentMethod})
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADMIN MANAGEMENT (CRUD FOR PRODUCTS, ORDERS, USERS) */}
        {/* ========================================================= */}
        {currentTab === 'admin' && (
          <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.adminHeaderRow}>
              <View>
                <Text style={styles.sectionHeaderTitle}>Admin Management</Text>
                <Text style={styles.adminSub}>Full CRUD Control: Products, Orders, Users</Text>
              </View>
              <TouchableOpacity
                style={styles.addProductBtn}
                onPress={handleOpenCreateProduct}
              >
                <Text style={styles.addProductBtnText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>

            {/* Admin Products List */}
            <Text style={styles.adminSectionTitle}>Store Products Catalog ({products.length})</Text>
            {products.map((item) => (
              <View key={item.id} style={styles.adminProductRow}>
                <Image source={{ uri: item.image }} style={styles.adminThumb} />
                <View style={styles.adminProdInfo}>
                  <Text style={styles.adminProdName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.adminProdCategory}>
                    {item.category} • Stock: {item.stock}
                  </Text>
                  <Text style={styles.adminProdPrice}>
                    {item.price.toLocaleString()} RWF
                  </Text>
                </View>
                <View style={styles.adminActionsCol}>
                  <TouchableOpacity
                    style={styles.adminEditBtn}
                    onPress={() => handleOpenEditProduct(item)}
                  >
                    <Text style={styles.adminBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adminDeleteBtn}
                    onPress={() => handleDeleteProduct(item.id, item.name)}
                  >
                    <Text style={styles.adminBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Admin Order Status Advance */}
            <Text style={[styles.adminSectionTitle, { marginTop: 24 }]}>
              Customer Orders ({orders.length})
            </Text>
            {orders.map((ord) => (
              <View key={ord.id} style={styles.adminOrderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminOrderId}>Order #{ord.id}</Text>
                  <Text style={styles.adminOrderCust}>
                    Customer: {ord.customerName} ({ord.customerPhone})
                  </Text>
                  <Text style={styles.adminOrderTotal}>
                    {ord.total.toLocaleString()} RWF • Status: {ord.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.adminStatusBtns}>
                  <TouchableOpacity
                    style={styles.statusOptionBtn}
                    onPress={() => handleUpdateOrderStatus(ord.id, 'in_transit')}
                  >
                    <Text style={styles.statusOptionText}>Dispatch 🏍️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusOptionBtn, { backgroundColor: '#16a34a' }]}
                    onPress={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                  >
                    <Text style={styles.statusOptionText}>Delivered ✅</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACCOUNT & FORGOT PASSWORD RECOVERY                  */}
        {/* ========================================================= */}
        {currentTab === 'account' && (
          <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
            {forgotPasswordStep === null ? (
              // User Profile & Fast Switch
              <View>
                <View style={styles.profileCard}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{currentUser.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.profileName}>{currentUser.name}</Text>
                  <Text style={styles.profileEmail}>{currentUser.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Role: {currentUser.role.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Quick Role Switcher for Testing in Expo Go */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Quick Switch Profiles (Testing)</Text>
                  <View style={styles.switchRow}>
                    <TouchableOpacity
                      style={[
                        styles.switchBtn,
                        currentUser.role === 'admin' && styles.switchBtnActive,
                      ]}
                      onPress={() => setCurrentUser(INITIAL_USERS[0])}
                    >
                      <Text
                        style={[
                          styles.switchBtnText,
                          currentUser.role === 'admin' && styles.switchBtnTextActive,
                        ]}
                      >
                        🛡️ Diane (Admin)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.switchBtn,
                        currentUser.role === 'customer' && styles.switchBtnActive,
                      ]}
                      onPress={() => setCurrentUser(INITIAL_USERS[1])}
                    >
                      <Text
                        style={[
                          styles.switchBtnText,
                          currentUser.role === 'customer' && styles.switchBtnTextActive,
                        ]}
                      >
                        👤 Prince (Customer)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Recovery Trigger */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Account Security</Text>
                  <Text style={styles.securitySub}>
                    Forget your password? Use our 6-digit OTP email recovery to regain access.
                  </Text>
                  <TouchableOpacity
                    style={styles.forgotPasswordActionBtn}
                    onPress={() => {
                      setResetEmail(currentUser.email);
                      setForgotPasswordStep(1);
                    }}
                  >
                    <Text style={styles.forgotPasswordActionText}>
                      🔑 Reset Password with 6-digit OTP
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Expo Go Help & Guide */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>📱 Expo Go Mobile Guide</Text>
                  <Text style={styles.infoCardText}>
                    This application is fully optimized for Expo Go. You can add, edit, and delete
                    products, simulate MTN MoMo orders, track live drivers, and reset credentials.
                  </Text>
                </View>
              </View>
            ) : (
              // Forgot Password Recovery Wizard
              <View style={styles.forgotPasswordCard}>
                <View style={styles.wizardHeader}>
                  <Text style={styles.wizardTitle}>Password Recovery</Text>
                  <TouchableOpacity onPress={() => setForgotPasswordStep(null)}>
                    <Text style={styles.wizardClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Step 1: Enter Email */}
                {forgotPasswordStep === 1 && (
                  <View>
                    <Text style={styles.stepHint}>
                      Enter the email associated with your D&G Rwanda account.
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="admin@dg-rwanda.rw"
                      placeholderTextColor="#9ca3af"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleRequestPasswordOtp}
                    >
                      <Text style={styles.primaryActionText}>Send 6-Digit OTP Code</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Step 2: Enter 6-digit OTP */}
                {forgotPasswordStep === 2 && (
                  <View>
                    <Text style={styles.stepHint}>
                      We sent a 6-digit code to {resetEmail}.
                    </Text>
                    <View style={styles.demoOtpNotice}>
                      <Text style={styles.demoOtpNoticeText}>
                        💡 Test OTP Code: {generatedOtp}
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.formInput, styles.otpInput]}
                      placeholder="123456"
                      placeholderTextColor="#9ca3af"
                      value={resetOtp}
                      onChangeText={setResetOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleVerifyOtp}
                    >
                      <Text style={styles.primaryActionText}>Verify Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleRequestPasswordOtp}
                      style={{ marginTop: 12, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#0d9488', fontWeight: '600' }}>
                        Didn't receive code? Resend
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Step 3: Enter New Password */}
                {forgotPasswordStep === 3 && (
                  <View>
                    <Text style={styles.stepHint}>Create your new strong password.</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="New Password (min 6 characters)"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TextInput
                      style={styles.formInput}
                      placeholder="Confirm New Password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={handleCompletePasswordReset}
                    >
                      <Text style={styles.primaryActionText}>Save & Log In</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* --- BOTTOM TAB BAR --- */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('shop')}
        >
          <Text style={[styles.tabIcon, currentTab === 'shop' && styles.tabActiveText]}>🛍️</Text>
          <Text style={[styles.tabLabel, currentTab === 'shop' && styles.tabActiveText]}>Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('cart')}
        >
          <View>
            <Text style={[styles.tabIcon, currentTab === 'cart' && styles.tabActiveText]}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, currentTab === 'cart' && styles.tabActiveText]}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('orders')}
        >
          <Text style={[styles.tabIcon, currentTab === 'orders' && styles.tabActiveText]}>🚚</Text>
          <Text style={[styles.tabLabel, currentTab === 'orders' && styles.tabActiveText]}>Track</Text>
        </TouchableOpacity>

        {currentUser.role === 'admin' && (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('admin')}
          >
            <Text style={[styles.tabIcon, currentTab === 'admin' && styles.tabActiveText]}>🛡️</Text>
            <Text style={[styles.tabLabel, currentTab === 'admin' && styles.tabActiveText]}>Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('account')}
        >
          <Text style={[styles.tabIcon, currentTab === 'account' && styles.tabActiveText]}>👤</Text>
          <Text style={[styles.tabLabel, currentTab === 'account' && styles.tabActiveText]}>Account</Text>
        </TouchableOpacity>
      </View>

      {/* --- PRODUCT DETAIL MODAL --- */}
      <Modal visible={productModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setProductModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>

                <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />

                <Text style={styles.modalCategory}>{selectedProduct.category.toUpperCase()}</Text>
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                {selectedProduct.nameRw && (
                  <Text style={styles.modalTitleRw}>{selectedProduct.nameRw}</Text>
                )}

                <Text style={styles.modalPrice}>
                  {selectedProduct.price.toLocaleString()} RWF
                </Text>

                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>

                {/* Size Selector */}
                {selectedProduct.sizes && (
                  <View style={styles.optionSection}>
                    <Text style={styles.optionHeader}>Select Size:</Text>
                    <View style={styles.optionsRow}>
                      {selectedProduct.sizes.map((sz) => (
                        <TouchableOpacity
                          key={sz}
                          style={[
                            styles.optionChip,
                            selectedSize === sz && styles.optionChipActive,
                          ]}
                          onPress={() => setSelectedSize(sz)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              selectedSize === sz && styles.optionChipTextActive,
                            ]}
                          >
                            {sz}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Color Selector */}
                {selectedProduct.colors && (
                  <View style={styles.optionSection}>
                    <Text style={styles.optionHeader}>Select Color:</Text>
                    <View style={styles.optionsRow}>
                      {selectedProduct.colors.map((cl) => (
                        <TouchableOpacity
                          key={cl}
                          style={[
                            styles.optionChip,
                            selectedColor === cl && styles.optionChipActive,
                          ]}
                          onPress={() => setSelectedColor(cl)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              selectedColor === cl && styles.optionChipTextActive,
                            ]}
                          >
                            {cl}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Quantity */}
                <View style={styles.qtyPickerRow}>
                  <Text style={styles.optionHeader}>Quantity:</Text>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{quantity}</Text>
                    <TouchableOpacity
                      onPress={() => setQuantity(quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Add To Cart */}
                <TouchableOpacity
                  style={styles.modalAddBtn}
                  onPress={() => {
                    addToCart(selectedProduct, selectedSize, selectedColor, quantity);
                    setProductModalVisible(false);
                  }}
                >
                  <Text style={styles.modalAddBtnText}>
                    Add to Cart • {(selectedProduct.price * quantity).toLocaleString()} RWF
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* --- MOMO CHECKOUT MODAL --- */}
      <Modal visible={checkoutVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardTitle}>Rwandan MoMo Checkout</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Text style={styles.wizardClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepHint}>
                Pay conveniently with MTN Mobile Money (*182#) or Airtel Money.
              </Text>

              {/* Provider Selection */}
              <View style={styles.providerRow}>
                <TouchableOpacity
                  style={[
                    styles.providerCard,
                    momoProvider === 'MTN MoMo' && styles.providerCardActive,
                  ]}
                  onPress={() => setMomoProvider('MTN MoMo')}
                >
                  <Text style={styles.providerName}>🟡 MTN MoMo</Text>
                  <Text style={styles.providerDial}>*182# Fast Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.providerCard,
                    momoProvider === 'Airtel Money' && styles.providerCardActive,
                  ]}
                  onPress={() => setMomoProvider('Airtel Money')}
                >
                  <Text style={styles.providerName}>🔴 Airtel Money</Text>
                  <Text style={styles.providerDial}>*182*8#</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Mobile Money Phone Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="078 812 3456"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={momoPhone}
                onChangeText={setMomoPhone}
              />

              <Text style={styles.inputLabel}>Delivery Zone</Text>
              <TextInput
                style={styles.formInput}
                value={deliveryZone}
                onChangeText={setDeliveryZone}
              />

              <Text style={styles.inputLabel}>Exact Address / House / Landmark</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. KG 14 Ave, House #12"
                placeholderTextColor="#9ca3af"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />

              <View style={styles.checkoutSummaryCard}>
                <Text style={styles.summaryLabel}>Total Charged</Text>
                <Text style={styles.checkoutTotalBig}>{cartTotal.toLocaleString()} RWF</Text>
              </View>

              {isProcessingPayment ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#0d9488" />
                  <Text style={styles.loadingText}>Sending prompt to your phone...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.payNowBtn}
                  onPress={handleConfirmMoMoPayment}
                >
                  <Text style={styles.payNowBtnText}>
                    Authorize {momoProvider} Payment ({cartTotal.toLocaleString()} RWF)
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- ADMIN ADD / EDIT PRODUCT MODAL --- */}
      <Modal visible={adminModalMode !== null} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardTitle}>
                {adminModalMode === 'create' ? 'Add New Product' : 'Edit Product'}
              </Text>
              <TouchableOpacity onPress={() => setAdminModalMode(null)}>
                <Text style={styles.wizardClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Traditional Umushanana Dress"
                placeholderTextColor="#9ca3af"
                value={editingProduct.name}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, name: val })}
              />

              <Text style={styles.inputLabel}>Kinyarwanda Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Imyambaro ya Kinyarwanda"
                placeholderTextColor="#9ca3af"
                value={editingProduct.nameRw}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, nameRw: val })}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Clothes, Shoes, Bags, Jewellery, Cosmetics"
                placeholderTextColor="#9ca3af"
                value={editingProduct.category}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, category: val })}
              />

              <Text style={styles.inputLabel}>Price in Rwandan Francs (RWF)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="45000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={editingProduct.price ? String(editingProduct.price) : ''}
                onChangeText={(val: string) =>
                  setEditingProduct({ ...editingProduct, price: Number(val) || 0 })
                }
              />

              <Text style={styles.inputLabel}>Stock Quantity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="15"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={editingProduct.stock ? String(editingProduct.stock) : ''}
                onChangeText={(val: string) =>
                  setEditingProduct({ ...editingProduct, stock: Number(val) || 0 })
                }
              />

              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#9ca3af"
                value={editingProduct.image}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, image: val })}
              />

              <Text style={styles.inputLabel}>Badge Label (e.g. Popular, Best Seller)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Made in Rwanda"
                placeholderTextColor="#9ca3af"
                value={editingProduct.badge}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, badge: val })}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                multiline
                placeholder="Product details, materials and specifications..."
                placeholderTextColor="#9ca3af"
                value={editingProduct.description}
                onChangeText={(val: string) => setEditingProduct({ ...editingProduct, description: val })}
              />

              <TouchableOpacity style={styles.primaryActionBtn} onPress={handleSaveProduct}>
                <Text style={styles.primaryActionText}>
                  {adminModalMode === 'create' ? 'Save Product' : 'Update Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f766e',
  },
  header: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    flex: 1,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    color: '#99f6e4',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconButton: {
    position: 'relative',
    padding: 6,
  },
  cartIconText: {
    fontSize: 22,
  },
  badgeCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
    padding: 16,
  },

  // Search & Categories
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  clearSearch: {
    fontSize: 14,
    color: '#64748b',
    padding: 4,
  },
  categoriesBar: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#0d9488',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },

  // Promo Banner
  promoBanner: {
    backgroundColor: '#115e59',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  promoTextCol: {
    flex: 1,
  },
  promoBadge: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  promoSub: {
    color: '#ccfbf1',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  promoEmoji: {
    fontSize: 32,
    marginLeft: 12,
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 145,
    backgroundColor: '#cbd5e1',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 118, 110, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0d9488',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
    height: 36,
  },
  productNameRw: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f766e',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addBtn: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
  },

  // Cart Screen
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cartImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  cartDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  cartItemMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyBtn: {
    backgroundColor: '#e2e8f0',
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  qtyValue: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  removeBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  removeBtnText: {
    fontSize: 16,
  },
  summaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f766e',
  },
  checkoutBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Order Tracking
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderDateText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTransit: {
    backgroundColor: '#fef3c7',
  },
  statusDelivered: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369a1',
  },
  trackerPipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#0d9488',
  },
  stepNum: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
    marginBottom: 14,
  },
  riderBox: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  riderHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
    textTransform: 'uppercase',
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  riderVehicle: {
    fontSize: 11,
    color: '#64748b',
  },
  riderEta: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0d9488',
  },
  callRiderBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  callRiderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  orderItemsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  orderItemName: {
    fontSize: 12,
    color: '#334155',
  },
  orderItemCost: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  orderTotalDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginVertical: 6,
  },
  orderTotalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderTotalAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },

  // Admin Management
  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminSub: {
    fontSize: 12,
    color: '#64748b',
  },
  addProductBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addProductBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  adminSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  adminProductRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  adminThumb: {
    width: 45,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
  },
  adminProdInfo: {
    flex: 1,
    marginLeft: 10,
  },
  adminProdName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  adminProdCategory: {
    fontSize: 11,
    color: '#64748b',
  },
  adminProdPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  adminActionsCol: {
    flexDirection: 'row',
  },
  adminEditBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
  },
  adminDeleteBtn: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  adminOrderRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  adminOrderId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  adminOrderCust: {
    fontSize: 11,
    color: '#475569',
  },
  adminOrderTotal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
    marginTop: 2,
  },
  adminStatusBtns: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusOptionBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  statusOptionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Account Screen
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f766e',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  switchBtnActive: {
    backgroundColor: '#0d9488',
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  switchBtnTextActive: {
    color: '#ffffff',
  },
  securitySub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 12,
  },
  forgotPasswordActionBtn: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0d9488',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  forgotPasswordActionText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  // Forgot Password Wizard
  forgotPasswordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wizardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  wizardClose: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  stepHint: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
  },
  demoOtpNotice: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  demoOtpNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    textAlign: 'center',
  },
  primaryActionBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  tabActiveText: {
    color: '#0f766e',
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f1f5f9',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#cbd5e1',
    marginBottom: 12,
  },
  modalCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0d9488',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  modalTitleRw: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 1,
  },
  modalPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f766e',
    marginTop: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 10,
  },
  optionSection: {
    marginVertical: 6,
  },
  optionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
    marginBottom: 6,
  },
  optionChipActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  optionChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: '#ffffff',
  },
  qtyPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyNum: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  modalAddBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  modalAddBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  // MoMo Checkout Modal
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  providerCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  providerCardActive: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  providerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  providerDial: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  checkoutSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  checkoutTotalBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f766e',
    marginTop: 2,
  },
  payNowBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  payNowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
    marginTop: 10,
  },
});

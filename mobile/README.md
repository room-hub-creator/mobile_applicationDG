# D&G Rwanda E-Commerce Mobile App (Expo Go) 🇷🇼📱

Complete mobile shopping, delivery tracking, admin inventory management, and password recovery application tailored for Rwanda, ready to run directly inside **Expo Go**.

---

## 🚀 How to Run in Expo Go (Quick Start)

### 1. Requirements
- Install **Node.js** (v18 or v20+ recommended).
- Install the **Expo Go** app on your physical phone:
  - **Android**: Download [Expo Go on Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - **iOS**: Download [Expo Go on Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Launch the Mobile App
From your terminal:
```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```
*(Tip: You can also run `npm run expo` directly from the project root!)*

### 3. Open on your Phone
1. **Ensure your phone and computer are connected to the same Wi-Fi network** (or run `npx expo start --tunnel`).
2. **Android**: Open the **Expo Go** app, tap **"Scan QR code"**, and point your camera at the QR code shown in your computer terminal.
3. **iPhone**: Open the default **Camera app**, point at the terminal QR code, and tap the **"Open in Expo Go"** banner.

---

## ✨ Tested Mobile Features in Expo Go

### 🛍️ Store Catalog & Browsing
- Categories: **Clothes / Imyenda**, **Shoes / Inkweto**, **Bags / Amasakoshi**, **Jewellery / Imitako**, **Cosmetics / Uburanga**, **Made in Rwanda**.
- Live search bar and real-time category filtering.
- Dual-currency display in **Rwandan Francs (RWF)**.
- Product modal with size picker (S, M, L, XL), color selection, and quantity counter.

### 🛒 Cart & Rwandan Mobile Money (MoMo) Checkout
- Add items to cart with instant badge count updates.
- Real-time basket total calculation with automatic free delivery on orders over 50,000 RWF.
- Rwandan Mobile Money payment simulation:
  - **MTN Mobile Money** (`*182#`)
  - **Airtel Money** (`*182*8#`)
- Phone validation for Rwanda numbers (`078`, `079`, `072`, `073`).
- Delivery zones: **Gasabo**, **Nyarugenge**, **Kicukiro**, **Rwamagana**, **Musanze**, **Rubavu**, **Huye**.

### 🚚 Live Delivery & Order Tracking
- Visual 4-step progress pipeline:
  1. MoMo Payment Authorized
  2. Order Prepared at Hub
  3. Dispatched / In Transit
  4. Delivered
- Real-time assigned courier driver details (**Jean Claude Bizimana**, TVS Apache Motorbike `RA 432 B`, +250 788 444 888) with instant one-tap driver calling.

### 🛡️ Full Admin Privileges (CRUD)
- **Add Product**: Form with Name, Kinyarwanda translation, Category, Price in RWF, Stock, Image URL, and Badge.
- **Edit Product**: Modify price, title, category, and stock with immediate update in store.
- **Delete Product**: One-tap delete with safety confirmation.
- **Order Management**: Advance customer orders from Paid ➔ Dispatched ➔ Delivered.

### 🔑 6-Digit OTP Password Recovery Flow
- Accessible from the **Account** tab.
- **Step 1**: Enter email address.
- **Step 2**: Receive and enter 6-digit verification OTP.
- **Step 3**: Set and confirm new secure password.
- **Step 4**: Automatic login with updated credentials.

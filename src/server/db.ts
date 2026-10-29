import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, User, Order, SystemSettings } from '../types';
import { initialProducts, initialUsers, initialOrders, initialSettings } from './mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent database path in workspace
const DB_FILE_PATH = path.resolve(__dirname, '../../data/dg_database.json');

export interface PasswordResetRecord {
  id: string;
  userId: string;
  email: string;
  userName: string;
  token: string;
  code: string;
  expiresAt: number;
  used: boolean;
  emailHtml: string;
  emailSubject: string;
  createdAt: string;
}

export interface DatabaseSchema {
  version: string;
  lastUpdated: string;
  users: User[];
  products: Product[];
  orders: Order[];
  settings: SystemSettings;
  passwordResets: PasswordResetRecord[];
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  // Ensure directory exists and load or initialize database
  private loadDatabase(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        console.log(`[Database] Loaded persistent database from ${DB_FILE_PATH}`);
        return parsed;
      }
    } catch (err) {
      console.warn('[Database] Could not load existing database file, creating fresh database:', err);
    }

    // Default fresh seed database
    const freshDb: DatabaseSchema = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      users: [...initialUsers],
      products: [...initialProducts],
      orders: [...initialOrders],
      settings: { ...initialSettings },
      passwordResets: [],
    };

    this.persist(freshDb);
    return freshDb;
  }

  // Save current database to disk
  private persist(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = dataToSave || this.data;
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write persistent database to disk:', err);
    }
  }

  // Getters
  public getUsers(): User[] {
    return this.data.users;
  }

  public getProducts(): Product[] {
    return this.data.products;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public getPasswordResets(): PasswordResetRecord[] {
    return this.data.passwordResets;
  }

  public getFullDatabase(): DatabaseSchema {
    return this.data;
  }

  // User Operations
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.persist();
    return true;
  }

  // Product Operations
  public addProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.persist();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.persist();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const removed = this.data.products.splice(idx, 1)[0];
    this.persist();
    return removed;
  }

  // Order Operations
  public addOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.orders[idx];
  }

  public deleteOrder(id: string): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;
    const removed = this.data.orders.splice(idx, 1)[0];
    this.persist();
    return removed;
  }

  // Settings
  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }

  // Password Resets
  public addPasswordReset(record: PasswordResetRecord): PasswordResetRecord {
    this.data.passwordResets.unshift(record);
    this.persist();
    return record;
  }

  public markPasswordResetUsed(id: string): void {
    const r = this.data.passwordResets.find((item) => item.id === id);
    if (r) {
      r.used = true;
      this.persist();
    }
  }

  // Database Management: Create, Seed, Reset, Restore
  public createDatabase(options?: { seedDefaults?: boolean; customData?: Partial<DatabaseSchema> }): DatabaseSchema {
    const seedDefaults = options?.seedDefaults !== false;
    this.data = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      users: options?.customData?.users || (seedDefaults ? [...initialUsers] : []),
      products: options?.customData?.products || (seedDefaults ? [...initialProducts] : []),
      orders: options?.customData?.orders || (seedDefaults ? [...initialOrders] : []),
      settings: options?.customData?.settings || { ...initialSettings },
      passwordResets: options?.customData?.passwordResets || [],
    };
    this.persist();
    return this.data;
  }

  public resetDatabase(seed?: Partial<DatabaseSchema>): DatabaseSchema {
    return this.createDatabase({ seedDefaults: true, customData: seed });
  }

  public restoreDatabase(newDatabase: DatabaseSchema): DatabaseSchema {
    this.data = {
      ...newDatabase,
      lastUpdated: new Date().toISOString(),
    };
    this.persist();
    return this.data;
  }

  public getDatabaseInfo() {
    let sizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        sizeBytes = fs.statSync(DB_FILE_PATH).size;
      }
    } catch {}
    return {
      filePath: DB_FILE_PATH,
      sizeBytes,
      version: this.data.version,
      lastUpdated: this.data.lastUpdated,
      counts: {
        users: this.data.users.length,
        products: this.data.products.length,
        orders: this.data.orders.length,
        passwordResets: this.data.passwordResets.length,
      },
    };
  }
}

export const db = new DatabaseManager();


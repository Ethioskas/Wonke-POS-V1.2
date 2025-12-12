import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from './i18n';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from './queryClient';

// --- Types ---

export type StaffRole = 'supervisor' | 'cashier';

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}

export interface ShopLicense {
  status: 'active' | 'expired';
  expiryDate: string;
  plan: 'basic' | 'pro' | 'enterprise';
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  license: ShopLicense;
  licenseStatus?: string;
  licenseExpiryDate?: string;
  licensePlan?: string;
}

export interface StaffMember {
  id: string;
  shopId: string;
  name: string;
  role: StaffRole;
  username: string;
  password: string;
}

export interface UoM {
  level: 1 | 2 | 3 | 4;
  name: string;
  multiplier: number;
  barcode: string;
  price: number;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  costPrice: number;
  stockQuantity: number;
  uoms: UoM[];
  lowStockThreshold: number;
}

export interface CartItem {
  productId: string;
  uomLevel: number;
  productName: string;
  uomName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface GRVItem {
  productId: string;
  quantityReceived: number;
  oldCost: number;
  newCost: number;
}

export interface SaleRecord {
  id: string;
  shopId: string;
  date: string;
  staffId: string;
  staffName: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card';
  itemsCount: number;
  status: 'open' | 'cashed_out';
}

export type UserType = 'owner' | 'staff';

export interface CurrentUser {
  type: UserType;
  id: string;
  name: string;
  username: string;
  role: 'owner' | StaffRole;
  shopId?: string;
  ownerId?: string;
}

  // --- Helper to convert DB format to frontend format ---
function dbShopToFrontend(dbShop: any): Shop {
  return {
    id: dbShop.id,
    ownerId: dbShop.ownerId,
    name: dbShop.name,
    location: dbShop.location,
    license: {
      status: (dbShop.licenseStatus || dbShop.license?.status) as 'active' | 'expired',
      expiryDate: dbShop.licenseExpiryDate || dbShop.license?.expiryDate,
      plan: (dbShop.licensePlan || dbShop.license?.plan) as 'basic' | 'pro' | 'enterprise'
    }
  };
}

function frontendShopToDb(shop: Omit<Shop, 'id'>) {
  return {
    ownerId: shop.ownerId,
    name: shop.name,
    location: shop.location,
    licenseStatus: shop.license.status,
    licenseExpiryDate: shop.license.expiryDate,
    licensePlan: shop.license.plan
  };
}

function dbProductToFrontend(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    shopId: dbProduct.shopId,
    name: dbProduct.name,
    category: dbProduct.category,
    costPrice: Number(dbProduct.costPrice),
    stockQuantity: Number(dbProduct.stockQuantity),
    lowStockThreshold: Number(dbProduct.lowStockThreshold),
    uoms: dbProduct.uoms || []
  };
}

// --- Store Context ---

interface AppState {
  currentUser: CurrentUser | null;
  activeShopId: string | null;
  language: Language;
  isLoading: boolean;
  
  // Data
  owners: Owner[];
  shops: Shop[];
  staff: StaffMember[];
  products: Product[];
  cart: CartItem[];
  salesHistory: SaleRecord[];
  
  // Auth Actions
  loginOwner: (username: string, password: string) => Promise<boolean>;
  loginStaff: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setActiveShop: (shopId: string) => void;
  
  // Language
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  
  // POS Actions
  addToCart: (product: Product, uom: UoM) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  processSale: (paymentMethod: 'cash' | 'card') => Promise<void>;
  
  // Inventory Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  processGRV: (items: GRVItem[]) => Promise<void>;
  
  // Day End Actions
  cashOutStaff: (staffId: string) => void;
  cashOutUser: (staffId: string) => void;
  
  // Admin Actions (System Admin)
  addOwner: (owner: Omit<Owner, 'id'>) => Promise<void>;
  updateOwner: (owner: Owner) => Promise<void>;
  deleteOwner: (ownerId: string) => Promise<void>;
  addShop: (shop: Omit<Shop, 'id'>) => Promise<void>;
  updateShop: (shop: Shop) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  updateShopLicense: (shopId: string, license: ShopLicense) => Promise<void>;
  addStaff: (staff: Omit<StaffMember, 'id'>) => Promise<void>;
  updateStaff: (staff: StaffMember) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
  
  // Helpers
  getOwnerShops: (ownerId: string) => Shop[];
  getShopStaff: (shopId: string) => StaffMember[];
  getShopProducts: (shopId: string) => Product[];
  getShopSales: (shopId: string) => SaleRecord[];
  getOwnerById: (ownerId: string) => Owner | undefined;
  getShopById: (shopId: string) => Shop | undefined;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  
  const [owners, setOwners] = useState<Owner[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  
  const { toast } = useToast();

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  // --- Load data from API ---
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ownersRes, shopsRes, staffRes, productsRes, salesRes] = await Promise.all([
        fetch('/api/owners'),
        fetch('/api/shops'),
        fetch('/api/staff'),
        fetch('/api/products'),
        fetch('/api/sales')
      ]);

      if (ownersRes.ok) {
        const data = await ownersRes.json();
        setOwners(data);
      }
      if (shopsRes.ok) {
        const data = await shopsRes.json();
        setShops(data.map(dbShopToFrontend));
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(data);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.map(dbProductToFrontend));
      }
      if (salesRes.ok) {
        const data = await salesRes.json();
        setSalesHistory(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- Auth ---
  
  const loginOwner = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiRequest('POST', '/api/auth/owner-login', { username, password });
      const owner = await res.json();
      
      const ownerShops = shops.filter(s => s.ownerId === owner.id);
      setCurrentUser({
        type: 'owner',
        id: owner.id,
        name: owner.name,
        username: owner.username,
        role: 'owner',
        ownerId: owner.id
      });
      if (ownerShops.length === 1) {
        setActiveShopId(ownerShops[0].id);
      }
      toast({ title: `Welcome ${owner.name}`, description: "Logged in as Owner" });
      return true;
    } catch (error) {
      toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
      return false;
    }
  };

  const loginStaff = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiRequest('POST', '/api/auth/staff-login', { username, password });
      const { staff: staffMember, shop } = await res.json();
      
      setCurrentUser({
        type: 'staff',
        id: staffMember.id,
        name: staffMember.name,
        username: staffMember.username,
        role: staffMember.role,
        shopId: staffMember.shopId
      });
      setActiveShopId(staffMember.shopId);
      toast({ title: `Welcome ${staffMember.name}`, description: `Logged in as ${staffMember.role}` });
      return true;
    } catch (error: any) {
      const message = error.message?.includes('403') 
        ? "Shop license has expired. Contact administrator."
        : "Invalid credentials";
      toast({ title: "Error", description: message, variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveShopId(null);
    setCart([]);
  };

  const setActiveShop = (shopId: string) => {
    setActiveShopId(shopId);
    setCart([]);
  };

  // --- POS Actions ---

  const addToCart = (product: Product, uom: UoM) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.uomLevel === uom.level);
      if (existing) {
        return prev.map(item => 
          (item.productId === product.id && item.uomLevel === uom.level)
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        uomLevel: uom.level,
        productName: product.name,
        uomName: uom.name,
        quantity: 1,
        price: uom.price,
        subtotal: uom.price
      }];
    });
    toast({ title: "Added to cart", description: `${product.name} (${uom.name})` });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const processSale = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0 || !currentUser || !activeShopId) return;

    try {
      // Update stock for each product
      for (const item of cart) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const uom = prod.uoms.find(u => u.level === item.uomLevel);
          if (uom) {
            const newQuantity = Math.max(0, prod.stockQuantity - (item.quantity * uom.multiplier));
            await apiRequest('PUT', `/api/products/${prod.id}`, {
              stockQuantity: newQuantity
            });
          }
        }
      }

      const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
      
      await apiRequest('POST', '/api/sales', {
        shopId: activeShopId,
        staffId: currentUser.id,
        staffName: currentUser.name,
        totalAmount: totalAmount.toString(),
        paymentMethod,
        itemsCount: cart.length,
        status: 'open'
      });

      toast({ 
        title: "Sale Complete", 
        description: `Processed ${cart.length} items via ${paymentMethod}`,
        className: "bg-green-500 text-white"
      });
      clearCart();
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process sale", variant: "destructive" });
    }
  };

  // --- Inventory Actions ---

  const addProduct = async (newProduct: Omit<Product, 'id' | 'shopId'>) => {
    if (!activeShopId) {
      toast({ title: "Error", description: "No shop selected", variant: "destructive" });
      return;
    }
    try {
      await apiRequest('POST', '/api/products', {
        ...newProduct,
        shopId: activeShopId,
        costPrice: newProduct.costPrice.toString()
      });
      toast({ title: "Product Added", description: newProduct.name });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await apiRequest('PUT', `/api/products/${updatedProduct.id}`, {
        ...updatedProduct,
        costPrice: updatedProduct.costPrice.toString()
      });
      toast({ title: "Product Updated", description: updatedProduct.name });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    }
  };

  const processGRV = async (items: GRVItem[]) => {
    try {
      for (const grvItem of items) {
        const prod = products.find(p => p.id === grvItem.productId);
        if (prod) {
          await apiRequest('PUT', `/api/products/${prod.id}`, {
            stockQuantity: prod.stockQuantity + grvItem.quantityReceived,
            costPrice: grvItem.newCost.toString()
          });
        }
      }
      toast({ title: "GRV Processed", description: "Stock updated successfully" });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process GRV", variant: "destructive" });
    }
  };

  // --- Day End Actions ---

  const cashOutStaff = (staffId: string) => {
    setSalesHistory(prev => prev.map(sale => 
      (sale.staffId === staffId && sale.status === 'open') 
        ? { ...sale, status: 'cashed_out' }
        : sale
    ));
    toast({ title: "Cashed Out", description: "Staff sales reconciled." });
  };
  
  const cashOutUser = cashOutStaff;

  // --- Admin Actions ---

  const addOwner = async (newOwner: Omit<Owner, 'id'>) => {
    try {
      await apiRequest('POST', '/api/owners', newOwner);
      toast({ title: "Owner Added", description: `${newOwner.name} has been added` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add owner", variant: "destructive" });
    }
  };

  const updateOwner = async (updatedOwner: Owner) => {
    try {
      await apiRequest('PUT', `/api/owners/${updatedOwner.id}`, updatedOwner);
      toast({ title: "Owner Updated", description: `${updatedOwner.name} has been updated` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update owner", variant: "destructive" });
    }
  };

  const deleteOwner = async (ownerId: string) => {
    const ownerShops = shops.filter(s => s.ownerId === ownerId);
    if (ownerShops.length > 0) {
      toast({ title: "Error", description: "Cannot delete owner with active shops", variant: "destructive" });
      return;
    }
    try {
      await apiRequest('DELETE', `/api/owners/${ownerId}`);
      toast({ title: "Owner Deleted", description: "Owner has been removed" });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete owner", variant: "destructive" });
    }
  };

  const addShop = async (newShop: Omit<Shop, 'id'>) => {
    try {
      await apiRequest('POST', '/api/shops', frontendShopToDb(newShop));
      toast({ title: "Shop Added", description: `${newShop.name} has been added` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add shop", variant: "destructive" });
    }
  };

  const updateShop = async (updatedShop: Shop) => {
    try {
      await apiRequest('PUT', `/api/shops/${updatedShop.id}`, frontendShopToDb(updatedShop));
      toast({ title: "Shop Updated", description: `${updatedShop.name} has been updated` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update shop", variant: "destructive" });
    }
  };

  const deleteShop = async (shopId: string) => {
    const shopStaff = staff.filter(s => s.shopId === shopId);
    if (shopStaff.length > 0) {
      toast({ title: "Error", description: "Cannot delete shop with staff. Remove staff first.", variant: "destructive" });
      return;
    }
    try {
      await apiRequest('DELETE', `/api/shops/${shopId}`);
      toast({ title: "Shop Deleted", description: "Shop has been removed" });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete shop", variant: "destructive" });
    }
  };

  const updateShopLicense = async (shopId: string, license: ShopLicense) => {
    try {
      await apiRequest('PUT', `/api/shops/${shopId}`, {
        licenseStatus: license.status,
        licenseExpiryDate: license.expiryDate,
        licensePlan: license.plan
      });
      toast({ title: "License Updated", description: `License updated for shop` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update license", variant: "destructive" });
    }
  };

  const addStaff = async (newStaff: Omit<StaffMember, 'id'>) => {
    try {
      await apiRequest('POST', '/api/staff', newStaff);
      toast({ title: "Staff Added", description: `${newStaff.name} has been added` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add staff", variant: "destructive" });
    }
  };

  const updateStaff = async (updatedStaff: StaffMember) => {
    try {
      await apiRequest('PUT', `/api/staff/${updatedStaff.id}`, updatedStaff);
      toast({ title: "Staff Updated", description: `${updatedStaff.name} has been updated` });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update staff", variant: "destructive" });
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      await apiRequest('DELETE', `/api/staff/${staffId}`);
      toast({ title: "Staff Deleted", description: "Staff member has been removed" });
      await refreshData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete staff", variant: "destructive" });
    }
  };

  // --- Helpers ---

  const getOwnerShops = (ownerId: string) => shops.filter(s => s.ownerId === ownerId);
  const getShopStaff = (shopId: string) => staff.filter(s => s.shopId === shopId);
  const getShopProducts = (shopId: string) => products.filter(p => p.shopId === shopId);
  const getShopSales = (shopId: string) => salesHistory.filter(s => s.shopId === shopId);
  const getOwnerById = (ownerId: string) => owners.find(o => o.id === ownerId);
  const getShopById = (shopId: string) => shops.find(s => s.id === shopId);

  return (
    <AppContext.Provider value={{
      currentUser, activeShopId, language, isLoading,
      owners, shops, staff, products, cart, salesHistory,
      loginOwner, loginStaff, logout, setActiveShop,
      setLanguage, t,
      addToCart, removeFromCart, clearCart, processSale,
      addProduct, updateProduct, processGRV,
      cashOutStaff, cashOutUser,
      addOwner, updateOwner, deleteOwner,
      addShop, updateShop, deleteShop, updateShopLicense,
      addStaff, updateStaff, deleteStaff,
      refreshData,
      getOwnerShops, getShopStaff, getShopProducts, getShopSales, getOwnerById, getShopById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


import { Owner, Shop, Staff, Product, User } from "@shared/schema";

// Mock Data derived from server/seed.ts

export const mockOwners: Owner[] = [
  {
    id: "owner-1",
    name: "Abebe Bikila",
    email: "abebe@example.com",
    phone: "+27123456789",
    username: "abebe",
    password: "hashed_password_123", // In a real app, this would be hashed
  },
  {
    id: "owner-2",
    name: "Sammy Johnson",
    email: "sammy@example.com",
    phone: "+27987654321",
    username: "sammy",
    password: "hashed_password_123",
  },
];

export const mockShops: Shop[] = [
  {
    id: "shop-1",
    ownerId: "owner-1",
    name: "Paradise Trust",
    location: "Johannesburg CBD",
    licenseStatus: "active",
    licenseExpiryDate: "2025-12-31",
    licensePlan: "pro",
  },
  {
    id: "shop-2",
    ownerId: "owner-2",
    name: "JJ Supermarket",
    location: "Pretoria East",
    licenseStatus: "active",
    licenseExpiryDate: "2025-10-15",
    licensePlan: "enterprise",
  },
  {
    id: "shop-3",
    ownerId: "owner-2",
    name: "JJ Furniture",
    location: "Pretoria West",
    licenseStatus: "active",
    licenseExpiryDate: "2025-08-20",
    licensePlan: "basic",
  },
];

export const mockStaff: Staff[] = [
  {
    id: "staff-1",
    shopId: "shop-1",
    name: "Sara Tadesse",
    role: "supervisor",
    username: "sara",
    password: "hashed_password_staff",
  },
  {
    id: "staff-2",
    shopId: "shop-1",
    name: "Kebede Mulatu",
    role: "cashier",
    username: "kebede",
    password: "hashed_password_staff",
  },
  {
    id: "staff-3",
    shopId: "shop-2",
    name: "John Smith",
    role: "cashier",
    username: "john",
    password: "hashed_password_staff",
  },
  {
    id: "staff-4",
    shopId: "shop-2",
    name: "Mary Jane",
    role: "cashier",
    username: "mary",
    password: "hashed_password_staff",
  },
  {
    id: "staff-5",
    shopId: "shop-3",
    name: "Peter Parker",
    role: "cashier",
    username: "peter",
    password: "hashed_password_staff",
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    shopId: "shop-1",
    name: "Coca Cola",
    category: "Beverages",
    costPrice: "15.00",
    stockQuantity: 150,
    lowStockThreshold: 24,
    uoms: [
      { level: 1, name: "Bottle 500ml", multiplier: 1, barcode: "111001", price: 25.0 },
      { level: 2, name: "6-Pack", multiplier: 6, barcode: "111006", price: 140.0 },
      { level: 3, name: "Crate (24)", multiplier: 24, barcode: "111024", price: 550.0 },
    ],
  },
  {
    id: "prod-2",
    shopId: "shop-1",
    name: "Ambo Water",
    category: "Beverages",
    costPrice: "12.00",
    stockQuantity: 45,
    lowStockThreshold: 10,
    uoms: [
      { level: 1, name: "Bottle", multiplier: 1, barcode: "222001", price: 20.0 },
    ],
  },
  {
    id: "prod-3",
    shopId: "shop-2",
    name: "Bread (Dabo)",
    category: "Bakery",
    costPrice: "8.00",
    stockQuantity: 30,
    lowStockThreshold: 5,
    uoms: [
      { level: 1, name: "Loaf", multiplier: 1, barcode: "333001", price: 15.0 },
    ],
  },
];

export const mockUsers: User[] = [
    {
        id: "sysadmin-1",
        username: "sysadmin",
        password: "hashed_password_admin"
    }
];

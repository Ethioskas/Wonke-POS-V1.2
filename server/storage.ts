import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  owners, shops, staff, products, sales,
  type Owner, type InsertOwner,
  type Shop, type InsertShop,
  type Staff, type InsertStaff,
  type Product, type InsertProduct,
  type Sale, type InsertSale
} from "@shared/schema";

export const storage = {
  // Owners
  async getAllOwners(): Promise<Owner[]> {
    return await db.select().from(owners);
  },

  async getOwnerById(id: string): Promise<Owner | undefined> {
    const result = await db.select().from(owners).where(eq(owners.id, id));
    return result[0];
  },

  async getOwnerByUsername(username: string): Promise<Owner | undefined> {
    const result = await db.select().from(owners).where(eq(owners.username, username));
    return result[0];
  },

  async createOwner(data: InsertOwner): Promise<Owner> {
    try {
      const result = await db.insert(owners).values(data).returning();
      return result[0];
    } catch (error: any) {
      console.error("DB error in createOwner:", {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint,
        stack: error?.stack,
        input: data,
      });
      throw error;
    }
  },

  async updateOwner(id: string, data: Partial<InsertOwner>): Promise<Owner | undefined> {
    const result = await db.update(owners).set(data).where(eq(owners.id, id)).returning();
    return result[0];
  },

  async deleteOwner(id: string): Promise<boolean> {
    const result = await db.delete(owners).where(eq(owners.id, id)).returning();
    return result.length > 0;
  },

  // Shops
  async getAllShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  },

  async getShopById(id: string): Promise<Shop | undefined> {
    const result = await db.select().from(shops).where(eq(shops.id, id));
    return result[0];
  },

  async getShopsByOwnerId(ownerId: string): Promise<Shop[]> {
    return await db.select().from(shops).where(eq(shops.ownerId, ownerId));
  },

  async createShop(data: InsertShop): Promise<Shop> {
    const result = await db.insert(shops).values(data).returning();
    return result[0];
  },

  async updateShop(id: string, data: Partial<InsertShop>): Promise<Shop | undefined> {
    const result = await db.update(shops).set(data).where(eq(shops.id, id)).returning();
    return result[0];
  },

  async deleteShop(id: string): Promise<boolean> {
    const result = await db.delete(shops).where(eq(shops.id, id)).returning();
    return result.length > 0;
  },

  // Staff
  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  },

  async getStaffById(id: string): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.id, id));
    return result[0];
  },

  async getStaffByShopId(shopId: string): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.shopId, shopId));
  },

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.username, username));
    return result[0];
  },

  async createStaff(data: InsertStaff): Promise<Staff> {
    const result = await db.insert(staff).values(data).returning();
    return result[0];
  },

  async updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff | undefined> {
    const result = await db.update(staff).set(data).where(eq(staff.id, id)).returning();
    return result[0];
  },

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id)).returning();
    return result.length > 0;
  },

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  },

  async getProductsByShopId(shopId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  },

  async createProduct(data: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  },

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return result[0];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  },

  // Sales
  async getAllSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  },

  async getSalesByShopId(shopId: string): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.shopId, shopId));
  },

  async createSale(data: InsertSale): Promise<Sale> {
    const result = await db.insert(sales).values(data).returning();
    return result[0];
  },

  async updateSale(id: string, data: Partial<InsertSale>): Promise<Sale | undefined> {
    const result = await db.update(sales).set(data).where(eq(sales.id, id)).returning();
    return result[0];
  },
};

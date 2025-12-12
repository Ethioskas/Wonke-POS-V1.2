import { db } from "./db";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

export async function initializeDatabase() {
  console.log("[db-init] Checking database tables...");
  
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'owners'
      )
    `);
    
    const tableExists = result.rows[0]?.exists === true;
    
    if (tableExists) {
      console.log("[db-init] Tables already exist, skipping initialization");
      return;
    }
    
    console.log("[db-init] Creating database tables...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS owners (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR NOT NULL,
        username VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL
      )
    `);
    console.log("[db-init] Created owners table");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id VARCHAR NOT NULL REFERENCES owners(id),
        name VARCHAR NOT NULL,
        location VARCHAR NOT NULL,
        license_status VARCHAR DEFAULT 'active',
        license_expiry_date VARCHAR,
        license_plan VARCHAR DEFAULT 'basic'
      )
    `);
    console.log("[db-init] Created shops table");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id VARCHAR NOT NULL REFERENCES shops(id),
        name VARCHAR NOT NULL,
        role VARCHAR DEFAULT 'cashier',
        username VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL
      )
    `);
    console.log("[db-init] Created staff table");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id VARCHAR NOT NULL REFERENCES shops(id),
        name VARCHAR NOT NULL,
        category VARCHAR,
        cost_price VARCHAR,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        uoms JSONB DEFAULT '[]'
      )
    `);
    console.log("[db-init] Created products table");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_id VARCHAR NOT NULL REFERENCES shops(id),
        staff_id VARCHAR REFERENCES staff(id),
        items JSONB DEFAULT '[]',
        subtotal VARCHAR,
        discount VARCHAR DEFAULT '0',
        total VARCHAR,
        payment_method VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("[db-init] Created sales table");
    
    console.log("[db-init] All tables created successfully!");
    
  } catch (error) {
    console.error("[db-init] Error initializing database:", error);
    throw error;
  }
}

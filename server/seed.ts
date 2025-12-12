import { db } from "./db";
import { owners, shops, staff, products } from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function seedDatabase() {
  try {
    console.log("Checking if database already has owners...");
    const existingOwners = await db.select().from(owners).limit(1);
    if (existingOwners.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with demo data...");

    console.log("Hashing demo passwords...");
    const ownerPassword = await hashPassword("owner123");
    const staffPassword = await hashPassword("staff123");

    console.log("Inserting demo owners...");
    const [abebe] = await db.insert(owners).values({
      name: "Abebe Bikila",
      email: "abebe@example.com",
      phone: "+27123456789",
      username: "abebe",
      password: ownerPassword,
    }).returning();

    console.log(`Inserted owner 'abebe' with id=${abebe.id}`);

    const [sammy] = await db.insert(owners).values({
      name: "Sammy Johnson",
      email: "sammy@example.com",
      phone: "+27987654321",
      username: "sammy",
      password: ownerPassword,
    }).returning();

    console.log(`Inserted owner 'sammy' with id=${sammy.id}`);

    console.log("Inserting demo shops...");
    const [paradiseTrust] = await db.insert(shops).values({
      ownerId: abebe.id,
      name: "Paradise Trust",
      location: "Johannesburg CBD",
      licenseStatus: "active",
      licenseExpiryDate: "2025-12-31",
      licensePlan: "pro",
    }).returning();

    console.log(`Inserted shop 'Paradise Trust' with id=${paradiseTrust.id}`);

    const [jjSupermarket] = await db.insert(shops).values({
      ownerId: sammy.id,
      name: "JJ Supermarket",
      location: "Pretoria East",
      licenseStatus: "active",
      licenseExpiryDate: "2025-10-15",
      licensePlan: "enterprise",
    }).returning();

    console.log(`Inserted shop 'JJ Supermarket' with id=${jjSupermarket.id}`);

    const [jjFurniture] = await db.insert(shops).values({
      ownerId: sammy.id,
      name: "JJ Furniture",
      location: "Pretoria West",
      licenseStatus: "active",
      licenseExpiryDate: "2025-08-20",
      licensePlan: "basic",
    }).returning();

    console.log(`Inserted shop 'JJ Furniture' with id=${jjFurniture.id}`);

    console.log("Inserting demo staff records...");
    const insertedStaff = await db.insert(staff).values([
      {
        shopId: paradiseTrust.id,
        name: "Sara Tadesse",
        role: "supervisor",
        username: "sara",
        password: staffPassword,
      },
      {
        shopId: paradiseTrust.id,
        name: "Kebede Mulatu",
        role: "cashier",
        username: "kebede",
        password: staffPassword,
      },
      {
        shopId: jjSupermarket.id,
        name: "John Smith",
        role: "cashier",
        username: "john",
        password: staffPassword,
      },
      {
        shopId: jjSupermarket.id,
        name: "Mary Jane",
        role: "cashier",
        username: "mary",
        password: staffPassword,
      },
      {
        shopId: jjFurniture.id,
        name: "Peter Parker",
        role: "cashier",
        username: "peter",
        password: staffPassword,
      },
    ]).returning();

    console.log(`Inserted ${insertedStaff.length} staff records.`);

    console.log("Inserting demo products...");
    const insertedProducts = await db.insert(products).values([
      {
        shopId: paradiseTrust.id,
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
        shopId: paradiseTrust.id,
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
        shopId: jjSupermarket.id,
        name: "Bread (Dabo)",
        category: "Bakery",
        costPrice: "8.00",
        stockQuantity: 30,
        lowStockThreshold: 5,
        uoms: [
          { level: 1, name: "Loaf", multiplier: 1, barcode: "333001", price: 15.0 },
        ],
      },
    ]).returning();

    console.log(`Inserted ${insertedProducts.length} product records.`);

    console.log("Database seeded successfully!");
    console.log("Demo Credentials:");
    console.log("  System Admin: sysadmin / admin2024");
    console.log("  Owner (Abebe): abebe / owner123");
    console.log("  Owner (Sammy): sammy / owner123");
    console.log("  Supervisor: sara / staff123");
    console.log("  Cashier: kebede / staff123");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

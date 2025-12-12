import { Pool } from "pg";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

console.log("[db] Starting database initialization...");

// Load .env when present so local DATABASE_URL can be provided via a file
dotenv.config();

function maskDatabaseUrl(url?: string) {
  if (!url) return undefined;
  try {
    return url.replace(/:(.*)@/, ":****@");
  } catch {
    return undefined;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("[db] ERROR: DATABASE_URL is not set!");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const masked = maskDatabaseUrl(process.env.DATABASE_URL);
console.log(`[db] Using DATABASE_URL=${masked ?? "(masked)"}`);

// Determine if SSL is needed based on the connection string
const isLocalDb = process.env.DATABASE_URL.includes('localhost') || 
                  process.env.DATABASE_URL.includes('127.0.0.1') ||
                  process.env.DATABASE_URL.includes('sslmode=disable');

const poolConfig: any = { 
  connectionString: process.env.DATABASE_URL,
};

// Only use SSL for remote databases
if (!isLocalDb) {
  poolConfig.ssl = { rejectUnauthorized: false };
  console.log("[db] SSL enabled for remote database");
} else {
  console.log("[db] SSL disabled for local database");
}

const pool = new Pool(poolConfig);
console.log("[db] Database pool created");

export const db = drizzle(pool, { schema });
console.log("[db] Drizzle ORM initialized");

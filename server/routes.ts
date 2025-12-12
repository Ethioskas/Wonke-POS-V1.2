import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // If password is not hashed (legacy), compare directly
  if (!hash.startsWith('$2')) {
    return password === hash;
  }
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint for Render
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==================== OWNERS ====================
  app.get("/api/owners", async (_req, res) => {
    try {
      const owners = await storage.getAllOwners();
      res.json(owners);
    } catch (error) {
      console.error("Error fetching owners:", error);
      res.status(500).json({ error: "Failed to fetch owners", details: String(error) });
    }
  });

  app.get("/api/owners/:id", async (req, res) => {
    try {
      const owner = await storage.getOwnerById(req.params.id);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }
      res.json(owner);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner" });
    }
  });

  app.post("/api/owners", async (req, res) => {
    try {
      console.log("Creating owner with data:", JSON.stringify(req.body));

      // Basic validation to return helpful errors instead of a DB 500
      const { name, email, phone, username, password } = req.body || {};
      if (!name || !email || !phone || !username || !password) {
        return res.status(400).json({ error: "Missing required owner fields: name, email, phone, username, password" });
      }

      // Check for existing username to provide a 409 instead of DB unique-constraint 500
      const existing = await storage.getOwnerByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const owner = await storage.createOwner({ ...req.body, password: hashedPassword });
      res.status(201).json(owner);
    } catch (error) {
      console.error("Error creating owner:", error);
      res.status(500).json({ error: "Failed to create owner", details: String(error) });
    }
  });

  app.put("/api/owners/:id", async (req, res) => {
    try {
      const owner = await storage.updateOwner(req.params.id, req.body);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }
      res.json(owner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update owner" });
    }
  });

  app.delete("/api/owners/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOwner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Owner not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete owner" });
    }
  });

  // ==================== SHOPS ====================
  app.get("/api/shops", async (_req, res) => {
    try {
      const shops = await storage.getAllShops();
      res.json(shops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });

  app.get("/api/shops/:id", async (req, res) => {
    try {
      const shop = await storage.getShopById(req.params.id);
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }
      res.json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop" });
    }
  });

  app.get("/api/owners/:ownerId/shops", async (req, res) => {
    try {
      const shops = await storage.getShopsByOwnerId(req.params.ownerId);
      res.json(shops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });

  app.post("/api/shops", async (req, res) => {
    try {
      const shop = await storage.createShop(req.body);
      res.status(201).json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to create shop" });
    }
  });

  app.put("/api/shops/:id", async (req, res) => {
    try {
      const shop = await storage.updateShop(req.params.id, req.body);
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }
      res.json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to update shop" });
    }
  });

  app.delete("/api/shops/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteShop(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Shop not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete shop" });
    }
  });

  // ==================== STAFF ====================
  app.get("/api/staff", async (_req, res) => {
    try {
      const allStaff = await storage.getAllStaff();
      res.json(allStaff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await storage.getStaffById(req.params.id);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/shops/:shopId/staff", async (req, res) => {
    try {
      const shopStaff = await storage.getStaffByShopId(req.params.shopId);
      res.json(shopStaff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const hashedPassword = await hashPassword(req.body.password);
      const staffMember = await storage.createStaff({ ...req.body, password: hashedPassword });
      res.status(201).json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to create staff" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await storage.updateStaff(req.params.id, req.body);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStaff(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff" });
    }
  });

  // ==================== PRODUCTS ====================
  app.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/shops/:shopId/products", async (req, res) => {
    try {
      const shopProducts = await storage.getProductsByShopId(req.params.shopId);
      res.json(shopProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // ==================== SALES ====================
  app.get("/api/sales", async (_req, res) => {
    try {
      const allSales = await storage.getAllSales();
      res.json(allSales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.get("/api/shops/:shopId/sales", async (req, res) => {
    try {
      const shopSales = await storage.getSalesByShopId(req.params.shopId);
      res.json(shopSales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.updateSale(req.params.id, req.body);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sale" });
    }
  });

  // ==================== AUTH ====================
  app.post("/api/auth/owner-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const owner = await storage.getOwnerByUsername(username);
      if (!owner) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValid = await verifyPassword(password, owner.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json(owner);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/staff-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const staffMember = await storage.getStaffByUsername(username);
      if (!staffMember) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValid = await verifyPassword(password, staffMember.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const shop = await storage.getShopById(staffMember.shopId);
      if (shop?.licenseStatus === "expired") {
        return res.status(403).json({ error: "Shop license has expired" });
      }
      res.json({ staff: staffMember, shop });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBuyerPreferenceSchema, insertPropertySchema, insertContactRequestSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============ OBJECT STORAGE ROUTES ============

  // Get upload URL for files
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Normalize object path
  app.post("/api/objects/normalize", async (req, res) => {
    try {
      const { rawPath } = req.body;
      if (!rawPath) {
        return res.status(400).json({ error: "rawPath is required" });
      }
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(rawPath);
      res.json({ objectPath });
    } catch (error: any) {
      console.error("Error normalizing path:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // ============ AUTH ROUTES ============

  // Simple login with phone/password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({ error: "رقم الجوال وكلمة المرور مطلوبان" });
      }

      // Find user by phone (password is the phone number)
      const user = await storage.getUserByPhone(phone);
      
      if (!user) {
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      }

      // Simple password check (password = phone number)
      if (password !== phone) {
        return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
      }

      res.json({ user });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ BUYER ROUTES ============

  // Register buyer wish (creates user + preference)
  app.post("/api/buyers/register", async (req, res) => {
    try {
      const { name, email, phone, city, districts, propertyType, rooms, area, budgetMin, budgetMax, paymentMethod, purpose } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
      }
      if (!phone || typeof phone !== "string" || phone.length < 10) {
        return res.status(400).json({ error: "رقم الجوال مطلوب" });
      }
      if (!city || typeof city !== "string") {
        return res.status(400).json({ error: "المدينة مطلوبة" });
      }
      if (!propertyType || typeof propertyType !== "string") {
        return res.status(400).json({ error: "نوع العقار مطلوب" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "buyer",
        });
      }

      // Parse budget values safely
      const parsedBudgetMin = budgetMin ? parseInt(String(budgetMin), 10) : null;
      const parsedBudgetMax = budgetMax ? parseInt(String(budgetMax), 10) : null;

      // Create preference
      const preference = await storage.createBuyerPreference({
        userId: user.id,
        city,
        districts: Array.isArray(districts) ? districts : [],
        propertyType,
        rooms: rooms || null,
        area: area || null,
        budgetMin: isNaN(parsedBudgetMin!) ? null : parsedBudgetMin,
        budgetMax: isNaN(parsedBudgetMax!) ? null : parsedBudgetMax,
        paymentMethod: paymentMethod || null,
        purpose: purpose || null,
        isActive: true,
      });

      // Find matches for this preference
      await storage.findMatchesForPreference(preference.id);

      res.json({ success: true, user, preference });
    } catch (error: any) {
      console.error("Error registering buyer:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get buyer's preferences
  app.get("/api/buyers/:userId/preferences", async (req, res) => {
    try {
      const preferences = await storage.getBuyerPreferencesByUser(req.params.userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get matches for a preference
  app.get("/api/buyers/preferences/:prefId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByBuyerPreference(req.params.prefId);
      
      // Enrich with property details
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const property = match.propertyId ? await storage.getProperty(match.propertyId) : null;
          return { ...match, property };
        })
      );
      
      res.json(enrichedMatches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save/unsave a match
  app.patch("/api/matches/:matchId/save", async (req, res) => {
    try {
      const { isSaved } = req.body;
      const match = await storage.updateMatch(req.params.matchId, { isSaved });
      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PREFERENCE CRUD ROUTES ============

  // Create new preference
  app.post("/api/preferences", async (req, res) => {
    try {
      const { userId, city, districts, propertyType, rooms, area, budgetMin, budgetMax, paymentMethod, purpose, isActive } = req.body;
      
      if (!userId || !city || !propertyType) {
        return res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      }

      const preference = await storage.createBuyerPreference({
        userId,
        city,
        districts: Array.isArray(districts) ? districts : [],
        propertyType,
        rooms: rooms || null,
        area: area || null,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        paymentMethod: paymentMethod || null,
        purpose: purpose || null,
        isActive: isActive !== false,
      });

      await storage.findMatchesForPreference(preference.id);
      res.json(preference);
    } catch (error: any) {
      console.error("Error creating preference:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update preference
  app.patch("/api/preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { city, districts, propertyType, rooms, area, budgetMin, budgetMax, paymentMethod, purpose, isActive } = req.body;

      const preference = await storage.updateBuyerPreference(id, {
        city,
        districts,
        propertyType,
        rooms,
        area,
        budgetMin,
        budgetMax,
        paymentMethod,
        purpose,
        isActive,
      });

      if (!preference) {
        return res.status(404).json({ error: "الرغبة غير موجودة" });
      }

      res.json(preference);
    } catch (error: any) {
      console.error("Error updating preference:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete preference
  app.delete("/api/preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBuyerPreference(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting preference:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SELLER ROUTES ============

  // Register seller and add property
  app.post("/api/sellers/register", async (req, res) => {
    try {
      const { name, email, phone, accountType, entityName, propertyType, city, district, price, area, rooms, description, status, images, latitude, longitude } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
      }
      if (!phone || typeof phone !== "string" || phone.length < 10) {
        return res.status(400).json({ error: "رقم الجوال مطلوب" });
      }
      if (!city || typeof city !== "string") {
        return res.status(400).json({ error: "المدينة مطلوبة" });
      }
      if (!district || typeof district !== "string") {
        return res.status(400).json({ error: "الحي مطلوب" });
      }
      if (!propertyType || typeof propertyType !== "string") {
        return res.status(400).json({ error: "نوع العقار مطلوب" });
      }
      if (!price) {
        return res.status(400).json({ error: "السعر مطلوب" });
      }

      // Parse price safely
      const parsedPrice = parseInt(String(price), 10);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: "السعر غير صحيح" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "seller",
          accountType: accountType || null,
          entityName: entityName || null,
        });
      }

      // Create property
      const property = await storage.createProperty({
        sellerId: user.id,
        propertyType,
        city,
        district,
        price: parsedPrice,
        area: area || null,
        rooms: rooms || null,
        description: description || null,
        status: status || "ready",
        images: Array.isArray(images) ? images : [],
        isActive: true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });

      // Find matches for this property
      await storage.findMatchesForProperty(property.id);

      res.json({ success: true, user, property });
    } catch (error: any) {
      console.error("Error registering seller:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get seller's properties
  app.get("/api/sellers/:sellerId/properties", async (req, res) => {
    try {
      const properties = await storage.getPropertiesBySeller(req.params.sellerId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get interested buyers for a property
  app.get("/api/properties/:propertyId/interested", async (req, res) => {
    try {
      const matches = await storage.getMatchesByProperty(req.params.propertyId);
      res.json({ count: matches.length, matches });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PROPERTY ROUTES ============

  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single property
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      await storage.incrementPropertyViews(req.params.id);
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update property
  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.updateProperty(req.params.id, req.body);
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create property
  app.post("/api/properties", async (req, res) => {
    try {
      const { sellerId, propertyType, city, district, price, area, rooms, description, status, images, isActive, latitude, longitude } = req.body;
      
      if (!sellerId || !propertyType || !city || !district || !price) {
        return res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      }

      const property = await storage.createProperty({
        sellerId,
        propertyType,
        city,
        district,
        price: parseInt(String(price), 10),
        area: area || null,
        rooms: rooms || null,
        description: description || null,
        status: status || "ready",
        images: Array.isArray(images) ? images : [],
        isActive: isActive !== false,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });

      await storage.findMatchesForProperty(property.id);
      res.json(property);
    } catch (error: any) {
      console.error("Error creating property:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete property
  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProperty(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting property:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CONTACT ROUTES ============

  // Create contact request
  app.post("/api/contact-requests", async (req, res) => {
    try {
      const request = await storage.createContactRequest(req.body);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getUsers(role);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all buyer preferences
  app.get("/api/admin/preferences", async (req, res) => {
    try {
      const preferences = await storage.getAllBuyerPreferences();
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics: Top districts
  app.get("/api/admin/analytics/top-districts", async (req, res) => {
    try {
      const city = (req.query.city as string) || "جدة";
      const topDistricts = await storage.getTopDistricts(city);
      res.json(topDistricts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics: Average budget by city
  app.get("/api/admin/analytics/budget-by-city", async (req, res) => {
    try {
      const data = await storage.getAverageBudgetByCity();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics: Demand by property type
  app.get("/api/admin/analytics/demand-by-type", async (req, res) => {
    try {
      const data = await storage.getDemandByPropertyType();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const buyers = await storage.getUsers("buyer");
      const sellers = await storage.getUsers("seller");
      const properties = await storage.getAllProperties();
      const preferences = await storage.getAllBuyerPreferences();
      const matches = await storage.getAllMatches();
      const contacts = await storage.getAllContactRequests();

      res.json({
        totalBuyers: buyers.length,
        totalSellers: sellers.length,
        totalProperties: properties.length,
        totalPreferences: preferences.length,
        totalMatches: matches.length,
        totalContacts: contacts.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all matches
  app.get("/api/admin/matches", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all contact requests
  app.get("/api/admin/contact-requests", async (req, res) => {
    try {
      const requests = await storage.getAllContactRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

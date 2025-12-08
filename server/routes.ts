import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBuyerPreferenceSchema, insertPropertySchema, insertContactRequestSchema, insertSendLogSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { analyzeIntakeWithAI, transcribeAudio } from "./ai-service";

// WhatsApp API Integration Point - Replace with actual implementation
async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; response?: string; error?: string }> {
  // TODO: Integrate with WhatsApp Business API
  // For now, simulate success for testing
  console.log(`[WhatsApp] Sending to ${phone}:`, message);
  return { success: true, response: "simulated_success" };
}

// Format property for WhatsApp message
function formatPropertyMessage(property: { city: string; district: string; propertyType: string; price: number; id: string }): string {
  const typeNames: Record<string, string> = {
    apartment: "شقة",
    villa: "فيلا",
    land: "أرض",
    building: "عمارة",
  };
  const formattedPrice = property.price >= 1000000 
    ? `${(property.price / 1000000).toFixed(1)} مليون` 
    : `${(property.price / 1000).toFixed(0)} ألف`;
  
  return `- ${typeNames[property.propertyType] || property.propertyType} في ${property.district}، ${property.city}\n  السعر: ${formattedPrice} ريال`;
}

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

  // ============ AI INTAKE ANALYSIS ============

  // Analyze text input with AI
  app.post("/api/intake/analyze", async (req, res) => {
    try {
      const { text, context } = req.body;
      
      if (!text || typeof text !== "string" || text.trim().length < 2) {
        return res.status(400).json({ error: "يرجى كتابة رسالة" });
      }

      const result = await analyzeIntakeWithAI(text, context);
      res.json(result);
    } catch (error: any) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "فشل في تحليل النص" });
    }
  });

  // Transcribe voice message with AI
  app.post("/api/intake/transcribe", async (req, res) => {
    try {
      // Get raw audio data from request body
      const chunks: Buffer[] = [];
      
      req.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on("end", async () => {
        const audioBuffer = Buffer.concat(chunks);
        
        if (audioBuffer.length === 0) {
          return res.status(400).json({ error: "لم يتم استلام الصوت" });
        }
        
        const mimeType = req.headers["content-type"] || "audio/webm";
        const result = await transcribeAudio(audioBuffer, mimeType);
        
        if (result.success) {
          res.json({ success: true, text: result.text });
        } else {
          res.status(500).json({ success: false, error: result.error });
        }
      });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "فشل في تحويل الصوت" });
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

  // ============ INVESTOR ROUTES ============

  // Register investor
  app.post("/api/investors/register", async (req, res) => {
    try {
      const { name, email, phone, cities, investmentTypes, budgetMin, budgetMax, returnPreference } = req.body;

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

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "investor",
          accountType: null,
          entityName: null,
        });
      }

      res.json({ 
        success: true, 
        user,
        investmentPreferences: {
          cities,
          investmentTypes,
          budgetMin,
          budgetMax,
          returnPreference
        }
      });
    } catch (error: any) {
      console.error("Error registering investor:", error);
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

  // Get single property with seller info
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      await storage.incrementPropertyViews(req.params.id);
      
      // Include seller info with verification details
      let seller = null;
      if (property.sellerId) {
        const sellerData = await storage.getUser(property.sellerId);
        if (sellerData) {
          seller = {
            id: sellerData.id,
            name: sellerData.name,
            phone: sellerData.phone,
            accountType: sellerData.accountType,
            entityName: sellerData.entityName,
            isVerified: sellerData.isVerified,
            verificationStatus: sellerData.verificationStatus,
            falLicenseNumber: sellerData.falLicenseNumber,
            adLicenseNumber: sellerData.adLicenseNumber,
            licenseIssueDate: sellerData.licenseIssueDate,
            licenseExpiryDate: sellerData.licenseExpiryDate,
            commercialRegNumber: sellerData.commercialRegNumber,
            city: sellerData.city,
            whatsappNumber: sellerData.whatsappNumber,
          };
        }
      }
      
      res.json({ ...property, seller });
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

  // ============ CONVERSATION ROUTES ============

  // Get conversations for a user
  app.get("/api/conversations", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const convs = await storage.getConversationsByUser(userId);
      
      // Enrich with property and participant info
      const enrichedConvs = await Promise.all(convs.map(async (conv) => {
        const property = await storage.getProperty(conv.propertyId);
        const buyer = await storage.getUser(conv.buyerId);
        const seller = await storage.getUser(conv.sellerId);
        
        return {
          ...conv,
          property: property ? {
            id: property.id,
            propertyType: property.propertyType,
            city: property.city,
            district: property.district,
            price: property.price,
            images: property.images,
          } : null,
          buyer: buyer ? { id: buyer.id, name: buyer.name, phone: buyer.phone } : null,
          seller: seller ? { id: seller.id, name: seller.name, phone: seller.phone, entityName: seller.entityName } : null,
        };
      }));
      
      res.json(enrichedConvs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conv = await storage.getConversation(req.params.id);
      if (!conv) {
        return res.status(404).json({ error: "المحادثة غير موجودة" });
      }
      
      const messages = await storage.getMessagesByConversation(conv.id);
      const property = await storage.getProperty(conv.propertyId);
      const buyer = await storage.getUser(conv.buyerId);
      const seller = await storage.getUser(conv.sellerId);
      
      res.json({
        ...conv,
        messages,
        property: property ? {
          id: property.id,
          propertyType: property.propertyType,
          city: property.city,
          district: property.district,
          price: property.price,
          images: property.images,
        } : null,
        buyer: buyer ? { id: buyer.id, name: buyer.name, phone: buyer.phone } : null,
        seller: seller ? { id: seller.id, name: seller.name, phone: seller.phone, entityName: seller.entityName } : null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create or get existing conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const { buyerId, sellerId, propertyId } = req.body;
      
      if (!buyerId || !sellerId || !propertyId) {
        return res.status(400).json({ error: "buyerId, sellerId, and propertyId are required" });
      }
      
      // Check if conversation already exists
      let conv = await storage.getConversationByParticipants(buyerId, sellerId, propertyId);
      
      if (!conv) {
        conv = await storage.createConversation({
          buyerId,
          sellerId,
          propertyId,
          buyerUnreadCount: 0,
          sellerUnreadCount: 0,
          isActive: true,
        });
      }
      
      res.json(conv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark conversation as read
  app.post("/api/conversations/:id/read", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      await storage.markConversationAsRead(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MESSAGE ROUTES ============

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const { conversationId, senderId, content, messageType, attachments } = req.body;
      
      if (!conversationId || !senderId || !content) {
        return res.status(400).json({ error: "conversationId, senderId, and content are required" });
      }
      
      const message = await storage.createMessage({
        conversationId,
        senderId,
        content,
        messageType: messageType || "text",
        attachments: attachments || [],
        isRead: false,
      });
      
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get messages for a conversation (polling endpoint)
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
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

  // ============ MATCHING & SENDING ROUTES ============

  // Get all clients with their preferences for admin dashboard (including inactive)
  app.get("/api/admin/clients", async (req, res) => {
    try {
      const preferences = await storage.getAllBuyerPreferencesForAdmin();
      const users = await storage.getUsers("buyer");
      
      // Join preferences with user data
      const clients = await Promise.all(preferences.map(async (pref) => {
        const user = users.find(u => u.id === pref.userId);
        return {
          ...pref,
          userName: user?.name || "غير معروف",
          userPhone: user?.phone || "",
          userEmail: user?.email || "",
        };
      }));
      
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get send logs
  app.get("/api/admin/send-logs", async (req, res) => {
    try {
      const logs = await storage.getSendLogs();
      
      // Enrich with user and property data
      const enrichedLogs = await Promise.all(logs.map(async (log) => {
        const user = log.userId ? await storage.getUser(log.userId) : null;
        const preference = log.preferenceId ? await storage.getBuyerPreference(log.preferenceId) : null;
        
        // Get property details (use admin method to include inactive properties)
        const propertyDetails = await Promise.all(
          (log.propertyIds || []).map(async (id) => {
            const prop = await storage.getPropertyForAdmin(id);
            return prop ? { id, city: prop.city, district: prop.district, price: prop.price } : null;
          })
        );
        
        return {
          ...log,
          userName: user?.name || "غير معروف",
          userPhone: user?.phone || "",
          preferenceCity: preference?.city || "",
          propertyDetails: propertyDetails.filter(Boolean),
        };
      }));
      
      res.json(enrichedLogs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Find matching properties for a specific client preference (excluding previously sent)
  app.get("/api/admin/clients/:preferenceId/matches", async (req, res) => {
    try {
      const { preferenceId } = req.params;
      const preference = await storage.getBuyerPreference(preferenceId);
      
      if (!preference) {
        return res.status(404).json({ error: "الرغبة غير موجودة" });
      }

      // Get all available properties
      const allProperties = await storage.getAllProperties();
      
      // Get previously sent property IDs
      const sentPropertyIds = await storage.getPropertyIdsSentToPreference(preferenceId);
      
      // Filter matching properties
      const matchingProperties = allProperties.filter(prop => {
        // Must be same city
        if (prop.city !== preference.city) return false;
        
        // District must be in preferred list (if specified)
        if (preference.districts && preference.districts.length > 0) {
          if (!preference.districts.includes(prop.district)) return false;
        }
        
        // Property type must match
        if (prop.propertyType !== preference.propertyType) return false;
        
        // Price must be within budget
        if (preference.budgetMin && prop.price < preference.budgetMin) return false;
        if (preference.budgetMax && prop.price > preference.budgetMax) return false;
        
        // Must not have been sent before
        if (sentPropertyIds.includes(prop.id)) return false;
        
        // Must be active
        if (!prop.isActive) return false;
        
        return true;
      });
      
      res.json({
        preference,
        matchingProperties,
        totalMatches: matchingProperties.length,
        previouslySent: sentPropertyIds.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send matches to a specific client (manual send)
  app.post("/api/admin/clients/:preferenceId/send", async (req, res) => {
    try {
      const { preferenceId } = req.params;
      const { maxProperties = 5 } = req.body;
      
      const preference = await storage.getBuyerPreference(preferenceId);
      if (!preference) {
        return res.status(404).json({ error: "الرغبة غير موجودة" });
      }
      
      const user = preference.userId ? await storage.getUser(preference.userId) : null;
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Get matching properties
      const allProperties = await storage.getAllProperties();
      const sentPropertyIds = await storage.getPropertyIdsSentToPreference(preferenceId);
      
      const matchingProperties = allProperties.filter(prop => {
        if (prop.city !== preference.city) return false;
        if (preference.districts && preference.districts.length > 0) {
          if (!preference.districts.includes(prop.district)) return false;
        }
        if (prop.propertyType !== preference.propertyType) return false;
        if (preference.budgetMin && prop.price < preference.budgetMin) return false;
        if (preference.budgetMax && prop.price > preference.budgetMax) return false;
        if (sentPropertyIds.includes(prop.id)) return false;
        if (!prop.isActive) return false;
        return true;
      }).slice(0, maxProperties);

      // Prepare message
      let message: string;
      let messageType: "matches" | "no_matches";
      
      if (matchingProperties.length > 0) {
        const propertyList = matchingProperties.map(p => formatPropertyMessage(p)).join("\n\n");
        message = `مرحباً ${user.name}،\n\nوجدنا لك ${matchingProperties.length} عقارات تناسب تفضيلاتك:\n\n${propertyList}\n\nتواصل معنا للمزيد من التفاصيل.\nتطابق - منصة العقارات الذكية`;
        messageType = "matches";
      } else {
        message = `مرحباً ${user.name}،\n\nللأسف لا توجد عقارات جديدة تناسب تفضيلاتك حالياً.\nسنرسل لك إشعاراً فور توفر عقارات مناسبة.\n\nتطابق - منصة العقارات الذكية`;
        messageType = "no_matches";
      }

      // Send via WhatsApp
      const whatsappResult = await sendWhatsAppMessage(user.phone, message);

      // Create send log
      const sendLog = await storage.createSendLog({
        preferenceId,
        userId: user.id,
        propertyIds: matchingProperties.map(p => p.id),
        messageType,
        status: whatsappResult.success ? "sent" : "failed",
        whatsappResponse: whatsappResult.response || whatsappResult.error,
      });

      res.json({
        success: whatsappResult.success,
        sendLog,
        propertiesSent: matchingProperties.length,
        message: whatsappResult.success 
          ? `تم إرسال ${matchingProperties.length} عقارات إلى ${user.name}` 
          : "فشل في الإرسال",
      });
    } catch (error: any) {
      console.error("Error sending matches:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send to all active clients (bulk send)
  app.post("/api/admin/send-all", async (req, res) => {
    try {
      const { maxPropertiesPerClient = 5 } = req.body;
      
      const preferences = await storage.getAllBuyerPreferences();
      const activePreferences = preferences.filter(p => p.isActive);
      
      const results = {
        total: activePreferences.length,
        successful: 0,
        failed: 0,
        noMatches: 0,
        details: [] as Array<{ preferenceId: string; userName: string; status: string; propertiesSent: number }>,
      };

      for (const preference of activePreferences) {
        try {
          const user = preference.userId ? await storage.getUser(preference.userId) : null;
          if (!user) continue;

          const allProperties = await storage.getAllProperties();
          const sentPropertyIds = await storage.getPropertyIdsSentToPreference(preference.id);
          
          const matchingProperties = allProperties.filter(prop => {
            if (prop.city !== preference.city) return false;
            if (preference.districts && preference.districts.length > 0) {
              if (!preference.districts.includes(prop.district)) return false;
            }
            if (prop.propertyType !== preference.propertyType) return false;
            if (preference.budgetMin && prop.price < preference.budgetMin) return false;
            if (preference.budgetMax && prop.price > preference.budgetMax) return false;
            if (sentPropertyIds.includes(prop.id)) return false;
            if (!prop.isActive) return false;
            return true;
          }).slice(0, maxPropertiesPerClient);

          let message: string;
          let messageType: "matches" | "no_matches";
          
          if (matchingProperties.length > 0) {
            const propertyList = matchingProperties.map(p => formatPropertyMessage(p)).join("\n\n");
            message = `مرحباً ${user.name}،\n\nوجدنا لك ${matchingProperties.length} عقارات تناسب تفضيلاتك:\n\n${propertyList}\n\nتواصل معنا للمزيد من التفاصيل.\nتطابق - منصة العقارات الذكية`;
            messageType = "matches";
          } else {
            message = `مرحباً ${user.name}،\n\nللأسف لا توجد عقارات جديدة تناسب تفضيلاتك حالياً.\nسنرسل لك إشعاراً فور توفر عقارات مناسبة.\n\nتطابق - منصة العقارات الذكية`;
            messageType = "no_matches";
            results.noMatches++;
          }

          const whatsappResult = await sendWhatsAppMessage(user.phone, message);

          await storage.createSendLog({
            preferenceId: preference.id,
            userId: user.id,
            propertyIds: matchingProperties.map(p => p.id),
            messageType,
            status: whatsappResult.success ? "sent" : "failed",
            whatsappResponse: whatsappResult.response || whatsappResult.error,
          });

          if (whatsappResult.success) {
            results.successful++;
          } else {
            results.failed++;
          }

          results.details.push({
            preferenceId: preference.id,
            userName: user.name,
            status: whatsappResult.success ? "sent" : "failed",
            propertiesSent: matchingProperties.length,
          });
        } catch (err) {
          results.failed++;
          console.error(`Error sending to preference ${preference.id}:`, err);
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error("Error in bulk send:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle client active status
  app.patch("/api/admin/clients/:preferenceId/toggle-status", async (req, res) => {
    try {
      const { preferenceId } = req.params;
      const preference = await storage.getBuyerPreference(preferenceId);
      
      if (!preference) {
        return res.status(404).json({ error: "الرغبة غير موجودة" });
      }

      const updated = await storage.updateBuyerPreference(preferenceId, {
        isActive: !preference.isActive,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle property availability
  app.patch("/api/admin/properties/:propertyId/toggle-availability", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: "العقار غير موجود" });
      }

      const updated = await storage.updateProperty(propertyId, {
        isActive: !property.isActive,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MARKETING ROUTES ============

  // Get all marketing settings
  app.get("/api/admin/marketing", async (req, res) => {
    try {
      const settings = await storage.getMarketingSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get enabled marketing settings (for frontend tracking)
  app.get("/api/marketing/enabled", async (req, res) => {
    try {
      const settings = await storage.getEnabledMarketingSettings();
      const sanitizedSettings = settings.map(s => ({
        platform: s.platform,
        pixelId: s.pixelId,
        isEnabled: s.isEnabled,
      }));
      res.json(sanitizedSettings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketing setting by platform
  app.get("/api/admin/marketing/:platform", async (req, res) => {
    try {
      const setting = await storage.getMarketingSetting(req.params.platform);
      if (!setting) {
        return res.status(404).json({ error: "إعدادات المنصة غير موجودة" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create or update marketing setting
  app.put("/api/admin/marketing/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      const validPlatforms = ["snapchat", "tiktok", "facebook", "google", "mailchimp"];
      
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ error: "منصة غير مدعومة" });
      }

      const { isEnabled, pixelId, accessToken, apiKey, audienceId, conversionApiToken, testEventCode, dataCenter } = req.body;

      const setting = await storage.upsertMarketingSetting({
        platform,
        isEnabled: isEnabled || false,
        pixelId: pixelId || null,
        accessToken: accessToken || null,
        apiKey: apiKey || null,
        audienceId: audienceId || null,
        conversionApiToken: conversionApiToken || null,
        testEventCode: testEventCode || null,
        dataCenter: dataCenter || null,
      });

      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete marketing setting
  app.delete("/api/admin/marketing/:platform", async (req, res) => {
    try {
      await storage.deleteMarketingSetting(req.params.platform);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track marketing event (for server-side tracking)
  app.post("/api/marketing/events", async (req, res) => {
    try {
      const { platform, eventName, eventData, userId, sessionId } = req.body;
      
      if (!platform || !eventName) {
        return res.status(400).json({ error: "Platform and eventName are required" });
      }

      const event = await storage.createMarketingEvent({
        platform,
        eventName,
        eventData: eventData || null,
        userId: userId || null,
        sessionId: sessionId || null,
        status: "sent",
      });

      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketing events (admin)
  app.get("/api/admin/marketing/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const platform = req.query.platform as string;
      
      let events;
      if (platform) {
        events = await storage.getMarketingEventsByPlatform(platform);
      } else {
        events = await storage.getMarketingEvents(limit);
      }
      
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertUserSchema, 
  insertBuyerPreferenceSchema, 
  insertPropertySchema, 
  insertContactRequestSchema, 
  insertSendLogSchema,
  audienceSegments,
  userSegments,
  adCampaigns,
  campaignSends,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { analyzeIntakeWithAI, transcribeAudio } from "./ai-service";
import bcrypt from "bcryptjs";
import { statsEngine } from "./stats-engine";
import {
  generateRegistrationOptionsForUser,
  verifyRegistration,
  generateAuthenticationOptionsForUser,
  verifyAuthentication,
} from "./webauthn";

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

  // ============ STATS ROUTES ============
  
  // Get synchronized daily stats (same for all users)
  app.get("/api/stats/daily", (req, res) => {
    try {
      const stats = statsEngine.getAllStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

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

  // Login with phone/password (using bcrypt)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({ error: "رقم الجوال وكلمة المرور مطلوبان" });
      }

      // Find user by phone
      const user = await storage.getUserByPhone(phone);
      
      if (!user) {
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      }

      // Check password with bcrypt
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
        }
      } else {
        // Legacy: if no hash, password = phone
        if (password !== phone) {
          return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
        }
      }

      // Set session
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      // Return user with requiresPasswordReset flag
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          requiresPasswordReset: user.requiresPasswordReset ?? true,
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user session
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "غير مسجل الدخول" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "المستخدم غير موجود" });
      }
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          requiresPasswordReset: user.requiresPasswordReset ?? true,
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "فشل تسجيل الخروج" });
      }
      res.clearCookie("tatabuk.sid", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.json({ success: true });
    });
  });

  // Change password (requires authenticated session)
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const sessionUserId = req.session.userId;
      const { newPassword } = req.body;
      
      if (!sessionUserId) {
        return res.status(401).json({ error: "غير مسجل الدخول" });
      }

      if (!newPassword) {
        return res.status(400).json({ error: "كلمة المرور مطلوبة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await storage.getUser(sessionUserId);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update user with new password and clear reset flag
      await storage.updateUser(sessionUserId, {
        passwordHash,
        requiresPasswordReset: false,
      });

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ WEBAUTHN ROUTES (Biometric Authentication) ============

  // Generate registration options for WebAuthn (Face ID, Touch ID, Fingerprint)
  app.post("/api/auth/webauthn/register-options", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      const options = await generateRegistrationOptionsForUser(userId, user.name);
      res.json(options);
    } catch (error: any) {
      console.error("WebAuthn register options error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify WebAuthn registration
  app.post("/api/auth/webauthn/register-verify", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
      }

      const { response, deviceName } = req.body;
      const result = await verifyRegistration(userId, response, deviceName);
      res.json(result);
    } catch (error: any) {
      console.error("WebAuthn register verify error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate authentication options for WebAuthn
  app.post("/api/auth/webauthn/auth-options", async (req, res) => {
    try {
      const { phone } = req.body;
      let userId: string | undefined;

      if (phone) {
        const user = await storage.getUserByPhone(phone);
        if (user) {
          userId = user.id;
        }
      }

      const options = await generateAuthenticationOptionsForUser(userId);
      res.json(options);
    } catch (error: any) {
      console.error("WebAuthn auth options error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify WebAuthn authentication
  app.post("/api/auth/webauthn/auth-verify", async (req, res) => {
    try {
      const { response, challenge } = req.body;
      const result = await verifyAuthentication(response, challenge);

      if (result.verified && result.user) {
        req.session.userId = result.user.id;
        req.session.userName = result.user.name;
        req.session.userRole = result.user.role;

        res.json({
          verified: true,
          user: {
            id: result.user.id,
            name: result.user.name,
            phone: result.user.phone,
            email: result.user.email,
            role: result.user.role,
          },
        });
      } else {
        res.status(401).json({ error: "فشل التحقق" });
      }
    } catch (error: any) {
      console.error("WebAuthn auth verify error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's registered WebAuthn credentials
  app.get("/api/auth/webauthn/credentials", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "غير مسجل الدخول" });
      }

      const credentials = await storage.getWebauthnCredentialsByUser(userId);
      res.json(credentials.map((c) => ({
        id: c.id,
        deviceName: c.deviceName,
        deviceType: c.deviceType,
        lastUsedAt: c.lastUsedAt,
        createdAt: c.createdAt,
      })));
    } catch (error: any) {
      console.error("Get credentials error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a WebAuthn credential
  app.delete("/api/auth/webauthn/credentials/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "غير مسجل الدخول" });
      }

      const credentialId = req.params.id;
      const credentials = await storage.getWebauthnCredentialsByUser(userId);
      const credential = credentials.find((c) => c.id === credentialId);

      if (!credential) {
        return res.status(404).json({ error: "الجهاز غير موجود" });
      }

      await storage.deleteWebauthnCredential(credentialId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete credential error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check if user has biometric credentials
  app.get("/api/auth/webauthn/has-credentials", async (req, res) => {
    try {
      const { phone } = req.query;
      if (!phone || typeof phone !== "string") {
        return res.json({ hasCredentials: false });
      }

      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.json({ hasCredentials: false });
      }

      const credentials = await storage.getWebauthnCredentialsByUser(user.id);
      res.json({ hasCredentials: credentials.length > 0 });
    } catch (error: any) {
      console.error("Check credentials error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-register buyer with password (phone = temp password)
  app.post("/api/auth/auto-register", async (req, res) => {
    try {
      const { name, phone, email, city, districts, propertyType, budgetMin, budgetMax, paymentMethod, transactionType } = req.body;

      // Validate required fields
      if (!name || !phone || !city || !propertyType) {
        return res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      }

      // Check if user exists by phone
      let user = await storage.getUserByPhone(phone);
      
      if (!user) {
        // Hash phone as temporary password
        const passwordHash = await bcrypt.hash(phone, 10);
        
        // Generate email if not provided
        const userEmail = email || `${phone}@tatabuk.sa`;
        
        user = await storage.createUser({
          email: userEmail,
          phone: phone.trim(),
          name: name.trim(),
          role: "buyer",
          passwordHash,
          requiresPasswordReset: true,
        });
      }

      // Create buyer preference
      const preference = await storage.createBuyerPreference({
        userId: user.id,
        city,
        districts: Array.isArray(districts) ? districts : [],
        propertyType,
        transactionType: transactionType || "buy",
        budgetMin: budgetMin ? parseInt(String(budgetMin), 10) : null,
        budgetMax: budgetMax ? parseInt(String(budgetMax), 10) : null,
        paymentMethod: paymentMethod || null,
        isActive: true,
      });

      // Find matches
      await storage.findMatchesForPreference(preference.id);

      // Set session for auto-login
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      // Return user (no credentials exposed)
      res.json({ 
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          requiresPasswordReset: true,
        },
        preference,
      });
    } catch (error: any) {
      console.error("Auto-register error:", error);
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
      let isNewUser = false;
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "buyer",
        });
        isNewUser = true;
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

      res.json({ success: true, user, preference, isNewUser, phone: phone.trim() });
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

  // Get matches for a preference (with ML-enhanced scoring)
  app.get("/api/buyers/preferences/:prefId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByBuyerPreference(req.params.prefId);
      const { userId, sessionId } = req.query;
      
      // Get learned weights if user/session provided
      let learnedWeights = null;
      if (userId || sessionId) {
        try {
          const { getLearnedWeights } = await import("./learning-engine");
          learnedWeights = await getLearnedWeights(
            userId as string | undefined,
            sessionId as string | undefined
          );
        } catch (err) {
          console.warn("Could not load learned weights:", err);
        }
      }
      
      // Enrich with property details and apply ML adjustments
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const property = match.propertyId ? await storage.getProperty(match.propertyId) : null;
          
          // Apply learned weights boost if available
          let adjustedScore = match.matchScore;
          let isPreferred = false;
          
          if (learnedWeights && learnedWeights.confidenceScore >= 0.2 && property) {
            // District preference bonus
            if (learnedWeights.preferredDistricts?.includes(property.district)) {
              adjustedScore = Math.min(100, adjustedScore + 5);
              isPreferred = true;
            }
            // Property type preference bonus  
            if (learnedWeights.preferredPropertyTypes?.includes(property.propertyType)) {
              adjustedScore = Math.min(100, adjustedScore + 3);
              isPreferred = true;
            }
            // Price range preference bonus
            if (learnedWeights.priceRangeMin && learnedWeights.priceRangeMax) {
              if (property.price >= learnedWeights.priceRangeMin && property.price <= learnedWeights.priceRangeMax) {
                adjustedScore = Math.min(100, adjustedScore + 3);
              }
            }
          }
          
          return { 
            ...match, 
            property, 
            matchScore: adjustedScore,
            isPreferred, 
          };
        })
      );
      
      // Sort by adjusted score
      enrichedMatches.sort((a, b) => b.matchScore - a.matchScore);
      
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
      let isNewUser = false;
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "seller",
          accountType: accountType || null,
          entityName: entityName || null,
        });
        isNewUser = true;
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

      res.json({ success: true, user, property, isNewUser, phone: phone.trim() });
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
      let isNewUser = false;
      if (!user) {
        user = await storage.createUser({
          email: email.trim(),
          phone: phone.trim(),
          name: name.trim(),
          role: "investor",
          accountType: null,
          entityName: null,
        });
        isNewUser = true;
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
        },
        isNewUser,
        phone: phone.trim()
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

  // ============ STATIC PAGES ROUTES ============

  // Get static page by slug (public)
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getStaticPage(slug);
      
      if (!page || !page.isPublished) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all static pages (admin)
  app.get("/api/admin/pages", async (req, res) => {
    try {
      const pages = await storage.getAllStaticPages();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create or update static page (admin)
  app.post("/api/admin/pages", async (req, res) => {
    try {
      const { slug, titleAr, contentAr, isPublished } = req.body;
      
      if (!slug || !titleAr || !contentAr) {
        return res.status(400).json({ error: "slug, titleAr, and contentAr are required" });
      }
      
      const page = await storage.upsertStaticPage({
        slug,
        titleAr,
        contentAr,
        isPublished: isPublished !== false,
      });
      
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MACHINE LEARNING ROUTES ============
  
  // Validation schema for ML interactions
  const mlInteractionSchema = z.object({
    userId: z.string().uuid().optional().nullable(),
    sessionId: z.string().min(10).max(100).optional().nullable(),
    propertyId: z.string().uuid(),
    interactionType: z.enum(["view", "save", "skip", "contact", "share", "unsave"]),
    duration: z.number().int().min(0).max(3600).optional(),
    deviceType: z.enum(["mobile", "desktop", "tablet"]).optional(),
  });

  // Record user interaction (view, save, skip, contact)
  app.post("/api/ml/interaction", async (req, res) => {
    try {
      const { recordInteraction } = await import("./learning-engine");
      
      // Validate input
      const validationResult = mlInteractionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validationResult.error.errors 
        });
      }
      
      const { userId, sessionId, propertyId, interactionType, duration, deviceType } = validationResult.data;
      
      // Must have either userId or sessionId for tracking
      if (!userId && !sessionId) {
        return res.status(400).json({ error: "Either userId or sessionId is required" });
      }
      
      await recordInteraction({
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        propertyId,
        interactionType,
        duration,
        deviceType,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error recording interaction:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get learned weights for a user/session
  app.get("/api/ml/weights", async (req, res) => {
    try {
      const { getLearnedWeights } = await import("./learning-engine");
      const { userId, sessionId } = req.query;
      
      const weights = await getLearnedWeights(
        userId as string | undefined,
        sessionId as string | undefined
      );
      
      res.json(weights);
    } catch (error: any) {
      console.error("Error getting learned weights:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get learning stats for a user
  app.get("/api/ml/stats", async (req, res) => {
    try {
      const { getLearningStats } = await import("./learning-engine");
      const { userId, sessionId } = req.query;
      
      const stats = await getLearningStats(
        userId as string | undefined,
        sessionId as string | undefined
      );
      
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting learning stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AUDIENCE SEGMENTATION ROUTES (نظام تصنيف الجمهور) ============

  // Get all audience segments
  app.get("/api/segments", async (req, res) => {
    try {
      const segments = await db.select().from(audienceSegments).where(eq(audienceSegments.isActive, true));
      res.json(segments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new segment
  app.post("/api/segments", async (req, res) => {
    try {
      const segmentSchema = z.object({
        name: z.string().min(1),
        nameAr: z.string().min(1),
        description: z.string().optional(),
        purchasingPowerTier: z.enum(["luxury", "premium", "mid_range", "budget", "economy"]),
        minBudget: z.number().optional(),
        maxBudget: z.number().optional(),
        propertyTypes: z.array(z.string()).optional(),
        transactionTypes: z.array(z.string()).optional(),
        cities: z.array(z.string()).optional(),
        purposes: z.array(z.string()).optional(),
        engagementLevel: z.enum(["high", "medium", "low"]).optional(),
        conversionPotential: z.enum(["hot", "warm", "cold"]).optional(),
        color: z.string().optional(),
        priority: z.number().default(0),
      });
      
      const result = segmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "بيانات غير صالحة", details: result.error.errors });
      }
      
      const [segment] = await db.insert(audienceSegments).values(result.data).returning();
      res.json(segment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get segment details with users
  app.get("/api/segments/:segmentId", async (req, res) => {
    try {
      const { getUsersInSegment } = await import("./audience-segmentation");
      
      const [segment] = await db.select().from(audienceSegments).where(eq(audienceSegments.id, req.params.segmentId));
      if (!segment) {
        return res.status(404).json({ error: "الشريحة غير موجودة" });
      }
      
      const users = await getUsersInSegment(req.params.segmentId);
      
      res.json({ segment, users, userCount: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize default segments
  app.post("/api/segments/initialize", async (req, res) => {
    try {
      const { initializeDefaultSegments } = await import("./audience-segmentation");
      await initializeDefaultSegments();
      
      const segments = await db.select().from(audienceSegments);
      res.json({ success: true, segments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Classify a single user
  app.post("/api/segments/classify/:userId", async (req, res) => {
    try {
      const { classifyUser } = await import("./audience-segmentation");
      const classification = await classifyUser(req.params.userId);
      res.json(classification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Classify all users (batch operation)
  app.post("/api/segments/classify-all", async (req, res) => {
    try {
      const { classifyAllUsers } = await import("./audience-segmentation");
      const result = await classifyAllUsers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's purchasing power analysis
  app.get("/api/segments/purchasing-power/:userId", async (req, res) => {
    try {
      const { calculatePurchasingPower } = await import("./audience-segmentation");
      const result = await calculatePurchasingPower(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's engagement analysis
  app.get("/api/segments/engagement/:userId", async (req, res) => {
    try {
      const { calculateEngagement } = await import("./audience-segmentation");
      const result = await calculateEngagement(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's intent analysis
  app.get("/api/segments/intent/:userId", async (req, res) => {
    try {
      const { calculateIntent } = await import("./audience-segmentation");
      const result = await calculateIntent(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AD CAMPAIGNS ROUTES (الحملات الإعلانية) ============

  // Get all campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await db.select().from(adCampaigns).orderBy(desc(adCampaigns.createdAt));
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new campaign
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        targetSegments: z.array(z.string()).optional(),
        targetCities: z.array(z.string()).optional(),
        targetPropertyTypes: z.array(z.string()).optional(),
        minPurchasingPower: z.number().optional(),
        maxPurchasingPower: z.number().optional(),
        messageTemplate: z.string().optional(),
        emailSubject: z.string().optional(),
        emailTemplate: z.string().optional(),
        channels: z.array(z.enum(["whatsapp", "email", "sms", "push"])).default(["whatsapp"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        frequency: z.enum(["once", "daily", "weekly", "monthly"]).default("once"),
        createdBy: z.string().optional(),
      });
      
      const result = campaignSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "بيانات غير صالحة", details: result.error.errors });
      }
      
      const data = {
        ...result.data,
        startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
        endDate: result.data.endDate ? new Date(result.data.endDate) : undefined,
      };
      
      const [campaign] = await db.insert(adCampaigns).values(data).returning();
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get campaign details with targeted users
  app.get("/api/campaigns/:campaignId", async (req, res) => {
    try {
      const { getTargetedUsersForCampaign } = await import("./audience-segmentation");
      
      const [campaign] = await db.select().from(adCampaigns).where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }
      
      const targetedUsers = await getTargetedUsersForCampaign(req.params.campaignId);
      
      res.json({ campaign, targetedUsers, targetCount: targetedUsers.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update campaign status
  app.patch("/api/campaigns/:campaignId/status", async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["draft", "scheduled", "active", "paused", "completed"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "حالة غير صالحة" });
      }
      
      const [updated] = await db.update(adCampaigns)
        .set({ status, updatedAt: new Date() })
        .where(eq(adCampaigns.id, req.params.campaignId))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send campaign (execute)
  app.post("/api/campaigns/:campaignId/send", async (req, res) => {
    try {
      const { getTargetedUsersForCampaign } = await import("./audience-segmentation");
      
      const [campaign] = await db.select().from(adCampaigns).where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }
      
      const targetedUsers = await getTargetedUsersForCampaign(req.params.campaignId);
      const channels = campaign.channels || ["whatsapp"];
      
      let totalSent = 0;
      const errors: string[] = [];
      
      for (const { userId, user, segmentMatch } of targetedUsers) {
        for (const channel of channels) {
          try {
            // Create campaign send record
            await db.insert(campaignSends).values({
              campaignId: campaign.id,
              userId,
              segmentId: segmentMatch.segmentId,
              channel,
              messageContent: campaign.messageTemplate,
              status: "pending",
            });
            
            // TODO: Integrate with actual notification service
            // For now, just mark as sent
            totalSent++;
          } catch (err: any) {
            errors.push(`فشل إرسال لـ ${user.name}: ${err.message}`);
          }
        }
      }
      
      // Update campaign metrics
      await db.update(adCampaigns)
        .set({ 
          status: "active",
          totalSent: campaign.totalSent + totalSent,
          updatedAt: new Date(),
        })
        .where(eq(adCampaigns.id, campaign.id));
      
      res.json({ 
        success: true, 
        totalSent, 
        targetCount: targetedUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get campaign analytics
  app.get("/api/campaigns/:campaignId/analytics", async (req, res) => {
    try {
      const [campaign] = await db.select().from(adCampaigns).where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }
      
      const sends = await db.select().from(campaignSends).where(eq(campaignSends.campaignId, req.params.campaignId));
      
      // Calculate channel breakdown
      const byChannel: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      for (const send of sends) {
        byChannel[send.channel] = (byChannel[send.channel] || 0) + 1;
        byStatus[send.status] = (byStatus[send.status] || 0) + 1;
      }
      
      const analytics = {
        totalSent: campaign.totalSent,
        totalDelivered: campaign.totalDelivered,
        totalOpened: campaign.totalOpened,
        totalClicked: campaign.totalClicked,
        totalConverted: campaign.totalConverted,
        deliveryRate: campaign.totalSent > 0 ? (campaign.totalDelivered / campaign.totalSent * 100).toFixed(1) : 0,
        openRate: campaign.totalDelivered > 0 ? (campaign.totalOpened / campaign.totalDelivered * 100).toFixed(1) : 0,
        clickRate: campaign.totalOpened > 0 ? (campaign.totalClicked / campaign.totalOpened * 100).toFixed(1) : 0,
        conversionRate: campaign.totalClicked > 0 ? (campaign.totalConverted / campaign.totalClicked * 100).toFixed(1) : 0,
        byChannel,
        byStatus,
      };
      
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get segment statistics summary
  app.get("/api/segments/stats/summary", async (req, res) => {
    try {
      const segments = await db.select().from(audienceSegments).where(eq(audienceSegments.isActive, true));
      const userSegmentCounts = await db.select({
        segmentId: userSegments.segmentId,
        count: sql<number>`count(*)::int`,
      })
      .from(userSegments)
      .groupBy(userSegments.segmentId);
      
      const countMap = new Map(userSegmentCounts.map(u => [u.segmentId, u.count]));
      
      const summary = segments.map(segment => ({
        id: segment.id,
        name: segment.name,
        nameAr: segment.nameAr,
        purchasingPowerTier: segment.purchasingPowerTier,
        color: segment.color,
        userCount: countMap.get(segment.id) || 0,
      }));
      
      const totalUsers = Array.from(countMap.values()).reduce((a, b) => a + b, 0);
      
      res.json({ segments: summary, totalSegmentedUsers: totalUsers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BROKER SUBSCRIPTION & ADS SYSTEM ====================
  
  // Helper to check broker authentication
  const requireBrokerAuth = (req: any, res: any, userId: string): boolean => {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      res.status(401).json({ error: "يجب تسجيل الدخول" });
      return false;
    }
    if (sessionUser.id !== userId && sessionUser.role !== "admin") {
      res.status(403).json({ error: "غير مصرح لك بالوصول" });
      return false;
    }
    return true;
  };

  // Get broker subscription (authenticated)
  app.get("/api/broker/subscription/:userId", async (req, res) => {
    try {
      if (!requireBrokerAuth(req, res, req.params.userId)) return;
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const subscription = await brokerAdsEngine.getBrokerSubscription(req.params.userId);
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get broker dashboard stats (authenticated)
  app.get("/api/broker/dashboard/:userId", async (req, res) => {
    try {
      if (!requireBrokerAuth(req, res, req.params.userId)) return;
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const stats = await brokerAdsEngine.getBrokerDashboardStats(req.params.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check if can add property (authenticated)
  app.get("/api/broker/can-add-property/:userId", async (req, res) => {
    try {
      if (!requireBrokerAuth(req, res, req.params.userId)) return;
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const result = await brokerAdsEngine.canAddProperty(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create lead (authenticated buyer)
  app.post("/api/leads", async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "يجب تسجيل الدخول لإرسال طلب التواصل" });
      }
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const lead = await brokerAdsEngine.createLead({
        ...req.body,
        buyerId: sessionUser.id,
      });
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get seller leads (authenticated seller)
  app.get("/api/broker/leads/:sellerId", async (req, res) => {
    try {
      if (!requireBrokerAuth(req, res, req.params.sellerId)) return;
      const { propertyLeads } = await import("@shared/schema");
      const leads = await db.select()
        .from(propertyLeads)
        .where(eq(propertyLeads.sellerId, req.params.sellerId))
        .orderBy(desc(propertyLeads.createdAt));
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track property impression
  app.post("/api/impressions", async (req, res) => {
    try {
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const impression = await brokerAdsEngine.trackImpression(req.body);
      res.status(201).json(impression);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get ranked properties (public endpoint)
  app.get("/api/ranked-properties", async (req, res) => {
    try {
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const options = {
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
        city: req.query.city as string,
        propertyType: req.query.propertyType as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        buyerId: req.query.buyerId as string,
      };
      const properties = await brokerAdsEngine.getRankedProperties(options);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create property boost (authenticated)
  app.post("/api/boosts", async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "يجب تسجيل الدخول" });
      }
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const boost = await brokerAdsEngine.createPropertyBoost({
        ...req.body,
        userId: sessionUser.id,
      });
      res.status(201).json(boost);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Activate boost (after payment - admin or owner)
  app.post("/api/boosts/:boostId/activate", async (req, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "يجب تسجيل الدخول" });
      }
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const boost = await brokerAdsEngine.activateBoost(req.params.boostId);
      res.json(boost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get active boosts for a user (authenticated)
  app.get("/api/broker/boosts/:userId", async (req, res) => {
    try {
      if (!requireBrokerAuth(req, res, req.params.userId)) return;
      const { propertyBoosts } = await import("@shared/schema");
      const boosts = await db.select()
        .from(propertyBoosts)
        .where(eq(propertyBoosts.userId, req.params.userId))
        .orderBy(desc(propertyBoosts.createdAt));
      res.json(boosts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    const { BROKER_SUBSCRIPTION_PLANS } = await import("@shared/schema");
    res.json(BROKER_SUBSCRIPTION_PLANS);
  });

  // Recalculate property ranking score
  app.post("/api/properties/:propertyId/recalculate-ranking", async (req, res) => {
    try {
      const { brokerAdsEngine } = await import("./broker-ads-engine");
      const score = await brokerAdsEngine.calculatePropertyRankingScore(req.params.propertyId);
      res.json({ score });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

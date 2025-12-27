import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import * as formBuilderStorage from "./form-builder-storage";
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
  appointments,
  landingPages,
  marketerLinks,
  progressiveProfiles,
  matches,
  properties,
} from "@shared/schema";
import * as landingPageService from "./landing-page-service";
import * as leadsService from "./leads-service";
import { handleFormSubmission } from "./routes/form-submission";
import { eq, desc, sql, or } from "drizzle-orm";
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
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  normalizeEmail,
  generateTempEmail,
  validateUserData,
} from "./utils/validation";

// WhatsApp API Integration Point - Replace with actual implementation
async function sendWhatsAppMessage(
  phone: string,
  message: string,
): Promise<{ success: boolean; response?: string; error?: string }> {
  // TODO: Integrate with WhatsApp Business API
  // For now, simulate success for testing
  console.log(`[WhatsApp] Sending to ${phone}:`, message);
  return { success: true, response: "simulated_success" };
}

// Format property for WhatsApp message
function formatPropertyMessage(property: {
  city: string;
  district: string;
  propertyType: string;
  price: number;
  id: string;
}): string {
  const typeNames: Record<string, string> = {
    apartment: "شقة",
    villa: "فيلا",
    land: "أرض",
    building: "عمارة",
  };
  const formattedPrice =
    property.price >= 1000000
      ? `${(property.price / 1000000).toFixed(1)} مليون`
      : `${(property.price / 1000).toFixed(0)} ألف`;

  return `- ${typeNames[property.propertyType] || property.propertyType} في ${property.district}، ${property.city}\n  السعر: ${formattedPrice} ريال`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ============================================================
  // 🚀 أضف هذا الجزء فقط لربط الصفحة الرئيسية بالنظام الأصلي
  // ============================================================

  // تسجيل البائع + العقار (للهيرو سكشين)
  // تم حذف endpoint المكرر - يتم استخدام endpoint في السطر 1295 بدلاً منه

  // تم حذف endpoint المكرر - يتم استخدام endpoint في السطر 976 بدلاً منه

  // ============================================================
  // 🔚 نهاية الجزء المضاف - الآن أكمل باقي الـ 2000 سطر كما هي
  // ============================================================
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
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(rawPath);
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
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
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
        return res
          .status(400)
          .json({ error: "رقم الجوال وكلمة المرور مطلوبان" });
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
        },
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
        },
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
        return res
          .status(400)
          .json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
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

  // ============ PASSWORD RESET ROUTES ============

  // Request password reset (sends email)
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          success: true,
          message:
            "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة استعادة كلمة المرور",
        });
      }

      // Generate secure reset token
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to database
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send email
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail(user.email, token, user.name);

      res.json({
        success: true,
        message: "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إرسال رابط الاستعادة" });
    }
  });

  // Verify reset token
  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, error: "رمز غير صالح" });
      }

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.json({ valid: false, error: "رمز الاستعادة غير موجود" });
      }

      if (resetToken.usedAt) {
        return res.json({
          valid: false,
          error: "تم استخدام هذا الرابط مسبقاً",
        });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.json({ valid: false, error: "انتهت صلاحية رابط الاستعادة" });
      }

      res.json({ valid: true });
    } catch (error: any) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ valid: false, error: "حدث خطأ" });
    }
  });

  // Reset password using token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: "الرمز وكلمة المرور الجديدة مطلوبان" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ error: "رمز الاستعادة غير موجود" });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ error: "تم استخدام هذا الرابط مسبقاً" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: "انتهت صلاحية رابط الاستعادة" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user password
      await storage.updateUser(resetToken.userId, {
        passwordHash,
        requiresPasswordReset: false,
      });

      // Mark token as used
      await storage.markPasswordResetTokenUsed(token);

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // ============ REGISTRATION ROUTE ============

  // Direct registration (without form)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, phone, email, password } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      // تنظيف وvalidate البيانات
      const cleanPhone = normalizePhone(phone);
      const cleanEmail = normalizeEmail(email);
      
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: "رقم الجوال غير صحيح" });
      }
      
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
      }

      // Check if user already exists
      const existingByPhone = await storage.getUserByPhone(cleanPhone);
      if (existingByPhone) {
        return res.status(400).json({ error: "رقم الجوال مسجل مسبقاً" });
      }

      const existingByEmail = await storage.getUserByEmail(cleanEmail);
      if (existingByEmail) {
        return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        role: "buyer",
        requiresPasswordReset: false,
      });

      // Set session
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      // Send welcome email (non-blocking)
      try {
        const { sendWelcomeEmail } = await import("./email");
        await sendWelcomeEmail(user.email, user.name);
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
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

      const options = await generateRegistrationOptionsForUser(
        userId,
        user.name,
      );
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
      res.json(
        credentials.map((c) => ({
          id: c.id,
          deviceName: c.deviceName,
          deviceType: c.deviceType,
          lastUsedAt: c.lastUsedAt,
          createdAt: c.createdAt,
        })),
      );
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
      const {
        name,
        phone,
        email,
        city,
        districts,
        propertyType,
        budgetMin,
        budgetMax,
        paymentMethod,
        transactionType,
      } = req.body;

      // Validate required fields
      if (!name || !phone || !city || !propertyType) {
        return res.status(400).json({ error: "البيانات المطلوبة ناقصة" });
      }

      // تنظيف وvalidate البيانات
      const cleanPhone = normalizePhone(phone || "");
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: "رقم الجوال غير صحيح" });
      }
      
      const cleanEmail = email ? normalizeEmail(email) : null;
      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
      }

      // Check if user exists by phone
      let user = await storage.getUserByPhone(cleanPhone);

      if (!user) {
        // Hash phone as temporary password
        const passwordHash = await bcrypt.hash(cleanPhone, 10);

        // Generate email if not provided
        let finalEmail = cleanEmail;
        if (!finalEmail || !isValidEmail(finalEmail)) {
          finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
        }

        user = await storage.createUser({
          email: finalEmail,
          phone: cleanPhone,
          name: name.trim(),
          role: "buyer",
          passwordHash,
          requiresPasswordReset: true,
        });
        
        // إذا كان الإيميل مؤقت، قم بإنشاء إيميل فريد بناءً على userId
        if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
          const uniqueEmail = generateTempEmail(cleanPhone, user.id);
          user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
        }
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
      const {
        name,
        email,
        phone,
        city,
        districts,
        propertyType,
        propertyCategory, // إضافة propertyCategory
        rooms,
        area,
        budgetMin,
        budgetMax,
        paymentMethod,
        purpose,
        smartTags,
        notes,
      } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }
      if (!city || typeof city !== "string") {
        return res.status(400).json({ error: "المدينة مطلوبة" });
      }
      // propertyType يمكن أن يكون null (سيتم استخدام قيمة افتراضية)
      // if (!propertyType || typeof propertyType !== "string") {
      //   return res.status(400).json({ error: "نوع العقار مطلوب" });
      // }

      // تنظيف وvalidate البيانات
      const cleanPhone = normalizePhone(phone || "");
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: "رقم الجوال غير صحيح" });
      }
      
      const cleanEmail = email ? normalizeEmail(email) : null;
      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
      }

      // Check if user exists
      let user = cleanEmail ? await storage.getUserByEmail(cleanEmail) : null;
      if (!user) {
        user = await storage.getUserByPhone(cleanPhone);
      }
      
      let isNewUser = false;
      if (!user) {
        // إنشاء إيميل مؤقت إذا لم يتم توفير إيميل صحيح
        let finalEmail = cleanEmail;
        if (!finalEmail || !isValidEmail(finalEmail)) {
          finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
        }
        
        user = await storage.createUser({
          email: finalEmail,
          phone: cleanPhone,
          name: name.trim(),
          role: "buyer",
        });
        
        // إذا كان الإيميل مؤقت، قم بإنشاء إيميل فريد بناءً على userId
        if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
          const uniqueEmail = generateTempEmail(cleanPhone, user.id);
          user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
        }
        
        isNewUser = true;
      }

      // Parse budget values safely
      const parsedBudgetMin = budgetMin
        ? parseInt(String(budgetMin), 10)
        : null;
      const parsedBudgetMax = budgetMax
        ? parseInt(String(budgetMax), 10)
        : null;

      // Create preference
      // حفظ propertyCategory في notes مؤقتاً حتى يتم إضافته إلى schema
      const notesWithCategory = propertyCategory 
        ? (notes ? `${notes}\n[propertyCategory:${propertyCategory}]` : `[propertyCategory:${propertyCategory}]`)
        : notes;
      
      const preference = await storage.createBuyerPreference({
        userId: user.id,
        city,
        districts: Array.isArray(districts) ? districts : [],
        propertyType: propertyType || "apartment", // قيمة افتراضية إذا كان null (لأنه required في schema)
        rooms: rooms || null,
        area: area || null,
        budgetMin: isNaN(parsedBudgetMin!) ? null : parsedBudgetMin,
        budgetMax: isNaN(parsedBudgetMax!) ? null : parsedBudgetMax,
        paymentMethod: paymentMethod || null,
        purpose: purpose || null,
        smartTags: Array.isArray(smartTags) ? smartTags : [],
        notes: notesWithCategory || null,
        isActive: true,
      });

      // Find matches for this preference
      await storage.findMatchesForPreference(preference.id);

      res.json({
        success: true,
        user,
        preference,
        isNewUser,
        phone: phone.trim(),
      });
    } catch (error: any) {
      console.error("Error registering buyer:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get buyer's preferences
  app.get("/api/buyers/:userId/preferences", async (req, res) => {
    try {
      const preferences = await storage.getBuyerPreferencesByUser(
        req.params.userId,
      );
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get matches for a preference (with ML-enhanced scoring)
  app.get("/api/buyers/preferences/:prefId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByBuyerPreference(
        req.params.prefId,
      );
      const { userId, sessionId } = req.query;

      // Get learned weights if user/session provided
      let learnedWeights = null;
      if (userId || sessionId) {
        try {
          const { getLearnedWeights } = await import("./learning-engine");
          learnedWeights = await getLearnedWeights(
            userId as string | undefined,
            sessionId as string | undefined,
          );
        } catch (err) {
          console.warn("Could not load learned weights:", err);
        }
      }

      // Enrich with property details and apply ML adjustments
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const property = match.propertyId
            ? await storage.getProperty(match.propertyId)
            : null;

          // Apply learned weights boost if available
          let adjustedScore = match.matchScore;
          let isPreferred = false;

          if (
            learnedWeights &&
            learnedWeights.confidenceScore >= 0.2 &&
            property
          ) {
            // District preference bonus
            if (
              learnedWeights.preferredDistricts?.includes(property.district)
            ) {
              adjustedScore = Math.min(100, adjustedScore + 5);
              isPreferred = true;
            }
            // Property type preference bonus
            if (
              learnedWeights.preferredPropertyTypes?.includes(
                property.propertyType,
              )
            ) {
              adjustedScore = Math.min(100, adjustedScore + 3);
              isPreferred = true;
            }
            // Price range preference bonus
            if (learnedWeights.priceRangeMin && learnedWeights.priceRangeMax) {
              if (
                property.price >= learnedWeights.priceRangeMin &&
                property.price <= learnedWeights.priceRangeMax
              ) {
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
        }),
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
      const {
        userId,
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
      } = req.body;

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
      const {
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
      } = req.body;

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
      const {
        name,
        email,
        phone,
        accountType,
        entityName,
        propertyType,
        propertyCategory, // إضافة propertyCategory
        city,
        district,
        price,
        area,
        rooms,
        description,
        status,
        images,
        latitude,
        longitude,
        smartTags,
        notes,
      } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }
      if (!city || typeof city !== "string") {
        return res.status(400).json({ error: "المدينة مطلوبة" });
      }
      if (!district || typeof district !== "string") {
        return res.status(400).json({ error: "الحي مطلوب" });
      }
      // propertyType يمكن أن يكون null (سيتم استخدام قيمة افتراضية)
      // if (!propertyType || typeof propertyType !== "string") {
      //   return res.status(400).json({ error: "نوع العقار مطلوب" });
      // }
      if (!price) {
        return res.status(400).json({ error: "السعر مطلوب" });
      }

      // Parse price safely
      const parsedPrice = parseInt(String(price), 10);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: "السعر غير صحيح" });
      }

      // تنظيف وvalidate البيانات
      const cleanPhone = normalizePhone(phone || "");
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: "رقم الجوال غير صحيح" });
      }
      
      const cleanEmail = email ? normalizeEmail(email) : null;
      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
      }

      // Check if user exists
      let user = cleanEmail ? await storage.getUserByEmail(cleanEmail) : null;
      if (!user) {
        user = await storage.getUserByPhone(cleanPhone);
      }
      
      let isNewUser = false;
      if (!user) {
        // إنشاء إيميل مؤقت إذا لم يتم توفير إيميل صحيح
        let finalEmail = cleanEmail;
        if (!finalEmail || !isValidEmail(finalEmail)) {
          finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
        }
        
        user = await storage.createUser({
          email: finalEmail,
          phone: cleanPhone,
          name: name.trim(),
          role: "seller",
          accountType: accountType || null,
          entityName: entityName || null,
        });
        
        // إذا كان الإيميل مؤقت، قم بإنشاء إيميل فريد بناءً على userId
        if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
          const uniqueEmail = generateTempEmail(cleanPhone, user.id);
          user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
        }
        
        isNewUser = true;
      }

      // Create property
      // حفظ propertyCategory في notes مؤقتاً حتى يتم إضافته إلى schema
      const notesWithCategory = propertyCategory 
        ? (notes ? `${notes}\n[propertyCategory:${propertyCategory}]` : `[propertyCategory:${propertyCategory}]`)
        : notes;
      
      const property = await storage.createProperty({
        sellerId: user.id,
        propertyType: propertyType || "apartment", // قيمة افتراضية إذا كان null
        city,
        district,
        price: parsedPrice,
        area: area || null,
        rooms: rooms || null,
        description: description || null,
        status: status || "ready",
        images: Array.isArray(images) ? images : [],
        smartTags: Array.isArray(smartTags) ? smartTags : [],
        notes: notesWithCategory || null,
        isActive: true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });

      // Find matches for this property
      await storage.findMatchesForProperty(property.id);

      res.json({
        success: true,
        user,
        property,
        isNewUser,
        phone: phone.trim(),
      });
    } catch (error: any) {
      console.error("Error registering seller:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ INVESTOR ROUTES ============

  // Register investor
  app.post("/api/investors/register", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        cities,
        investmentTypes,
        budgetMin,
        budgetMax,
        returnPreference,
      } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }

      // تنظيف وvalidate البيانات
      const cleanPhone = normalizePhone(phone || "");
      if (!isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: "رقم الجوال غير صحيح" });
      }
      
      const cleanEmail = email ? normalizeEmail(email) : null;
      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
      }

      // Check if user exists
      let user = cleanEmail ? await storage.getUserByEmail(cleanEmail) : null;
      if (!user) {
        user = await storage.getUserByPhone(cleanPhone);
      }
      
      let isNewUser = false;
      if (!user) {
        // إنشاء إيميل مؤقت إذا لم يتم توفير إيميل صحيح
        let finalEmail = cleanEmail;
        if (!finalEmail || !isValidEmail(finalEmail)) {
          finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
        }
        
        user = await storage.createUser({
          email: finalEmail,
          phone: cleanPhone,
          name: name.trim(),
          role: "investor",
          accountType: null,
          entityName: null,
        });
        
        // إذا كان الإيميل مؤقت، قم بإنشاء إيميل فريد بناءً على userId
        if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
          const uniqueEmail = generateTempEmail(cleanPhone, user.id);
          user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
        }
        
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
          returnPreference,
        },
        isNewUser,
        phone: phone.trim(),
      });
    } catch (error: any) {
      console.error("Error registering investor:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get seller's properties
  app.get("/api/sellers/:sellerId/properties", async (req, res) => {
    try {
      const properties = await storage.getPropertiesBySeller(
        req.params.sellerId,
      );
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
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Check if property exists
      const existingProperty = await storage.getProperty(id);
      if (!existingProperty) {
        return res.status(404).json({ error: "العقار غير موجود" });
      }

      // Check ownership (if user is logged in)
      if (req.session.userId) {
        if (existingProperty.sellerId !== req.session.userId) {
          return res.status(403).json({ error: "ليس لديك صلاحية لتعديل هذا العقار" });
        }
      }

      // Remove internal flag if present
      const shouldRecalculateMatches = updateData._recalculateMatches;
      delete updateData._recalculateMatches;

      // Determine which fields affect matching
      const matchingFields = ["city", "district", "price", "propertyType", "rooms", "area", "status", "amenities"];
      const updatedFields = Object.keys(updateData);
      const affectsMatching = shouldRecalculateMatches || updatedFields.some(field => matchingFields.includes(field));

      // Update property
      const property = await storage.updateProperty(id, updateData);
      
      // Recalculate matches if matching fields were updated
      if (affectsMatching && property) {
        try {
          await storage.findMatchesForProperty(id);
        } catch (matchError) {
          console.error("Error recalculating matches:", matchError);
          // Don't fail the update if match recalculation fails
        }
      }

      res.json(property);
    } catch (error: any) {
      console.error("Error updating property:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create property
  app.post("/api/properties", async (req, res) => {
    try {
      const {
        sellerId,
        propertyType,
        city,
        district,
        price,
        area,
        rooms,
        description,
        status,
        images,
        isActive,
        latitude,
        longitude,
      } = req.body;

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
      const enrichedConvs = await Promise.all(
        convs.map(async (conv) => {
          const property = await storage.getProperty(conv.propertyId);
          const buyer = await storage.getUser(conv.buyerId);
          const seller = await storage.getUser(conv.sellerId);

          return {
            ...conv,
            property: property
              ? {
                  id: property.id,
                  propertyType: property.propertyType,
                  city: property.city,
                  district: property.district,
                  price: property.price,
                  images: property.images,
                }
              : null,
            buyer: buyer
              ? { id: buyer.id, name: buyer.name, phone: buyer.phone }
              : null,
            seller: seller
              ? {
                  id: seller.id,
                  name: seller.name,
                  phone: seller.phone,
                  entityName: seller.entityName,
                }
              : null,
          };
        }),
      );

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
        property: property
          ? {
              id: property.id,
              propertyType: property.propertyType,
              city: property.city,
              district: property.district,
              price: property.price,
              images: property.images,
            }
          : null,
        buyer: buyer
          ? { id: buyer.id, name: buyer.name, phone: buyer.phone }
          : null,
        seller: seller
          ? {
              id: seller.id,
              name: seller.name,
              phone: seller.phone,
              entityName: seller.entityName,
            }
          : null,
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
        return res
          .status(400)
          .json({ error: "buyerId, sellerId, and propertyId are required" });
      }

      // Check if conversation already exists
      let conv = await storage.getConversationByParticipants(
        buyerId,
        sellerId,
        propertyId,
      );

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
      const { conversationId, senderId, content, messageType, attachments } =
        req.body;

      if (!conversationId || !senderId || !content) {
        return res.status(400).json({
          error: "conversationId, senderId, and content are required",
        });
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
      const messages = await storage.getMessagesByConversation(
        req.params.conversationId,
      );
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

  // Update user
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
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

  // Update buyer preference
  app.patch("/api/admin/preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const preference = await storage.updateBuyerPreference(id, req.body);
      if (!preference) {
        return res.status(404).json({ error: "الرغبة غير موجودة" });
      }
      res.json(preference);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete buyer preference
  // Cleanup users data (admin only)
  app.post("/api/admin/cleanup-users", async (req, res) => {
    try {
      const { cleanupUsers } = await import("./scripts/cleanup-users");
      await cleanupUsers();
      res.json({ success: true, message: "تم تنظيف بيانات المستخدمين بنجاح" });
    } catch (error: any) {
      console.error("Error cleaning up users:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBuyerPreference(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting preference:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProperty = await storage.updateProperty(id, req.body);
      if (!updatedProperty) {
        return res.status(404).json({ error: "العقار غير موجود" });
      }
      // Recalculate matches if relevant fields changed
      const matchAffectingFields = ["city", "district", "price", "propertyType", "rooms", "area", "status", "amenities"];
      const shouldRecalculateMatches = matchAffectingFields.some(field => req.body.hasOwnProperty(field));
      if (shouldRecalculateMatches) {
        await storage.findMatchesForProperty(id);
      }
      res.json(updatedProperty);
    } catch (error: any) {
      console.error("Error updating property:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete property from admin
  app.delete("/api/admin/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProperty(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting property:", error);
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

  // Market Analytics: Supply & Demand Index
  app.get("/api/admin/analytics/supply-demand", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const data = await storage.getSupplyDemandIndex(city);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Market Analytics: Price per Square Meter
  app.get("/api/admin/analytics/price-per-sqm", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const district = req.query.district as string | undefined;
      const propertyType = req.query.propertyType as string | undefined;
      const data = await storage.getPricePerSquareMeter(city, district, propertyType);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Market Analytics: District Popularity Score
  app.get("/api/admin/analytics/district-popularity", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const data = await storage.getDistrictPopularityScore(city, limit);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Market Analytics: Market Quality Index
  app.get("/api/admin/analytics/market-quality", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const data = await storage.getMarketQualityIndex(city);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Market Analytics: Price Trends
  app.get("/api/admin/analytics/price-trends", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const propertyType = req.query.propertyType as string | undefined;
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      const data = await storage.getPriceTrends(city, propertyType, months);
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

  // Delete match
  app.delete("/api/admin/matches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMatch(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting match:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update match status
  app.patch("/api/admin/matches/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["new", "contacted", "confirmed", "viewing", "agreed", "vacated", "preliminary_approval", "negotiation"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "حالة غير صالحة" });
      }

      const updated = await storage.updateMatchStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "المطابقة غير موجودة" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update match verification flags
  app.patch("/api/admin/matches/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      const { verificationType, verified } = req.body;
      
      const validTypes = ["property", "buyer", "specs", "financial"];
      if (!validTypes.includes(verificationType)) {
        return res.status(400).json({ error: "نوع التأكيد غير صالح" });
      }

      if (typeof verified !== "boolean") {
        return res.status(400).json({ error: "قيمة verified يجب أن تكون boolean" });
      }

      const updated = await storage.updateMatchVerification(id, verificationType, verified);
      if (!updated) {
        return res.status(404).json({ error: "المطابقة غير موجودة" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating match verification:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/matches/:id/detailed-verifications", async (req, res) => {
    try {
      const { id } = req.params;
      const { detailedVerifications } = req.body;

      if (!detailedVerifications || typeof detailedVerifications !== "object") {
        return res.status(400).json({ error: "التأكيدات التفصيلية غير صالحة" });
      }

      const updated = await storage.updateMatchDetailedVerifications(id, detailedVerifications);
      if (!updated) {
        return res.status(404).json({ error: "المطابقة غير موجودة" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating detailed verifications:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Log call attempt for a match
  app.post("/api/admin/matches/:id/log-call", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "المطابقة غير موجودة" });
      }

      // Update match status to contacted if not already
      if (match.status === "new") {
        await storage.updateMatchStatus(req.params.id, "contacted");
      }

      // Also update isContacted flag
      await storage.updateMatch(req.params.id, { isContacted: true });

      res.json({ success: true, message: "تم تسجيل محاولة الاتصال" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate share link for a match
  app.get("/api/admin/matches/:id/share-link", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "المطابقة غير موجودة" });
      }

      // Generate shareable link (in production, this would be a proper share link)
      const shareLink = `${req.protocol}://${req.get("host")}/property/${match.propertyId}?match=${match.id}`;
      
      res.json({ shareLink, matchId: match.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk actions on matches
  app.post("/api/admin/matches/bulk-action", async (req, res) => {
    try {
      const { matchIds, action, payload } = req.body;
      
      if (!Array.isArray(matchIds) || matchIds.length === 0) {
        return res.status(400).json({ error: "يجب تحديد مطابقات" });
      }

      const results = {
        success: [] as string[],
        failed: [] as string[],
      };

      for (const matchId of matchIds) {
        try {
          if (action === "update-status" && payload?.status) {
            await storage.updateMatchStatus(matchId, payload.status);
            results.success.push(matchId);
          } else if (action === "save") {
            await storage.updateMatch(matchId, { isSaved: true });
            results.success.push(matchId);
          } else if (action === "unsave") {
            await storage.updateMatch(matchId, { isSaved: false });
            results.success.push(matchId);
          } else {
            results.failed.push(matchId);
          }
        } catch (error) {
          results.failed.push(matchId);
        }
      }

      res.json(results);
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
      const clients = await Promise.all(
        preferences.map(async (pref) => {
          const user = users.find((u) => u.id === pref.userId);
          return {
            ...pref,
            userName: user?.name || "غير معروف",
            userPhone: user?.phone || "",
            userEmail: user?.email || "",
          };
        }),
      );

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
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = log.userId ? await storage.getUser(log.userId) : null;
          const preference = log.preferenceId
            ? await storage.getBuyerPreference(log.preferenceId)
            : null;

          // Get property details (use admin method to include inactive properties)
          const propertyDetails = await Promise.all(
            (log.propertyIds || []).map(async (id) => {
              const prop = await storage.getPropertyForAdmin(id);
              return prop
                ? {
                    id,
                    city: prop.city,
                    district: prop.district,
                    price: prop.price,
                  }
                : null;
            }),
          );

          return {
            ...log,
            userName: user?.name || "غير معروف",
            userPhone: user?.phone || "",
            preferenceCity: preference?.city || "",
            propertyDetails: propertyDetails.filter(Boolean),
          };
        }),
      );

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
      const sentPropertyIds =
        await storage.getPropertyIdsSentToPreference(preferenceId);

      // Filter matching properties
      const matchingProperties = allProperties.filter((prop) => {
        // Must be same city
        if (prop.city !== preference.city) return false;

        // District must be in preferred list (if specified)
        if (preference.districts && preference.districts.length > 0) {
          if (!preference.districts.includes(prop.district)) return false;
        }

        // Property type must match
        if (prop.propertyType !== preference.propertyType) return false;

        // Price must be within budget
        if (preference.budgetMin && prop.price < preference.budgetMin)
          return false;
        if (preference.budgetMax && prop.price > preference.budgetMax)
          return false;

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

      const user = preference.userId
        ? await storage.getUser(preference.userId)
        : null;
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Get matching properties
      const allProperties = await storage.getAllProperties();
      const sentPropertyIds =
        await storage.getPropertyIdsSentToPreference(preferenceId);

      const matchingProperties = allProperties
        .filter((prop) => {
          if (prop.city !== preference.city) return false;
          if (preference.districts && preference.districts.length > 0) {
            if (!preference.districts.includes(prop.district)) return false;
          }
          if (prop.propertyType !== preference.propertyType) return false;
          if (preference.budgetMin && prop.price < preference.budgetMin)
            return false;
          if (preference.budgetMax && prop.price > preference.budgetMax)
            return false;
          if (sentPropertyIds.includes(prop.id)) return false;
          if (!prop.isActive) return false;
          return true;
        })
        .slice(0, maxProperties);

      // Prepare message
      let message: string;
      let messageType: "matches" | "no_matches";

      if (matchingProperties.length > 0) {
        const propertyList = matchingProperties
          .map((p) => formatPropertyMessage(p))
          .join("\n\n");
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
        propertyIds: matchingProperties.map((p) => p.id),
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
      const activePreferences = preferences.filter((p) => p.isActive);

      const results = {
        total: activePreferences.length,
        successful: 0,
        failed: 0,
        noMatches: 0,
        details: [] as Array<{
          preferenceId: string;
          userName: string;
          status: string;
          propertiesSent: number;
        }>,
      };

      for (const preference of activePreferences) {
        try {
          const user = preference.userId
            ? await storage.getUser(preference.userId)
            : null;
          if (!user) continue;

          const allProperties = await storage.getAllProperties();
          const sentPropertyIds = await storage.getPropertyIdsSentToPreference(
            preference.id,
          );

          const matchingProperties = allProperties
            .filter((prop) => {
              if (prop.city !== preference.city) return false;
              if (preference.districts && preference.districts.length > 0) {
                if (!preference.districts.includes(prop.district)) return false;
              }
              if (prop.propertyType !== preference.propertyType) return false;
              if (preference.budgetMin && prop.price < preference.budgetMin)
                return false;
              if (preference.budgetMax && prop.price > preference.budgetMax)
                return false;
              if (sentPropertyIds.includes(prop.id)) return false;
              if (!prop.isActive) return false;
              return true;
            })
            .slice(0, maxPropertiesPerClient);

          let message: string;
          let messageType: "matches" | "no_matches";

          if (matchingProperties.length > 0) {
            const propertyList = matchingProperties
              .map((p) => formatPropertyMessage(p))
              .join("\n\n");
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
            propertyIds: matchingProperties.map((p) => p.id),
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
  app.patch(
    "/api/admin/clients/:preferenceId/toggle-status",
    async (req, res) => {
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
    },
  );

  // Toggle property availability
  app.patch(
    "/api/admin/properties/:propertyId/toggle-availability",
    async (req, res) => {
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
    },
  );

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
      const sanitizedSettings = settings.map((s) => ({
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
      const validPlatforms = [
        "snapchat",
        "tiktok",
        "facebook",
        "google",
        "mailchimp",
      ];

      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ error: "منصة غير مدعومة" });
      }

      const {
        isEnabled,
        pixelId,
        accessToken,
        apiKey,
        audienceId,
        conversionApiToken,
        testEventCode,
        dataCenter,
      } = req.body;

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
        return res
          .status(400)
          .json({ error: "Platform and eventName are required" });
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
        return res
          .status(400)
          .json({ error: "slug, titleAr, and contentAr are required" });
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
    interactionType: z.enum([
      "view",
      "save",
      "skip",
      "contact",
      "share",
      "unsave",
    ]),
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
          details: validationResult.error.errors,
        });
      }

      const {
        userId,
        sessionId,
        propertyId,
        interactionType,
        duration,
        deviceType,
      } = validationResult.data;

      // Must have either userId or sessionId for tracking
      if (!userId && !sessionId) {
        return res
          .status(400)
          .json({ error: "Either userId or sessionId is required" });
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
        sessionId as string | undefined,
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
        sessionId as string | undefined,
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
      const segments = await db
        .select()
        .from(audienceSegments)
        .where(eq(audienceSegments.isActive, true));
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
        purchasingPowerTier: z.enum([
          "luxury",
          "premium",
          "mid_range",
          "budget",
          "economy",
        ]),
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
        return res
          .status(400)
          .json({ error: "بيانات غير صالحة", details: result.error.errors });
      }

      const [segment] = await db
        .insert(audienceSegments)
        .values(result.data)
        .returning();
      res.json(segment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get segment details with users
  app.get("/api/segments/:segmentId", async (req, res) => {
    try {
      const { getUsersInSegment } = await import("./audience-segmentation");

      const [segment] = await db
        .select()
        .from(audienceSegments)
        .where(eq(audienceSegments.id, req.params.segmentId));
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
      const { initializeDefaultSegments } = await import(
        "./audience-segmentation"
      );
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
      const { calculatePurchasingPower } = await import(
        "./audience-segmentation"
      );
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
      const campaigns = await db
        .select()
        .from(adCampaigns)
        .orderBy(desc(adCampaigns.createdAt));
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
        channels: z
          .array(z.enum(["whatsapp", "email", "sms", "push"]))
          .default(["whatsapp"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        frequency: z
          .enum(["once", "daily", "weekly", "monthly"])
          .default("once"),
        createdBy: z.string().optional(),
      });

      const result = campaignSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ error: "بيانات غير صالحة", details: result.error.errors });
      }

      const data = {
        ...result.data,
        startDate: result.data.startDate
          ? new Date(result.data.startDate)
          : undefined,
        endDate: result.data.endDate
          ? new Date(result.data.endDate)
          : undefined,
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
      const { getTargetedUsersForCampaign } = await import(
        "./audience-segmentation"
      );

      const [campaign] = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      const targetedUsers = await getTargetedUsersForCampaign(
        req.params.campaignId,
      );

      res.json({ campaign, targetedUsers, targetCount: targetedUsers.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update campaign status
  app.patch("/api/campaigns/:campaignId/status", async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = [
        "draft",
        "scheduled",
        "active",
        "paused",
        "completed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "حالة غير صالحة" });
      }

      const [updated] = await db
        .update(adCampaigns)
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
      const { getTargetedUsersForCampaign } = await import(
        "./audience-segmentation"
      );

      const [campaign] = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      const targetedUsers = await getTargetedUsersForCampaign(
        req.params.campaignId,
      );
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
      await db
        .update(adCampaigns)
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
      const [campaign] = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, req.params.campaignId));
      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      const sends = await db
        .select()
        .from(campaignSends)
        .where(eq(campaignSends.campaignId, req.params.campaignId));

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
        deliveryRate:
          campaign.totalSent > 0
            ? ((campaign.totalDelivered / campaign.totalSent) * 100).toFixed(1)
            : 0,
        openRate:
          campaign.totalDelivered > 0
            ? ((campaign.totalOpened / campaign.totalDelivered) * 100).toFixed(
                1,
              )
            : 0,
        clickRate:
          campaign.totalOpened > 0
            ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(1)
            : 0,
        conversionRate:
          campaign.totalClicked > 0
            ? ((campaign.totalConverted / campaign.totalClicked) * 100).toFixed(
                1,
              )
            : 0,
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
      const segments = await db
        .select()
        .from(audienceSegments)
        .where(eq(audienceSegments.isActive, true));
      const userSegmentCounts = await db
        .select({
          segmentId: userSegments.segmentId,
          count: sql<number>`count(*)::int`,
        })
        .from(userSegments)
        .groupBy(userSegments.segmentId);

      const countMap = new Map(
        userSegmentCounts.map((u) => [u.segmentId, u.count]),
      );

      const summary = segments.map((segment) => ({
        id: segment.id,
        name: segment.name,
        nameAr: segment.nameAr,
        purchasingPowerTier: segment.purchasingPowerTier,
        color: segment.color,
        userCount: countMap.get(segment.id) || 0,
      }));

      const totalUsers = Array.from(countMap.values()).reduce(
        (a, b) => a + b,
        0,
      );

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
      const subscription = await brokerAdsEngine.getBrokerSubscription(
        req.params.userId,
      );
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
      const stats = await brokerAdsEngine.getBrokerDashboardStats(
        req.params.userId,
      );
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
        return res
          .status(401)
          .json({ error: "يجب تسجيل الدخول لإرسال طلب التواصل" });
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
      const leads = await db
        .select()
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
        minPrice: req.query.minPrice
          ? parseInt(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseInt(req.query.maxPrice as string)
          : undefined,
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
      const boosts = await db
        .select()
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
  app.post(
    "/api/properties/:propertyId/recalculate-ranking",
    async (req, res) => {
      try {
        const { brokerAdsEngine } = await import("./broker-ads-engine");
        const score = await brokerAdsEngine.calculatePropertyRankingScore(
          req.params.propertyId,
        );
        res.json({ score });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // ==================== FORM BUILDER API ====================

  // Form Configs
  app.get("/api/admin/form-builder/configs", async (req, res) => {
    try {
      const configs = await formBuilderStorage.getAllFormConfigs();
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/form-builder/configs/:id", async (req, res) => {
    try {
      const config = await formBuilderStorage.getFormConfigById(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "النموذج غير موجود" });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/form-builder/configs", async (req, res) => {
    try {
      const config = await formBuilderStorage.createFormConfig(req.body);
      res.status(201).json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/form-builder/configs/:id", async (req, res) => {
    try {
      const updated = await formBuilderStorage.updateFormConfig(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "النموذج غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/form-builder/configs/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteFormConfig(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get form by name or type (for public use)
  app.get("/api/form-builder/:nameOrType", async (req, res) => {
    try {
      const config = await formBuilderStorage.getCompleteFormConfig(req.params.nameOrType);
      if (!config) {
        return res.status(404).json({ error: "النموذج غير موجود" });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== FORM BUILDER DATA ENDPOINTS ====================
  
  // Get cities (for city_picker)
  app.get("/api/form-builder/cities", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const dbCities = await locationsStorage.getAllCities();
      
      if (dbCities.length > 0) {
        // Use cities from database with districts
        const citiesWithDistricts = await Promise.all(
          dbCities.map(async (city) => {
            const districts = await locationsStorage.getAllDistricts(city.id);
            return {
              name: city.name,
              nameEn: city.nameEn || "",
              region: city.region,
              coordinates: { lat: city.latitude, lng: city.longitude },
              neighborhoods: districts.map(d => ({
                name: d.name,
                nameEn: d.nameEn,
                direction: d.direction,
              })),
            };
          })
        );
        res.json(citiesWithDistricts);
      } else {
        // Fallback to static data
        const { saudiCities } = await import("@shared/saudi-locations");
        res.json(saudiCities);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get districts for a city (updated to use DB with fallback)
  app.get("/api/form-builder/districts/:city", async (req, res) => {
    try {
        const locationsStorage = await import("./locations-storage");
        const city = await locationsStorage.getCityByName(req.params.city);
        
        if (city) {
          // Use districts from database with coordinates
          const districts = await locationsStorage.getAllDistricts(city.id);
        res.json(districts.map(d => ({
          name: d.name,
          nameEn: d.nameEn,
          direction: d.direction,
          latitude: d.latitude,
          longitude: d.longitude,
        })));
      } else {
        // Fallback to static data
        const { saudiCities } = await import("@shared/saudi-locations");
        const staticCity = saudiCities.find(c => c.name === req.params.city);
        if (!staticCity) {
          return res.status(404).json({ error: "المدينة غير موجودة" });
        }
        res.json(staticCity.neighborhoods);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get property types (filtered by category if provided)
  app.get("/api/form-builder/property-types", async (req, res) => {
    try {
      const { getPropertyTypesByCategory } = await import("@/lib/property-form-config");
      const category = req.query.category as "residential" | "commercial" | "" | undefined;
      const types = getPropertyTypesByCategory(category || "");
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get smart tags (filtered by propertyType if provided) - Public API
  app.get("/api/form-builder/smart-tags", async (req, res) => {
    try {
      const propertyType = req.query.propertyType as string | undefined;
      const tags = await formBuilderStorage.getAllSmartTags(propertyType);
      
      if (tags.length > 0) {
        // Return tags from database
        res.json(tags.map(tag => ({ value: tag.tag, label: tag.label })));
      } else {
        // Fallback to static tags if database is empty
        const { SPECIFIC_TAGS, getTagsForPropertyType } = await import("@/lib/property-form-config");
        if (propertyType) {
          const staticTags = getTagsForPropertyType(propertyType);
          res.json(staticTags.map(tag => ({ value: tag, label: tag })));
        } else {
          const allTags = new Set<string>();
          Object.values(SPECIFIC_TAGS).forEach(tags => {
            tags.forEach(tag => allTags.add(tag));
          });
          res.json(Array.from(allTags).map(tag => ({ value: tag, label: tag })));
        }
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SMART TAGS MANAGEMENT API ====================
  
  // Get all smart tags (admin)
  app.get("/api/admin/form-builder/smart-tags", async (req, res) => {
    try {
      const propertyType = req.query.propertyType as string | undefined;
      const tags = await formBuilderStorage.getAllSmartTags(propertyType);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get smart tag by ID
  app.get("/api/admin/form-builder/smart-tags/:id", async (req, res) => {
    try {
      const tag = await formBuilderStorage.getSmartTagById(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: "التاق غير موجود" });
      }
      res.json(tag);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create smart tag
  app.post("/api/admin/form-builder/smart-tags", async (req, res) => {
    try {
      console.log("[Smart Tags] POST request received:", req.body);
      const tag = await formBuilderStorage.createSmartTag(req.body);
      console.log("[Smart Tags] Tag created:", tag);
      res.status(201).json(tag);
    } catch (error: any) {
      console.error("[Smart Tags] Error creating tag:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update smart tag
  app.put("/api/admin/form-builder/smart-tags/:id", async (req, res) => {
    try {
      const updated = await formBuilderStorage.updateSmartTag(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "التاق غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete smart tag
  app.delete("/api/admin/form-builder/smart-tags/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteSmartTag(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reorder smart tags (must be before the general POST route)
  app.post("/api/admin/form-builder/smart-tags/reorder", async (req, res) => {
    try {
      const { tagIds } = req.body;
      if (!Array.isArray(tagIds)) {
        return res.status(400).json({ error: "tagIds يجب أن يكون array" });
      }
      await formBuilderStorage.reorderSmartTags(tagIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== LOCATIONS MANAGEMENT API ====================
  
  const locationsStorage = await import("./locations-storage");

  // Cities API
  app.get("/api/admin/locations/cities", async (req, res) => {
    try {
      const cities = await locationsStorage.getAllCities();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/locations/cities/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const city = await locationsStorage.getCityById(req.params.id);
      if (!city) {
        return res.status(404).json({ error: "المدينة غير موجودة" });
      }
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/cities", async (req, res) => {
    try {
      // Validate input
      const validation = await import("./location-validation");
      const validationResult = validation.validateCityData(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.errors.join(", ") });
      }

      // Check for duplicate city name
      const locationsStorage = await import("./locations-storage");
      const existingCity = await locationsStorage.getCityByName(req.body.name.trim());
      if (existingCity) {
        return res.status(400).json({ error: "المدينة موجودة بالفعل" });
      }

      const city = await locationsStorage.createCity({
        ...req.body,
        name: req.body.name.trim(),
        region: req.body.region.trim(),
        latitude: typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude,
        longitude: typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude,
      });
      res.status(201).json(city);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/locations/cities/:id", async (req, res) => {
    try {
      // Validate input if coordinates are provided
      if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
        const validation = await import("./location-validation");
        const lat = req.body.latitude !== undefined 
          ? (typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude)
          : 0;
        const lng = req.body.longitude !== undefined
          ? (typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude)
          : 0;
        
        const coordsValidation = validation.validateCoordinates(lat, lng);
        if (!coordsValidation.isValid) {
          return res.status(400).json({ error: coordsValidation.errors.join(", ") });
        }
      }

      // Check for duplicate city name if name is being updated
      if (req.body.name) {
        const locationsStorage = await import("./locations-storage");
        const existingCity = await locationsStorage.getCityByName(req.body.name.trim());
        if (existingCity && existingCity.id !== req.params.id) {
          return res.status(400).json({ error: "المدينة موجودة بالفعل" });
        }
      }

      const locationsStorage = await import("./locations-storage");
      const updateData: any = {};
      if (req.body.name) updateData.name = req.body.name.trim();
      if (req.body.region) updateData.region = req.body.region.trim();
      if (req.body.latitude !== undefined) {
        updateData.latitude = typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude;
      }
      if (req.body.longitude !== undefined) {
        updateData.longitude = typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude;
      }
      if (req.body.nameEn !== undefined) updateData.nameEn = req.body.nameEn?.trim();
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      if (req.body.order !== undefined) updateData.order = req.body.order;

      const updated = await locationsStorage.updateCity(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "المدينة غير موجودة" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/locations/cities/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      await locationsStorage.deleteCity(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/cities/reorder", async (req, res) => {
    try {
      const { cityIds } = req.body;
      if (!Array.isArray(cityIds)) {
        return res.status(400).json({ error: "cityIds يجب أن يكون array" });
      }
      const locationsStorage = await import("./locations-storage");
      await locationsStorage.reorderCities(cityIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export cities to CSV
  app.get("/api/admin/locations/cities/export", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const cities = await locationsStorage.getAllCities();
      
      // Create CSV content
      const csvHeader = "name,nameEn,region,latitude,longitude,isActive,order\n";
      const csvRows = cities.map(city => 
        `"${city.name}","${city.nameEn || ""}","${city.region}",${city.latitude},${city.longitude},${city.isActive},${city.order}`
      ).join("\n");
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=cities-${new Date().toISOString().split("T")[0]}.csv`);
      res.send("\ufeff" + csvContent); // BOM for Excel UTF-8 support
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import cities from CSV
  app.post("/api/admin/locations/cities/import", async (req, res) => {
    try {
      if (!req.body.fileContent) {
        return res.status(400).json({ error: "لم يتم إرسال محتوى الملف" });
      }
      
      const fileContent = req.body.fileContent;
      
      // Parse CSV (simple parser)
      const lines = fileContent.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ error: "الملف فارغ أو غير صحيح" });
      }
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const nameIndex = headers.indexOf("name");
      const nameEnIndex = headers.indexOf("nameEn");
      const regionIndex = headers.indexOf("region");
      const latIndex = headers.indexOf("latitude");
      const lngIndex = headers.indexOf("longitude");
      const isActiveIndex = headers.indexOf("isActive");
      const orderIndex = headers.indexOf("order");
      
      if (nameIndex === -1 || regionIndex === -1 || latIndex === -1 || lngIndex === -1) {
        return res.status(400).json({ error: "الملف لا يحتوي على الحقول المطلوبة" });
      }
      
      const locationsStorage = await import("./locations-storage");
      const validation = await import("./location-validation");
      
      let imported = 0;
      let errors = 0;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const name = values[nameIndex];
          const nameEn = values[nameEnIndex] || "";
          const region = values[regionIndex];
          const lat = parseFloat(values[latIndex]);
          const lng = parseFloat(values[lngIndex]);
          const isActive = values[isActiveIndex] !== undefined ? values[isActiveIndex] === "true" : true;
          const order = values[orderIndex] ? parseInt(values[orderIndex]) : 0;
          
          // Validate
          const validationResult = validation.validateCityData({ name, region, latitude: lat, longitude: lng });
          if (!validationResult.isValid) {
            errors++;
            continue;
          }
          
          // Check if exists
          const existing = await locationsStorage.getCityByName(name);
          if (existing) {
            // Update existing
            await locationsStorage.updateCity(existing.id, { nameEn, region, latitude: lat, longitude: lng, isActive, order });
          } else {
            // Create new
            await locationsStorage.createCity({ name, nameEn, region, latitude: lat, longitude: lng, isActive, order });
          }
          imported++;
        } catch (error) {
          errors++;
        }
      }
      
      res.json({ imported, errors, total: lines.length - 1 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Districts API
  app.get("/api/admin/locations/districts", async (req, res) => {
    try {
      const cityId = req.query.cityId as string | undefined;
      const locationsStorage = await import("./locations-storage");
      const districts = await locationsStorage.getAllDistricts(cityId);
      res.json(districts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/locations/districts/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const district = await locationsStorage.getDistrictById(req.params.id);
      if (!district) {
        return res.status(404).json({ error: "الحي غير موجود" });
      }
      res.json(district);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/districts", async (req, res) => {
    try {
      // Validate input
      const validation = await import("./location-validation");
      const validationResult = validation.validateDistrictData(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.errors.join(", ") });
      }

      // Check for duplicate district name in the same city
      const locationsStorage = await import("./locations-storage");
      const existingDistrict = await locationsStorage.getDistrictByName(req.body.cityId, req.body.name.trim());
      if (existingDistrict) {
        return res.status(400).json({ error: "الحي موجود بالفعل في هذه المدينة" });
      }

      const district = await locationsStorage.createDistrict({
        ...req.body,
        name: req.body.name.trim(),
        latitude: typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude,
        longitude: typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude,
      });
      res.status(201).json(district);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/locations/districts/:id", async (req, res) => {
    try {
      // Validate coordinates if provided
      if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
        const validation = await import("./location-validation");
        const lat = req.body.latitude !== undefined 
          ? (typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude)
          : 0;
        const lng = req.body.longitude !== undefined
          ? (typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude)
          : 0;
        
        const coordsValidation = validation.validateCoordinates(lat, lng);
        if (!coordsValidation.isValid) {
          return res.status(400).json({ error: coordsValidation.errors.join(", ") });
        }
      }

      // Check for duplicate district name if name and cityId are being updated
      if (req.body.name && req.body.cityId) {
        const locationsStorage = await import("./locations-storage");
        const existingDistrict = await locationsStorage.getDistrictByName(req.body.cityId, req.body.name.trim());
        if (existingDistrict && existingDistrict.id !== req.params.id) {
          return res.status(400).json({ error: "الحي موجود بالفعل في هذه المدينة" });
        }
      }

      const locationsStorage = await import("./locations-storage");
      const updateData: any = {};
      if (req.body.cityId) updateData.cityId = req.body.cityId;
      if (req.body.name) updateData.name = req.body.name.trim();
      if (req.body.latitude !== undefined) {
        updateData.latitude = typeof req.body.latitude === "string" ? parseFloat(req.body.latitude) : req.body.latitude;
      }
      if (req.body.longitude !== undefined) {
        updateData.longitude = typeof req.body.longitude === "string" ? parseFloat(req.body.longitude) : req.body.longitude;
      }
      if (req.body.nameEn !== undefined) updateData.nameEn = req.body.nameEn?.trim();
      if (req.body.direction !== undefined) updateData.direction = req.body.direction;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      if (req.body.order !== undefined) updateData.order = req.body.order;

      const updated = await locationsStorage.updateDistrict(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "الحي غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/locations/districts/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      await locationsStorage.deleteDistrict(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/districts/reorder", async (req, res) => {
    try {
      const { districtIds } = req.body;
      if (!Array.isArray(districtIds)) {
        return res.status(400).json({ error: "districtIds يجب أن يكون array" });
      }
      const locationsStorage = await import("./locations-storage");
      await locationsStorage.reorderDistricts(districtIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Directions API
  app.get("/api/admin/locations/directions", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const directions = await locationsStorage.getAllDirections();
      res.json(directions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/locations/directions/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const direction = await locationsStorage.getDirectionById(req.params.id);
      if (!direction) {
        return res.status(404).json({ error: "الاتجاه غير موجود" });
      }
      res.json(direction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/directions", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const direction = await locationsStorage.createDirection(req.body);
      res.status(201).json(direction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/locations/directions/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      const updated = await locationsStorage.updateDirection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "الاتجاه غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/locations/directions/:id", async (req, res) => {
    try {
      const locationsStorage = await import("./locations-storage");
      await locationsStorage.deleteDirection(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Geocoding API - للحصول على الإحداثيات تلقائياً
  app.post("/api/admin/locations/geocode/city", async (req, res) => {
    try {
      const { geocodeCity } = await import("./geocoding-service");
      const { cityName, region } = req.body;
      
      if (!cityName) {
        return res.status(400).json({ error: "اسم المدينة مطلوب" });
      }
      
      const result = await geocodeCity(cityName, region);
      
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "لم يتم العثور على إحداثيات للمدينة" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations/geocode/district", async (req, res) => {
    try {
      const { geocodeDistrict } = await import("./geocoding-service");
      const { districtName, cityName, region } = req.body;
      
      if (!districtName || !cityName) {
        return res.status(400).json({ error: "اسم الحي والمدينة مطلوبان" });
      }
      
      const result = await geocodeDistrict(districtName, cityName, region);
      
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "لم يتم العثور على إحداثيات للحي" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get special field types
  app.get("/api/form-builder/fields/special-types", async (req, res) => {
    try {
      res.json([
        { value: "city_picker", label: "اختيار المدينة", description: "حقل خاص لاختيار المدينة مع الأحياء" },
        { value: "district_picker", label: "اختيار الأحياء", description: "حقل خاص لاختيار الأحياء (يتطلب اختيار المدينة أولاً)" },
        { value: "property_type_picker", label: "اختيار نوع العقار", description: "حقل خاص لاختيار نوع العقار مع التصفية حسب الفئة" },
        { value: "smart_tags_picker", label: "الوسوم الذكية", description: "حقل خاص لاختيار الوسوم الذكية حسب نوع العقار" },
        { value: "location_map", label: "خريطة الموقع", description: "حقل خاص لاختيار الموقع على الخريطة" },
      ]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Form Steps
  app.get("/api/admin/form-builder/steps/:formId", async (req, res) => {
    try {
      const steps = await formBuilderStorage.getStepsByFormId(req.params.formId);
      res.json(steps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/form-builder/steps", async (req, res) => {
    try {
      const step = await formBuilderStorage.createStep(req.body);
      res.status(201).json(step);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/form-builder/steps/:id", async (req, res) => {
    try {
      const updated = await formBuilderStorage.updateStep(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "الخطوة غير موجودة" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/form-builder/steps/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteStep(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/form-builder/steps/reorder", async (req, res) => {
    try {
      const { stepIds } = req.body;
      if (!Array.isArray(stepIds)) {
        return res.status(400).json({ error: "يجب إرسال مصفوفة من معرفات الخطوات" });
      }
      await formBuilderStorage.reorderSteps(stepIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Form Fields
  app.get("/api/admin/form-builder/fields/:stepId", async (req, res) => {
    try {
      const fields = await formBuilderStorage.getFieldsByStepId(req.params.stepId);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/form-builder/fields", async (req, res) => {
    try {
      const field = await formBuilderStorage.createField(req.body);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/form-builder/fields/:id", async (req, res) => {
    try {
      const updated = await formBuilderStorage.updateField(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "الحقل غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/form-builder/fields/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteField(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/form-builder/fields/reorder", async (req, res) => {
    try {
      const { fieldIds } = req.body;
      if (!Array.isArray(fieldIds)) {
        return res.status(400).json({ error: "يجب إرسال مصفوفة من معرفات الحقول" });
      }
      // Update order for each field
      for (let i = 0; i < fieldIds.length; i++) {
        await formBuilderStorage.updateField(fieldIds[i], { order: i + 1 });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Field Options
  app.get("/api/admin/form-builder/options/:fieldId", async (req, res) => {
    try {
      const options = await formBuilderStorage.getOptionsByFieldId(req.params.fieldId);
      res.json(options);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/form-builder/options", async (req, res) => {
    try {
      const option = await formBuilderStorage.createOption(req.body);
      res.status(201).json(option);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/form-builder/options/:id", async (req, res) => {
    try {
      const updated = await formBuilderStorage.updateOption(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "الخيار غير موجود" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/form-builder/options/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteOption(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete Form Config (for frontend)
  app.get("/api/form-builder/:formName", async (req, res) => {
    try {
      const formConfig = await formBuilderStorage.getCompleteFormConfig(req.params.formName);
      if (!formConfig) {
        return res.status(404).json({ error: "النموذج غير موجود" });
      }
      res.json(formConfig);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unified Form Submission Endpoint
  app.post("/api/form-builder/submit/:formName", async (req, res) => {
    try {
      const { formName } = req.params;
      const formData = req.body;
      const result = await handleFormSubmission(formName, formData);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "حدث خطأ أثناء إرسال البيانات" });
    }
  });

  // ==================== FORM FIELD CONFIGS API ====================

  // Get all configs for a field
  app.get("/api/admin/form-builder/fields/:fieldId/configs", async (req, res) => {
    try {
      const configs = await formBuilderStorage.getFormFieldConfigs(req.params.fieldId);
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a field config
  app.post("/api/admin/form-builder/fields/:fieldId/configs", async (req, res) => {
    try {
      const { configType, configData, isActive } = req.body;
      const newConfig = await formBuilderStorage.createFormFieldConfig({
        fieldId: req.params.fieldId,
        configType,
        configData: configData || {},
        isActive: isActive !== undefined ? isActive : true,
      });
      res.status(201).json(newConfig);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a field config
  app.put("/api/admin/form-builder/fields/configs/:id", async (req, res) => {
    try {
      const { configType, configData, isActive } = req.body;
      const updatedConfig = await formBuilderStorage.updateFormFieldConfig(req.params.id, {
        configType,
        configData,
        isActive,
      });
      if (!updatedConfig) {
        return res.status(404).json({ error: "إعداد الحقل غير موجود" });
      }
      res.json(updatedConfig);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a field config
  app.delete("/api/admin/form-builder/fields/configs/:id", async (req, res) => {
    try {
      await formBuilderStorage.deleteFormFieldConfig(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== APPOINTMENTS (BOOKING SYSTEM) ====================
  
  app.post("/api/appointments", async (req, res) => {
    try {
      const { matchId, buyerId, sellerId, appointmentDate, timeSlot, notes, location } = req.body;
      if (!buyerId || !sellerId || !appointmentDate || !timeSlot) {
        return res.status(400).json({ error: "بيانات ناقصة" });
      }
      const result = await db.insert(appointments).values({
        matchId,
        buyerId,
        sellerId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        notes,
        location,
        status: "pending",
      }).returning();
      res.status(201).json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const { userId, matchId, status } = req.query;
      let query = db.select().from(appointments);
      
      if (userId) {
        query = query.where(
          or(eq(appointments.buyerId, userId as string), eq(appointments.sellerId, userId as string))
        );
      }
      if (matchId) {
        query = query.where(eq(appointments.matchId, matchId as string));
      }
      if (status) {
        query = query.where(eq(appointments.status, status as string));
      }
      
      const result = await query.orderBy(desc(appointments.appointmentDate));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { appointmentDate, timeSlot, status, notes, location } = req.body;
      const result = await db
        .update(appointments)
        .set({
          ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
          ...(timeSlot && { timeSlot }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          ...(location !== undefined && { location }),
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, req.params.id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: "الموعد غير موجود" });
      }
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      await db.delete(appointments).where(eq(appointments.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== LANDING PAGES API ====================

  // Get landing page by slug
  app.get("/api/landing-pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const marketerRef = req.query.ref as string | undefined;

      // Track view
      if (marketerRef) {
        await landingPageService.trackLandingPageView(slug, marketerRef);
      }

      const landingPageData = await landingPageService.getLandingPageBySlug(slug);
      
      if (!landingPageData) {
        return res.status(404).json({ error: "صفحة الهبوط غير موجودة" });
      }

      res.json(landingPageData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create landing page (admin)
  app.post("/api/landing-pages", async (req, res) => {
    try {
      const { propertyId, slug, lockedContent } = req.body;
      const currentUserId = req.headers["x-user-id"] as string | undefined;

      if (!propertyId) {
        return res.status(400).json({ error: "معرف العقار مطلوب" });
      }

      const landingPage = await landingPageService.createLandingPage({
        propertyId,
        slug,
        createdBy: currentUserId || undefined,
        lockedContent,
      });

      res.json(landingPage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register lead (Stage 1: Basic info)
  app.post("/api/landing-pages/:slug/lead", async (req, res) => {
    try {
      const { slug } = req.params;
      const { name, phone, email } = req.body;
      const marketerRef = req.query.ref as string | undefined;

      if (!name || !phone) {
        return res.status(400).json({ error: "الاسم والجوال مطلوبان" });
      }

      // Get landing page
      const landingPageData = await landingPageService.getLandingPageBySlug(slug);
      if (!landingPageData) {
        return res.status(404).json({ error: "صفحة الهبوط غير موجودة" });
      }

      const { profile, unlockToken } = await landingPageService.createProgressiveProfile({
        name,
        phone,
        email,
        propertyId: landingPageData.property.id,
        landingPageId: landingPageData.landingPage.id,
        marketerRef,
      });

      res.json({ profile, unlockToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify unlock token
  app.get("/api/landing-pages/:slug/unlock", async (req, res) => {
    try {
      const { slug } = req.params;
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "رمز الوصول مطلوب" });
      }

      const landingPageData = await landingPageService.getLandingPageBySlug(slug);
      if (!landingPageData) {
        return res.status(404).json({ error: "صفحة الهبوط غير موجودة" });
      }

      const isValid = await landingPageService.verifyUnlockToken(
        token,
        landingPageData.property.id
      );

      res.json({ valid: isValid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create booking
  app.post("/api/landing-pages/:slug/booking", async (req, res) => {
    try {
      const { slug } = req.params;
      const { visitorPhone, appointmentDate, timeSlot, notes } = req.body;

      if (!visitorPhone || !appointmentDate || !timeSlot) {
        return res.status(400).json({ error: "البيانات المطلوبة غير مكتملة" });
      }

      const landingPageData = await landingPageService.getLandingPageBySlug(slug);
      if (!landingPageData) {
        return res.status(404).json({ error: "صفحة الهبوط غير موجودة" });
      }

      const appointment = await landingPageService.createLandingPageBooking({
        propertyId: landingPageData.property.id,
        visitorPhone,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        notes,
      });

      // Send WhatsApp notification to seller
      if (landingPageData.seller?.phone) {
        const message = `تم حجز معاينة جديدة للعقار في ${landingPageData.property.district}\nالتاريخ: ${new Date(appointmentDate).toLocaleDateString('ar-SA')}\nالفترة: ${timeSlot === 'morning' ? 'صباحاً' : timeSlot === 'afternoon' ? 'ظهراً' : 'مساءً'}`;
        await sendWhatsAppMessage(landingPageData.seller.phone, message);
      }

      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete profile (Stage 2: Preferences)
  app.post("/api/landing-pages/:slug/complete", async (req, res) => {
    try {
      const { slug } = req.params;
      const { visitorPhone, preferences } = req.body;

      if (!visitorPhone || !preferences) {
        return res.status(400).json({ error: "البيانات المطلوبة غير مكتملة" });
      }

      const { buyerPreference, userId } = await landingPageService.completeProgressiveProfile({
        visitorPhone,
        preferences,
      });

      // Find matching properties
      await storage.findMatchesForPreference(buyerPreference.id);
      
      // Get matches from database
      const matchResults = await db
        .select({
          property: properties,
          matchScore: matches.matchScore,
        })
        .from(matches)
        .leftJoin(properties, eq(matches.propertyId, properties.id))
        .where(eq(matches.buyerPreferenceId, buyerPreference.id))
        .orderBy(desc(matches.matchScore))
        .limit(5);

      const matchingProperties = matchResults
        .filter((m) => m.property !== null)
        .map((m) => m.property as typeof properties.$inferSelect);

      res.json({
        buyerPreference,
        userId,
        matchingProperties: matchingProperties.slice(0, 5), // Top 5 matches
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MARKETER LINKS API ====================

  // Create marketer link
  app.post("/api/marketer-links", async (req, res) => {
    try {
      const { landingPageId, marketerId, marketerName, trackingCode, commissionRate } = req.body;

      if (!landingPageId) {
        return res.status(400).json({ error: "معرف صفحة الهبوط مطلوب" });
      }

      const marketerLink = await landingPageService.createMarketerLink({
        landingPageId,
        marketerId,
        marketerName,
        trackingCode,
        commissionRate,
      });

      res.json(marketerLink);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketer stats
  app.get("/api/marketer-links/stats", async (req, res) => {
    try {
      const marketerId = req.query.marketerId as string | undefined;
      const trackingCode = req.query.trackingCode as string | undefined;

      if (!marketerId && !trackingCode) {
        return res.status(400).json({ error: "معرف المسوق أو رمز التتبع مطلوب" });
      }

      const whereConditions = [];
      if (marketerId) {
        whereConditions.push(eq(marketerLinks.marketerId, marketerId));
      }
      if (trackingCode) {
        whereConditions.push(eq(marketerLinks.trackingCode, trackingCode));
      }

      const links = await db
        .select()
        .from(marketerLinks)
        .where(and(...whereConditions));

      // Get all stats
      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const totalConversions = links.reduce((sum, link) => sum + link.conversions, 0);
      const totalBookings = links.reduce((sum, link) => sum + link.bookings, 0);
      const totalCommission = links.reduce((sum, link) => sum + link.totalCommission, 0);

      res.json({
        links,
        stats: {
          totalClicks,
          totalConversions,
          totalBookings,
          totalCommission,
          conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
          bookingRate: totalConversions > 0 ? (totalBookings / totalConversions) * 100 : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track marketer link click
  app.post("/api/marketer-links/:id/track", async (req, res) => {
    try {
      const { id } = req.params;

      const [link] = await db
        .select()
        .from(marketerLinks)
        .where(eq(marketerLinks.id, id))
        .limit(1);

      if (!link) {
        return res.status(404).json({ error: "الرابط غير موجود" });
      }

      await db
        .update(marketerLinks)
        .set({
          clicks: link.clicks + 1,
          updatedAt: new Date(),
        })
        .where(eq(marketerLinks.id, id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all landing pages (admin)
  app.get("/api/landing-pages", async (req, res) => {
    try {
      const pages = await db
        .select({
          landingPage: landingPages,
          property: properties,
        })
        .from(landingPages)
        .leftJoin(properties, eq(landingPages.propertyId, properties.id))
        .orderBy(desc(landingPages.createdAt));

      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== LEADS MANAGEMENT API ====================

  // Get all leads
  app.get("/api/leads", async (req, res) => {
    try {
      const sellerId = req.query.sellerId as string | undefined;
      const propertyId = req.query.propertyId as string | undefined;
      const status = req.query.status as string | undefined;
      const source = req.query.source as string | undefined;

      const leads = await leadsService.getAllLeads({
        sellerId,
        propertyId,
        status,
        source,
      });

      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get lead by ID
  app.get("/api/leads/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      
      if (type !== "progressive" && type !== "property") {
        return res.status(400).json({ error: "Invalid lead type" });
      }

      const lead = await leadsService.getLeadById(id, type);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      res.json(lead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Convert lead to buyer preference
  app.post("/api/leads/:type/:id/convert", async (req, res) => {
    try {
      const { type, id } = req.params;
      const { preferences } = req.body;

      if (type !== "progressive" && type !== "property") {
        return res.status(400).json({ error: "Invalid lead type" });
      }

      if (!preferences || !preferences.city || !preferences.propertyType) {
        return res.status(400).json({ error: "City and property type are required" });
      }

      const result = await leadsService.convertLeadToBuyerPreference(
        id,
        type as "progressive" | "property",
        preferences
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update lead status
  app.put("/api/leads/:type/:id/status", async (req, res) => {
    try {
      const { type, id } = req.params;
      const { status } = req.body;

      if (type !== "progressive" && type !== "property") {
        return res.status(400).json({ error: "Invalid lead type" });
      }

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      await leadsService.updateLeadStatus(id, type as "progressive" | "property", status);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add notes to lead
  app.post("/api/leads/:type/:id/notes", async (req, res) => {
    try {
      const { type, id } = req.params;
      const { notes } = req.body;

      if (type !== "progressive" && type !== "property") {
        return res.status(400).json({ error: "Invalid lead type" });
      }

      if (!notes) {
        return res.status(400).json({ error: "Notes are required" });
      }

      await leadsService.addLeadNotes(id, type as "progressive" | "property", notes);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get seller leads
  app.get("/api/sellers/:id/leads", async (req, res) => {
    try {
      const { id } = req.params;
      const status = req.query.status as string | undefined;

      const leads = await leadsService.getAllLeads({
        sellerId: id,
        status,
      });

      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

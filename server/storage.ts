import { 
  users, type User, type InsertUser,
  buyerPreferences, type BuyerPreference, type InsertBuyerPreference,
  properties, type Property, type InsertProperty,
  matches, type Match, type InsertMatch,
  contactRequests, type ContactRequest, type InsertContactRequest,
  sendLogs, type SendLog, type InsertSendLog,
  marketingSettings, type MarketingSetting, type InsertMarketingSetting,
  marketingEvents, type MarketingEvent, type InsertMarketingEvent,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  staticPages, type StaticPage, type InsertStaticPage,
  webauthnCredentials, type WebauthnCredential, type InsertWebauthnCredential,
  webauthnChallenges, type WebauthnChallenge, type InsertWebauthnChallenge,
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, sql, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getUsers(role?: string): Promise<User[]>;

  // Buyer Preferences
  getBuyerPreference(id: string): Promise<BuyerPreference | undefined>;
  getBuyerPreferencesByUser(userId: string): Promise<BuyerPreference[]>;
  createBuyerPreference(pref: InsertBuyerPreference): Promise<BuyerPreference>;
  updateBuyerPreference(id: string, pref: Partial<InsertBuyerPreference>): Promise<BuyerPreference | undefined>;
  deleteBuyerPreference(id: string): Promise<void>;
  getAllBuyerPreferences(): Promise<BuyerPreference[]>;
  getAllBuyerPreferencesForAdmin(): Promise<BuyerPreference[]>;

  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyForAdmin(id: string): Promise<Property | undefined>;
  getPropertiesBySeller(sellerId: string): Promise<Property[]>;
  createProperty(prop: InsertProperty): Promise<Property>;
  updateProperty(id: string, prop: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<void>;
  getAllProperties(): Promise<Property[]>;
  getAllPropertiesForAdmin(): Promise<Property[]>;
  incrementPropertyViews(id: string): Promise<void>;

  // Matches
  getMatch(id: string): Promise<Match | undefined>;
  getMatchesByBuyerPreference(prefId: string): Promise<Match[]>;
  getMatchesByProperty(propId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
  updateMatchStatus(id: string, status: string): Promise<Match | undefined>;
  updateMatchVerification(id: string, verificationType: "property" | "buyer" | "specs" | "financial", verified: boolean): Promise<Match | undefined>;
  updateMatchDetailedVerifications(id: string, detailedVerifications: {
    city: boolean;
    district: boolean;
    propertyType: boolean;
    price: boolean;
    rooms: boolean;
    bathrooms: boolean;
    area: boolean;
  }): Promise<Match | undefined>;
  findMatchesForProperty(propertyId: string): Promise<void>;
  findMatchesForPreference(preferenceId: string): Promise<void>;

  // Matches - additional
  getAllMatches(): Promise<Match[]>;
  deleteMatch(id: string): Promise<void>;

  // Contact Requests
  createContactRequest(req: InsertContactRequest): Promise<ContactRequest>;
  getContactRequestsByBuyer(buyerId: string): Promise<ContactRequest[]>;
  getContactRequestsByProperty(propertyId: string): Promise<ContactRequest[]>;
  getAllContactRequests(): Promise<ContactRequest[]>;

  // Analytics
  getTopDistricts(city: string, limit?: number): Promise<{ district: string; count: number }[]>;
  getAverageBudgetByCity(): Promise<{ city: string; avgBudget: number }[]>;
  getDemandByPropertyType(): Promise<{ propertyType: string; count: number }[]>;
  
  // Market Analytics
  getSupplyDemandIndex(city?: string): Promise<{ city: string; supply: number; demand: number; ratio: number; marketType: "buyer" | "balanced" | "seller" }[]>;
  getPricePerSquareMeter(city?: string, district?: string, propertyType?: string): Promise<{ city: string; district?: string; propertyType?: string; avgPrice: number; avgArea: number; pricePerSqm: number; count: number }[]>;
  getDistrictPopularityScore(city?: string, limit?: number): Promise<{ city: string; district: string; demandCount: number; matchCount: number; contactCount: number; popularityScore: number }[]>;
  getMarketQualityIndex(city?: string): Promise<{ city: string; avgMatchScore: number; conversionRate: number; engagementRate: number; qualityScore: number; qualityLevel: "excellent" | "good" | "average" | "poor" }[]>;
  getPriceTrends(city?: string, propertyType?: string, months?: number): Promise<{ period: string; avgPrice: number; count: number; changePercent?: number }[]>;

  // Send Logs
  createSendLog(log: InsertSendLog): Promise<SendLog>;
  getSendLogs(): Promise<SendLog[]>;
  getSendLogsByUser(userId: string): Promise<SendLog[]>;
  getSendLogsByPreference(preferenceId: string): Promise<SendLog[]>;
  updateSendLog(id: string, log: Partial<InsertSendLog>): Promise<SendLog | undefined>;
  getPropertyIdsSentToPreference(preferenceId: string): Promise<string[]>;

  // Marketing Settings
  getMarketingSettings(): Promise<MarketingSetting[]>;
  getMarketingSetting(platform: string): Promise<MarketingSetting | undefined>;
  upsertMarketingSetting(setting: InsertMarketingSetting): Promise<MarketingSetting>;
  deleteMarketingSetting(platform: string): Promise<void>;
  getEnabledMarketingSettings(): Promise<MarketingSetting[]>;

  // Marketing Events
  createMarketingEvent(event: InsertMarketingEvent): Promise<MarketingEvent>;
  getMarketingEvents(limit?: number): Promise<MarketingEvent[]>;
  getMarketingEventsByPlatform(platform: string): Promise<MarketingEvent[]>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  getConversationByParticipants(buyerId: string, sellerId: string, propertyId: string): Promise<Conversation | undefined>;
  createConversation(conv: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conv: Partial<InsertConversation>): Promise<Conversation | undefined>;
  updateConversationLastMessage(id: string): Promise<void>;
  markConversationAsRead(id: string, userId: string): Promise<void>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(msg: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

  // Static Pages
  getStaticPage(slug: string): Promise<StaticPage | undefined>;
  getAllStaticPages(): Promise<StaticPage[]>;
  upsertStaticPage(page: InsertStaticPage): Promise<StaticPage>;

  // WebAuthn Credentials
  createWebauthnCredential(cred: InsertWebauthnCredential): Promise<WebauthnCredential>;
  getWebauthnCredentialsByUser(userId: string): Promise<WebauthnCredential[]>;
  getWebauthnCredentialById(credentialId: string): Promise<WebauthnCredential | undefined>;
  updateWebauthnCredential(id: string, data: Partial<InsertWebauthnCredential>): Promise<WebauthnCredential | undefined>;
  deleteWebauthnCredential(id: string): Promise<void>;

  // WebAuthn Challenges
  createWebauthnChallenge(challenge: InsertWebauthnChallenge): Promise<WebauthnChallenge>;
  getWebauthnChallenge(challenge: string): Promise<WebauthnChallenge | undefined>;
  deleteWebauthnChallenge(challenge: string): Promise<void>;
  deleteExpiredWebauthnChallenges(): Promise<void>;

  // Password Reset Tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return db.select().from(users).where(eq(users.role, role));
    }
    return db.select().from(users);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // حذف طلبات الاتصال المرتبطة
      await db.delete(contactRequests).where(eq(contactRequests.buyerId, id));
      
      // حذف المطابقات المرتبطة بالرغبات
      const userPreferences = await db.select().from(buyerPreferences).where(eq(buyerPreferences.userId, id));
      for (const pref of userPreferences) {
        // حذف طلبات الاتصال المرتبطة بالمطابقات
        const prefMatches = await db.select().from(matches).where(eq(matches.buyerPreferenceId, pref.id));
        for (const match of prefMatches) {
          try {
            await db.delete(contactRequests).where(eq(contactRequests.matchId, match.id));
          } catch (e) {
            // تجاهل الأخطاء إذا كان الجدول غير موجود
            console.warn("Error deleting contact requests:", e);
          }
        }
        await db.delete(matches).where(eq(matches.buyerPreferenceId, pref.id));
      }
      // حذف الرغبات المرتبطة
      await db.delete(buyerPreferences).where(eq(buyerPreferences.userId, id));
      
      // حذف المطابقات المرتبطة بالعقارات
      const userProperties = await db.select().from(properties).where(eq(properties.sellerId, id));
      for (const prop of userProperties) {
        // حذف طلبات الاتصال المرتبطة بالمطابقات
        const propMatches = await db.select().from(matches).where(eq(matches.propertyId, prop.id));
        for (const match of propMatches) {
          try {
            await db.delete(contactRequests).where(eq(contactRequests.matchId, match.id));
          } catch (e) {
            // تجاهل الأخطاء إذا كان الجدول غير موجود
            console.warn("Error deleting contact requests:", e);
          }
        }
        await db.delete(matches).where(eq(matches.propertyId, prop.id));
      }
      // حذف العقارات المرتبطة
      await db.delete(properties).where(eq(properties.sellerId, id));
      
      // حذف المستخدم
      await db.delete(users).where(eq(users.id, id));
    } catch (error: any) {
      // إذا كان الخطأ متعلق بعمود غير موجود، تجاهله
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Column does not exist, continuing deletion:", error.message);
        // محاولة الحذف بدون العمود المفقود
        await db.delete(users).where(eq(users.id, id));
      } else {
        throw error;
      }
    }
  }

  // Buyer Preferences
  async getBuyerPreference(id: string): Promise<BuyerPreference | undefined> {
    const [pref] = await db.select().from(buyerPreferences).where(eq(buyerPreferences.id, id));
    return pref || undefined;
  }

  async getBuyerPreferencesByUser(userId: string): Promise<BuyerPreference[]> {
    return db.select().from(buyerPreferences).where(eq(buyerPreferences.userId, userId));
  }

  async createBuyerPreference(pref: InsertBuyerPreference): Promise<BuyerPreference> {
    const [result] = await db.insert(buyerPreferences).values(pref).returning();
    return result;
  }

  async updateBuyerPreference(id: string, pref: Partial<InsertBuyerPreference>): Promise<BuyerPreference | undefined> {
    const [result] = await db.update(buyerPreferences).set(pref).where(eq(buyerPreferences.id, id)).returning();
    return result || undefined;
  }

  async deleteBuyerPreference(id: string): Promise<void> {
    try {
      // حذف send_logs المرتبطة أولاً
      await db.delete(sendLogs).where(eq(sendLogs.preferenceId, id));
      
      // حذف طلبات الاتصال المرتبطة بالمطابقات
      const prefMatches = await db.select().from(matches).where(eq(matches.buyerPreferenceId, id));
      for (const match of prefMatches) {
        try {
          await db.delete(contactRequests).where(eq(contactRequests.matchId, match.id));
        } catch (e) {
          console.warn("Error deleting contact requests:", e);
        }
      }
      // حذف المطابقات المرتبطة
      await db.delete(matches).where(eq(matches.buyerPreferenceId, id));
      // ثم حذف الرغبة
      await db.delete(buyerPreferences).where(eq(buyerPreferences.id, id));
    } catch (error: any) {
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Column does not exist, continuing deletion:", error.message);
        await db.delete(buyerPreferences).where(eq(buyerPreferences.id, id));
      } else {
        throw error;
      }
    }
  }

  async getAllBuyerPreferences(): Promise<BuyerPreference[]> {
    return db.select().from(buyerPreferences).where(eq(buyerPreferences.isActive, true));
  }

  async getAllBuyerPreferencesForAdmin(): Promise<BuyerPreference[]> {
    return db.select().from(buyerPreferences);
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const [prop] = await db.select().from(properties).where(eq(properties.id, id));
    return prop || undefined;
  }

  async getPropertyForAdmin(id: string): Promise<Property | undefined> {
    const [prop] = await db.select().from(properties).where(eq(properties.id, id));
    return prop || undefined;
  }

  async getPropertiesBySeller(sellerId: string): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.sellerId, sellerId));
  }

  async createProperty(prop: InsertProperty): Promise<Property> {
    const [result] = await db.insert(properties).values(prop).returning();
    return result;
  }

  async updateProperty(id: string, prop: Partial<InsertProperty>): Promise<Property | undefined> {
    const [result] = await db.update(properties).set(prop).where(eq(properties.id, id)).returning();
    return result || undefined;
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      // حذف طلبات الاتصال المرتبطة بالمطابقات أولاً
      const propMatches = await db.select().from(matches).where(eq(matches.propertyId, id));
      for (const match of propMatches) {
        try {
          await db.delete(contactRequests).where(eq(contactRequests.matchId, match.id));
        } catch (e) {
          console.warn("Error deleting contact requests:", e);
        }
      }
      // حذف المطابقات المرتبطة
      await db.delete(matches).where(eq(matches.propertyId, id));
      // حذف طلبات الاتصال المرتبطة بالعقار
      try {
        await db.delete(contactRequests).where(eq(contactRequests.propertyId, id));
      } catch (e) {
        console.warn("Error deleting contact requests:", e);
      }
      // ثم حذف العقار
      await db.delete(properties).where(eq(properties.id, id));
    } catch (error: any) {
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Column does not exist, continuing deletion:", error.message);
        await db.delete(properties).where(eq(properties.id, id));
      } else {
        throw error;
      }
    }
  }

  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.isActive, true));
  }

  async getAllPropertiesForAdmin(): Promise<Property[]> {
    return db.select().from(properties);
  }

  async incrementPropertyViews(id: string): Promise<void> {
    await db.update(properties)
      .set({ viewsCount: sql`${properties.viewsCount} + 1` })
      .where(eq(properties.id, id));
  }

  // Matches
  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getMatchesByBuyerPreference(prefId: string): Promise<Match[]> {
    return db.select().from(matches).where(eq(matches.buyerPreferenceId, prefId)).orderBy(desc(matches.matchScore));
  }

  async getMatchesByProperty(propId: string): Promise<Match[]> {
    return db.select().from(matches).where(eq(matches.propertyId, propId));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [result] = await db.insert(matches).values(match).returning();
    return result;
  }

  async updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined> {
    const [result] = await db.update(matches).set(match).where(eq(matches.id, id)).returning();
    return result || undefined;
  }

  async updateMatchStatus(id: string, status: string): Promise<Match | undefined> {
    const [result] = await db.update(matches)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return result || undefined;
  }

  async updateMatchVerification(id: string, verificationType: "property" | "buyer" | "specs" | "financial", verified: boolean): Promise<Match | undefined> {
    const updateField = verificationType === "property" ? "propertyVerified" :
                        verificationType === "buyer" ? "buyerVerified" :
                        verificationType === "specs" ? "specsVerified" : "financialVerified";
    const [result] = await db.update(matches)
      .set({ [updateField]: verified, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return result || undefined;
  }

  async updateMatchDetailedVerifications(id: string, detailedVerifications: {
    city: boolean;
    district: boolean;
    propertyType: boolean;
    price: boolean;
    rooms: boolean;
    bathrooms: boolean;
    area: boolean;
  }): Promise<Match | undefined> {
    const [result] = await db.update(matches)
      .set({ detailedVerifications: detailedVerifications as any, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return result || undefined;
  }

  // Matching algorithm - find matches for a new property
  async findMatchesForProperty(propertyId: string): Promise<void> {
    const property = await this.getProperty(propertyId);
    if (!property) return;

    const allPreferences = await this.getAllBuyerPreferences();

    for (const pref of allPreferences) {
      const score = this.calculateMatchScore(property, pref);
      if (score > 50) {
        // Check if match already exists
        const existingMatches = await db.select().from(matches)
          .where(and(
            eq(matches.buyerPreferenceId, pref.id),
            eq(matches.propertyId, propertyId)
          ));
        
        if (existingMatches.length === 0) {
          await this.createMatch({
            buyerPreferenceId: pref.id,
            propertyId: propertyId,
            matchScore: score,
            isSaved: false,
            isContacted: false,
            status: "new",
          });
        }
      }
    }
  }

  // Matching algorithm - find matches for a new preference
  async findMatchesForPreference(preferenceId: string): Promise<void> {
    const preference = await this.getBuyerPreference(preferenceId);
    if (!preference) return;

    const allProperties = await this.getAllProperties();

    for (const property of allProperties) {
      const score = this.calculateMatchScore(property, preference);
      if (score > 50) {
        // Check if match already exists
        const existingMatches = await db.select().from(matches)
          .where(and(
            eq(matches.buyerPreferenceId, preferenceId),
            eq(matches.propertyId, property.id)
          ));
        
        if (existingMatches.length === 0) {
          await this.createMatch({
            buyerPreferenceId: preferenceId,
            propertyId: property.id,
            matchScore: score,
            isSaved: false,
            isContacted: false,
            status: "new",
          });
        }
      }
    }
  }

  /**
   * خريطة الأحياء المجاورة - تجمعات جغرافية حقيقية
   * كل حي مرتبط بقائمة الأحياء المجاورة له جغرافياً
   */
  private readonly adjacencyMap: Record<string, Record<string, string[]>> = {
    "الرياض": {
      // شمال الرياض
      "النرجس": ["الياسمين", "الملقا", "حطين", "العارض"],
      "الياسمين": ["النرجس", "الملقا", "الصحافة", "الغدير"],
      "الملقا": ["النرجس", "الياسمين", "حطين", "النخيل"],
      "حطين": ["النرجس", "الملقا", "النخيل", "العقيق"],
      "الصحافة": ["الياسمين", "الغدير", "النخيل", "العقيق"],
      "الغدير": ["الياسمين", "الصحافة", "الربيع", "القيروان"],
      "النخيل": ["الملقا", "حطين", "الصحافة", "العقيق"],
      "العقيق": ["حطين", "النخيل", "الصحافة", "الورود"],
      // وسط الرياض
      "الورود": ["العقيق", "السليمانية", "المروج", "العليا"],
      "السليمانية": ["الورود", "المروج", "العليا", "الملز"],
      "المروج": ["الورود", "السليمانية", "الرحمانية", "العليا"],
      "العليا": ["الورود", "السليمانية", "المروج", "الفيصلية"],
      "الفيصلية": ["العليا", "المربع", "الديرة", "الملز"],
      "المربع": ["الفيصلية", "الديرة", "البطحاء", "الملز"],
      "الديرة": ["الفيصلية", "المربع", "البطحاء"],
      "البطحاء": ["المربع", "الديرة", "الشميسي"],
      "الملز": ["السليمانية", "الفيصلية", "المربع", "الروضة"],
      // غرب الرياض
      "عرقة": ["الخزامى", "طويق", "ظهرة لبن"],
      "الخزامى": ["عرقة", "طويق", "ظهرة لبن", "الربوة"],
      "طويق": ["عرقة", "الخزامى", "ظهرة لبن", "نمار"],
      "ظهرة لبن": ["عرقة", "الخزامى", "طويق", "نمار"],
      "نمار": ["طويق", "ظهرة لبن", "الدار البيضاء"],
      // شرق الرياض
      "المونسية": ["قرطبة", "الندى", "الروضة"],
      "قرطبة": ["المونسية", "الندى", "الروضة", "اليرموك"],
      "الندى": ["المونسية", "قرطبة", "الوادي"],
      "الروضة": ["قرطبة", "المونسية", "الملز"],
    },
    "جدة": {
      // شمال جدة
      "الحمراء": ["الشاطئ", "الزهراء", "النعيم"],
      "الشاطئ": ["الحمراء", "الزهراء", "أبحر الشمالية"],
      "الزهراء": ["الحمراء", "الشاطئ", "النعيم", "الفيصلية"],
      "النعيم": ["الحمراء", "الزهراء", "الصفا"],
      "أبحر الشمالية": ["الشاطئ", "أبحر الجنوبية"],
      "أبحر الجنوبية": ["أبحر الشمالية", "الشاطئ"],
      // وسط جدة
      "الفيصلية": ["الزهراء", "السلامة", "الروضة"],
      "السلامة": ["الفيصلية", "الروضة", "النزهة"],
      "الروضة": ["الفيصلية", "السلامة", "النزهة", "المروة"],
      "النزهة": ["السلامة", "الروضة", "المحمدية"],
      "المحمدية": ["النزهة", "الصفا", "العزيزية"],
      // جنوب جدة
      "الصفا": ["النعيم", "المحمدية", "المروة"],
      "المروة": ["الصفا", "الروضة", "الربوة"],
      "الربوة": ["المروة", "الثغر"],
      "البلد": ["العزيزية", "الكندرة"],
    },
    "الدمام": {
      "الشاطئ": ["الفيصلية", "الروضة"],
      "الفيصلية": ["الشاطئ", "الروضة", "النزهة"],
      "الروضة": ["الشاطئ", "الفيصلية", "المزروعية"],
      "النزهة": ["الفيصلية", "الجلوية"],
      "المزروعية": ["الروضة", "الخليج"],
    },
    "مكة المكرمة": {
      "العزيزية": ["الشوقية", "الشرائع"],
      "الشوقية": ["العزيزية", "الحمراء"],
      "الشرائع": ["العزيزية", "العوالي"],
      "العوالي": ["الشرائع", "العزيزية"],
    },
  };

  /**
   * التحقق من الأحياء المجاورة
   * يستخدم خريطة التجاور الجغرافي المحددة مسبقاً
   */
  private isAdjacentDistrict(city: string, propertyDistrict: string, buyerDistricts: string[]): boolean {
    const cityAdjacency = this.adjacencyMap[city];
    if (!cityAdjacency) return false;
    
    // التحقق من أن حي العقار مجاور لأي من أحياء المشتري
    const propertyNeighbors = cityAdjacency[propertyDistrict];
    if (!propertyNeighbors) return false;
    
    for (const buyerDistrict of buyerDistricts) {
      if (propertyNeighbors.includes(buyerDistrict)) {
        return true;
      }
      // التحقق أيضاً من الاتجاه المعاكس
      const buyerNeighbors = cityAdjacency[buyerDistrict];
      if (buyerNeighbors && buyerNeighbors.includes(propertyDistrict)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * خوارزمية المطابقة الذكية v3.1 - محسّنة وعملية
   * نظام النقاط الموزونة: 100 نقطة أساسية + 5 نقاط بونص = 105 نقطة كحد أقصى
   * 
   * النقاط الأساسية (100 نقطة):
   * - الموقع الجغرافي (35 نقطة): مطابقة الحي = 35، حي مجاور = 22، نفس المدينة فقط = 12
   * - التوافق السعري (30 نقطة): ضمن الميزانية = 30، أعلى بـ 5% = 20، أعلى بـ 15% = 10
   * - المواصفات الفنية (25 نقطة): نوع العقار = 12، الغرف/المساحة = 13 (معالجة ذكية للنصوص)
   * - التفاصيل الإضافية (10 نقطة): transactionType+status = 3، purpose = 2، paymentMethod = 2، amenities+description = 3
   * 
   * البونص (5 نقاط):
   * - حديث الإعلان (2 نقطة): < 7 أيام = 2، < 30 يوم = 1، < 90 يوم = 0.5
   * - الشعبية (2 نقطة): ≥ 100 مشاهدة = 2، ≥ 50 = 1.5، ≥ 20 = 1، أي مشاهدة = 0.5
   * - الحالة النشطة (1 نقطة): isActive = true
   * 
   * تحسينات عملية:
   * - معالجة ذكية للنصوص (rooms: "4+", area: "300-400")
   * - مطابقة المرافق من array + البحث في description
   * - ربط transactionType مع status العقار
   * - عوامل ديناميكية حسب الشعبية وحداثة الإعلان
   */
  private calculateMatchScore(property: Property, preference: BuyerPreference): number {
    let locationScore = 0;
    let priceScore = 0;
    let specsScore = 0;
    let detailsScore = 0;
    
    // ===== 1. الموقع الجغرافي (35 نقطة كحد أقصى) =====
    // التحقق من المدينة (إلزامي)
    if (property.city !== preference.city) {
      return 0; // لا توجد مطابقة إذا كانت المدينة مختلفة
    }

    // مطابقة الحي
    if (preference.districts && preference.districts.length > 0) {
      if (preference.districts.includes(property.district)) {
        locationScore = 35; // مطابقة الحي تماماً
      } else if (this.isAdjacentDistrict(preference.city, property.district, preference.districts)) {
        locationScore = 22; // حي مجاور
      } else {
        // نفس المدينة لكن حي بعيد = نقاط جزئية فقط
        locationScore = 12;
      }
    } else {
      // لم يحدد أحياء معينة = نقاط جزئية
      locationScore = 18;
    }

    // ===== 2. التوافق السعري (30 نقطة كحد أقصى) =====
    if (preference.budgetMax) {
      const budgetFlexThreshold = preference.budgetMax * 1.05; // 5% مرونة
      
      if (property.price <= preference.budgetMax) {
        if (preference.budgetMin && property.price >= preference.budgetMin) {
          priceScore = 30; // ضمن النطاق تماماً
        } else {
          priceScore = 25; // أقل من الحد الأدنى لكن ضمن الأعلى
        }
      } else if (property.price <= budgetFlexThreshold) {
        priceScore = 20; // أعلى بنسبة تصل إلى 5%
      } else if (property.price <= preference.budgetMax * 1.15) {
        priceScore = 10; // أعلى بـ 15%
      } else {
        priceScore = 0; // أكثر من 15% فوق الميزانية
      }
    } else {
      // لم يحدد ميزانية - نقاط جزئية
      priceScore = 15;
    }

    // ===== 3. المواصفات الفنية (25 نقطة كحد أقصى) =====
    let propertyTypeScore = 0;
    let roomsAreaScore = 0;
    
    // نوع العقار (12 نقطة كحد أقصى)
    if (property.propertyType === preference.propertyType) {
      propertyTypeScore = 12; // تطابق تام
    } else {
      const similarTypes: Record<string, string[]> = {
        villa: ["duplex", "townhouse"],
        duplex: ["villa", "townhouse"],
        apartment: ["studio"],
        studio: ["apartment"],
      };
      if (similarTypes[preference.propertyType]?.includes(property.propertyType)) {
        propertyTypeScore = 6; // نوع مشابه
      } else {
        propertyTypeScore = 0; // نوع مختلف تماماً
      }
    }

    // الغرف والمساحة (13 نقطة كحد أقصى: 6.5 لكل منهما)
    let roomsScore = 0;
    let areaScore = 0;
    
    if (preference.rooms && property.rooms) {
      // تحسين معالجة القيم النصية (مثل "4", "4+", "3-5")
      const prefRoomsStr = String(preference.rooms).trim();
      const propRoomsStr = String(property.rooms).trim();
      
      // استخراج الأرقام من النص
      const prefRoomsMatch = prefRoomsStr.match(/\d+/);
      const propRoomsMatch = propRoomsStr.match(/\d+/);
      
      if (prefRoomsMatch && propRoomsMatch) {
        const prefRooms = parseInt(prefRoomsMatch[0]) || 0;
        const propRooms = parseInt(propRoomsMatch[0]) || 0;
        
        if (propRooms === prefRooms) {
          roomsScore = 6.5;
        } else if (Math.abs(propRooms - prefRooms) === 1) {
          roomsScore = 4.5;
        } else if (Math.abs(propRooms - prefRooms) <= 2) {
          roomsScore = 2;
        }
      }
    }

    if (preference.area && property.area) {
      // تحسين معالجة المساحة (مثل "300", "300-400", "300+")
      const prefAreaStr = String(preference.area).trim().replace(/[^\d-]/g, '');
      const propAreaStr = String(property.area).trim().replace(/[^\d-]/g, '');
      
      // استخراج القيمة (أول رقم أو متوسط إذا كان نطاق)
      const prefAreaMatch = prefAreaStr.match(/(\d+)(?:-(\d+))?/);
      const propAreaMatch = propAreaStr.match(/(\d+)(?:-(\d+))?/);
      
      if (prefAreaMatch && propAreaMatch) {
        const prefAreaMin = parseInt(prefAreaMatch[1]) || 0;
        const prefAreaMax = prefAreaMatch[2] ? parseInt(prefAreaMatch[2]) : prefAreaMin;
        const prefArea = (prefAreaMin + prefAreaMax) / 2; // متوسط النطاق
        
        const propAreaMin = parseInt(propAreaMatch[1]) || 0;
        const propAreaMax = propAreaMatch[2] ? parseInt(propAreaMatch[2]) : propAreaMin;
        const propArea = (propAreaMin + propAreaMax) / 2;
        
        if (prefArea > 0 && propArea > 0) {
          const ratio = propArea / prefArea;
          if (ratio >= 0.9 && ratio <= 1.1) {
            areaScore = 6.5; // ضمن 10%
          } else if (ratio >= 0.8 && ratio <= 1.2) {
            areaScore = 4.5; // ضمن 20%
          } else if (ratio >= 0.7 && ratio <= 1.3) {
            areaScore = 2; // ضمن 30%
          }
        }
      }
    }

    roomsAreaScore = roomsScore + areaScore;
    specsScore = propertyTypeScore + roomsAreaScore;

    // الحد الأقصى 25 نقطة للمواصفات
    specsScore = Math.min(25, specsScore);

    // ===== 4. التفاصيل الإضافية (10 نقطة كحد أقصى) =====
    
    // transactionType + status (3 نقاط): شراء/إيجار مع حالة العقار
    if (preference.transactionType) {
      if (preference.transactionType === "buy") {
        // الشراء متاح لأي عقار (جاهز أو تحت الإنشاء)
        detailsScore += 3;
      } else if (preference.transactionType === "rent") {
        // الإيجار يتطلب عقار جاهز فقط
        if (property.status === "ready") {
          detailsScore += 3;
        } else {
          detailsScore += 0; // عقار تحت الإنشاء لا يمكن إيجاره
        }
      }
    } else {
      detailsScore += 1.5; // لم يحدد - نقاط جزئية
    }

    // purpose (2 نقطة): سكن/استثمار
    if (preference.purpose) {
      // جميع العقارات مناسبة للسكن والاستثمار
      detailsScore += 2;
    } else {
      detailsScore += 1;
    }

    // paymentMethod (2 نقطة): كاش/تمويل
    if (preference.paymentMethod) {
      // جميع العقارات تقبل كلا الطريقتين
      detailsScore += 2;
    } else {
      detailsScore += 1;
    }

    // amenities + description matching (3 نقاط): مطابقة ذكية للمرافق
    let amenitiesMatchScore = 0;
    
    // 1. مطابقة المرافق الأساسية من array
    if (property.amenities && property.amenities.length > 0) {
      amenitiesMatchScore += 1; // أساسي: وجود مرافق
      
      // إعطاء نقاط إضافية حسب عدد المرافق
      if (property.amenities.length >= 5) {
        amenitiesMatchScore += 1.5; // مرافق ممتازة
      } else if (property.amenities.length >= 3) {
        amenitiesMatchScore += 1; // مرافق جيدة
      }
    }

    // 2. البحث الذكي في description عن مرافق إضافية
    if (property.description) {
      const descLower = property.description.toLowerCase();
      // البحث عن كلمات مفتاحية شائعة للمرافق
      const amenityKeywords = [
        "مسبح", "سباحة", "pool",
        "مصعد", "elevator", "lift",
        "موقف", "parking", "garage",
        "حديقة", "garden", "yard",
        "نادي", "gym", "fitness",
        "أمن", "security", "حراسة",
        "تكييف", "ac", "air conditioning",
        "إنترنت", "wifi", "internet",
        "مطبخ", "kitchen",
        "غرفة خادمة", "maid room",
        "بلكونة", "balcony", "terrace"
      ];
      
      let foundKeywords = 0;
      for (const keyword of amenityKeywords) {
        if (descLower.includes(keyword.toLowerCase())) {
          foundKeywords++;
        }
      }
      
      // إعطاء نقاط إضافية حسب عدد الكلمات المفتاحية الموجودة
      if (foundKeywords >= 3) {
        amenitiesMatchScore += 0.5; // وصف غني بالمرافق
      }
    }

    detailsScore += Math.min(3, amenitiesMatchScore);

    // الحد الأقصى 10 نقطة للتفاصيل
    detailsScore = Math.min(10, detailsScore);

    // المجموع الأساسي (100 نقطة كحد أقصى)
    const baseScore = Math.min(35, locationScore) + Math.min(30, priceScore) + Math.min(25, specsScore) + Math.min(10, detailsScore);

    // ===== 5. عوامل ديناميكية (بونص يصل إلى 5 نقاط) =====
    let bonusScore = 0;

    // recency bonus (2 نقطة): العقارات الحديثة أفضل
    if (property.createdAt) {
      const daysSinceCreation = Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation <= 7) {
        bonusScore += 2; // أقل من أسبوع
      } else if (daysSinceCreation <= 30) {
        bonusScore += 1; // أقل من شهر
      } else if (daysSinceCreation <= 90) {
        bonusScore += 0.5; // أقل من 3 أشهر
      }
    }

    // popularity bonus (2 نقطة): العقارات الشائعة أفضل
    if (property.viewsCount && property.viewsCount > 0) {
      if (property.viewsCount >= 100) {
        bonusScore += 2; // أكثر من 100 مشاهدة
      } else if (property.viewsCount >= 50) {
        bonusScore += 1.5; // أكثر من 50 مشاهدة
      } else if (property.viewsCount >= 20) {
        bonusScore += 1; // أكثر من 20 مشاهدة
      } else {
        bonusScore += 0.5; // أي مشاهدة
      }
    }

    // active status bonus (1 نقطة): العقارات النشطة أفضل
    if (property.isActive) {
      bonusScore += 1;
    }

    // الحد الأقصى للبونص 5 نقاط
    bonusScore = Math.min(5, bonusScore);

    // المجموع النهائي (105 نقطة كحد أقصى: 100 أساسية + 5 بونص)
    const totalScore = baseScore + bonusScore;

    return Math.min(105, Math.round(totalScore));
  }

  // Contact Requests
  async createContactRequest(req: InsertContactRequest): Promise<ContactRequest> {
    const [result] = await db.insert(contactRequests).values(req).returning();
    return result;
  }

  async getContactRequestsByBuyer(buyerId: string): Promise<ContactRequest[]> {
    return db.select().from(contactRequests).where(eq(contactRequests.buyerId, buyerId));
  }

  async getContactRequestsByProperty(propertyId: string): Promise<ContactRequest[]> {
    return db.select().from(contactRequests).where(eq(contactRequests.propertyId, propertyId));
  }

  async getAllContactRequests(): Promise<ContactRequest[]> {
    return db.select().from(contactRequests);
  }

  async getAllMatches(): Promise<Match[]> {
    return db.select().from(matches).orderBy(desc(matches.matchScore));
  }

  async deleteMatch(id: string): Promise<void> {
    try {
      // حذف طلبات الاتصال المرتبطة أولاً
      try {
        await db.delete(contactRequests).where(eq(contactRequests.matchId, id));
      } catch (e) {
        console.warn("Error deleting contact requests:", e);
      }
      // ثم حذف المطابقة
      await db.delete(matches).where(eq(matches.id, id));
    } catch (error: any) {
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Column does not exist, continuing deletion:", error.message);
        await db.delete(matches).where(eq(matches.id, id));
      } else {
        throw error;
      }
    }
  }

  // Analytics
  async getTopDistricts(city: string, limit: number = 5): Promise<{ district: string; count: number }[]> {
    const result = await db.select({
      district: buyerPreferences.districts,
      city: buyerPreferences.city,
    }).from(buyerPreferences).where(eq(buyerPreferences.city, city));

    // Flatten and count districts
    const districtCounts: Record<string, number> = {};
    result.forEach(r => {
      r.district?.forEach((d: string) => {
        districtCounts[d] = (districtCounts[d] || 0) + 1;
      });
    });

    return Object.entries(districtCounts)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getAverageBudgetByCity(): Promise<{ city: string; avgBudget: number }[]> {
    const result = await db.select({
      city: buyerPreferences.city,
      avgBudget: sql<number>`avg(CASE WHEN ${buyerPreferences.budgetMin} IS NOT NULL AND ${buyerPreferences.budgetMax} IS NOT NULL THEN (${buyerPreferences.budgetMin} + ${buyerPreferences.budgetMax}) / 2.0 WHEN ${buyerPreferences.budgetMax} IS NOT NULL THEN ${buyerPreferences.budgetMax} WHEN ${buyerPreferences.budgetMin} IS NOT NULL THEN ${buyerPreferences.budgetMin} ELSE NULL END)`,
    })
    .from(buyerPreferences)
    .where(or(
      sql`${buyerPreferences.budgetMin} IS NOT NULL`,
      sql`${buyerPreferences.budgetMax} IS NOT NULL`
    ))
    .groupBy(buyerPreferences.city);

    return result
      .filter(r => r.avgBudget !== null)
      .map(r => ({
        city: r.city,
        avgBudget: Math.round(Number(r.avgBudget) || 0),
      }));
  }

  async getDemandByPropertyType(): Promise<{ propertyType: string; count: number }[]> {
    const result = await db.select({
      propertyType: buyerPreferences.propertyType,
      count: sql<number>`count(*)`,
    })
    .from(buyerPreferences)
    .groupBy(buyerPreferences.propertyType);

    return result.map(r => ({
      propertyType: r.propertyType,
      count: Number(r.count),
    }));
  }

  // ==================== Market Analytics ====================

  /**
   * مؤشر العرض والطلب (Supply & Demand Index)
   * ratio < 0.8 = سوق المشتري (عرض قليل، طلب عالي)
   * ratio 0.8-1.2 = سوق متوازن
   * ratio > 1.2 = سوق البائع (عرض عالي، طلب قليل)
   */
  async getSupplyDemandIndex(city?: string): Promise<{ city: string; supply: number; demand: number; ratio: number; marketType: "buyer" | "balanced" | "seller" }[]> {
    const supplyConditions = [eq(properties.isActive, true)];
    const demandConditions: any[] = [];

    if (city) {
      supplyConditions.push(eq(properties.city, city));
      demandConditions.push(eq(buyerPreferences.city, city));
    }

    // حساب العرض (العقارات النشطة)
    const supplyQuery = db.select({
      city: properties.city,
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .where(and(...supplyConditions))
    .groupBy(properties.city);

    // حساب الطلب (الرغبات النشطة)
    const demandQuery = db.select({
      city: buyerPreferences.city,
      count: sql<number>`count(*)`,
    })
    .from(buyerPreferences)
    .where(and(...demandConditions.length > 0 ? demandConditions : [sql`1=1`]))
    .groupBy(buyerPreferences.city);

    const [supplyResults, demandResults] = await Promise.all([supplyQuery, demandQuery]);

    const supplyMap = new Map(supplyResults.map(r => [r.city, Number(r.count)]));
    const demandMap = new Map(demandResults.map(r => [r.city, Number(r.count)]));

    // دمج النتائج
    const cities = new Set([...Array.from(supplyMap.keys()), ...Array.from(demandMap.keys())]);

    return Array.from(cities).map(cityName => {
      const supply = supplyMap.get(cityName) || 0;
      const demand = demandMap.get(cityName) || 0;
      const ratio = demand > 0 ? supply / demand : 0;
      
      let marketType: "buyer" | "balanced" | "seller";
      if (ratio < 0.8) marketType = "buyer";
      else if (ratio <= 1.2) marketType = "balanced";
      else marketType = "seller";

      return { city: cityName, supply, demand, ratio, marketType };
    }).sort((a, b) => b.demand - a.demand);
  }

  /**
   * متوسط سعر المتر المربع حسب المنطقة
   */
  async getPricePerSquareMeter(city?: string, district?: string, propertyType?: string): Promise<{ city: string; district?: string; propertyType?: string; avgPrice: number; avgArea: number; pricePerSqm: number; count: number }[]> {
    const conditions = [eq(properties.isActive, true)];
    
    if (city) conditions.push(eq(properties.city, city));
    if (district) conditions.push(eq(properties.district, district));
    if (propertyType) conditions.push(eq(properties.propertyType, propertyType));

    const result = await db.select({
      city: properties.city,
      district: properties.district,
      propertyType: properties.propertyType,
      avgPrice: sql<number>`avg(${properties.price})`,
      avgArea: sql<number>`avg(CASE WHEN ${properties.area} ~ '^[0-9]+$' THEN CAST(${properties.area} AS INTEGER) ELSE NULL END)`,
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .where(and(...conditions))
    .groupBy(properties.city, properties.district, properties.propertyType);

    return result
      .filter(r => r.avgArea !== null && Number(r.avgArea) > 0 && Number(r.avgPrice) > 0)
      .map(r => {
        const avgPrice = Number(r.avgPrice) || 0;
        const avgArea = Number(r.avgArea) || 1;
        const pricePerSqm = Math.round(avgPrice / avgArea);
        
        return {
          city: r.city,
          district: r.district || undefined,
          propertyType: r.propertyType || undefined,
          avgPrice: Math.round(avgPrice),
          avgArea: Math.round(avgArea),
          pricePerSqm,
          count: Number(r.count),
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * مؤشر شعبية المناطق (District Popularity Score)
   * النقاط = (عدد الرغبات × 2) + (عدد المطابقات × 3) + (عدد طلبات التواصل × 5)
   */
  async getDistrictPopularityScore(city?: string, limit: number = 20): Promise<{ city: string; district: string; demandCount: number; matchCount: number; contactCount: number; popularityScore: number }[]> {
    // حساب الرغبات حسب الحي
    const demandConditions: any[] = [];
    if (city) demandConditions.push(eq(buyerPreferences.city, city));

    const preferences = await db.select({
      city: buyerPreferences.city,
      districts: buyerPreferences.districts,
    })
    .from(buyerPreferences)
    .where(demandConditions.length > 0 ? and(...demandConditions) : sql`1=1`);

    const districtDemandMap = new Map<string, number>();
    preferences.forEach(p => {
      p.districts?.forEach((d: string) => {
        const key = `${p.city}|${d}`;
        districtDemandMap.set(key, (districtDemandMap.get(key) || 0) + 1);
      });
    });

    // حساب المطابقات حسب الحي
    const matchesData = await db.select({
      property: properties,
    })
    .from(matches)
    .leftJoin(properties, eq(matches.propertyId, properties.id))
    .where(city ? eq(properties.city, city) : sql`1=1`);

    const districtMatchMap = new Map<string, number>();
    matchesData.forEach(m => {
      if (m.property?.district && m.property?.city) {
        const key = `${m.property.city}|${m.property.district}`;
        districtMatchMap.set(key, (districtMatchMap.get(key) || 0) + 1);
      }
    });

    // حساب طلبات التواصل حسب الحي
    const contacts = await db.select({
      property: properties,
    })
    .from(contactRequests)
    .leftJoin(properties, eq(contactRequests.propertyId, properties.id))
    .where(city ? eq(properties.city, city) : sql`1=1`);

    const districtContactMap = new Map<string, number>();
    contacts.forEach(c => {
      if (c.property?.district && c.property?.city) {
        const key = `${c.property.city}|${c.property.district}`;
        districtContactMap.set(key, (districtContactMap.get(key) || 0) + 1);
      }
    });

    // حساب النقاط
    const districts = new Set([...Array.from(districtDemandMap.keys()), ...Array.from(districtMatchMap.keys()), ...Array.from(districtContactMap.keys())]);
    
    const results = Array.from(districts).map(key => {
      const [cityName, district] = key.split("|");
      const demandCount = districtDemandMap.get(key) || 0;
      const matchCount = districtMatchMap.get(key) || 0;
      const contactCount = districtContactMap.get(key) || 0;
      const popularityScore = (demandCount * 2) + (matchCount * 3) + (contactCount * 5);

      return {
        city: cityName,
        district,
        demandCount,
        matchCount,
        contactCount,
        popularityScore,
      };
    });

    return results
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  /**
   * مؤشر جودة السوق (Market Quality Index)
   * النقاط = (متوسط نقاط المطابقة × 0.4) + (معدل التحويل × 0.3) + (معدل التفاعل × 0.3)
   */
  async getMarketQualityIndex(city?: string): Promise<{ city: string; avgMatchScore: number; conversionRate: number; engagementRate: number; qualityScore: number; qualityLevel: "excellent" | "good" | "average" | "poor" }[]> {
    const matchConditions: any[] = [];
    const contactConditions: any[] = [];

    if (city) {
      matchConditions.push(eq(properties.city, city));
      contactConditions.push(eq(properties.city, city));
    }

    // متوسط نقاط المطابقة حسب المدينة
    const matchScores = await db.select({
      city: properties.city,
      avgScore: sql<number>`avg(${matches.matchScore})`,
      count: sql<number>`count(*)`,
    })
    .from(matches)
    .leftJoin(properties, eq(matches.propertyId, properties.id))
    .where(matchConditions.length > 0 ? and(...matchConditions) : sql`1=1`)
    .groupBy(properties.city);

    // معدل التحويل (طلبات التواصل / المطابقات)
    const conversions = await db.select({
      city: properties.city,
      contactCount: sql<number>`count(DISTINCT ${contactRequests.id})`,
      matchCount: sql<number>`count(DISTINCT ${matches.id})`,
    })
    .from(contactRequests)
    .leftJoin(properties, eq(contactRequests.propertyId, properties.id))
    .leftJoin(matches, eq(contactRequests.matchId, matches.id))
    .where(contactConditions.length > 0 ? and(...contactConditions) : sql`1=1`)
    .groupBy(properties.city);

    // معدل التفاعل (المطابقات المحفوظة / إجمالي المطابقات)
    const engagements = await db.select({
      city: properties.city,
      savedCount: sql<number>`count(*) FILTER (WHERE ${matches.isSaved} = true)`,
      totalCount: sql<number>`count(*)`,
    })
    .from(matches)
    .leftJoin(properties, eq(matches.propertyId, properties.id))
    .where(matchConditions.length > 0 ? and(...matchConditions) : sql`1=1`)
    .groupBy(properties.city);

    const scoreMap = new Map(matchScores.map(m => [m.city, { avgScore: Number(m.avgScore) || 0, count: Number(m.count) }]));
    const conversionMap = new Map(conversions.map(c => [c.city, { rate: c.matchCount > 0 ? (Number(c.contactCount) / Number(c.matchCount)) * 100 : 0 }]));
    const engagementMap = new Map(engagements.map(e => [e.city, { rate: e.totalCount > 0 ? (Number(e.savedCount) / Number(e.totalCount)) * 100 : 0 }]));

    const cities = new Set([...Array.from(scoreMap.keys()), ...Array.from(conversionMap.keys()), ...Array.from(engagementMap.keys())]);

    return Array.from(cities)
      .filter((cityName): cityName is string => cityName !== null && cityName !== undefined)
      .map(cityName => {
        const matchData = scoreMap.get(cityName) || { avgScore: 0, count: 0 };
        const conversionData = conversionMap.get(cityName) || { rate: 0 };
        const engagementData = engagementMap.get(cityName) || { rate: 0 };

        const avgMatchScore = matchData.avgScore;
        const conversionRate = conversionData.rate;
        const engagementRate = engagementData.rate;

        // حساب مؤشر الجودة (0-100)
        const qualityScore = (avgMatchScore * 0.4) + (conversionRate * 0.3) + (engagementRate * 0.3);

        let qualityLevel: "excellent" | "good" | "average" | "poor";
        if (qualityScore >= 70) qualityLevel = "excellent";
        else if (qualityScore >= 50) qualityLevel = "good";
        else if (qualityScore >= 30) qualityLevel = "average";
        else qualityLevel = "poor";

        return {
          city: cityName,
          avgMatchScore: Math.round(avgMatchScore * 10) / 10,
          conversionRate: Math.round(conversionRate * 10) / 10,
          engagementRate: Math.round(engagementRate * 10) / 10,
          qualityScore: Math.round(qualityScore * 10) / 10,
          qualityLevel,
        };
      }).sort((a, b) => b.qualityScore - a.qualityScore);
  }

  /**
   * اتجاهات الأسعار (Price Trends)
   */
  async getPriceTrends(city?: string, propertyType?: string, months: number = 6): Promise<{ period: string; avgPrice: number; count: number; changePercent?: number }[]> {
    const conditions = [eq(properties.isActive, true)];
    if (city) conditions.push(eq(properties.city, city));
    if (propertyType) conditions.push(eq(properties.propertyType, propertyType));

    // حساب تاريخ البداية
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    conditions.push(gte(properties.createdAt, startDate));

    const result = await db.select({
      period: sql<string>`to_char(${properties.createdAt}, 'YYYY-MM')`,
      avgPrice: sql<number>`avg(${properties.price})`,
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .where(and(...conditions))
    .groupBy(sql`to_char(${properties.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${properties.createdAt}, 'YYYY-MM')`);

    const trends = result.map((r, index) => {
      const prev = index > 0 ? result[index - 1] : null;
      const changePercent = prev && prev.avgPrice > 0
        ? ((Number(r.avgPrice) - Number(prev.avgPrice)) / Number(prev.avgPrice)) * 100
        : undefined;

      return {
        period: r.period,
        avgPrice: Math.round(Number(r.avgPrice)),
        count: Number(r.count),
        changePercent: changePercent !== undefined ? Math.round(changePercent * 10) / 10 : undefined,
      };
    });

    return trends;
  }

  // Send Logs
  async createSendLog(log: InsertSendLog): Promise<SendLog> {
    const [result] = await db.insert(sendLogs).values(log).returning();
    return result;
  }

  async getSendLogs(): Promise<SendLog[]> {
    return db.select().from(sendLogs).orderBy(desc(sendLogs.sentAt));
  }

  async getSendLogsByUser(userId: string): Promise<SendLog[]> {
    return db.select().from(sendLogs).where(eq(sendLogs.userId, userId)).orderBy(desc(sendLogs.sentAt));
  }

  async getSendLogsByPreference(preferenceId: string): Promise<SendLog[]> {
    return db.select().from(sendLogs).where(eq(sendLogs.preferenceId, preferenceId)).orderBy(desc(sendLogs.sentAt));
  }

  async updateSendLog(id: string, log: Partial<InsertSendLog>): Promise<SendLog | undefined> {
    const [result] = await db.update(sendLogs).set(log).where(eq(sendLogs.id, id)).returning();
    return result || undefined;
  }

  // Get all property IDs that have been sent to a specific preference
  async getPropertyIdsSentToPreference(preferenceId: string): Promise<string[]> {
    const logs = await db.select({ propertyIds: sendLogs.propertyIds })
      .from(sendLogs)
      .where(and(
        eq(sendLogs.preferenceId, preferenceId),
        eq(sendLogs.status, "sent")
      ));
    
    const allIds: string[] = [];
    logs.forEach(log => {
      if (log.propertyIds) {
        allIds.push(...log.propertyIds);
      }
    });
    return Array.from(new Set(allIds)); // Return unique IDs
  }

  // Marketing Settings
  async getMarketingSettings(): Promise<MarketingSetting[]> {
    return db.select().from(marketingSettings);
  }

  async getMarketingSetting(platform: string): Promise<MarketingSetting | undefined> {
    const [setting] = await db.select().from(marketingSettings).where(eq(marketingSettings.platform, platform));
    return setting || undefined;
  }

  async upsertMarketingSetting(setting: InsertMarketingSetting): Promise<MarketingSetting> {
    const existing = await this.getMarketingSetting(setting.platform);
    if (existing) {
      const [updated] = await db.update(marketingSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(marketingSettings.platform, setting.platform))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(marketingSettings).values(setting).returning();
      return created;
    }
  }

  async deleteMarketingSetting(platform: string): Promise<void> {
    await db.delete(marketingSettings).where(eq(marketingSettings.platform, platform));
  }

  async getEnabledMarketingSettings(): Promise<MarketingSetting[]> {
    return db.select().from(marketingSettings).where(eq(marketingSettings.isEnabled, true));
  }

  // Marketing Events
  async createMarketingEvent(event: InsertMarketingEvent): Promise<MarketingEvent> {
    const [result] = await db.insert(marketingEvents).values(event).returning();
    return result;
  }

  async getMarketingEvents(limit: number = 100): Promise<MarketingEvent[]> {
    return db.select().from(marketingEvents).orderBy(desc(marketingEvents.createdAt)).limit(limit);
  }

  async getMarketingEventsByPlatform(platform: string): Promise<MarketingEvent[]> {
    return db.select().from(marketingEvents)
      .where(eq(marketingEvents.platform, platform))
      .orderBy(desc(marketingEvents.createdAt));
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv || undefined;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId)
      ))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getConversationByParticipants(buyerId: string, sellerId: string, propertyId: string): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations)
      .where(and(
        eq(conversations.buyerId, buyerId),
        eq(conversations.sellerId, sellerId),
        eq(conversations.propertyId, propertyId)
      ));
    return conv || undefined;
  }

  async createConversation(conv: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(conv).returning();
    return result;
  }

  async updateConversation(id: string, conv: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [result] = await db.update(conversations).set(conv).where(eq(conversations.id, id)).returning();
    return result || undefined;
  }

  async updateConversationLastMessage(id: string): Promise<void> {
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async markConversationAsRead(id: string, userId: string): Promise<void> {
    const conv = await this.getConversation(id);
    if (!conv) return;

    if (conv.buyerId === userId) {
      await db.update(conversations)
        .set({ buyerUnreadCount: 0 })
        .where(eq(conversations.id, id));
    } else if (conv.sellerId === userId) {
      await db.update(conversations)
        .set({ sellerUnreadCount: 0 })
        .where(eq(conversations.id, id));
    }

    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, id),
        sql`${messages.senderId} != ${userId}`
      ));
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id));
    return msg || undefined;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.sentAt));
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(msg).returning();
    
    // Update conversation last message time and unread count
    const conv = await this.getConversation(msg.conversationId);
    if (conv) {
      const updateData: Partial<Conversation> = { lastMessageAt: new Date() };
      if (msg.senderId === conv.buyerId) {
        updateData.sellerUnreadCount = (conv.sellerUnreadCount || 0) + 1;
      } else {
        updateData.buyerUnreadCount = (conv.buyerUnreadCount || 0) + 1;
      }
      await db.update(conversations)
        .set(updateData)
        .where(eq(conversations.id, msg.conversationId));
    }
    
    return result;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} != ${userId}`
      ));
  }

  // Static Pages
  async getStaticPage(slug: string): Promise<StaticPage | undefined> {
    const [page] = await db.select().from(staticPages).where(eq(staticPages.slug, slug));
    return page;
  }

  async getAllStaticPages(): Promise<StaticPage[]> {
    return db.select().from(staticPages).orderBy(staticPages.slug);
  }

  async upsertStaticPage(page: InsertStaticPage): Promise<StaticPage> {
    const existing = await this.getStaticPage(page.slug);
    if (existing) {
      const [updated] = await db.update(staticPages)
        .set({ ...page, updatedAt: new Date() })
        .where(eq(staticPages.slug, page.slug))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(staticPages).values(page).returning();
      return created;
    }
  }

  // WebAuthn Credentials
  async createWebauthnCredential(cred: InsertWebauthnCredential): Promise<WebauthnCredential> {
    const [result] = await db.insert(webauthnCredentials).values(cred).returning();
    return result;
  }

  async getWebauthnCredentialsByUser(userId: string): Promise<WebauthnCredential[]> {
    return db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, userId));
  }

  async getWebauthnCredentialById(credentialId: string): Promise<WebauthnCredential | undefined> {
    const [cred] = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.credentialId, credentialId));
    return cred || undefined;
  }

  async updateWebauthnCredential(id: string, data: Partial<InsertWebauthnCredential>): Promise<WebauthnCredential | undefined> {
    const [result] = await db.update(webauthnCredentials)
      .set(data)
      .where(eq(webauthnCredentials.id, id))
      .returning();
    return result || undefined;
  }

  async deleteWebauthnCredential(id: string): Promise<void> {
    await db.delete(webauthnCredentials).where(eq(webauthnCredentials.id, id));
  }

  // WebAuthn Challenges
  async createWebauthnChallenge(challenge: InsertWebauthnChallenge): Promise<WebauthnChallenge> {
    const [result] = await db.insert(webauthnChallenges).values(challenge).returning();
    return result;
  }

  async getWebauthnChallenge(challenge: string): Promise<WebauthnChallenge | undefined> {
    const [result] = await db.select().from(webauthnChallenges).where(eq(webauthnChallenges.challenge, challenge));
    return result || undefined;
  }

  async deleteWebauthnChallenge(challenge: string): Promise<void> {
    await db.delete(webauthnChallenges).where(eq(webauthnChallenges.challenge, challenge));
  }

  async deleteExpiredWebauthnChallenges(): Promise<void> {
    await db.delete(webauthnChallenges).where(lte(webauthnChallenges.expiresAt, new Date()));
  }

  // Password Reset Tokens
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [result] = await db.insert(passwordResetTokens).values(token).returning();
    return result;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [result] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result || undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, token));
  }
}

export const storage = new DatabaseStorage();

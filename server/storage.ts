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
  findMatchesForProperty(propertyId: string): Promise<void>;
  findMatchesForPreference(preferenceId: string): Promise<void>;

  // Matches - additional
  getAllMatches(): Promise<Match[]>;

  // Contact Requests
  createContactRequest(req: InsertContactRequest): Promise<ContactRequest>;
  getContactRequestsByBuyer(buyerId: string): Promise<ContactRequest[]>;
  getContactRequestsByProperty(propertyId: string): Promise<ContactRequest[]>;
  getAllContactRequests(): Promise<ContactRequest[]>;

  // Analytics
  getTopDistricts(city: string, limit?: number): Promise<{ district: string; count: number }[]>;
  getAverageBudgetByCity(): Promise<{ city: string; avgBudget: number }[]>;
  getDemandByPropertyType(): Promise<{ propertyType: string; count: number }[]>;

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
    await db.delete(buyerPreferences).where(eq(buyerPreferences.id, id));
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
    await db.delete(properties).where(eq(properties.id, id));
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
   * خوارزمية المطابقة الذكية v2.0
   * نظام النقاط الموزونة من 100 نقطة (بالضبط):
   * - الموقع الجغرافي (40 نقطة): مطابقة الحي = 40، حي مجاور = 25، نفس المدينة فقط = 15
   * - التوافق السعري (30 نقطة): ضمن الميزانية = 30، أعلى بـ 5% = 20، أعلى بـ 15% = 10
   * - المواصفات الفنية (30 نقطة): نوع العقار = 15، الغرف/المساحة = 15
   */
  private calculateMatchScore(property: Property, preference: BuyerPreference): number {
    let locationScore = 0;
    let priceScore = 0;
    let specsScore = 0;
    
    // ===== 1. الموقع الجغرافي (40 نقطة كحد أقصى) =====
    // التحقق من المدينة (إلزامي)
    if (property.city !== preference.city) {
      return 0; // لا توجد مطابقة إذا كانت المدينة مختلفة
    }

    // مطابقة الحي
    if (preference.districts && preference.districts.length > 0) {
      if (preference.districts.includes(property.district)) {
        locationScore = 40; // مطابقة الحي تماماً
      } else if (this.isAdjacentDistrict(preference.city, property.district, preference.districts)) {
        locationScore = 25; // حي مجاور
      } else {
        // نفس المدينة لكن حي بعيد = نقاط جزئية فقط
        locationScore = 15;
      }
    } else {
      // لم يحدد أحياء معينة = نقاط جزئية
      locationScore = 20;
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

    // ===== 3. المواصفات الفنية (30 نقطة كحد أقصى) =====
    let propertyTypeScore = 0;
    let roomsAreaScore = 0;
    
    // نوع العقار (15 نقطة كحد أقصى)
    if (property.propertyType === preference.propertyType) {
      propertyTypeScore = 15; // تطابق تام
    } else {
      const similarTypes: Record<string, string[]> = {
        villa: ["duplex", "townhouse"],
        duplex: ["villa", "townhouse"],
        apartment: ["studio"],
        studio: ["apartment"],
      };
      if (similarTypes[preference.propertyType]?.includes(property.propertyType)) {
        propertyTypeScore = 8; // نوع مشابه
      } else {
        propertyTypeScore = 0; // نوع مختلف تماماً
      }
    }

    // الغرف والمساحة (15 نقطة كحد أقصى: 7.5 لكل منهما)
    let roomsScore = 0;
    let areaScore = 0;
    
    if (preference.rooms && property.rooms) {
      const prefRooms = parseInt(preference.rooms) || 0;
      const propRooms = parseInt(property.rooms) || 0;
      
      if (propRooms === prefRooms) {
        roomsScore = 7.5;
      } else if (Math.abs(propRooms - prefRooms) === 1) {
        roomsScore = 5;
      } else if (Math.abs(propRooms - prefRooms) <= 2) {
        roomsScore = 2.5;
      }
    }

    if (preference.area && property.area) {
      const prefArea = parseInt(preference.area) || 0;
      const propArea = parseInt(property.area) || 0;
      
      if (prefArea > 0) {
        const ratio = propArea / prefArea;
        if (ratio >= 0.9 && ratio <= 1.1) {
          areaScore = 7.5; // ضمن 10%
        } else if (ratio >= 0.8 && ratio <= 1.2) {
          areaScore = 5; // ضمن 20%
        } else if (ratio >= 0.7 && ratio <= 1.3) {
          areaScore = 2.5; // ضمن 30%
        }
      }
    }

    roomsAreaScore = roomsScore + areaScore;
    specsScore = propertyTypeScore + roomsAreaScore;

    // الحد الأقصى 30 نقطة للمواصفات
    specsScore = Math.min(30, specsScore);

    // المجموع النهائي (100 نقطة كحد أقصى)
    const totalScore = Math.min(40, locationScore) + Math.min(30, priceScore) + Math.min(30, specsScore);

    return Math.min(100, Math.round(totalScore));
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
      avgBudget: sql<number>`avg((${buyerPreferences.budgetMin} + ${buyerPreferences.budgetMax}) / 2)`,
    })
    .from(buyerPreferences)
    .groupBy(buyerPreferences.city);

    return result.map(r => ({
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

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, doublePrecision, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports buyers, sellers, and admins
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"), // كلمة المرور المشفرة
  requiresPasswordReset: boolean("requires_password_reset").default(true), // يتطلب تغيير كلمة المرور
  role: text("role").notNull().default("buyer"), // buyer, seller, admin
  accountType: text("account_type"), // individual, developer, office (for sellers)
  entityName: text("entity_name"), // company name for sellers
  // Seller verification fields (REGA compliance)
  isVerified: boolean("is_verified").default(false), // موثوق من الهيئة العامة للعقار
  verificationStatus: text("verification_status").default("pending"), // pending, in_review, approved, rejected, expired
  falLicenseNumber: text("fal_license_number"), // رقم رخصة فال
  adLicenseNumber: text("ad_license_number"), // رقم ترخيص الإعلان
  licenseIssueDate: text("license_issue_date"), // تاريخ إصدار الترخيص
  licenseExpiryDate: text("license_expiry_date"), // تاريخ انتهاء الترخيص
  commercialRegNumber: text("commercial_reg_number"), // رقم السجل التجاري (للشركات)
  nationalId: text("national_id"), // رقم الهوية/الإقامة
  city: text("city"), // مدينة المكتب/المقر
  officeAddress: text("office_address"), // عنوان المكتب
  whatsappNumber: text("whatsapp_number"), // رقم واتساب للتواصل
  websiteUrl: text("website_url"), // الموقع الإلكتروني
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Buyer preferences/wishes
export const buyerPreferences = pgTable("buyer_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  city: text("city").notNull(),
  districts: text("districts").array().notNull().default(sql`'{}'::text[]`),
  propertyType: text("property_type").notNull(), // apartment, villa, building, land
  transactionType: text("transaction_type").notNull().default("buy"), // buy, rent (شراء أو تأجير)
  rooms: text("rooms"),
  area: text("area"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  paymentMethod: text("payment_method"), // cash, bank
  purpose: text("purpose"), // residence, investment
  purchaseTimeline: text("purchase_timeline"), // asap, within_month, within_3months, within_6months, within_year, flexible
  clientType: text("client_type").notNull().default("direct"), // direct, broker (مباشر أو وسيط)
  isActive: boolean("is_active").notNull().default(true),
});

export const insertBuyerPreferenceSchema = createInsertSchema(buyerPreferences).omit({ id: true });
export type InsertBuyerPreference = z.infer<typeof insertBuyerPreferenceSchema>;
export type BuyerPreference = typeof buyerPreferences.$inferSelect;

// Properties for sale
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").references(() => users.id),
  propertyType: text("property_type").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  price: integer("price").notNull(),
  area: text("area"),
  rooms: text("rooms"),
  bathrooms: text("bathrooms"),
  description: text("description"),
  status: text("status").notNull().default("ready"), // ready, under_construction
  furnishing: text("furnishing").default("unfurnished"), // furnished, semi_furnished, unfurnished
  yearBuilt: text("year_built"),
  amenities: text("amenities").array().default(sql`'{}'::text[]`), // parking, ac, wifi, security, garden, gym, maid_room, electricity, water
  images: text("images").array().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  viewsCount: integer("views_count").notNull().default(0),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, viewsCount: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Matches between buyers and properties
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerPreferenceId: varchar("buyer_preference_id").references(() => buyerPreferences.id),
  propertyId: varchar("property_id").references(() => properties.id),
  matchScore: integer("match_score").notNull().default(0), // 0-100 score
  isSaved: boolean("is_saved").notNull().default(false),
  isContacted: boolean("is_contacted").notNull().default(false),
});

export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Contact requests
export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id),
  buyerId: varchar("buyer_id").references(() => users.id),
  propertyId: varchar("property_id").references(() => properties.id),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, contacted, completed
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).omit({ id: true });
export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

// Send logs - tracks WhatsApp messages sent to clients
export const sendLogs = pgTable("send_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  preferenceId: varchar("preference_id").references(() => buyerPreferences.id),
  userId: varchar("user_id").references(() => users.id),
  propertyIds: text("property_ids").array().default(sql`'{}'::text[]`), // Array of property IDs sent
  messageType: text("message_type").notNull().default("matches"), // matches, no_matches
  status: text("status").notNull().default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at").defaultNow(),
  whatsappResponse: text("whatsapp_response"), // Store API response
});

export const insertSendLogSchema = createInsertSchema(sendLogs).omit({ id: true, sentAt: true });
export type InsertSendLog = z.infer<typeof insertSendLogSchema>;
export type SendLog = typeof sendLogs.$inferSelect;

// Marketing integrations settings
export const marketingSettings = pgTable("marketing_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull().unique(), // snapchat, tiktok, facebook, google, mailchimp
  isEnabled: boolean("is_enabled").notNull().default(false),
  pixelId: text("pixel_id"), // For pixel-based tracking (Snap, TikTok, Facebook, Google)
  accessToken: text("access_token"), // API access token
  apiKey: text("api_key"), // API key (MailChimp)
  audienceId: text("audience_id"), // List/Audience ID (MailChimp)
  conversionApiToken: text("conversion_api_token"), // Server-side conversion API
  testEventCode: text("test_event_code"), // For testing events
  dataCenter: text("data_center"), // MailChimp data center (us1, us2, etc.)
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingSettingSchema = createInsertSchema(marketingSettings).omit({ id: true, updatedAt: true });
export type InsertMarketingSetting = z.infer<typeof insertMarketingSettingSchema>;
export type MarketingSetting = typeof marketingSettings.$inferSelect;

// Marketing events log - tracks all marketing events sent
export const marketingEvents = pgTable("marketing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // snapchat, tiktok, facebook, google, mailchimp
  eventName: text("event_name").notNull(), // PageView, Lead, Registration, etc.
  eventData: jsonb("event_data"), // Event parameters
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  status: text("status").notNull().default("sent"), // sent, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingEventSchema = createInsertSchema(marketingEvents).omit({ id: true, createdAt: true });
export type InsertMarketingEvent = z.infer<typeof insertMarketingEventSchema>;
export type MarketingEvent = typeof marketingEvents.$inferSelect;

// Conversations - for in-app messaging between buyers and sellers
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  buyerUnreadCount: integer("buyer_unread_count").notNull().default(0),
  sellerUnreadCount: integer("seller_unread_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, lastMessageAt: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages - individual messages within conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, location
  attachments: text("attachments").array().default(sql`'{}'::text[]`),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Static pages - FAQ, Privacy Policy, Terms (editable from admin)
export const staticPages = pgTable("static_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(), // faq, privacy, terms
  titleAr: text("title_ar").notNull(), // Arabic title
  contentAr: text("content_ar").notNull(), // Arabic content (HTML)
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaticPageSchema = createInsertSchema(staticPages).omit({ id: true, updatedAt: true });
export type InsertStaticPage = z.infer<typeof insertStaticPageSchema>;
export type StaticPage = typeof staticPages.$inferSelect;

// =============================================
// Machine Learning & User Behavior Tracking
// =============================================

// User interactions - tracks all user actions for ML learning
export const userInteractions = pgTable("user_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // For anonymous users
  propertyId: varchar("property_id").references(() => properties.id),
  interactionType: text("interaction_type").notNull(), // view, save, skip, contact, share, unsave
  duration: integer("duration"), // Time spent viewing (seconds)
  // Property attributes at time of interaction (for learning)
  propertyCity: text("property_city"),
  propertyDistrict: text("property_district"),
  propertyType: text("property_type"),
  propertyPrice: integer("property_price"),
  propertyArea: integer("property_area"),
  // User context
  userBudgetMax: integer("user_budget_max"),
  userPreferredCity: text("user_preferred_city"),
  userPreferredType: text("user_preferred_type"),
  // Metadata
  deviceType: text("device_type"), // mobile, desktop, tablet
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({ id: true, createdAt: true });
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;

// Learned preference weights - personalized weights for each user
export const userPreferenceWeights = pgTable("user_preference_weights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"), // For anonymous users
  // Learned weights (0.0 to 2.0, where 1.0 is default)
  locationWeight: doublePrecision("location_weight").notNull().default(1.0),
  priceWeight: doublePrecision("price_weight").notNull().default(1.0),
  areaWeight: doublePrecision("area_weight").notNull().default(1.0),
  propertyTypeWeight: doublePrecision("property_type_weight").notNull().default(1.0),
  ageWeight: doublePrecision("age_weight").notNull().default(1.0),
  amenitiesWeight: doublePrecision("amenities_weight").notNull().default(1.0),
  // Learned preferences
  preferredDistricts: text("preferred_districts").array().default(sql`'{}'::text[]`),
  preferredPropertyTypes: text("preferred_property_types").array().default(sql`'{}'::text[]`),
  priceRangeMin: integer("price_range_min"),
  priceRangeMax: integer("price_range_max"),
  areaRangeMin: integer("area_range_min"),
  areaRangeMax: integer("area_range_max"),
  // Learning metadata
  totalInteractions: integer("total_interactions").notNull().default(0),
  lastLearningUpdate: timestamp("last_learning_update").defaultNow(),
  confidenceScore: doublePrecision("confidence_score").notNull().default(0.0), // 0-1
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserPreferenceWeightsSchema = createInsertSchema(userPreferenceWeights).omit({ id: true, updatedAt: true, lastLearningUpdate: true });
export type InsertUserPreferenceWeights = z.infer<typeof insertUserPreferenceWeightsSchema>;
export type UserPreferenceWeights = typeof userPreferenceWeights.$inferSelect;

// ML model metrics - tracks model performance
export const mlModelMetrics = pgTable("ml_model_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelVersion: text("model_version").notNull(),
  metricType: text("metric_type").notNull(), // accuracy, precision, recall, conversion_rate
  metricValue: doublePrecision("metric_value").notNull(),
  sampleSize: integer("sample_size").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const insertMlModelMetricsSchema = createInsertSchema(mlModelMetrics).omit({ id: true, calculatedAt: true });
export type InsertMlModelMetrics = z.infer<typeof insertMlModelMetricsSchema>;
export type MlModelMetrics = typeof mlModelMetrics.$inferSelect;

// =============================================
// AUDIENCE SEGMENTATION SYSTEM (نظام تصنيف الجمهور)
// =============================================

// Audience segments - predefined customer segments
export const audienceSegments = pgTable("audience_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // اسم الشريحة
  nameAr: text("name_ar").notNull(), // الاسم بالعربية
  description: text("description"),
  // Segment criteria
  purchasingPowerTier: text("purchasing_power_tier").notNull(), // luxury, premium, mid_range, budget, economy
  minBudget: integer("min_budget"), // الحد الأدنى للميزانية
  maxBudget: integer("max_budget"), // الحد الأعلى للميزانية
  propertyTypes: text("property_types").array().default(sql`'{}'::text[]`), // أنواع العقارات المستهدفة
  transactionTypes: text("transaction_types").array().default(sql`'{}'::text[]`), // buy, rent
  cities: text("cities").array().default(sql`'{}'::text[]`), // المدن المستهدفة
  purposes: text("purposes").array().default(sql`'{}'::text[]`), // residence, investment
  // Behavioral criteria
  engagementLevel: text("engagement_level"), // high, medium, low
  conversionPotential: text("conversion_potential"), // hot, warm, cold
  // Segment metadata
  color: text("color").default("#3B82F6"), // لون الشريحة للعرض
  priority: integer("priority").notNull().default(0), // أولوية الاستهداف
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAudienceSegmentSchema = createInsertSchema(audienceSegments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAudienceSegment = z.infer<typeof insertAudienceSegmentSchema>;
export type AudienceSegment = typeof audienceSegments.$inferSelect;

// User segment assignments - links users to segments
export const userSegments = pgTable("user_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  segmentId: varchar("segment_id").references(() => audienceSegments.id),
  // Classification scores
  matchScore: integer("match_score").notNull().default(0), // 0-100 how well user matches segment
  purchasingPowerScore: integer("purchasing_power_score").notNull().default(0), // 0-100 قوة شرائية
  engagementScore: integer("engagement_score").notNull().default(0), // 0-100 مستوى التفاعل
  intentScore: integer("intent_score").notNull().default(0), // 0-100 نية الشراء
  // Classification metadata
  classifiedAt: timestamp("classified_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  classificationReason: text("classification_reason"), // سبب التصنيف
  isAutoClassified: boolean("is_auto_classified").notNull().default(true), // تصنيف آلي أم يدوي
});

export const insertUserSegmentSchema = createInsertSchema(userSegments).omit({ id: true, classifiedAt: true, lastUpdated: true });
export type InsertUserSegment = z.infer<typeof insertUserSegmentSchema>;
export type UserSegment = typeof userSegments.$inferSelect;

// Ad campaigns - targeted advertising campaigns
export const adCampaigns = pgTable("ad_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  // Targeting
  targetSegments: text("target_segments").array().default(sql`'{}'::text[]`), // شرائح الجمهور المستهدفة
  targetCities: text("target_cities").array().default(sql`'{}'::text[]`),
  targetPropertyTypes: text("target_property_types").array().default(sql`'{}'::text[]`),
  minPurchasingPower: integer("min_purchasing_power"), // الحد الأدنى للقوة الشرائية
  maxPurchasingPower: integer("max_purchasing_power"),
  // Campaign content
  messageTemplate: text("message_template"), // قالب الرسالة
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"),
  // Channels
  channels: text("channels").array().default(sql`'{}'::text[]`), // whatsapp, email, sms, push
  // Schedule
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  frequency: text("frequency").default("once"), // once, daily, weekly, monthly
  // Status
  status: text("status").notNull().default("draft"), // draft, scheduled, active, paused, completed
  // Metrics
  totalSent: integer("total_sent").notNull().default(0),
  totalDelivered: integer("total_delivered").notNull().default(0),
  totalOpened: integer("total_opened").notNull().default(0),
  totalClicked: integer("total_clicked").notNull().default(0),
  totalConverted: integer("total_converted").notNull().default(0),
  // Metadata
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({ id: true, createdAt: true, updatedAt: true, totalSent: true, totalDelivered: true, totalOpened: true, totalClicked: true, totalConverted: true });
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;

// Campaign sends - tracks individual campaign messages
export const campaignSends = pgTable("campaign_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => adCampaigns.id),
  userId: varchar("user_id").references(() => users.id),
  segmentId: varchar("segment_id").references(() => audienceSegments.id),
  // Message details
  channel: text("channel").notNull(), // whatsapp, email, sms, push
  messageContent: text("message_content"),
  // Status tracking
  status: text("status").notNull().default("pending"), // pending, sent, delivered, opened, clicked, converted, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  convertedAt: timestamp("converted_at"),
  // Error tracking
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCampaignSendSchema = createInsertSchema(campaignSends).omit({ id: true, createdAt: true });
export type InsertCampaignSend = z.infer<typeof insertCampaignSendSchema>;
export type CampaignSend = typeof campaignSends.$inferSelect;

// Purchasing power tiers enum for frontend
export const PURCHASING_POWER_TIERS = {
  luxury: { min: 5000000, label: "فاخر", labelEn: "Luxury", color: "#8B5CF6" },
  premium: { min: 2000000, max: 5000000, label: "متميز", labelEn: "Premium", color: "#3B82F6" },
  mid_range: { min: 800000, max: 2000000, label: "متوسط", labelEn: "Mid-Range", color: "#10B981" },
  budget: { min: 300000, max: 800000, label: "اقتصادي", labelEn: "Budget", color: "#F59E0B" },
  economy: { max: 300000, label: "ميسر", labelEn: "Economy", color: "#6B7280" },
} as const;

// ==================== BROKER SUBSCRIPTION SYSTEM ====================

// Subscription plans for brokers
export const BROKER_SUBSCRIPTION_PLANS = {
  free: {
    name: "مجاني",
    nameEn: "Free",
    maxProperties: 3,
    maxLeadsPerMonth: 10,
    featuredListings: 0,
    prioritySupport: false,
    analytics: false,
    price: 0,
  },
  basic: {
    name: "أساسي",
    nameEn: "Basic",
    maxProperties: 15,
    maxLeadsPerMonth: 50,
    featuredListings: 2,
    prioritySupport: false,
    analytics: true,
    price: 299,
  },
  premium: {
    name: "متميز",
    nameEn: "Premium",
    maxProperties: 50,
    maxLeadsPerMonth: 200,
    featuredListings: 10,
    prioritySupport: true,
    analytics: true,
    price: 799,
  },
  professional: {
    name: "احترافي",
    nameEn: "Professional",
    maxProperties: -1, // unlimited
    maxLeadsPerMonth: -1, // unlimited
    featuredListings: -1, // unlimited
    prioritySupport: true,
    analytics: true,
    price: 1499,
  },
} as const;

// Broker subscriptions table
export const brokerSubscriptions = pgTable("broker_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  // Plan details
  plan: text("plan").notNull().default("free"), // free, basic, premium, professional
  // Dates
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  // Usage tracking
  propertiesUsed: integer("properties_used").notNull().default(0),
  leadsUsedThisMonth: integer("leads_used_this_month").notNull().default(0),
  featuredUsed: integer("featured_used").notNull().default(0),
  // Billing
  billingCycle: text("billing_cycle").default("monthly"), // monthly, yearly
  lastBillingDate: timestamp("last_billing_date"),
  nextBillingDate: timestamp("next_billing_date"),
  // Status
  status: text("status").notNull().default("active"), // active, expired, cancelled, suspended
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrokerSubscriptionSchema = createInsertSchema(brokerSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBrokerSubscription = z.infer<typeof insertBrokerSubscriptionSchema>;
export type BrokerSubscription = typeof brokerSubscriptions.$inferSelect;

// ==================== LEADS SYSTEM ====================

// Leads - when a buyer shows interest in a property
export const propertyLeads = pgTable("property_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  // Lead source
  source: text("source").notNull().default("view"), // view, save, contact, inquiry, call
  // Lead quality score (0-100)
  qualityScore: integer("quality_score").notNull().default(50),
  // Status tracking
  status: text("status").notNull().default("new"), // new, contacted, qualified, negotiating, converted, lost
  // Contact info
  buyerMessage: text("buyer_message"),
  buyerPhone: text("buyer_phone"),
  buyerEmail: text("buyer_email"),
  // Follow-up
  lastContactAt: timestamp("last_contact_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  notes: text("notes"),
  // Conversion tracking
  convertedAt: timestamp("converted_at"),
  conversionValue: integer("conversion_value"), // sale price if converted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertyLeadSchema = createInsertSchema(propertyLeads).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPropertyLead = z.infer<typeof insertPropertyLeadSchema>;
export type PropertyLead = typeof propertyLeads.$inferSelect;

// ==================== AD VIEWS & IMPRESSIONS ====================

// Property impressions (views)
export const propertyImpressions = pgTable("property_impressions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  viewerId: varchar("viewer_id").references(() => users.id), // null for anonymous
  // View details
  viewType: text("view_type").notNull().default("list"), // list, detail, search, featured, recommended
  duration: integer("duration"), // seconds spent viewing
  // Source tracking
  source: text("source").default("organic"), // organic, featured, ad, recommendation, search
  referrer: text("referrer"),
  // Device info
  deviceType: text("device_type"), // mobile, desktop, tablet
  // Action taken
  actionTaken: text("action_taken"), // none, save, contact, share, call
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertyImpressionSchema = createInsertSchema(propertyImpressions).omit({ id: true, createdAt: true });
export type InsertPropertyImpression = z.infer<typeof insertPropertyImpressionSchema>;
export type PropertyImpression = typeof propertyImpressions.$inferSelect;

// ==================== FEATURED/BOOSTED LISTINGS ====================

// Property boosts - paid promotion for properties
export const propertyBoosts = pgTable("property_boosts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  // Boost type
  boostType: text("boost_type").notNull().default("featured"), // featured, spotlight, homepage, search_top
  // Duration
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  // Pricing
  price: integer("price").notNull(), // in SAR
  // Targeting
  targetCities: text("target_cities").array().default(sql`'{}'::text[]`),
  targetBudgetMin: integer("target_budget_min"),
  targetBudgetMax: integer("target_budget_max"),
  // Performance metrics
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  leads: integer("leads").notNull().default(0),
  // Status
  status: text("status").notNull().default("active"), // pending, active, paused, expired, cancelled
  // Payment
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertyBoostSchema = createInsertSchema(propertyBoosts).omit({ id: true, createdAt: true, updatedAt: true, impressions: true, clicks: true, leads: true });
export type InsertPropertyBoost = z.infer<typeof insertPropertyBoostSchema>;
export type PropertyBoost = typeof propertyBoosts.$inferSelect;

// ==================== PROPERTY RANKING ALGORITHM ====================

// Property ranking scores - calculated scores for ranking
export const propertyRankingScores = pgTable("property_ranking_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id).notNull().unique(),
  // Base scores
  subscriptionScore: real("subscription_score").notNull().default(0), // 0-100 based on seller's plan
  qualityScore: real("quality_score").notNull().default(0), // 0-100 based on property completeness
  engagementScore: real("engagement_score").notNull().default(0), // 0-100 based on views/saves
  recencyScore: real("recency_score").notNull().default(0), // 0-100 based on listing age
  verificationScore: real("verification_score").notNull().default(0), // 0-100 based on seller verification
  // Boost multipliers
  boostMultiplier: real("boost_multiplier").notNull().default(1.0),
  featuredBonus: real("featured_bonus").notNull().default(0),
  // Final composite score
  totalScore: real("total_score").notNull().default(0),
  // Tracking
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertyRankingScoreSchema = createInsertSchema(propertyRankingScores).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPropertyRankingScore = z.infer<typeof insertPropertyRankingScoreSchema>;
export type PropertyRankingScore = typeof propertyRankingScores.$inferSelect;

// ==================== BROKER ANALYTICS ====================

// Daily broker analytics
export const brokerAnalytics = pgTable("broker_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  // Impressions
  totalImpressions: integer("total_impressions").notNull().default(0),
  uniqueViewers: integer("unique_viewers").notNull().default(0),
  // Engagement
  totalClicks: integer("total_clicks").notNull().default(0),
  totalSaves: integer("total_saves").notNull().default(0),
  totalShares: integer("total_shares").notNull().default(0),
  // Leads
  newLeads: integer("new_leads").notNull().default(0),
  qualifiedLeads: integer("qualified_leads").notNull().default(0),
  convertedLeads: integer("converted_leads").notNull().default(0),
  // Revenue (from conversions)
  revenueGenerated: integer("revenue_generated").notNull().default(0),
  // Property stats
  activeListings: integer("active_listings").notNull().default(0),
  featuredListings: integer("featured_listings").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBrokerAnalyticsSchema = createInsertSchema(brokerAnalytics).omit({ id: true, createdAt: true });
export type InsertBrokerAnalytics = z.infer<typeof insertBrokerAnalyticsSchema>;
export type BrokerAnalytics = typeof brokerAnalytics.$inferSelect;

// ==================== WEBAUTHN CREDENTIALS ====================

// WebAuthn credentials for biometric authentication (Face ID, Touch ID, Fingerprint, Windows Hello)
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  credentialId: text("credential_id").notNull().unique(), // Base64 encoded credential ID
  publicKey: text("public_key").notNull(), // Base64 encoded public key
  counter: integer("counter").notNull().default(0), // Signature counter for replay attack prevention
  deviceType: text("device_type"), // platform (biometric) or cross-platform (security key)
  transports: text("transports").array().default(sql`'{}'::text[]`), // usb, ble, nfc, internal
  deviceName: text("device_name"), // User-friendly device name (e.g., "iPhone 15", "MacBook Pro")
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWebauthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({ id: true, createdAt: true });
export type InsertWebauthnCredential = z.infer<typeof insertWebauthnCredentialSchema>;
export type WebauthnCredential = typeof webauthnCredentials.$inferSelect;

// WebAuthn challenges - temporary storage for authentication challenges
export const webauthnChallenges = pgTable("webauthn_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challenge: text("challenge").notNull().unique(), // Base64 encoded challenge
  userId: varchar("user_id").references(() => users.id), // Optional: for authentication, null for registration discovery
  type: text("type").notNull(), // "registration" or "authentication"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWebauthnChallengeSchema = createInsertSchema(webauthnChallenges).omit({ id: true, createdAt: true });
export type InsertWebauthnChallenge = z.infer<typeof insertWebauthnChallengeSchema>;
export type WebauthnChallenge = typeof webauthnChallenges.$inferSelect;

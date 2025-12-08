import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports buyers, sellers, and admins
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("buyer"), // buyer, seller, admin
  accountType: text("account_type"), // individual, developer, office (for sellers)
  entityName: text("entity_name"), // company name for sellers
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

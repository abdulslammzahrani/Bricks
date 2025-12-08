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
  rooms: text("rooms"),
  area: text("area"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  paymentMethod: text("payment_method"), // cash, bank
  purpose: text("purpose"), // residence, investment
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
  description: text("description"),
  status: text("status").notNull().default("ready"), // ready, under_construction
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

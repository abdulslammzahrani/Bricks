import { 
  users, type User, type InsertUser,
  buyerPreferences, type BuyerPreference, type InsertBuyerPreference,
  properties, type Property, type InsertProperty,
  matches, type Match, type InsertMatch,
  contactRequests, type ContactRequest, type InsertContactRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, sql, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(role?: string): Promise<User[]>;

  // Buyer Preferences
  getBuyerPreference(id: string): Promise<BuyerPreference | undefined>;
  getBuyerPreferencesByUser(userId: string): Promise<BuyerPreference[]>;
  createBuyerPreference(pref: InsertBuyerPreference): Promise<BuyerPreference>;
  updateBuyerPreference(id: string, pref: Partial<InsertBuyerPreference>): Promise<BuyerPreference | undefined>;
  getAllBuyerPreferences(): Promise<BuyerPreference[]>;

  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesBySeller(sellerId: string): Promise<Property[]>;
  createProperty(prop: InsertProperty): Promise<Property>;
  updateProperty(id: string, prop: Partial<InsertProperty>): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  incrementPropertyViews(id: string): Promise<void>;

  // Matches
  getMatch(id: string): Promise<Match | undefined>;
  getMatchesByBuyerPreference(prefId: string): Promise<Match[]>;
  getMatchesByProperty(propId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
  findMatchesForProperty(propertyId: string): Promise<void>;
  findMatchesForPreference(preferenceId: string): Promise<void>;

  // Contact Requests
  createContactRequest(req: InsertContactRequest): Promise<ContactRequest>;
  getContactRequestsByBuyer(buyerId: string): Promise<ContactRequest[]>;
  getContactRequestsByProperty(propertyId: string): Promise<ContactRequest[]>;

  // Analytics
  getTopDistricts(city: string, limit?: number): Promise<{ district: string; count: number }[]>;
  getAverageBudgetByCity(): Promise<{ city: string; avgBudget: number }[]>;
  getDemandByPropertyType(): Promise<{ propertyType: string; count: number }[]>;
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

  async getAllBuyerPreferences(): Promise<BuyerPreference[]> {
    return db.select().from(buyerPreferences).where(eq(buyerPreferences.isActive, true));
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
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

  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.isActive, true));
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

  private calculateMatchScore(property: Property, preference: BuyerPreference): number {
    let score = 0;
    let factors = 0;

    // City match (mandatory)
    if (property.city === preference.city) {
      score += 30;
    } else {
      return 0; // No match if different city
    }
    factors++;

    // District match
    if (preference.districts && preference.districts.length > 0) {
      if (preference.districts.includes(property.district)) {
        score += 25;
      }
      factors++;
    }

    // Property type match
    if (property.propertyType === preference.propertyType) {
      score += 25;
    }
    factors++;

    // Budget match
    if (preference.budgetMin && preference.budgetMax) {
      if (property.price >= preference.budgetMin && property.price <= preference.budgetMax) {
        score += 15;
      } else if (property.price <= preference.budgetMax * 1.1) {
        score += 7; // Slightly over budget
      }
      factors++;
    }

    // Rooms match
    if (preference.rooms && property.rooms) {
      if (property.rooms === preference.rooms) {
        score += 5;
      }
      factors++;
    }

    return Math.min(100, score);
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
}

export const storage = new DatabaseStorage();

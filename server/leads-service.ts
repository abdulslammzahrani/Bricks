import { db } from "./db";
import {
  progressiveProfiles,
  propertyLeads,
  buyerPreferences,
  properties,
  users,
  matches,
} from "@shared/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { storage } from "./storage";

/**
 * Leads Service
 * إدارة الليدز وتحويلهم إلى راغبين
 */

export interface UnifiedLead {
  id: string;
  type: "progressive" | "property";
  name: string;
  phone: string;
  email?: string;
  propertyId: string;
  property?: typeof properties.$inferSelect;
  sellerId?: string;
  source: string;
  status: string;
  qualityScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Progressive profile specific
  stage?: number;
  buyerPreferenceId?: string;
  isConvertedToBuyer?: boolean;
  // Property lead specific
  buyerMessage?: string;
}

/**
 * Get all leads (unified from progressiveProfiles and propertyLeads)
 */
export async function getAllLeads(filters?: {
  sellerId?: string;
  propertyId?: string;
  status?: string;
  source?: string;
}): Promise<UnifiedLead[]> {
  const leads: UnifiedLead[] = [];

  // Get progressive profiles (landing page leads)
  const progressiveWhere = [];
  if (filters?.propertyId) {
    progressiveWhere.push(eq(progressiveProfiles.propertyInterestedId, filters.propertyId));
  }
  if (filters?.status) {
    if (filters.status === "converted") {
      progressiveWhere.push(eq(progressiveProfiles.isConvertedToBuyer, true));
    } else if (filters.status === "new") {
      progressiveWhere.push(eq(progressiveProfiles.isConvertedToBuyer, false));
    }
  }

  const progressiveLeads = await db
    .select()
    .from(progressiveProfiles)
    .where(progressiveWhere.length > 0 ? and(...progressiveWhere) : undefined)
    .orderBy(desc(progressiveProfiles.createdAt));

  for (const profile of progressiveLeads) {
    // Get property
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, profile.propertyInterestedId))
      .limit(1);

    // Filter by seller if needed
    if (filters?.sellerId && property?.sellerId !== filters.sellerId) {
      continue;
    }

    const basicData = profile.basicData as { name: string; phone: string; email?: string } || {
      name: "زائر",
      phone: profile.visitorPhone,
    };

    leads.push({
      id: profile.id,
      type: "progressive",
      name: basicData.name,
      phone: basicData.phone || profile.visitorPhone,
      email: basicData.email,
      propertyId: profile.propertyInterestedId,
      property: property || undefined,
      sellerId: property?.sellerId || undefined,
      source: "landing_page",
      status: profile.isConvertedToBuyer ? "converted" : profile.stage === 1 ? "new" : "in_progress",
      stage: profile.stage,
      buyerPreferenceId: profile.buyerPreferenceId || undefined,
      isConvertedToBuyer: profile.isConvertedToBuyer,
      createdAt: profile.createdAt || new Date(),
      updatedAt: profile.updatedAt || new Date(),
    });
  }

  // Get property leads (regular leads)
  const propertyWhere = [];
  if (filters?.sellerId) {
    propertyWhere.push(eq(propertyLeads.sellerId, filters.sellerId));
  }
  if (filters?.propertyId) {
    propertyWhere.push(eq(propertyLeads.propertyId, filters.propertyId));
  }
  if (filters?.status) {
    propertyWhere.push(eq(propertyLeads.status, filters.status));
  }
  if (filters?.source) {
    propertyWhere.push(eq(propertyLeads.source, filters.source));
  }

  const propertyLeadsData = await db
    .select()
    .from(propertyLeads)
    .where(propertyWhere.length > 0 ? and(...propertyWhere) : undefined)
    .orderBy(desc(propertyLeads.createdAt));

  for (const lead of propertyLeadsData) {
    // Get property
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, lead.propertyId))
      .limit(1);

    // Get buyer user
    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.id, lead.buyerId))
      .limit(1);

    leads.push({
      id: lead.id,
      type: "property",
      name: buyer?.name || lead.buyerPhone || "عميل",
      phone: lead.buyerPhone || buyer?.phone || "",
      email: lead.buyerEmail || buyer?.email,
      propertyId: lead.propertyId,
      property: property || undefined,
      sellerId: lead.sellerId,
      source: lead.source,
      status: lead.status,
      qualityScore: lead.qualityScore,
      buyerMessage: lead.buyerMessage || undefined,
      notes: lead.notes || undefined,
      createdAt: lead.createdAt || new Date(),
      updatedAt: lead.updatedAt || new Date(),
    });
  }

  // Sort by creation date (newest first)
  return leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get lead by ID
 */
export async function getLeadById(leadId: string, type: "progressive" | "property"): Promise<UnifiedLead | null> {
  if (type === "progressive") {
    const [profile] = await db
      .select()
      .from(progressiveProfiles)
      .where(eq(progressiveProfiles.id, leadId))
      .limit(1);

    if (!profile) return null;

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, profile.propertyInterestedId))
      .limit(1);

    const basicData = profile.basicData as { name: string; phone: string; email?: string } || {
      name: "زائر",
      phone: profile.visitorPhone,
    };

    return {
      id: profile.id,
      type: "progressive",
      name: basicData.name,
      phone: basicData.phone || profile.visitorPhone,
      email: basicData.email,
      propertyId: profile.propertyInterestedId,
      property: property || undefined,
      sellerId: property?.sellerId || undefined,
      source: "landing_page",
      status: profile.isConvertedToBuyer ? "converted" : profile.stage === 1 ? "new" : "in_progress",
      stage: profile.stage,
      buyerPreferenceId: profile.buyerPreferenceId || undefined,
      isConvertedToBuyer: profile.isConvertedToBuyer,
      createdAt: profile.createdAt || new Date(),
      updatedAt: profile.updatedAt || new Date(),
    };
  } else {
    const [lead] = await db
      .select()
      .from(propertyLeads)
      .where(eq(propertyLeads.id, leadId))
      .limit(1);

    if (!lead) return null;

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, lead.propertyId))
      .limit(1);

    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.id, lead.buyerId))
      .limit(1);

    return {
      id: lead.id,
      type: "property",
      name: buyer?.name || lead.buyerPhone || "عميل",
      phone: lead.buyerPhone || buyer?.phone || "",
      email: lead.buyerEmail || buyer?.email,
      propertyId: lead.propertyId,
      property: property || undefined,
      sellerId: lead.sellerId,
      source: lead.source,
      status: lead.status,
      qualityScore: lead.qualityScore,
      buyerMessage: lead.buyerMessage || undefined,
      notes: lead.notes || undefined,
      createdAt: lead.createdAt || new Date(),
      updatedAt: lead.updatedAt || new Date(),
    };
  }
}

/**
 * Convert lead to buyer preference
 */
export async function convertLeadToBuyerPreference(
  leadId: string,
  type: "progressive" | "property",
  preferences: {
    city: string;
    districts?: string[];
    propertyType: string;
    budgetMin?: number;
    budgetMax?: number;
    transactionType?: string;
    rooms?: string;
    area?: string;
    [key: string]: any;
  }
): Promise<{
  buyerPreference: typeof buyerPreferences.$inferSelect;
  userId: string;
}> {
  const lead = await getLeadById(leadId, type);
  if (!lead) {
    throw new Error("Lead not found");
  }

  // Get or create user
  let userId: string;
  
  if (type === "progressive") {
    const [profile] = await db
      .select()
      .from(progressiveProfiles)
      .where(eq(progressiveProfiles.id, leadId))
      .limit(1);

    if (!profile) throw new Error("Profile not found");

    if (profile.userId) {
      userId = profile.userId;
    } else {
      // Create user from progressive profile
      const basicData = profile.basicData as { name: string; phone: string; email?: string };
      const [newUser] = await db
        .insert(users)
        .values({
          name: basicData.name,
          phone: basicData.phone || profile.visitorPhone,
          email: basicData.email || null,
          role: "buyer",
          requiresPasswordReset: true,
        })
        .returning();
      userId = newUser.id;

      // Update profile with user ID
      await db
        .update(progressiveProfiles)
        .set({
          userId,
          updatedAt: new Date(),
        })
        .where(eq(progressiveProfiles.id, leadId));
    }
  } else {
    // Property lead - user already exists
    const [leadData] = await db
      .select()
      .from(propertyLeads)
      .where(eq(propertyLeads.id, leadId))
      .limit(1);

    if (!leadData) throw new Error("Lead not found");
    userId = leadData.buyerId;
  }

  // Create buyer preference
  const [buyerPreference] = await db
    .insert(buyerPreferences)
    .values({
      userId,
      city: preferences.city,
      districts: preferences.districts || [],
      propertyType: preferences.propertyType,
      transactionType: preferences.transactionType || "buy",
      rooms: preferences.rooms || null,
      area: preferences.area || null,
      budgetMin: preferences.budgetMin || null,
      budgetMax: preferences.budgetMax || null,
      isActive: true,
    })
    .returning();

  // Update lead status
  if (type === "progressive") {
    await db
      .update(progressiveProfiles)
      .set({
        isConvertedToBuyer: true,
        buyerPreferenceId: buyerPreference.id,
        stage: 3,
        updatedAt: new Date(),
      })
      .where(eq(progressiveProfiles.id, leadId));
  } else {
    await db
      .update(propertyLeads)
      .set({
        status: "converted",
        updatedAt: new Date(),
      })
      .where(eq(propertyLeads.id, leadId));
  }

  // Run matching algorithm
  await storage.findMatchesForPreference(buyerPreference.id);

  return { buyerPreference, userId };
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  type: "progressive" | "property",
  status: string
): Promise<void> {
  if (type === "progressive") {
    // For progressive profiles, status is derived from isConvertedToBuyer
    // We can add a status field if needed, but for now we'll update notes
    await db
      .update(progressiveProfiles)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(progressiveProfiles.id, leadId));
  } else {
    await db
      .update(propertyLeads)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(propertyLeads.id, leadId));
  }
}

/**
 * Add notes to lead
 */
export async function addLeadNotes(
  leadId: string,
  type: "progressive" | "property",
  notes: string
): Promise<void> {
  if (type === "property") {
    await db
      .update(propertyLeads)
      .set({
        notes,
        updatedAt: new Date(),
      })
      .where(eq(propertyLeads.id, leadId));
  }
  // Progressive profiles don't have notes field, but we can add it to basicData if needed
}




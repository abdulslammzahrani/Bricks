import { db } from "./db";
import {
  brokerSubscriptions,
  propertyLeads,
  propertyImpressions,
  propertyBoosts,
  propertyRankingScores,
  brokerAnalytics,
  properties,
  users,
  buyerPreferences,
  BROKER_SUBSCRIPTION_PLANS,
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql, or, isNull } from "drizzle-orm";

// ==================== SUBSCRIPTION MANAGEMENT ====================

export async function getBrokerSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(brokerSubscriptions)
    .where(eq(brokerSubscriptions.userId, userId));
  
  if (!subscription) {
    // Create free subscription for new users
    const [newSub] = await db
      .insert(brokerSubscriptions)
      .values({ userId, plan: "free" })
      .returning();
    return newSub;
  }
  
  return subscription;
}

export async function canAddProperty(userId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
  const subscription = await getBrokerSubscription(userId);
  const plan = BROKER_SUBSCRIPTION_PLANS[subscription.plan as keyof typeof BROKER_SUBSCRIPTION_PLANS] || BROKER_SUBSCRIPTION_PLANS.free;
  
  if (plan.maxProperties === -1) {
    return { allowed: true };
  }
  
  if (subscription.propertiesUsed >= plan.maxProperties) {
    return {
      allowed: false,
      reason: `وصلت للحد الأقصى من العقارات (${plan.maxProperties}). قم بترقية اشتراكك لإضافة المزيد.`,
      limit: plan.maxProperties,
      used: subscription.propertiesUsed,
    };
  }
  
  return { allowed: true, limit: plan.maxProperties, used: subscription.propertiesUsed };
}

export async function incrementPropertyCount(userId: string) {
  await db
    .update(brokerSubscriptions)
    .set({ propertiesUsed: sql`${brokerSubscriptions.propertiesUsed} + 1` })
    .where(eq(brokerSubscriptions.userId, userId));
}

export async function decrementPropertyCount(userId: string) {
  await db
    .update(brokerSubscriptions)
    .set({ propertiesUsed: sql`GREATEST(0, ${brokerSubscriptions.propertiesUsed} - 1)` })
    .where(eq(brokerSubscriptions.userId, userId));
}

// ==================== LEADS SYSTEM ====================

export async function createLead(data: {
  propertyId: string;
  buyerId: string;
  sellerId: string;
  source: string;
  buyerMessage?: string;
  buyerPhone?: string;
  buyerEmail?: string;
}) {
  // Check if lead already exists
  const [existingLead] = await db
    .select()
    .from(propertyLeads)
    .where(
      and(
        eq(propertyLeads.propertyId, data.propertyId),
        eq(propertyLeads.buyerId, data.buyerId)
      )
    );
  
  if (existingLead) {
    // Update existing lead
    const [updated] = await db
      .update(propertyLeads)
      .set({
        source: data.source,
        buyerMessage: data.buyerMessage || existingLead.buyerMessage,
        updatedAt: new Date(),
      })
      .where(eq(propertyLeads.id, existingLead.id))
      .returning();
    return updated;
  }
  
  // Calculate quality score based on buyer profile
  const qualityScore = await calculateLeadQuality(data.buyerId, data.propertyId);
  
  // Check seller's lead limit
  const sellerSub = await getBrokerSubscription(data.sellerId);
  const plan = BROKER_SUBSCRIPTION_PLANS[sellerSub.plan as keyof typeof BROKER_SUBSCRIPTION_PLANS] || BROKER_SUBSCRIPTION_PLANS.free;
  
  if (plan.maxLeadsPerMonth !== -1 && sellerSub.leadsUsedThisMonth >= plan.maxLeadsPerMonth) {
    // Lead limit reached - still create but mark as limited
    console.log(`Lead limit reached for seller ${data.sellerId}`);
  }
  
  // Create new lead
  const [lead] = await db
    .insert(propertyLeads)
    .values({
      ...data,
      qualityScore,
    })
    .returning();
  
  // Increment lead count for seller
  await db
    .update(brokerSubscriptions)
    .set({ leadsUsedThisMonth: sql`${brokerSubscriptions.leadsUsedThisMonth} + 1` })
    .where(eq(brokerSubscriptions.userId, data.sellerId));
  
  // Update boost stats if property is boosted
  await db
    .update(propertyBoosts)
    .set({ leads: sql`${propertyBoosts.leads} + 1` })
    .where(
      and(
        eq(propertyBoosts.propertyId, data.propertyId),
        eq(propertyBoosts.status, "active")
      )
    );
  
  return lead;
}

async function calculateLeadQuality(buyerId: string, propertyId: string): Promise<number> {
  let score = 50; // Base score
  
  // Get buyer preferences
  const [buyerPref] = await db
    .select()
    .from(buyerPreferences)
    .where(eq(buyerPreferences.userId, buyerId));
  
  // Get property details
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId));
  
  if (!buyerPref || !property) return score;
  
  // Budget match (+20 points)
  if (property.price && buyerPref.budgetMax) {
    if (property.price <= buyerPref.budgetMax && property.price >= (buyerPref.budgetMin || 0)) {
      score += 20;
    }
  }
  
  // Property type match (+15 points)
  if (buyerPref.propertyType === property.propertyType) {
    score += 15;
  }
  
  // City match (+15 points)
  if (buyerPref.city === property.city) {
    score += 15;
  }
  
  // Profile completeness (up to +10 points)
  const [buyer] = await db.select().from(users).where(eq(users.id, buyerId));
  if (buyer?.phone) score += 5;
  if (buyer?.email) score += 5;
  
  return Math.min(100, score);
}

// ==================== IMPRESSIONS TRACKING ====================

export async function trackImpression(data: {
  propertyId: string;
  viewerId?: string;
  viewType: string;
  source?: string;
  deviceType?: string;
  duration?: number;
  actionTaken?: string;
}) {
  // Record impression
  const [impression] = await db
    .insert(propertyImpressions)
    .values(data)
    .returning();
  
  // Update boost stats if property is boosted
  await db
    .update(propertyBoosts)
    .set({ impressions: sql`${propertyBoosts.impressions} + 1` })
    .where(
      and(
        eq(propertyBoosts.propertyId, data.propertyId),
        eq(propertyBoosts.status, "active")
      )
    );
  
  // Update ranking scores
  await updateEngagementScore(data.propertyId);
  
  return impression;
}

export async function trackClick(propertyId: string) {
  // Update boost stats
  await db
    .update(propertyBoosts)
    .set({ clicks: sql`${propertyBoosts.clicks} + 1` })
    .where(
      and(
        eq(propertyBoosts.propertyId, propertyId),
        eq(propertyBoosts.status, "active")
      )
    );
}

// ==================== PROPERTY RANKING ALGORITHM ====================

const RANKING_WEIGHTS = {
  subscription: 0.25, // 25% weight for subscription tier
  quality: 0.20, // 20% for property completeness
  engagement: 0.20, // 20% for views/saves
  recency: 0.15, // 15% for how recent the listing is
  verification: 0.20, // 20% for seller verification
};

const SUBSCRIPTION_SCORES = {
  free: 20,
  basic: 50,
  premium: 80,
  professional: 100,
};

export async function calculatePropertyRankingScore(propertyId: string) {
  const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (!property || !property.sellerId) return null;
  
  const [seller] = await db.select().from(users).where(eq(users.id, property.sellerId));
  const subscription = await getBrokerSubscription(property.sellerId);
  
  // 1. Subscription Score
  const subscriptionScore = SUBSCRIPTION_SCORES[subscription.plan as keyof typeof SUBSCRIPTION_SCORES] || 20;
  
  // 2. Quality Score (property completeness)
  const qualityScore = calculatePropertyQuality(property);
  
  // 3. Engagement Score
  const engagementScore = await calculateEngagementScore(propertyId);
  
  // 4. Recency Score
  const recencyScore = calculateRecencyScore(property.createdAt);
  
  // 5. Verification Score
  const verificationScore = seller?.isVerified ? 100 : (seller?.verificationStatus === "pending" ? 50 : 0);
  
  // Check for active boosts
  const [boost] = await db
    .select()
    .from(propertyBoosts)
    .where(
      and(
        eq(propertyBoosts.propertyId, propertyId),
        eq(propertyBoosts.status, "active"),
        lte(propertyBoosts.startDate, new Date()),
        gte(propertyBoosts.endDate, new Date())
      )
    );
  
  const boostMultiplier = boost ? getBoostMultiplier(boost.boostType) : 1.0;
  const featuredBonus = boost ? 20 : 0;
  
  // Calculate total score
  const baseScore = 
    subscriptionScore * RANKING_WEIGHTS.subscription +
    qualityScore * RANKING_WEIGHTS.quality +
    engagementScore * RANKING_WEIGHTS.engagement +
    recencyScore * RANKING_WEIGHTS.recency +
    verificationScore * RANKING_WEIGHTS.verification;
  
  const totalScore = (baseScore * boostMultiplier) + featuredBonus;
  
  // Upsert ranking score
  await db
    .insert(propertyRankingScores)
    .values({
      propertyId,
      subscriptionScore,
      qualityScore,
      engagementScore,
      recencyScore,
      verificationScore,
      boostMultiplier,
      featuredBonus,
      totalScore,
      lastCalculatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: propertyRankingScores.propertyId,
      set: {
        subscriptionScore,
        qualityScore,
        engagementScore,
        recencyScore,
        verificationScore,
        boostMultiplier,
        featuredBonus,
        totalScore,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  
  return totalScore;
}

function calculatePropertyQuality(property: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Basic info (40 points)
  if (property.title) score += 10;
  if (property.description && property.description.length > 50) score += 15;
  if (property.price) score += 10;
  if (property.propertyType) score += 5;
  
  // Details (30 points)
  if (property.bedrooms) score += 5;
  if (property.bathrooms) score += 5;
  if (property.area) score += 5;
  if (property.address) score += 5;
  if (property.city) score += 5;
  if (property.district) score += 5;
  
  // Media (20 points)
  if (property.images?.length > 0) score += 10;
  if (property.images?.length >= 5) score += 10;
  
  // Features (10 points)
  if (property.features?.length > 0) score += 5;
  if (property.features?.length >= 5) score += 5;
  
  return Math.min(maxScore, score);
}

async function calculateEngagementScore(propertyId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Count impressions in last 30 days
  const [impressionStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      uniqueViewers: sql<number>`count(DISTINCT viewer_id)::int`,
    })
    .from(propertyImpressions)
    .where(
      and(
        eq(propertyImpressions.propertyId, propertyId),
        gte(propertyImpressions.createdAt, thirtyDaysAgo)
      )
    );
  
  // Count leads
  const [leadStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(propertyLeads)
    .where(
      and(
        eq(propertyLeads.propertyId, propertyId),
        gte(propertyLeads.createdAt, thirtyDaysAgo)
      )
    );
  
  const views = impressionStats?.count || 0;
  const uniqueViewers = impressionStats?.uniqueViewers || 0;
  const leads = leadStats?.count || 0;
  
  // Normalize scores (logarithmic scale for fairness)
  const viewScore = Math.min(40, Math.log10(views + 1) * 20);
  const uniqueScore = Math.min(30, Math.log10(uniqueViewers + 1) * 15);
  const leadScore = Math.min(30, leads * 10);
  
  return Math.min(100, viewScore + uniqueScore + leadScore);
}

async function updateEngagementScore(propertyId: string) {
  const engagementScore = await calculateEngagementScore(propertyId);
  
  await db
    .update(propertyRankingScores)
    .set({ engagementScore, updatedAt: new Date() })
    .where(eq(propertyRankingScores.propertyId, propertyId));
}

function calculateRecencyScore(createdAt: Date | null): number {
  if (!createdAt) return 50;
  
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // Score decreases as listing gets older
  if (daysSinceCreation <= 7) return 100;
  if (daysSinceCreation <= 14) return 85;
  if (daysSinceCreation <= 30) return 70;
  if (daysSinceCreation <= 60) return 50;
  if (daysSinceCreation <= 90) return 30;
  return 10;
}

function getBoostMultiplier(boostType: string): number {
  switch (boostType) {
    case "homepage": return 2.0;
    case "spotlight": return 1.8;
    case "search_top": return 1.5;
    case "featured": return 1.3;
    default: return 1.0;
  }
}

// ==================== RANKED PROPERTY LISTING ====================

export async function getRankedProperties(options: {
  limit?: number;
  offset?: number;
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  buyerId?: string;
}) {
  const { limit = 20, offset = 0, city, propertyType, minPrice, maxPrice, buyerId } = options;
  
  // Build base query conditions
  const conditions = [eq(properties.isActive, true)];
  
  if (city) {
    conditions.push(eq(properties.city, city));
  }
  if (propertyType) {
    conditions.push(eq(properties.propertyType, propertyType));
  }
  if (minPrice) {
    conditions.push(gte(properties.price, minPrice));
  }
  if (maxPrice) {
    conditions.push(lte(properties.price, maxPrice));
  }
  
  // Get properties with ranking scores
  const rankedProperties = await db
    .select({
      property: properties,
      rankingScore: propertyRankingScores.totalScore,
      subscriptionScore: propertyRankingScores.subscriptionScore,
      isBoosted: sql<boolean>`${propertyBoosts.id} IS NOT NULL`,
      boostType: propertyBoosts.boostType,
    })
    .from(properties)
    .leftJoin(propertyRankingScores, eq(properties.id, propertyRankingScores.propertyId))
    .leftJoin(
      propertyBoosts,
      and(
        eq(properties.id, propertyBoosts.propertyId),
        eq(propertyBoosts.status, "active"),
        lte(propertyBoosts.startDate, new Date()),
        gte(propertyBoosts.endDate, new Date())
      )
    )
    .where(and(...conditions))
    .orderBy(
      desc(sql`CASE WHEN ${propertyBoosts.boostType} = 'homepage' THEN 4 
                     WHEN ${propertyBoosts.boostType} = 'spotlight' THEN 3 
                     WHEN ${propertyBoosts.boostType} = 'search_top' THEN 2 
                     WHEN ${propertyBoosts.boostType} = 'featured' THEN 1 
                     ELSE 0 END`),
      desc(propertyRankingScores.totalScore || sql`0`),
      desc(properties.createdAt)
    )
    .limit(limit)
    .offset(offset);
  
  // Track impressions for logged-in users
  if (buyerId) {
    for (const item of rankedProperties) {
      await trackImpression({
        propertyId: item.property.id,
        viewerId: buyerId,
        viewType: "list",
        source: item.isBoosted ? "featured" : "organic",
      });
    }
  }
  
  return rankedProperties;
}

// ==================== BOOST MANAGEMENT ====================

export async function createPropertyBoost(data: {
  propertyId: string;
  userId: string;
  boostType: string;
  durationDays: number;
  targetCities?: string[];
  targetBudgetMin?: number;
  targetBudgetMax?: number;
}) {
  // Calculate price based on boost type and duration
  const basePrices = {
    featured: 50,
    search_top: 100,
    spotlight: 200,
    homepage: 500,
  };
  
  const basePrice = basePrices[data.boostType as keyof typeof basePrices] || 50;
  const price = basePrice * data.durationDays;
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + data.durationDays);
  
  // Check subscription limits
  const subscription = await getBrokerSubscription(data.userId);
  const plan = BROKER_SUBSCRIPTION_PLANS[subscription.plan as keyof typeof BROKER_SUBSCRIPTION_PLANS] || BROKER_SUBSCRIPTION_PLANS.free;
  
  const featuredLimit = plan.featuredListings as number;
  if (subscription.featuredUsed >= featuredLimit && featuredLimit > 0) {
    throw new Error(`وصلت للحد الأقصى من الإعلانات المميزة (${featuredLimit}). قم بترقية اشتراكك.`);
  }
  
  const [boost] = await db
    .insert(propertyBoosts)
    .values({
      propertyId: data.propertyId,
      userId: data.userId,
      boostType: data.boostType,
      endDate,
      price,
      targetCities: data.targetCities || [],
      targetBudgetMin: data.targetBudgetMin,
      targetBudgetMax: data.targetBudgetMax,
      status: "pending",
      paymentStatus: "pending",
    })
    .returning();
  
  // Increment featured count
  await db
    .update(brokerSubscriptions)
    .set({ featuredUsed: sql`${brokerSubscriptions.featuredUsed} + 1` })
    .where(eq(brokerSubscriptions.userId, data.userId));
  
  // Recalculate ranking score
  await calculatePropertyRankingScore(data.propertyId);
  
  return boost;
}

export async function activateBoost(boostId: string) {
  const [boost] = await db
    .update(propertyBoosts)
    .set({ status: "active", paymentStatus: "paid", startDate: new Date() })
    .where(eq(propertyBoosts.id, boostId))
    .returning();
  
  if (boost) {
    await calculatePropertyRankingScore(boost.propertyId);
  }
  
  return boost;
}

// ==================== ANALYTICS ====================

export async function getBrokerDashboardStats(userId: string) {
  const subscription = await getBrokerSubscription(userId);
  const plan = BROKER_SUBSCRIPTION_PLANS[subscription.plan as keyof typeof BROKER_SUBSCRIPTION_PLANS] || BROKER_SUBSCRIPTION_PLANS.free;
  
  // Get property count
  const [propertyStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) FILTER (WHERE is_active = true)::int`,
    })
    .from(properties)
    .where(eq(properties.sellerId, userId));
  
  // Get lead stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [leadStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      new: sql<number>`count(*) FILTER (WHERE status = 'new')::int`,
      qualified: sql<number>`count(*) FILTER (WHERE status = 'qualified')::int`,
      converted: sql<number>`count(*) FILTER (WHERE status = 'converted')::int`,
    })
    .from(propertyLeads)
    .where(
      and(
        eq(propertyLeads.sellerId, userId),
        gte(propertyLeads.createdAt, thirtyDaysAgo)
      )
    );
  
  // Get impression stats
  const userProperties = await db.select({ id: properties.id }).from(properties).where(eq(properties.sellerId, userId));
  const propertyIds = userProperties.map(p => p.id);
  
  let impressionStats = { total: 0, unique: 0 };
  if (propertyIds.length > 0) {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        unique: sql<number>`count(DISTINCT viewer_id)::int`,
      })
      .from(propertyImpressions)
      .where(
        and(
          sql`${propertyImpressions.propertyId} = ANY(${propertyIds})`,
          gte(propertyImpressions.createdAt, thirtyDaysAgo)
        )
      );
    impressionStats = stats || { total: 0, unique: 0 };
  }
  
  // Get active boosts
  const [boostStats] = await db
    .select({
      active: sql<number>`count(*)::int`,
    })
    .from(propertyBoosts)
    .where(
      and(
        eq(propertyBoosts.userId, userId),
        eq(propertyBoosts.status, "active")
      )
    );
  
  return {
    subscription: {
      plan: subscription.plan,
      planName: plan.name,
      status: subscription.status,
      endDate: subscription.endDate,
    },
    properties: {
      total: propertyStats?.total || 0,
      active: propertyStats?.active || 0,
      limit: plan.maxProperties,
      remaining: plan.maxProperties === -1 ? -1 : plan.maxProperties - subscription.propertiesUsed,
    },
    leads: {
      total: leadStats?.total || 0,
      new: leadStats?.new || 0,
      qualified: leadStats?.qualified || 0,
      converted: leadStats?.converted || 0,
      limit: plan.maxLeadsPerMonth,
      used: subscription.leadsUsedThisMonth,
    },
    impressions: {
      total: impressionStats.total,
      unique: impressionStats.unique,
    },
    boosts: {
      active: boostStats?.active || 0,
      limit: plan.featuredListings,
      used: subscription.featuredUsed,
    },
  };
}

export const brokerAdsEngine = {
  getBrokerSubscription,
  canAddProperty,
  incrementPropertyCount,
  decrementPropertyCount,
  createLead,
  trackImpression,
  trackClick,
  calculatePropertyRankingScore,
  getRankedProperties,
  createPropertyBoost,
  activateBoost,
  getBrokerDashboardStats,
};

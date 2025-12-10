import { db } from "./db";
import { 
  users, 
  buyerPreferences, 
  userInteractions, 
  audienceSegments, 
  userSegments,
  adCampaigns,
  campaignSends,
  PURCHASING_POWER_TIERS,
  type User,
  type BuyerPreference,
  type AudienceSegment,
  type UserSegment,
} from "@shared/schema";
import { eq, and, sql, inArray, gte, lte, desc } from "drizzle-orm";

// =============================================
// PURCHASING POWER CALCULATION (حساب القوة الشرائية)
// =============================================

export interface PurchasingPowerResult {
  tier: keyof typeof PURCHASING_POWER_TIERS;
  score: number; // 0-100
  estimatedBudget: number;
  factors: {
    maxBudget: number;
    avgPropertyViews: number;
    contactedCount: number;
    savedCount: number;
  };
}

export async function calculatePurchasingPower(userId: string): Promise<PurchasingPowerResult> {
  // Get user's preferences
  const preferences = await db.select().from(buyerPreferences).where(eq(buyerPreferences.userId, userId));
  
  // Get user's interactions
  const interactions = await db.select().from(userInteractions).where(eq(userInteractions.userId, userId));
  
  // Calculate max budget from preferences
  const maxBudgets = preferences.map(p => p.budgetMax || 0).filter(b => b > 0);
  const maxBudget = maxBudgets.length > 0 ? Math.max(...maxBudgets) : 0;
  
  // Calculate average property price from viewed/saved properties
  const viewedPrices = interactions
    .filter(i => i.propertyPrice && i.propertyPrice > 0)
    .map(i => i.propertyPrice!);
  const avgViewedPrice = viewedPrices.length > 0 
    ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length 
    : 0;
  
  // Count interactions by type
  const contactedCount = interactions.filter(i => i.interactionType === "contact").length;
  const savedCount = interactions.filter(i => i.interactionType === "save").length;
  
  // Estimate budget (weighted average of stated budget and behavior)
  const estimatedBudget = maxBudget > 0 
    ? Math.round(maxBudget * 0.7 + avgViewedPrice * 0.3)
    : avgViewedPrice;
  
  // Determine tier
  let tier: keyof typeof PURCHASING_POWER_TIERS = "economy";
  if (estimatedBudget >= 5000000) tier = "luxury";
  else if (estimatedBudget >= 2000000) tier = "premium";
  else if (estimatedBudget >= 800000) tier = "mid_range";
  else if (estimatedBudget >= 300000) tier = "budget";
  
  // Calculate score (0-100)
  const budgetScore = Math.min(100, (estimatedBudget / 10000000) * 100);
  const engagementScore = Math.min(100, (contactedCount * 20 + savedCount * 10));
  const score = Math.round(budgetScore * 0.7 + engagementScore * 0.3);
  
  return {
    tier,
    score,
    estimatedBudget,
    factors: {
      maxBudget,
      avgPropertyViews: Math.round(avgViewedPrice),
      contactedCount,
      savedCount,
    },
  };
}

// =============================================
// ENGAGEMENT SCORING (حساب مستوى التفاعل)
// =============================================

export interface EngagementResult {
  level: "high" | "medium" | "low";
  score: number; // 0-100
  metrics: {
    totalInteractions: number;
    viewDuration: number; // average seconds
    saveRate: number; // percentage
    contactRate: number; // percentage
    lastActiveDate: Date | null;
    daysSinceLastActive: number;
  };
}

export async function calculateEngagement(userId: string): Promise<EngagementResult> {
  const interactions = await db.select()
    .from(userInteractions)
    .where(eq(userInteractions.userId, userId))
    .orderBy(desc(userInteractions.createdAt));
  
  const totalInteractions = interactions.length;
  const views = interactions.filter(i => i.interactionType === "view");
  const saves = interactions.filter(i => i.interactionType === "save");
  const contacts = interactions.filter(i => i.interactionType === "contact");
  
  // Calculate average view duration
  const durations = views.filter(v => v.duration && v.duration > 0).map(v => v.duration!);
  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  
  // Calculate rates
  const saveRate = views.length > 0 ? (saves.length / views.length) * 100 : 0;
  const contactRate = views.length > 0 ? (contacts.length / views.length) * 100 : 0;
  
  // Last active date
  const lastActiveDate = interactions.length > 0 && interactions[0].createdAt 
    ? new Date(interactions[0].createdAt) 
    : null;
  const daysSinceLastActive = lastActiveDate 
    ? Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  // Calculate engagement score
  let score = 0;
  score += Math.min(30, totalInteractions * 2); // Max 30 points for interactions
  score += Math.min(20, avgDuration / 3); // Max 20 points for view duration
  score += Math.min(25, saveRate * 2.5); // Max 25 points for save rate
  score += Math.min(25, contactRate * 5); // Max 25 points for contact rate
  
  // Recency penalty
  if (daysSinceLastActive > 30) score *= 0.5;
  else if (daysSinceLastActive > 14) score *= 0.7;
  else if (daysSinceLastActive > 7) score *= 0.9;
  
  score = Math.round(Math.min(100, score));
  
  // Determine level
  let level: "high" | "medium" | "low" = "low";
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";
  
  return {
    level,
    score,
    metrics: {
      totalInteractions,
      viewDuration: Math.round(avgDuration),
      saveRate: Math.round(saveRate * 10) / 10,
      contactRate: Math.round(contactRate * 10) / 10,
      lastActiveDate,
      daysSinceLastActive,
    },
  };
}

// =============================================
// INTENT SCORING (حساب نية الشراء)
// =============================================

export interface IntentResult {
  potential: "hot" | "warm" | "cold";
  score: number; // 0-100
  signals: {
    hasContactedSeller: boolean;
    hasSavedProperties: boolean;
    hasMultiplePreferences: boolean;
    purchaseTimeline: string | null;
    recentActivityDays: number;
  };
}

export async function calculateIntent(userId: string): Promise<IntentResult> {
  const preferences = await db.select().from(buyerPreferences).where(eq(buyerPreferences.userId, userId));
  const interactions = await db.select()
    .from(userInteractions)
    .where(eq(userInteractions.userId, userId))
    .orderBy(desc(userInteractions.createdAt));
  
  const hasContactedSeller = interactions.some(i => i.interactionType === "contact");
  const hasSavedProperties = interactions.some(i => i.interactionType === "save");
  const hasMultiplePreferences = preferences.length > 1;
  
  // Get purchase timeline from preferences
  const timelines = preferences.map(p => p.purchaseTimeline).filter(Boolean);
  const purchaseTimeline = timelines.length > 0 ? timelines[0] : null;
  
  // Calculate recent activity
  const now = Date.now();
  const recentInteractions = interactions.filter(i => {
    if (!i.createdAt) return false;
    const days = (now - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  });
  
  // Calculate intent score
  let score = 0;
  
  // Contact signals (strongest intent)
  if (hasContactedSeller) score += 35;
  
  // Save signals
  if (hasSavedProperties) score += 20;
  
  // Multiple preferences suggest serious buyer
  if (hasMultiplePreferences) score += 10;
  
  // Purchase timeline signals
  if (purchaseTimeline === "asap") score += 25;
  else if (purchaseTimeline === "within_month") score += 20;
  else if (purchaseTimeline === "within_3months") score += 15;
  else if (purchaseTimeline === "within_6months") score += 10;
  else if (purchaseTimeline === "within_year") score += 5;
  
  // Recent activity bonus
  score += Math.min(10, recentInteractions.length * 2);
  
  score = Math.min(100, score);
  
  // Determine potential
  let potential: "hot" | "warm" | "cold" = "cold";
  if (score >= 60) potential = "hot";
  else if (score >= 30) potential = "warm";
  
  return {
    potential,
    score,
    signals: {
      hasContactedSeller,
      hasSavedProperties,
      hasMultiplePreferences,
      purchaseTimeline,
      recentActivityDays: recentInteractions.length,
    },
  };
}

// =============================================
// USER CLASSIFICATION (تصنيف المستخدم)
// =============================================

export interface UserClassification {
  userId: string;
  purchasingPower: PurchasingPowerResult;
  engagement: EngagementResult;
  intent: IntentResult;
  matchedSegments: Array<{
    segment: AudienceSegment;
    matchScore: number;
  }>;
  primarySegmentId: string | null;
}

export async function classifyUser(userId: string): Promise<UserClassification> {
  // Calculate all scores
  const [purchasingPower, engagement, intent] = await Promise.all([
    calculatePurchasingPower(userId),
    calculateEngagement(userId),
    calculateIntent(userId),
  ]);
  
  // Get all active segments
  const segments = await db.select()
    .from(audienceSegments)
    .where(eq(audienceSegments.isActive, true));
  
  // Get user preferences for matching
  const preferences = await db.select().from(buyerPreferences).where(eq(buyerPreferences.userId, userId));
  
  // Match user to segments
  const matchedSegments: Array<{ segment: AudienceSegment; matchScore: number }> = [];
  
  for (const segment of segments) {
    let matchScore = 0;
    let factors = 0;
    
    // Match purchasing power tier
    if (segment.purchasingPowerTier === purchasingPower.tier) {
      matchScore += 30;
    }
    factors++;
    
    // Match budget range
    if (segment.minBudget || segment.maxBudget) {
      const budget = purchasingPower.estimatedBudget;
      if ((!segment.minBudget || budget >= segment.minBudget) && 
          (!segment.maxBudget || budget <= segment.maxBudget)) {
        matchScore += 20;
      }
      factors++;
    }
    
    // Match property types
    if (segment.propertyTypes && segment.propertyTypes.length > 0) {
      const userTypes = preferences.map(p => p.propertyType);
      const matchingTypes = userTypes.filter(t => segment.propertyTypes!.includes(t));
      if (matchingTypes.length > 0) {
        matchScore += 15 * (matchingTypes.length / segment.propertyTypes.length);
      }
      factors++;
    }
    
    // Match cities
    if (segment.cities && segment.cities.length > 0) {
      const userCities = preferences.map(p => p.city);
      const matchingCities = userCities.filter(c => segment.cities!.includes(c));
      if (matchingCities.length > 0) {
        matchScore += 15 * (matchingCities.length / segment.cities.length);
      }
      factors++;
    }
    
    // Match engagement level
    if (segment.engagementLevel === engagement.level) {
      matchScore += 10;
    }
    factors++;
    
    // Match conversion potential
    if (segment.conversionPotential === intent.potential) {
      matchScore += 10;
    }
    factors++;
    
    // Normalize score
    matchScore = Math.round(matchScore);
    
    if (matchScore >= 20) { // Minimum threshold
      matchedSegments.push({ segment, matchScore });
    }
  }
  
  // Sort by match score
  matchedSegments.sort((a, b) => b.matchScore - a.matchScore);
  
  // Get primary segment
  const primarySegmentId = matchedSegments.length > 0 ? matchedSegments[0].segment.id : null;
  
  // Save/update user segment assignments
  for (const { segment, matchScore } of matchedSegments) {
    const existing = await db.select()
      .from(userSegments)
      .where(and(
        eq(userSegments.userId, userId),
        eq(userSegments.segmentId, segment.id)
      ));
    
    if (existing.length > 0) {
      await db.update(userSegments)
        .set({
          matchScore,
          purchasingPowerScore: purchasingPower.score,
          engagementScore: engagement.score,
          intentScore: intent.score,
          lastUpdated: new Date(),
          classificationReason: `تصنيف آلي: قوة شرائية ${purchasingPower.tier}, تفاعل ${engagement.level}, نية ${intent.potential}`,
        })
        .where(eq(userSegments.id, existing[0].id));
    } else {
      await db.insert(userSegments).values({
        userId,
        segmentId: segment.id,
        matchScore,
        purchasingPowerScore: purchasingPower.score,
        engagementScore: engagement.score,
        intentScore: intent.score,
        classificationReason: `تصنيف آلي: قوة شرائية ${purchasingPower.tier}, تفاعل ${engagement.level}, نية ${intent.potential}`,
        isAutoClassified: true,
      });
    }
  }
  
  return {
    userId,
    purchasingPower,
    engagement,
    intent,
    matchedSegments,
    primarySegmentId,
  };
}

// =============================================
// SEGMENT TARGETING (استهداف الشرائح)
// =============================================

export interface TargetedUser {
  userId: string;
  user: User;
  segmentMatch: UserSegment;
  purchasingPowerTier: string;
}

export async function getUsersInSegment(segmentId: string): Promise<TargetedUser[]> {
  const assignments = await db.select()
    .from(userSegments)
    .where(eq(userSegments.segmentId, segmentId))
    .orderBy(desc(userSegments.matchScore));
  
  const result: TargetedUser[] = [];
  
  for (const assignment of assignments) {
    if (!assignment.userId) continue;
    
    const userResult = await db.select().from(users).where(eq(users.id, assignment.userId));
    if (userResult.length === 0) continue;
    
    const purchasingPower = await calculatePurchasingPower(assignment.userId);
    
    result.push({
      userId: assignment.userId,
      user: userResult[0],
      segmentMatch: assignment,
      purchasingPowerTier: purchasingPower.tier,
    });
  }
  
  return result;
}

export async function getTargetedUsersForCampaign(campaignId: string): Promise<TargetedUser[]> {
  const campaignResult = await db.select().from(adCampaigns).where(eq(adCampaigns.id, campaignId));
  if (campaignResult.length === 0) return [];
  
  const campaign = campaignResult[0];
  const targetedUsers: TargetedUser[] = [];
  const seenUserIds = new Set<string>();
  
  // Get users from targeted segments
  if (campaign.targetSegments && campaign.targetSegments.length > 0) {
    for (const segmentId of campaign.targetSegments) {
      const segmentUsers = await getUsersInSegment(segmentId);
      for (const user of segmentUsers) {
        if (!seenUserIds.has(user.userId)) {
          seenUserIds.add(user.userId);
          targetedUsers.push(user);
        }
      }
    }
  }
  
  // Filter by purchasing power if specified
  if (campaign.minPurchasingPower || campaign.maxPurchasingPower) {
    return targetedUsers.filter(u => {
      const tier = PURCHASING_POWER_TIERS[u.purchasingPowerTier as keyof typeof PURCHASING_POWER_TIERS];
      if (!tier) return false;
      
      const minBudget = "min" in tier ? tier.min : 0;
      const maxBudget = "max" in tier ? tier.max : Infinity;
      const avgBudget = (minBudget + (maxBudget === Infinity ? minBudget * 2 : maxBudget)) / 2;
      
      if (campaign.minPurchasingPower && avgBudget < campaign.minPurchasingPower) return false;
      if (campaign.maxPurchasingPower && avgBudget > campaign.maxPurchasingPower) return false;
      
      return true;
    });
  }
  
  return targetedUsers;
}

// =============================================
// DEFAULT SEGMENTS INITIALIZATION
// =============================================

export async function initializeDefaultSegments(): Promise<void> {
  const existingSegments = await db.select().from(audienceSegments);
  if (existingSegments.length > 0) return;
  
  const defaultSegments = [
    {
      name: "Luxury Buyers",
      nameAr: "مشترون فاخرون",
      description: "عملاء يبحثون عن عقارات فاخرة بميزانية عالية",
      purchasingPowerTier: "luxury",
      minBudget: 5000000,
      propertyTypes: ["villa", "penthouse"],
      purposes: ["residence", "investment"],
      engagementLevel: "high",
      conversionPotential: "hot",
      color: "#8B5CF6",
      priority: 5,
    },
    {
      name: "Premium Investors",
      nameAr: "مستثمرون متميزون",
      description: "مستثمرون عقاريون بميزانية متميزة",
      purchasingPowerTier: "premium",
      minBudget: 2000000,
      maxBudget: 5000000,
      propertyTypes: ["building", "villa", "apartment"],
      purposes: ["investment"],
      engagementLevel: "medium",
      conversionPotential: "warm",
      color: "#3B82F6",
      priority: 4,
    },
    {
      name: "Family Home Seekers",
      nameAr: "باحثون عن منزل عائلي",
      description: "عائلات تبحث عن منزل للسكن",
      purchasingPowerTier: "mid_range",
      minBudget: 800000,
      maxBudget: 2000000,
      propertyTypes: ["villa", "apartment"],
      purposes: ["residence"],
      engagementLevel: "high",
      conversionPotential: "hot",
      color: "#10B981",
      priority: 3,
    },
    {
      name: "First-Time Buyers",
      nameAr: "مشترون لأول مرة",
      description: "مشترون يبحثون عن أول عقار لهم",
      purchasingPowerTier: "budget",
      minBudget: 300000,
      maxBudget: 800000,
      propertyTypes: ["apartment"],
      purposes: ["residence"],
      engagementLevel: "medium",
      conversionPotential: "warm",
      color: "#F59E0B",
      priority: 2,
    },
    {
      name: "Economy Seekers",
      nameAr: "باحثون عن عقارات اقتصادية",
      description: "عملاء بميزانية محدودة",
      purchasingPowerTier: "economy",
      maxBudget: 300000,
      propertyTypes: ["apartment", "land"],
      purposes: ["residence"],
      conversionPotential: "cold",
      color: "#6B7280",
      priority: 1,
    },
  ];
  
  for (const segment of defaultSegments) {
    await db.insert(audienceSegments).values(segment);
  }
}

// =============================================
// BATCH CLASSIFICATION (تصنيف جماعي)
// =============================================

export async function classifyAllUsers(): Promise<{ classified: number; errors: number }> {
  const allUsers = await db.select().from(users).where(eq(users.role, "buyer"));
  
  let classified = 0;
  let errors = 0;
  
  for (const user of allUsers) {
    try {
      await classifyUser(user.id);
      classified++;
    } catch (error) {
      console.error(`Error classifying user ${user.id}:`, error);
      errors++;
    }
  }
  
  return { classified, errors };
}

/**
 * Machine Learning Engine - تعلم من سلوك المستخدمين
 * 
 * يتعلم من:
 * 1. العقارات المحفوظة (save) - تفضيل إيجابي
 * 2. العقارات المتخطاة (skip) - تفضيل سلبي
 * 3. طلبات التواصل (contact) - تفضيل قوي جداً
 * 4. وقت المشاهدة (duration) - اهتمام متوسط
 */

import { db } from "./db";
import { userInteractions, userPreferenceWeights, properties, type UserInteraction, type UserPreferenceWeights } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

// Learning rate constants
const LEARNING_RATE = 0.1;
const POSITIVE_REWARD = 0.15; // save, contact
const NEGATIVE_REWARD = -0.08; // skip
const NEUTRAL_REWARD = 0.02; // view with long duration
const DECAY_FACTOR = 0.95; // Decay old learnings over time
const MIN_INTERACTIONS_FOR_CONFIDENCE = 5;
const MAX_WEIGHT = 2.0;
const MIN_WEIGHT = 0.3;

export interface InteractionEvent {
  userId?: string;
  sessionId?: string;
  propertyId: string;
  interactionType: "view" | "save" | "skip" | "contact" | "share" | "unsave";
  duration?: number;
  deviceType?: string;
}

export interface LearnedWeights {
  locationWeight: number;
  priceWeight: number;
  areaWeight: number;
  propertyTypeWeight: number;
  ageWeight: number;
  amenitiesWeight: number;
  preferredDistricts: string[];
  preferredPropertyTypes: string[];
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  confidenceScore: number;
}

/**
 * تسجيل تفاعل المستخدم
 */
export async function recordInteraction(event: InteractionEvent): Promise<void> {
  try {
    // Get property details for learning
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, event.propertyId))
      .limit(1);

    if (!property) {
      console.warn(`Property ${event.propertyId} not found for interaction tracking`);
      return;
    }

    // Safely parse area - handle text like "250 م²" or empty strings
    let parsedArea: number | null = null;
    if (property.area) {
      const numericMatch = property.area.replace(/[^\d.]/g, '');
      const parsed = parseFloat(numericMatch);
      if (!isNaN(parsed) && isFinite(parsed)) {
        parsedArea = Math.round(parsed);
      }
    }

    // Record the interaction
    await db.insert(userInteractions).values({
      userId: event.userId || null,
      sessionId: event.sessionId || null,
      propertyId: event.propertyId,
      interactionType: event.interactionType,
      duration: event.duration || null,
      propertyCity: property.city,
      propertyDistrict: property.district,
      propertyType: property.propertyType,
      propertyPrice: property.price,
      propertyArea: parsedArea,
      deviceType: event.deviceType || null,
    });

    // Trigger learning update
    await updateLearnedWeights(event.userId, event.sessionId);
  } catch (error) {
    console.error("Error recording interaction:", error);
  }
}

/**
 * تحديث الأوزان المتعلمة بناءً على التفاعلات
 */
async function updateLearnedWeights(userId?: string, sessionId?: string): Promise<void> {
  if (!userId && !sessionId) return;

  try {
    // Get recent interactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const interactions = await db
      .select()
      .from(userInteractions)
      .where(
        and(
          userId ? eq(userInteractions.userId, userId) : eq(userInteractions.sessionId, sessionId!),
          gte(userInteractions.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(userInteractions.createdAt))
      .limit(100);

    if (interactions.length === 0) return;

    // Get or create user weights
    let [existingWeights] = await db
      .select()
      .from(userPreferenceWeights)
      .where(
        userId ? eq(userPreferenceWeights.userId, userId) : eq(userPreferenceWeights.sessionId, sessionId!)
      )
      .limit(1);

    const currentWeights: LearnedWeights = existingWeights ? {
      locationWeight: existingWeights.locationWeight,
      priceWeight: existingWeights.priceWeight,
      areaWeight: existingWeights.areaWeight,
      propertyTypeWeight: existingWeights.propertyTypeWeight,
      ageWeight: existingWeights.ageWeight,
      amenitiesWeight: existingWeights.amenitiesWeight,
      preferredDistricts: existingWeights.preferredDistricts || [],
      preferredPropertyTypes: existingWeights.preferredPropertyTypes || [],
      priceRangeMin: existingWeights.priceRangeMin,
      priceRangeMax: existingWeights.priceRangeMax,
      confidenceScore: existingWeights.confidenceScore,
    } : getDefaultWeights();

    // Learn from interactions
    const newWeights = learnFromInteractions(interactions, currentWeights);

    // Calculate confidence based on interaction count
    const confidence = Math.min(1.0, interactions.length / (MIN_INTERACTIONS_FOR_CONFIDENCE * 4));

    // Upsert weights
    if (existingWeights) {
      await db
        .update(userPreferenceWeights)
        .set({
          ...newWeights,
          totalInteractions: interactions.length,
          confidenceScore: confidence,
          lastLearningUpdate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userPreferenceWeights.id, existingWeights.id));
    } else {
      await db.insert(userPreferenceWeights).values({
        userId: userId || null,
        sessionId: sessionId || null,
        ...newWeights,
        totalInteractions: interactions.length,
        confidenceScore: confidence,
      });
    }
  } catch (error) {
    console.error("Error updating learned weights:", error);
  }
}

/**
 * التعلم من التفاعلات - خوارزمية التعلم التعزيزي البسيطة
 */
function learnFromInteractions(
  interactions: UserInteraction[],
  currentWeights: LearnedWeights
): Partial<LearnedWeights> {
  // Apply decay to current weights (move towards 1.0)
  let locationWeight = applyDecay(currentWeights.locationWeight);
  let priceWeight = applyDecay(currentWeights.priceWeight);
  let areaWeight = applyDecay(currentWeights.areaWeight);
  let propertyTypeWeight = applyDecay(currentWeights.propertyTypeWeight);

  // Track preferences
  const districtCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const prices: number[] = [];

  // Process each interaction
  for (const interaction of interactions) {
    const reward = getRewardForInteraction(interaction);
    
    // Update weights based on interaction
    if (interaction.propertyDistrict) {
      locationWeight = updateWeight(locationWeight, reward);
      districtCounts[interaction.propertyDistrict] = (districtCounts[interaction.propertyDistrict] || 0) + (reward > 0 ? 1 : -0.5);
    }
    
    if (interaction.propertyPrice) {
      priceWeight = updateWeight(priceWeight, reward);
      if (reward > 0) prices.push(interaction.propertyPrice);
    }
    
    if (interaction.propertyArea) {
      areaWeight = updateWeight(areaWeight, reward);
    }
    
    if (interaction.propertyType) {
      propertyTypeWeight = updateWeight(propertyTypeWeight, reward);
      typeCounts[interaction.propertyType] = (typeCounts[interaction.propertyType] || 0) + (reward > 0 ? 1 : -0.5);
    }
  }

  // Extract top preferences
  const preferredDistricts = Object.entries(districtCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([district]) => district);

  const preferredPropertyTypes = Object.entries(typeCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  // Calculate price range from positive interactions
  let priceRangeMin: number | null = null;
  let priceRangeMax: number | null = null;
  if (prices.length >= 3) {
    prices.sort((a, b) => a - b);
    priceRangeMin = prices[Math.floor(prices.length * 0.1)];
    priceRangeMax = prices[Math.floor(prices.length * 0.9)];
  }

  return {
    locationWeight: clampWeight(locationWeight),
    priceWeight: clampWeight(priceWeight),
    areaWeight: clampWeight(areaWeight),
    propertyTypeWeight: clampWeight(propertyTypeWeight),
    ageWeight: currentWeights.ageWeight,
    amenitiesWeight: currentWeights.amenitiesWeight,
    preferredDistricts,
    preferredPropertyTypes,
    priceRangeMin,
    priceRangeMax,
  };
}

/**
 * حساب المكافأة لكل نوع تفاعل
 */
function getRewardForInteraction(interaction: UserInteraction): number {
  switch (interaction.interactionType) {
    case "contact":
      return POSITIVE_REWARD * 2; // Strongest positive signal
    case "save":
      return POSITIVE_REWARD;
    case "share":
      return POSITIVE_REWARD * 0.8;
    case "skip":
      return NEGATIVE_REWARD;
    case "unsave":
      return NEGATIVE_REWARD * 0.5;
    case "view":
      // Long views (>30 seconds) are positive
      if (interaction.duration && interaction.duration > 30) {
        return NEUTRAL_REWARD;
      }
      return 0;
    default:
      return 0;
  }
}

/**
 * تحديث الوزن بناءً على المكافأة
 */
function updateWeight(currentWeight: number, reward: number): number {
  return currentWeight + (LEARNING_RATE * reward);
}

/**
 * تطبيق التراجع على الأوزان القديمة
 */
function applyDecay(weight: number): number {
  // Move weight towards 1.0 by decay factor
  return 1.0 + (weight - 1.0) * DECAY_FACTOR;
}

/**
 * تقييد الوزن ضمن الحدود
 */
function clampWeight(weight: number): number {
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, weight));
}

/**
 * الأوزان الافتراضية
 */
function getDefaultWeights(): LearnedWeights {
  return {
    locationWeight: 1.0,
    priceWeight: 1.0,
    areaWeight: 1.0,
    propertyTypeWeight: 1.0,
    ageWeight: 1.0,
    amenitiesWeight: 1.0,
    preferredDistricts: [],
    preferredPropertyTypes: [],
    priceRangeMin: null,
    priceRangeMax: null,
    confidenceScore: 0,
  };
}

/**
 * الحصول على الأوزان المتعلمة للمستخدم
 */
export async function getLearnedWeights(userId?: string, sessionId?: string): Promise<LearnedWeights> {
  if (!userId && !sessionId) {
    return getDefaultWeights();
  }

  try {
    const [weights] = await db
      .select()
      .from(userPreferenceWeights)
      .where(
        userId ? eq(userPreferenceWeights.userId, userId) : eq(userPreferenceWeights.sessionId, sessionId!)
      )
      .limit(1);

    if (!weights) {
      return getDefaultWeights();
    }

    return {
      locationWeight: weights.locationWeight,
      priceWeight: weights.priceWeight,
      areaWeight: weights.areaWeight,
      propertyTypeWeight: weights.propertyTypeWeight,
      ageWeight: weights.ageWeight,
      amenitiesWeight: weights.amenitiesWeight,
      preferredDistricts: weights.preferredDistricts || [],
      preferredPropertyTypes: weights.preferredPropertyTypes || [],
      priceRangeMin: weights.priceRangeMin,
      priceRangeMax: weights.priceRangeMax,
      confidenceScore: weights.confidenceScore,
    };
  } catch (error) {
    console.error("Error getting learned weights:", error);
    return getDefaultWeights();
  }
}

/**
 * دمج الأوزان المتعلمة مع خوارزمية المطابقة
 */
export function applyLearnedWeightsToScore(
  baseScore: number,
  criteriaScores: Record<string, number>,
  learnedWeights: LearnedWeights
): number {
  if (learnedWeights.confidenceScore < 0.2) {
    // Not enough data to apply learning
    return baseScore;
  }

  // Apply learned weights to each criterion
  let adjustedScore = 0;
  let totalWeight = 0;

  // Location
  if (criteriaScores.location !== undefined) {
    const weight = 0.25 * learnedWeights.locationWeight;
    adjustedScore += criteriaScores.location * weight;
    totalWeight += weight;
  }

  // Price
  if (criteriaScores.price !== undefined) {
    const weight = 0.20 * learnedWeights.priceWeight;
    adjustedScore += criteriaScores.price * weight;
    totalWeight += weight;
  }

  // Area
  if (criteriaScores.area !== undefined) {
    const weight = 0.10 * learnedWeights.areaWeight;
    adjustedScore += criteriaScores.area * weight;
    totalWeight += weight;
  }

  // Property Type
  if (criteriaScores.propertyType !== undefined) {
    const weight = 0.15 * learnedWeights.propertyTypeWeight;
    adjustedScore += criteriaScores.propertyType * weight;
    totalWeight += weight;
  }

  // Age
  if (criteriaScores.age !== undefined) {
    const weight = 0.10 * learnedWeights.ageWeight;
    adjustedScore += criteriaScores.age * weight;
    totalWeight += weight;
  }

  // Normalize
  if (totalWeight > 0) {
    adjustedScore = (adjustedScore / totalWeight) * 100;
  }

  // Blend with base score based on confidence
  const blendFactor = learnedWeights.confidenceScore * 0.4; // Max 40% influence from ML
  return Math.round(baseScore * (1 - blendFactor) + adjustedScore * blendFactor);
}

/**
 * الحصول على إحصائيات التعلم للمستخدم
 */
export async function getLearningStats(userId?: string, sessionId?: string): Promise<{
  totalInteractions: number;
  confidenceScore: number;
  topPreferences: { districts: string[]; types: string[] };
  learnedPriceRange: { min: number | null; max: number | null };
}> {
  const weights = await getLearnedWeights(userId, sessionId);
  
  return {
    totalInteractions: 0, // Would need additional query
    confidenceScore: weights.confidenceScore,
    topPreferences: {
      districts: weights.preferredDistricts,
      types: weights.preferredPropertyTypes,
    },
    learnedPriceRange: {
      min: weights.priceRangeMin,
      max: weights.priceRangeMax,
    },
  };
}

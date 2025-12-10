/**
 * خوارزمية المطابقة العقارية المتقدمة
 * Property Matching Algorithm with Weighted Scoring
 */

export interface BuyerPreference {
  city: string;
  districts: string[];
  propertyType: string;
  budgetMin?: number;
  budgetMax: number;
  area?: number;
  rooms?: number;
  propertyAge?: number;
  propertyAgePreference?: 'new' | 'medium' | 'old';
  facing?: string;
  streetWidth?: number;
  purpose?: 'residential' | 'investment';
  expectedROI?: number;
  usage?: string;
}

export interface PropertyListing {
  id: string;
  city: string;
  district: string;
  propertyType: string;
  price: number;
  area: number;
  rooms?: number;
  propertyAge?: number;
  facing?: string;
  streetWidth?: number;
  purpose?: 'residential' | 'investment';
  rentalIncome?: number;
  pricePerMeter?: number;
  usage?: string;
}

export interface MatchResult {
  property: PropertyListing;
  matchScore: number;
  breakdown: {
    location: { score: number; weight: number; details: string };
    area: { score: number; weight: number; details: string };
    propertyAge: { score: number; weight: number; details: string };
    price: { score: number; weight: number; details: string };
    facing: { score: number; weight: number; details: string };
    streetWidth: { score: number; weight: number; details: string };
    purpose: { score: number; weight: number; details: string };
    roi: { score: number; weight: number; details: string };
  };
  recommendation: string;
}

const WEIGHTS = {
  location: 0.25,
  area: 0.10,
  propertyAge: 0.10,
  price: 0.20,
  facing: 0.05,
  streetWidth: 0.05,
  purpose: 0.10,
  roi: 0.10,
};

// 📍 الموقع / الحي (25%)
function calculateLocationScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (buyer.city !== property.city) {
    return { score: 0, details: 'لا علاقة - مدينة مختلفة تماماً' };
  }
  
  if (buyer.districts.length === 0) {
    return { score: 70, details: 'نفس المدينة - لم يحدد حي' };
  }
  
  const districtMatch = buyer.districts.some(d => 
    d.toLowerCase() === property.district.toLowerCase() ||
    property.district.includes(d) ||
    d.includes(property.district)
  );
  
  if (districtMatch) {
    return { score: 100, details: `الحي مطابق تماماً: ${property.district}` };
  }
  
  // يمكن إضافة منطق الأحياء المجاورة هنا
  return { score: 30, details: `حي بعيد: ${property.district}` };
}

// 📐 المساحة (10%)
function calculateAreaScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.area) {
    return { score: 70, details: 'لم يحدد مساحة مطلوبة' };
  }
  
  const diff = Math.abs(property.area - buyer.area) / buyer.area * 100;
  
  if (diff <= 5) {
    return { score: 100, details: `مطابق تماماً (±5%): ${property.area}م²` };
  } else if (diff <= 10) {
    return { score: 80, details: `ضمن 10%: ${property.area}م²` };
  } else if (diff <= 20) {
    return { score: 50, details: `ضمن 20%: ${property.area}م²` };
  }
  
  return { score: 0, details: `خارج النطاق: ${property.area}م²` };
}

// ⏳ عمر العقار (10%)
function calculatePropertyAgeScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!property.propertyAge) {
    return { score: 50, details: 'لم يحدد عمر العقار' };
  }
  
  const age = property.propertyAge;
  const pref = buyer.propertyAgePreference || 'new';
  
  if (pref === 'new') {
    // رغبة العميل: جديد (0-5 سنوات)
    if (age <= 5) {
      return { score: 100, details: `جديد ضمن المدى: ${age} سنة` };
    } else if (age <= 10) {
      return { score: 70, details: `متوسط العمر: ${age} سنة` };
    }
    return { score: 0, details: `قديم: ${age} سنة` };
  } else if (pref === 'medium') {
    // رغبة العميل: متوسط (5-10 سنوات)
    if (age >= 5 && age <= 10) {
      return { score: 100, details: `ضمن المدى المطلوب: ${age} سنة` };
    } else if (age < 5 || (age > 10 && age <= 15)) {
      return { score: 70, details: `قريب من المطلوب: ${age} سنة` };
    }
    return { score: 0, details: `خارج النطاق: ${age} سنة` };
  } else {
    // رغبة العميل: قديم (أكثر من 10 سنوات)
    if (age > 10) {
      return { score: 100, details: `ضمن المدى المطلوب: ${age} سنة` };
    } else if (age >= 5) {
      return { score: 70, details: `متوسط العمر: ${age} سنة` };
    }
    return { score: 0, details: `جديد جداً: ${age} سنة` };
  }
}

// 💰 السعر (20%)
function calculatePriceScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  const maxBudget = buyer.budgetMax;
  
  if (property.price <= maxBudget) {
    // أقل من الميزانية = +10% مكافأة
    const bonus = property.price < maxBudget ? 10 : 0;
    return { score: Math.min(100, 100 + bonus), details: `ضمن الميزانية: ${formatPrice(property.price)}` };
  }
  
  const overBudgetPercent = ((property.price - maxBudget) / maxBudget) * 100;
  
  if (overBudgetPercent <= 5) {
    return { score: 80, details: `زيادة 5% عن الميزانية: ${formatPrice(property.price)}` };
  } else if (overBudgetPercent <= 10) {
    return { score: 50, details: `زيادة 10% عن الميزانية: ${formatPrice(property.price)}` };
  }
  
  return { score: 0, details: `أكثر من 10% فوق الميزانية: ${formatPrice(property.price)}` };
}

// ☀️ الواجهة (5%)
function calculateFacingScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.facing || !property.facing) {
    return { score: 50, details: 'لم يحدد الواجهة' };
  }
  
  const buyerFacing = buyer.facing.toLowerCase();
  const propFacing = property.facing.toLowerCase();
  
  if (buyerFacing === propFacing) {
    return { score: 100, details: `واجهة مطابقة: ${property.facing}` };
  }
  
  // واجهات مقبولة (شرقية/غربية أو شمالية/جنوبية)
  const acceptable: Record<string, string[]> = {
    'شرقية': ['غربية'],
    'غربية': ['شرقية'],
    'شمالية': ['جنوبية'],
    'جنوبية': ['شمالية'],
  };
  
  if (acceptable[buyerFacing]?.includes(propFacing)) {
    return { score: 50, details: `واجهة مقبولة: ${property.facing}` };
  }
  
  return { score: 0, details: `واجهة غير مناسبة: ${property.facing}` };
}

// 🚧 عرض الشارع (5%)
function calculateStreetWidthScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.streetWidth || !property.streetWidth) {
    return { score: 50, details: 'لم يحدد عرض الشارع' };
  }
  
  const diff = buyer.streetWidth - property.streetWidth;
  
  if (diff <= 0) {
    return { score: 100, details: `مطابق أو أكبر: ${property.streetWidth}م` };
  } else if (diff <= 2) {
    return { score: 70, details: `أقل بـ 2م: ${property.streetWidth}م` };
  } else if (diff <= 4) {
    return { score: 40, details: `أقل بـ 4م: ${property.streetWidth}م` };
  }
  
  return { score: 0, details: `أقل من المطلوب: ${property.streetWidth}م` };
}

// 🏢 الاستخدام (10%)
function calculatePurposeScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.purpose && !buyer.usage) {
    return { score: 70, details: 'لم يحدد الاستخدام' };
  }
  
  const buyerUsage = buyer.usage || buyer.purpose;
  const propUsage = property.usage || property.purpose;
  
  if (!propUsage) {
    return { score: 50, details: 'العقار غير مصنف' };
  }
  
  if (buyerUsage === propUsage) {
    return { score: 100, details: `استخدام مطابق: ${propUsage}` };
  }
  
  // استخدامات قريبة
  const similar: { [key: string]: string[] } = {
    'residential': ['سكني', 'سكن'],
    'investment': ['استثماري', 'استثمار'],
    'سكني': ['residential', 'سكن'],
    'استثماري': ['investment', 'استثمار'],
  };
  
  if (similar[buyerUsage as string]?.includes(propUsage as string)) {
    return { score: 100, details: `استخدام مطابق: ${propUsage}` };
  }
  
  return { score: 0, details: `استخدام غير مناسب: ${propUsage}` };
}

// 📈 ROI العائد الاستثماري (10%)
function calculateROIScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (buyer.purpose !== 'investment') {
    return { score: 70, details: 'غير مطلوب (ليس استثماري)' };
  }
  
  if (!property.rentalIncome || !property.price) {
    return { score: 0, details: 'لا توجد بيانات عائد' };
  }
  
  const annualIncome = property.rentalIncome * 12;
  const actualROI = (annualIncome / property.price) * 100;
  const expectedROI = buyer.expectedROI || 6;
  
  const diff = expectedROI - actualROI;
  
  if (diff <= 0) {
    return { score: 100, details: `عائد مطابق أو أعلى: ${actualROI.toFixed(1)}%` };
  } else if (diff <= 1) {
    return { score: 80, details: `أقل بـ 1%: ${actualROI.toFixed(1)}%` };
  } else if (diff <= 2) {
    return { score: 60, details: `أقل بـ 2%: ${actualROI.toFixed(1)}%` };
  }
  
  return { score: 0, details: `عائد منخفض: ${actualROI.toFixed(1)}%` };
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون ريال`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ألف ريال`;
  }
  return `${price} ريال`;
}

function generateRecommendation(matchScore: number): string {
  if (matchScore >= 90) {
    return 'مطابقة ممتازة - يُنصح بالتواصل فوراً';
  } else if (matchScore >= 80) {
    return 'مطابقة جيدة جداً - خيار مناسب للمتابعة';
  } else if (matchScore >= 70) {
    return 'مطابقة جيدة - يستحق النظر فيه';
  } else if (matchScore >= 60) {
    return 'مطابقة مقبولة - قد يناسب مع بعض التنازلات';
  } else if (matchScore >= 50) {
    return 'مطابقة متوسطة - يحتاج تقييم إضافي';
  }
  return 'مطابقة ضعيفة - قد لا يناسب متطلباتك';
}

export function calculateMatchScore(buyer: BuyerPreference, property: PropertyListing): MatchResult {
  const location = calculateLocationScore(buyer, property);
  const area = calculateAreaScore(buyer, property);
  const propertyAge = calculatePropertyAgeScore(buyer, property);
  const price = calculatePriceScore(buyer, property);
  const facing = calculateFacingScore(buyer, property);
  const streetWidth = calculateStreetWidthScore(buyer, property);
  const purpose = calculatePurposeScore(buyer, property);
  const roi = calculateROIScore(buyer, property);
  
  const totalScore = Math.round(
    (location.score * WEIGHTS.location) +
    (area.score * WEIGHTS.area) +
    (propertyAge.score * WEIGHTS.propertyAge) +
    (price.score * WEIGHTS.price) +
    (facing.score * WEIGHTS.facing) +
    (streetWidth.score * WEIGHTS.streetWidth) +
    (purpose.score * WEIGHTS.purpose) +
    (roi.score * WEIGHTS.roi)
  );
  
  const breakdown = {
    location: { score: location.score, weight: WEIGHTS.location * 100, details: location.details },
    area: { score: area.score, weight: WEIGHTS.area * 100, details: area.details },
    propertyAge: { score: propertyAge.score, weight: WEIGHTS.propertyAge * 100, details: propertyAge.details },
    price: { score: price.score, weight: WEIGHTS.price * 100, details: price.details },
    facing: { score: facing.score, weight: WEIGHTS.facing * 100, details: facing.details },
    streetWidth: { score: streetWidth.score, weight: WEIGHTS.streetWidth * 100, details: streetWidth.details },
    purpose: { score: purpose.score, weight: WEIGHTS.purpose * 100, details: purpose.details },
    roi: { score: roi.score, weight: WEIGHTS.roi * 100, details: roi.details },
  };
  
  return {
    property,
    matchScore: Math.min(100, totalScore),
    breakdown,
    recommendation: generateRecommendation(totalScore),
  };
}

export function findMatchingProperties(
  buyer: BuyerPreference, 
  properties: PropertyListing[],
  minScore: number = 50
): MatchResult[] {
  const results = properties
    .map(property => calculateMatchScore(buyer, property))
    .filter(result => result.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
}

export function getMatchScoreLabel(score: number): string {
  if (score >= 90) return 'ممتاز';
  if (score >= 80) return 'جيد جداً';
  if (score >= 70) return 'جيد';
  if (score >= 60) return 'مقبول';
  if (score >= 50) return 'متوسط';
  return 'ضعيف';
}

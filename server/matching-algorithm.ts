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
  facing?: string;
  streetWidth?: number;
  purpose?: 'residential' | 'investment';
  expectedROI?: number;
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
    additional: { score: number; weight: number; details: string };
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
  additional: 0.05,
};

function calculateLocationScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (buyer.city !== property.city) {
    return { score: 0, details: 'مدينة مختلفة' };
  }
  
  if (buyer.districts.length === 0) {
    return { score: 80, details: 'نفس المدينة' };
  }
  
  const districtMatch = buyer.districts.some(d => 
    d.toLowerCase() === property.district.toLowerCase() ||
    property.district.includes(d) ||
    d.includes(property.district)
  );
  
  if (districtMatch) {
    return { score: 100, details: `الحي مطابق: ${property.district}` };
  }
  
  return { score: 50, details: `حي مختلف: ${property.district}` };
}

function calculateAreaScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.area) {
    return { score: 80, details: 'لم يحدد مساحة مطلوبة' };
  }
  
  const diff = Math.abs(property.area - buyer.area) / buyer.area;
  
  if (diff <= 0.05) {
    return { score: 100, details: `مساحة مطابقة تماماً: ${property.area}م²` };
  } else if (diff <= 0.15) {
    return { score: 85, details: `مساحة قريبة جداً: ${property.area}م²` };
  } else if (diff <= 0.25) {
    return { score: 70, details: `مساحة مقبولة: ${property.area}م²` };
  } else if (diff <= 0.40) {
    return { score: 50, details: `فرق في المساحة: ${property.area}م²` };
  }
  
  return { score: 20, details: `مساحة بعيدة عن المطلوب: ${property.area}م²` };
}

function calculatePropertyAgeScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.propertyAge || !property.propertyAge) {
    return { score: 75, details: 'لم يحدد عمر العقار' };
  }
  
  const ageDiff = Math.abs(property.propertyAge - buyer.propertyAge);
  
  if (ageDiff === 0) {
    return { score: 100, details: `عمر مطابق: ${property.propertyAge} سنة` };
  } else if (ageDiff <= 2) {
    return { score: 90, details: `عمر قريب: ${property.propertyAge} سنة` };
  } else if (ageDiff <= 5) {
    return { score: 70, details: `فرق معقول: ${property.propertyAge} سنة` };
  } else if (ageDiff <= 10) {
    return { score: 50, details: `فرق ملحوظ: ${property.propertyAge} سنة` };
  }
  
  return { score: 25, details: `عمر بعيد عن المطلوب: ${property.propertyAge} سنة` };
}

function calculatePriceScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  const maxBudget = buyer.budgetMax;
  const minBudget = buyer.budgetMin || 0;
  
  if (property.price <= maxBudget && property.price >= minBudget) {
    const percentOfBudget = (property.price / maxBudget) * 100;
    if (percentOfBudget <= 80) {
      return { score: 100, details: `سعر ممتاز ضمن الميزانية: ${formatPrice(property.price)}` };
    } else if (percentOfBudget <= 95) {
      return { score: 90, details: `سعر جيد ضمن الميزانية: ${formatPrice(property.price)}` };
    }
    return { score: 80, details: `سعر مناسب ضمن الميزانية: ${formatPrice(property.price)}` };
  }
  
  if (property.price > maxBudget) {
    const overBudgetPercent = ((property.price - maxBudget) / maxBudget) * 100;
    if (overBudgetPercent <= 5) {
      return { score: 65, details: `أعلى من الميزانية بـ 5%: ${formatPrice(property.price)}` };
    } else if (overBudgetPercent <= 10) {
      return { score: 50, details: `أعلى من الميزانية بـ 10%: ${formatPrice(property.price)}` };
    } else if (overBudgetPercent <= 20) {
      return { score: 30, details: `أعلى من الميزانية بـ 20%: ${formatPrice(property.price)}` };
    }
    return { score: 10, details: `يتجاوز الميزانية بكثير: ${formatPrice(property.price)}` };
  }
  
  return { score: 70, details: `أقل من الحد الأدنى: ${formatPrice(property.price)}` };
}

function calculateFacingScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.facing || !property.facing) {
    return { score: 75, details: 'لم يحدد الواجهة المطلوبة' };
  }
  
  if (buyer.facing.toLowerCase() === property.facing.toLowerCase()) {
    return { score: 100, details: `واجهة مطابقة: ${property.facing}` };
  }
  
  return { score: 40, details: `واجهة مختلفة: ${property.facing}` };
}

function calculateStreetWidthScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.streetWidth || !property.streetWidth) {
    return { score: 75, details: 'لم يحدد عرض الشارع' };
  }
  
  if (property.streetWidth >= buyer.streetWidth) {
    return { score: 100, details: `عرض شارع مناسب: ${property.streetWidth}م` };
  }
  
  const diff = buyer.streetWidth - property.streetWidth;
  if (diff <= 5) {
    return { score: 70, details: `عرض شارع أقل قليلاً: ${property.streetWidth}م` };
  }
  
  return { score: 40, details: `عرض شارع أقل من المطلوب: ${property.streetWidth}م` };
}

function calculatePurposeScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (!buyer.purpose) {
    return { score: 80, details: 'لم يحدد الغرض (سكني/استثماري)' };
  }
  
  if (!property.purpose) {
    return { score: 70, details: 'العقار غير مصنف' };
  }
  
  if (buyer.purpose === property.purpose) {
    return { score: 100, details: buyer.purpose === 'residential' ? 'مناسب للسكن' : 'مناسب للاستثمار' };
  }
  
  return { score: 50, details: 'غرض مختلف عن المطلوب' };
}

function calculateROIScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  if (buyer.purpose !== 'investment') {
    return { score: 75, details: 'غير مطلوب (ليس استثماري)' };
  }
  
  if (!property.rentalIncome || !property.price) {
    return { score: 50, details: 'لا توجد بيانات عائد' };
  }
  
  const annualIncome = property.rentalIncome * 12;
  const roi = (annualIncome / property.price) * 100;
  
  if (roi >= 8) {
    return { score: 100, details: `عائد ممتاز: ${roi.toFixed(1)}%` };
  } else if (roi >= 6) {
    return { score: 85, details: `عائد جيد جداً: ${roi.toFixed(1)}%` };
  } else if (roi >= 5) {
    return { score: 70, details: `عائد مقبول: ${roi.toFixed(1)}%` };
  } else if (roi >= 4) {
    return { score: 55, details: `عائد متوسط: ${roi.toFixed(1)}%` };
  }
  
  return { score: 30, details: `عائد منخفض: ${roi.toFixed(1)}%` };
}

function calculateAdditionalScore(buyer: BuyerPreference, property: PropertyListing): { score: number; details: string } {
  let score = 75;
  const factors: string[] = [];
  
  if (buyer.rooms && property.rooms) {
    if (property.rooms >= buyer.rooms) {
      score += 10;
      factors.push(`عدد غرف مناسب: ${property.rooms}`);
    } else {
      score -= 10;
      factors.push(`غرف أقل: ${property.rooms}`);
    }
  }
  
  if (buyer.propertyType === property.propertyType) {
    score += 10;
    factors.push('نوع العقار مطابق');
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return { 
    score, 
    details: factors.length > 0 ? factors.join(' | ') : 'لا توجد عوامل إضافية' 
  };
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون ريال`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ألف ريال`;
  }
  return `${price} ريال`;
}

function generateRecommendation(matchScore: number, breakdown: MatchResult['breakdown']): string {
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
  const additional = calculateAdditionalScore(buyer, property);
  
  const totalScore = Math.round(
    (location.score * WEIGHTS.location) +
    (area.score * WEIGHTS.area) +
    (propertyAge.score * WEIGHTS.propertyAge) +
    (price.score * WEIGHTS.price) +
    (facing.score * WEIGHTS.facing) +
    (streetWidth.score * WEIGHTS.streetWidth) +
    (purpose.score * WEIGHTS.purpose) +
    (roi.score * WEIGHTS.roi) +
    (additional.score * WEIGHTS.additional)
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
    additional: { score: additional.score, weight: WEIGHTS.additional * 100, details: additional.details },
  };
  
  return {
    property,
    matchScore: totalScore,
    breakdown,
    recommendation: generateRecommendation(totalScore, breakdown),
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

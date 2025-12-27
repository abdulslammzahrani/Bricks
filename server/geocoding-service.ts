/**
 * Geocoding Service - للحصول على الإحداثيات من اسم المدينة/الحي
 * يستخدم Nominatim (OpenStreetMap) API مجاناً
 */

import { geocodingRateLimiter } from "./geocoding-rate-limiter";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  region?: string;
}

export async function geocodeCity(cityName: string, region?: string): Promise<GeocodingResult | null> {
  // Rate limiting
  if (!geocodingRateLimiter.canMakeRequest("geocoding")) {
    const remainingTime = geocodingRateLimiter.getRemainingTime("geocoding");
    throw new Error(`يرجى الانتظار ${Math.ceil(remainingTime / 1000)} ثانية قبل المحاولة مرة أخرى`);
  }
  try {
    // البحث في السعودية
    const query = region 
      ? `${cityName}, ${region}, Saudi Arabia`
      : `${cityName}, Saudi Arabia`;
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=sa&accept-language=ar,en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bricks-Property-Platform/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        region: extractRegion(result.display_name),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function geocodeDistrict(districtName: string, cityName: string, region?: string): Promise<GeocodingResult | null> {
  // Rate limiting
  if (!geocodingRateLimiter.canMakeRequest("geocoding")) {
    const remainingTime = geocodingRateLimiter.getRemainingTime("geocoding");
    throw new Error(`يرجى الانتظار ${Math.ceil(remainingTime / 1000)} ثانية قبل المحاولة مرة أخرى`);
  }
  try {
    // البحث عن الحي داخل المدينة
    const query = region
      ? `${districtName}, ${cityName}, ${region}, Saudi Arabia`
      : `${districtName}, ${cityName}, Saudi Arabia`;
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=sa&accept-language=ar,en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bricks-Property-Platform/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        region: extractRegion(result.display_name),
      };
    }
    
    // إذا لم نجد الحي، نرجع إحداثيات المدينة مع offset صغير
    const cityCoords = await geocodeCity(cityName, region);
    if (cityCoords) {
      // إضافة offset صغير عشوائي
      const offset = (Math.random() - 0.5) * 0.05; // ~5km
      return {
        latitude: cityCoords.latitude + offset,
        longitude: cityCoords.longitude + offset,
        displayName: `${districtName}, ${cityName}`,
        region: cityCoords.region,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

function extractRegion(displayName: string): string {
  // محاولة استخراج المنطقة من display_name
  // مثال: "الرياض, منطقة الرياض, السعودية"
  const parts = displayName.split(',');
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return '';
}

// Reverse geocoding - الحصول على اسم المكان من الإحداثيات
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar,en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Bricks-Property-Platform/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}


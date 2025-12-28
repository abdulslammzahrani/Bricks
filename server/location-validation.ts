/**
 * Validation utilities for location data
 */

// Saudi Arabia geographic bounds
const SAUDI_LAT_MIN = 16.0;
const SAUDI_LAT_MAX = 32.0;
const SAUDI_LNG_MIN = 34.0;
const SAUDI_LNG_MAX = 55.0;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate coordinates are within Saudi Arabia bounds
 */
export function validateCoordinates(latitude: number, longitude: number): ValidationResult {
  const errors: string[] = [];

  if (isNaN(latitude) || isNaN(longitude)) {
    errors.push("الإحداثيات يجب أن تكون أرقام صحيحة");
    return { isValid: false, errors };
  }

  if (latitude < SAUDI_LAT_MIN || latitude > SAUDI_LAT_MAX) {
    errors.push(`خط العرض يجب أن يكون بين ${SAUDI_LAT_MIN} و ${SAUDI_LAT_MAX}`);
  }

  if (longitude < SAUDI_LNG_MIN || longitude > SAUDI_LNG_MAX) {
    errors.push(`خط الطول يجب أن يكون بين ${SAUDI_LNG_MIN} و ${SAUDI_LNG_MAX}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate city name is not empty and has valid format
 */
export function validateCityName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("اسم المدينة مطلوب");
  } else if (name.trim().length < 2) {
    errors.push("اسم المدينة يجب أن يكون على الأقل حرفين");
  } else if (name.trim().length > 100) {
    errors.push("اسم المدينة طويل جداً (الحد الأقصى 100 حرف)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate district name is not empty and has valid format
 */
export function validateDistrictName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("اسم الحي مطلوب");
  } else if (name.trim().length < 2) {
    errors.push("اسم الحي يجب أن يكون على الأقل حرفين");
  } else if (name.trim().length > 100) {
    errors.push("اسم الحي طويل جداً (الحد الأقصى 100 حرف)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate region name
 */
export function validateRegion(region: string): ValidationResult {
  const errors: string[] = [];

  if (!region || region.trim().length === 0) {
    errors.push("المنطقة مطلوبة");
  } else if (region.trim().length < 2) {
    errors.push("اسم المنطقة يجب أن يكون على الأقل حرفين");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all city data
 */
export function validateCityData(data: {
  name: string;
  region: string;
  latitude: number | string;
  longitude: number | string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateCityName(data.name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  // Validate region
  const regionValidation = validateRegion(data.region);
  if (!regionValidation.isValid) {
    errors.push(...regionValidation.errors);
  }

  // Validate coordinates
  const lat = typeof data.latitude === "string" ? parseFloat(data.latitude) : data.latitude;
  const lng = typeof data.longitude === "string" ? parseFloat(data.longitude) : data.longitude;
  const coordsValidation = validateCoordinates(lat, lng);
  if (!coordsValidation.isValid) {
    errors.push(...coordsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all district data
 */
export function validateDistrictData(data: {
  cityId: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate cityId
  if (!data.cityId || data.cityId.trim().length === 0) {
    errors.push("المدينة مطلوبة");
  }

  // Validate name
  const nameValidation = validateDistrictName(data.name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  // Validate coordinates
  const lat = typeof data.latitude === "string" ? parseFloat(data.latitude) : data.latitude;
  const lng = typeof data.longitude === "string" ? parseFloat(data.longitude) : data.longitude;
  const coordsValidation = validateCoordinates(lat, lng);
  if (!coordsValidation.isValid) {
    errors.push(...coordsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}



import { apiRequest } from "./queryClient";
import type { CompleteFormConfig } from "@/components/admin/FormBuilder/types";

export interface FormSubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Unified form submission handler
 * Routes form submissions based on formConfig.submissionHandler
 */
export async function submitForm(
  formName: string,
  formData: Record<string, any>,
  formConfig?: CompleteFormConfig
): Promise<FormSubmissionResult> {
  try {
    // If formConfig is provided, use it; otherwise fetch it
    let config = formConfig;
    if (!config) {
      const res = await apiRequest("GET", `/api/form-builder/${formName}`);
      if (!res.ok) {
        throw new Error("Failed to load form configuration");
      }
      config = await res.json();
    }

    if (!config) {
      throw new Error("Form configuration not found");
    }

    // Determine submission endpoint
    const submissionHandler = config.config.submissionHandler || "custom";
    const submissionEndpoint = config.config.submissionEndpoint || `/api/form-builder/submit/${formName}`;

    // Transform form data based on submission handler
    let transformedData = formData;

    if (submissionHandler === "buyer") {
      transformedData = transformBuyerData(formData);
    } else if (submissionHandler === "seller") {
      transformedData = transformSellerData(formData);
    }

    // Submit to appropriate endpoint
    const response = await apiRequest("POST", submissionEndpoint, {
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء إرسال البيانات",
    };
  }
}

/**
 * Transform form data for buyer submission
 */
function transformBuyerData(data: Record<string, any>): Record<string, any> {
  return {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || null,
    city: Array.isArray(data.cities) && data.cities.length > 0 ? data.cities[0] : data.city || "",
    districts: Array.isArray(data.districts) ? data.districts : [],
    propertyType: data.propertyType || null,
    propertyCategory: data.propertyCategory || null,
    rooms: data.rooms || null,
    area: data.minArea || data.area || null,
    budgetMin: data.minPrice || data.budgetMin ? parseInt(String(data.minPrice || data.budgetMin).replace(/[^\d]/g, ""), 10) : null,
    budgetMax: data.maxPrice || data.budgetMax ? parseInt(String(data.maxPrice || data.budgetMax).replace(/[^\d]/g, ""), 10) : null,
    paymentMethod: data.paymentMethod || null,
    purpose: data.purpose || null,
    purchaseTimeline: data.purchaseTimeline || null,
    transactionType: data.transactionType === "rent" ? "rent" : "buy",
    clientType: data.clientType || "direct",
    smartTags: Array.isArray(data.smartTags) ? data.smartTags : [],
    notes: data.notes || "",
  };
}

/**
 * Transform form data for seller submission
 */
function transformSellerData(data: Record<string, any>): Record<string, any> {
  return {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || null,
    accountType: data.accountType || null,
    entityName: data.entityName || null,
    propertyType: data.propertyType || null,
    propertyCategory: data.propertyCategory || null,
    city: Array.isArray(data.cities) && data.cities.length > 0 ? data.cities[0] : data.city || "",
    district: Array.isArray(data.districts) && data.districts.length > 0 ? data.districts[0] : data.district || "",
    price: data.targetPrice || data.price ? parseInt(String(data.targetPrice || data.price).replace(/[^\d]/g, ""), 10) : null,
    area: data.minArea || data.area || null,
    rooms: data.rooms || null,
    bathrooms: data.bathrooms || null,
    description: data.description || data.notes || null,
    status: data.status || "ready",
    images: Array.isArray(data.images) ? data.images : [],
    smartTags: Array.isArray(data.smartTags) ? data.smartTags : [],
    notes: data.notes || null,
    latitude: data.latitude || data.location?.latitude || null,
    longitude: data.longitude || data.location?.longitude || null,
  };
}

/**
 * Validate form data based on formConfig
 */
export function validateFormData(
  formData: Record<string, any>,
  formConfig: CompleteFormConfig
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  formConfig.steps.forEach(({ step, fields }) => {
    fields.forEach(({ field }) => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === "" || 
            (Array.isArray(value) && value.length === 0)) {
          errors[field.name] = `${field.label} مطلوب`;
        }
      }

      // Additional validation based on field type
      if (field.validation) {
        const validation = field.validation as any;
        const value = formData[field.name];

        if (validation.min && Number(value) < validation.min) {
          errors[field.name] = `الحد الأدنى هو ${validation.min}`;
        }

        if (validation.max && Number(value) > validation.max) {
          errors[field.name] = `الحد الأقصى هو ${validation.max}`;
        }

        if (validation.pattern && value && !new RegExp(validation.pattern).test(value)) {
          errors[field.name] = validation.patternMessage || "القيمة غير صحيحة";
        }
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}




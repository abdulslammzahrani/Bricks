import type { Express } from "express";
import { storage } from "../storage";
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  normalizeEmail,
  generateTempEmail,
} from "../utils/validation";
import * as formBuilderStorage from "../form-builder-storage";

/**
 * Unified form submission handler
 * Routes submissions based on formConfig.submissionHandler
 */
export async function handleFormSubmission(
  formName: string,
  formData: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Get form config
    const formConfig = await formBuilderStorage.getCompleteFormConfig(formName);
    if (!formConfig) {
      return { success: false, error: "النموذج غير موجود" };
    }

    const submissionHandler = formConfig.config.submissionHandler || "custom";

    // Route to appropriate handler
    switch (submissionHandler) {
      case "buyer":
        return await handleBuyerSubmission(formData);
      case "seller":
        return await handleSellerSubmission(formData);
      case "custom":
        return await handleCustomSubmission(formName, formData, formConfig);
      default:
        return { success: false, error: "نوع الإرسال غير معروف" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "حدث خطأ أثناء معالجة البيانات" };
  }
}

/**
 * Handle buyer form submission
 */
async function handleBuyerSubmission(data: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate required fields
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      return { success: false, error: "الاسم مطلوب" };
    }
    if (!data.city || typeof data.city !== "string") {
      return { success: false, error: "المدينة مطلوبة" };
    }

    // Clean and validate phone
    const cleanPhone = normalizePhone(data.phone || "");
    if (!isValidPhone(cleanPhone)) {
      return { success: false, error: "رقم الجوال غير صحيح" };
    }

    // Handle email (optional for buyers)
    const cleanEmail = data.email ? normalizeEmail(data.email) : null;
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: "البريد الإلكتروني غير صحيح" };
    }

    // Check if user exists
    let user = cleanEmail ? await storage.getUserByEmail(cleanEmail) : null;
    if (!user) {
      user = await storage.getUserByPhone(cleanPhone);
    }

    let isNewUser = false;
    if (!user) {
      // Create temporary email if needed
      let finalEmail = cleanEmail;
      if (!finalEmail || !isValidEmail(finalEmail)) {
        finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
      }

      user = await storage.createUser({
        email: finalEmail,
        phone: cleanPhone,
        name: data.name.trim(),
        role: "buyer",
      });

      // Generate unique email if temporary
      if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
        const uniqueEmail = generateTempEmail(cleanPhone, user.id);
        user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
      }

      isNewUser = true;
    }

    // Parse budget values
    const parsedBudgetMin = data.budgetMin ? parseInt(String(data.budgetMin), 10) : null;
    const parsedBudgetMax = data.budgetMax ? parseInt(String(data.budgetMax), 10) : null;

    // Store propertyCategory in notes temporarily until schema is updated
    const notesWithCategory = data.propertyCategory 
      ? (data.notes ? `${data.notes}\n[propertyCategory:${data.propertyCategory}]` : `[propertyCategory:${data.propertyCategory}]`)
      : data.notes;

    // Create preference
    const preference = await storage.createBuyerPreference({
      userId: user.id,
      city: data.city,
      districts: Array.isArray(data.districts) ? data.districts : [],
      propertyType: data.propertyType || null,
      rooms: data.rooms || null,
      area: data.area || null,
      budgetMin: isNaN(parsedBudgetMin!) ? null : parsedBudgetMin,
      budgetMax: isNaN(parsedBudgetMax!) ? null : parsedBudgetMax,
      paymentMethod: data.paymentMethod || null,
      purpose: data.purpose || null,
      purchaseTimeline: data.purchaseTimeline || null,
      transactionType: data.transactionType || "buy",
      clientType: data.clientType || "direct",
      smartTags: Array.isArray(data.smartTags) ? data.smartTags : [],
      notes: notesWithCategory || null,
      isActive: true,
    });

    // Find matches
    await storage.findMatchesForPreference(preference.id);

    return {
      success: true,
      data: {
        user,
        preference,
        isNewUser,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle seller form submission
 */
async function handleSellerSubmission(data: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate required fields
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      return { success: false, error: "الاسم مطلوب" };
    }
    if (!data.city || typeof data.city !== "string") {
      return { success: false, error: "المدينة مطلوبة" };
    }
    if (!data.district || typeof data.district !== "string") {
      return { success: false, error: "الحي مطلوب" };
    }
    if (!data.propertyType || typeof data.propertyType !== "string") {
      return { success: false, error: "نوع العقار مطلوب" };
    }
    if (!data.price) {
      return { success: false, error: "السعر مطلوب" };
    }

    // Parse price
    const parsedPrice = parseInt(String(data.price), 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return { success: false, error: "السعر غير صحيح" };
    }

    // Clean and validate phone
    const cleanPhone = normalizePhone(data.phone || "");
    if (!isValidPhone(cleanPhone)) {
      return { success: false, error: "رقم الجوال غير صحيح" };
    }

    // Handle email (optional for sellers)
    const cleanEmail = data.email ? normalizeEmail(data.email) : null;
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: "البريد الإلكتروني غير صحيح" };
    }

    // Check if user exists
    let user = cleanEmail ? await storage.getUserByEmail(cleanEmail) : null;
    if (!user) {
      user = await storage.getUserByPhone(cleanPhone);
    }

    let isNewUser = false;
    if (!user) {
      // Create temporary email if needed
      let finalEmail = cleanEmail;
      if (!finalEmail || !isValidEmail(finalEmail)) {
        finalEmail = `temp_${Date.now()}@temp.bricks.sa`;
      }

      user = await storage.createUser({
        email: finalEmail,
        phone: cleanPhone,
        name: data.name.trim(),
        role: "seller",
        accountType: data.accountType || null,
        entityName: data.entityName || null,
      });

      // Generate unique email if temporary
      if (finalEmail.includes("@temp.bricks.sa") && finalEmail.startsWith("temp_")) {
        const uniqueEmail = generateTempEmail(cleanPhone, user.id);
        user = await storage.updateUser(user.id, { email: uniqueEmail }) || user;
      }

      isNewUser = true;
    }

    // Store propertyCategory in notes temporarily until schema is updated
    const notesWithCategory = data.propertyCategory 
      ? (data.notes ? `${data.notes}\n[propertyCategory:${data.propertyCategory}]` : `[propertyCategory:${data.propertyCategory}]`)
      : data.notes;

    // Create property
    const property = await storage.createProperty({
      sellerId: user.id,
      propertyType: data.propertyType,
      city: data.city,
      district: data.district,
      price: parsedPrice,
      area: data.area || null,
      rooms: data.rooms || null,
      bathrooms: data.bathrooms || null,
      description: data.description || null,
      status: data.status || "ready",
      images: Array.isArray(data.images) ? data.images : [],
      smartTags: Array.isArray(data.smartTags) ? data.smartTags : [],
      notes: notesWithCategory || null,
      isActive: true,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    });

    // Find matches
    await storage.findMatchesForProperty(property.id);

    return {
      success: true,
      data: {
        user,
        property,
        isNewUser,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle custom form submission
 */
async function handleCustomSubmission(
  formName: string,
  formData: Record<string, any>,
  formConfig: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  // For custom submissions, just return the data
  // The actual endpoint will handle the submission
  return {
    success: true,
    data: formData,
  };
}


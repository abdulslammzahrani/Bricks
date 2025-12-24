/**
 * دوال التحقق من صحة البيانات
 */

// دالة للتحقق من صحة الإيميل
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // التأكد من أن الإيميل صحيح ولا يحتوي على @temp.com أو @temp.tatabuq.sa
  return emailRegex.test(email.trim()) && 
         !email.includes("@temp.com") && 
         !email.includes("@temp.tatabuq.sa") &&
         email.length <= 255;
}

// دالة للتحقق من صحة رقم الجوال (يجب أن يكون رقم فقط)
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // تنظيف الرقم من المسافات والرموز
  const cleanPhone = phone.trim().replace(/\s/g, "").replace(/-/g, "");
  // يجب أن يكون رقم فقط (يمكن أن يبدأ بـ + أو 0)
  // الأرقام السعودية: تبدأ بـ 0 أو 966
  const phoneRegex = /^(\+966|966|0)?[0-9]{9}$/;
  return phoneRegex.test(cleanPhone);
}

// دالة لتنظيف رقم الجوال (إرجاع رقم موحد)
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  // تنظيف الرقم
  let cleanPhone = phone.trim().replace(/\s/g, "").replace(/-/g, "");
  
  // إزالة + إذا كان موجوداً
  if (cleanPhone.startsWith("+")) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // تحويل 966 إلى 0
  if (cleanPhone.startsWith("966")) {
    cleanPhone = "0" + cleanPhone.substring(3);
  }
  
  // التأكد من أن الرقم يبدأ بـ 0
  if (!cleanPhone.startsWith("0") && cleanPhone.length === 9) {
    cleanPhone = "0" + cleanPhone;
  }
  
  return cleanPhone;
}

// دالة لتنظيف الإيميل
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

// دالة لإنشاء إيميل مؤقت صحيح من رقم الجوال
export function generateTempEmail(phone: string, userId: string): string {
  const cleanPhone = normalizePhone(phone);
  // استخدام جزء من userId لضمان التفرد
  const uniqueId = userId.substring(0, 8).replace(/-/g, "");
  return `user_${cleanPhone}_${uniqueId}@temp.tatabuq.sa`;
}

// دالة للتحقق من صحة البيانات قبل الحفظ
export function validateUserData(data: {
  name?: string;
  email?: string;
  phone?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name && (!data.name.trim() || data.name.trim().length < 2)) {
    errors.push("الاسم يجب أن يكون على الأقل حرفين");
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("البريد الإلكتروني غير صحيح");
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("رقم الجوال غير صحيح (يجب أن يكون رقم سعودي صحيح)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


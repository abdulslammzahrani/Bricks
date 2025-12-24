/**
 * Script لتنظيف البيانات المختلطة في جدول المستخدمين
 * 
 * هذا الـ script يقوم بـ:
 * 1. تنظيف الإيميلات المختلطة (مثل "temp.com@0533521000")
 * 2. تنظيف أرقام الجوال المختلطة (مثل "user@example.com")
 * 3. إصلاح الإيميلات التي تحتوي على أرقام جوال
 * 4. إصلاح أرقام الجوال التي تحتوي على إيميلات
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  generateTempEmail,
} from "../utils/validation";

// دالة لاستخراج رقم الجوال من نص مختلط
function extractPhone(text: string): string | null {
  if (!text) return null;
  // البحث عن رقم جوال في النص (9-15 رقم)
  const phoneMatch = text.match(/[\+]?[0-9]{9,15}/);
  if (phoneMatch) {
    let phone = phoneMatch[0].replace(/\s/g, "");
    // إزالة + إذا كان موجوداً في البداية
    if (phone.startsWith("+")) {
      phone = phone.substring(1);
    }
    // التأكد من أن الرقم يبدأ بـ 0 أو 966
    if (phone.startsWith("966")) {
      phone = "0" + phone.substring(3);
    }
    return phone;
  }
  return null;
}

// دالة لاستخراج الإيميل من نص مختلط
function extractEmail(text: string): string | null {
  if (!text) return null;
  const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  if (emailMatch && isValidEmail(emailMatch[0])) {
    return emailMatch[0];
  }
  return null;
}

async function cleanupUsers() {
  console.log("🚀 بدء تنظيف بيانات المستخدمين...\n");

  try {
    // جلب جميع المستخدمين
    const allUsers = await db.select().from(users);
    console.log(`📊 تم العثور على ${allUsers.length} مستخدم\n`);

    let fixedCount = 0;
    let errorCount = 0;
    const issues: Array<{ id: string; name: string; issue: string; fix: string }> = [];

    for (const user of allUsers) {
      let needsUpdate = false;
      const updates: { email?: string; phone?: string } = {};
      const userIssues: string[] = [];
      const userFixes: string[] = [];

      // فحص الإيميل
      if (!isValidEmail(user.email)) {
        userIssues.push(`إيميل غير صحيح: "${user.email}"`);
        
        // محاولة استخراج رقم الجوال من الإيميل
        const extractedPhone = extractPhone(user.email);
        if (extractedPhone && isValidPhone(extractedPhone)) {
          // الإيميل يحتوي على رقم جوال - استبداله بإيميل صحيح
          updates.email = generateEmailFromPhone(user.phone || extractedPhone, user.id);
          userFixes.push(`تم استبدال الإيميل بإيميل صحيح: "${updates.email}"`);
        } else {
          // محاولة استخراج إيميل من النص
          const extractedEmail = extractEmail(user.email);
          if (extractedEmail) {
            updates.email = extractedEmail;
            userFixes.push(`تم استخراج إيميل صحيح: "${updates.email}"`);
          } else {
            // إنشاء إيميل جديد من رقم الجوال
            const cleanPhone = normalizePhone(user.phone || "");
            if (isValidPhone(cleanPhone)) {
              updates.email = generateTempEmail(cleanPhone, user.id);
              userFixes.push(`تم إنشاء إيميل جديد: "${updates.email}"`);
            } else {
              // لا يمكن إصلاحه - تخطيه
              userIssues.push(`لا يمكن إصلاح الإيميل - لا يوجد رقم جوال صحيح`);
              errorCount++;
              issues.push({
                id: user.id,
                name: user.name,
                issue: userIssues.join(", "),
                fix: "يتطلب تدخل يدوي"
              });
              continue;
            }
          }
        }
        needsUpdate = true;
      }

      // فحص رقم الجوال
      if (!isValidPhone(user.phone || "")) {
        userIssues.push(`رقم جوال غير صحيح: "${user.phone}"`);
        
        // محاولة استخراج رقم الجوال من النص
        const extractedPhone = extractPhone(user.phone || "");
        if (extractedPhone && isValidPhone(extractedPhone)) {
          updates.phone = extractedPhone;
          userFixes.push(`تم استخراج رقم جوال صحيح: "${updates.phone}"`);
        } else {
          // محاولة استخراج رقم الجوال من الإيميل
          const phoneFromEmail = extractPhone(user.email || "");
          if (phoneFromEmail && isValidPhone(phoneFromEmail)) {
            updates.phone = phoneFromEmail;
            userFixes.push(`تم استخراج رقم الجوال من الإيميل: "${updates.phone}"`);
          } else {
            // لا يمكن إصلاحه - تخطيه
            userIssues.push(`لا يمكن إصلاح رقم الجوال`);
            errorCount++;
            issues.push({
              id: user.id,
              name: user.name,
              issue: userIssues.join(", "),
              fix: "يتطلب تدخل يدوي"
            });
            continue;
          }
        }
        needsUpdate = true;
      }

      // التحقق من عدم وجود تعارض (إيميل أو جوال مستخدم من قبل)
      if (needsUpdate) {
        // التحقق من الإيميل
        if (updates.email) {
          const existingEmail = await db.select().from(users).where(eq(users.email, updates.email));
          if (existingEmail.length > 0 && existingEmail[0].id !== user.id) {
            // الإيميل مستخدم - إنشاء إيميل فريد
            const phoneForEmail = normalizePhone(updates.phone || user.phone || "");
            updates.email = generateTempEmail(phoneForEmail, user.id);
            userFixes.push(`تم تغيير الإيميل لتجنب التعارض: "${updates.email}"`);
          }
        }

        // التحقق من رقم الجوال
        if (updates.phone) {
          const existingPhone = await db.select().from(users).where(eq(users.phone, updates.phone));
          if (existingPhone.length > 0 && existingPhone[0].id !== user.id) {
            // رقم الجوال مستخدم - تخطيه
            userIssues.push(`رقم الجوال مستخدم من قبل مستخدم آخر`);
            errorCount++;
            issues.push({
              id: user.id,
              name: user.name,
              issue: userIssues.join(", "),
              fix: "يتطلب تدخل يدوي - رقم الجوال مستخدم"
            });
            continue;
          }
        }

        // تحديث البيانات
        try {
          await db.update(users)
            .set(updates)
            .where(eq(users.id, user.id));
          
          fixedCount++;
          console.log(`✅ تم إصلاح المستخدم: ${user.name} (${user.id})`);
          if (userFixes.length > 0) {
            console.log(`   الإصلاحات: ${userFixes.join(", ")}`);
          }
        } catch (error: any) {
          console.error(`❌ خطأ في تحديث المستخدم ${user.name}:`, error.message);
          errorCount++;
          issues.push({
            id: user.id,
            name: user.name,
            issue: userIssues.join(", "),
            fix: `خطأ: ${error.message}`
          });
        }
      }
    }

    console.log(`\n📈 ملخص التنظيف:`);
    console.log(`   ✅ تم إصلاح: ${fixedCount} مستخدم`);
    console.log(`   ❌ أخطاء: ${errorCount} مستخدم`);
    console.log(`   📊 إجمالي: ${allUsers.length} مستخدم\n`);

    if (issues.length > 0) {
      console.log(`⚠️  المستخدمون الذين يحتاجون تدخل يدوي:\n`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name} (${issue.id})`);
        console.log(`   المشكلة: ${issue.issue}`);
        console.log(`   الحل: ${issue.fix}\n`);
      });
    }

    console.log("✨ اكتمل التنظيف!");
  } catch (error: any) {
    console.error("❌ خطأ في التنظيف:", error);
    throw error;
  }
}

// تشغيل الـ script
if (require.main === module) {
  cleanupUsers()
    .then(() => {
      console.log("\n✅ تم التنظيف بنجاح!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ فشل التنظيف:", error);
      process.exit(1);
    });
}

export { cleanupUsers };


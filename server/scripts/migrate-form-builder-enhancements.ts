import "dotenv/config";
import { db } from "../db";
import { formConfigs, formFieldConfigs } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Migration script for Form Builder enhancements
 * - Adds submissionEndpoint, submissionHandler, embeddingConfig to formConfigs
 * - Ensures form_field_configs table exists (should be created via schema push)
 * - Updates existing forms with default submission handlers
 */
async function migrateFormBuilderEnhancements() {
  console.log("🚀 بدء ترحيل تحسينات Form Builder...");

  try {
    // 1. Update existing form configs with submission handlers
    const existingConfigs = await db.select().from(formConfigs);
    
    for (const config of existingConfigs) {
      const updates: any = {};
      
      // Set submission handler based on form type
      if (!config.submissionHandler) {
        if (config.formType === "buyer") {
          updates.submissionHandler = "buyer";
          updates.submissionEndpoint = "/api/buyers/register";
        } else if (config.formType === "seller") {
          updates.submissionHandler = "seller";
          updates.submissionEndpoint = "/api/sellers/register";
        } else if (config.formType === "investor") {
          updates.submissionHandler = "custom";
          updates.submissionEndpoint = "/api/investors/register";
        }
      }
      
      // Set default embedding config if not exists
      if (!config.embeddingConfig) {
        updates.embeddingConfig = {
          pages: [],
          shortcode: `[form:${config.name}]`,
          componentName: `FormRenderer`,
        };
      }
      
      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await db
          .update(formConfigs)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(sql`${formConfigs.id} = ${config.id}`);
        
        console.log(`✅ تم تحديث ${config.displayName} (${config.name})`);
      }
    }

    // 2. Verify form_field_configs table exists (it should be created via schema push)
    // This is just a check - the table should already exist from schema.ts
    try {
      await db.select().from(formFieldConfigs).limit(1);
      console.log("✅ جدول form_field_configs موجود");
    } catch (error: any) {
      console.warn("⚠️ جدول form_field_configs غير موجود - تأكد من تشغيل npm run db:push");
    }

    console.log("🎉 اكتمل الترحيل بنجاح!");
  } catch (error: any) {
    console.error("❌ خطأ في الترحيل:", error);
    throw error;
  }
}

// تشغيل الترحيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  migrateFormBuilderEnhancements()
    .then(() => {
      console.log("✅ اكتمل الترحيل");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ فشل الترحيل:", error);
      process.exit(1);
    });
}

export { migrateFormBuilderEnhancements };




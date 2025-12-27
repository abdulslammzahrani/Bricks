import {
  formConfigs,
  formSteps,
  formFields,
  fieldOptions,
  formFieldConfigs,
  smartTags,
  type FormConfig,
  type InsertFormConfig,
  type FormStep,
  type InsertFormStep,
  type FormField,
  type InsertFormField,
  type FieldOption,
  type InsertFieldOption,
  type FormFieldConfig,
  type InsertFormFieldConfig,
  type SmartTag,
  type InsertSmartTag,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc, sql } from "drizzle-orm";

// ==================== FORM CONFIGS ====================

export async function getAllFormConfigs(): Promise<FormConfig[]> {
  try {
    // محاولة جلب البيانات مع الحقول الجديدة
    return await db.select().from(formConfigs).orderBy(asc(formConfigs.formType));
  } catch (error: any) {
    // إذا فشل بسبب عدم وجود الحقول الجديدة، جلب البيانات بدونها
    if (error.message?.includes("submission_endpoint") || error.message?.includes("submission_handler") || error.message?.includes("embedding_config")) {
      console.warn("⚠️ Form configs table missing new columns, fetching without them:", error.message);
      try {
        // جلب البيانات بدون الحقول الجديدة باستخدام raw SQL
        const result = await db.execute(sql`
          SELECT 
            id, name, form_type, display_name, description, is_active, created_at, updated_at,
            NULL::text as submission_endpoint,
            NULL::text as submission_handler,
            NULL::jsonb as embedding_config
          FROM form_configs
          ORDER BY form_type ASC
        `);
        
        return result.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          formType: row.form_type,
          displayName: row.display_name,
          description: row.description,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          submissionEndpoint: null,
          submissionHandler: null,
          embeddingConfig: null,
        })) as FormConfig[];
      } catch (sqlError: any) {
        console.error("Error fetching form configs with fallback:", sqlError);
        // إذا فشل أيضاً، أرجع array فارغ
        return [];
      }
    }
    throw error;
  }
}

export async function getFormConfigById(id: string): Promise<FormConfig | undefined> {
  try {
    const result = await db.select().from(formConfigs).where(eq(formConfigs.id, id)).limit(1);
    return result[0];
  } catch (error: any) {
    if (error.message?.includes("submission_endpoint") || error.message?.includes("submission_handler") || error.message?.includes("embedding_config")) {
      console.warn("⚠️ Form configs table missing new columns, fetching without them:", error.message);
      try {
        const result = await db.execute(sql`
          SELECT 
            id, name, form_type, display_name, description, is_active, created_at, updated_at,
            NULL::text as submission_endpoint,
            NULL::text as submission_handler,
            NULL::jsonb as embedding_config
          FROM form_configs
          WHERE id = ${id}
          LIMIT 1
        `);
        if (result.rows.length === 0) return undefined;
        const row: any = result.rows[0];
        return {
          id: row.id,
          name: row.name,
          formType: row.form_type,
          displayName: row.display_name,
          description: row.description,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          submissionEndpoint: null,
          submissionHandler: null,
          embeddingConfig: null,
        } as FormConfig;
      } catch (sqlError: any) {
        console.error("Error fetching form config by id with fallback:", sqlError);
        return undefined;
      }
    }
    throw error;
  }
}

export async function getFormConfigByName(name: string): Promise<FormConfig | undefined> {
  try {
    const result = await db.select().from(formConfigs).where(eq(formConfigs.name, name)).limit(1);
    return result[0];
  } catch (error: any) {
    if (error.message?.includes("submission_endpoint") || error.message?.includes("submission_handler") || error.message?.includes("embedding_config")) {
      console.warn("⚠️ Form configs table missing new columns, fetching without them:", error.message);
      try {
        const result = await db.execute(sql`
          SELECT 
            id, name, form_type, display_name, description, is_active, created_at, updated_at,
            NULL::text as submission_endpoint,
            NULL::text as submission_handler,
            NULL::jsonb as embedding_config
          FROM form_configs
          WHERE name = ${name}
          LIMIT 1
        `);
        if (result.rows.length === 0) return undefined;
        const row: any = result.rows[0];
        return {
          id: row.id,
          name: row.name,
          formType: row.form_type,
          displayName: row.display_name,
          description: row.description,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          submissionEndpoint: null,
          submissionHandler: null,
          embeddingConfig: null,
        } as FormConfig;
      } catch (sqlError: any) {
        console.error("Error fetching form config by name with fallback:", sqlError);
        return undefined;
      }
    }
    throw error;
  }
}

export async function createFormConfig(config: InsertFormConfig): Promise<FormConfig> {
  const result = await db.insert(formConfigs).values(config).returning();
  return result[0];
}

export async function updateFormConfig(
  id: string,
  data: Partial<InsertFormConfig>
): Promise<FormConfig | undefined> {
  const result = await db
    .update(formConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(formConfigs.id, id))
    .returning();
  return result[0];
}

export async function deleteFormConfig(id: string): Promise<void> {
  await db.delete(formConfigs).where(eq(formConfigs.id, id));
}

// ==================== FORM STEPS ====================

export async function getStepsByFormId(formId: string): Promise<FormStep[]> {
  return await db
    .select()
    .from(formSteps)
    .where(eq(formSteps.formId, formId))
    .orderBy(asc(formSteps.order));
}

export async function getStepById(id: string): Promise<FormStep | undefined> {
  const result = await db.select().from(formSteps).where(eq(formSteps.id, id)).limit(1);
  return result[0];
}

export async function createStep(step: InsertFormStep): Promise<FormStep> {
  const result = await db.insert(formSteps).values(step).returning();
  return result[0];
}

export async function updateStep(
  id: string,
  data: Partial<InsertFormStep>
): Promise<FormStep | undefined> {
  const result = await db
    .update(formSteps)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(formSteps.id, id))
    .returning();
  return result[0];
}

export async function deleteStep(id: string): Promise<void> {
  await db.delete(formSteps).where(eq(formSteps.id, id));
}

export async function reorderSteps(stepIds: string[]): Promise<void> {
  // Update order for each step based on its position in the array
  for (let i = 0; i < stepIds.length; i++) {
    await db
      .update(formSteps)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(formSteps.id, stepIds[i]));
  }
}

// ==================== FORM FIELDS ====================

export async function getFieldsByStepId(stepId: string): Promise<FormField[]> {
  return await db
    .select()
    .from(formFields)
    .where(eq(formFields.stepId, stepId))
    .orderBy(asc(formFields.order));
}

export async function getFieldById(id: string): Promise<FormField | undefined> {
  const result = await db.select().from(formFields).where(eq(formFields.id, id)).limit(1);
  return result[0];
}

export async function createField(field: InsertFormField): Promise<FormField> {
  const result = await db.insert(formFields).values(field).returning();
  return result[0];
}

export async function updateField(
  id: string,
  data: Partial<InsertFormField>
): Promise<FormField | undefined> {
  const result = await db
    .update(formFields)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(formFields.id, id))
    .returning();
  return result[0];
}

export async function deleteField(id: string): Promise<void> {
  await db.delete(formFields).where(eq(formFields.id, id));
}

// ==================== FIELD OPTIONS ====================

export async function getOptionsByFieldId(fieldId: string): Promise<FieldOption[]> {
  return await db
    .select()
    .from(fieldOptions)
    .where(eq(fieldOptions.fieldId, fieldId))
    .orderBy(asc(fieldOptions.order));
}

export async function getOptionById(id: string): Promise<FieldOption | undefined> {
  const result = await db.select().from(fieldOptions).where(eq(fieldOptions.id, id)).limit(1);
  return result[0];
}

export async function createOption(option: InsertFieldOption): Promise<FieldOption> {
  const result = await db.insert(fieldOptions).values(option).returning();
  return result[0];
}

export async function updateOption(
  id: string,
  data: Partial<InsertFieldOption>
): Promise<FieldOption | undefined> {
  const result = await db
    .update(fieldOptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(fieldOptions.id, id))
    .returning();
  return result[0];
}

export async function deleteOption(id: string): Promise<void> {
  await db.delete(fieldOptions).where(eq(fieldOptions.id, id));
}

// ==================== COMPLETE FORM STRUCTURE ====================

export interface CompleteFormConfig {
  config: FormConfig;
  steps: Array<{
    step: FormStep;
    fields: Array<{
      field: FormField;
      options: FieldOption[];
    }>;
  }>;
}

export async function getCompleteFormConfig(
  formNameOrType: string
): Promise<CompleteFormConfig | undefined> {
  // Try to find by name first
  let config = await getFormConfigByName(formNameOrType);
  // If not found, try to find by formType
  if (!config) {
    try {
      const result = await db.select().from(formConfigs).where(eq(formConfigs.formType, formNameOrType)).limit(1);
      config = result[0];
    } catch (error: any) {
      if (error.message?.includes("submission_endpoint") || error.message?.includes("submission_handler") || error.message?.includes("embedding_config")) {
        console.warn("⚠️ Form configs table missing new columns, fetching without them:", error.message);
        try {
          const result = await db.execute(sql`
            SELECT 
              id, name, form_type, display_name, description, is_active, created_at, updated_at,
              NULL::text as submission_endpoint,
              NULL::text as submission_handler,
              NULL::jsonb as embedding_config
            FROM form_configs
            WHERE form_type = ${formNameOrType}
            LIMIT 1
          `);
          if (result.rows.length > 0) {
            const row: any = result.rows[0];
            config = {
              id: row.id,
              name: row.name,
              formType: row.form_type,
              displayName: row.display_name,
              description: row.description,
              isActive: row.is_active,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              submissionEndpoint: null,
              submissionHandler: null,
              embeddingConfig: null,
            } as FormConfig;
          }
        } catch (sqlError: any) {
          console.error("Error fetching form config by type with fallback:", sqlError);
        }
      } else {
        throw error;
      }
    }
  }
  if (!config) return undefined;

  const steps = await getStepsByFormId(config.id);
  const stepsWithFields = await Promise.all(
    steps.map(async (step) => {
      const fields = await getFieldsByStepId(step.id);
      const fieldsWithOptions = await Promise.all(
        fields.map(async (field) => {
          const options = await getOptionsByFieldId(field.id);
          return { field, options };
        })
      );
      return { step, fields: fieldsWithOptions };
    })
  );

  return { config, steps: stepsWithFields };
}

// ==================== FORM FIELD CONFIGS ====================

export async function getFormFieldConfigs(fieldId: string): Promise<FormFieldConfig[]> {
  return await db
    .select()
    .from(formFieldConfigs)
    .where(eq(formFieldConfigs.fieldId, fieldId))
    .orderBy(asc(formFieldConfigs.createdAt));
}

export async function getFormFieldConfigById(id: string): Promise<FormFieldConfig | undefined> {
  const result = await db.select().from(formFieldConfigs).where(eq(formFieldConfigs.id, id)).limit(1);
  return result[0];
}

export async function createFormFieldConfig(config: InsertFormFieldConfig): Promise<FormFieldConfig> {
  const result = await db.insert(formFieldConfigs).values(config).returning();
  return result[0];
}

export async function updateFormFieldConfig(
  id: string,
  data: Partial<InsertFormFieldConfig>
): Promise<FormFieldConfig | undefined> {
  const result = await db
    .update(formFieldConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(formFieldConfigs.id, id))
    .returning();
  return result[0];
}

export async function deleteFormFieldConfig(id: string): Promise<void> {
  await db.delete(formFieldConfigs).where(eq(formFieldConfigs.id, id));
}

// ==================== SMART TAGS ====================

export async function getAllSmartTags(propertyType?: string): Promise<SmartTag[]> {
  if (propertyType) {
    return await db
      .select()
      .from(smartTags)
      .where(eq(smartTags.propertyType, propertyType))
      .orderBy(asc(smartTags.order), asc(smartTags.tag));
  }
  return await db
    .select()
    .from(smartTags)
    .orderBy(asc(smartTags.propertyType), asc(smartTags.order), asc(smartTags.tag));
}

export async function getSmartTagById(id: string): Promise<SmartTag | undefined> {
  const result = await db.select().from(smartTags).where(eq(smartTags.id, id)).limit(1);
  return result[0];
}

export async function createSmartTag(tag: InsertSmartTag): Promise<SmartTag> {
  const result = await db.insert(smartTags).values(tag).returning();
  return result[0];
}

export async function updateSmartTag(
  id: string,
  data: Partial<InsertSmartTag>
): Promise<SmartTag | undefined> {
  const result = await db
    .update(smartTags)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(smartTags.id, id))
    .returning();
  return result[0];
}

export async function deleteSmartTag(id: string): Promise<void> {
  await db.delete(smartTags).where(eq(smartTags.id, id));
}

export async function reorderSmartTags(tagIds: string[]): Promise<void> {
  for (let i = 0; i < tagIds.length; i++) {
    await db
      .update(smartTags)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(smartTags.id, tagIds[i]));
  }
}


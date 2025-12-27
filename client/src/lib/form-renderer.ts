import type { CompleteFormConfig } from "@/components/admin/FormBuilder/types";
import type { FormField, FieldOption } from "@shared/schema";

export interface FormFieldValue {
  [key: string]: any;
}

/**
 * يحول إعدادات النموذج الديناميكية إلى قيم افتراضية
 */
export function getDefaultFormValues(formConfig: CompleteFormConfig): FormFieldValue {
  const values: FormFieldValue = {};

  formConfig.steps.forEach(({ fields }) => {
    fields.forEach(({ field }) => {
      if (field.defaultValue) {
        values[field.name] = field.defaultValue;
      } else if (field.type === "multi_select" || field.type === "chips") {
        values[field.name] = [];
      } else if (field.type === "select") {
        values[field.name] = "";
      } else {
        values[field.name] = "";
      }
    });
  });

  return values;
}

/**
 * يحصل على التاقات المتاحة حسب نوع العقار
 */
export function getTagsForPropertyType(
  formConfig: CompleteFormConfig,
  propertyType: string
): FieldOption[] {
  const tagsField = formConfig.steps
    .flatMap((s) => s.fields)
    .find((f) => f.field.name === "smartTags" && f.field.type === "chips");

  if (!tagsField) return [];

  // يمكن إضافة منطق تصفية حسب نوع العقار هنا
  return tagsField.options;
}

/**
 * يحصل على خيارات حقل معين
 */
export function getFieldOptions(
  formConfig: CompleteFormConfig,
  fieldName: string
): FieldOption[] {
  const field = formConfig.steps
    .flatMap((s) => s.fields)
    .find((f) => f.field.name === fieldName);

  return field?.options || [];
}

/**
 * يتحقق من صحة القيم بناءً على قواعد التحقق
 */
export function validateFormValues(
  formConfig: CompleteFormConfig,
  values: FormFieldValue
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  formConfig.steps.forEach(({ fields }) => {
    fields.forEach(({ field }) => {
      if (field.required && !values[field.name]) {
        errors[field.name] = `${field.label} مطلوب`;
      }

      if (field.validation) {
        const validation = field.validation as any;
        const value = values[field.name];

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



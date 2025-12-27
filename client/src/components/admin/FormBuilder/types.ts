import type { FormConfig, FormStep, FormField, FieldOption } from "@shared/schema";

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

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "chips"
  | "range"
  | "city_picker"
  | "district_picker"
  | "property_type_picker"
  | "smart_tags_picker"
  | "location_map"
  | "date";

export interface FormBuilderState {
  selectedForm: FormConfig | null;
  selectedStep: FormStep | null;
  selectedField: FormField | null;
  formConfig: CompleteFormConfig | null;
  isDirty: boolean;
}


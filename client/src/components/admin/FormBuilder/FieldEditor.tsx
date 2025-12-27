import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, Plus } from "lucide-react";
import OptionsManager from "./OptionsManager";
import ConditionBuilder from "./ConditionBuilder";
import FormFieldConfigEditor from "./FormFieldConfigEditor";
import type { FieldType } from "./types";
import type { FormField, FieldOption } from "@shared/schema";

interface FieldEditorProps {
  stepId: string;
  fieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "number", label: "رقم" },
  { value: "select", label: "اختيار واحد" },
  { value: "multi_select", label: "اختيار متعدد" },
  { value: "chips", label: "أزرار (Chips)" },
  { value: "range", label: "نطاق" },
  { value: "city_picker", label: "اختيار المدينة" },
  { value: "district_picker", label: "اختيار الأحياء" },
  { value: "property_type_picker", label: "اختيار نوع العقار" },
  { value: "smart_tags_picker", label: "الوسوم الذكية" },
  { value: "location_map", label: "خريطة الموقع" },
  { value: "date", label: "تاريخ" },
];

export default function FieldEditor({
  stepId,
  fieldId,
  onFieldSelect,
}: FieldEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(!fieldId);
  const [formData, setFormData] = useState<Partial<FormField>>({
    stepId,
    name: "",
    label: "",
    type: "text",
    required: false,
    order: 0,
  });

  // Fetch fields for this step
  const { data: fields, isLoading: isLoadingFields } = useQuery<FormField[]>({
    queryKey: ["form-builder-fields", stepId],
    queryFn: async () => {
      if (!stepId) return [];
      const res = await apiRequest("GET", `/api/admin/form-builder/fields/${stepId}`);
      return await res.json();
    },
    enabled: !!stepId,
  });

  // Fetch selected field
  const { data: selectedField, isLoading: isLoadingField } = useQuery<FormField>({
    queryKey: ["form-builder-field", fieldId],
    queryFn: async () => {
      if (!fieldId) return null;
      const res = await apiRequest("GET", `/api/admin/form-builder/fields/${fieldId}`);
      return await res.json();
    },
    enabled: !!fieldId && !isCreating,
  });

  useEffect(() => {
    if (fieldId && selectedField) {
      setFormData(selectedField);
      setIsCreating(false);
    } else if (!fieldId && fields) {
      // Set order for new field
      const maxOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.order)) : 0;
      setFormData({
        stepId,
        name: "",
        label: "",
        type: "text",
        required: false,
        order: maxOrder + 1,
      });
      setIsCreating(true);
    }
  }, [selectedField, fieldId, fields, stepId]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<FormField>) => {
      const res = await apiRequest("POST", "/api/admin/form-builder/fields", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحفظ",
        description: "تم إنشاء الحقل بنجاح",
      });
      setIsCreating(false);
      onFieldSelect(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الحقل",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<FormField>) => {
      if (!fieldId) return;
      const res = await apiRequest("PUT", `/api/admin/form-builder/fields/${fieldId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-field", fieldId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الحقل بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الحقل",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!fieldId) return;
      await apiRequest("DELETE", `/api/admin/form-builder/fields/${fieldId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الحقل بنجاح",
      });
      onFieldSelect(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الحقل",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Validation
    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الحقل (Key)",
        variant: "destructive",
      });
      return;
    }

    if (!formData.label || formData.label.trim() === "") {
      toast({
        title: "خطأ",
        description: "يجب إدخال التسمية",
        variant: "destructive",
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: "خطأ",
        description: "يجب اختيار نوع الحقل",
        variant: "destructive",
      });
      return;
    }

    if (!formData.stepId) {
      toast({
        title: "خطأ",
        description: "معرف الخطوة غير موجود",
        variant: "destructive",
      });
      return;
    }

    // Validate name format (should be camelCase or snake_case)
    const namePattern = /^[a-z][a-z0-9_]*$/i;
    if (!namePattern.test(formData.name)) {
      toast({
        title: "خطأ",
        description: "اسم الحقل يجب أن يبدأ بحرف ويمكن أن يحتوي على أرقام وشرطة سفلية فقط",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const needsOptions = ["select", "multi_select", "chips"].includes(formData.type || "");
  const isSpecialField = ["city_picker", "district_picker", "property_type_picker", "smart_tags_picker", "location_map"].includes(formData.type || "");

  if (isLoadingFields || (isLoadingField && fieldId)) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>
            {isCreating ? "إضافة حقل جديد" : "تعديل الحقل"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-sm">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          {isCreating ? "إضافة حقل جديد" : "تعديل الحقل"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <Label>اسم الحقل (Key)</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="propertyType"
            />
          </div>

          <div>
            <Label>التسمية</Label>
            <Input
              value={formData.label || ""}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="نوع العقار"
            />
          </div>

          <div>
            <Label>النوع</Label>
            <Select
              value={formData.type || "text"}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as FieldType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>النص المساعد (Placeholder)</Label>
            <Input
              value={formData.placeholder || ""}
              onChange={(e) =>
                setFormData({ ...formData, placeholder: e.target.value })
              }
              placeholder="اختر نوع العقار..."
            />
          </div>

          <div>
            <Label>النص التوضيحي (Help Text)</Label>
            <Textarea
              value={formData.helpText || ""}
              onChange={(e) =>
                setFormData({ ...formData, helpText: e.target.value })
              }
              placeholder="نص توضيحي يظهر أسفل الحقل"
              rows={2}
            />
          </div>

          {(formData.type === "text" || formData.type === "number") && (
            <div>
              <Label>القيمة الافتراضية</Label>
              <Input
                value={formData.defaultValue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, defaultValue: e.target.value })
                }
                placeholder="القيمة الافتراضية"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>إلزامي</Label>
            <Switch
              checked={formData.required || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, required: checked })
              }
            />
          </div>

          {needsOptions && (
            <div>
              {fieldId ? (
                <OptionsManager fieldId={fieldId} fieldType={formData.type as FieldType} />
              ) : (
                <div className="p-4 border rounded-lg bg-muted/50 text-sm text-muted-foreground text-center">
                  احفظ الحقل أولاً لإضافة الخيارات
                </div>
              )}
            </div>
          )}

          {fields && fields.length > 0 && (
            <ConditionBuilder
              fields={fields.filter((f) => f.id !== fieldId)}
              condition={formData.showCondition as any}
              onChange={(condition) =>
                setFormData({ ...formData, showCondition: condition })
              }
            />
          )}

          {/* Advanced Settings for Special Fields */}
          {isSpecialField && fieldId && (
            <div className="mt-4">
              <FormFieldConfigEditor fieldId={fieldId} fieldType={formData.type || "text"} />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            حفظ
          </Button>
          {!isCreating && (
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


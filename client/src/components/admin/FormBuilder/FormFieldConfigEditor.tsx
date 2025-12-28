import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, Plus } from "lucide-react";
import type { FormFieldConfig } from "@shared/schema";

interface FormFieldConfigEditorProps {
  fieldId: string;
  fieldType: string;
  onClose?: () => void;
}

const CONFIG_TYPES = [
  { value: "city_picker", label: "اختيار المدينة" },
  { value: "district_picker", label: "اختيار الأحياء" },
  { value: "property_type_picker", label: "اختيار نوع العقار" },
  { value: "smart_tags_picker", label: "الوسوم الذكية" },
  { value: "location_map", label: "خريطة الموقع" },
  { value: "custom", label: "مخصص" },
];

export default function FormFieldConfigEditor({
  fieldId,
  fieldType,
  onClose,
}: FormFieldConfigEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<FormFieldConfig[]>([]);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    configType: string;
    configData: Record<string, any>;
    isActive: boolean;
  }>({
    configType: fieldType === "city_picker" ? "city_picker" : fieldType === "district_picker" ? "district_picker" : fieldType === "property_type_picker" ? "property_type_picker" : fieldType === "smart_tags_picker" ? "smart_tags_picker" : fieldType === "location_map" ? "location_map" : "custom",
    configData: {},
    isActive: true,
  });

  // Fetch existing configs for this field
  const { data: existingConfigs = [], isLoading } = useQuery<FormFieldConfig[]>({
    queryKey: ["form-field-configs", fieldId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/form-builder/fields/${fieldId}/configs`);
      return await res.json();
    },
    enabled: !!fieldId,
  });

  useEffect(() => {
    setConfigs(existingConfigs);
  }, [existingConfigs]);

  // Create/Update config mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { configType: string; configData: Record<string, any>; isActive: boolean }) => {
      if (editingConfigId) {
        const res = await apiRequest("PUT", `/api/admin/form-builder/fields/configs/${editingConfigId}`, {
          body: JSON.stringify(data),
        });
        return await res.json();
      } else {
        const res = await apiRequest("POST", `/api/admin/form-builder/fields/${fieldId}/configs`, {
          body: JSON.stringify(data),
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-field-configs", fieldId] });
      toast({
        title: "تم الحفظ",
        description: editingConfigId ? "تم تحديث الإعدادات" : "تم إنشاء الإعدادات",
      });
      setEditingConfigId(null);
      setFormData({
        configType: formData.configType,
        configData: {},
        isActive: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  // Delete config mutation
  const deleteMutation = useMutation({
    mutationFn: async (configId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/form-builder/fields/configs/${configId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-field-configs", fieldId] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الإعدادات",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الإعدادات",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (config: FormFieldConfig) => {
    setEditingConfigId(config.id);
    setFormData({
      configType: config.configType,
      configData: (config.configData as Record<string, any>) || {},
      isActive: config.isActive,
    });
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const renderConfigFields = () => {
    switch (formData.configType) {
      case "city_picker":
        return (
          <div className="space-y-4">
            <div>
              <Label>المدن المتاحة (اختياري)</Label>
              <Textarea
                value={formData.configData.allowedCities?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      allowedCities: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="الرياض، جدة، الدمام (مفصولة بفواصل)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                اتركه فارغاً لعرض جميع المدن
              </p>
            </div>
          </div>
        );

      case "property_type_picker":
        return (
          <div className="space-y-4">
            <div>
              <Label>أنواع العقارات المتاحة (اختياري)</Label>
              <Textarea
                value={formData.configData.allowedTypes?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      allowedTypes: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="villa، apartment، tower (مفصولة بفواصل)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                اتركه فارغاً لعرض جميع الأنواع
              </p>
            </div>
          </div>
        );

      case "smart_tags_picker":
        return (
          <div className="space-y-4">
            <div>
              <Label>الوسوم المتاحة (اختياري)</Label>
              <Textarea
                value={formData.configData.allowedTags?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      allowedTags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="مسبح، مصعد، موقف (مفصولة بفواصل)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                اتركه فارغاً لعرض جميع الوسوم
              </p>
            </div>
          </div>
        );

      case "location_map":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>عرض الخريطة التفاعلية</Label>
              <Switch
                checked={formData.configData.showInteractiveMap !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      showInteractiveMap: checked,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>السماح باختيار الموقع يدوياً</Label>
              <Switch
                checked={formData.configData.allowManualInput !== false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      allowManualInput: checked,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>المكان الافتراضي (خط العرض)</Label>
              <Input
                type="number"
                step="any"
                value={formData.configData.defaultLatitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      defaultLatitude: e.target.value ? parseFloat(e.target.value) : null,
                    },
                  })
                }
                placeholder="24.7136"
              />
            </div>
            <div>
              <Label>المكان الافتراضي (خط الطول)</Label>
              <Input
                type="number"
                step="any"
                value={formData.configData.defaultLongitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configData: {
                      ...formData.configData,
                      defaultLongitude: e.target.value ? parseFloat(e.target.value) : null,
                    },
                  })
                }
                placeholder="46.6753"
              />
            </div>
          </div>
        );

      case "custom":
        return (
          <div className="space-y-4">
            <div>
              <Label>بيانات الإعدادات المخصصة (JSON)</Label>
              <Textarea
                value={JSON.stringify(formData.configData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({
                      ...formData,
                      configData: parsed,
                    });
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الحقل الخاصة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Configs */}
        {configs.length > 0 && (
          <div>
            <Label className="mb-2 block">الإعدادات الموجودة</Label>
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{CONFIG_TYPES.find((t) => t.value === config.configType)?.label || config.configType}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.isActive ? "نشط" : "غير نشط"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label>نوع الإعدادات</Label>
            <Select
              value={formData.configType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  configType: value,
                  configData: {},
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONFIG_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderConfigFields()}

          <div className="flex items-center justify-between">
            <Label>نشط</Label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {editingConfigId ? "تحديث" : "إنشاء"}
            </Button>
            {editingConfigId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingConfigId(null);
                  setFormData({
                    configType: formData.configType,
                    configData: {},
                    isActive: true,
                  });
                }}
              >
                إلغاء
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




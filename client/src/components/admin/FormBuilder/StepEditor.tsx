import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, X } from "lucide-react";
import * as icons from "lucide-react";
import type { FormStep, InsertFormStep } from "@shared/schema";

interface StepEditorProps {
  formId: string;
  step: FormStep | null;
  onClose: () => void;
  onSave: () => void;
}

// قائمة الأيقونات المتاحة
const AVAILABLE_ICONS = [
  "User",
  "MapPin",
  "Home",
  "Building2",
  "Ruler",
  "Wallet",
  "CreditCard",
  "Sparkles",
  "Settings",
  "FileText",
  "CheckCircle",
  "Calendar",
  "Clock",
  "Search",
  "Filter",
  "Tag",
  "Star",
  "Heart",
  "ShoppingBag",
  "Briefcase",
];

export default function StepEditor({
  formId,
  step,
  onClose,
  onSave,
}: StepEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InsertFormStep>>({
    formId,
    title: "",
    description: "",
    icon: "FileText",
    order: 1,
    isRequired: true,
    isActive: true,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch steps to get max order for new step
  const { data: steps, isLoading: isLoadingSteps } = useQuery<FormStep[]>({
    queryKey: ["form-builder-steps", formId],
    queryFn: async () => {
      if (!formId) return [];
      const res = await apiRequest("GET", `/api/admin/form-builder/steps/${formId}`);
      return await res.json();
    },
    enabled: !step && !!formId,
  });

  useEffect(() => {
    if (step) {
      setFormData({
        formId: step.formId,
        title: step.title,
        description: step.description || "",
        icon: step.icon || "FileText",
        order: step.order,
        isRequired: step.isRequired,
        isActive: step.isActive,
      });
    } else if (steps) {
      // Get max order for new step
      const maxOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) : 0;
      setFormData({
        formId,
        title: "",
        description: "",
        icon: "FileText",
        order: maxOrder + 1,
        isRequired: true,
        isActive: true,
      });
    }
  }, [step, formId, steps]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertFormStep>) => {
      const res = await apiRequest("POST", "/api/admin/form-builder/steps", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-steps", formId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحفظ",
        description: "تم إنشاء الخطوة بنجاح",
      });
      onSave();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الخطوة",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertFormStep>) => {
      if (!step) return;
      const res = await apiRequest("PUT", `/api/admin/form-builder/steps/${step.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-steps", formId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الخطوة بنجاح",
      });
      onSave();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الخطوة",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!step) return;
      await apiRequest("DELETE", `/api/admin/form-builder/steps/${step.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-steps", formId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الخطوة بنجاح",
      });
      onSave();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الخطوة",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.title) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان الخطوة",
        variant: "destructive",
      });
      return;
    }

    if (step) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const IconComponent = icons[formData.icon as keyof typeof icons] || icons.FileText;

  if (isLoadingSteps && !step) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{step ? "تعديل الخطوة" : "إضافة خطوة جديدة"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-4 flex-1">
            <div>
              <Label>العنوان *</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: المعلومات الشخصية"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف مختصر للخطوة"
                rows={2}
              />
            </div>

            <div>
              <Label>الأيقونة</Label>
              <Select
                value={formData.icon || "FileText"}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const Icon = icons[iconName as keyof typeof icons];
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-4 h-4" />}
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الترتيب</Label>
              <Input
                type="number"
                value={formData.order || 1}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                }
                min={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>إلزامي</Label>
              <Switch
                checked={formData.isRequired || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRequired: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>نشط</Label>
              <Switch
                checked={formData.isActive !== false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              حفظ
            </Button>
            {step && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الخطوة؟ سيتم حذف جميع الحقول المرتبطة بها أيضاً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


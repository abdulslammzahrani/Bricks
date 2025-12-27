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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Eye, ChevronDown, ChevronRight, FileText as FileTextIcon, GripVertical, Edit2, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as icons from "lucide-react";
import DynamicFormRenderer from "./DynamicFormRenderer";
import OptionsManager from "./OptionsManager";
import FormEmbeddingManager from "./FormEmbeddingManager";
import FormPreviewComponent from "./FormPreview";
import SmartTagsManager from "./SmartTagsManager";
import LocationsManager from "./LocationsManager";
import type { CompleteFormConfig, FieldType } from "./types";
import type { FormConfig, FormStep, FormField, InsertFormStep, InsertFormField } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "number", label: "رقم" },
  { value: "select", label: "اختيار واحد" },
  { value: "multi_select", label: "اختيار متعدد" },
  { value: "chips", label: "أزرار" },
  { value: "range", label: "نطاق" },
  { value: "city_picker", label: "اختيار المدينة" },
  { value: "district_picker", label: "اختيار الأحياء" },
  { value: "property_type_picker", label: "اختيار نوع العقار" },
  { value: "smart_tags_picker", label: "الوسوم الذكية" },
  { value: "location_map", label: "خريطة الموقع" },
  { value: "date", label: "تاريخ" },
];

export default function UltraSimplifiedFormBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null); // للخطوة المختارة في المعاينة
  const [activeTab, setActiveTab] = useState<"builder" | "embedding" | "smart-tags" | "locations">("builder");
  // حفظ البيانات عند التعديل
  const [stepEditData, setStepEditData] = useState<Record<string, Partial<InsertFormStep>>>({});
  const [fieldEditData, setFieldEditData] = useState<Record<string, Partial<InsertFormField>>>({});
  // إدارة الفورمات
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [formDialogData, setFormDialogData] = useState({ displayName: "", description: "", formType: "buyer" as "buyer" | "seller" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all form configs
  const { data: configs, isLoading: isLoadingConfigs } = useQuery<FormConfig[]>({
    queryKey: ["form-builder-configs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/form-builder/configs");
      const data = await res.json();
      const configsArray = Array.isArray(data) ? data : [];
      console.log("Loaded form configs:", configsArray);
      return configsArray;
    },
    refetchOnWindowFocus: true,
  });

  // Fetch complete form config
  const { data: formConfig, isLoading, error } = useQuery<CompleteFormConfig>({
    queryKey: ["form-builder-config", selectedFormName],
    queryFn: async () => {
      if (!selectedFormName) return null;
      const res = await apiRequest("GET", `/api/form-builder/${selectedFormName}`);
      return await res.json();
    },
    enabled: !!selectedFormName,
  });

  // Mutations for form management
  const createFormMutation = useMutation({
    mutationFn: async (data: { displayName: string; description: string; formType: "buyer" | "seller" }) => {
      const name = data.formType === "buyer" ? "buyer_form" : "seller_form";
      const res = await apiRequest("POST", "/api/admin/form-builder/configs", {
        name,
        displayName: data.displayName,
        description: data.description,
        formType: data.formType,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({ title: "تم الإضافة", description: "تم إنشاء النموذج بنجاح" });
      setShowFormDialog(false);
      setFormDialogData({ displayName: "", description: "", formType: "buyer" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في إنشاء النموذج", variant: "destructive" });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { displayName: string; description: string } }) => {
      const res = await apiRequest("PUT", `/api/admin/form-builder/configs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
      toast({ title: "تم التحديث", description: "تم تحديث النموذج بنجاح" });
      setShowFormDialog(false);
      setEditingFormId(null);
      setFormDialogData({ displayName: "", description: "", formType: "buyer" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث النموذج", variant: "destructive" });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/form-builder/configs/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({ title: "تم الحذف", description: "تم حذف النموذج بنجاح" });
      setShowDeleteDialog(false);
      setFormToDelete(null);
      if (selectedFormName && formToDelete) {
        const remainingConfigs = configs?.filter(c => c.id !== formToDelete) || [];
        if (remainingConfigs.length > 0) {
          setSelectedFormName(remainingConfigs[0].name);
        } else {
          setSelectedFormName(null);
        }
      }
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حذف النموذج", variant: "destructive" });
    },
  });

  // Auto-select first form - prioritize seller_form if exists, otherwise buyer_form
  useEffect(() => {
    if (Array.isArray(configs) && configs.length > 0 && !selectedFormName) {
      // Try to find seller_form first
      const sellerForm = configs.find(c => c.name === "seller_form" || c.formType === "seller");
      if (sellerForm) {
        setSelectedFormName(sellerForm.name);
      } else {
        // Otherwise select the first form
        setSelectedFormName(configs[0].name);
      }
    }
  }, [configs, selectedFormName]);

  const selectedForm = Array.isArray(configs) ? configs.find((c) => c.name === selectedFormName) : undefined;

  // Handlers for form management
  const handleAddForm = () => {
    setEditingFormId(null);
    setFormDialogData({ displayName: "", description: "", formType: "buyer" });
    setShowFormDialog(true);
  };

  const handleEditForm = (form: FormConfig) => {
    setEditingFormId(form.id);
    setFormDialogData({ 
      displayName: form.displayName, 
      description: form.description || "", 
      formType: form.formType as "buyer" | "seller" 
    });
    setShowFormDialog(true);
  };

  const handleDeleteForm = (form: FormConfig) => {
    setFormToDelete(form.id);
    setShowDeleteDialog(true);
  };

  const handleSaveForm = () => {
    if (!formDialogData.displayName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم النموذج", variant: "destructive" });
      return;
    }
    if (editingFormId) {
      updateFormMutation.mutate({ id: editingFormId, data: { displayName: formDialogData.displayName, description: formDialogData.description } });
    } else {
      createFormMutation.mutate(formDialogData);
    }
  };

  const handleConfirmDelete = () => {
    if (formToDelete) {
      deleteFormMutation.mutate(formToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive font-semibold">حدث خطأ</p>
          <p className="text-muted-foreground text-sm mt-2">
            {error instanceof Error ? error.message : "فشل في تحميل النموذج"}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">اختر نموذجاً للبدء</p>
      </div>
    );
  }

  if (!formConfig || !formConfig.config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل النموذج...</p>
        </div>
      </div>
    );
  }

  // Step colors matching Figma design
  const stepColors = [
    { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-600" },
    { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" },
    { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
    { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
    { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
    { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-600" },
    { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600" },
    { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-600" },
  ];

  // Handle drag end for reordering steps
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !formConfig) {
      return;
    }

    const oldIndex = formConfig.steps.findIndex((s) => s.step.id === active.id);
    const newIndex = formConfig.steps.findIndex((s) => s.step.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update order in database
    const stepIds = arrayMove(formConfig.steps, oldIndex, newIndex).map((s) => s.step.id);
    try {
      const res = await apiRequest("PATCH", `/api/admin/form-builder/steps/reorder`, { stepIds });
      await res.json();
      queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
      toast({
        title: "تم التحديث",
        description: "تم تغيير ترتيب الخطوات بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الترتيب",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Main Container - Full width */}
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">بناء الفورمات</h1>
              <p className="text-sm text-muted-foreground mt-1">إدارة وتعديل جميع الفورمات</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedFormName || ""} onValueChange={setSelectedFormName}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="اختر النموذج" />
                </SelectTrigger>
                <SelectContent>
                  {configs && configs.length > 0 ? (
                    configs.map((config) => (
                      <SelectItem key={config.id} value={config.name}>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.formType === "buyer" ? "default" : "secondary"} className="text-xs">
                            {config.formType === "buyer" ? "مشتري" : "بائع"}
                          </Badge>
                          <span>{config.displayName || config.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">لا توجد فورمات</div>
                  )}
                </SelectContent>
              </Select>
              {selectedForm && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditForm(selectedForm)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      تعديل النموذج
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteForm(selectedForm)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف النموذج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAddForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة فورم
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "إخفاء المعاينة" : "إظهار المعاينة"}
            </Button>
          </div>
        </div>

        {/* Tabs for Builder and Embedding */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "embedding" | "smart-tags" | "locations")} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-fit mb-4">
            <TabsTrigger value="builder">بناء الفورم</TabsTrigger>
            <TabsTrigger value="embedding">التضمين والصفحات</TabsTrigger>
            <TabsTrigger value="smart-tags">إدارة التاقات</TabsTrigger>
            <TabsTrigger value="locations">إدارة المواقع</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="flex-1 min-h-0 flex flex-col mt-0">
            <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Main Content - Steps and Fields */}
              <Card className={`${showPreview ? "w-[45%]" : "w-full"} flex flex-col min-h-0`}>
            <CardContent className="p-6 flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {formConfig.steps && formConfig.steps.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formConfig.steps.map((s) => s.step.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Accordion 
                          type="multiple" 
                          value={expandedSteps}
                          onValueChange={setExpandedSteps}
                          className="w-full"
                        >
                          {formConfig.steps.map(({ step, fields }, index) => {
                            const color = stepColors[index % stepColors.length];
                            const IconComponent = step.icon
                              ? (icons[step.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>)
                              : FileTextIcon;
                            const isExpanded = expandedSteps.includes(step.id);
                            const isSelected = selectedStepId === step.id;
                            
                            return (
                              <SortableStepItem
                                key={step.id}
                                step={step}
                                fields={fields}
                                index={index}
                                color={color}
                                IconComponent={IconComponent}
                                isExpanded={isExpanded}
                                isSelected={isSelected}
                                editingStepId={editingStepId}
                                editingFieldId={editingFieldId}
                                stepEditData={stepEditData[step.id]}
                                fieldEditData={fieldEditData}
                                formId={formConfig.config.id}
                                onSelect={() => {
                                  setSelectedStepId(step.id);
                                  if (!expandedSteps.includes(step.id)) {
                                    setExpandedSteps([...expandedSteps, step.id]);
                                  }
                                }}
                                onEditStep={() => setEditingStepId(step.id)}
                                onCancelEdit={() => setEditingStepId(null)}
                                onEditField={(fieldId) => setEditingFieldId(fieldId)}
                                onCancelFieldEdit={() => setEditingFieldId(null)}
                                onStepChange={(data) => {
                                  if (data) {
                                    setStepEditData(prev => ({ ...prev, [step.id]: data }));
                                  }
                                  queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
                                  setEditingStepId(null);
                                  setEditingFieldId(null);
                                }}
                                onFieldChange={(fieldId, data) => {
                                  if (data) {
                                    setFieldEditData(prev => ({ ...prev, [fieldId]: data }));
                                  }
                                }}
                                onDelete={() => {
                                  queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
                                  if (selectedStepId === step.id) {
                                    setSelectedStepId(null);
                                  }
                                }}
                              />
                            );
                          })}
                        </Accordion>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>لا توجد خطوات في هذا النموذج</p>
                      <p className="text-sm mt-2">ابدأ بإضافة خطوة جديدة</p>
                    </div>
                  )}

                  {/* Add New Step */}
                  <div className="border-2 border-dashed rounded-lg p-3 mt-4">
                    {editingStepId === "new" ? (
                      <QuickStepEditor
                        formId={formConfig.config.id}
                        onSave={() => {
                          queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
                          setEditingStepId(null);
                          setNewStepTitle("");
                        }}
                        onCancel={() => {
                          setEditingStepId(null);
                          setNewStepTitle("");
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="اسم الخطوة الجديدة..."
                          value={newStepTitle}
                          onChange={(e) => setNewStepTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newStepTitle.trim()) {
                              setEditingStepId("new");
                            }
                          }}
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          className="h-9"
                          onClick={() => {
                            if (newStepTitle.trim()) {
                              setEditingStepId("new");
                            }
                          }}
                          disabled={!newStepTitle.trim()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة خطوة
                        </Button>
                      </div>
                    )}
                  </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

          {/* Preview */}
          {showPreview && (
            <div className="w-[55%] flex flex-col min-h-0 bg-gray-100/50 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center gap-2 text-xl font-bold mb-4 flex-shrink-0">
                <Eye className="w-5 h-5" />
                المعاينة
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <FormPreviewComponent formConfig={formConfig} selectedStepId={selectedStepId} />
              </div>
            </div>
          )}
            </div>
          </TabsContent>

          <TabsContent value="embedding" className="flex-1 min-h-0 flex flex-col mt-0">
            {selectedForm && formConfig ? (
              <FormEmbeddingManager 
                formConfig={selectedForm} 
                onUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
                  queryClient.invalidateQueries({ queryKey: ["form-builder-config", selectedFormName] });
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">يرجى اختيار نموذج أولاً</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="smart-tags" className="flex-1 min-h-0 flex flex-col mt-0">
            <SmartTagsManager />
          </TabsContent>

          <TabsContent value="locations" className="flex-1 min-h-0 flex flex-col mt-0">
            <LocationsManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Management Dialogs */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFormId ? "تعديل النموذج" : "إضافة نموذج جديد"}</DialogTitle>
            <DialogDescription>
              {editingFormId ? "قم بتعديل معلومات النموذج" : "أدخل معلومات النموذج الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="displayName">اسم النموذج *</Label>
              <Input
                id="displayName"
                value={formDialogData.displayName}
                onChange={(e) => setFormDialogData({ ...formDialogData, displayName: e.target.value })}
                placeholder="مثال: نموذج المشتري"
              />
            </div>
            <div>
              <Label htmlFor="formType">نوع النموذج</Label>
              <Select
                value={formDialogData.formType}
                onValueChange={(value: "buyer" | "seller") => setFormDialogData({ ...formDialogData, formType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">نموذج المشتري</SelectItem>
                  <SelectItem value="seller">نموذج البائع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                value={formDialogData.description}
                onChange={(e) => setFormDialogData({ ...formDialogData, description: e.target.value })}
                placeholder="وصف مختصر للنموذج"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSaveForm}
              disabled={createFormMutation.isPending || updateFormMutation.isPending}
            >
              {editingFormId ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا النموذج؟ سيتم حذف جميع الخطوات والحقول المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Sortable Step Item Component
function SortableStepItem({
  step,
  fields,
  index,
  color,
  IconComponent,
  isExpanded,
  isSelected,
  editingStepId,
  editingFieldId,
  stepEditData,
  fieldEditData,
  formId,
  onSelect,
  onEditStep,
  onCancelEdit,
  onEditField,
  onCancelFieldEdit,
  onStepChange,
  onFieldChange,
  onDelete,
}: {
  step: FormStep;
  fields: Array<{ field: FormField; options: any[] }>;
  index: number;
  color: { bg: string; light: string; text: string };
  IconComponent: React.ComponentType<{ className?: string }> | null;
  isExpanded: boolean;
  isSelected: boolean;
  editingStepId: string | null;
  editingFieldId: string | null;
  stepEditData?: Partial<InsertFormStep>;
  fieldEditData?: Record<string, Partial<InsertFormField>>;
  formId: string;
  onSelect: () => void;
  onEditStep: () => void;
  onCancelEdit: () => void;
  onEditField: (fieldId: string) => void;
  onCancelFieldEdit: () => void;
  onStepChange: (data?: Partial<InsertFormStep>) => void;
  onFieldChange?: (fieldId: string, data?: Partial<InsertFormField>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <AccordionItem value={step.id} className="border-b-0">
        <AccordionTrigger 
          className={`hover:no-underline py-3 px-4 rounded-lg transition-colors ${
            isSelected ? "bg-primary/10 border-2 border-primary" : "bg-muted/30"
          }`}
          onClick={onSelect}
        >
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg ${color.light} flex items-center justify-center flex-shrink-0`}>
                {IconComponent && <IconComponent className={`w-4 h-4 ${color.text}`} />}
              </div>
              {/* Title */}
              <h3 className="font-semibold text-base">{step.title}</h3>
              {/* Badge */}
              <Badge variant="secondary" className="text-xs">{fields.length}</Badge>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStep();
                }}
              >
                تعديل
              </Button>
              <DeleteStepButton 
                stepId={step.id} 
                onDelete={onDelete}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
          <StepSection
            step={step}
            fields={fields}
            formId={formId}
            editingStepId={editingStepId}
            editingFieldId={editingFieldId}
            stepEditData={stepEditData}
            fieldEditData={fieldEditData}
            onEditStep={onEditStep}
            onCancelEdit={onCancelEdit}
            onEditField={onEditField}
            onCancelFieldEdit={onCancelFieldEdit}
            onStepChange={onStepChange}
            onFieldChange={onFieldChange}
          />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

// Step Section - Shows all fields directly
function StepSection({
  step,
  fields,
  formId,
  editingStepId,
  editingFieldId,
  stepEditData,
  fieldEditData,
  onEditStep,
  onCancelEdit,
  onEditField,
  onCancelFieldEdit,
  onStepChange,
  onFieldChange,
}: {
  step: FormStep;
  fields: Array<{ field: FormField; options: any[] }>;
  formId: string;
  editingStepId: string | null;
  editingFieldId: string | null;
  stepEditData?: Partial<InsertFormStep>;
  fieldEditData?: Record<string, Partial<InsertFormField>>;
  onEditStep: () => void;
  onCancelEdit: () => void;
  onEditField: (fieldId: string) => void;
  onCancelFieldEdit: () => void;
  onStepChange: (data?: Partial<InsertFormStep>) => void;
  onFieldChange?: (fieldId: string, data?: Partial<InsertFormField>) => void;
}) {
  if (editingStepId === step.id) {
    return (
      <QuickStepEditor
        formId={formId}
        step={step}
        initialData={stepEditData}
        onSave={(data) => onStepChange(data)}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div className="space-y-2 pt-2">
      {/* Fields List */}
      <div className="space-y-2">
        {fields.map(({ field }) => (
          <div key={field.id}>
            {editingFieldId === field.id ? (
              <QuickFieldEditor
                stepId={step.id}
                fieldId={field.id}
                initialData={fieldEditData?.[field.id]}
                onSave={(data) => {
                  if (onFieldChange) onFieldChange(field.id, data);
                  onStepChange();
                }}
                onCancel={onCancelFieldEdit}
              />
            ) : (
              <div className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{field.label}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                    </Badge>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0">إلزامي</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => onEditField(field.id)}
                  >
                    تعديل
                  </Button>
                  <DeleteFieldButton
                    stepId={step.id}
                    fieldId={field.id}
                    onDelete={onStepChange}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Field */}
        {editingFieldId === `new-${step.id}` ? (
          <QuickFieldEditor
            stepId={step.id}
            fieldId={`new-${step.id}`}
            onSave={(data) => {
              if (onFieldChange) onFieldChange(`new-${step.id}`, data);
              onStepChange();
            }}
            onCancel={onCancelFieldEdit}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => onEditField(`new-${step.id}`)}
          >
            <Plus className="w-3 h-3 mr-2" />
            إضافة حقل
          </Button>
        )}
      </div>
    </div>
  );
}

// Quick Step Editor - Simplified
function QuickStepEditor({
  formId,
  step,
  initialData,
  onSave,
  onCancel,
}: {
  formId: string;
  step?: FormStep;
  initialData?: Partial<InsertFormStep>;
  onSave: (data?: Partial<InsertFormStep>) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialData?.title || step?.title || "");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/form-builder/steps", {
        formId,
        title,
        description: "",
        icon: "FileText",
        order: 1,
        isRequired: true,
        isActive: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحفظ" });
      onSave({ title, formId, description: "", icon: "FileText", order: 1, isRequired: true, isActive: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!step) return;
      const updateData = {
        title,
        description: initialData?.description ?? step.description ?? "",
        icon: initialData?.icon ?? step.icon ?? "FileText",
        order: initialData?.order ?? step.order,
        isRequired: initialData?.isRequired ?? step.isRequired,
        isActive: initialData?.isActive ?? step.isActive,
      };
      const res = await apiRequest("PUT", `/api/admin/form-builder/steps/${step.id}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحفظ" });
      const savedData = {
        title,
        description: initialData?.description ?? step?.description ?? "",
        icon: initialData?.icon ?? step?.icon ?? "FileText",
        order: initialData?.order ?? step?.order ?? 1,
        isRequired: initialData?.isRequired ?? step?.isRequired ?? true,
        isActive: initialData?.isActive ?? step?.isActive ?? true,
      };
      onSave(savedData);
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان",
        variant: "destructive",
      });
      return;
    }

    if (step) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="اسم الخطوة"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Quick Field Editor - Simplified
function QuickFieldEditor({
  stepId,
  fieldId,
  initialData,
  onSave,
  onCancel,
}: {
  stepId: string;
  fieldId?: string;
  initialData?: Partial<InsertFormField>;
  onSave: (data?: Partial<InsertFormField>) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialData?.name || "");
  const [label, setLabel] = useState(initialData?.label || "");
  const [type, setType] = useState<FieldType>((initialData?.type as FieldType) || "text");
  const [required, setRequired] = useState(initialData?.required || false);

  const { data: selectedField } = useQuery<FormField | null>({
    queryKey: ["form-builder-field", fieldId],
    queryFn: async () => {
      if (!fieldId || fieldId.startsWith("new-")) return null;
      const res = await apiRequest("GET", `/api/admin/form-builder/fields/${fieldId}`);
      return await res.json();
    },
    enabled: !!fieldId && !fieldId.startsWith("new-"),
  });

  useEffect(() => {
    if (selectedField) {
      setName(initialData?.name || selectedField.name);
      setLabel(initialData?.label || selectedField.label);
      setType((initialData?.type as FieldType) || (selectedField.type as FieldType));
      setRequired(initialData?.required ?? selectedField.required);
    } else if (initialData) {
      setName(initialData.name || "");
      setLabel(initialData.label || "");
      setType((initialData.type as FieldType) || "text");
      setRequired(initialData.required || false);
    }
  }, [selectedField, initialData]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const fieldData = {
        stepId,
        name,
        label,
        type,
        required,
        order: initialData?.order || 1,
        isActive: initialData?.isActive ?? true,
      };
      const res = await apiRequest("POST", "/api/admin/form-builder/fields", fieldData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحفظ" });
      const savedData = { stepId, name, label, type, required, order: 1, isActive: true };
      onSave(savedData);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!fieldId || fieldId.startsWith("new-")) return;
      const updateData = {
        name,
        label,
        type,
        required,
        order: initialData?.order,
        isActive: initialData?.isActive,
      };
      const res = await apiRequest("PUT", `/api/admin/form-builder/fields/${fieldId}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحفظ" });
      const savedData = { name, label, type, required, order: initialData?.order, isActive: initialData?.isActive };
      onSave(savedData);
    },
  });

  const handleSave = () => {
    if (!name || !name.trim() || !label || !label.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الحقل والتسمية",
        variant: "destructive",
      });
      return;
    }

    if (fieldId && !fieldId.startsWith("new-")) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const needsOptions = ["select", "multi_select", "chips"].includes(type);
  const isNew = !fieldId || fieldId.startsWith("new-");

  return (
    <div className="p-3 border-2 border-primary rounded-lg bg-primary/5 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الحقل (key)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
        />
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="التسمية"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>
      <div className="flex gap-2">
        <Select value={type} onValueChange={(v) => setType(v as FieldType)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={required ? "default" : "outline"}
          size="sm"
          onClick={() => setRequired(!required)}
        >
          {required ? "إلزامي" : "اختياري"}
        </Button>
      </div>
      {needsOptions && !isNew && fieldId && (
        <div className="mt-2">
          <OptionsManager fieldId={fieldId} fieldType={type} />
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          حفظ
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          إلغاء
        </Button>
      </div>
    </div>
  );
}

// Delete Step Button
function DeleteStepButton({ stepId, onDelete }: { stepId: string; onDelete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/form-builder/steps/${stepId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحذف" });
      onDelete();
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (confirm("حذف هذه الخطوة؟")) {
          deleteMutation.mutate();
        }
      }}
    >
      <Trash2 className="w-4 h-4 text-destructive" />
    </Button>
  );
}

// Delete Field Button
function DeleteFieldButton({
  stepId,
  fieldId,
  onDelete,
}: {
  stepId: string;
  fieldId: string;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/form-builder/fields/${fieldId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({ title: "تم الحذف" });
      onDelete();
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (confirm("حذف هذا الحقل؟")) {
          deleteMutation.mutate();
        }
      }}
    >
      <Trash2 className="w-3 h-3 text-destructive" />
    </Button>
  );
}

// Form Preview Component
function FormPreview({ formConfig }: { formConfig: CompleteFormConfig }) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <DynamicFormRenderer
      formConfig={formConfig}
      values={values}
      onChange={handleChange}
    />
  );
}


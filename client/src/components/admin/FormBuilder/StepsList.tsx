import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import * as icons from "lucide-react";
import type { CompleteFormConfig } from "./types";
import type { FormStep, FormField } from "@shared/schema";
import StepEditor from "./StepEditor";
import FieldsList from "./FieldsList";
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

interface StepsListProps {
  formConfig: CompleteFormConfig;
  selectedStepId: string | null;
  selectedFieldId: string | null;
  onStepSelect: (stepId: string | null) => void;
  onFieldSelect: (fieldId: string | null) => void;
  onStepChange?: () => void;
}

function SortableStepItem({
  step,
  fields,
  isSelected,
  selectedFieldId,
  onSelect,
  onFieldSelect,
  onEdit,
  onDelete,
}: {
  step: FormStep;
  fields: Array<{ field: FormField; options: any[] }>;
  isSelected: boolean;
  selectedFieldId: string | null;
  onSelect: () => void;
  onFieldSelect: (fieldId: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(isSelected);
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
    cursor: isDragging ? "grabbing" : "grab",
  };

  const IconComponent = step.icon
    ? (icons[step.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>)
    : icons.FileText;

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? "border-primary bg-primary/5" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div
              className="flex-1 flex items-center justify-between"
              onClick={() => {
                onSelect();
                setIsExpanded(!isExpanded);
              }}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <CardTitle className="text-base">{step.title}</CardTitle>
                <Badge variant="secondary">{fields.length} حقول</Badge>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="max-h-64 overflow-y-auto">
                <FieldsList
                  stepId={step.id}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={onFieldSelect}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldSelect(null);
                  onSelect();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة حقل
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function StepsList({
  formConfig,
  selectedStepId,
  selectedFieldId,
  onStepSelect,
  onFieldSelect,
  onStepChange,
}: StepsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState(formConfig.steps);
  const [editingStep, setEditingStep] = useState<FormStep | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<FormStep | null>(null);

  // Update steps when formConfig changes
  useEffect(() => {
    setSteps(formConfig.steps);
  }, [formConfig]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: async (stepIds: string[]) => {
      await apiRequest("PATCH", "/api/admin/form-builder/steps/reorder", {
        stepIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config", formConfig.config.name] });
      if (onStepChange) onStepChange();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث ترتيب الخطوات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الترتيب",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (stepId: string) => {
      await apiRequest("DELETE", `/api/admin/form-builder/steps/${stepId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config", formConfig.config.name] });
      if (onStepChange) onStepChange();
      setShowDeleteDialog(false);
      setStepToDelete(null);
      toast({
        title: "تم الحذف",
        description: "تم حذف الخطوة بنجاح",
      });
      setStepToDelete(null);
      onStepSelect(null);
      if (onStepChange) onStepChange();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الخطوة",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = steps.findIndex((s) => s.step.id === active.id);
    const newIndex = steps.findIndex((s) => s.step.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newSteps = arrayMove(steps, oldIndex, newIndex);
    setSteps(newSteps);

    // Update order in database
    const stepIds = newSteps.map((s) => s.step.id);
    reorderMutation.mutate(stepIds);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">الخطوات</h3>
          <Button
            size="sm"
            onClick={() => setEditingStep(null)}
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة خطوة
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد خطوات في هذا النموذج</p>
              <p className="text-sm mt-2">اضغط على "إضافة خطوة" لإضافة خطوة جديدة</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.step.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                {steps.map(({ step, fields }) => (
                  <SortableStepItem
                    key={step.id}
                    step={step}
                    fields={fields}
                    isSelected={selectedStepId === step.id}
                    selectedFieldId={selectedStepId === step.id ? selectedFieldId : null}
                    onSelect={() => onStepSelect(step.id)}
                    onFieldSelect={onFieldSelect}
                    onEdit={() => setEditingStep(step)}
                    onDelete={() => {
                      setStepToDelete(step);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </ScrollArea>
      </div>

      <Dialog open={editingStep !== undefined} onOpenChange={(open) => {
        if (!open) setEditingStep(undefined);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingStep !== undefined && (
            <StepEditor
              formId={formConfig.config.id}
              step={editingStep}
              onClose={() => setEditingStep(undefined)}
              onSave={() => {
                if (onStepChange) onStepChange();
                setEditingStep(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف خطوة "{stepToDelete?.title}"؟ سيتم حذف جميع الحقول المرتبطة بها أيضاً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (stepToDelete) {
                  deleteMutation.mutate(stepToDelete.id);
                }
              }}
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


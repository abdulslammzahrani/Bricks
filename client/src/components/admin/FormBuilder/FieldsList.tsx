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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import type { FormField } from "@shared/schema";

interface FieldsListProps {
  stepId: string;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
}

function SortableFieldItem({
  field,
  isSelected,
  onSelect,
}: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{field.label}</div>
              <div className="text-xs text-muted-foreground">{field.name}</div>
            </div>
            <Badge variant="outline" className="text-xs">
              {field.type}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FieldsList({
  stepId,
  selectedFieldId,
  onFieldSelect,
}: FieldsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fields, setFields] = useState<FormField[]>([]);

  const { data: fieldsData, isLoading, error } = useQuery<FormField[]>({
    queryKey: ["form-builder-fields", stepId],
    queryFn: async () => {
      if (!stepId) return [];
      const res = await apiRequest("GET", `/api/admin/form-builder/fields/${stepId}`);
      return await res.json();
    },
    enabled: !!stepId,
  });

  useEffect(() => {
    if (fieldsData) {
      setFields(fieldsData);
    }
  }, [fieldsData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: async (fieldIds: string[]) => {
      await apiRequest("PATCH", "/api/admin/form-builder/fields/reorder", {
        fieldIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-fields", stepId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث ترتيب الحقول بنجاح",
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newFields = arrayMove(fields, oldIndex, newIndex);
    setFields(newFields);

    // Update order in database
    const fieldIds = newFields.map((f) => f.id);
    reorderMutation.mutate(fieldIds);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>حدث خطأ في جلب الحقول</p>
        <p className="text-sm mt-2">{error instanceof Error ? error.message : "خطأ غير معروف"}</p>
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>لا توجد حقول في هذه الخطوة</p>
        <p className="text-sm mt-2">اضغط على "إضافة حقل" لإضافة حقل جديد</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {fields.map((field) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={() => onFieldSelect(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}


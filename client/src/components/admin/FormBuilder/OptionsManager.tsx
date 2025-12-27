import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import type { FieldType } from "./types";
import type { FieldOption } from "@shared/schema";

interface OptionsManagerProps {
  fieldId: string;
  fieldType: FieldType;
}

export default function OptionsManager({ fieldId, fieldType }: OptionsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  const { data: options, isLoading } = useQuery<FieldOption[]>({
    queryKey: ["form-builder-options", fieldId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/form-builder/options/${fieldId}`);
      return await res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { value: string; label: string }) => {
      const maxOrder = options?.length ? Math.max(...options.map((o) => o.order)) : 0;
      const res = await apiRequest("POST", "/api/admin/form-builder/options", {
        fieldId,
        value: data.value,
        label: data.label,
        order: maxOrder + 1,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-options", fieldId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      setNewOption({ value: "", label: "" });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة الخيار بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الخيار",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<FieldOption>;
    }) => {
      const res = await apiRequest("PUT", `/api/admin/form-builder/options/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-options", fieldId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      setEditingId(null);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الخيار بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الخيار",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/form-builder/options/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-options", fieldId] });
      queryClient.invalidateQueries({ queryKey: ["form-builder-config"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الخيار بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الخيار",
        variant: "destructive",
      });
    },
  });

  const handleAddOption = () => {
    if (!newOption.value || !newOption.label) {
      toast({
        title: "خطأ",
        description: "يجب إدخال القيمة والتسمية",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newOption);
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>خيارات الحقل ({options?.length || 0})</Label>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {options?.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                {editingId === option.id ? (
                  <>
                    <Input
                      value={option.value}
                      onChange={(e) => {
                        updateMutation.mutate({
                          id: option.id,
                          data: { value: e.target.value },
                        });
                      }}
                      className="flex-1"
                      placeholder="القيمة"
                    />
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        updateMutation.mutate({
                          id: option.id,
                          data: { label: e.target.value },
                        });
                      }}
                      className="flex-1"
                      placeholder="التسمية"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 p-2 rounded border bg-muted">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.value}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(option.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(option.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newOption.value}
              onChange={(e) =>
                setNewOption({ ...newOption, value: e.target.value })
              }
              placeholder="القيمة"
              className="flex-1"
            />
            <Input
              value={newOption.label}
              onChange={(e) =>
                setNewOption({ ...newOption, label: e.target.value })
              }
              placeholder="التسمية"
              className="flex-1"
            />
            <Button onClick={handleAddOption} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


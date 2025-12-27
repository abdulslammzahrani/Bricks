import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { FormField, FieldOption } from "@shared/schema";

interface ShowCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

interface ConditionBuilderProps {
  fields: FormField[];
  condition: ShowCondition | null;
  onChange: (condition: ShowCondition | null) => void;
}

const OPERATORS = [
  { value: "equals", label: "يساوي" },
  { value: "not_equals", label: "لا يساوي" },
  { value: "contains", label: "يحتوي على" },
  { value: "greater_than", label: "أكبر من" },
  { value: "less_than", label: "أصغر من" },
];

export default function ConditionBuilder({
  fields,
  condition,
  onChange,
}: ConditionBuilderProps) {
  const [localCondition, setLocalCondition] = useState<ShowCondition | null>(
    condition || null
  );

  const handleChange = (field: keyof ShowCondition, value: string) => {
    const newCondition = {
      ...(localCondition || {
        field: "",
        operator: "equals" as const,
        value: "",
      }),
      [field]: value,
    } as ShowCondition;
    setLocalCondition(newCondition);
    onChange(newCondition);
  };

  const selectedField = fields.find((f) => f.name === localCondition?.field);

  // Fetch options for selected field if it's a select type
  const { data: fieldOptions } = useQuery<FieldOption[]>({
    queryKey: ["form-builder-field-options", selectedField?.id],
    queryFn: async () => {
      if (!selectedField?.id) return [];
      const res = await apiRequest("GET", `/api/admin/form-builder/options/${selectedField.id}`);
      return await res.json();
    },
    enabled: !!selectedField?.id && 
      (selectedField.type === "select" || 
       selectedField.type === "multi_select" || 
       selectedField.type === "chips"),
  });

  useEffect(() => {
    if (condition) {
      setLocalCondition(condition);
    }
  }, [condition]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">قواعد العرض الشرطية</CardTitle>
          {localCondition && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalCondition(null);
                onChange(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!localCondition ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const newCondition: ShowCondition = {
                field: fields[0]?.name || "",
                operator: "equals",
                value: "",
              };
              setLocalCondition(newCondition);
              onChange(newCondition);
            }}
          >
            إضافة شرط
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>الحقل</Label>
              <Select
                value={localCondition.field}
                onValueChange={(value) => handleChange("field", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحقل" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>العملية</Label>
              <Select
                value={localCondition.operator}
                onValueChange={(value) =>
                  handleChange("operator", value as ShowCondition["operator"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>القيمة</Label>
              {selectedField && (selectedField.type === "select" ||
              selectedField.type === "multi_select" ||
              selectedField.type === "chips") && fieldOptions && fieldOptions.length > 0 ? (
                <Select
                  value={localCondition.value}
                  onValueChange={(value) => handleChange("value", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القيمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={localCondition.value || ""}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="أدخل القيمة"
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


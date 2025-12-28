import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink, Code, Link as LinkIcon } from "lucide-react";
import type { FormConfig } from "@shared/schema";

interface FormEmbeddingManagerProps {
  formConfig: FormConfig;
  onUpdate?: () => void;
}

export default function FormEmbeddingManager({ formConfig, onUpdate }: FormEmbeddingManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse embedding config
  const embeddingConfig = (formConfig.embeddingConfig as {
    pages?: string[];
    shortcode?: string;
    componentName?: string;
  }) || { pages: [], shortcode: `form:${formConfig.name}`, componentName: `Form${formConfig.name.replace(/_/g, "").replace(/form/g, "Form")}` };

  const [selectedPages, setSelectedPages] = useState<string[]>(embeddingConfig.pages || []);
  const [shortcode, setShortcode] = useState(embeddingConfig.shortcode || `form:${formConfig.name}`);
  const [componentName, setComponentName] = useState(embeddingConfig.componentName || `Form${formConfig.name.replace(/_/g, "").replace(/form/g, "Form")}`);

  // Available pages
  const availablePages = [
    { id: "home", label: "الصفحة الرئيسية", path: "/" },
    { id: "seller-form", label: "صفحة إضافة عقار", path: "/seller-form" },
    { id: "investor", label: "صفحة المستثمر", path: "/investor" },
  ];

  // Update embedding config mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { embeddingConfig: any }) => {
      const res = await apiRequest("PUT", `/api/admin/form-builder/configs/${formConfig.id}`, {
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-builder-configs"] });
      queryClient.invalidateQueries({ queryKey: ["form-config", formConfig.name] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات التضمين بنجاح",
      });
      onUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في التحديث",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      embeddingConfig: {
        pages: selectedPages,
        shortcode,
        componentName,
      },
    });
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الكود إلى الحافظة",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate shortcode
  const shortcodeText = `[${shortcode}]`;

  // Generate component code
  const componentCode = `import FormRenderer from "@/components/admin/FormBuilder/FormComponentRenderer";

<FormRenderer formName="${formConfig.name}" />`;

  // Generate direct import code
  const importCode = `import { FormRenderer } from "@/components/admin/FormBuilder/FormComponentRenderer";

<FormRenderer 
  formName="${formConfig.name}"
  theme="default"
  layout="default"
  onSubmit={(data) => {
    // Handle form submission
    console.log("Form data:", data);
  }}
/>`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التضمين</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pages Selection */}
          <div>
            <Label className="mb-3 block">الصفحات المرتبطة</Label>
            <div className="space-y-2">
              {availablePages.map((page) => (
                <div key={page.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={page.id}
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPages([...selectedPages, page.id]);
                      } else {
                        setSelectedPages(selectedPages.filter((p) => p !== page.id));
                      }
                    }}
                  />
                  <Label htmlFor={page.id} className="cursor-pointer">
                    {page.label}
                  </Label>
                  <Badge variant="outline" className="mr-auto">
                    {page.path}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Shortcode */}
          <div>
            <Label className="mb-2 block">Shortcode</Label>
            <div className="flex gap-2">
              <Input
                value={shortcode}
                onChange={(e) => setShortcode(e.target.value)}
                placeholder="form:buyer_form"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(shortcodeText, "shortcode")}
              >
                {copiedCode === "shortcode" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              استخدم: {shortcodeText} في محرر الصفحات
            </p>
          </div>

          {/* Component Name */}
          <div>
            <Label className="mb-2 block">اسم Component</Label>
            <Input
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="FormBuyerForm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              اسم Component للاستيراد في الكود
            </p>
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>كود Component</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(componentCode, "component")}
                >
                  {copiedCode === "component" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  نسخ
                </Button>
              </div>
              <Textarea
                value={componentCode}
                readOnly
                className="font-mono text-xs h-20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>كود مع Props</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(importCode, "import")}
                >
                  {copiedCode === "import" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  نسخ
                </Button>
              </div>
              <Textarea
                value={importCode}
                readOnly
                className="font-mono text-xs h-32"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}




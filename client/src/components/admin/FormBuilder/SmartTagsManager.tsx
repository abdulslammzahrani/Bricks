import { useState, KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Edit2, Trash2, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { RESIDENTIAL_PROPERTY_TYPES, COMMERCIAL_PROPERTY_TYPES } from "@/lib/property-form-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SmartTag } from "@shared/schema";

// Separate component for each property type card with its own state
function PropertyTypeCard({
  propertyType,
  label,
  tags,
  category,
  onAddTag,
  onDeleteTag,
  onUpdateTag,
}: {
  propertyType: string;
  label: string;
  tags: SmartTag[];
  category: "residential" | "commercial";
  onAddTag: (propertyType: string, tagText: string) => void;
  onDeleteTag: (tagId: string) => void;
  onUpdateTag: (tagId: string, data: Partial<SmartTag>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  // Get icon from property type config
  const propertyTypeConfig = [...RESIDENTIAL_PROPERTY_TYPES, ...COMMERCIAL_PROPERTY_TYPES].find(
    pt => pt.value === propertyType
  );
  const IconComponent = propertyTypeConfig?.icon;
  
  const sortedTags = tags.sort((a, b) => a.order - b.order);
  const displayedTags = showAll ? sortedTags : sortedTags.slice(0, 3);
  const hasMoreTags = sortedTags.length > 3;

  const handleAddTag = () => {
    if (inputValue.trim()) {
      onAddTag(propertyType, inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <Card className="w-full transition-all" style={{ height: 'auto' }}>
      <CardHeader 
        className={`${isExpanded ? 'pb-3 pt-4' : 'py-2.5'} px-4 cursor-pointer hover:bg-muted/50 transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {IconComponent && (
            <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <CardTitle className="text-sm font-semibold flex-1 leading-tight">{label}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0 text-xs px-2 py-0.5">{tags.length}</Badge>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0 animate-in slide-in-from-top-1 duration-200">
          {/* Input Field - YouTube style */}
          <div className="mb-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب اسم التاق واضغط Enter"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  handleAddTag();
                }
              }}
              className="w-full h-10 text-sm"
            />
          </div>
          {/* Tags Display - YouTube style chips */}
          <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
            {displayedTags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm group hover:bg-muted/80 transition-colors"
              >
                <span className="text-foreground">{tag.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTag(tag.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  title="حذف"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {hasMoreTags && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    إخفاء
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    عرض المزيد ({sortedTags.length - 3})
                  </>
                )}
              </button>
            )}
            {tags.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                لا توجد تاقات. اكتب واضغط Enter لإضافة تاق جديد
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function SmartTagsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all smart tags
  const { data: allTags = [], isLoading } = useQuery<SmartTag[]>({
    queryKey: ["smart-tags-all"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/form-builder/smart-tags");
      return await res.json();
    },
  });

  // Group tags by category and property type
  const groupedTags = {
    residential: RESIDENTIAL_PROPERTY_TYPES.reduce((acc, type) => {
      acc[type.value] = {
        label: type.label,
        tags: allTags.filter(tag => tag.propertyType === type.value),
      };
      return acc;
    }, {} as Record<string, { label: string; tags: SmartTag[] }>),
    commercial: COMMERCIAL_PROPERTY_TYPES.reduce((acc, type) => {
      acc[type.value] = {
        label: type.label,
        tags: allTags.filter(tag => tag.propertyType === type.value),
      };
      return acc;
    }, {} as Record<string, { label: string; tags: SmartTag[] }>),
  };

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: async (tagData: { propertyType: string; tag: string; label: string; order: number }) => {
      const res = await apiRequest("POST", "/api/admin/form-builder/smart-tags", {
        ...tagData,
        icon: "",
        isActive: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-tags"] });
      queryClient.invalidateQueries({ queryKey: ["smart-tags-all"] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة التاق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة التاق",
        variant: "destructive",
      });
    },
  });

  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SmartTag> }) => {
      const res = await apiRequest("PUT", `/api/admin/form-builder/smart-tags/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-tags"] });
      queryClient.invalidateQueries({ queryKey: ["smart-tags-all"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث التاق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث التاق",
        variant: "destructive",
      });
    },
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/form-builder/smart-tags/${tagId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-tags"] });
      queryClient.invalidateQueries({ queryKey: ["smart-tags-all"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف التاق",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف التاق",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = (propertyType: string, tagText: string) => {
    if (!tagText.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم التاق",
        variant: "destructive",
      });
      return;
    }

    // Check if tag already exists for this property type
    const existingTag = allTags.find(
      (t) => t.propertyType === propertyType && 
      (t.tag.toLowerCase() === tagText.toLowerCase().replace(/\s+/g, "_") || 
       t.label.toLowerCase() === tagText.toLowerCase())
    );
    
    if (existingTag) {
      toast({
        title: "تنبيه",
        description: "هذا التاق موجود بالفعل لهذا النوع",
        variant: "destructive",
      });
      return;
    }

    const tagsForType = allTags.filter(t => t.propertyType === propertyType);
    createMutation.mutate({
      propertyType,
      tag: tagText.toLowerCase().replace(/\s+/g, "_"),
      label: tagText,
      order: tagsForType.length,
    });
  };

  const handleUpdateTag = (tagId: string, data: Partial<SmartTag>) => {
    updateMutation.mutate({ id: tagId, data });
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التاق؟")) {
      deleteMutation.mutate(tagId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl mb-2">إدارة التاقات الذكية</CardTitle>
          <CardDescription className="text-base">
            عرض شامل لجميع التاقات منظمة حسب الفئة ونوع العقار
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : (
            <Tabs defaultValue="residential" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="w-fit bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger value="residential" className="px-6 py-2 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                    سكني ({RESIDENTIAL_PROPERTY_TYPES.reduce((sum, type) => sum + (groupedTags.residential[type.value]?.tags.length || 0), 0)})
                  </TabsTrigger>
                  <TabsTrigger value="commercial" className="px-6 py-2 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all">
                    تجاري ({COMMERCIAL_PROPERTY_TYPES.reduce((sum, type) => sum + (groupedTags.commercial[type.value]?.tags.length || 0), 0)})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Residential Tab */}
              <TabsContent value="residential" className="space-y-5 mt-0">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <h3 className="text-lg font-bold">الفئة السكنية</h3>
                  <Badge variant="secondary" className="text-sm px-2.5 py-0.5">
                    {RESIDENTIAL_PROPERTY_TYPES.reduce((sum, type) => sum + (groupedTags.residential[type.value]?.tags.length || 0), 0)} تاق
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                  {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                    <PropertyTypeCard
                      key={`residential-${type.value}`}
                      propertyType={type.value}
                      label={type.label}
                      tags={groupedTags.residential[type.value]?.tags || []}
                      category="residential"
                      onAddTag={handleAddTag}
                      onDeleteTag={handleDeleteTag}
                      onUpdateTag={handleUpdateTag}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Commercial Tab */}
              <TabsContent value="commercial" className="space-y-5 mt-0">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <h3 className="text-lg font-bold">الفئة التجارية</h3>
                  <Badge variant="secondary" className="text-sm px-2.5 py-0.5">
                    {COMMERCIAL_PROPERTY_TYPES.reduce((sum, type) => sum + (groupedTags.commercial[type.value]?.tags.length || 0), 0)} تاق
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                  {COMMERCIAL_PROPERTY_TYPES.map((type) => (
                    <PropertyTypeCard
                      key={`commercial-${type.value}`}
                      propertyType={type.value}
                      label={type.label}
                      tags={groupedTags.commercial[type.value]?.tags || []}
                      category="commercial"
                      onAddTag={handleAddTag}
                      onDeleteTag={handleDeleteTag}
                      onUpdateTag={handleUpdateTag}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Summary */}
          {!isLoading && (
            <div className="text-center text-sm text-muted-foreground pt-6 mt-6 border-t">
              إجمالي التاقات: {allTags.length} تاق
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

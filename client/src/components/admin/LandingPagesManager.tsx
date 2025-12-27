import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  ExternalLink,
  Eye,
  Users,
  Calendar,
  Copy,
  Loader2,
  Building2,
  Link as LinkIcon,
} from "lucide-react";
import type { Property } from "@shared/schema";

interface LandingPage {
  landingPage: {
    id: string;
    slug: string;
    propertyId: string;
    isActive: boolean;
    viewsCount: number;
    leadsCount: number;
    bookingsCount: number;
    createdAt: string;
  };
  property: Property | null;
}

export default function LandingPagesManager() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [selectedFormName, setSelectedFormName] = useState<string>("");

  // Fetch landing pages
  const { data: landingPages = [], isLoading } = useQuery<LandingPage[]>({
    queryKey: ["/api/landing-pages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/landing-pages");
      return await res.json();
    },
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/properties");
      return await res.json();
    },
  });

  // Fetch form configs for dropdown
  const { data: formConfigs = [] } = useQuery({
    queryKey: ["form-builder-configs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/form-builder/configs");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Create landing page mutation
  const createMutation = useMutation({
    mutationFn: async (data: { propertyId: string; slug?: string; formName?: string }) => {
      const res = await apiRequest("POST", "/api/landing-pages", {
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      setShowCreateDialog(false);
      setSelectedPropertyId("");
      setCustomSlug("");
      setSelectedFormName("");
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء صفحة الهبوط بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء صفحة الهبوط",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/offer/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط صفحة الهبوط",
    });
  };

  const propertyTypeNames: Record<string, string> = {
    apartment: "شقة",
    villa: "فيلا",
    land: "أرض",
    building: "عمارة",
    duplex: "دوبلكس",
    floor: "دور",
    commercial: "تجاري",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">صفحات الهبوط</h2>
          <p className="text-muted-foreground">
            إدارة صفحات الهبوط العقارية للتسويق
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء صفحة هبوط جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء صفحة هبوط جديدة</DialogTitle>
              <DialogDescription>
                اختر عقاراً لإنشاء صفحة هبوط مخصصة له
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="property">العقار</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={setSelectedPropertyId}
                >
                  <SelectTrigger id="property" className="mt-2">
                    <SelectValue placeholder="اختر العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {propertyTypeNames[property.propertyType] || property.propertyType} - {property.district}، {property.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="form">الفورم (اختياري)</Label>
                <Select value={selectedFormName} onValueChange={setSelectedFormName}>
                  <SelectTrigger id="form" className="mt-2">
                    <SelectValue placeholder="اختر فورم (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون فورم (استخدام الفورم الافتراضي)</SelectItem>
                    {formConfigs.map((form: any) => (
                      <SelectItem key={form.id} value={form.name}>
                        {form.displayName || form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم استخدام هذا الفورم في صفحة الهبوط بدلاً من الفورم الافتراضي
                </p>
              </div>
              <div>
                <Label htmlFor="slug">الرابط المخصص (اختياري)</Label>
                <Input
                  id="slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="سيتم إنشاء رابط تلقائياً إذا تركت فارغاً"
                  className="mt-2"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (!selectedPropertyId) {
                    toast({
                      title: "خطأ",
                      description: "يرجى اختيار عقار",
                      variant: "destructive",
                    });
                    return;
                  }
                  createMutation.mutate({
                    propertyId: selectedPropertyId,
                    slug: customSlug.trim() || undefined,
                    formName: selectedFormName || undefined,
                  });
                }}
                disabled={createMutation.isPending || !selectedPropertyId}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : landingPages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد صفحات هبوط بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {landingPages.map(({ landingPage, property }) => (
            <Card key={landingPage.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">
                        {property
                          ? `${propertyTypeNames[property.propertyType] || property.propertyType} - ${property.district}، ${property.city}`
                          : "عقار غير موجود"}
                      </h3>
                      <Badge variant={landingPage.isActive ? "default" : "secondary"}>
                        {landingPage.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {landingPage.viewsCount} مشاهدة
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {landingPage.leadsCount} عميل محتمل
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {landingPage.bookingsCount} حجز
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        /offer/{landingPage.slug}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(landingPage.slug)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`/offer/${landingPage.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


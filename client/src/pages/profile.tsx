import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Home, Building2, Heart, Phone, Mail, User, LogOut, ArrowRight, Eye, MapPin, Plus, Pencil, Trash2, Upload, Image, X, Map, ChevronDown, ChevronUp, Check, Loader2, MessageCircle } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";
import { FileUploadButton } from "@/components/FileUploadButton";
import { PropertyMap } from "@/components/PropertyMap";
import { getCityNames, getNeighborhoodsByCity } from "@shared/saudi-locations";
import { MessagingPanel } from "@/components/MessagingPanel";
import { MatchedPropertiesPanel } from "@/components/MatchedPropertiesPanel";

const cities = getCityNames();
const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "land", label: "أرض" },
  { value: "duplex", label: "دوبلكس" },
  { value: "building", label: "عمارة" },
];

export default function ProfilePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tabParam = searchParams.get("tab");
  const conversationParam = searchParams.get("conversation");
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(
    tabParam === "messages" ? "messages" : tabParam === "matches" ? "matches" : "items"
  );
  
  const [formData, setFormData] = useState({
    city: "",
    district: "",
    propertyType: "",
    budgetMin: "",
    budgetMax: "",
    price: "",
    area: "",
    rooms: "",
    images: [] as string[],
  });
  
  // State for expandable inline editing
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Record<string, any>>({});
  const [savingField, setSavingField] = useState<string | null>(null);

  // Update activeTab when URL param changes
  useEffect(() => {
    if (tabParam === "messages" && activeTab !== "messages") {
      setActiveTab("messages");
    } else if (tabParam === "matches" && activeTab !== "matches") {
      setActiveTab("matches");
    }
  }, [tabParam]);

  // Handle tab change and update URL using Wouter
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "messages") {
      navigate("/profile?tab=messages", { replace: true });
    } else if (value === "matches") {
      navigate("/profile?tab=matches", { replace: true });
    } else {
      navigate("/profile", { replace: true });
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        setUserData(data.user);
        setIsLoggedIn(true);
        toast({ title: "تم تسجيل الدخول بنجاح" });
      } else {
        toast({ title: "خطأ في بيانات الدخول", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "خطأ في بيانات الدخول", variant: "destructive" });
    },
  });

  const { data: preferences, refetch: refetchPreferences } = useQuery({
    queryKey: ["/api/buyers", userData?.id, "preferences"],
    enabled: isLoggedIn && userData?.role === "buyer",
  });

  const { data: properties, refetch: refetchProperties } = useQuery({
    queryKey: ["/api/sellers", userData?.id, "properties"],
    enabled: isLoggedIn && userData?.role === "seller",
  });

  const addPreferenceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/preferences", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تمت إضافة الرغبة بنجاح" });
      setShowAddDialog(false);
      resetForm();
      refetchPreferences();
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
    },
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/preferences/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الرغبة بنجاح" });
      setShowAddDialog(false);
      setEditingItem(null);
      resetForm();
      refetchPreferences();
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/preferences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف الرغبة" });
      refetchPreferences();
    },
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تمت إضافة العقار بنجاح" });
      setShowAddDialog(false);
      resetForm();
      refetchProperties();
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم تحديث العقار بنجاح" });
      setShowAddDialog(false);
      setEditingItem(null);
      resetForm();
      refetchProperties();
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف العقار" });
      refetchProperties();
    },
  });

  // Inline auto-save mutation for preferences
  const inlineSavePreferenceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/preferences/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ تلقائياً", description: "التغييرات محفوظة" });
      setSavingField(null);
      refetchPreferences();
    },
    onError: () => {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
      setSavingField(null);
    },
  });

  // Inline auto-save mutation for properties
  const inlineSavePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ تلقائياً", description: "التغييرات محفوظة" });
      setSavingField(null);
      refetchProperties();
    },
    onError: () => {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
      setSavingField(null);
    },
  });

  // Toggle expand item and initialize inline edit data
  const toggleExpandItem = (item: any) => {
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
      setInlineEditData({});
    } else {
      setExpandedItemId(item.id);
      setInlineEditData({ ...item });
    }
  };

  // Handle inline field change with auto-save
  const handleInlineFieldChange = (fieldName: string, value: any, itemId: string) => {
    setInlineEditData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Auto-save on blur
  const handleInlineFieldBlur = (fieldName: string, itemId: string) => {
    const currentItem = userData?.role === "buyer" 
      ? (preferences as any[])?.find((p: any) => p.id === itemId)
      : (properties as any[])?.find((p: any) => p.id === itemId);
    
    if (!currentItem) return;

    // Check if value actually changed
    let hasChanged = false;
    if (fieldName === "districts") {
      const oldDistricts = currentItem.districts || [];
      const newDistricts = inlineEditData.districts || [];
      hasChanged = JSON.stringify(oldDistricts) !== JSON.stringify(newDistricts);
    } else {
      hasChanged = currentItem[fieldName] !== inlineEditData[fieldName];
    }

    if (!hasChanged) return;

    setSavingField(fieldName);

    if (userData?.role === "buyer") {
      inlineSavePreferenceMutation.mutate({
        id: itemId,
        data: {
          [fieldName]: inlineEditData[fieldName]
        }
      });
    } else {
      inlineSavePropertyMutation.mutate({
        id: itemId,
        data: {
          [fieldName]: inlineEditData[fieldName]
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      city: "",
      district: "",
      propertyType: "",
      budgetMin: "",
      budgetMax: "",
      price: "",
      area: "",
      rooms: "",
      images: [],
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({ title: "يرجى إدخال رقم الجوال وكلمة المرور", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ phone, password });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setPhone("");
    setPassword("");
  };

  const openAddDialog = () => {
    resetForm();
    setEditingItem(null);
    setShowAddDialog(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    if (userData?.role === "buyer") {
      setFormData({
        city: item.city || "",
        district: item.districts?.[0] || "",
        propertyType: item.propertyType || "",
        budgetMin: item.budgetMin?.toString() || "",
        budgetMax: item.budgetMax?.toString() || "",
        price: "",
        area: item.area || "",
        rooms: item.rooms || "",
        images: [],
      });
    } else {
      setFormData({
        city: item.city || "",
        district: item.district || "",
        propertyType: item.propertyType || "",
        budgetMin: "",
        budgetMax: "",
        price: item.price?.toString() || "",
        area: item.area || "",
        rooms: item.rooms || "",
        images: item.images || [],
      });
    }
    setShowAddDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData?.role === "buyer") {
      const data = {
        userId: userData.id,
        city: formData.city,
        districts: formData.district ? [formData.district] : [],
        propertyType: formData.propertyType,
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        area: formData.area || null,
        rooms: formData.rooms || null,
        isActive: true,
      };
      
      if (editingItem) {
        updatePreferenceMutation.mutate({ id: editingItem.id, data });
      } else {
        addPreferenceMutation.mutate(data);
      }
    } else {
      if (formData.images.length === 0) {
        toast({ title: "يجب رفع صور أو فيديوهات للعقار", variant: "destructive" });
        return;
      }
      
      const data = {
        sellerId: userData.id,
        city: formData.city,
        district: formData.district,
        propertyType: formData.propertyType,
        price: formData.price ? parseInt(formData.price) : 0,
        area: formData.area || null,
        rooms: formData.rooms || null,
        images: formData.images,
        isActive: true,
      };
      
      if (editingItem) {
        updatePropertyMutation.mutate({ id: editingItem.id, data });
      } else {
        addPropertyMutation.mutate(data);
      }
    }
  };

  const handleFilesUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      if (userData?.role === "buyer") {
        deletePreferenceMutation.mutate(id);
      } else {
        deletePropertyMutation.mutate(id);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <p className="text-muted-foreground">أدخل بياناتك للوصول لصفحتك الشخصية</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="text-left"
                  data-testid="input-login-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="text-left"
                  data-testid="input-login-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBuyer = userData?.role === "buyer";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">{userData?.name}</h1>
              <p className="text-sm text-muted-foreground">{userData?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className={`grid w-full max-w-lg mx-auto ${isBuyer ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="items" className="gap-2" data-testid="tab-items">
                {isBuyer ? <Heart className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {isBuyer ? "رغباتي" : "عقاراتي"}
              </TabsTrigger>
              {isBuyer && (
                <TabsTrigger value="matches" className="gap-2" data-testid="tab-matches">
                  <Building2 className="h-4 w-4" />
                  العروض المتطابقة
                </TabsTrigger>
              )}
              <TabsTrigger value="messages" className="gap-2" data-testid="tab-messages">
                <MessageCircle className="h-4 w-4" />
                الرسائل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="mt-6">
              {/* User Info Card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                      <Badge variant={isBuyer ? "default" : "secondary"} className="gap-1">
                        {isBuyer ? (
                          <>
                            <Heart className="h-3 w-3" />
                            مشتري
                          </>
                        ) : (
                          <>
                            <Building2 className="h-3 w-3" />
                            بائع
                          </>
                        )}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{userData?.phone}</span>
                      </div>
                    </div>
                    <Button onClick={openAddDialog} className={`gap-2 ${!isBuyer ? "bg-green-600 hover:bg-green-700" : ""}`} data-testid="button-add-new">
                      <Plus className="h-4 w-4" />
                      {isBuyer ? "إضافة رغبة جديدة" : "إضافة عقار جديد"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content based on role */}
          {isBuyer ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                رغباتي العقارية
              </h2>
              
              {preferences && Array.isArray(preferences) && preferences.length > 0 ? (
                <div className="grid gap-4">
                  {preferences.map((pref: any) => (
                    <Card key={pref.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {propertyTypes.find(t => t.value === pref.propertyType)?.label || pref.propertyType}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {pref.city}
                            </Badge>
                            {pref.districts?.map((d: string, i: number) => (
                              <Badge key={i} variant="outline">{d}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => toggleExpandItem(pref)}
                              data-testid={`button-expand-pref-${pref.id}`}
                            >
                              {expandedItemId === pref.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(pref.id)} data-testid={`button-delete-pref-${pref.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          الميزانية: {pref.budgetMin?.toLocaleString() || 0} - {pref.budgetMax?.toLocaleString() || "غير محدد"} ريال
                        </div>
                        
                        {/* Expandable Inline Edit Section */}
                        {expandedItemId === pref.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Pencil className="h-4 w-4" />
                              <span>عدّل البيانات مباشرة - الحفظ تلقائي</span>
                              {(inlineSavePreferenceMutation.isPending) && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">المدينة</Label>
                                <Select 
                                  value={inlineEditData.city || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("city", v, pref.id);
                                    setTimeout(() => handleInlineFieldBlur("city", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-city-${pref.id}`}>
                                    <SelectValue placeholder="اختر المدينة" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.map(city => (
                                      <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الحي</Label>
                                <Select 
                                  value={inlineEditData.districts?.[0] || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("districts", [v], pref.id);
                                    setTimeout(() => handleInlineFieldBlur("districts", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-district-${pref.id}`}>
                                    <SelectValue placeholder="اختر الحي" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getNeighborhoodsByCity(inlineEditData.city || "").map(neighborhood => (
                                      <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">نوع العقار</Label>
                              <Select 
                                value={inlineEditData.propertyType || ""} 
                                onValueChange={(v) => {
                                  handleInlineFieldChange("propertyType", v, pref.id);
                                  setTimeout(() => handleInlineFieldBlur("propertyType", pref.id), 100);
                                }}
                              >
                                <SelectTrigger data-testid={`inline-select-property-type-${pref.id}`}>
                                  <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                  {propertyTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الحد الأدنى للميزانية</Label>
                                <Input
                                  type="number"
                                  value={inlineEditData.budgetMin || ""}
                                  onChange={(e) => handleInlineFieldChange("budgetMin", parseInt(e.target.value) || null, pref.id)}
                                  onBlur={() => handleInlineFieldBlur("budgetMin", pref.id)}
                                  placeholder="مثال: 500000"
                                  dir="ltr"
                                  data-testid={`inline-input-budget-min-${pref.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الحد الأقصى للميزانية</Label>
                                <Input
                                  type="number"
                                  value={inlineEditData.budgetMax || ""}
                                  onChange={(e) => handleInlineFieldChange("budgetMax", parseInt(e.target.value) || null, pref.id)}
                                  onBlur={() => handleInlineFieldBlur("budgetMax", pref.id)}
                                  placeholder="مثال: 1000000"
                                  dir="ltr"
                                  data-testid={`inline-input-budget-max-${pref.id}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">المساحة (م²)</Label>
                                <Input
                                  value={inlineEditData.area || ""}
                                  onChange={(e) => handleInlineFieldChange("area", e.target.value, pref.id)}
                                  onBlur={() => handleInlineFieldBlur("area", pref.id)}
                                  placeholder="مثال: 200"
                                  dir="ltr"
                                  data-testid={`inline-input-area-${pref.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">عدد الغرف</Label>
                                <Input
                                  value={inlineEditData.rooms || ""}
                                  onChange={(e) => handleInlineFieldChange("rooms", e.target.value, pref.id)}
                                  onBlur={() => handleInlineFieldBlur("rooms", pref.id)}
                                  placeholder="مثال: 4"
                                  dir="ltr"
                                  data-testid={`inline-input-rooms-${pref.id}`}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              <span>التغييرات تُحفظ تلقائياً عند الخروج من الحقل</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">لا توجد رغبات مسجلة</p>
                    <Button className="mt-4" onClick={openAddDialog}>سجل رغبتك الآن</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {properties && Array.isArray(properties) && properties.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Map className="h-5 w-5 text-green-600" />
                    خريطة عقاراتي
                  </h2>
                  <PropertyMap properties={properties as any[]} />
                </div>
              ) : null}

              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                عقاراتي
              </h2>
              
              {properties && Array.isArray(properties) && properties.length > 0 ? (
                <div className="grid gap-4">
                  {properties.map((prop: any) => (
                    <Card key={prop.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {propertyTypes.find(t => t.value === prop.propertyType)?.label || prop.propertyType}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {prop.city} - {prop.district}
                            </Badge>
                            <Badge variant={prop.isActive ? "default" : "secondary"}>
                              {prop.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => toggleExpandItem(prop)}
                              data-testid={`button-expand-prop-${prop.id}`}
                            >
                              {expandedItemId === prop.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(prop.id)} data-testid={`button-delete-prop-${prop.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {prop.price?.toLocaleString()} ريال
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {prop.viewsCount || 0} مشاهدة
                          </div>
                        </div>
                        
                        {/* Expandable Inline Edit Section for Properties */}
                        {expandedItemId === prop.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Pencil className="h-4 w-4" />
                              <span>عدّل البيانات مباشرة - الحفظ تلقائي</span>
                              {(inlineSavePropertyMutation.isPending) && (
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">المدينة</Label>
                                <Select 
                                  value={inlineEditData.city || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("city", v, prop.id);
                                    setTimeout(() => handleInlineFieldBlur("city", prop.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-city-${prop.id}`}>
                                    <SelectValue placeholder="اختر المدينة" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.map(city => (
                                      <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الحي</Label>
                                <Select 
                                  value={inlineEditData.district || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("district", v, prop.id);
                                    setTimeout(() => handleInlineFieldBlur("district", prop.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-district-${prop.id}`}>
                                    <SelectValue placeholder="اختر الحي" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getNeighborhoodsByCity(inlineEditData.city || "").map(neighborhood => (
                                      <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">نوع العقار</Label>
                              <Select 
                                value={inlineEditData.propertyType || ""} 
                                onValueChange={(v) => {
                                  handleInlineFieldChange("propertyType", v, prop.id);
                                  setTimeout(() => handleInlineFieldBlur("propertyType", prop.id), 100);
                                }}
                              >
                                <SelectTrigger data-testid={`inline-select-property-type-${prop.id}`}>
                                  <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                  {propertyTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">السعر (ريال)</Label>
                              <Input
                                type="number"
                                value={inlineEditData.price || ""}
                                onChange={(e) => handleInlineFieldChange("price", parseInt(e.target.value) || null, prop.id)}
                                onBlur={() => handleInlineFieldBlur("price", prop.id)}
                                placeholder="مثال: 1500000"
                                dir="ltr"
                                data-testid={`inline-input-price-${prop.id}`}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">المساحة (م²)</Label>
                                <Input
                                  value={inlineEditData.area || ""}
                                  onChange={(e) => handleInlineFieldChange("area", e.target.value, prop.id)}
                                  onBlur={() => handleInlineFieldBlur("area", prop.id)}
                                  placeholder="مثال: 300"
                                  dir="ltr"
                                  data-testid={`inline-input-area-${prop.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">عدد الغرف</Label>
                                <Input
                                  value={inlineEditData.rooms || ""}
                                  onChange={(e) => handleInlineFieldChange("rooms", e.target.value, prop.id)}
                                  onBlur={() => handleInlineFieldBlur("rooms", prop.id)}
                                  placeholder="مثال: 5"
                                  dir="ltr"
                                  data-testid={`inline-input-rooms-${prop.id}`}
                                />
                              </div>
                            </div>

                            {/* Property Images Preview */}
                            {inlineEditData.images && inlineEditData.images.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">صور العقار</Label>
                                <div className="flex flex-wrap gap-2">
                                  {inlineEditData.images.map((img: string, idx: number) => (
                                    <div key={idx} className="relative">
                                      <img 
                                        src={img} 
                                        alt={`صورة ${idx + 1}`} 
                                        className="h-16 w-16 object-cover rounded-md border"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Check className="h-3 w-3" />
                              <span>التغييرات تُحفظ تلقائياً عند الخروج من الحقل</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">لا توجد عقارات مسجلة</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={openAddDialog}>أضف عقارك الآن</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
            </TabsContent>

            {isBuyer && (
              <TabsContent value="matches" className="mt-6">
                <MatchedPropertiesPanel preferences={preferences || []} />
              </TabsContent>
            )}

            <TabsContent value="messages" className="mt-6">
              {userData?.id ? (
                <MessagingPanel 
                  userId={userData.id} 
                  userName={userData.name || ""} 
                  selectedConversationId={conversationParam}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">يجب تسجيل الدخول لعرض الرسائل</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingItem 
                ? (isBuyer ? "تعديل الرغبة" : "تعديل العقار")
                : (isBuyer ? "إضافة رغبة جديدة" : "إضافة عقار جديد")
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المدينة</Label>
                <Select value={formData.city} onValueChange={(v) => setFormData(prev => ({ ...prev, city: v }))}>
                  <SelectTrigger data-testid="select-city">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحي</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, district: v }))}
                >
                  <SelectTrigger data-testid="select-district">
                    <SelectValue placeholder="اختر الحي" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNeighborhoodsByCity(formData.city).map(neighborhood => (
                      <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>نوع العقار</Label>
              <Select value={formData.propertyType} onValueChange={(v) => setFormData(prev => ({ ...prev, propertyType: v }))}>
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isBuyer ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الميزانية من</Label>
                  <Input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                    placeholder="0"
                    data-testid="input-budget-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الميزانية إلى</Label>
                  <Input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                    placeholder="1000000"
                    data-testid="input-budget-max"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>السعر (ريال)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="500000"
                  data-testid="input-price"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المساحة (م²)</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="150"
                  data-testid="input-area"
                />
              </div>
              <div className="space-y-2">
                <Label>عدد الغرف</Label>
                <Input
                  value={formData.rooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, rooms: e.target.value }))}
                  placeholder="3"
                  data-testid="input-rooms"
                />
              </div>
            </div>

            {!isBuyer && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-destructive">* الصور والفيديوهات (مطلوب)</Label>
                  <FileUploadButton
                    maxFiles={5}
                    maxFileSize={52428800}
                    onFilesUploaded={handleFilesUploaded}
                    buttonVariant="outline"
                    buttonSize="sm"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    رفع الملفات
                  </FileUploadButton>
                </div>
                
                {formData.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="w-16 h-16 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                          {url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") ? (
                            <span className="text-xs text-muted-foreground">فيديو</span>
                          ) : (
                            <img 
                              src={url} 
                              alt={`صورة ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                    لم يتم رفع أي ملفات بعد
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className={!isBuyer ? "bg-green-600 hover:bg-green-700" : ""}
                disabled={addPreferenceMutation.isPending || updatePreferenceMutation.isPending || addPropertyMutation.isPending || updatePropertyMutation.isPending}
                data-testid="button-submit-form"
              >
                {editingItem ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

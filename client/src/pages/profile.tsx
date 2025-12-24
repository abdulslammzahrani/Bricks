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
import { Home, Building2, Heart, Phone, Mail, User, LogOut, ArrowRight, Eye, MapPin, Plus, Pencil, Trash2, Upload, Image, X, Map, ChevronDown, ChevronUp, Check, Loader2, MessageCircle, Zap, Lock, BarChart3, Settings, Car, Snowflake, Wifi, Shield, Trees, Dumbbell, Users, Droplets, Bath, Ruler, Calendar } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";
import { FileUploadButton } from "@/components/FileUploadButton";
import { PropertyMap } from "@/components/PropertyMap";
import { getCityNames, getNeighborhoodsByCity } from "@shared/saudi-locations";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MessagingPanel } from "@/components/MessagingPanel";
import { MatchedPropertiesPanel } from "@/components/MatchedPropertiesPanel";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";

const cities = getCityNames();
const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "land", label: "أرض" },
  { value: "duplex", label: "دوبلكس" },
  { value: "building", label: "عمارة" },
];

const amenityOptions = [
  { id: "parking", label: "موقف سيارة", icon: Car },
  { id: "ac", label: "تكييف مركزي", icon: Snowflake },
  { id: "wifi", label: "إنترنت", icon: Wifi },
  { id: "security", label: "حراسة أمنية", icon: Shield },
  { id: "garden", label: "حديقة", icon: Trees },
  { id: "gym", label: "صالة رياضية", icon: Dumbbell },
  { id: "maid_room", label: "غرفة خادمة", icon: Users },
  { id: "electricity", label: "عداد كهرباء مستقل", icon: Zap },
  { id: "water", label: "عداد ماء مستقل", icon: Droplets },
];

const furnishingOptions = [
  { value: "unfurnished", label: "غير مفروش" },
  { value: "semi_furnished", label: "شبه مفروش" },
  { value: "furnished", label: "مفروش" },
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
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(
    tabParam === "messages" ? "messages" : tabParam === "matches" ? "matches" : tabParam === "properties" ? "properties" : "preferences"
  );
  // Tracks whether dialog is for preference or property (decoupled from activeTab)
  const [formMode, setFormMode] = useState<"preference" | "property">("preference");

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
    } else if (tabParam === "properties" && activeTab !== "properties") {
      setActiveTab("properties");
    } else if (!tabParam && activeTab !== "preferences") {
      setActiveTab("preferences");
    }
  }, [tabParam]);

  // Handle tab change and update URL using Wouter
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "preferences") {
      navigate("/profile", { replace: true });
    } else {
      navigate(`/profile?tab=${value}`, { replace: true });
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
    enabled: isLoggedIn && !!userData?.id,
  });

  const { data: properties, refetch: refetchProperties } = useQuery({
    queryKey: ["/api/sellers", userData?.id, "properties"],
    enabled: isLoggedIn && !!userData?.id,
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
      // Determine which fields affect matching
      const matchingFields = ["city", "district", "price", "propertyType", "rooms", "area", "status", "amenities"];
      const updatedFields = Object.keys(data);
      const affectsMatching = updatedFields.some(field => matchingFields.includes(field));
      
      const updatePayload = {
        ...data,
        _recalculateMatches: affectsMatching, // Flag to trigger match recalculation
      };
      
      const response = await apiRequest("PATCH", `/api/properties/${id}`, updatePayload);
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
    // Safe arrays with null guards to prevent runtime errors when queries are loading
    const preferencesArray = (preferences as any[]) ?? [];
    const propertiesArray = (properties as any[]) ?? [];

    // Check if item is a preference (by checking if it exists in preferences array)
    const isPreferenceItem = preferencesArray.some((p: any) => p.id === itemId);
    const currentItem = isPreferenceItem 
      ? preferencesArray.find((p: any) => p.id === itemId)
      : propertiesArray.find((p: any) => p.id === itemId);

    if (!currentItem) return;

    // Check if value actually changed
    let hasChanged = false;
    if (fieldName === "districts" || fieldName === "images" || fieldName === "amenities") {
      // Array fields - compare deeply
      const oldValue = currentItem[fieldName] || [];
      const newValue = inlineEditData[fieldName] || [];
      hasChanged = JSON.stringify(Array.isArray(oldValue) ? oldValue.sort() : oldValue) !== JSON.stringify(Array.isArray(newValue) ? newValue.sort() : newValue);
    } else {
      hasChanged = currentItem[fieldName] !== inlineEditData[fieldName];
    }

    if (!hasChanged) return;

    setSavingField(fieldName);

    if (isPreferenceItem) {
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
    // Set formMode based on current activeTab
    setFormMode(activeTab === "properties" ? "property" : "preference");
    setShowAddDialog(true);
  };

  const openEditDialog = (item: any, isPreference: boolean) => {
    setEditingItem(item);
    // Set formMode to decouple from activeTab
    setFormMode(isPreference ? "preference" : "property");
    if (isPreference) {
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

    if (formMode === "preference") {
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

  const handleDelete = (id: string, isPreference: boolean) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      if (isPreference) {
        deletePreferenceMutation.mutate(id);
      } else {
        deletePropertyMutation.mutate(id);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background flex flex-col items-center justify-center p-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">مرحباً بعودتك!</h1>
          <p className="text-muted-foreground">سجل الدخول للمتابعة إلى حسابك</p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
            <p className="text-sm text-muted-foreground">أدخل بياناتك للوصول لصفحتك الشخصية</p>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Login Type Toggle */}
            <div className="flex items-center justify-center gap-2 mb-6 p-1 bg-muted rounded-lg" data-testid="login-type-toggle">
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginType === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-login-type-admin"
              >
                مسؤول النظام
              </button>
              <button
                type="button"
                onClick={() => setLoginType("user")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginType === "user"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-login-type-user"
              >
                مستخدم
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">رقم الجوال</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="text-left pl-10"
                    data-testid="input-login-phone"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    className="text-left pl-10"
                    data-testid="input-login-password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{" "}
                {/* ✅ تم تحديث الرابط هنا ليتوجه إلى صفحة seller-form */}
                <Link href="/seller-form">
                  <span className="text-primary font-medium hover:underline cursor-pointer">سجل الآن مجاناً</span>
                </Link>
              </p>
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground">
          بركس - منصة التوفيق العقاري الذكية
        </p>
      </div>
    );
  }

  // Use formMode for dialog form type (decoupled from activeTab)
  const isAddingPreference = formMode === "preference";

  // Calculate stats
  const preferencesCount = Array.isArray(preferences) ? preferences.length : 0;
  const propertiesCount = Array.isArray(properties) ? properties.length : 0;

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const navItems = [
    { id: "preferences", label: "رغباتي", icon: Heart, count: preferencesCount },
    { id: "properties", label: "عروضي", icon: Building2, count: propertiesCount },
    { id: "matches", label: "المتطابقة", icon: Zap, count: 0 },
    { id: "messages", label: "الرسائل", icon: MessageCircle, count: 0 },
  ];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar side="right" className="border-l border-r-0">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold truncate">{userData?.name}</h2>
                <p className="text-xs text-muted-foreground" dir="ltr">{userData?.phone}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>القائمة</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <SidebarMenuButton data-testid="sidebar-home">
                        <Home className="h-4 w-4" />
                        <span className="flex-1">الرئيسية</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => handleTabChange(item.id)}
                          className={isActive ? "bg-primary/10 text-primary" : ""}
                          data-testid={`sidebar-${item.id}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1">{item.label}</span>
                          {item.count > 0 && (
                            <Badge variant="secondary" className="text-xs">{item.count}</Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Sidebar Trigger */}
          <header className="border-b bg-card p-4 flex items-center justify-between gap-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="font-bold text-xl">مرحباً، {userData?.name || "مستخدم"}</h1>
                <p className="text-sm text-muted-foreground">إدارة حسابك وعقاراتك</p>
              </div>
            </div>
          </header>

          {/* Dashboard Stats */}
          <div className="p-6 bg-gradient-to-l from-primary/5 to-transparent">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6">
              {/* Card 1 - Preferences */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleTabChange("preferences")}
                data-testid="stat-card-preferences"
                style={{paddingTop: '16px', paddingLeft: '16px'}}
              >
                <div 
                  className="absolute rounded-xl bg-gray-200 dark:bg-gray-700 shadow-sm"
                  style={{top: 0, right: 0, bottom: '16px', left: '16px'}}
                />
                <div 
                  className="absolute rounded-xl bg-gray-100 dark:bg-gray-600 shadow-sm"
                  style={{top: '8px', right: 0, bottom: '8px', left: '8px'}}
                />
                <Card className="relative p-6 shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">رغباتي</p>
                      <p className="text-3xl font-bold" data-testid="count-preferences">{preferencesCount}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Card 2 - Properties */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleTabChange("properties")}
                data-testid="stat-card-properties"
                style={{paddingTop: '16px', paddingLeft: '16px'}}
              >
                <div 
                  className="absolute rounded-xl bg-gray-200 dark:bg-gray-700 shadow-sm"
                  style={{top: 0, right: 0, bottom: '16px', left: '16px'}}
                />
                <div 
                  className="absolute rounded-xl bg-gray-100 dark:bg-gray-600 shadow-sm"
                  style={{top: '8px', right: 0, bottom: '8px', left: '8px'}}
                />
                <Card className="relative p-6 shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">عروضي</p>
                      <p className="text-3xl font-bold" data-testid="count-properties">{propertiesCount}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Card 3 - Matches */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleTabChange("matches")}
                data-testid="stat-card-matches"
                style={{paddingTop: '16px', paddingLeft: '16px'}}
              >
                <div 
                  className="absolute rounded-xl bg-gray-200 dark:bg-gray-700 shadow-sm"
                  style={{top: 0, right: 0, bottom: '16px', left: '16px'}}
                />
                <div 
                  className="absolute rounded-xl bg-gray-100 dark:bg-gray-600 shadow-sm"
                  style={{top: '8px', right: 0, bottom: '8px', left: '8px'}}
                />
                <Card className="relative p-6 shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">المتطابقة</p>
                      <p className="text-3xl font-bold" data-testid="count-matches">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Card 4 - Messages */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleTabChange("messages")}
                data-testid="stat-card-messages"
                style={{paddingTop: '16px', paddingLeft: '16px'}}
              >
                <div 
                  className="absolute rounded-xl bg-gray-200 dark:bg-gray-700 shadow-sm"
                  style={{top: 0, right: 0, bottom: '16px', left: '16px'}}
                />
                <div 
                  className="absolute rounded-xl bg-gray-100 dark:bg-gray-600 shadow-sm"
                  style={{top: '8px', right: 0, bottom: '8px', left: '8px'}}
                />
                <Card className="relative p-6 shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">الرسائل</p>
                      <p className="text-3xl font-bold" data-testid="count-messages">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">إجراءات سريعة:</span>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => { setEditingItem(null); resetForm(); setFormMode("preference"); setShowAddDialog(true); }} 
                    className="gap-2"
                    data-testid="button-quick-add-preference"
                  >
                    <Plus className="h-4 w-4" />
                    أضف رغبة جديدة
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => { setEditingItem(null); resetForm(); setFormMode("property"); setShowAddDialog(true); }}
                    className="gap-2"
                    data-testid="button-quick-add-property"
                  >
                    <Building2 className="h-4 w-4" />
                    أضف عقار للبيع
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-4">
            {/* Preferences Section */}
            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    رغباتي العقارية
                  </h2>
                  <Button onClick={() => { setEditingItem(null); resetForm(); setFormMode("preference"); setShowAddDialog(true); }} className="gap-2" data-testid="button-add-preference">
                    <Plus className="h-4 w-4" />
                    إضافة رغبة
                  </Button>
                </div>

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
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(pref.id, true)} data-testid={`button-delete-pref-${pref.id}`}>
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

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">نوع المعاملة</Label>
                                <Select 
                                  value={inlineEditData.transactionType || "buy"} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("transactionType", v, pref.id);
                                    setTimeout(() => handleInlineFieldBlur("transactionType", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-transaction-type-${pref.id}`}>
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="buy">شراء</SelectItem>
                                    <SelectItem value="rent">إيجار</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">طريقة الدفع</Label>
                                <Select 
                                  value={inlineEditData.paymentMethod || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("paymentMethod", v, pref.id);
                                    setTimeout(() => handleInlineFieldBlur("paymentMethod", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-payment-method-${pref.id}`}>
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">كاش</SelectItem>
                                    <SelectItem value="bank">تمويل بنكي</SelectItem>
                                    <SelectItem value="both">كاش أو بنك</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الغرض</Label>
                                <Select 
                                  value={inlineEditData.purpose || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("purpose", v, pref.id);
                                    setTimeout(() => handleInlineFieldBlur("purpose", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-purpose-${pref.id}`}>
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="residence">سكن</SelectItem>
                                    <SelectItem value="investment">استثمار</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">الجدول الزمني</Label>
                                <Select 
                                  value={inlineEditData.purchaseTimeline || ""} 
                                  onValueChange={(v) => {
                                    handleInlineFieldChange("purchaseTimeline", v, pref.id);
                                    setTimeout(() => handleInlineFieldBlur("purchaseTimeline", pref.id), 100);
                                  }}
                                >
                                  <SelectTrigger data-testid={`inline-select-timeline-${pref.id}`}>
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="asap">فوراً</SelectItem>
                                    <SelectItem value="within_month">خلال شهر</SelectItem>
                                    <SelectItem value="within_3months">خلال 3 أشهر</SelectItem>
                                    <SelectItem value="within_6months">خلال 6 أشهر</SelectItem>
                                    <SelectItem value="within_year">خلال سنة</SelectItem>
                                    <SelectItem value="flexible">مرن</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">نوع العميل</Label>
                              <Select 
                                value={inlineEditData.clientType || "direct"} 
                                onValueChange={(v) => {
                                  handleInlineFieldChange("clientType", v, pref.id);
                                  setTimeout(() => handleInlineFieldBlur("clientType", pref.id), 100);
                                }}
                              >
                                <SelectTrigger data-testid={`inline-select-client-type-${pref.id}`}>
                                  <SelectValue placeholder="اختر" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">مباشر (المالك)</SelectItem>
                                  <SelectItem value="broker">وسيط عقاري</SelectItem>
                                </SelectContent>
                              </Select>
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
            )}

            {/* Properties Section */}
            {activeTab === "properties" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    عروضي العقارية
                  </h2>
                  <Button onClick={() => { setEditingItem(null); resetForm(); setFormMode("property"); setShowAddDialog(true); }} className="gap-2 bg-green-600 hover:bg-green-700" data-testid="button-add-property">
                    <Plus className="h-4 w-4" />
                    إضافة عقار
                  </Button>
                </div>

                {properties && Array.isArray(properties) && properties.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Map className="h-4 w-4 text-green-600" />
                      خريطة عقاراتي
                    </h3>
                    <PropertyMap properties={properties as any[]} />
                  </div>
                ) : null}

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
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(prop.id, false)} data-testid={`button-delete-prop-${prop.id}`}>
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
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Ruler className="h-3 w-3" />
                                  المساحة (م²)
                                </Label>
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
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  عدد الغرف
                                </Label>
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

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Bath className="h-3 w-3" />
                                  دورات المياه
                                </Label>
                                <Input
                                  value={inlineEditData.bathrooms || ""}
                                  onChange={(e) => handleInlineFieldChange("bathrooms", e.target.value, prop.id)}
                                  onBlur={() => handleInlineFieldBlur("bathrooms", prop.id)}
                                  placeholder="مثال: 2"
                                  dir="ltr"
                                  data-testid={`inline-input-bathrooms-${prop.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  سنة البناء
                                </Label>
                                <Input
                                  value={inlineEditData.yearBuilt || ""}
                                  onChange={(e) => handleInlineFieldChange("yearBuilt", e.target.value, prop.id)}
                                  onBlur={() => handleInlineFieldBlur("yearBuilt", prop.id)}
                                  placeholder="مثال: 2020"
                                  dir="ltr"
                                  data-testid={`inline-input-year-built-${prop.id}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">التأثيث</Label>
                              <Select 
                                value={inlineEditData.furnishing || "unfurnished"} 
                                onValueChange={(v) => {
                                  handleInlineFieldChange("furnishing", v, prop.id);
                                  setTimeout(() => handleInlineFieldBlur("furnishing", prop.id), 100);
                                }}
                              >
                                <SelectTrigger data-testid={`inline-select-furnishing-${prop.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {furnishingOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">الوصف التفصيلي</Label>
                              <Textarea
                                value={inlineEditData.description || ""}
                                onChange={(e) => handleInlineFieldChange("description", e.target.value, prop.id)}
                                onBlur={() => handleInlineFieldBlur("description", prop.id)}
                                placeholder="اكتب وصفاً تفصيلياً للعقار..."
                                rows={4}
                                data-testid={`inline-textarea-description-${prop.id}`}
                              />
                            </div>

                            {/* Property Images */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                صور العقار ({inlineEditData.images?.length || 0})
                              </Label>
                              {inlineEditData.images && inlineEditData.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {inlineEditData.images.map((img: string, idx: number) => (
                                    <div key={idx} className="relative group">
                                      <img 
                                        src={img} 
                                        alt={`صورة ${idx + 1}`} 
                                        className="h-20 w-20 object-cover rounded-md border"
                                      />
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          const newImages = (inlineEditData.images || []).filter((_: any, i: number) => i !== idx);
                                          handleInlineFieldChange("images", newImages, prop.id);
                                          setTimeout(() => handleInlineFieldBlur("images", prop.id), 100);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <FileUploadButton
                                maxFiles={20}
                                onFilesUploaded={(urls) => {
                                  const currentImages = inlineEditData.images || [];
                                  const newImages = [...currentImages, ...urls];
                                  handleInlineFieldChange("images", newImages, prop.id);
                                  setTimeout(() => handleInlineFieldBlur("images", prop.id), 100);
                                }}
                                buttonVariant="outline"
                                buttonSize="sm"
                              >
                                <Upload className="h-3 w-3 ml-1" />
                                {inlineEditData.images && inlineEditData.images.length > 0 ? "إضافة المزيد" : "رفع صور"}
                              </FileUploadButton>
                            </div>

                            {/* Amenities */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                المزايا والخدمات
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {amenityOptions.map((amenity) => {
                                  const Icon = amenity.icon;
                                  const currentAmenities = inlineEditData.amenities || [];
                                  const isSelected = Array.isArray(currentAmenities) && currentAmenities.includes(amenity.id);
                                  return (
                                    <div
                                      key={amenity.id}
                                      onClick={() => {
                                        const newAmenities = isSelected
                                          ? currentAmenities.filter((a: string) => a !== amenity.id)
                                          : [...currentAmenities, amenity.id];
                                        handleInlineFieldChange("amenities", newAmenities, prop.id);
                                        setTimeout(() => handleInlineFieldBlur("amenities", prop.id), 100);
                                      }}
                                      className={`
                                        flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all
                                        ${isSelected
                                          ? "border-primary bg-primary/10"
                                          : "border-muted hover:border-primary/50"}
                                      `}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => {
                                          const newAmenities = isSelected
                                            ? currentAmenities.filter((a: string) => a !== amenity.id)
                                            : [...currentAmenities, amenity.id];
                                          handleInlineFieldChange("amenities", newAmenities, prop.id);
                                          setTimeout(() => handleInlineFieldBlur("amenities", prop.id), 100);
                                        }}
                                      />
                                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                      <span className={`text-xs ${isSelected ? "text-primary font-medium" : ""}`}>
                                        {amenity.label}
                                      </span>
                                    </div>
                                  );
                                })}
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
                    <p className="text-muted-foreground">لا توجد عقارات مسجلة</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={openAddDialog}>أضف عقارك الآن</Button>
                  </CardContent>
                </Card>
              )}
              </div>
            )}

            {/* Matches Section */}
            {activeTab === "matches" && (
              <MatchedPropertiesPanel preferences={Array.isArray(preferences) ? preferences : []} />
            )}

            {/* Messages Section */}
            {activeTab === "messages" && (
              userData?.id ? (
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
              )
            )}
          </main>
        </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingItem 
                ? (isAddingPreference ? "تعديل الرغبة" : "تعديل العقار")
                : (isAddingPreference ? "إضافة رغبة جديدة" : "إضافة عقار جديد")
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

            {isAddingPreference ? (
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

            {!isAddingPreference && (
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
                className={!isAddingPreference ? "bg-green-600 hover:bg-green-700" : ""}
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
    </SidebarProvider>
  );
}
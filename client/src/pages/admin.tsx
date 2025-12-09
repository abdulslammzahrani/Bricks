import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  TrendingUp,
  MapPin,
  Wallet,
  Home,
  RefreshCw,
  Search,
  Eye,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  UserCheck,
  UserX,
  Building,
  Handshake,
  LayoutDashboard,
  Settings,
  LogOut,
  Send,
  History,
  PlayCircle,
  StopCircle,
  Megaphone,
  Plus,
  Trash2,
  Power,
  PowerOff,
  ExternalLink,
  FileText,
  Save
} from "lucide-react";
import { SiFacebook, SiSnapchat, SiTiktok, SiGoogle, SiMailchimp } from "react-icons/si";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import type { User, BuyerPreference, Property, Match, ContactRequest, SendLog, StaticPage } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  building: "عمارة",
  land: "أرض",
  duplex: "دوبلكس",
  studio: "استوديو",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "كاش",
  bank: "تمويل بنكي",
};

const statusLabels: Record<string, string> = {
  ready: "جاهز",
  under_construction: "تحت الإنشاء",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} مليون`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} ألف`;
  }
  return value.toString();
};

// Convert phone number to Arabic numerals with last 3 digits masked
const toArabicPhone = (phone: string) => {
  if (!phone) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  // Convert all digits to Arabic first
  const arabicPhone = phone.replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
  // Mask last 3 characters
  if (arabicPhone.length > 3) {
    return arabicPhone.slice(0, -3) + '***';
  }
  return arabicPhone;
};

// Mask budget for privacy
const maskBudget = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "غير محدد";
  return "**";
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Client type with user info
interface ClientWithUser extends BuyerPreference {
  userName: string;
  userPhone: string;
  userEmail: string;
}

// Send log with enriched data
interface EnrichedSendLog extends SendLog {
  userName: string;
  userPhone: string;
  preferenceCity: string;
  propertyDetails: Array<{ id: string; city: string; district: string; price: number }>;
}

// Marketing setting type (matches API response - dates as strings)
interface MarketingSetting {
  id: string;
  platform: "facebook" | "snapchat" | "tiktok" | "google" | "mailchimp";
  pixelId: string | null;
  apiKey: string | null;
  accessToken: string | null;
  audienceId: string | null;
  conversionApiToken: string | null;
  testEventCode: string | null;
  dataCenter: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Platform display info
const platformInfo: Record<string, { name: string; icon: typeof SiFacebook; color: string; description: string }> = {
  facebook: { 
    name: "فيسبوك", 
    icon: SiFacebook, 
    color: "text-blue-600",
    description: "Facebook Pixel و Conversions API للتتبع والإعلانات"
  },
  snapchat: { 
    name: "سناب شات", 
    icon: SiSnapchat, 
    color: "text-yellow-500",
    description: "Snap Pixel للتتبع والإعلانات على سناب شات"
  },
  tiktok: { 
    name: "تيك توك", 
    icon: SiTiktok, 
    color: "text-foreground",
    description: "TikTok Pixel للتتبع والإعلانات على تيك توك"
  },
  google: { 
    name: "قوقل", 
    icon: SiGoogle, 
    color: "text-red-500",
    description: "Google Analytics و Google Ads للتتبع والإعلانات"
  },
  mailchimp: { 
    name: "ميلشيمب", 
    icon: SiMailchimp, 
    color: "text-yellow-600",
    description: "MailChimp للتسويق عبر البريد الإلكتروني"
  },
};

// Sidebar menu items
const menuItems = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "preferences", label: "الرغبات", icon: ClipboardList },
  { id: "properties", label: "العقارات", icon: Building2 },
  { id: "matches", label: "المطابقات", icon: Handshake },
  { id: "analytics", label: "التحليلات", icon: TrendingUp },
  { id: "sending", label: "الإرسال", icon: Send },
  { id: "marketing", label: "التسويق", icon: Megaphone },
  { id: "pages", label: "الصفحات التعريفية", icon: FileText },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedCity, setSelectedCity] = useState("جدة");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sendingClientId, setSendingClientId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<{
    totalBuyers: number;
    totalSellers: number;
    totalProperties: number;
    totalPreferences: number;
    totalMatches?: number;
    totalContacts?: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: preferences = [], isLoading: prefsLoading } = useQuery<BuyerPreference[]>({
    queryKey: ["/api/admin/preferences"],
  });

  const { data: properties = [], isLoading: propsLoading, refetch: refetchProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/admin/matches"],
  });

  const { data: contactRequests = [] } = useQuery<ContactRequest[]>({
    queryKey: ["/api/admin/contact-requests"],
  });

  // Clients with preferences for sending
  const { data: clients = [], refetch: refetchClients } = useQuery<ClientWithUser[]>({
    queryKey: ["/api/admin/clients"],
  });

  // Send logs
  const { data: sendLogs = [], refetch: refetchSendLogs } = useQuery<EnrichedSendLog[]>({
    queryKey: ["/api/admin/send-logs"],
  });

  // Marketing settings
  const { data: marketingSettings = [], refetch: refetchMarketing } = useQuery<MarketingSetting[]>({
    queryKey: ["/api/admin/marketing"],
  });

  // New marketing platform state
  const [newPlatform, setNewPlatform] = useState<string>("");
  const [newPixelId, setNewPixelId] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [editingMarketing, setEditingMarketing] = useState<MarketingSetting | null>(null);

  const { data: topDistricts = [] } = useQuery<Array<{ district: string; count: number }>>({
    queryKey: ["/api/admin/analytics/top-districts", selectedCity],
  });

  const { data: budgetByCity = [] } = useQuery<Array<{ city: string; avgBudget: number }>>({
    queryKey: ["/api/admin/analytics/budget-by-city"],
  });

  const { data: demandByType = [] } = useQuery<Array<{ propertyType: string; count: number }>>({
    queryKey: ["/api/admin/analytics/demand-by-type"],
  });

  const togglePropertyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/properties/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  // Send to single client
  const sendToClientMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      setSendingClientId(preferenceId);
      return apiRequest("POST", `/api/admin/clients/${preferenceId}/send`, { maxProperties: 5 });
    },
    onSuccess: (data: any) => {
      toast({
        title: "تم الإرسال",
        description: data.message || `تم إرسال العقارات بنجاح`,
      });
      refetchSendLogs();
      refetchClients();
      setSendingClientId(null);
    },
    onError: (error: any) => {
      toast({
        title: "فشل الإرسال",
        description: error.message || "حدث خطأ أثناء الإرسال",
        variant: "destructive",
      });
      setSendingClientId(null);
    },
  });

  // Toggle client status
  const toggleClientStatusMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      return apiRequest("PATCH", `/api/admin/clients/${preferenceId}/toggle-status`);
    },
    onSuccess: () => {
      refetchClients();
      toast({
        title: "تم التحديث",
        description: "تم تغيير حالة العميل",
      });
    },
  });

  // Bulk send to all
  const bulkSendMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/send-all", { maxPropertiesPerClient: 5 });
    },
    onSuccess: (data: any) => {
      toast({
        title: "تم الإرسال الجماعي",
        description: `تم الإرسال لـ ${data.successful} عميل من أصل ${data.total}`,
      });
      refetchSendLogs();
      refetchClients();
    },
    onError: (error: any) => {
      toast({
        title: "فشل الإرسال",
        description: error.message || "حدث خطأ أثناء الإرسال الجماعي",
        variant: "destructive",
      });
    },
  });

  // Create or update marketing setting (uses PUT with platform in URL)
  const createMarketingMutation = useMutation({
    mutationFn: async (data: { platform: string; pixelId?: string; apiKey?: string; accessToken?: string; isEnabled?: boolean }) => {
      return apiRequest("PUT", `/api/admin/marketing/${data.platform}`, {
        isEnabled: data.isEnabled ?? true,
        pixelId: data.pixelId,
        apiKey: data.apiKey,
        accessToken: data.accessToken,
      });
    },
    onSuccess: () => {
      toast({ title: "تم الإضافة", description: "تم إضافة منصة التسويق بنجاح" });
      refetchMarketing();
      setNewPlatform("");
      setNewPixelId("");
      setNewApiKey("");
      setNewAccessToken("");
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في إضافة المنصة", variant: "destructive" });
    },
  });

  // Update marketing setting
  const updateMarketingMutation = useMutation({
    mutationFn: async ({ platform, ...data }: { platform: string; pixelId?: string; apiKey?: string; accessToken?: string; isEnabled?: boolean }) => {
      return apiRequest("PUT", `/api/admin/marketing/${platform}`, data);
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث إعدادات المنصة" });
      refetchMarketing();
      setEditingMarketing(null);
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في التحديث", variant: "destructive" });
    },
  });

  // Delete marketing setting
  const deleteMarketingMutation = useMutation({
    mutationFn: async (platform: string) => {
      return apiRequest("DELETE", `/api/admin/marketing/${platform}`);
    },
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف منصة التسويق" });
      refetchMarketing();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في الحذف", variant: "destructive" });
    },
  });

  // Toggle marketing setting status
  const toggleMarketingMutation = useMutation({
    mutationFn: async ({ platform, isEnabled }: { platform: string; isEnabled: boolean }) => {
      return apiRequest("PUT", `/api/admin/marketing/${platform}`, { isEnabled });
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تغيير حالة المنصة" });
      refetchMarketing();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في التحديث", variant: "destructive" });
    },
  });

  const isLoading = statsLoading || usersLoading || prefsLoading || propsLoading;

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsers();
    refetchProperties();
  };

  // Derived data
  const buyers = users.filter(u => u.role === "buyer");
  const sellers = users.filter(u => u.role === "seller");
  const activePreferences = preferences.filter(p => p.isActive);
  const activeProperties = properties.filter(p => p.isActive);

  const filteredUsers = users.filter(u => {
    if (userFilter !== "all" && u.role !== userFilter) return false;
    if (searchQuery && !u.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !u.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredProperties = properties.filter(p => {
    if (propertyFilter === "active" && !p.isActive) return false;
    if (propertyFilter === "inactive" && p.isActive) return false;
    if (propertyFilter === "apartment" && p.propertyType !== "apartment") return false;
    if (propertyFilter === "villa" && p.propertyType !== "villa") return false;
    if (propertyFilter === "land" && p.propertyType !== "land") return false;
    return true;
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">تطابق</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>لوحة التحكم</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        tooltip={item.label}
                        data-testid={`sidebar-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">العودة للرئيسية</span>
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAll}
                disabled={isLoading}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </header>

          {/* Main Area */}
          <main className="flex-1 overflow-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card data-testid="card-stat-buyers">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">{buyers.length} نشط</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats?.totalBuyers || 0}</p>
                    <p className="text-xs text-muted-foreground">المشترين</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-sellers">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Building className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats?.totalSellers || 0}</p>
                    <p className="text-xs text-muted-foreground">البائعين</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-properties">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Home className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">{activeProperties.length} متاح</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats?.totalProperties || 0}</p>
                    <p className="text-xs text-muted-foreground">العقارات</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-preferences">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <ClipboardList className="h-5 w-5 text-purple-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">{activePreferences.length} نشط</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stats?.totalPreferences || 0}</p>
                    <p className="text-xs text-muted-foreground">الرغبات</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-matches">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <Target className="h-5 w-5 text-pink-500" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{matches.length}</p>
                    <p className="text-xs text-muted-foreground">المطابقات</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-contacts">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <MessageSquare className="h-5 w-5 text-teal-500" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{contactRequests.length}</p>
                    <p className="text-xs text-muted-foreground">طلبات التواصل</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Content Based on Active Section */}
            {activeSection === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Quick Stats */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        ملخص سريع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <p className="text-2xl font-bold">{buyers.length}</p>
                          <p className="text-sm text-muted-foreground">مشتري نشط</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <Building className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                          <p className="text-2xl font-bold">{sellers.length}</p>
                          <p className="text-sm text-muted-foreground">بائع مسجل</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <Home className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                          <p className="text-2xl font-bold">{activeProperties.length}</p>
                          <p className="text-sm text-muted-foreground">عقار متاح</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                          <p className="text-2xl font-bold">{matches.length}</p>
                          <p className="text-sm text-muted-foreground">مطابقة ناجحة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        آخر النشاطات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                          {preferences.slice(0, 5).map((pref, idx) => (
                            <div key={pref.id} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                              <div className="p-2 rounded-full bg-blue-500/10">
                                <Users className="h-4 w-4 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">رغبة جديدة - {pref.city}</p>
                                <p className="text-xs text-muted-foreground">{propertyTypeLabels[pref.propertyType] || pref.propertyType}</p>
                              </div>
                            </div>
                          ))}
                          {preferences.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">لا توجد نشاطات</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        أكثر الأحياء طلباً في {selectedCity}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topDistricts && topDistricts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={topDistricts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="district" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        توزيع أنواع العقارات المطلوبة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {demandByType && demandByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={demandByType.map(d => ({ ...d, name: propertyTypeLabels[d.propertyType] || d.propertyType }))}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {demandByType.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle>المستخدمين ({users.length})</CardTitle>
                      <CardDescription>إدارة جميع المستخدمين المسجلين</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="بحث..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-9 w-[200px]"
                          data-testid="input-search-users"
                        />
                      </div>
                      <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="الكل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="buyer">مشتري</SelectItem>
                          <SelectItem value="seller">بائع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-sm font-medium">
                      <div className="col-span-3">الاسم</div>
                      <div className="col-span-3">البريد</div>
                      <div className="col-span-2">الجوال</div>
                      <div className="col-span-2">النوع</div>
                      <div className="col-span-2">الإجراءات</div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div key={user.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center hover:bg-muted/30">
                            <div className="col-span-3 font-medium truncate">{user.name}</div>
                            <div className="col-span-3 text-sm text-muted-foreground truncate">{user.email}</div>
                            <div className="col-span-2 text-sm" dir="rtl">{toArabicPhone(user.phone || '')}</div>
                            <div className="col-span-2">
                              <Badge variant={user.role === "buyer" ? "default" : "secondary"}>
                                {user.role === "buyer" ? "مشتري" : user.role === "seller" ? "بائع" : "مدير"}
                              </Badge>
                            </div>
                            <div className="col-span-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>تفاصيل المستخدم</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-3 rounded-full bg-primary/10">
                                        <Users className="h-6 w-6 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-lg">{user.name}</p>
                                        <Badge variant={user.role === "buyer" ? "default" : "secondary"}>
                                          {user.role === "buyer" ? "مشتري" : "بائع"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span dir="rtl">{toArabicPhone(user.phone || '')}</span>
                                      </div>
                                      {user.accountType && (
                                        <div className="flex items-center gap-2">
                                          <Building2 className="h-4 w-4 text-muted-foreground" />
                                          <span>{user.accountType === "individual" ? "فرد" : user.accountType === "developer" ? "مطور" : "مكتب عقاري"}</span>
                                        </div>
                                      )}
                                      {user.entityName && (
                                        <div className="flex items-center gap-2">
                                          <Building className="h-4 w-4 text-muted-foreground" />
                                          <span>{user.entityName}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          لا يوجد مستخدمين
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "preferences" && (
              <Card>
                <CardHeader>
                  <CardTitle>رغبات المشترين ({preferences.length})</CardTitle>
                  <CardDescription>جميع طلبات الشراء المسجلة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {preferences.length > 0 ? (
                        preferences.map((pref) => {
                          const user = users.find(u => u.id === pref.userId);
                          return (
                            <Card key={pref.id} className="p-4">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary">{pref.city}</Badge>
                                    <Badge variant="outline">{propertyTypeLabels[pref.propertyType] || pref.propertyType}</Badge>
                                    {pref.paymentMethod && (
                                      <Badge variant="outline">{paymentMethodLabels[pref.paymentMethod] || pref.paymentMethod}</Badge>
                                    )}
                                    {pref.purpose && (
                                      <Badge variant="outline">{pref.purpose === "residence" ? "سكن" : "استثمار"}</Badge>
                                    )}
                                  </div>
                                  {user && (
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {user.name}
                                      </span>
                                      <span className="flex items-center gap-1" dir="rtl">
                                        <Phone className="h-3 w-3" />
                                        {toArabicPhone(user.phone || '')}
                                      </span>
                                    </div>
                                  )}
                                  {pref.districts && pref.districts.length > 0 && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">الأحياء: </span>
                                      {pref.districts.join("، ")}
                                    </div>
                                  )}
                                  {(pref.budgetMin || pref.budgetMax) && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">الميزانية: </span>
                                      {maskBudget(pref.budgetMin, pref.budgetMax)}
                                    </div>
                                  )}
                                  {pref.rooms && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">الغرف: </span>{pref.rooms}
                                    </div>
                                  )}
                                </div>
                                <Badge className={pref.isActive ? "bg-green-500" : "bg-muted"}>
                                  {pref.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              </div>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد رغبات مسجلة
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {activeSection === "properties" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle>العقارات ({properties.length})</CardTitle>
                      <CardDescription>إدارة العقارات المعروضة</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="الكل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="apartment">شقة</SelectItem>
                          <SelectItem value="villa">فيلا</SelectItem>
                          <SelectItem value="land">أرض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((prop) => {
                          const seller = users.find(u => u.id === prop.sellerId);
                          return (
                            <Card key={prop.id} className="p-4">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary">{prop.city}</Badge>
                                    <Badge variant="outline">{prop.district}</Badge>
                                    <Badge variant="outline">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</Badge>
                                    <Badge variant="outline">{statusLabels[prop.status] || prop.status}</Badge>
                                  </div>
                                  <div className="text-xl font-bold text-primary">
                                    {formatCurrency(prop.price)} ريال
                                  </div>
                                  {seller && (
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {seller.name}
                                      </span>
                                      <span className="flex items-center gap-1" dir="rtl">
                                        <Phone className="h-3 w-3" />
                                        {toArabicPhone(seller.phone || '')}
                                      </span>
                                    </div>
                                  )}
                                  {prop.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{prop.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {prop.viewsCount || 0} مشاهدة
                                    </span>
                                    {prop.area && <span>المساحة: {prop.area}</span>}
                                    {prop.rooms && <span>الغرف: {prop.rooms}</span>}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                  <Badge className={prop.isActive ? "bg-green-500" : "bg-red-500"}>
                                    {prop.isActive ? "نشط" : "موقوف"}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant={prop.isActive ? "destructive" : "default"}
                                    onClick={() => togglePropertyMutation.mutate({ id: prop.id, isActive: !prop.isActive })}
                                    disabled={togglePropertyMutation.isPending}
                                  >
                                    {prop.isActive ? (
                                      <>
                                        <XCircle className="h-4 w-4 ml-1" />
                                        إيقاف
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 ml-1" />
                                        تفعيل
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد عقارات
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {activeSection === "matches" && (
              <Card>
                <CardHeader>
                  <CardTitle>المطابقات ({matches.length})</CardTitle>
                  <CardDescription>نتائج المطابقة بين الرغبات والعقارات</CardDescription>
                </CardHeader>
                <CardContent>
                  {matches.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {matches.map((match) => {
                          const pref = preferences.find(p => p.id === match.buyerPreferenceId);
                          const prop = properties.find(p => p.id === match.propertyId);
                          const buyer = pref ? users.find(u => u.id === pref.userId) : null;
                          
                          return (
                            <Card key={match.id} className="p-4">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">{buyer?.name || "مشتري"}</span>
                                    </div>
                                    <Handshake className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex items-center gap-2">
                                      <Home className="h-4 w-4 text-green-500" />
                                      <span className="font-medium">{prop?.district || "عقار"}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                                    {pref && <Badge variant="outline">{pref.city}</Badge>}
                                    {prop && <Badge variant="outline">{formatCurrency(prop.price)} ريال</Badge>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{match.matchScore}%</div>
                                    <div className="text-xs text-muted-foreground">تطابق</div>
                                  </div>
                                  {match.isSaved && <Badge className="bg-yellow-500">محفوظ</Badge>}
                                  {match.isContacted && <Badge className="bg-green-500">تم التواصل</Badge>}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد مطابقات بعد
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "analytics" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        متوسط الميزانيات حسب المدينة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {budgetByCity && budgetByCity.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={budgetByCity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="city" />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`} />
                            <Tooltip formatter={(value: number) => [`${formatCurrency(value)} ريال`, "متوسط الميزانية"]} />
                            <Bar dataKey="avgBudget" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        توزيع العقارات حسب النوع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(
                          properties.reduce((acc, prop) => {
                            acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => (
                          <div key={type} className="flex items-center gap-4">
                            <div className="w-24 text-sm">{propertyTypeLabels[type] || type}</div>
                            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(count / properties.length) * 100}%` }}
                              />
                            </div>
                            <div className="w-12 text-sm text-muted-foreground">{count}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        توزيع الطلبات حسب المدينة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(
                          preferences.reduce((acc, pref) => {
                            acc[pref.city] = (acc[pref.city] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([city, count]) => (
                          <Card key={city} className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{count}</div>
                            <div className="text-sm text-muted-foreground">{city}</div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "sending" && (
              <div className="space-y-4">
                {/* Bulk Send Button */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Send className="h-5 w-5 text-primary" />
                          إرسال العقارات للعملاء
                        </CardTitle>
                        <CardDescription>
                          إرسال العقارات المطابقة لجميع العملاء النشطين عبر واتساب
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => bulkSendMutation.mutate()} 
                        disabled={bulkSendMutation.isPending}
                        data-testid="button-bulk-send"
                      >
                        {bulkSendMutation.isPending ? (
                          <>
                            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="ml-2 h-4 w-4" />
                            إرسال للجميع
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Clients Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      جدول العملاء ({clients.length})
                    </CardTitle>
                    <CardDescription>
                      العملاء المسجلين وتفضيلاتهم - إرسال يدوي أو تغيير الحالة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {clients.length > 0 ? (
                        <div className="space-y-3">
                          {clients.map((client) => (
                            <Card 
                              key={client.id} 
                              className="p-4"
                              data-testid={`row-client-${client.id}`}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div>
                                    <p className="font-medium">{client.userName}</p>
                                    <p className="text-sm text-muted-foreground" dir="ltr">{client.userPhone}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={client.isActive ? "default" : "outline"}
                                      className={client.isActive ? "bg-green-600" : ""}
                                      onClick={() => toggleClientStatusMutation.mutate(client.id)}
                                      disabled={toggleClientStatusMutation.isPending}
                                      data-testid={`button-toggle-status-${client.id}`}
                                    >
                                      {client.isActive ? (
                                        <PlayCircle className="h-4 w-4" />
                                      ) : (
                                        <StopCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => sendToClientMutation.mutate(client.id)}
                                      disabled={sendToClientMutation.isPending && sendingClientId === client.id}
                                      data-testid={`button-send-${client.id}`}
                                    >
                                      {sendToClientMutation.isPending && sendingClientId === client.id ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="secondary">{client.city}</Badge>
                                  <Badge variant="outline">{propertyTypeLabels[client.propertyType] || client.propertyType}</Badge>
                                  {client.isActive ? (
                                    <Badge className="bg-green-600">نشط</Badge>
                                  ) : (
                                    <Badge variant="outline">متوقف</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span>الأحياء: </span>
                                  {client.districts?.join("، ") || "-"}
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">الميزانية: </span>
                                  <span className="font-medium">{maskBudget(client.budgetMin, client.budgetMax)}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          لا يوجد عملاء مسجلين
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Properties Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      جدول العقارات ({properties.length})
                    </CardTitle>
                    <CardDescription>
                      العقارات المتاحة للإرسال - تغيير التوفر
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {properties.length > 0 ? (
                        <div className="space-y-3">
                          {properties.map((prop) => (
                            <Card 
                              key={prop.id} 
                              className="p-4"
                              data-testid={`row-property-${prop.id}`}
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary">{prop.city}</Badge>
                                    <Badge variant="outline">{prop.district}</Badge>
                                    <Badge variant="outline">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</Badge>
                                    <Badge variant="secondary">{statusLabels[prop.status] || prop.status}</Badge>
                                  </div>
                                  <div className="text-lg font-bold text-primary">
                                    {formatCurrency(prop.price)} ريال
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={prop.isActive ? "default" : "destructive"}
                                  onClick={() => togglePropertyMutation.mutate({ id: prop.id, isActive: !prop.isActive })}
                                  disabled={togglePropertyMutation.isPending}
                                  data-testid={`button-toggle-property-${prop.id}`}
                                >
                                  {prop.isActive ? "متاح" : "غير متاح"}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          لا توجد عقارات
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Send Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      سجل الإرسال ({sendLogs.length})
                    </CardTitle>
                    <CardDescription>
                      سجل العمليات المرسلة عبر واتساب
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {sendLogs.length > 0 ? (
                        <div className="space-y-3">
                          {sendLogs.map((log) => (
                            <Card key={log.id} className="p-4" data-testid={`card-sendlog-${log.id}`}>
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-medium">{log.userName}</span>
                                    <span className="text-sm text-muted-foreground" dir="ltr">{log.userPhone}</span>
                                    <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                                      {log.status === "sent" ? "تم الإرسال" : log.status === "failed" ? "فشل" : "قيد الانتظار"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">
                                      {log.messageType === "matches" ? `${log.propertyIds?.length || 0} عقارات` : "لا توجد عقارات"}
                                    </Badge>
                                    {log.preferenceCity && (
                                      <Badge variant="secondary">{log.preferenceCity}</Badge>
                                    )}
                                  </div>
                                  {log.propertyDetails && Array.isArray(log.propertyDetails) && log.propertyDetails.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {log.propertyDetails.map((p, idx) => (
                                        <span key={p?.id || idx}>
                                          {p?.district || "-"} ({formatCurrency(p?.price || 0)})
                                          {idx < log.propertyDetails.length - 1 ? "، " : ""}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-left text-sm text-muted-foreground">
                                  {log.sentAt && formatDate(log.sentAt.toString())}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد سجلات إرسال بعد
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "marketing" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Megaphone className="h-5 w-5 text-primary" />
                          إعدادات التسويق الرقمي
                        </CardTitle>
                        <CardDescription>
                          إدارة أكواد التتبع ومنصات التسويق الرقمي
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchMarketing()}
                        data-testid="button-refresh-marketing"
                      >
                        <RefreshCw className="h-4 w-4 ml-2" />
                        تحديث
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      إضافة منصة تسويق
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">المنصة</label>
                        <Select value={newPlatform} onValueChange={setNewPlatform}>
                          <SelectTrigger data-testid="select-marketing-platform">
                            <SelectValue placeholder="اختر المنصة" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(platformInfo)
                              .filter(([key]) => !marketingSettings.some(s => s.platform === key))
                              .map(([key, info]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <info.icon className={`h-4 w-4 ${info.color}`} />
                                    {info.name}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Pixel ID</label>
                        <Input
                          value={newPixelId}
                          onChange={(e) => setNewPixelId(e.target.value)}
                          placeholder="مثال: 123456789"
                          dir="ltr"
                          data-testid="input-pixel-id"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">API Key (اختياري)</label>
                        <Input
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          placeholder="مفتاح API"
                          dir="ltr"
                          type="password"
                          data-testid="input-api-key"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Access Token (اختياري)</label>
                        <Input
                          value={newAccessToken}
                          onChange={(e) => setNewAccessToken(e.target.value)}
                          placeholder="رمز الوصول"
                          dir="ltr"
                          type="password"
                          data-testid="input-access-token"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => createMarketingMutation.mutate({
                        platform: newPlatform,
                        pixelId: newPixelId || undefined,
                        apiKey: newApiKey || undefined,
                        accessToken: newAccessToken || undefined,
                      })}
                      disabled={!newPlatform || createMarketingMutation.isPending}
                      data-testid="button-add-platform"
                    >
                      {createMarketingMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة المنصة
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      المنصات المتصلة ({marketingSettings.length})
                    </CardTitle>
                    <CardDescription>
                      المنصات المضافة وإعداداتها - يمكنك تفعيل أو إيقاف كل منصة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {marketingSettings.length > 0 ? (
                      <div className="space-y-4">
                        {marketingSettings.map((setting) => {
                          const info = platformInfo[setting.platform];
                          const Icon = info?.icon || Megaphone;
                          return (
                            <Card 
                              key={setting.id} 
                              className="p-4"
                              data-testid={`card-marketing-${setting.platform}`}
                            >
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-muted`}>
                                      <Icon className={`h-6 w-6 ${info?.color || ""}`} />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{info?.name || setting.platform}</h4>
                                      <p className="text-sm text-muted-foreground">{info?.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={setting.isEnabled ? "default" : "secondary"}>
                                      {setting.isEnabled ? "مفعل" : "معطل"}
                                    </Badge>
                                    <Button
                                      size="icon"
                                      variant={setting.isEnabled ? "default" : "outline"}
                                      onClick={() => toggleMarketingMutation.mutate({ 
                                        platform: setting.platform, 
                                        isEnabled: !setting.isEnabled 
                                      })}
                                      disabled={toggleMarketingMutation.isPending}
                                      data-testid={`button-toggle-${setting.platform}`}
                                    >
                                      {setting.isEnabled ? (
                                        <Power className="h-4 w-4" />
                                      ) : (
                                        <PowerOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      onClick={() => deleteMarketingMutation.mutate(setting.platform)}
                                      disabled={deleteMarketingMutation.isPending}
                                      data-testid={`button-delete-${setting.platform}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {editingMarketing?.id === setting.id ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                                    <div>
                                      <label className="text-sm text-muted-foreground mb-2 block">Pixel ID</label>
                                      <Input
                                        value={editingMarketing.pixelId || ""}
                                        onChange={(e) => setEditingMarketing({ ...editingMarketing, pixelId: e.target.value })}
                                        dir="ltr"
                                        data-testid={`input-edit-pixel-${setting.platform}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                                      <Input
                                        value={editingMarketing.apiKey || ""}
                                        onChange={(e) => setEditingMarketing({ ...editingMarketing, apiKey: e.target.value })}
                                        dir="ltr"
                                        type="password"
                                        data-testid={`input-edit-apikey-${setting.platform}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-muted-foreground mb-2 block">Access Token</label>
                                      <Input
                                        value={editingMarketing.accessToken || ""}
                                        onChange={(e) => setEditingMarketing({ ...editingMarketing, accessToken: e.target.value })}
                                        dir="ltr"
                                        type="password"
                                        data-testid={`input-edit-token-${setting.platform}`}
                                      />
                                    </div>
                                    <div className="md:col-span-3 flex gap-2">
                                      <Button
                                        onClick={() => updateMarketingMutation.mutate({
                                          platform: setting.platform,
                                          pixelId: editingMarketing.pixelId || undefined,
                                          apiKey: editingMarketing.apiKey || undefined,
                                          accessToken: editingMarketing.accessToken || undefined,
                                          isEnabled: setting.isEnabled,
                                        })}
                                        disabled={updateMarketingMutation.isPending}
                                        data-testid={`button-save-${setting.platform}`}
                                      >
                                        {updateMarketingMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingMarketing(null)}
                                      >
                                        إلغاء
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-4 text-sm pt-2 border-t">
                                    <div>
                                      <span className="text-muted-foreground">Pixel ID: </span>
                                      <span dir="ltr" className="font-mono">{setting.pixelId || "-"}</span>
                                    </div>
                                    {setting.apiKey && (
                                      <div>
                                        <span className="text-muted-foreground">API Key: </span>
                                        <span className="font-mono">••••••</span>
                                      </div>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingMarketing(setting)}
                                      data-testid={`button-edit-${setting.platform}`}
                                    >
                                      تعديل
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        لم تتم إضافة أي منصات تسويق بعد
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      روابط مفيدة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <a 
                        href="https://business.facebook.com/events_manager" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                      >
                        <SiFacebook className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Facebook Events Manager</p>
                          <p className="text-sm text-muted-foreground">إدارة الأحداث والبكسل</p>
                        </div>
                      </a>
                      <a 
                        href="https://ads.tiktok.com/marketing_api/docs" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                      >
                        <SiTiktok className="h-6 w-6" />
                        <div>
                          <p className="font-medium">TikTok Ads Manager</p>
                          <p className="text-sm text-muted-foreground">إدارة إعلانات تيك توك</p>
                        </div>
                      </a>
                      <a 
                        href="https://ads.snapchat.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                      >
                        <SiSnapchat className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="font-medium">Snapchat Ads Manager</p>
                          <p className="text-sm text-muted-foreground">إدارة إعلانات سناب</p>
                        </div>
                      </a>
                      <a 
                        href="https://analytics.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                      >
                        <SiGoogle className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-medium">Google Analytics</p>
                          <p className="text-sm text-muted-foreground">تحليلات قوقل</p>
                        </div>
                      </a>
                      <a 
                        href="https://mailchimp.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                      >
                        <SiMailchimp className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium">MailChimp</p>
                          <p className="text-sm text-muted-foreground">التسويق بالبريد</p>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Static Pages Section */}
            {activeSection === "pages" && (
              <StaticPagesSection />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Static Pages Management Component
function StaticPagesSection() {
  const { toast } = useToast();
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Record<string, { titleAr: string; contentAr: string; isPublished: boolean }>>({
    faq: { titleAr: "الأسئلة الشائعة", contentAr: "", isPublished: true },
    privacy: { titleAr: "سياسة الخصوصية", contentAr: "", isPublished: true },
    terms: { titleAr: "الشروط والأحكام", contentAr: "", isPublished: true },
  });

  const { data: pages = [], isLoading } = useQuery<StaticPage[]>({
    queryKey: ["/api/admin/pages"],
  });

  // Update local state when pages are loaded
  useState(() => {
    if (pages.length > 0) {
      const newData: Record<string, { titleAr: string; contentAr: string; isPublished: boolean }> = { ...pageData };
      pages.forEach(page => {
        newData[page.slug] = {
          titleAr: page.titleAr,
          contentAr: page.contentAr,
          isPublished: page.isPublished,
        };
      });
      setPageData(newData);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { slug: string; titleAr: string; contentAr: string; isPublished: boolean }) => {
      return apiRequest("POST", "/api/admin/pages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "تم الحفظ", description: "تم حفظ الصفحة بنجاح" });
      setEditingPage(null);
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ الصفحة", variant: "destructive" });
    },
  });

  const pageLabels: Record<string, string> = {
    faq: "الأسئلة الشائعة",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
  };

  const defaultContent: Record<string, string> = {
    faq: `<h2>ما هي منصة تطابق؟</h2>
<p>تطابق هي منصة مطابقة عقارية ذكية تربط بين المشترين والبائعين في السوق العقاري السعودي.</p>

<h2>كيف يمكنني تسجيل رغبتي العقارية؟</h2>
<p>يمكنك تسجيل رغبتك العقارية من خلال الصفحة الرئيسية عبر المحادثة الذكية مع مساعدنا الآلي.</p>

<h2>هل الخدمة مجانية؟</h2>
<p>نعم، تسجيل الرغبات العقارية مجاني تماماً.</p>

<h2>كيف سأعرف بالعقارات المطابقة؟</h2>
<p>سنرسل لك إشعارات أسبوعية عبر الواتساب بالعقارات التي تتطابق مع متطلباتك.</p>`,
    privacy: `<h2>سياسة الخصوصية</h2>
<p>نحن في تطابق نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>

<h3>البيانات التي نجمعها</h3>
<ul>
<li>الاسم ورقم الهاتف</li>
<li>تفضيلات العقار (المدينة، النوع، الميزانية)</li>
<li>بيانات التواصل</li>
</ul>

<h3>كيف نستخدم بياناتك</h3>
<p>نستخدم بياناتك فقط لمطابقتك بالعقارات المناسبة وإرسال الإشعارات ذات الصلة.</p>

<h3>حماية البيانات</h3>
<p>نستخدم أحدث تقنيات التشفير لحماية بياناتك.</p>`,
    terms: `<h2>الشروط والأحكام</h2>

<h3>القبول</h3>
<p>باستخدامك لمنصة تطابق، فإنك توافق على هذه الشروط والأحكام.</p>

<h3>الخدمات</h3>
<p>نقدم خدمة مطابقة عقارية تربط بين الباحثين عن عقارات والبائعين.</p>

<h3>المسؤولية</h3>
<p>المنصة ليست طرفاً في أي صفقة عقارية وتقتصر مسؤوليتها على تقديم خدمة المطابقة.</p>

<h3>الاستخدام</h3>
<p>يجب استخدام المنصة لأغراض مشروعة فقط ووفقاً لأنظمة المملكة العربية السعودية.</p>`,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">الصفحات التعريفية</h2>
        <p className="text-muted-foreground">تعديل صفحات الأسئلة الشائعة وسياسة الخصوصية والشروط والأحكام</p>
      </div>

      <div className="grid gap-6">
        {["faq", "privacy", "terms"].map((slug) => {
          const page = pages.find(p => p.slug === slug);
          const isEditing = editingPage === slug;
          const currentData = pageData[slug] || { titleAr: pageLabels[slug], contentAr: "", isPublished: true };

          return (
            <Card key={slug}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{pageLabels[slug]}</CardTitle>
                    <CardDescription>/{slug}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {page ? (
                    <Badge variant="secondary">محفوظة</Badge>
                  ) : (
                    <Badge variant="outline">جديدة</Badge>
                  )}
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (!pageData[slug]?.contentAr) {
                          setPageData(prev => ({
                            ...prev,
                            [slug]: {
                              titleAr: page?.titleAr || pageLabels[slug],
                              contentAr: page?.contentAr || defaultContent[slug],
                              isPublished: page?.isPublished ?? true,
                            }
                          }));
                        }
                        setEditingPage(slug);
                      }}
                      data-testid={`button-edit-${slug}`}
                    >
                      تعديل
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          saveMutation.mutate({
                            slug,
                            ...currentData,
                          });
                        }}
                        disabled={saveMutation.isPending}
                        data-testid={`button-save-${slug}`}
                      >
                        <Save className="h-4 w-4 ml-1" />
                        حفظ
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingPage(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {isEditing && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">عنوان الصفحة</label>
                    <Input
                      value={currentData.titleAr}
                      onChange={(e) => setPageData(prev => ({
                        ...prev,
                        [slug]: { ...currentData, titleAr: e.target.value }
                      }))}
                      placeholder="عنوان الصفحة"
                      data-testid={`input-title-${slug}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">محتوى الصفحة (HTML)</label>
                    <Textarea
                      value={currentData.contentAr}
                      onChange={(e) => setPageData(prev => ({
                        ...prev,
                        [slug]: { ...currentData, contentAr: e.target.value }
                      }))}
                      placeholder="محتوى الصفحة بصيغة HTML"
                      className="min-h-[300px] font-mono text-sm"
                      dir="ltr"
                      data-testid={`textarea-content-${slug}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`published-${slug}`}
                      checked={currentData.isPublished}
                      onChange={(e) => setPageData(prev => ({
                        ...prev,
                        [slug]: { ...currentData, isPublished: e.target.checked }
                      }))}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`published-${slug}`} className="text-sm">منشورة</label>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

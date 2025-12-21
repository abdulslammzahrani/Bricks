import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
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
  TrendingDown,
  MapPin,
  Wallet,
  Home,
  RefreshCw,
  Search,
  Eye,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  MessageSquare,
  Clock,
  Filter,
  UserCheck,
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
  Save,
  User as UserIcon,
  Store,
  ArrowRightLeft,
  DollarSign,
  Percent,
  UserPlus,
  Heart,
  Calendar,
  Download,
  FileSpreadsheet,
  BarChart3,
  Timer,
  Zap,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  ShoppingBag,
  Bed,
  Bath,
  Ruler,
  // ✅ هنا الإصلاح: استيراد الأيقونة باسم مستعار لتجنب التعارض
  PieChart as PieChartIcon 
} from "lucide-react";
import { SiFacebook, SiSnapchat, SiTiktok, SiGoogle, SiMailchimp, SiWhatsapp } from "react-icons/si";
// ✅ استيراد المكون البياني باسمه الأصلي
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from "recharts";
import type { User, BuyerPreference, Property, Match, ContactRequest, SendLog, StaticPage } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { MatchCard, MatchCardCompact } from "@/components/MatchCard";
import { MarketPulse, MarketPulseCompact } from "@/components/MarketPulse";

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

const toArabicPhone = (phone: string) => {
  if (!phone) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const arabicPhone = phone.replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
  if (arabicPhone.length > 3) {
    return arabicPhone.slice(0, -3) + '***';
  }
  return arabicPhone;
};

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

const getWhatsAppLink = (phone: string) => {
  const cleanedPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanedPhone.startsWith('966') ? cleanedPhone : `966${cleanedPhone.replace(/^0/, '')}`;
  return `https://wa.me/${formattedPhone}`;
};

interface ClientWithUser extends BuyerPreference {
  userName: string;
  userPhone: string;
  userEmail: string;
}

interface EnrichedSendLog extends SendLog {
  userName: string;
  userPhone: string;
  preferenceCity: string;
  propertyDetails: Array<{ id: string; city: string; district: string; price: number }>;
}

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
  const [sendingClientId, setSendingClientId] = useState<string | null>(null);
  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState<"week" | "month" | "year">("month");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showMatchDetailsDialog, setShowMatchDetailsDialog] = useState(false);
  const [sendingMatchNotification, setSendingMatchNotification] = useState<string | null>(null);
  const [showMatchFilters, setShowMatchFilters] = useState(false);
  const [matchFilters, setMatchFilters] = useState({
    minScore: 0,
    maxScore: 100,
    status: "all" as "all" | "saved" | "contacted",
    propertyType: "all",
    city: "all",
    minPrice: 0,
    maxPrice: 10000000,
  });

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

  const { data: clients = [], refetch: refetchClients } = useQuery<ClientWithUser[]>({
    queryKey: ["/api/admin/clients"],
  });

  const { data: sendLogs = [], refetch: refetchSendLogs } = useQuery<EnrichedSendLog[]>({
    queryKey: ["/api/admin/send-logs"],
  });

  const { data: marketingSettings = [], refetch: refetchMarketing } = useQuery<MarketingSetting[]>({
    queryKey: ["/api/admin/marketing"],
  });

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

  const sendToClientMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      setSendingClientId(preferenceId);
      return apiRequest("POST", `/api/admin/clients/${preferenceId}/send`, { maxProperties: 5 });
    },
    onSuccess: (data: any) => {
      toast({ title: "تم الإرسال", description: data.message || `تم إرسال العقارات بنجاح` });
      refetchSendLogs();
      refetchClients();
      setSendingClientId(null);
    },
    onError: (error: any) => {
      toast({ title: "فشل الإرسال", description: error.message || "حدث خطأ أثناء الإرسال", variant: "destructive" });
      setSendingClientId(null);
    },
  });

  const toggleClientStatusMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      return apiRequest("PATCH", `/api/admin/clients/${preferenceId}/toggle-status`);
    },
    onSuccess: () => {
      refetchClients();
      toast({ title: "تم التحديث", description: "تم تغيير حالة العميل" });
    },
  });

  const bulkSendMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/send-all", { maxPropertiesPerClient: 5 });
    },
    onSuccess: (data: any) => {
      toast({ title: "تم الإرسال الجماعي", description: `تم الإرسال لـ ${data.successful} عميل من أصل ${data.total}` });
      refetchSendLogs();
      refetchClients();
    },
    onError: (error: any) => {
      toast({ title: "فشل الإرسال", description: error.message || "حدث خطأ أثناء الإرسال الجماعي", variant: "destructive" });
    },
  });

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

  // دالة عرض تفاصيل المطابقة الكاملة
  const handleShowMatchDetails = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowMatchDetailsDialog(true);
  };

  // تطبيق تصفية المطابقات
  const filteredMatches = matches.filter(match => {
    const pref = preferences.find(p => p.id === match.buyerPreferenceId);
    const prop = properties.find(p => p.id === match.propertyId);
    
    if (!pref || !prop) return false;
    
    // تصفية حسب نسبة التطابق
    if (match.matchScore < matchFilters.minScore || match.matchScore > matchFilters.maxScore) {
      return false;
    }
    
    // تصفية حسب الحالة
    if (matchFilters.status === "saved" && !match.isSaved) return false;
    if (matchFilters.status === "contacted" && !match.isContacted) return false;
    
    // تصفية حسب نوع العقار
    if (matchFilters.propertyType !== "all" && prop.propertyType !== matchFilters.propertyType) {
      return false;
    }
    
    // تصفية حسب المدينة
    if (matchFilters.city !== "all" && prop.city !== matchFilters.city) {
      return false;
    }
    
    // تصفية حسب السعر
    if (prop.price < matchFilters.minPrice || prop.price > matchFilters.maxPrice) {
      return false;
    }
    
    return true;
  });

  // الحصول على بيانات المطابقة المحددة
  const getSelectedMatchData = () => {
    if (!selectedMatchId) return null;
    const match = matches.find(m => m.id === selectedMatchId);
    if (!match) return null;
    
    const pref = preferences.find(p => p.id === match.buyerPreferenceId);
    const prop = properties.find(p => p.id === match.propertyId);
    const buyer = pref ? users.find(u => u.id === pref.userId) : null;
    const seller = prop ? users.find(u => u.id === prop.sellerId) : null;
    
    return { match, pref, prop, buyer, seller };
  };

  // دالة إرسال إشعار واتساب للبائع والمشتري
  const handleSendMatchNotification = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    const pref = preferences.find(p => p.id === match.buyerPreferenceId);
    const prop = properties.find(p => p.id === match.propertyId);
    const buyer = pref ? users.find(u => u.id === pref.userId) : null;
    const seller = prop ? users.find(u => u.id === prop.sellerId) : null;
    
    if (!buyer?.phone && !seller?.phone) {
      toast({ title: "لا يوجد أرقام", description: "لا يوجد أرقام هواتف لإرسال الإشعار", variant: "destructive" });
      return;
    }
    
    setSendingMatchNotification(matchId);
    
    // رسالة للمشتري
    const buyerMessage = encodeURIComponent(
      `تطابق - مطابقة عقارية جديدة\n\n` +
      `مرحباً ${buyer?.name || 'عميلنا الكريم'},\n\n` +
      `تم إيجاد عقار يتوافق مع رغباتك بنسبة ${match.matchScore}%\n\n` +
      `الموقع: ${prop?.city || ''} - ${prop?.district || ''}\n` +
      `السعر: ${prop?.price ? formatCurrency(prop.price) + ' ريال' : 'غير محدد'}\n\n` +
      `الرجاء الدخول لصفحتك الخاصة لتأكيد طلبك ومشاهدة التفاصيل.\n\n` +
      `منصة تطابق العقارية`
    );
    
    // رسالة للبائع
    const sellerMessage = encodeURIComponent(
      `تطابق - مشتري محتمل لعقارك\n\n` +
      `مرحباً ${seller?.name || 'عميلنا الكريم'},\n\n` +
      `يوجد مشتري مهتم بعقارك بنسبة تطابق ${match.matchScore}%\n\n` +
      `النوع: ${prop?.propertyType ? propertyTypeLabels[prop.propertyType] : 'عقار'}\n` +
      `الموقع: ${prop?.city || ''} - ${prop?.district || ''}\n\n` +
      `الرجاء الدخول لصفحتك الخاصة لتأكيد العرض والتواصل مع المشتري.\n\n` +
      `منصة تطابق العقارية`
    );
    
    // فتح واتساب للمشتري
    if (buyer?.phone) {
      const buyerWhatsApp = getWhatsAppLink(buyer.phone) + `?text=${buyerMessage}`;
      window.open(buyerWhatsApp, '_blank');
    }
    
    // فتح واتساب للبائع بعد تأخير قصير
    setTimeout(() => {
      if (seller?.phone) {
        const sellerWhatsApp = getWhatsAppLink(seller.phone) + `?text=${sellerMessage}`;
        window.open(sellerWhatsApp, '_blank');
      }
      setSendingMatchNotification(null);
      toast({ 
        title: "تم فتح الواتساب", 
        description: "تم فتح نوافذ واتساب لإرسال الإشعارات للبائع والمشتري" 
      });
    }, 500);
  };

  const isLoading = statsLoading || usersLoading || prefsLoading || propsLoading;

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsers();
    refetchProperties();
  };

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

        <div className="flex flex-col flex-1 overflow-hidden">
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

            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                        {/* ✅ استخدام الأيقونة المستوردة باسم مستعار */}
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        توزيع أنواع العقارات المطلوبة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {demandByType && demandByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          {/* ✅ استخدام المكون البياني من recharts */}
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

            {/* Users Section */}
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

            {/* Preferences Section */}
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

            {/* Properties Section */}
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
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary">{prop.city}</Badge>
                                    <Badge variant="outline">{prop.district}</Badge>
                                    <Badge variant="outline">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</Badge>
                                    <Badge variant="secondary">{statusLabels[prop.status] || prop.status}</Badge>
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
                                    data-testid={`button-toggle-property-${prop.id}`}
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

            {/* ✅ قسم المطابقات - التصميم الجديد: بائع، مشتري، ومحور الربط */}
            {activeSection === "matches" && (
              <div className="space-y-6">
                {/* Market Pulse - نبض السوق */}
                <MarketPulse 
                  activeBrowsers={users.length}
                  newRequests={preferences.filter(p => p.isActive).length}
                  completedDeals={contactRequests.filter(c => c.status === "completed").length}
                  matchedProperties={matches.length}
                  newInterests={matches.filter(m => m.isSaved).length}
                  ongoingChats={contactRequests.filter(c => c.status === "pending").length}
                />

                <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-none">
                  <CardHeader className="px-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          <Handshake className="h-6 w-6 text-primary" />
                          المطابقات الذكية v2.0
                          <Badge variant="secondary" className="text-sm font-normal">
                            {matches.length} نتيجة
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          خوارزمية النقاط الموزونة: موقع (40) + سعر (30) + مواصفات (30) = 100 نقطة
                        </CardDescription>
                      </div>
                      <Popover open={showMatchFilters} onOpenChange={setShowMatchFilters}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" data-testid="button-filter-matches">
                            <Filter className="h-4 w-4 ml-2" />
                            تصفية النتائج
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start" dir="rtl">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">نسبة التطابق: {matchFilters.minScore}% - {matchFilters.maxScore}%</label>
                              <Slider value={[matchFilters.minScore, matchFilters.maxScore]} onValueChange={(val) => setMatchFilters({...matchFilters, minScore: val[0], maxScore: val[1]})} min={0} max={100} step={1} data-testid="slider-score-filter" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">الحالة</label>
                              <Select value={matchFilters.status} onValueChange={(val) => setMatchFilters({...matchFilters, status: val as any})} data-testid="select-status-filter">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">الكل</SelectItem>
                                  <SelectItem value="saved">محفوظ</SelectItem>
                                  <SelectItem value="contacted">تم التواصل</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">نوع العقار</label>
                              <Select value={matchFilters.propertyType} onValueChange={(val) => setMatchFilters({...matchFilters, propertyType: val})} data-testid="select-property-filter">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">الكل</SelectItem>
                                  <SelectItem value="apartment">شقة</SelectItem>
                                  <SelectItem value="villa">فيلا</SelectItem>
                                  <SelectItem value="land">أرض</SelectItem>
                                  <SelectItem value="building">عمارة</SelectItem>
                                  <SelectItem value="duplex">دوبلكس</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">المدينة</label>
                              <Select value={matchFilters.city} onValueChange={(val) => setMatchFilters({...matchFilters, city: val})} data-testid="select-city-filter">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">الكل</SelectItem>
                                  <SelectItem value="جدة">جدة</SelectItem>
                                  <SelectItem value="الرياض">الرياض</SelectItem>
                                  <SelectItem value="الدمام">الدمام</SelectItem>
                                  <SelectItem value="مكة">مكة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">السعر: {formatCurrency(matchFilters.minPrice)} - {formatCurrency(matchFilters.maxPrice)}</label>
                              <Slider value={[matchFilters.minPrice, matchFilters.maxPrice]} onValueChange={(val) => setMatchFilters({...matchFilters, minPrice: val[0], maxPrice: val[1]})} min={0} max={10000000} step={50000} data-testid="slider-price-filter" />
                            </div>
                            <Button className="w-full" onClick={() => setShowMatchFilters(false)} data-testid="button-apply-filters">تطبيق</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                  {filteredMatches.length > 0 ? (
                    <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                      <div className="grid gap-6 pb-10">
                        {filteredMatches.map((match) => {
                          // استخراج البيانات المرتبطة بالمطابقة
                          const pref = preferences.find(p => p.id === match.buyerPreferenceId);
                          const prop = properties.find(p => p.id === match.propertyId);
                          const buyer = pref ? users.find(u => u.id === pref.userId) : null;
                          const seller = prop ? users.find(u => u.id === prop.sellerId) : null;

                          // تخطي إذا كانت البيانات ناقصة
                          if (!pref || !prop) return null;

                          return (
                            <Card key={match.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-7 min-h-[180px]">

                                {/* --------------------------------------- */}
                                {/* الجزء الأيمن: بطاقة المشتري (Persona) */}
                                {/* --------------------------------------- */}
                                <div className="md:col-span-2 bg-blue-50/30 p-5 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-l border-slate-100">
                                  <div className="flex flex-col items-center w-full">
                                    <div className="relative mb-2">
                                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                        <UserIcon className="w-7 h-7" />
                                      </div>
                                      <Badge className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] px-1.5 h-4 border-2 border-white">مشتري</Badge>
                                    </div>

                                    <h4 className="font-bold text-slate-800 text-sm truncate w-full px-2" title={buyer?.name}>
                                      {buyer?.name || "مستخدم غير معروف"}
                                    </h4>

                                    {/* أيقونات التواصل للمشتري */}
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      {buyer?.phone && (
                                        <>
                                          <a 
                                            href={`tel:${buyer.phone}`} 
                                            title="اتصال هاتفي" 
                                            className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-green-600 hover:border-green-600 hover:shadow-sm transition-all"
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                          </a>
                                          <a 
                                            href={getWhatsAppLink(buyer.phone)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title="محادثة واتساب" 
                                            className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#25D366] hover:border-[#25D366] hover:shadow-sm transition-all"
                                          >
                                            <SiWhatsapp className="w-3.5 h-3.5" />
                                          </a>
                                        </>
                                      )}
                                      {buyer?.email && (
                                        <a 
                                          href={`mailto:${buyer.email}`} 
                                          title="إرسال بريد" 
                                          className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:shadow-sm transition-all"
                                        >
                                          <Mail className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <div className="w-full mt-4 pt-3 border-t border-blue-100/50">
                                    <span className="text-[10px] text-muted-foreground block mb-2">ملخص الطلب</span>
                                    <div className="flex flex-wrap gap-1 justify-center">
                                       <Badge variant="secondary" className="text-[10px] h-5 bg-white shadow-sm">{pref.city}</Badge>
                                       <Badge variant="secondary" className="text-[10px] h-5 bg-white shadow-sm">{propertyTypeLabels[pref.propertyType]}</Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* --------------------------------------- */}
                                {/* الجزء الأوسط: محور الربط (The Hub) */}
                                {/* --------------------------------------- */}
                                <div className="md:col-span-3 p-4 flex flex-col items-center justify-center relative bg-white">
                                  {/* الخط العمودي (العمود الفقري) */}
                                  <div className="absolute left-1/2 top-6 bottom-6 w-px bg-slate-100 -translate-x-1/2 hidden md:block"></div>

                                  {/* الدائرة العلوية: نسبة التطابق */}
                                  <div className="relative z-10 mb-6 group cursor-default">
                                    <div className="relative flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                      <svg className="w-16 h-16 transform -rotate-90">
                                        <circle className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="white" r="28" cx="32" cy="32" />
                                        <circle 
                                          className="text-primary transition-all duration-1000 ease-out" 
                                          strokeWidth="3" 
                                          strokeDasharray={2 * Math.PI * 28} 
                                          strokeDashoffset={2 * Math.PI * 28 * (1 - match.matchScore / 100)} 
                                          strokeLinecap="round" 
                                          stroke="currentColor" 
                                          fill="transparent" 
                                          r="28" 
                                          cx="32" 
                                          cy="32" 
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-sm font-bold text-slate-800">{match.matchScore}%</span>
                                        <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">تطابق</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* خيوط البيانات (Matching Threads) */}
                                  <div className="w-full space-y-3 relative z-10 text-xs">

                                    {/* خيط الموقع */}
                                    <div className="flex items-center justify-between w-full px-2 group/row">
                                      <div className="w-[42%] text-left truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors" title={pref.city}>
                                        {pref.city} <span className="text-slate-400 font-normal text-[10px]">{pref.districts?.[0]}</span>
                                      </div>
                                      <div className="flex items-center justify-center w-[16%] text-slate-300 group-hover/row:text-primary transition-colors">
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                        <MapPin className="w-3.5 h-3.5 mx-1" />
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                      </div>
                                      <div className="w-[42%] text-right truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors" title={prop.city}>
                                        {prop.city} <span className="text-slate-400 font-normal text-[10px]">{prop.district}</span>
                                      </div>
                                    </div>

                                    {/* خيط النوع */}
                                    <div className="flex items-center justify-between w-full px-2 group/row">
                                      <span className="w-[42%] text-left truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors">
                                        {propertyTypeLabels[pref.propertyType]}
                                      </span>
                                      <div className="flex items-center justify-center w-[16%] text-slate-300 group-hover/row:text-primary transition-colors">
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                        <Building2 className="w-3.5 h-3.5 mx-1" />
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                      </div>
                                      <span className="w-[42%] text-right truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors">
                                        {propertyTypeLabels[prop.propertyType]}
                                      </span>
                                    </div>

                                    {/* خيط المال */}
                                    <div className="flex items-center justify-between w-full px-2 group/row">
                                      <span className="w-[42%] text-left truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors">
                                        {maskBudget(pref.budgetMin, pref.budgetMax)}
                                      </span>
                                      <div className="flex items-center justify-center w-[16%] text-slate-300 group-hover/row:text-primary transition-colors">
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                        <ArrowRightLeft className="w-3.5 h-3.5 mx-1" />
                                        <div className="h-px w-2 bg-current opacity-50"></div>
                                      </div>
                                      <span className="w-[42%] text-right truncate text-slate-600 font-medium group-hover/row:text-primary transition-colors">
                                        {formatCurrency(prop.price)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* أزرار الإجراءات في المنتصف */}
                                  <div className="mt-6 flex gap-2 w-full justify-center pt-2">
                                    <Button 
                                      size="sm" 
                                      className="h-7 text-[11px] px-3 bg-primary hover:bg-primary/90 shadow-sm rounded-full"
                                      onClick={() => handleSendMatchNotification(match.id)}
                                      disabled={sendingMatchNotification === match.id}
                                      data-testid={`button-group-chat-${match.id}`}
                                    >
                                      {sendingMatchNotification === match.id ? (
                                        <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                                      ) : (
                                        <MessageSquare className="w-3 h-3 mr-1.5" />
                                      )}
                                      محادثة جماعية
                                    </Button>
                                  </div>
                                </div>

                                {/* --------------------------------------- */}
                                {/* الجزء الأيسر: بطاقة البائع (Persona) */}
                                {/* --------------------------------------- */}
                                <div className="md:col-span-2 bg-green-50/30 p-5 flex flex-col items-center justify-between text-center border-t md:border-t-0 md:border-r border-slate-100">
                                  <div className="flex flex-col items-center w-full">
                                    <div className="relative mb-2">
                                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                        <Store className="w-7 h-7" />
                                      </div>
                                      <Badge className="absolute -bottom-1 -left-1 bg-green-600 text-white text-[9px] px-1.5 h-4 border-2 border-white">بائع</Badge>
                                    </div>

                                    <h4 className="font-bold text-slate-800 text-sm truncate w-full px-2" title={seller?.name}>
                                      {seller?.name || "مالك العقار"}
                                    </h4>

                                    {/* أيقونات التواصل للبائع */}
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      {seller?.phone && (
                                        <>
                                          <a 
                                            href={`tel:${seller.phone}`} 
                                            title="اتصال هاتفي" 
                                            className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-green-600 hover:border-green-600 hover:shadow-sm transition-all"
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                          </a>
                                          <a 
                                            href={getWhatsAppLink(seller.phone)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title="محادثة واتساب" 
                                            className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#25D366] hover:border-[#25D366] hover:shadow-sm transition-all"
                                          >
                                            <SiWhatsapp className="w-3.5 h-3.5" />
                                          </a>
                                        </>
                                      )}
                                      {seller?.email && (
                                        <a 
                                          href={`mailto:${seller.email}`} 
                                          title="إرسال بريد" 
                                          className="p-1.5 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:shadow-sm transition-all"
                                        >
                                          <Mail className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <div className="w-full mt-4 pt-3 border-t border-green-100/50">
                                    <span className="text-[10px] text-muted-foreground block mb-2">العقار المعروض</span>
                                    <div className="flex flex-wrap gap-1 justify-center">
                                       <Badge variant="outline" className="text-[10px] h-5 bg-white text-slate-600 border-slate-200">{prop.city}</Badge>
                                       <Badge variant="outline" className="text-[10px] h-5 bg-white text-slate-600 border-slate-200">{formatCurrency(prop.price)}</Badge>
                                    </div>
                                  </div>
                                </div>

                              </div>

                              {/* الشريط السفلي: الحالة والتفاصيل */}
                              <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between">
                                 <div className="flex gap-2">
                                    {match.isSaved && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] gap-1"><Save className="w-3 h-3"/> محفوظ</Badge>}
                                    {match.isContacted && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1"><CheckCircle className="w-3 h-3"/> تم التواصل</Badge>}
                                 </div>
                                 <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 text-xs hover:bg-white hover:shadow-sm text-muted-foreground hover:text-primary"
                                    onClick={() => handleShowMatchDetails(match.id)}
                                    data-testid={`button-full-details-${match.id}`}
                                 >
                                    <ExternalLink className="w-3 h-3 mr-1" /> التفاصيل الكاملة
                                 </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-dashed m-1">
                      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                        <Handshake className="w-10 h-10 text-primary/40" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800">{matches.length === 0 ? "لا توجد مطابقات حالياً" : "لا توجد نتائج تطابق الشروط"}</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        {matches.length === 0 ? "النظام يقوم بالبحث عن مطابقات جديدة تلقائياً عند إضافة عقارات أو رغبات جديدة." : "حاول تعديل مرشحات البحث للحصول على نتائج أفضل."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}
            {/* Analytics Section - Enhanced Dashboard */}
            {activeSection === "analytics" && (
              <div className="space-y-6">
                {/* Header with Time Filters and Export */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      لوحة التحليلات المتقدمة
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">إحصائيات شاملة ومؤشرات الأداء</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Time Filters */}
                    <div className="flex bg-muted rounded-lg p-1">
                      {[
                        { id: "week", label: "أسبوع" },
                        { id: "month", label: "شهر" },
                        { id: "year", label: "سنة" },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setAnalyticsTimeFilter(filter.id as typeof analyticsTimeFilter)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            analyticsTimeFilter === filter.id
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid={`button-filter-${filter.id}`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    {/* Export Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-pdf">
                        <FileText className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-excel">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 1. KPIs Section - 4 Colored Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +12.5%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">2.4M</p>
                        <p className="text-sm text-white/80">إجمالي الإيرادات (ريال)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Percent className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +3.2%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">24.8%</p>
                        <p className="text-sm text-white/80">معدل التحويل</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <UserPlus className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +18.7%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">{users.length}</p>
                        <p className="text-sm text-white/80">المستخدمين النشطين</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Heart className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 gap-1">
                          <ArrowDownRight className="h-3 w-3" />
                          -2.1%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">67.3%</p>
                        <p className="text-sm text-white/80">معدل الاحتفاظ</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 2. Property Type Analysis with Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        تحليل أنواع العقارات
                      </CardTitle>
                      <CardDescription>توزيع تفصيلي مع متوسط الأسعار واتجاه السوق</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { type: "apartment", label: "شقق", count: properties.filter(p => p.propertyType === "apartment").length, avgPrice: 850000, trend: 5.2 },
                          { type: "villa", label: "فلل", count: properties.filter(p => p.propertyType === "villa").length, avgPrice: 2500000, trend: 8.1 },
                          { type: "land", label: "أراضي", count: properties.filter(p => p.propertyType === "land").length, avgPrice: 1200000, trend: -2.3 },
                          { type: "building", label: "عمارات", count: properties.filter(p => p.propertyType === "building").length, avgPrice: 5000000, trend: 3.7 },
                          { type: "duplex", label: "دوبلكس", count: properties.filter(p => p.propertyType === "duplex").length, avgPrice: 1800000, trend: 12.5 },
                        ].map((item) => (
                          <div key={item.type} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                            <div className="w-20 text-sm font-medium">{item.label}</div>
                            <div className="flex-1">
                              <div className="bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${properties.length > 0 ? (item.count / properties.length) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-10 text-sm text-muted-foreground text-center">{item.count}</div>
                            <div className="w-24 text-xs text-muted-foreground">{formatCurrency(item.avgPrice)}</div>
                            <Badge 
                              variant="secondary" 
                              className={`w-16 justify-center ${item.trend >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                              {item.trend >= 0 ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                              {Math.abs(item.trend)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Most Searched Keywords */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        الكلمات المفتاحية الأكثر بحثاً
                      </CardTitle>
                      <CardDescription>أهم 5 عمليات بحث مع نسب النمو</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { keyword: "شقة في جدة", count: 1250, trend: 15.3 },
                          { keyword: "فيلا للبيع الرياض", count: 980, trend: 8.7 },
                          { keyword: "أرض سكنية", count: 756, trend: -3.2 },
                          { keyword: "شقق تمليك", count: 642, trend: 22.1 },
                          { keyword: "عمارة تجارية", count: 438, trend: 5.5 },
                        ].map((item, index) => (
                          <div 
                            key={item.keyword} 
                            className="flex items-center gap-4 p-3 rounded-lg border bg-background transition-all hover:shadow-sm"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.keyword}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full bg-primary/60 rounded-full"
                                    style={{ width: `${(item.count / 1250) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-16">{item.count.toLocaleString('ar-SA')} بحث</span>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`${item.trend >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                              {item.trend >= 0 ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
                              {Math.abs(item.trend)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 4. Conversion Funnel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      قمع التحويل المحسّن
                    </CardTitle>
                    <CardDescription>مراحل التحويل مع النسب الفعلية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { stage: "زوار الموقع", count: 15000, color: "bg-blue-500", percentage: 100 },
                        { stage: "تسجيل الرغبات", count: preferences.length || 3200, color: "bg-violet-500", percentage: 21.3 },
                        { stage: "مطابقات ناجحة", count: matches.length || 890, color: "bg-amber-500", percentage: 5.9 },
                        { stage: "طلبات تواصل", count: contactRequests.length || 245, color: "bg-orange-500", percentage: 1.6 },
                        { stage: "صفقات مكتملة", count: 52, color: "bg-green-500", percentage: 0.35 },
                      ].map((item, index, arr) => {
                        const conversionRate = index > 0 ? ((item.count / arr[index - 1].count) * 100).toFixed(1) : null;
                        return (
                          <div key={item.stage} className="relative">
                            <div className="flex items-center gap-4">
                              <div className="w-32 text-sm font-medium">{item.stage}</div>
                              <div className="flex-1 relative">
                                <div className="bg-muted rounded-lg h-10 overflow-hidden">
                                  <div
                                    className={`h-full ${item.color} rounded-lg transition-all duration-700 flex items-center justify-end px-3`}
                                    style={{ width: `${Math.max(item.percentage, 8)}%` }}
                                  >
                                    <span className="text-white text-sm font-medium">{item.count.toLocaleString('ar-SA')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-16 text-left text-sm text-muted-foreground">{item.percentage}%</div>
                              {conversionRate && (
                                <Badge variant="outline" className="w-20 justify-center text-xs">
                                  {conversionRate}% تحويل
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Time on Market & 6. Peak Activity Hours */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Time on Market */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-primary" />
                        مدة البقاء في السوق
                      </CardTitle>
                      <CardDescription>توزيع العقارات حسب مدة العرض</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <p className="text-4xl font-bold text-primary">23</p>
                        <p className="text-sm text-muted-foreground">يوم (المتوسط العام)</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { period: "0-7 أيام", count: 45, color: "bg-green-500" },
                          { period: "8-14 يوم", count: 32, color: "bg-lime-500" },
                          { period: "15-30 يوم", count: 28, color: "bg-amber-500" },
                          { period: "31-60 يوم", count: 15, color: "bg-orange-500" },
                          { period: "+60 يوم", count: 8, color: "bg-red-500" },
                        ].map((item) => {
                          const total = 128;
                          return (
                            <div key={item.period} className="flex items-center gap-3">
                              <div className="w-20 text-sm">{item.period}</div>
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                  style={{ width: `${(item.count / total) * 100}%` }}
                                />
                              </div>
                              <div className="w-8 text-sm text-muted-foreground text-left">{item.count}</div>
                              <div className="w-12 text-xs text-muted-foreground text-left">{((item.count / total) * 100).toFixed(0)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Activity Hours */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        أوقات الذروة
                      </CardTitle>
                      <CardDescription>تحليل النشاط على مدار اليوم</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { hour: "6-9 صباحاً", activity: 35, level: "low" },
                          { hour: "9-12 ظهراً", activity: 75, level: "high" },
                          { hour: "12-3 مساءً", activity: 45, level: "medium" },
                          { hour: "3-6 مساءً", activity: 60, level: "medium" },
                          { hour: "6-9 مساءً", activity: 95, level: "peak" },
                          { hour: "9-12 ليلاً", activity: 85, level: "high" },
                        ].map((item) => {
                          const levelColors: Record<string, string> = {
                            peak: "bg-red-500",
                            high: "bg-orange-500",
                            medium: "bg-amber-500",
                            low: "bg-green-500",
                          };
                          const levelLabels: Record<string, string> = {
                            peak: "ذروة عالية",
                            high: "نشاط مرتفع",
                            medium: "نشاط متوسط",
                            low: "نشاط منخفض",
                          };
                          return (
                            <div key={item.hour} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="w-24 text-sm font-medium">{item.hour}</div>
                              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-full ${levelColors[item.level]} rounded-full transition-all duration-500`}
                                  style={{ width: `${item.activity}%` }}
                                />
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`w-24 justify-center text-xs ${
                                  item.level === 'peak' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  item.level === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  item.level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}
                              >
                                {levelLabels[item.level]}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 7. Additional Metrics - 3 Gradient Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-rose-500/10">
                          <MousePointerClick className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <Badge variant="secondary" className="bg-rose-200 text-rose-700 dark:bg-rose-800 dark:text-rose-300 gap-1">
                          <ArrowDownRight className="h-3 w-3" />
                          -5.2%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">32.5%</p>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80">معدل الارتداد (Bounce Rate)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <Badge variant="secondary" className="bg-cyan-200 text-cyan-700 dark:bg-cyan-800 dark:text-cyan-300 gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +12.8%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">4:35</p>
                        <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80">متوسط مدة الجلسة (دقائق)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950/30 dark:to-fuchsia-900/20 border-fuchsia-200 dark:border-fuchsia-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-fuchsia-500/10">
                          <Heart className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
                        </div>
                        <Badge variant="secondary" className="bg-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-800 dark:text-fuchsia-300 gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +23.4%
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-fuchsia-700 dark:text-fuchsia-300">{matches.filter(m => m.isSaved).length || 156}</p>
                        <p className="text-sm text-fuchsia-600/80 dark:text-fuchsia-400/80">العقارات المفضلة</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Original Charts - Budget by City & Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="city" />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`} />
                            <Tooltip 
                              formatter={(value: number) => [`${formatCurrency(value)} ريال`, "متوسط الميزانية"]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            />
                            <Bar dataKey="avgBudget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                        <MapPin className="h-5 w-5 text-primary" />
                        توزيع الطلبات حسب المدينة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(
                          preferences.reduce((acc, pref) => {
                            acc[pref.city] = (acc[pref.city] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).slice(0, 6).map(([city, count]) => (
                          <Card key={city} className="p-4 text-center bg-muted/30 border-0">
                            <div className="text-2xl font-bold text-primary">{count}</div>
                            <div className="text-sm text-muted-foreground">{city}</div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 8. Export Section */}
                <Card className="bg-slate-900 dark:bg-slate-950 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/10">
                          <Download className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">تصدير التقارير</h3>
                          <p className="text-sm text-white/60">قم بتصدير جميع البيانات والتحليلات</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                          data-testid="button-export-full-pdf"
                        >
                          <FileText className="h-5 w-5" />
                          تصدير PDF كامل
                        </Button>
                        <Button 
                          className="bg-white text-slate-900 hover:bg-white/90 gap-2"
                          data-testid="button-export-full-excel"
                        >
                          <FileSpreadsheet className="h-5 w-5" />
                          تصدير Excel كامل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sending Section */}
            {activeSection === "sending" && (
              <div className="space-y-4">
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

            {/* Marketing Section */}
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

      {/* Match Details Dialog */}
      <Dialog open={showMatchDetailsDialog} onOpenChange={setShowMatchDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
          {(() => {
            const data = getSelectedMatchData();
            if (!data) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            const { match, pref, prop, buyer, seller } = data;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-lg">
                      {match.matchScore}%
                    </div>
                    <span>تفاصيل المطابقة</span>
                  </DialogTitle>
                  <DialogDescription>
                    مقارنة تفصيلية بين متطلبات المشتري والعقار المعروض
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Header with parties */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm">{buyer?.name || "مشتري"}</p>
                      <p className="text-xs text-muted-foreground">{buyer?.phone || "لا يوجد رقم"}</p>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 text-primary">
                        <ArrowRightLeft className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <Store className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm">{seller?.name || "بائع"}</p>
                      <p className="text-xs text-muted-foreground">{seller?.phone || "لا يوجد رقم"}</p>
                    </div>
                  </div>
                  
                  {/* Scoring breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        تفصيل النتيجة (100 نقطة)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" /> الموقع
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(match.locationScore || 0) / 40 * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-mono w-12 text-left">{match.locationScore || 0}/40</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-green-500" /> السعر
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(match.priceScore || 0) / 30 * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-mono w-12 text-left">{match.priceScore || 0}/30</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-500" /> المواصفات
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(match.specsScore || 0) / 30 * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-mono w-12 text-left">{match.specsScore || 0}/30</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Comparison table */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">مقارنة تفصيلية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right py-2 px-3 font-medium text-muted-foreground w-1/3">يريد المشتري</th>
                              <th className="text-center py-2 px-3 font-medium text-muted-foreground w-1/3">المعيار</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground w-1/3">يعرض البائع</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.city || "-"}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />المدينة</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.city || "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.districts?.join(", ") || "أي حي"}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />الحي</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.district || "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.propertyType ? propertyTypeLabels[pref.propertyType] : "-"}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><Building2 className="w-3 h-3 mr-1" />النوع</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.propertyType ? propertyTypeLabels[prop.propertyType] : "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{maskBudget(pref?.budgetMin || 0, pref?.budgetMax || 0)}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><Wallet className="w-3 h-3 mr-1" />الميزانية</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.price ? formatCurrency(prop.price) + " ريال" : "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.bedroomsMin || 0} - {pref?.bedroomsMax || "∞"}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><Bed className="w-3 h-3 mr-1" />الغرف</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.bedrooms || "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.bathroomsMin || 0} - {pref?.bathroomsMax || "∞"}</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><Bath className="w-3 h-3 mr-1" />الحمامات</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.bathrooms || "-"}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-right">{pref?.areaMin || 0} - {pref?.areaMax || "∞"} م²</td>
                              <td className="py-2 px-3 text-center"><Badge variant="outline"><Ruler className="w-3 h-3 mr-1" />المساحة</Badge></td>
                              <td className="py-2 px-3 text-left">{prop?.area ? prop.area + " م²" : "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Actions */}
                  <div className="flex gap-3 justify-center pt-2">
                    <Button 
                      onClick={() => handleSendMatchNotification(match.id)}
                      disabled={sendingMatchNotification === match.id}
                      data-testid="button-dialog-send-notification"
                    >
                      {sendingMatchNotification === match.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      إرسال إشعار واتساب
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMatchDetailsDialog(false)}
                      data-testid="button-close-match-details"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
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
<p>يمكنك تسجيل رغبتي العقارية من خلال الصفحة الرئيسية عبر المحادثة الذكية مع مساعدنا الآلي.</p>

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
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  ClipboardCheck, 
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
  Check,
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
  Settings2,
  LogOut,
  List,
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
  Star,
  AlertCircle,
  Share2,
  ChevronRight,
  ChevronDown,
  Edit,
  Edit2,
  FileSpreadsheet as FileExcel,
  FileText as FilePdf,
  Pencil,
  Link2,
  // ✅ هنا الإصلاح: استيراد الأيقونة باسم مستعار لتجنب التعارض
  PieChart as PieChartIcon,
} from "lucide-react";
import { SiFacebook, SiSnapchat, SiTiktok, SiGoogle, SiMailchimp, SiWhatsapp } from "react-icons/si";
// ✅ استيراد المكون البياني باسمه الأصلي
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from "recharts";
import type { User, BuyerPreference, Property, Match, ContactRequest, SendLog, StaticPage } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { saudiCities } from "@shared/saudi-locations";
import { MatchCard, MatchCardCompact } from "@/components/MatchCard";
import { MarketPulse, MarketPulseCompact } from "@/components/MarketPulse";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import SellerPropertyForm from "@/components/SellerPropertyForm";

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

// ScrollableOptions component (نفس تصميم الفورم)
const ScrollableOptions = ({ label, options, selected, onSelect, unit = "" }: { label: string, options: string[], selected: string, onSelect: (val: string) => void, unit?: string }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold mb-2 text-gray-700">{label}</label>
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`
            flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
            ${selected === opt 
              ? "bg-primary text-white border-primary shadow-sm scale-105" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
          `}
        >
          {opt} {unit}
        </button>
      ))}
    </div>
  </div>
);

// SMART_RANGES (نفس الفورم)
const SMART_RANGES = {
  area: ["100-200", "200-300", "300-400", "400-600", "600-900", "900-1500", "1500-3000", "3000+"],
  rooms: ["1", "2", "3", "4", "5", "6", "7+"],
  bathrooms: ["1", "2", "3", "4", "5+"],
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

// Helper function for status badge colors - محدث
const getStatusBadgeConfig = (status: string) => {
  const configs: Record<string, { label: string; className: string; icon: any }> = {
    new: { label: "طلب جديد", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock }, // أزرق فاتح
    contacted: { label: "تم التواصل", className: "bg-orange-100 text-orange-700 border-orange-200", icon: Phone }, // برتقالي فاتح
    confirmed: { label: "تم التأكيد", className: "bg-blue-200 text-blue-800 border-blue-300", icon: CheckCircle }, // أزرق متوسط
    viewing: { label: "تم المعاينة", className: "bg-purple-100 text-purple-700 border-purple-200", icon: Eye }, // بنفسجي فاتح
    agreed: { label: "تم الاتفاق", className: "bg-green-100 text-green-700 border-green-200", icon: Handshake }, // أخضر فاتح
    vacated: { label: "تم الافراغ", className: "bg-green-200 text-green-800 border-green-300", icon: Home }, // أخضر
    // حالات قديمة للتوافق مع البيانات الموجودة
    handover_scheduled: { label: "تم تحديد موعد الافراغ", className: "bg-green-100 text-green-700 border-green-200", icon: Calendar },
    sold: { label: "تم البيع", className: "bg-green-200 text-green-800 border-green-300", icon: CheckCircle },
    viewing_scheduled: { label: "تم المعاينة", className: "bg-purple-100 text-purple-700 border-purple-200", icon: Calendar },
    closed: { label: "تم البيع", className: "bg-green-200 text-green-800 border-green-300", icon: CheckCircle },
    lost: { label: "فاشلة", className: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };
  return configs[status] || configs.new;
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
  const [selectedBuyerPreferenceId, setSelectedBuyerPreferenceId] = useState<string | null>(null);
  const [showMatchDetailsDialog, setShowMatchDetailsDialog] = useState(false);
  const [sendingMatchNotification, setSendingMatchNotification] = useState<string | null>(null);
  const [showMatchFilters, setShowMatchFilters] = useState(false);
  const [matchFilters, setMatchFilters] = useState({
    minScore: 0,
    maxScore: 100, // تغيير إلى 100 لأننا نستخدم النسبة المئوية
    status: "all" as "all" | "new" | "contacted" | "viewing_scheduled" | "closed" | "lost" | "saved",
    propertyType: "all",
    city: "all",
    minPrice: 0,
    maxPrice: 10000000,
  });
  const [selectedMatchStatus, setSelectedMatchStatus] = useState<string>("all");
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [matchSortBy, setMatchSortBy] = useState<"score" | "date" | "status">("score");
  const [matchViewMode, setMatchViewMode] = useState<"grid" | "list">("list"); // تغيير الافتراضي إلى list
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set()); // لتتبع المجموعات المفتوحة
  const [showAllMatchesPerGroup, setShowAllMatchesPerGroup] = useState(false); // خيار لعرض جميع المطابقات
  // State للتأكيدات التفصيلية (لكل مطابقة)
  const [detailedVerifications, setDetailedVerifications] = useState<Record<string, {
    city: boolean;
    district: boolean;
    propertyType: boolean;
    price: boolean;
    rooms: boolean;
    bathrooms: boolean;
    area: boolean;
  }>>({});
  // State لتعديل بيانات البائع
  const [selectedSellerMatchId, setSelectedSellerMatchId] = useState<string | null>(null);
  const [showSellerEditDialog, setShowSellerEditDialog] = useState(false);
  // State لمقارنة طلب المشتري مع طلب البائع
  const [selectedMatchForComparison, setSelectedMatchForComparison] = useState<string | null>(null);
  const [showMatchComparisonDialog, setShowMatchComparisonDialog] = useState(false);
  // State للتأكد من صحة رغبة المشتري
  const [buyerVerificationChecks, setBuyerVerificationChecks] = useState({
    city: false,
    districts: false,
    propertyType: false,
    budget: false,
    rooms: false,
    area: false,
    transactionType: false,
    purpose: false,
  });
  // State لتعديل بيانات المستخدم
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userEditData, setUserEditData] = useState<Partial<User>>({});
  // State لعرض تفاصيل الرغبة
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(null);
  const [showPreferenceDetailsDialog, setShowPreferenceDetailsDialog] = useState(false);
  const [isEditingPreference, setIsEditingPreference] = useState(false);
  const [preferenceEditData, setPreferenceEditData] = useState<Partial<BuyerPreference>>({});
  // State لعرض تفاصيل العقار
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showPropertyDetailsDialog, setShowPropertyDetailsDialog] = useState(false);
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [propertyEditData, setPropertyEditData] = useState<Partial<Property>>({});

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

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery<Match[]>({
    queryKey: ["/api/admin/matches"],
  });

  // Debug: Log matches data
  useEffect(() => {
    console.log("🔍 Matches Debug:", {
      matchesCount: matches.length,
      matches: matches,
      isLoading: matchesLoading,
      error: matchesError,
    });
  }, [matches, matchesLoading, matchesError]);

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

  // Market Analytics Queries
  const { data: supplyDemandData = [] } = useQuery<Array<{ city: string; supply: number; demand: number; ratio: number; marketType: "buyer" | "balanced" | "seller" }>>({
    queryKey: ["/api/admin/analytics/supply-demand"],
  });

  const { data: pricePerSqmData = [] } = useQuery<Array<{ city: string; district?: string; propertyType?: string; avgPrice: number; avgArea: number; pricePerSqm: number; count: number }>>({
    queryKey: ["/api/admin/analytics/price-per-sqm"],
  });

  const { data: districtPopularityData = [] } = useQuery<Array<{ city: string; district: string; demandCount: number; matchCount: number; contactCount: number; popularityScore: number }>>({
    queryKey: ["/api/admin/analytics/district-popularity"],
  });

  const { data: marketQualityData = [] } = useQuery<Array<{ city: string; avgMatchScore: number; conversionRate: number; engagementRate: number; qualityScore: number; qualityLevel: "excellent" | "good" | "average" | "poor" }>>({
    queryKey: ["/api/admin/analytics/market-quality"],
  });

  const { data: priceTrendsData = [] } = useQuery<Array<{ period: string; avgPrice: number; count: number; changePercent?: number }>>({
    queryKey: ["/api/admin/analytics/price-trends"],
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

  // دالة عرض تفاصيل الرغبة
  const handleShowPreferenceDetails = (preferenceId: string) => {
    setSelectedPreferenceId(preferenceId);
    setShowPreferenceDetailsDialog(true);
  };

  const handleShowBuyerMatches = (buyerPreferenceId: string) => {
    setSelectedBuyerPreferenceId(buyerPreferenceId);
    setShowMatchDetailsDialog(true);
  };

  // تطبيق تصفية المطابقات
  // --- كود الإصلاح النهائي للمطابقات ---
  // تحسين فلترة وترتيب المطابقات
  const filteredMatches = useMemo(() => {
    // إذا لم تكن البيانات محملة بعد، نعرض جميع المطابقات
    if (preferences.length === 0 || properties.length === 0 || users.length === 0) {
      console.log("⚠️ Data not fully loaded yet, showing all matches");
      return matches || [];
    }

    let filtered = (matches || []).filter(match => {
      // فلترة حسب النقاط - تحويل النقاط إلى نسبة مئوية للفلترة
      const matchPercentage = Math.round((match.matchScore / 105) * 100);
      if (matchPercentage < matchFilters.minScore || matchPercentage > matchFilters.maxScore) {
        return false;
      }

      // فلترة حسب الحالة
      if (matchFilters.status !== "all") {
        if (matchFilters.status === "saved" && !match.isSaved) {
          return false;
        } else if (matchFilters.status !== "saved") {
          // استخدام status الجديد من قاعدة البيانات
          const matchStatus = (match as any).status || "new";
          if (matchFilters.status !== matchStatus) {
            return false;
          }
        }
      }

      // فلترة حسب نوع العقار والمدينة والسعر
      const pref = preferences?.find(p => String(p.id) === String(match.buyerPreferenceId));
      const prop = properties?.find(p => String(p.id) === String(match.propertyId));

      // إذا لم يكن هناك pref أو prop، نعرض المطابقة فقط إذا لم تكن هناك فلاتر نشطة
      if (!pref || !prop) {
        // إذا كانت هناك فلاتر نشطة (غير الافتراضية)، نخفي المطابقة
        const hasActiveFilters = 
          matchFilters.propertyType !== "all" || 
          matchFilters.city !== "all" || 
          matchFilters.minPrice > 0 || 
          matchFilters.maxPrice < 10000000;
        
        if (hasActiveFilters) {
          return false;
        }
        return true; // نعرض المطابقة إذا لم تكن هناك فلاتر نشطة
      }

      // فلترة حسب نوع العقار
      if (matchFilters.propertyType !== "all" && prop.propertyType !== matchFilters.propertyType) {
        return false;
      }

      // فلترة حسب المدينة
      if (matchFilters.city !== "all" && prop.city !== matchFilters.city) {
        return false;
      }

      // فلترة حسب السعر - التأكد من أن السعر موجود وصالح
      if (prop.price != null && typeof prop.price === 'number') {
        if (prop.price < matchFilters.minPrice || prop.price > matchFilters.maxPrice) {
          return false;
        }
      } else if (matchFilters.minPrice > 0 || matchFilters.maxPrice < 10000000) {
        // إذا كان السعر غير موجود وكانت هناك فلاتر سعر نشطة، نخفي المطابقة
        return false;
      }

      // البحث النصي
      if (matchSearchQuery && matchSearchQuery.trim()) {
        const query = matchSearchQuery.toLowerCase().trim();
        const buyer = users.find(u => u.id === pref.userId);
        const seller = users.find(u => u.id === prop.sellerId);
        const searchText = [
          buyer?.name,
          seller?.name,
          buyer?.phone,
          seller?.phone,
          prop.city,
          prop.district,
          pref.city,
          pref.districts?.join(" "),
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchText.includes(query)) {
          return false;
        }
      }

      return true;
    });

    // الترتيب
    filtered = [...filtered].sort((a, b) => {
      if (matchSortBy === "score") {
        return b.matchScore - a.matchScore; // من الأعلى للأقل
      } else if (matchSortBy === "date") {
        // ترتيب حسب createdAt
        const aDate = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const bDate = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        return bDate - aDate; // الأحدث أولاً
      } else if (matchSortBy === "status") {
        // محفوظ أولاً، ثم تم التواصل، ثم الباقي
        if (a.isSaved && !b.isSaved) return -1;
        if (!a.isSaved && b.isSaved) return 1;
        if (a.isContacted && !b.isContacted) return -1;
        if (!a.isContacted && b.isContacted) return 1;
        return 0;
      }
      return 0;
    });

    console.log("🔍 Filtered matches result:", {
      filteredCount: filtered.length,
      totalMatches: matches.length,
      preferencesCount: preferences.length,
      propertiesCount: properties.length,
      usersCount: users.length,
      filters: matchFilters,
      searchQuery: matchSearchQuery,
      hasActiveFilters: matchFilters.propertyType !== "all" || matchFilters.city !== "all" || matchFilters.minPrice > 0 || matchFilters.maxPrice < 10000000 || matchFilters.status !== "all" || matchFilters.minScore > 0 || matchFilters.maxScore < 100,
    });
    
    // إذا كانت النتيجة فارغة رغم وجود مطابقات، نعرض تحذير
    if (filtered.length === 0 && matches.length > 0) {
      console.warn("⚠️ No matches after filtering. Check filters:", matchFilters);
    }
    
    return filtered;
  }, [matches, preferences, properties, users, matchFilters, matchSearchQuery, matchSortBy]);
  // --- نهاية كود الإصلاح ---

  // دالة لحساب Match Breakdown (للعرض في Tooltip)
  const calculateMatchBreakdown = useMemo(() => {
    return (property: Property, preference: BuyerPreference) => {
      let locationScore = 0;
      let priceScore = 0;
      let specsScore = 0;
      let detailsScore = 0;
      let bonusScore = 0;

      // 1. الموقع (35 نقطة)
      if (property.city === preference.city) {
        if (preference.districts && preference.districts.length > 0) {
          if (preference.districts.includes(property.district)) {
            locationScore = 35;
          } else {
            locationScore = 22; // حي مجاور أو نفس المدينة
          }
        } else {
          locationScore = 18;
        }
      }

      // 2. السعر (30 نقطة)
      if (preference.budgetMax) {
        if (property.price <= preference.budgetMax) {
          priceScore = preference.budgetMin && property.price >= preference.budgetMin ? 30 : 25;
        } else if (property.price <= preference.budgetMax * 1.05) {
          priceScore = 20;
        } else if (property.price <= preference.budgetMax * 1.15) {
          priceScore = 10;
        }
      } else {
        priceScore = 15;
      }

      // 3. المواصفات (25 نقطة)
      let propertyTypeScore = property.propertyType === preference.propertyType ? 12 : 6;
      let roomsAreaScore = 0;
      if (preference.rooms && property.rooms) {
        const prefRooms = parseInt(String(preference.rooms).match(/\d+/)?.[0] || "0");
        const propRooms = parseInt(String(property.rooms).match(/\d+/)?.[0] || "0");
        if (propRooms === prefRooms) roomsAreaScore += 6.5;
        else if (Math.abs(propRooms - prefRooms) === 1) roomsAreaScore += 4.5;
      }
      if (preference.area && property.area) {
        roomsAreaScore += 6.5; // تبسيط
      }
      specsScore = propertyTypeScore + Math.min(13, roomsAreaScore);

      // 4. التفاصيل (10 نقطة) - تبسيط
      detailsScore = 8;

      // 5. البونص (5 نقاط) - تبسيط
      if (property.createdAt) {
        const daysSinceCreation = Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation <= 7) bonusScore += 2;
        else if (daysSinceCreation <= 30) bonusScore += 1;
      }
      if (property.isActive) bonusScore += 1;
      bonusScore = Math.min(5, bonusScore);

      return {
        location: Math.round(locationScore),
        price: Math.round(priceScore),
        specifications: Math.round(specsScore),
        details: Math.round(detailsScore),
        bonus: Math.round(bonusScore),
        total: Math.round(locationScore + priceScore + specsScore + detailsScore + bonusScore),
      };
    };
  }, []);

  // دالة لحساب Match Priority (Smart Labels)
  const calculateMatchPriority = (match: Match, property: Property, preference: BuyerPreference) => {
    const breakdown = calculateMatchBreakdown(property, preference);
    
    if (match.matchScore >= 85) return "hot_deal";
    
    // Price Gap: كل شيء جيد إلا السعر
    if (breakdown.location >= 30 && breakdown.specifications >= 20 && breakdown.price < 15) {
      return "price_gap";
    }
    
    // Location Match: الموقع مطابق تماماً لكن باقي المعايير متوسطة
    if (breakdown.location >= 35 && breakdown.price < 20 && breakdown.specifications < 15) {
      return "location_match";
    }
    
    if (match.matchScore >= 70) return "high_potential";
    
    return null;
  };

  // دالة للحصول على Smart Label Badge
  const getSmartLabelBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const labels: Record<string, { text: string; className: string }> = {
      hot_deal: { text: "صفقة ساخنة", className: "bg-red-100 text-red-700 border-red-300" },
      price_gap: { text: "فجوة سعرية", className: "bg-amber-100 text-amber-700 border-amber-300" },
      location_match: { text: "موقع مثالي", className: "bg-blue-100 text-blue-700 border-blue-300" },
      high_potential: { text: "إمكانية عالية", className: "bg-green-100 text-green-700 border-green-300" },
    };
    
    const label = labels[priority];
    if (!label) return null;
    
    return <Badge variant="outline" className={`text-[9px] ${label.className}`}>{label.text}</Badge>;
  };

  // دالة للحصول على Status Label
  const getStatusLabel = (status: string | null | undefined) => {
    const statusLabels: Record<string, string> = {
      new: "جديد",
      contacted: "تم التواصل",
      viewing_scheduled: "زيارة مجدولة",
      closed: "مغلقة",
      lost: "فاشلة",
    };
    return statusLabels[status || "new"] || "جديد";
  };

  // دالة لتنسيق الوقت ("منذ X ساعة")
  const formatTimeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return "غير محدد";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `منذ ${diffDays} يوم`;
    if (diffHours > 0) return `منذ ${diffHours} ساعة`;
    return "منذ قليل";
  };

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

  const getSelectedBuyerMatches = () => {
    if (!selectedBuyerPreferenceId) return null;
    const pref = preferences.find(p => p.id === selectedBuyerPreferenceId);
    if (!pref) return null;
    const buyer = users.find(u => u.id === pref.userId);
    const buyerMatches = filteredMatches.filter(m => m.buyerPreferenceId === selectedBuyerPreferenceId);
    return { pref, buyer, matches: buyerMatches };
  };

  // Mutation لتحديث حالة المطابقة
  const updateMatchStatusMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/matches/${matchId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      toast({ title: "تم تحديث الحالة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث الحالة", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات المستخدم بنجاح" });
      setIsEditingUser(false);
      setUserEditData({});
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث البيانات", variant: "destructive" });
    },
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ preferenceId, data }: { preferenceId: string; data: Partial<BuyerPreference> }) => {
      return apiRequest("PATCH", `/api/admin/preferences/${preferenceId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم التحديث", description: "تم تحديث الرغبة بنجاح" });
      setIsEditingPreference(false);
      setPreferenceEditData({});
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث الرغبة", variant: "destructive" });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, data }: { propertyId: string; data: Partial<Property> }) => {
      return apiRequest("PATCH", `/api/admin/properties/${propertyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم التحديث", description: "تم تحديث العقار بنجاح" });
      setIsEditingProperty(false);
      setPropertyEditData({});
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث العقار", variant: "destructive" });
    },
  });

  // Delete mutations
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    type: "user" | "preference" | "property" | "match" | null;
    id: string | null;
    name: string;
  }>({ open: false, type: null, id: null, name: "" });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم الحذف", description: "تم حذف المستخدم بنجاح" });
      setDeleteConfirmDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حذف المستخدم", variant: "destructive" });
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: async (preferenceId: string) => {
      return apiRequest("DELETE", `/api/admin/preferences/${preferenceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم الحذف", description: "تم حذف الرغبة بنجاح" });
      setDeleteConfirmDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حذف الرغبة", variant: "destructive" });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return apiRequest("DELETE", `/api/admin/properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم الحذف", description: "تم حذف العقار بنجاح" });
      setDeleteConfirmDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حذف العقار", variant: "destructive" });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest("DELETE", `/api/admin/matches/${matchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم الحذف", description: "تم حذف المطابقة بنجاح" });
      setDeleteConfirmDialog({ open: false, type: null, id: null, name: "" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حذف المطابقة", variant: "destructive" });
    },
  });

  const updateMatchVerificationMutation = useMutation({
    mutationFn: async ({ matchId, verificationType, verified }: { matchId: string; verificationType: "property" | "buyer" | "specs" | "financial"; verified: boolean }) => {
      return apiRequest("PATCH", `/api/admin/matches/${matchId}/verify`, { verificationType, verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      toast({ title: "تم تحديث التأكيد بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث التأكيد", variant: "destructive" });
    },
  });

  // منطق التجميع التلقائي للتأكيدات التفصيلية
  useEffect(() => {
    // لكل مطابقة في detailedVerifications، نتحقق من التأكيدات الكبيرة
    Object.entries(detailedVerifications).forEach(([matchId, detailed]) => {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      // تأكيد الموقع = المدينة + الحي
      const locationVerified = detailed.city && detailed.district;
      
      // تأكيد المواصفات = النوع + السعر + الغرف + الحمامات + المساحة
      const specsVerified = detailed.propertyType && 
                          detailed.price && 
                          detailed.rooms && 
                          detailed.bathrooms && 
                          detailed.area;

      // تحديث تأكيد الموقع
      if (locationVerified !== (match as any).propertyVerified) {
        updateMatchVerificationMutation.mutate({
          matchId: match.id,
          verificationType: "property",
          verified: locationVerified,
        });
      }

      // تحديث تأكيد المواصفات
      if (specsVerified !== (match as any).specsVerified) {
        updateMatchVerificationMutation.mutate({
          matchId: match.id,
          verificationType: "specs",
          verified: specsVerified,
        });
      }
    });
  }, [detailedVerifications, matches, updateMatchVerificationMutation]);

  // useEffect لتحميل حالة buyerVerificationChecks من buyerVerified
  useEffect(() => {
    if (selectedBuyerPreferenceId) {
      const buyerData = getSelectedBuyerMatches();
      if (buyerData && buyerData.matches.length > 0) {
        // إذا كانت جميع المطابقات لديها buyerVerified = true، نحدد جميع checkboxes
        const allVerified = buyerData.matches.every(m => (m as any).buyerVerified === true);
        if (allVerified) {
          setBuyerVerificationChecks({
            city: true,
            districts: true,
            propertyType: true,
            budget: true,
            rooms: true,
            area: true,
            transactionType: true,
            purpose: true,
          });
        } else {
          setBuyerVerificationChecks({
            city: false,
            districts: false,
            propertyType: false,
            budget: false,
            rooms: false,
            area: false,
            transactionType: false,
            purpose: false,
          });
        }
      }
    }
  }, [selectedBuyerPreferenceId, matches, preferences, users, filteredMatches]);

  // useEffect لتحديث buyerVerified عند تغيير checkboxes
  useEffect(() => {
    const allChecked = Object.values(buyerVerificationChecks).every(v => v === true);
    if (selectedBuyerPreferenceId) {
      const buyerData = getSelectedBuyerMatches();
      if (buyerData && buyerData.matches.length > 0) {
        // تحديث buyerVerified لجميع المطابقات
        buyerData.matches.forEach(match => {
          const currentVerified = (match as any).buyerVerified || false;
          if (currentVerified !== allChecked) {
            updateMatchVerificationMutation.mutate({
              matchId: match.id,
              verificationType: "buyer",
              verified: allChecked,
            });
          }
        });
      }
    }
  }, [buyerVerificationChecks, selectedBuyerPreferenceId, preferences, users, filteredMatches, updateMatchVerificationMutation]);

  // Mutation لحفظ التأكيدات التفصيلية
  const updateDetailedVerificationsMutation = useMutation({
    mutationFn: async ({ matchId, detailedVerifications }: { matchId: string; detailedVerifications: {
      city: boolean;
      district: boolean;
      propertyType: boolean;
      price: boolean;
      rooms: boolean;
      bathrooms: boolean;
      area: boolean;
    }}) => {
      return apiRequest("PATCH", `/api/admin/matches/${matchId}/detailed-verifications`, { detailedVerifications });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في حفظ التأكيدات التفصيلية", variant: "destructive" });
    },
  });

  // Mutation لتسجيل محاولة اتصال
  const logCallMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest("POST", `/api/admin/matches/${matchId}/log-call`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      toast({ title: "تم تسجيل محاولة الاتصال" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل في تسجيل المحاولة", variant: "destructive" });
    },
  });

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
      `بركس - مطابقة عقارية جديدة\n\n` +
      `مرحباً ${buyer?.name || 'عميلنا الكريم'},\n\n` +
      `تم إيجاد عقار يتوافق مع رغباتك بنسبة ${match.matchScore}%\n\n` +
      `الموقع: ${prop?.city || ''} - ${prop?.district || ''}\n` +
      `السعر: ${prop?.price ? formatCurrency(prop.price) + ' ريال' : 'غير محدد'}\n\n` +
      `الرجاء الدخول لصفحتك الخاصة لتأكيد طلبك ومشاهدة التفاصيل.\n\n` +
      `منصة بركس العقارية`
    );
    
    // رسالة للبائع
    const sellerMessage = encodeURIComponent(
      `بركس - مشتري محتمل لعقارك\n\n` +
      `مرحباً ${seller?.name || 'عميلنا الكريم'},\n\n` +
      `يوجد مشتري مهتم بعقارك بنسبة تطابق ${match.matchScore}%\n\n` +
      `النوع: ${prop?.propertyType ? propertyTypeLabels[prop.propertyType] : 'عقار'}\n` +
      `الموقع: ${prop?.city || ''} - ${prop?.district || ''}\n\n` +
      `الرجاء الدخول لصفحتك الخاصة لتأكيد العرض والتواصل مع المشتري.\n\n` +
      `منصة بركس العقارية`
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
              <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">بركس</span>
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
            <div className="max-w-7xl mx-auto">
            {/* Unified KPI Header - فقط في قسم المطابقات */}
            {activeSection !== "matches" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card data-testid="card-stat-matches">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-500/10">
                        <Target className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{matches.length}</p>
                        <p className="text-sm text-muted-foreground">المطابقات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-properties">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Home className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{activeProperties.length}</p>
                        <p className="text-sm text-muted-foreground">العقارات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-preferences">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <ClipboardList className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{activePreferences.length}</p>
                        <p className="text-sm text-muted-foreground">الرغبات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-contacts">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <MessageSquare className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{contactRequests.length}</p>
                        <p className="text-sm text-muted-foreground">طلبات التواصل</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-4">
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
                            <RechartsTooltip />
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
                            <RechartsTooltip />
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
              <div className="space-y-6">
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
                </Card>
                <div className="w-full bg-white overflow-x-auto rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-b border-gray-100">
                        <TableHead className="min-w-[200px] text-center font-semibold">الاسم</TableHead>
                        <TableHead className="min-w-[200px] text-center font-semibold">البريد الإلكتروني</TableHead>
                        <TableHead className="w-[150px] text-center font-semibold">الجوال</TableHead>
                        <TableHead className="w-[120px] text-center font-semibold">النوع</TableHead>
                        <TableHead className="w-[140px] text-center font-semibold">وسائل التواصل</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50/50">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col items-start text-right">
                                  <p className="font-medium text-sm">{user.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <p className="text-sm text-muted-foreground truncate" dir="ltr">{user.email || "غير محدد"}</p>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <p className="text-sm" dir="ltr">{user.phone || "غير محدد"}</p>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge variant={user.role === "buyer" ? "default" : "secondary"}>
                                {user.role === "buyer" ? "مشتري" : user.role === "seller" ? "بائع" : "مدير"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                {user.phone && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const whatsappLink = getWhatsAppLink(user.phone!);
                                      window.open(whatsappLink, '_blank');
                                    }}
                                    title="واتساب"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                )}
                                {user.phone && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cleanedPhone = user.phone!.replace(/\D/g, '');
                                      window.location.href = `tel:${cleanedPhone}`;
                                    }}
                                    title="اتصال"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                )}
                                {user.email && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `mailto:${user.email}`;
                                    }}
                                    title="إيميل"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditingUser(false);
                                      setUserEditData({});
                                    }}>
                                      <Eye className="w-3 h-3 ml-1" />
                                      عرض
                                    </Button>
                                  </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
                                  <DialogHeader className="pb-4 border-b">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <DialogTitle className="text-2xl">تفاصيل المستخدم</DialogTitle>
                                        <DialogDescription className="mt-1">عرض وتعديل معلومات المستخدم</DialogDescription>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={isEditingUser ? "outline" : "default"}
                                        className="gap-2"
                                        onClick={() => {
                                          if (isEditingUser) {
                                            setIsEditingUser(false);
                                            setUserEditData({});
                                          } else {
                                            setIsEditingUser(true);
                                            setUserEditData({
                                              name: user.name,
                                              email: user.email,
                                              phone: user.phone,
                                              accountType: user.accountType,
                                              entityName: user.entityName,
                                              nationalId: user.nationalId,
                                              city: user.city,
                                              officeAddress: user.officeAddress,
                                              whatsappNumber: user.whatsappNumber,
                                              websiteUrl: user.websiteUrl,
                                            });
                                          }
                                        }}
                                      >
                                        {isEditingUser ? (
                                          <>
                                            <XCircle className="w-4 h-4" />
                                            إلغاء التعديل
                                          </>
                                        ) : (
                                          <>
                                            <Edit2 className="w-4 h-4" />
                                            تعديل البيانات
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 mt-6">
                                    {/* بطاقة المستخدم الرئيسية */}
                                    <Card className="border-2">
                                      <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20">
                                            <Users className="h-8 w-8 text-primary" />
                                          </div>
                                          <div className="flex-1 space-y-2">
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.name || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, name: e.target.value })}
                                                className="font-bold text-xl h-auto py-2 text-lg"
                                                placeholder="اسم المستخدم"
                                              />
                                            ) : (
                                              <h3 className="font-bold text-xl text-foreground">{user.name}</h3>
                                            )}
                                            <div className="flex items-center gap-2">
                                              <Badge 
                                                variant={user.role === "buyer" ? "default" : "secondary"}
                                                className="text-sm px-3 py-1"
                                              >
                                                {user.role === "buyer" ? "مشتري" : "بائع"}
                                              </Badge>
                                              {user.isVerified && (
                                                <Badge variant="outline" className="text-sm px-3 py-1 border-green-500 text-green-700 bg-green-50">
                                                  <CheckCircle className="w-3 h-3 ml-1" />
                                                  موثق
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* معلومات التواصل */}
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <div className="p-2 rounded-lg bg-blue-100">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                          </div>
                                          معلومات التواصل
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* البريد الإلكتروني */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <Mail className="h-4 w-4" />
                                              البريد الإلكتروني
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                type="email"
                                                value={userEditData.email || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, email: e.target.value })}
                                                className="h-10"
                                                placeholder="example@email.com"
                                                dir="ltr"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium" dir="ltr">{user.email || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                          {/* الجوال */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <Phone className="h-4 w-4" />
                                              الجوال
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                type="tel"
                                                value={userEditData.phone || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, phone: e.target.value })}
                                                dir="ltr"
                                                className="h-10"
                                                placeholder="05xxxxxxxx"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="ltr">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.phone || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                          {/* رقم واتساب */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <MessageSquare className="h-4 w-4" />
                                              رقم واتساب
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.whatsappNumber || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, whatsappNumber: e.target.value })}
                                                dir="rtl"
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.whatsappNumber ? toArabicPhone(user.whatsappNumber) : '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                          {/* الموقع الإلكتروني */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <ExternalLink className="h-4 w-4" />
                                              الموقع الإلكتروني
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                type="url"
                                                value={userEditData.websiteUrl || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, websiteUrl: e.target.value })}
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                {user.websiteUrl ? (
                                                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                                                    {user.websiteUrl}
                                                  </a>
                                                ) : (
                                                  <p className="text-sm text-muted-foreground">-</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* المعلومات الشخصية */}
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <div className="p-2 rounded-lg bg-purple-100">
                                            <UserIcon className="h-4 w-4 text-purple-600" />
                                          </div>
                                          المعلومات الشخصية
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* رقم الهوية */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <UserIcon className="h-4 w-4" />
                                              رقم الهوية/الإقامة
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.nationalId || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, nationalId: e.target.value })}
                                                dir="rtl"
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.nationalId || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                          {/* المدينة */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <MapPin className="h-4 w-4" />
                                              المدينة
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.city || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, city: e.target.value })}
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.city || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* معلومات الحساب */}
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <div className="p-2 rounded-lg bg-orange-100">
                                            <Building2 className="h-4 w-4 text-orange-600" />
                                          </div>
                                          معلومات الحساب
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* نوع الحساب */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <Building2 className="h-4 w-4" />
                                              نوع الحساب
                                            </Label>
                                            {isEditingUser ? (
                                              <Select
                                                value={userEditData.accountType || ''}
                                                onValueChange={(value) => setUserEditData({ ...userEditData, accountType: value })}
                                              >
                                                <SelectTrigger className="h-10">
                                                  <SelectValue placeholder="اختر نوع الحساب" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="individual">فرد</SelectItem>
                                                  <SelectItem value="developer">مطور</SelectItem>
                                                  <SelectItem value="office">مكتب عقاري</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                  {user.accountType === "individual" ? "فرد" : user.accountType === "developer" ? "مطور" : user.accountType === "office" ? "مكتب عقاري" : '-'}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                          {/* اسم الكيان */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <Building className="h-4 w-4" />
                                              اسم الكيان
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.entityName || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, entityName: e.target.value })}
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.entityName || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                          {/* عنوان المكتب */}
                                          <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                              <MapPin className="h-4 w-4" />
                                              عنوان المكتب
                                            </Label>
                                            {isEditingUser ? (
                                              <Input
                                                value={userEditData.officeAddress || ''}
                                                onChange={(e) => setUserEditData({ ...userEditData, officeAddress: e.target.value })}
                                                className="h-10"
                                              />
                                            ) : (
                                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm font-medium">{user.officeAddress || '-'}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* أزرار الحفظ */}
                                    {isEditingUser && (
                                      <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button
                                          variant="outline"
                                          size="lg"
                                          onClick={() => {
                                            setIsEditingUser(false);
                                            setUserEditData({});
                                          }}
                                          className="gap-2"
                                        >
                                          <XCircle className="w-4 h-4" />
                                          إلغاء
                                        </Button>
                                        <Button
                                          size="lg"
                                          onClick={() => {
                                            if (user.id) {
                                              updateUserMutation.mutate({ userId: user.id, data: userEditData });
                                            }
                                          }}
                                          disabled={updateUserMutation.isPending}
                                          className="gap-2"
                                        >
                                          {updateUserMutation.isPending ? (
                                            <>
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                              جاري الحفظ...
                                            </>
                                          ) : (
                                            <>
                                              <Save className="w-4 h-4" />
                                              حفظ التغييرات
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmDialog({
                                      open: true,
                                      type: "user",
                                      id: user.id,
                                      name: user.name || "المستخدم",
                                    });
                                  }}
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                            لا يوجد مستخدمين
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>رغبات المشترين ({preferences.length})</CardTitle>
                    <CardDescription>جميع طلبات الشراء المسجلة</CardDescription>
                  </CardHeader>
                </Card>
                <div className="w-full bg-white overflow-x-auto rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-b border-gray-100">
                        <TableHead className="min-w-[200px] text-center font-semibold">المشتري</TableHead>
                        <TableHead className="min-w-[150px] text-center font-semibold">المدينة</TableHead>
                        <TableHead className="min-w-[150px] text-center font-semibold">الأحياء</TableHead>
                        <TableHead className="w-[120px] text-center font-semibold">نوع العقار</TableHead>
                        <TableHead className="w-[150px] text-center font-semibold">الميزانية</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الغرف</TableHead>
                        <TableHead className="w-[140px] text-center font-semibold">وسائل التواصل</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الحالة</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preferences.length > 0 ? (
                        preferences.map((pref) => {
                          const user = users.find(u => u.id === pref.userId);
                          return (
                            <TableRow key={pref.id} className="hover:bg-slate-50/50">
                              <TableCell className="py-4">
                                {user ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col items-start text-right">
                                      <p className="font-medium text-sm">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">{toArabicPhone(user.phone || '')}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">غير معروف</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge variant="secondary">{pref.city}</Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="text-sm">
                                  {pref.districts && pref.districts.length > 0 ? (
                                    <span className="text-muted-foreground">{pref.districts.slice(0, 2).join("، ")}{pref.districts.length > 2 ? ` +${pref.districts.length - 2}` : ''}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge variant="outline">{propertyTypeLabels[pref.propertyType] || pref.propertyType}</Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="text-sm font-medium">
                                  {(pref.budgetMin || pref.budgetMax) ? maskBudget(pref.budgetMin, pref.budgetMax) : '-'}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <span className="text-sm">{pref.rooms || '-'}</span>
                              </TableCell>
                              <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                {user && (
                                  <div className="flex items-center justify-center gap-1">
                                    {user.phone && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const whatsappLink = getWhatsAppLink(user.phone!);
                                          window.open(whatsappLink, '_blank');
                                        }}
                                        title="واتساب"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {user.phone && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const cleanedPhone = user.phone!.replace(/\D/g, '');
                                          window.location.href = `tel:${cleanedPhone}`;
                                        }}
                                        title="اتصال"
                                      >
                                        <Phone className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {user.email && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = `mailto:${user.email}`;
                                        }}
                                        title="إيميل"
                                      >
                                        <Mail className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge className={pref.isActive ? "bg-green-500" : "bg-muted"}>
                                  {pref.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleShowPreferenceDetails(pref.id)}
                                  >
                                    <Eye className="w-3 h-3 ml-1" />
                                    عرض
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmDialog({
                                        open: true,
                                        type: "preference",
                                        id: pref.id,
                                        name: `رغبة ${user?.name || pref.id}`,
                                      });
                                    }}
                                    title="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                            لا توجد رغبات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Properties Section */}
            {activeSection === "properties" && (
              <div className="space-y-6">
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
                </Card>
                <div className="w-full bg-white overflow-x-auto rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-b border-gray-100">
                        <TableHead className="min-w-[200px] text-center font-semibold">البائع</TableHead>
                        <TableHead className="min-w-[120px] text-center font-semibold">المدينة</TableHead>
                        <TableHead className="min-w-[120px] text-center font-semibold">الحي</TableHead>
                        <TableHead className="w-[120px] text-center font-semibold">نوع العقار</TableHead>
                        <TableHead className="w-[150px] text-center font-semibold">السعر</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">المساحة</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الغرف</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">المشاهدات</TableHead>
                        <TableHead className="w-[140px] text-center font-semibold">وسائل التواصل</TableHead>
                        <TableHead className="w-[100px] text-center font-semibold">الحالة</TableHead>
                        <TableHead className="w-[120px] text-center font-semibold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((prop) => {
                          const seller = users.find(u => u.id === prop.sellerId);
                          return (
                            <TableRow key={prop.id} className="hover:bg-slate-50/50">
                              <TableCell className="py-4">
                                {seller ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Store className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex flex-col items-start text-right">
                                      <p className="font-medium text-sm">{seller.name}</p>
                                      <p className="text-xs text-muted-foreground">{toArabicPhone(seller.phone || '')}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">غير معروف</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge variant="secondary">{prop.city}</Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <span className="text-sm">{prop.district}</span>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge variant="outline">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="text-sm font-bold text-primary">
                                  {formatCurrency(prop.price)} ريال
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <span className="text-sm">{prop.area || '-'}</span>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <span className="text-sm">{prop.rooms || '-'}</span>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="w-3 h-3" />
                                  {prop.viewsCount || 0}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                {seller && (
                                  <div className="flex items-center justify-center gap-1">
                                    {seller.phone && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const whatsappLink = getWhatsAppLink(seller.phone!);
                                          window.open(whatsappLink, '_blank');
                                        }}
                                        title="واتساب"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {seller.phone && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const cleanedPhone = seller.phone!.replace(/\D/g, '');
                                          window.location.href = `tel:${cleanedPhone}`;
                                        }}
                                        title="اتصال"
                                      >
                                        <Phone className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {seller.email && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = `mailto:${seller.email}`;
                                        }}
                                        title="إيميل"
                                      >
                                        <Mail className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <Badge className={prop.isActive ? "bg-green-500" : "bg-red-500"}>
                                  {prop.isActive ? "نشط" : "موقوف"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPropertyId(prop.id);
                                      setShowPropertyDetailsDialog(true);
                                    }}
                                  >
                                    <Eye className="w-3 h-3 ml-1" />
                                    عرض
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={prop.isActive ? "destructive" : "default"}
                                    onClick={() => togglePropertyMutation.mutate({ id: prop.id, isActive: !prop.isActive })}
                                    disabled={togglePropertyMutation.isPending}
                                    data-testid={`button-toggle-property-${prop.id}`}
                                  >
                                    {prop.isActive ? (
                                      <>
                                        <XCircle className="w-3 h-3 ml-1" />
                                        إيقاف
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 ml-1" />
                                        تفعيل
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmDialog({
                                        open: true,
                                        type: "property",
                                        id: prop.id,
                                        name: `عقار في ${prop.city} - ${prop.district}`,
                                      });
                                    }}
                                    title="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                            لا توجد عقارات
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* ✅ قسم المطابقات - Deal-Driven Pipeline */}
            {activeSection === "matches" && (
              <div className="space-y-6">
                {/* Unified KPI Header - محدث */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {/* الكل */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "all" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("all");
                      setMatchFilters({ ...matchFilters, status: "all", minScore: 0, maxScore: 100 });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold">{matches.length}</p>
                          <p className="text-xs text-muted-foreground">الكل</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* مطابقات جديدة */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "new" ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("new");
                      setMatchFilters({ ...matchFilters, status: "new" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{matches.filter(m => ((m as any).status || "new") === "new").length}</p>
                          <p className="text-xs text-muted-foreground">مطابقات جديدة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* بانتظار الرد */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "contacted" ? "ring-2 ring-orange-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("contacted");
                      setMatchFilters({ ...matchFilters, status: "contacted" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-orange-600">{matches.filter(m => ((m as any).status || "new") === "contacted").length}</p>
                          <p className="text-xs text-muted-foreground">تم التواصل</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* تم التأكيد */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "confirmed" ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("confirmed");
                      setMatchFilters({ ...matchFilters, status: "confirmed" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{matches.filter(m => ((m as any).status || "new") === "confirmed").length}</p>
                          <p className="text-xs text-muted-foreground">تم التأكيد</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* تم المعاينة */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "viewing" ? "ring-2 ring-purple-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("viewing");
                      setMatchFilters({ ...matchFilters, status: "viewing" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{matches.filter(m => ((m as any).status || "new") === "viewing").length}</p>
                          <p className="text-xs text-muted-foreground">تم المعاينة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* تم الاتفاق */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "agreed" ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("agreed");
                      setMatchFilters({ ...matchFilters, status: "agreed" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Handshake className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">{matches.filter(m => ((m as any).status || "new") === "agreed").length}</p>
                          <p className="text-xs text-muted-foreground">تم الاتفاق</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* تم الافراغ */}
                  <Card 
                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedMatchStatus === "vacated" ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => {
                      setSelectedMatchStatus("vacated");
                      setMatchFilters({ ...matchFilters, status: "vacated" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Home className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">{matches.filter(m => ((m as any).status || "new") === "vacated").length}</p>
                          <p className="text-xs text-muted-foreground">تم الافراغ</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>


                {/* Grouped Control Bar */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="flex border rounded-md">
                      <Button
                        variant={matchViewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        className="h-9 rounded-r-none"
                        onClick={() => setMatchViewMode("grid")}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={matchViewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        className="h-9 rounded-l-none"
                        onClick={() => setMatchViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="h-9 px-3">
                      {filteredMatches.length} من {matches.length} نتيجة
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث في المطابقات..."
                        value={matchSearchQuery}
                        onChange={(e) => setMatchSearchQuery(e.target.value)}
                        className="w-64 pr-8 h-9"
                      />
                    </div>
                    <Select value={matchSortBy} onValueChange={(val) => setMatchSortBy(val as any)}>
                      <SelectTrigger className="w-32 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">حسب النقاط</SelectItem>
                        <SelectItem value="date">حسب التاريخ</SelectItem>
                        <SelectItem value="status">حسب الحالة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Popover open={showMatchFilters} onOpenChange={setShowMatchFilters}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9" data-testid="button-filter-matches">
                          <Filter className="h-4 w-4 ml-2" />
                          تصفية
                        </Button>
                      </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start" dir="rtl">
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium block">التطابق: {matchFilters.minScore}%-{matchFilters.maxScore}%</label>
                              <Slider value={[matchFilters.minScore, matchFilters.maxScore]} onValueChange={(val) => setMatchFilters({...matchFilters, minScore: val[0], maxScore: val[1]})} min={0} max={100} step={1} className="h-1" data-testid="slider-score-filter" />
                            </div>
                            <Separator className="my-2" />
                            <Select value={matchFilters.status} onValueChange={(val) => setMatchFilters({...matchFilters, status: val as any})} data-testid="select-status-filter">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="new">جديد</SelectItem>
                                <SelectItem value="contacted">تم التواصل</SelectItem>
                                <SelectItem value="viewing_scheduled">زيارة مجدولة</SelectItem>
                                <SelectItem value="closed">مغلقة</SelectItem>
                                <SelectItem value="lost">فاشلة</SelectItem>
                                <SelectItem value="saved">محفوظ</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={matchFilters.propertyType} onValueChange={(val) => setMatchFilters({...matchFilters, propertyType: val})} data-testid="select-property-filter">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="النوع" />
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
                            <Select value={matchFilters.city} onValueChange={(val) => setMatchFilters({...matchFilters, city: val})} data-testid="select-city-filter">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="المدينة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="جدة">جدة</SelectItem>
                                <SelectItem value="الرياض">الرياض</SelectItem>
                                <SelectItem value="الدمام">الدمام</SelectItem>
                                <SelectItem value="مكة">مكة</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium block">السعر: {formatCurrency(matchFilters.minPrice / 1000000).replace('.00', '')}M - {formatCurrency(matchFilters.maxPrice / 1000000).replace('.00', '')}M</label>
                              <Slider value={[matchFilters.minPrice, matchFilters.maxPrice]} onValueChange={(val) => setMatchFilters({...matchFilters, minPrice: val[0], maxPrice: val[1]})} min={0} max={10000000} step={50000} className="h-1" data-testid="slider-price-filter" />
                            </div>
                            <Button size="sm" className="w-full h-7 text-xs" onClick={() => setShowMatchFilters(false)} data-testid="button-apply-filters">تطبيق</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Debug Info */}
                  {matchesLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      جاري تحميل المطابقات...
                    </div>
                  )}
                  {matchesError && (
                    <div className="text-center py-8 text-red-500">
                      خطأ في تحميل المطابقات: {String(matchesError)}
                    </div>
                  )}
                  {!matchesLoading && !matchesError && matches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد مطابقات في قاعدة البيانات. قم بإضافة عقارات ورغبات لإنشاء مطابقات.
                    </div>
                  )}

                  {!matchesLoading && !matchesError && matches.length > 0 && filteredMatches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="font-semibold text-yellow-800 mb-2">لا توجد نتائج تطابق الفلاتر المحددة</p>
                      <p className="text-sm text-yellow-700">
                        يوجد {matches.length} مطابقة في قاعدة البيانات، لكن الفلاتر المحددة لا تطابق أي منها.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setMatchFilters({
                            minScore: 0,
                            maxScore: 100,
                            status: "all",
                            propertyType: "all",
                            city: "all",
                            minPrice: 0,
                            maxPrice: 10000000,
                          });
                          setMatchSearchQuery("");
                          setMatchSortBy("score");
                          console.log("✅ Filters reset to defaults");
                        }}
                      >
                        إعادة تعيين الفلاتر
                      </Button>
                    </div>
                  )}

                  {/* Table View */}
                  {filteredMatches.length > 0 ? (
                    matchViewMode === "list" ? (
                      // Table View - Professional Optimized
                      <div className="w-full bg-white overflow-x-auto rounded-lg border border-gray-100">
                        {/* Quick Edit Bar */}
                        {selectedMatchIds.size > 0 && (
                          <div className="border-b bg-slate-50 px-4 py-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {(() => {
                                // حساب عدد المشترين المختارين
                                const selectedBuyerPreferenceIds = new Set(
                                  Array.from(selectedMatchIds)
                                    .map(id => matches.find(m => m.id === id)?.buyerPreferenceId)
                                    .filter(Boolean) as string[]
                                );
                                return `${selectedMatchIds.size} مطابقة من ${selectedBuyerPreferenceIds.size} مشتري محددة`;
                              })()}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Pencil className="w-4 h-4" />
                                  تحرير سريع
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>إجراءات سريعة</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  // تغيير حالة المطابقة
                                  const statusOptions = ["new", "contacted", "confirmed", "viewing", "agreed", "vacated"];
                                  const selectedStatus = window.prompt(`اختر الحالة:\n${statusOptions.map((s, i) => `${i + 1}. ${getStatusBadgeConfig(s).label}`).join('\n')}\n\nأدخل الرقم:`);
                                  if (selectedStatus && statusOptions[parseInt(selectedStatus) - 1]) {
                                    const status = statusOptions[parseInt(selectedStatus) - 1];
                                    Array.from(selectedMatchIds).forEach(id => {
                                      updateMatchStatusMutation.mutate({ matchId: id, status });
                                    });
                                    toast({ title: `تم تحديث حالة ${selectedMatchIds.size} مطابقة` });
                                    setSelectedMatchIds(new Set());
                                  }
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  تغيير حالة المطابقة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // إرسال إشعار واتساب
                                  Array.from(selectedMatchIds).forEach(id => {
                                    handleSendMatchNotification(id);
                                  });
                                  toast({ title: `تم إرسال إشعارات لـ ${selectedMatchIds.size} مطابقة` });
                                  setSelectedMatchIds(new Set());
                                }}>
                                  <MessageSquare className="w-4 h-4 ml-2" />
                                  إرسال إشعار واتساب
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={async () => {
                                  // حفظ/إلغاء الحفظ
                                  const firstMatch = matches.find(m => selectedMatchIds.has(m.id));
                                  const isSaved = !firstMatch?.isSaved;
                                  for (const id of Array.from(selectedMatchIds)) {
                                    try {
                                      await apiRequest("PUT", `/api/matches/${id}/toggle-saved`, { isSaved });
                                    } catch (error) {
                                      console.error(error);
                                    }
                                  }
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
                                  toast({ title: `تم ${isSaved ? 'حفظ' : 'إلغاء حفظ'} ${selectedMatchIds.size} مطابقة` });
                                  setSelectedMatchIds(new Set());
                                }}>
                                  <Save className="w-4 h-4 ml-2" />
                                  حفظ/إلغاء الحفظ
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  // تصدير Excel
                                  toast({ title: "جاري تصدير المطابقات إلى Excel...", description: "هذه الميزة قيد التطوير" });
                                }}>
                                  <FileExcel className="w-4 h-4 ml-2" />
                                  تصدير Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // تصدير PDF
                                  toast({ title: "جاري تصدير المطابقات إلى PDF...", description: "هذه الميزة قيد التطوير" });
                                }}>
                                  <FilePdf className="w-4 h-4 ml-2" />
                                  تصدير PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={async () => {
                                  // حذف المطابقات - TODO: إضافة DELETE endpoint في المستقبل
                                  toast({ title: "ميزة الحذف قيد التطوير", description: "سيتم إضافة endpoint للحذف قريباً" });
                                }} className="text-red-600">
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف المطابقات
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-gray-100">
                              <TableHead className="w-14 text-center">
                                <div className="flex justify-center">
                                  <Checkbox 
                                    checked={selectedMatchIds.size === filteredMatches.length && filteredMatches.length > 0}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedMatchIds(new Set(filteredMatches.map(m => m.id)));
                                      } else {
                                        setSelectedMatchIds(new Set());
                                      }
                                    }}
                                  />
                                </div>
                              </TableHead>
                              <TableHead className="min-w-[220px] text-center font-semibold">المشتري</TableHead>
                              <TableHead className="w-[140px] text-center font-semibold">وسائل التواصل</TableHead>
                              <TableHead className="w-[130px] text-center font-semibold">عدد المطابقات</TableHead>
                              <TableHead className="w-[130px] text-center font-semibold">أفضل تطابق</TableHead>
                              <TableHead className="w-[140px] text-center font-semibold">التأكيدات</TableHead>
                              <TableHead className="w-[150px] text-center font-semibold">الحالة</TableHead>
                              <TableHead className="w-[110px] text-center font-semibold">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              console.log("🔍 Processing matches for table:", {
                                filteredMatchesCount: filteredMatches.length,
                                preferencesCount: preferences.length,
                                propertiesCount: properties.length,
                                usersCount: users.length,
                              });

                              // إزالة التكرارات بناءً على buyerPreferenceId + propertyId
                              const seenMatches = new Map<string, Match>();
                              const uniqueMatches = filteredMatches.filter(match => {
                                const key = `${match.buyerPreferenceId}-${match.propertyId}`;
                                if (seenMatches.has(key)) {
                                  return false; // تكرار
                                }
                                seenMatches.set(key, match);
                                return true;
                              });

                              console.log("🔍 Unique matches after deduplication:", uniqueMatches.length);

                              // تجميع المطابقات حسب buyerPreferenceId
                              const groupedByBuyer = new Map<string, Match[]>();
                              uniqueMatches.forEach(match => {
                                const key = match.buyerPreferenceId || 'unknown';
                                if (!groupedByBuyer.has(key)) {
                                  groupedByBuyer.set(key, []);
                                }
                                groupedByBuyer.get(key)!.push(match);
                              });

                              console.log("🔍 Grouped by buyer:", groupedByBuyer.size);

                              // تحويل المجموعات إلى مصفوفة للعرض
                              const groups = Array.from(groupedByBuyer.entries());
                              console.log("🔍 Groups to display:", groups.length);
                              return groups;
                            })().map(([buyerPreferenceId, buyerMatches]) => {
                              // ترتيب المطابقات حسب matchScore (الأفضل أولاً)
                              const sortedMatches = [...buyerMatches].sort((a, b) => b.matchScore - a.matchScore);
                              const bestMatch = sortedMatches[0];
                              const matchCount = sortedMatches.length;

                              const pref = preferences.find(p => p.id === buyerPreferenceId);
                              if (!pref) {
                                console.warn("Preference not found for buyerPreferenceId:", buyerPreferenceId);
                                return null;
                              }
                              const buyer = users.find(u => u.id === pref.userId);
                              if (!buyer) {
                                console.warn("Buyer not found for userId:", pref.userId);
                                return null;
                              }

                              // أفضل مطابقة
                              const bestProp = properties.find(p => p.id === bestMatch.propertyId);
                              if (!bestProp) {
                                console.warn("Property not found for propertyId:", bestMatch.propertyId);
                                return null;
                              }
                              
                              const bestMatchStatus = (bestMatch as any).status || "new";
                              // التأكيد يكون نشطاً إذا كانت جميع المطابقات لديها buyerVerified = true
                              const bestBuyerVerified = sortedMatches.every(m => (m as any).buyerVerified === true);
                              
                              const getScoreColor = (score: number) => {
                                // تدرج الألوان: أحمر → برتقالي → أخضر
                                const percentage = Math.round((score / 105) * 100);
                                if (percentage >= 70) return "#10b981"; // أخضر
                                if (percentage >= 40) return "#f59e0b"; // برتقالي
                                return "#ef4444"; // أحمر
                              };

                              const bestPercentage = Math.round((bestMatch.matchScore / 105) * 100);
                              
                              // جمع جميع match IDs للمشتري للـ checkbox
                              const buyerMatchIds = sortedMatches.map(m => m.id);
                              const allSelected = buyerMatchIds.every(id => selectedMatchIds.has(id));
                              const someSelected = buyerMatchIds.some(id => selectedMatchIds.has(id));

                              return (
                                <TableRow 
                                  key={buyerPreferenceId} 
                                  className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    // منع التوسيع عند الضغط على Checkbox أو Button أو Badge
                                    const target = e.target as HTMLElement;
                                    if (
                                      target.closest('input[type="checkbox"]') || 
                                      target.closest('button') || 
                                      target.closest('[role="button"]') ||
                                      target.closest('[role="combobox"]') ||
                                      target.closest('[data-radix-popper-content-wrapper]')
                                    ) {
                                      return;
                                    }
                                    // فتح Dialog "مطابقات المشتري"
                                    handleShowBuyerMatches(buyerPreferenceId);
                                  }}
                                >
                                  {/* Checkbox */}
                                  <TableCell className="w-14 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-center">
                                      <Checkbox 
                                        checked={allSelected}
                                        ref={(el) => {
                                          if (el) {
                                            (el as any).indeterminate = someSelected && !allSelected;
                                          }
                                        }}
                                        onCheckedChange={(checked) => {
                                          const newSet = new Set(selectedMatchIds);
                                          if (checked) {
                                            buyerMatchIds.forEach(id => newSet.add(id));
                                          } else {
                                            buyerMatchIds.forEach(id => newSet.delete(id));
                                          }
                                          setSelectedMatchIds(newSet);
                                        }}
                                      />
                                    </div>
                                  </TableCell>
                                  {/* المشتري - Avatar + الاسم */}
                                  <TableCell className="min-w-[220px] py-4 text-center align-middle">
                                    <div className="flex items-center gap-3 justify-center">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                      </div>
                                      <div className="flex flex-col items-start text-right">
                                        <p className="font-medium text-sm">{buyer.name || "مستخدم"}</p>
                                        <p className="text-xs text-muted-foreground">{buyer.phone || "-"}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  {/* وسائل التواصل */}
                                  <TableCell className="w-[140px] text-center align-middle py-4">
                                    <div className="flex items-center justify-center gap-1 pointer-events-auto">
                                      {buyer.phone && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const whatsappLink = getWhatsAppLink(buyer.phone!);
                                            window.open(whatsappLink, '_blank');
                                          }}
                                          title="واتساب"
                                        >
                                          <SiWhatsapp className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {buyer.phone && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const cleanedPhone = buyer.phone!.replace(/\D/g, '');
                                            window.location.href = `tel:${cleanedPhone}`;
                                          }}
                                          title="اتصال"
                                        >
                                          <Phone className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {buyer.email && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:${buyer.email}`;
                                          }}
                                          title="إيميل"
                                        >
                                          <Mail className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  {/* عدد المطابقات */}
                                  <TableCell className="w-[130px] text-center align-middle py-4">
                                    <div className="flex items-center justify-center">
                                      <Badge variant="outline" className="text-sm font-semibold px-3 py-1.5">
                                        {matchCount} مطابقة
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  {/* أفضل تطابق */}
                                  <TableCell className="w-[130px] text-center align-middle py-4">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <div className="relative w-12 h-12">
                                        <svg className="w-12 h-12 transform -rotate-90">
                                          <circle stroke="#e2e8f0" strokeWidth="3" fill="white" r="16" cx="24" cy="24" />
                                          <circle 
                                            stroke={getScoreColor(bestMatch.matchScore)}
                                            strokeWidth="3"
                                            strokeDasharray={2 * Math.PI * 16}
                                            strokeDashoffset={2 * Math.PI * 16 * (1 - bestMatch.matchScore / 105)}
                                            strokeLinecap="round"
                                            fill="transparent"
                                            r="16"
                                            cx="24"
                                            cy="24"
                                          />
                                        </svg>
                                        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                                          bestPercentage >= 70 ? "text-emerald-600" : bestPercentage >= 40 ? "text-amber-600" : "text-red-600"
                                        }`}>
                                          {bestPercentage}%
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">أفضل تطابق</p>
                                    </div>
                                  </TableCell>
                                  {/* التأكيدات - buyerVerified فقط */}
                                  <TableCell className="w-[140px] py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* أيقونة عقار - رمادي */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="relative w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-400">
                                              <Building2 className="w-3.5 h-3.5" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد حالة العقار وصحته</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      {/* أيقونة مستخدم - نشط إذا buyerVerified */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                              bestBuyerVerified 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-slate-200 text-slate-400"
                                            }`}>
                                              <UserIcon className="w-3.5 h-3.5" />
                                              {bestBuyerVerified && (
                                                <CheckCircle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-primary bg-white rounded-full" />
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد رغبة المشتري وجديته</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      {/* أيقونة قائمة - رمادي */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="relative w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-400">
                                              <ClipboardList className="w-3.5 h-3.5" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد مطابقة المواصفات الفنية</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      {/* أيقونة محفظة - رمادي */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="relative w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-400">
                                              <Wallet className="w-3.5 h-3.5" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد الملاءة المالية والقدرة على الشراء</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                  {/* الحالة - حالة المهمة */}
                                  <TableCell className="w-[150px] py-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-center items-center">
                                      {(() => {
                                        const statusConfig = getStatusBadgeConfig(bestMatchStatus);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <button
                                                type="button"
                                                className={`${statusConfig.className} border cursor-pointer px-2.5 py-1 flex items-center gap-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:opacity-80`}
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                              </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                                              <DropdownMenuLabel>تغيير حالة المهمة</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              {["new", "contacted", "confirmed", "viewing", "agreed", "vacated"].map((status) => {
                                                const config = getStatusBadgeConfig(status);
                                                const Icon = config.icon;
                                                return (
                                                  <DropdownMenuItem
                                                    key={status}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      // تحديث حالة جميع مطابقات المشتري
                                                      buyerMatchIds.forEach(id => {
                                                        updateMatchStatusMutation.mutate({ matchId: id, status });
                                                      });
                                                    }}
                                                    className={bestMatchStatus === status ? "bg-slate-100" : ""}
                                                  >
                                                    <Icon className="w-4 h-4 ml-2" />
                                                    {config.label}
                                                    {bestMatchStatus === status && <CheckCircle className="w-4 h-4 mr-auto" />}
                                                  </DropdownMenuItem>
                                                );
                                              })}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        );
                                      })()}
                                    </div>
                                  </TableCell>
                                  {/* زر عرض المطابقات */}
                                  <TableCell className="w-[150px] py-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShowBuyerMatches(buyerPreferenceId);
                                        }}
                                        className="gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        عرض
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // حذف جميع مطابقات المشتري
                                          buyerMatchIds.forEach(id => {
                                            setDeleteConfirmDialog({
                                              open: true,
                                              type: "match",
                                              id: id,
                                              name: `مطابقة ${buyer.name}`,
                                            });
                                          });
                                        }}
                                        title="حذف جميع المطابقات"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      // Grid View - جدول كثيف قابل للتوسيع
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50">
                              <TableHead className="w-12 text-center">
                                <Checkbox
                                  checked={selectedMatchIds.size === filteredMatches.length && filteredMatches.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedMatchIds(new Set(filteredMatches.map(m => m.id)));
                                    } else {
                                      setSelectedMatchIds(new Set());
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead className="w-12 text-center">توسيع</TableHead>
                              <TableHead className="min-w-[200px]">المشتري</TableHead>
                              <TableHead className="min-w-[200px]">البائع</TableHead>
                              <TableHead className="w-32 text-center">نسبة التطابق</TableHead>
                              <TableHead className="w-[150px] text-center">الحالة</TableHead>
                              <TableHead className="w-24 text-center">تفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMatches.map((match) => {
                              const pref = preferences.find(p => p.id === match.buyerPreferenceId);
                              const prop = properties.find(p => p.id === match.propertyId);
                              const buyer = pref ? users.find(u => u.id === pref.userId) : null;
                              const seller = prop ? users.find(u => u.id === prop.sellerId) : null;

                              if (!pref || !prop) return null;

                              const percentage = Math.round((match.matchScore / 105) * 100);
                              const isExpanded = expandedRows.has(match.id);
                              const breakdown = calculateMatchBreakdown(prop, pref);
                              
                              const getScoreColor = (score: number) => {
                                const scorePercentage = Math.round((score / 105) * 100);
                                if (scorePercentage >= 70) return "#10b981"; // أخضر
                                if (scorePercentage >= 40) return "#f59e0b"; // برتقالي
                                return "#ef4444"; // أحمر
                              };

                              const toggleExpand = () => {
                                const newExpanded = new Set(expandedRows);
                                if (newExpanded.has(match.id)) {
                                  newExpanded.delete(match.id);
                                } else {
                                  newExpanded.add(match.id);
                                }
                                setExpandedRows(newExpanded);
                              };

                              return (
                                <React.Fragment key={match.id}>
                                  <TableRow className="hover:bg-slate-50/50">
                                    {/* Checkbox */}
                                    <TableCell className="py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        checked={selectedMatchIds.has(match.id)}
                                        onCheckedChange={(checked) => {
                                          const newSet = new Set(selectedMatchIds);
                                          if (checked) {
                                            newSet.add(match.id);
                                          } else {
                                            newSet.delete(match.id);
                                          }
                                          setSelectedMatchIds(newSet);
                                        }}
                                      />
                                    </TableCell>
                                    {/* سهم التوسيع */}
                                    <TableCell className="py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={toggleExpand}
                                      >
                                        {isExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </TableCell>
                                    {/* المشتري */}
                                    <TableCell className="py-2">
                                      <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm truncate">{buyer?.name || "مستخدم"}</p>
                                          <p className="text-xs text-muted-foreground truncate">{buyer?.phone || "-"}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    {/* البائع */}
                                    <TableCell className="py-2">
                                      <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm truncate">{seller?.name || "بائع"}</p>
                                          <p className="text-xs text-muted-foreground truncate">{seller?.phone || "-"}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    {/* نسبة التطابق */}
                                    <TableCell className="py-2 text-center">
                                      <div className="flex flex-col items-center">
                                        <div className="relative w-10 h-10">
                                          <svg className="w-10 h-10 transform -rotate-90">
                                            <circle stroke="#e2e8f0" strokeWidth="2.5" fill="white" r="13" cx="20" cy="20" />
                                            <circle 
                                              stroke={getScoreColor(match.matchScore)}
                                              strokeWidth="2.5"
                                              strokeDasharray={2 * Math.PI * 13}
                                              strokeDashoffset={2 * Math.PI * 13 * (1 - match.matchScore / 105)}
                                              strokeLinecap="round"
                                              fill="transparent"
                                              r="13"
                                              cx="20"
                                              cy="20"
                                            />
                                          </svg>
                                          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                                            percentage >= 70 ? "text-emerald-600" : percentage >= 40 ? "text-amber-600" : "text-red-600"
                                          }`}>
                                            {percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    {/* الحالة - قائمة منسدلة */}
                                    <TableCell className="py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex justify-center items-center">
                                        {(() => {
                                          const matchStatus = (match as any).status || "new";
                                          const statusConfig = getStatusBadgeConfig(matchStatus);
                                          const StatusIcon = statusConfig.icon;
                                          return (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button
                                                  type="button"
                                                  className={`${statusConfig.className} border cursor-pointer px-2.5 py-1 flex items-center gap-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:opacity-80`}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <StatusIcon className="w-3 h-3" />
                                                  {statusConfig.label}
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuLabel>تغيير حالة المهمة</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {["new", "contacted", "confirmed", "viewing", "agreed", "vacated"].map((status) => {
                                                  const config = getStatusBadgeConfig(status);
                                                  const Icon = config.icon;
                                                  return (
                                                    <DropdownMenuItem
                                                      key={status}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateMatchStatusMutation.mutate({ matchId: match.id, status });
                                                      }}
                                                      className={matchStatus === status ? "bg-slate-100" : ""}
                                                    >
                                                      <Icon className="w-4 h-4 ml-2" />
                                                      {config.label}
                                                      {matchStatus === status && <CheckCircle className="w-4 h-4 mr-auto" />}
                                                    </DropdownMenuItem>
                                                  );
                                                })}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          );
                                        })()}
                                      </div>
                                    </TableCell>
                                    {/* زر تفاصيل */}
                                    <TableCell className="py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleShowMatchDetails(match.id)}
                                        className="gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        تفاصيل
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                  {/* الصف الموسع - Score Breakdown */}
                                  {isExpanded && (
                                    <TableRow>
                                      <TableCell colSpan={7} className="bg-slate-50/50 p-4">
                                        <div className="space-y-4">
                                          <h4 className="font-semibold text-sm mb-3">تفصيل النقاط (Score Breakdown)</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* الموقع */}
                                            <Card className="border-l-4 border-l-blue-500">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium text-sm">الموقع</span>
                                                  </div>
                                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {breakdown.location} / 35
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  {breakdown.location === 35 ? "مطابقة الحي بالضبط = 35 نقطة" :
                                                   breakdown.location === 22 ? "حي مجاور = 22 نقطة" :
                                                   breakdown.location === 18 ? "نفس المدينة فقط = 18 نقطة" :
                                                   breakdown.location === 12 ? "نفس المدينة فقط = 12 نقطة" : "لا يوجد تطابق"}
                                                </p>
                                              </CardContent>
                                            </Card>
                                            {/* السعر */}
                                            <Card className="border-l-4 border-l-green-500">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <Wallet className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium text-sm">السعر</span>
                                                  </div>
                                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {breakdown.price} / 30
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  {breakdown.price === 30 ? "ضمن الميزانية بالضبط = 30 نقطة" :
                                                   breakdown.price === 25 ? "ضمن الميزانية = 25 نقطة" :
                                                   breakdown.price === 20 ? "أعلى بـ 5% = 20 نقطة" :
                                                   breakdown.price === 15 ? "تقدير = 15 نقطة" :
                                                   breakdown.price === 10 ? "أعلى بـ 15% = 10 نقاط" : "لا يوجد تطابق"}
                                                </p>
                                              </CardContent>
                                            </Card>
                                            {/* المواصفات */}
                                            <Card className="border-l-4 border-l-purple-500">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-purple-600" />
                                                    <span className="font-medium text-sm">المواصفات</span>
                                                  </div>
                                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                    {breakdown.specifications} / 25
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  نوع العقار = 12 نقطة | الغرف/المساحة = 13 نقطة
                                                </p>
                                              </CardContent>
                                            </Card>
                                            {/* التفاصيل */}
                                            <Card className="border-l-4 border-l-orange-500">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <ClipboardList className="w-4 h-4 text-orange-600" />
                                                    <span className="font-medium text-sm">التفاصيل</span>
                                                  </div>
                                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                    {breakdown.details} / 10
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  transactionType + purpose + paymentMethod + amenities
                                                </p>
                                              </CardContent>
                                            </Card>
                                            {/* البونص */}
                                            <Card className="border-l-4 border-l-yellow-500">
                                              <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-yellow-600" />
                                                    <span className="font-medium text-sm">البونص</span>
                                                  </div>
                                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    {breakdown.bonus} / 5
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  حديث الإعلان (2) + الشعبية (2) + الحالة النشطة (1)
                                                </p>
                                              </CardContent>
                                            </Card>
                                            {/* الإجمالي */}
                                            <Card className="border-l-4 border-l-primary">
                                              <CardContent className="p-4 bg-primary/5">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-primary" />
                                                    <span className="font-semibold text-sm">الإجمالي</span>
                                                  </div>
                                                  <Badge variant="default" className="bg-primary text-primary-foreground">
                                                    {breakdown.total} / 105
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  النسبة المئوية: {percentage}%
                                                </p>
                                              </CardContent>
                                            </Card>
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )
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

                  {/* Side Drawer - Checklist */}
                </div>
              )}
            {/* Analytics Section - Enhanced Dashboard */}
            {/* Analytics Section - Enhanced Dashboard */}
            {activeSection === "analytics" && (() => {
              // حساب البيانات الفعلية (داخل IIFE لأنها تحتاج props)
              const totalRevenue = properties.reduce((sum, p) => sum + (p.price || 0), 0);

              const conversionRate = preferences.length === 0 
                ? 0 
                : ((contactRequests.length / preferences.length) * 100);

              const retentionRate = (() => {
                const activeUsers = new Set<string>();
                preferences.forEach(p => {
                  if (p.userId) activeUsers.add(p.userId);
                });
                properties.forEach(p => {
                  if (p.sellerId) activeUsers.add(p.sellerId);
                });
                return users.length === 0 ? 0 : ((activeUsers.size / users.length) * 100);
              })();

              const propertyTypeAnalysis = (() => {
                const types = ["apartment", "villa", "land", "building", "duplex"];
                const labels: Record<string, string> = {
                  apartment: "شقق",
                  villa: "فلل",
                  land: "أراضي",
                  building: "عمارات",
                  duplex: "دوبلكس",
                };
                return types.map(type => {
                  const typeProperties = properties.filter(p => p.propertyType === type);
                  const prices = typeProperties.map(p => p.price || 0).filter(p => p > 0);
                  const avgPrice = prices.length > 0 
                    ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
                    : 0;
                  return {
                    type,
                    label: labels[type] || type,
                    count: typeProperties.length,
                    avgPrice,
                    trend: 0, // يمكن حسابه لاحقاً من بيانات تاريخية
                  };
                }).filter(item => item.count > 0);
              })();

              const timeOnMarket = (() => {
                const now = Date.now();
                const periods = {
                  "0-7 أيام": 0,
                  "8-14 يوم": 0,
                  "15-30 يوم": 0,
                  "31-60 يوم": 0,
                  "+60 يوم": 0,
                };
                let totalDays = 0;
                let count = 0;

                properties.forEach(prop => {
                  if (prop.createdAt) {
                    const days = Math.floor((now - new Date(prop.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    totalDays += days;
                    count++;
                    if (days <= 7) periods["0-7 أيام"]++;
                    else if (days <= 14) periods["8-14 يوم"]++;
                    else if (days <= 30) periods["15-30 يوم"]++;
                    else if (days <= 60) periods["31-60 يوم"]++;
                    else periods["+60 يوم"]++;
                  }
                });

                const avgDays = count > 0 ? Math.round(totalDays / count) : 0;
                const total = Object.values(periods).reduce((sum, v) => sum + v, 0);

                return {
                  avgDays,
                  periods: Object.entries(periods).map(([period, count]) => ({
                    period,
                    count,
                    percentage: total > 0 ? (count / total) * 100 : 0,
                  })),
                };
              })();

              const conversionFunnel = (() => {
                // نبدأ من تسجيل الرغبات (بيانات فعلية) بدلاً من الزوار المقدرة
                const stages = [
                  { stage: "تسجيل الرغبات", count: preferences.length, color: "bg-violet-500" },
                  { stage: "مطابقات ناجحة", count: matches.length, color: "bg-amber-500" },
                  { stage: "طلبات تواصل", count: contactRequests.length, color: "bg-orange-500" },
                  { stage: "صفقات مكتملة", count: contactRequests.filter(cr => cr.status === "completed").length, color: "bg-green-500" },
                ];
                // حساب النسب بناءً على المرحلة الأولى (تسجيل الرغبات)
                const baseCount = preferences.length;
                return stages.map((stage, index) => ({
                  ...stage,
                  percentage: baseCount > 0 ? (stage.count / baseCount) * 100 : 0,
                }));
              })();

              return (
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
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
                        <p className="text-sm text-white/80">إجمالي قيمة العقارات (ريال)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <Percent className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
                        <p className="text-sm text-white/80">معدل التحويل (طلبات تواصل / رغبات)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/20">
                          <UserPlus className="h-6 w-6" />
                        </div>
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
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold">{retentionRate.toFixed(1)}%</p>
                        <p className="text-sm text-white/80">معدل النشاط (مستخدمين نشطين)</p>
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
                        {propertyTypeAnalysis.map((item) => (
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
                            <div className="w-24 text-xs text-muted-foreground">{item.avgPrice > 0 ? formatCurrency(item.avgPrice) : "-"}</div>
                            <div className="w-16 text-xs text-muted-foreground text-center">-</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Popular Property Types (استبدال الكلمات المفتاحية ببيانات فعلية) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        أنواع العقارات المطلوبة
                      </CardTitle>
                      <CardDescription>توزيع الرغبات حسب نوع العقار</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {demandByType && demandByType.length > 0 ? (
                          demandByType
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 5)
                            .map((item, index) => {
                              const maxCount = Math.max(...demandByType.map(d => d.count));
                              return (
                                <div 
                                  key={item.propertyType} 
                                  className="flex items-center gap-4 p-3 rounded-lg border bg-background transition-all hover:shadow-sm"
                                >
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{propertyTypeLabels[item.propertyType] || item.propertyType}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="h-full bg-primary/60 rounded-full"
                                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground w-16">{item.count.toLocaleString('ar-SA')} رغبة</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            لا توجد بيانات
                          </div>
                        )}
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
                      {conversionFunnel.map((item, index, arr) => {
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
                        <p className="text-4xl font-bold text-primary">{timeOnMarket.avgDays}</p>
                        <p className="text-sm text-muted-foreground">يوم (المتوسط العام)</p>
                      </div>
                      <div className="space-y-3">
                        {timeOnMarket.periods.map((item) => {
                          const colorMap: Record<string, string> = {
                            "0-7 أيام": "bg-green-500",
                            "8-14 يوم": "bg-lime-500",
                            "15-30 يوم": "bg-amber-500",
                            "31-60 يوم": "bg-orange-500",
                            "+60 يوم": "bg-red-500",
                          };
                          return (
                            <div key={item.period} className="flex items-center gap-3">
                              <div className="w-20 text-sm">{item.period}</div>
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full ${colorMap[item.period] || "bg-gray-500"} rounded-full transition-all duration-500`}
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <div className="w-8 text-sm text-muted-foreground text-left">{item.count}</div>
                              <div className="w-12 text-xs text-muted-foreground text-left">{item.percentage.toFixed(0)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Match Quality Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        توزيع جودة المطابقات
                      </CardTitle>
                      <CardDescription>توزيع المطابقات حسب نقاط المطابقة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const scoreRanges = [
                            { range: "80-100", label: "ممتاز", color: "bg-green-500", min: 80, max: 105 },
                            { range: "60-79", label: "جيد جداً", color: "bg-lime-500", min: 60, max: 79 },
                            { range: "40-59", label: "جيد", color: "bg-amber-500", min: 40, max: 59 },
                            { range: "20-39", label: "متوسط", color: "bg-orange-500", min: 20, max: 39 },
                            { range: "0-19", label: "ضعيف", color: "bg-red-500", min: 0, max: 19 },
                          ];
                          const distribution = scoreRanges.map(range => ({
                            ...range,
                            count: matches.filter(m => m.matchScore >= range.min && m.matchScore <= range.max).length,
                          }));
                          const maxCount = Math.max(...distribution.map(d => d.count), 1);
                          return distribution.map((item) => (
                            <div key={item.range} className="flex items-center gap-3">
                              <div className="w-24 text-sm">{item.label}</div>
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                              </div>
                              <div className="w-8 text-sm text-muted-foreground text-left">{item.count}</div>
                              <div className="w-12 text-xs text-muted-foreground text-left">
                                {matches.length > 0 ? ((item.count / matches.length) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 7. Additional Metrics - 3 Cards with Real Data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Handshake className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{matches.length}</p>
                        <p className="text-sm text-blue-600/80 dark:text-blue-400/80">إجمالي المطابقات</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">{matches.filter(m => m.matchScore >= 70).length}</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">مطابقات عالية الجودة (≥70)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{matches.filter(m => m.isSaved).length}</p>
                        <p className="text-sm text-purple-600/80 dark:text-purple-400/80">مطابقات محفوظة</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Analytics - Supply & Demand */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                      مؤشر العرض والطلب (Supply & Demand Index)
                    </CardTitle>
                    <CardDescription>نسبة العرض للطلب حسب المدينة - يحدد نوع السوق</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supplyDemandData && supplyDemandData.length > 0 ? (
                      <div className="space-y-4">
                        {supplyDemandData.map((item) => {
                          const marketTypeLabels = {
                            buyer: { label: "سوق المشتري", color: "bg-green-500", badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                            balanced: { label: "سوق متوازن", color: "bg-blue-500", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                            seller: { label: "سوق البائع", color: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
                          };
                          const typeInfo = marketTypeLabels[item.marketType];
                          return (
                            <div key={item.city} className="p-4 rounded-lg border bg-background">
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold">{item.city}</div>
                                <Badge className={typeInfo.badge}>{typeInfo.label}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">العرض</div>
                                  <div className="text-lg font-bold">{item.supply}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">الطلب</div>
                                  <div className="text-lg font-bold">{item.demand}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">النسبة</div>
                                  <div className="text-lg font-bold">{item.ratio.toFixed(2)}</div>
                                </div>
                              </div>
                              <div className="bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${typeInfo.color} rounded-full transition-all`}
                                  style={{ width: `${Math.min(item.ratio * 50, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Analytics - Price per Square Meter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      متوسط سعر المتر المربع
                    </CardTitle>
                    <CardDescription>حسب المدينة والمنطقة ونوع العقار</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pricePerSqmData && pricePerSqmData.length > 0 ? (
                      <div className="space-y-3">
                        {pricePerSqmData.slice(0, 10).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                            <div className="flex-1">
                              <div className="font-medium">{item.city}</div>
                              {item.district && <div className="text-sm text-muted-foreground">{item.district}</div>}
                              {item.propertyType && <div className="text-xs text-muted-foreground">{propertyTypeLabels[item.propertyType] || item.propertyType}</div>}
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-lg">{formatCurrency(item.pricePerSqm)}/م²</div>
                              <div className="text-xs text-muted-foreground">{item.count} عقار</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Analytics - District Popularity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      مؤشر شعبية المناطق
                    </CardTitle>
                    <CardDescription>المناطق الأكثر طلباً حسب مؤشر الشعبية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {districtPopularityData && districtPopularityData.length > 0 ? (
                      <div className="space-y-3">
                        {districtPopularityData.slice(0, 10).map((item, index) => {
                          const maxScore = districtPopularityData[0]?.popularityScore || 1;
                          return (
                            <div key={`${item.city}-${item.district}`} className="p-3 rounded-lg border bg-background">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{item.district}</div>
                                    <div className="text-xs text-muted-foreground">{item.city}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">{item.popularityScore}</div>
                                  <div className="text-xs text-muted-foreground">نقطة</div>
                                </div>
                              </div>
                              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                                <span>طلب: {item.demandCount}</span>
                                <span>مطابقات: {item.matchCount}</span>
                                <span>تواصل: {item.contactCount}</span>
                              </div>
                              <div className="bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${(item.popularityScore / maxScore) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Analytics - Market Quality Index */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        مؤشر جودة السوق
                      </CardTitle>
                      <CardDescription>تصنيف السوق حسب الجودة والأداء</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {marketQualityData && marketQualityData.length > 0 ? (
                        <div className="space-y-3">
                          {marketQualityData.map((item) => {
                            const qualityColors = {
                              excellent: "bg-green-500",
                              good: "bg-blue-500",
                              average: "bg-amber-500",
                              poor: "bg-red-500",
                            };
                            const qualityLabels = {
                              excellent: "ممتاز",
                              good: "جيد",
                              average: "متوسط",
                              poor: "ضعيف",
                            };
                            return (
                              <div key={item.city} className="p-4 rounded-lg border bg-background">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="font-semibold">{item.city}</div>
                                  <Badge className={qualityColors[item.qualityLevel] + " text-white"}>{qualityLabels[item.qualityLevel]}</Badge>
                                </div>
                                <div className="mb-3">
                                  <div className="text-3xl font-bold mb-1">{item.qualityScore.toFixed(1)}</div>
                                  <div className="text-xs text-muted-foreground">من 100 نقطة</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <div className="text-muted-foreground">مطابقة</div>
                                    <div className="font-medium">{item.avgMatchScore}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">تحويل</div>
                                    <div className="font-medium">{item.conversionRate.toFixed(1)}%</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">تفاعل</div>
                                    <div className="font-medium">{item.engagementRate.toFixed(1)}%</div>
                                  </div>
                                </div>
                                <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full ${qualityColors[item.qualityLevel]} rounded-full transition-all`}
                                    style={{ width: `${item.qualityScore}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Market Analytics - Price Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        اتجاهات الأسعار
                      </CardTitle>
                      <CardDescription>التغير الشهري في متوسط الأسعار</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {priceTrendsData && priceTrendsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={priceTrendsData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="period" />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`} />
                            <RechartsTooltip 
                              formatter={(value: number, name: string, props: any) => [
                                `${formatCurrency(value)} ريال${props.payload.changePercent ? ` (${props.payload.changePercent > 0 ? '+' : ''}${props.payload.changePercent}%)` : ''}`,
                                "متوسط السعر"
                              ]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            />
                            <Line type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          لا توجد بيانات
                        </div>
                      )}
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
                            <RechartsTooltip 
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
              );
            })()}

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
            </div>
          </main>
        </div>
      </div>
      {/* Buyer Matches Dialog */}
      <Dialog open={showMatchDetailsDialog} onOpenChange={(open) => {
        setShowMatchDetailsDialog(open);
        if (!open) {
          setSelectedBuyerPreferenceId(null);
          setSelectedMatchId(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          {(() => {
            // محاولة استخدام selectedBuyerPreferenceId أولاً
            let buyerData = selectedBuyerPreferenceId ? getSelectedBuyerMatches() : null;
            if (!buyerData && selectedMatchId) {
              // إذا لم يكن هناك selectedBuyerPreferenceId، نستخدم selectedMatchId
              const matchData = getSelectedMatchData();
              if (matchData && matchData.pref) {
                const tempPreferenceId = matchData.pref.id;
                const tempData = filteredMatches.filter(m => m.buyerPreferenceId === tempPreferenceId);
                const tempBuyer = users.find(u => u.id === matchData.pref!.userId);
                buyerData = { pref: matchData.pref, buyer: tempBuyer, matches: tempData };
              }
            }
            
            if (!buyerData) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            const { pref, buyer, matches: buyerMatches } = buyerData;
            
            // حساب التأكيدات المجمعة
            const aggregatedVerifications = {
              property: buyerMatches.some(m => (m as any).propertyVerified),
              buyer: buyerMatches.some(m => (m as any).buyerVerified),
              specs: buyerMatches.some(m => (m as any).specsVerified),
              financial: buyerMatches.some(m => (m as any).financialVerified),
            };

            // ترتيب المطابقات حسب matchScore (الأفضل أولاً)
            const sortedMatches = [...buyerMatches].sort((a, b) => b.matchScore - a.matchScore);

            const getScoreColor = (score: number) => {
              // تدرج الألوان: أحمر → برتقالي → أخضر
              const percentage = Math.round((score / 105) * 100);
              if (percentage >= 70) return "#10b981"; // أخضر
              if (percentage >= 40) return "#f59e0b"; // برتقالي
              return "#ef4444"; // أحمر
            };

            // أفضل مطابقة للتفاصيل
            const bestMatch = sortedMatches[0];
            const bestProp = bestMatch ? properties.find(p => p.id === bestMatch.propertyId) : null;
            const bestSeller = bestProp ? users.find(u => u.id === bestProp.sellerId) : null;
            const bestBreakdown = bestMatch && bestProp ? calculateMatchBreakdown(bestProp, pref) : null;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div>مطابقات المشتري</div>
                      <DialogDescription className="mt-1">
                        {buyer?.name || "مشتري"} - {buyerMatches.length} مطابقة
                      </DialogDescription>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="matches" className="mt-4 flex flex-col flex-1 min-h-0" dir="rtl">
                  <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                    <TabsTrigger value="matches" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      المطابقات
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      التفاصيل
                    </TabsTrigger>
                    <TabsTrigger value="verifications" className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      التأكيدات
                    </TabsTrigger>
                  </TabsList>

                  {/* تبويب المطابقات */}
                  <TabsContent value="matches" className="mt-4 overflow-y-auto flex-1">
                    <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2 flex-shrink-0">
                      <CardTitle className="text-base">جميع المطابقات</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-gray-100">
                              <TableHead className="min-w-[220px] text-center font-semibold">البائع</TableHead>
                              <TableHead className="w-[140px] text-center font-semibold">وسائل التواصل</TableHead>
                              <TableHead className="w-[130px] text-center font-semibold">نسبة التطابق</TableHead>
                              <TableHead className="w-[140px] text-center font-semibold">التأكيدات</TableHead>
                              <TableHead className="w-[200px] text-center font-semibold">الحالة</TableHead>
                              <TableHead className="w-[200px] text-center font-semibold">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedMatches.map((match) => {
                              const prop = properties.find(p => p.id === match.propertyId);
                              const seller = prop ? users.find(u => u.id === prop.sellerId) : null;
                              if (!prop || !seller) return null;

                              const matchStatus = (match as any).status || "new";
                              const percentage = Math.round((match.matchScore / 105) * 100);

                              return (
                                <TableRow 
                                  key={match.id} 
                                  className="hover:bg-slate-50/50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedMatchForComparison(match.id);
                                    setShowMatchComparisonDialog(true);
                                  }}
                                >
                                  {/* البائع */}
                                  <TableCell className="min-w-[220px] py-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                      <Store className="w-4 h-4 text-green-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{seller.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{seller.phone || "-"}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  {/* وسائل التواصل */}
                                  <TableCell className="w-[140px] py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-2">
                                      {seller.email && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:${seller.email}`;
                                          }}
                                          title="بريد إلكتروني"
                                        >
                                          <Mail className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                      {seller.phone && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const cleanedPhone = seller.phone!.replace(/\D/g, '');
                                            window.location.href = `tel:${cleanedPhone}`;
                                            logCallMutation.mutate(match.id);
                                          }}
                                          title="اتصال"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                      {seller.phone && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const whatsappLink = getWhatsAppLink(seller.phone!);
                                            window.open(whatsappLink, '_blank');
                                          }}
                                          title="واتساب"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  {/* نسبة التطابق */}
                                  <TableCell className="w-[130px] py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col items-center">
                                      <div className="relative w-10 h-10">
                                        <svg className="w-10 h-10 transform -rotate-90">
                                          <circle stroke="#e2e8f0" strokeWidth="2.5" fill="white" r="13" cx="20" cy="20" />
                                          <circle 
                                            stroke={getScoreColor(match.matchScore)}
                                            strokeWidth="2.5"
                                            strokeDasharray={2 * Math.PI * 13}
                                            strokeDashoffset={2 * Math.PI * 13 * (1 - match.matchScore / 105)}
                                            strokeLinecap="round"
                                            fill="transparent"
                                            r="13"
                                            cx="20"
                                            cy="20"
                                          />
                                        </svg>
                                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                                          percentage >= 70 ? "text-emerald-600" : percentage >= 40 ? "text-amber-600" : "text-red-600"
                                        }`}>
                                          {percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  {/* التأكيدات */}
                                  <TableCell className="w-[140px] py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1.5">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                              (match as any).propertyVerified 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-slate-200 text-slate-400"
                                            }`}>
                                              <Building2 className="w-3.5 h-3.5" />
                                              {(match as any).propertyVerified && (
                                                <CheckCircle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-primary bg-white rounded-full" />
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد حالة العقار</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                              (match as any).buyerVerified 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-slate-200 text-slate-400"
                                            }`}>
                                              <UserIcon className="w-3.5 h-3.5" />
                                              {(match as any).buyerVerified && (
                                                <CheckCircle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-primary bg-white rounded-full" />
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد رغبة المشتري</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                              (match as any).specsVerified 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-slate-200 text-slate-400"
                                            }`}>
                                              <ClipboardList className="w-3.5 h-3.5" />
                                              {(match as any).specsVerified && (
                                                <CheckCircle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-primary bg-white rounded-full" />
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد المواصفات</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                              (match as any).financialVerified 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-slate-200 text-slate-400"
                                            }`}>
                                              <Wallet className="w-3.5 h-3.5" />
                                              {(match as any).financialVerified && (
                                                <CheckCircle className="absolute -top-0.5 -right-0.5 w-3 h-3 text-primary bg-white rounded-full" />
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">تأكيد الملاءة المالية</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                  {/* الحالة */}
                                  <TableCell className="w-[200px] py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-center items-center">
                                      {(() => {
                                        const statusConfig = getStatusBadgeConfig(matchStatus);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <button
                                                type="button"
                                                className={`${statusConfig.className} border cursor-pointer px-2.5 py-1 flex items-center gap-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:opacity-80`}
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                              </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                                              <DropdownMenuLabel>تغيير حالة المهمة</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              {["new", "contacted", "confirmed", "viewing", "agreed", "vacated"].map((status) => {
                                                const config = getStatusBadgeConfig(status);
                                                const Icon = config.icon;
                                                return (
                                                  <DropdownMenuItem
                                                    key={status}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      updateMatchStatusMutation.mutate({ matchId: match.id, status });
                                                    }}
                                                    className={matchStatus === status ? "bg-slate-100" : ""}
                                                  >
                                                    <Icon className="w-4 h-4 ml-2" />
                                                    {config.label}
                                                    {matchStatus === status && <CheckCircle className="w-4 h-4 mr-auto" />}
                                                  </DropdownMenuItem>
                                                );
                                              })}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        );
                                      })()}
                                    </div>
                                  </TableCell>
                                  {/* إجراءات */}
                                  <TableCell className="w-[200px] py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSellerMatchId(match.id);
                                          setShowSellerEditDialog(true);
                                        }}
                                        className="gap-1"
                                        title="تعديل بيانات البائع"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  </TabsContent>

                  {/* تبويب التفاصيل */}
                  <TabsContent value="details" className="mt-4 overflow-y-auto flex-1">
                    {pref && buyer ? (
                      <div className="space-y-4 pb-4">
                        {/* معلومات المشتري */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-blue-100">
                                <UserIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              معلومات المشتري
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">الاسم</Label>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm font-medium">{buyer.name}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">الجوال</Label>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm font-medium">{toArabicPhone(buyer.phone || '')}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm font-medium">{buyer.email}</p>
                                </div>
                              </div>
                              {buyer.whatsappNumber && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-muted-foreground">واتساب</Label>
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">{toArabicPhone(buyer.whatsappNumber)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* تفاصيل الرغبة */}
                        <div className="space-y-4">
                          {/* الموقع والمنطقة */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-100">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                </div>
                                الموقع والمنطقة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* المدينة */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-muted-foreground">المدينة المفضلة</Label>
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                    {saudiCities.map((city) => (
                                      <div
                                        key={city.name}
                                        className={`
                                          flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap cursor-default transition-colors
                                          ${pref.city === city.name 
                                            ? "bg-primary text-white border-primary shadow-sm" 
                                            : "bg-slate-50 border-gray-200 text-gray-500"}
                                        `}
                                      >
                                        {pref.city === city.name && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                        {city.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* الأحياء */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-muted-foreground">
                                    الأحياء المفضلة ({pref.districts?.length || 0})
                                  </Label>
                                  <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[200px] pb-2 scrollbar-hide -mx-1 px-1">
                                    {(() => {
                                      const selectedCity = saudiCities.find(c => c.name === pref.city);
                                      const districts = selectedCity?.neighborhoods || [];
                                      const selectedDistricts = pref.districts || [];
                                      
                                      if (districts.length === 0) {
                                        return <p className="w-full text-center text-muted-foreground py-8 text-sm">لا توجد أحياء متاحة</p>;
                                      }
                                      
                                      if (selectedDistricts.length === 0) {
                                        return <p className="w-full text-center text-muted-foreground py-8 text-sm">لم يتم اختيار أي أحياء</p>;
                                      }
                                      
                                      return districts.filter(d => selectedDistricts.includes(d.name)).map((district) => (
                                        <div
                                          key={district.name}
                                          className="flex-shrink-0 px-4 py-2.5 rounded-lg border bg-primary text-white border-primary shadow-sm cursor-default text-sm font-bold whitespace-nowrap"
                                        >
                                          <Check className="inline-block w-3.5 h-3.5 ml-1.5" />
                                          {district.name}
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* نوع العقار والمواصفات */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-green-100">
                                  <Building2 className="h-4 w-4 text-green-600" />
                                </div>
                                نوع العقار والمواصفات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* نوع العقار */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-muted-foreground">نوع العقار المطلوب</Label>
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                    {Object.entries(propertyTypeLabels).map(([key, label]) => (
                                      <div
                                        key={key}
                                        className={`
                                          flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap cursor-default transition-colors
                                          ${pref.propertyType === key 
                                            ? "bg-primary text-white border-primary shadow-sm" 
                                            : "bg-slate-50 border-gray-200 text-gray-500"}
                                        `}
                                      >
                                        {pref.propertyType === key && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                        {label}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* المواصفات التفصيلية */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                  {/* الغرف */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Bed className="h-4 w-4" />
                                      عدد الغرف
                                    </Label>
                                    {pref.rooms ? (
                                      <div className="p-3 rounded-lg bg-slate-50 border">
                                        <p className="text-base font-bold text-primary">{pref.rooms} غرفة</p>
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                        <p className="text-sm text-muted-foreground">غير محدد</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* المساحة */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Ruler className="h-4 w-4" />
                                      المساحة
                                    </Label>
                                    {pref.area ? (
                                      <div className="p-3 rounded-lg bg-slate-50 border">
                                        <p className="text-base font-bold text-primary">{pref.area} م²</p>
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                        <p className="text-sm text-muted-foreground">غير محدد</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* نوع المعاملة */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Handshake className="h-4 w-4" />
                                      نوع المعاملة
                                    </Label>
                                    <div className="p-3 rounded-lg bg-slate-50 border">
                                      <Badge variant="outline" className="text-sm">
                                        {pref.transactionType === "buy" ? "شراء" : pref.transactionType === "rent" ? "إيجار" : "غير محدد"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* الميزانية والدفع */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-orange-100">
                                  <Wallet className="h-4 w-4 text-orange-600" />
                                </div>
                                الميزانية وطريقة الدفع
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* الميزانية */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-muted-foreground">الميزانية المتاحة</Label>
                                  {(pref.budgetMin || pref.budgetMax) ? (
                                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                                      <p className="text-xl font-bold text-primary">{maskBudget(pref.budgetMin, pref.budgetMax)}</p>
                                      {(pref.budgetMin || pref.budgetMax) && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {pref.budgetMin ? `من ${formatCurrency(pref.budgetMin)}` : ''} 
                                          {pref.budgetMin && pref.budgetMax ? ' إلى ' : ''}
                                          {pref.budgetMax ? `${formatCurrency(pref.budgetMax)}` : ''}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-4 rounded-lg bg-slate-50 border border-dashed">
                                      <p className="text-sm text-muted-foreground">غير محدد</p>
                                    </div>
                                  )}
                                </div>

                                {/* طريقة الدفع والغرض */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground">طريقة الدفع</Label>
                                    {pref.paymentMethod ? (
                                      <div className="p-3 rounded-lg bg-slate-50 border">
                                        <Badge variant="outline" className="text-sm">
                                          {paymentMethodLabels[pref.paymentMethod] || pref.paymentMethod}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                        <p className="text-sm text-muted-foreground">غير محدد</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* الغرض */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground">الغرض من الشراء</Label>
                                    {pref.purpose ? (
                                      <div className="p-3 rounded-lg bg-slate-50 border">
                                        <Badge variant="outline" className="text-sm">
                                          {pref.purpose === "residence" ? "سكن" : pref.purpose === "investment" ? "استثمار" : pref.purpose}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                        <p className="text-sm text-muted-foreground">غير محدد</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* التأكد من صحة الرغبة */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-green-100">
                                <ClipboardCheck className="h-4 w-4 text-green-600" />
                              </div>
                              التأكد من صحة الرغبة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-city"
                                  checked={buyerVerificationChecks.city}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, city: checked === true });
                                  }}
                                />
                                <label htmlFor="check-city" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  المدينة صحيحة
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-districts"
                                  checked={buyerVerificationChecks.districts}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, districts: checked === true });
                                  }}
                                />
                                <label htmlFor="check-districts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  الأحياء صحيحة
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-propertyType"
                                  checked={buyerVerificationChecks.propertyType}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, propertyType: checked === true });
                                  }}
                                />
                                <label htmlFor="check-propertyType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  نوع العقار صحيح
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-budget"
                                  checked={buyerVerificationChecks.budget}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, budget: checked === true });
                                  }}
                                />
                                <label htmlFor="check-budget" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  الميزانية صحيحة
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-rooms"
                                  checked={buyerVerificationChecks.rooms}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, rooms: checked === true });
                                  }}
                                />
                                <label htmlFor="check-rooms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  الغرف صحيحة
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-area"
                                  checked={buyerVerificationChecks.area}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, area: checked === true });
                                  }}
                                />
                                <label htmlFor="check-area" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  المساحة صحيحة
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-transactionType"
                                  checked={buyerVerificationChecks.transactionType}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, transactionType: checked === true });
                                  }}
                                />
                                <label htmlFor="check-transactionType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  نوع المعاملة صحيح
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id="check-purpose"
                                  checked={buyerVerificationChecks.purpose}
                                  onCheckedChange={(checked) => {
                                    setBuyerVerificationChecks({ ...buyerVerificationChecks, purpose: checked === true });
                                  }}
                                />
                                <label htmlFor="check-purpose" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                  الغرض صحيح
                                </label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* تفصيل النتيجة */}
                        {bestMatch && bestBreakdown && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                تفصيل النتيجة (100 نقطة)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" /> الموقع
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(bestBreakdown.location / 35) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold w-16 text-left font-mono">{bestBreakdown.location}/35</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm font-medium flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-green-500" /> السعر
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(bestBreakdown.price / 30) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold w-16 text-left font-mono">{bestBreakdown.price}/30</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <span className="text-sm font-medium flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-purple-500" /> المواصفات
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(bestBreakdown.specifications / 25) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold w-16 text-left font-mono">{bestBreakdown.specifications}/25</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">لا توجد تفاصيل متاحة</div>
                    )}
                  </TabsContent>

                  {/* تبويب التأكيدات */}
                  <TabsContent value="verifications" className="mt-4 overflow-y-auto flex-1">
                    {bestMatch && bestProp && bestBreakdown ? (
                      <div className="space-y-4 pb-4">
                        {/* صف الموقع */}
                        <div 
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedSellerMatchId(bestMatch.id);
                            setShowSellerEditDialog(true);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-sm">الموقع</span>
                              </div>
                              <span className="text-sm font-bold text-blue-600">
                                {bestBreakdown.location}/35
                              </span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${(bestBreakdown.location / 35) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* صف السعر */}
                        <div 
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedSellerMatchId(bestMatch.id);
                            setShowSellerEditDialog(true);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-sm">السعر</span>
                              </div>
                              <span className="text-sm font-bold text-green-600">
                                {bestBreakdown.price}/30
                              </span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(bestBreakdown.price / 30) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* صف المواصفات */}
                        <div 
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedSellerMatchId(bestMatch.id);
                            setShowSellerEditDialog(true);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                <span className="font-medium text-sm">المواصفات</span>
                              </div>
                              <span className="text-sm font-bold text-purple-600">
                                {bestBreakdown.specifications}/25
                              </span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${(bestBreakdown.specifications / 25) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* مقارنة تفصيلية */}
                        <Card className="mt-6">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" />
                              مقارنة تفصيلية
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                              عرض تفصيلي لبيانات المشتري والبائعين. للتعديل، استخدم زر "تعديل" في جدول المطابقات.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {(() => {
                              // ترتيب المطابقات حسب matchScore (الأفضل أولاً)
                              const sortedMatches = [...buyerMatches].sort((a, b) => b.matchScore - a.matchScore);

                              return (
                                <div className="w-full" dir="rtl">
                                  {/* بيانات المشتري فقط */}
                                  <div className="space-y-4">
                                    <Accordion type="single" collapsible defaultValue="buyer-data" className="w-full">
                                      <AccordionItem value="buyer-data">
                                        <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                                          <UserIcon className="w-5 h-5 text-primary" />
                                          <span className="font-bold text-lg">بيانات المشتري: {buyer?.name || "مشتري"}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-6 pt-4">
                                          {/* الموقع */}
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <MapPin className="w-4 h-4 text-primary" />
                                              <h4 className="font-bold text-sm">الموقع</h4>
                                            </div>
                                            
                                            {/* المدينة */}
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">المدينة</label>
                                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                                {saudiCities.map((city) => (
                                                  <div
                                                    key={city.name}
                                                    className={`
                                                      flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold whitespace-nowrap cursor-default
                                                      ${pref?.city === city.name 
                                                        ? "bg-primary text-white border-primary" 
                                                        : "bg-slate-50 border-gray-200 text-gray-500"}
                                                    `}
                                                  >
                                                    {city.name}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {/* الأحياء */}
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">الأحياء</label>
                                              <div className="h-[200px] overflow-y-auto grid grid-cols-3 gap-2 pr-2">
                                                {(() => {
                                                  const selectedCity = saudiCities.find(c => c.name === pref?.city);
                                                  const districts = selectedCity?.neighborhoods || [];
                                                  return districts.length > 0 ? districts.map((district) => (
                                                    <div
                                                      key={district.name}
                                                      className={`
                                                        py-3 px-2 rounded-lg border text-sm font-bold cursor-default
                                                        ${pref?.districts?.includes(district.name)
                                                          ? "bg-primary text-white border-primary" 
                                                          : "bg-slate-50 border-gray-200 text-gray-500"}
                                                      `}
                                                    >
                                                      {pref?.districts?.includes(district.name) && <Check className="inline-block w-3 h-3 ml-1" />}
                                                      {district.name}
                                                    </div>
                                                  )) : <p className="col-span-3 text-center text-muted-foreground py-10">لا توجد أحياء</p>;
                                                })()}
                                              </div>
                                            </div>
                                          </div>

                                          {/* المواصفات */}
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <Building2 className="w-4 h-4 text-primary" />
                                              <h4 className="font-bold text-sm">المواصفات</h4>
                                            </div>
                                            
                                            {/* النوع */}
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">نوع العقار</label>
                                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                                {Object.entries(propertyTypeLabels).map(([key, label]) => (
                                                  <div
                                                    key={key}
                                                    className={`
                                                      flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold whitespace-nowrap cursor-default
                                                      ${pref?.propertyType === key 
                                                        ? "bg-primary text-white border-primary" 
                                                        : "bg-slate-50 border-gray-200 text-gray-500"}
                                                    `}
                                                  >
                                                    {label}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {/* الغرف */}
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">عدد الغرف</label>
                                              <div className="text-sm text-muted-foreground">
                                                {pref?.rooms || "غير محدد"}
                                              </div>
                                            </div>

                                            {/* المساحة */}
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">المساحة (م²)</label>
                                              <div className="text-sm text-muted-foreground">
                                                {pref?.area || "غير محدد"} م²
                                              </div>
                                            </div>
                                          </div>

                                          {/* المالية */}
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <Wallet className="w-4 h-4 text-primary" />
                                              <h4 className="font-bold text-sm">المالية</h4>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <label className="block text-xs font-bold text-gray-700">الميزانية</label>
                                              <div className="text-sm text-muted-foreground">
                                                {pref?.budgetMin && pref?.budgetMax 
                                                  ? `${(pref.budgetMin / 1000000).toFixed(1)} - ${(pref.budgetMax / 1000000).toFixed(1)} مليون`
                                                  : "غير محدد"}
                                              </div>
                                            </div>
                                          </div>

                                          {/* إضافية */}
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <Settings2 className="w-4 h-4 text-primary" />
                                              <h4 className="font-bold text-sm">إضافية</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label className="text-sm font-medium">نوع المعاملة</Label>
                                                <div className="text-sm text-muted-foreground">
                                                  {pref?.transactionType === "buy" ? "شراء" : pref?.transactionType === "rent" ? "تأجير" : "غير محدد"}
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                <Label className="text-sm font-medium">الغرض</Label>
                                                <div className="text-sm text-muted-foreground">
                                                  {pref?.purpose === "residence" ? "سكن" : pref?.purpose === "investment" ? "استثمار" : "غير محدد"}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  </div>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-8">
                          <div className="text-center text-muted-foreground">لا توجد بيانات متاحة</div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
                
                {/* Actions */}
                <div className="flex gap-3 justify-center pt-4 mt-4 border-t flex-shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMatchDetailsDialog(false)}
                    data-testid="button-close-match-details"
                  >
                    إغلاق
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog مقارنة طلب المشتري مع طلب البائع */}
      <Dialog open={showMatchComparisonDialog} onOpenChange={(open) => {
        setShowMatchComparisonDialog(open);
        if (!open) {
          setSelectedMatchForComparison(null);
        }
      }}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          {(() => {
            if (!selectedMatchForComparison) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            
            const match = filteredMatches.find(m => m.id === selectedMatchForComparison);
            if (!match) return <div className="text-center py-8 text-muted-foreground">المطابقة غير موجودة</div>;
            
            const prop = properties.find(p => p.id === match.propertyId);
            const seller = prop ? users.find(u => u.id === prop.sellerId) : null;
            const pref = preferences.find(p => p.id === match.buyerPreferenceId);
            const buyer = pref ? users.find(u => u.id === pref.userId) : null;
            
            if (!prop || !seller || !pref || !buyer) return <div className="text-center py-8 text-muted-foreground">البيانات غير مكتملة</div>;
            
            // استخراج metadata من description للعقار
            const extractMetadata = (description: string | null) => {
              if (!description) return null;
              try {
                const jsonMatch = description.match(/<metadata>(.*?)<\/metadata>/s);
                if (jsonMatch) {
                  return JSON.parse(jsonMatch[1]);
                }
              } catch (e) {
                console.warn("Error parsing metadata:", e);
              }
              return null;
            };
            
            const propMetadata = extractMetadata(prop.description);
            
            const breakdown = calculateMatchBreakdown(prop, pref);
            const percentage = Math.round((match.matchScore / 105) * 100);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div>مقارنة طلب المشتري مع طلب البائع</div>
                      <DialogDescription className="mt-1">
                        نسبة التطابق: {percentage}%
                      </DialogDescription>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4 overflow-y-auto flex-1 space-y-4 pb-4">
                  {/* النسب الموزونة */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        النسب الموزونة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" /> الموقع
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(breakdown.location / 35) * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-bold w-16 text-left font-mono">{breakdown.location}/35</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-500" /> السعر
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(breakdown.price / 30) * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-bold w-16 text-left font-mono">{breakdown.price}/30</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-500" /> المواصفات
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-40 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(breakdown.specifications / 25) * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-bold w-16 text-left font-mono">{breakdown.specifications}/25</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-primary">
                          <span className="text-base font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> النتيجة الإجمالية
                          </span>
                          <span className="text-2xl font-bold text-primary">{match.matchScore}/105</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* مقارنة تفصيلية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* بيانات المشتري */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          بيانات المشتري
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="w-full">
                          {/* معلومات المشتري */}
                          <AccordionItem value="buyer-info">
                            <AccordionTrigger className="text-sm font-semibold">معلومات المشتري</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الاسم</Label>
                                <p className="text-sm font-medium mt-1">{buyer.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الجوال</Label>
                                <p className="text-sm font-medium mt-1">{toArabicPhone(buyer.phone || '')}</p>
                              </div>
                              {buyer.email && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                                  <p className="text-sm font-medium mt-1">{buyer.email}</p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* الموقع */}
                          <AccordionItem value="buyer-location">
                            <AccordionTrigger className="text-sm font-semibold">الموقع</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">المدينة</Label>
                                <p className="text-sm font-medium mt-1">{pref.city}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الأحياء</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {pref.districts && pref.districts.length > 0 ? (
                                    pref.districts.map((district) => (
                                      <Badge key={district} variant="outline" className="text-xs">
                                        {district}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">غير محدد</span>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* نوع العقار والمواصفات */}
                          <AccordionItem value="buyer-specs">
                            <AccordionTrigger className="text-sm font-semibold">نوع العقار والمواصفات</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">نوع العقار</Label>
                                <p className="text-sm font-medium mt-1">{propertyTypeLabels[pref.propertyType] || pref.propertyType}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الغرف</Label>
                                <p className="text-sm font-medium mt-1">{pref.rooms || "غير محدد"}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">المساحة</Label>
                                <p className="text-sm font-medium mt-1">{pref.area ? `${pref.area} م²` : "غير محدد"}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* المالية */}
                          <AccordionItem value="buyer-financial">
                            <AccordionTrigger className="text-sm font-semibold">المالية</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الميزانية</Label>
                                <p className="text-sm font-medium mt-1">
                                  {pref.budgetMin && pref.budgetMax 
                                    ? `${(pref.budgetMin / 1000000).toFixed(1)} - ${(pref.budgetMax / 1000000).toFixed(1)} مليون`
                                    : "غير محدد"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">طريقة الدفع</Label>
                                <p className="text-sm font-medium mt-1">
                                  {pref.paymentMethod ? paymentMethodLabels[pref.paymentMethod] || pref.paymentMethod : "غير محدد"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">نوع المعاملة</Label>
                                <p className="text-sm font-medium mt-1">
                                  {pref.transactionType === "buy" ? "شراء" : pref.transactionType === "rent" ? "تأجير" : "غير محدد"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الغرض</Label>
                                <p className="text-sm font-medium mt-1">
                                  {pref.purpose === "residence" ? "سكن" : pref.purpose === "investment" ? "استثمار" : "غير محدد"}
                                </p>
                              </div>
                              {pref.purchaseTimeline && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الجدول الزمني</Label>
                                  <p className="text-sm font-medium mt-1">
                                    {pref.purchaseTimeline === "asap" ? "فوراً" :
                                     pref.purchaseTimeline === "within_month" ? "خلال شهر" :
                                     pref.purchaseTimeline === "within_3months" ? "خلال 3 أشهر" :
                                     pref.purchaseTimeline === "within_6months" ? "خلال 6 أشهر" :
                                     pref.purchaseTimeline === "within_year" ? "خلال سنة" :
                                     pref.purchaseTimeline === "flexible" ? "مرن" : pref.purchaseTimeline}
                                  </p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>

                    {/* بيانات البائع */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Store className="h-4 w-4 text-green-600" />
                          </div>
                          بيانات البائع والعقار
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="w-full">
                          {/* معلومات البائع */}
                          <AccordionItem value="seller-info">
                            <AccordionTrigger className="text-sm font-semibold">معلومات البائع</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الاسم</Label>
                                <p className="text-sm font-medium mt-1">{seller.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الجوال</Label>
                                <p className="text-sm font-medium mt-1">{toArabicPhone(seller.phone || '')}</p>
                              </div>
                              {seller.email && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                                  <p className="text-sm font-medium mt-1">{seller.email}</p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* الموقع */}
                          <AccordionItem value="seller-location">
                            <AccordionTrigger className="text-sm font-semibold">الموقع</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">المدينة</Label>
                                <p className="text-sm font-medium mt-1">{prop.city}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الحي</Label>
                                <p className="text-sm font-medium mt-1">{prop.district || "غير محدد"}</p>
                              </div>
                              {prop.latitude && prop.longitude && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الإحداثيات</Label>
                                  <p className="text-sm font-medium mt-1">{prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}</p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* نوع العقار والمواصفات */}
                          <AccordionItem value="seller-specs">
                            <AccordionTrigger className="text-sm font-semibold">نوع العقار والمواصفات</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">نوع العقار</Label>
                                <p className="text-sm font-medium mt-1">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</p>
                              </div>
                              {propMetadata?.propertyCategory && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">التصنيف</Label>
                                  <p className="text-sm font-medium mt-1">
                                    {propMetadata.propertyCategory === "residential" ? "سكني" : propMetadata.propertyCategory === "commercial" ? "تجاري" : propMetadata.propertyCategory}
                                  </p>
                                </div>
                              )}
                              {propMetadata?.propertyCondition && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">حالة العقار</Label>
                                  <p className="text-sm font-medium mt-1">
                                    {propMetadata.propertyCondition === "new" ? "جديد" :
                                     propMetadata.propertyCondition === "used" ? "مستخدم" :
                                     propMetadata.propertyCondition === "under_construction" ? "تحت الإنشاء" : propMetadata.propertyCondition}
                                  </p>
                                </div>
                              )}
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">الغرف</Label>
                                <p className="text-sm font-medium mt-1">{prop.rooms || "غير محدد"}</p>
                              </div>
                              {prop.bathrooms && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">دورات المياه</Label>
                                  <p className="text-sm font-medium mt-1">{prop.bathrooms}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">المساحة</Label>
                                <p className="text-sm font-medium mt-1">{prop.area ? `${prop.area} م²` : "غير محدد"}</p>
                              </div>
                              {propMetadata?.livingRooms && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الصالات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.livingRooms}</p>
                                </div>
                              )}
                              {propMetadata?.hasMaidRoom && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">غرفة خادمة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.hasMaidRoom ? "نعم" : "لا"}</p>
                                </div>
                              )}
                              {propMetadata?.facade && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الواجهة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.facade}</p>
                                </div>
                              )}
                              {propMetadata?.streetWidth && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عرض الشارع</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.streetWidth}</p>
                                </div>
                              )}
                              {propMetadata?.floorsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الأدوار</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.floorsCount}</p>
                                </div>
                              )}
                              {propMetadata?.elevatorsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد المصاعد</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.elevatorsCount}</p>
                                </div>
                              )}
                              {propMetadata?.facadeWidth && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عرض الواجهة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.facadeWidth}</p>
                                </div>
                              )}
                              {propMetadata?.ceilingHeight && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">ارتفاع السقف</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.ceilingHeight}</p>
                                </div>
                              )}
                              {propMetadata?.hasMezzanine !== undefined && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">ميزانين</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.hasMezzanine ? "نعم" : "لا"}</p>
                                </div>
                              )}
                              {propMetadata?.powerCapacity && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">القدرة الكهربائية</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.powerCapacity}</p>
                                </div>
                              )}
                              {propMetadata?.floorNumber && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">رقم الطابق</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.floorNumber}</p>
                                </div>
                              )}
                              {propMetadata?.finishingStatus && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">التشطيب</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.finishingStatus}</p>
                                </div>
                              )}
                              {propMetadata?.acType && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نوع التكييف</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.acType}</p>
                                </div>
                              )}
                              {propMetadata?.studentCapacity && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الطاقة الاستيعابية (طلاب)</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.studentCapacity}</p>
                                </div>
                              )}
                              {propMetadata?.classroomsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الفصول</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.classroomsCount}</p>
                                </div>
                              )}
                              {propMetadata?.pumpsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد المضخات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.pumpsCount}</p>
                                </div>
                              )}
                              {propMetadata?.tanksCapacity && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">سعة الخزانات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.tanksCapacity}</p>
                                </div>
                              )}
                              {propMetadata?.stationCategory && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">فئة المحطة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.stationCategory}</p>
                                </div>
                              )}
                              {propMetadata?.shopsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد المعارض</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.shopsCount}</p>
                                </div>
                              )}
                              {propMetadata?.apartmentsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الشقق/المكاتب</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.apartmentsCount}</p>
                                </div>
                              )}
                              {propMetadata?.annualIncome && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الدخل السنوي</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.annualIncome}</p>
                                </div>
                              )}
                              {propMetadata?.roi && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">العائد على الاستثمار</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.roi}</p>
                                </div>
                              )}
                              {propMetadata?.unitsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الوحدات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.unitsCount}</p>
                                </div>
                              )}
                              {propMetadata?.buildingClass && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">التصنيف (Class)</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.buildingClass}</p>
                                </div>
                              )}
                              {propMetadata?.parkingCapacity && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">سعة المواقف</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.parkingCapacity}</p>
                                </div>
                              )}
                              {propMetadata?.hasCivilDefense && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">الدفاع المدني</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.hasCivilDefense}</p>
                                </div>
                              )}
                              {propMetadata?.floorLoad && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">حمل الطابق</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.floorLoad}</p>
                                </div>
                              )}
                              {propMetadata?.nla && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">المساحة الصافية القابلة للتأجير (NLA)</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.nla}</p>
                                </div>
                              )}
                              {propMetadata?.bua && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">المساحة المبنية (BUA)</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.bua}</p>
                                </div>
                              )}
                              {propMetadata?.groundArea && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">المساحة الأرضية</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.groundArea}</p>
                                </div>
                              )}
                              {propMetadata?.mezzanineArea && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">مساحة الميزانين</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.mezzanineArea}</p>
                                </div>
                              )}
                              {propMetadata?.labsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد المختبرات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.labsCount}</p>
                                </div>
                              )}
                              {propMetadata?.municipalityClass && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">تصنيف البلدية</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.municipalityClass}</p>
                                </div>
                              )}
                              {propMetadata?.buildingsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد المباني</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.buildingsCount}</p>
                                </div>
                              )}
                              {propMetadata?.occupancyRate && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">معدل الإشغال</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.occupancyRate}</p>
                                </div>
                              )}
                              {propMetadata?.zoning && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">التقسيم</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.zoning}</p>
                                </div>
                              )}
                              {propMetadata?.activityType && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نوع النشاط</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.activityType}</p>
                                </div>
                              )}
                              {propMetadata?.buildingRatio && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نسبة البناء</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.buildingRatio}</p>
                                </div>
                              )}
                              {propMetadata?.wellsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الآبار</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.wellsCount}</p>
                                </div>
                              )}
                              {propMetadata?.waterType && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نوع المياه</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.waterType}</p>
                                </div>
                              )}
                              {propMetadata?.treesCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد الأشجار</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.treesCount}</p>
                                </div>
                              )}
                              {propMetadata?.farmFacade && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">واجهة المزرعة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.farmFacade}</p>
                                </div>
                              )}
                              {propMetadata?.productionArea && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">مساحة الإنتاج</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.productionArea}</p>
                                </div>
                              )}
                              {propMetadata?.licenseType && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نوع الرخصة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.licenseType}</p>
                                </div>
                              )}
                              {propMetadata?.craneLoad && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">حمل الرافعة</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.craneLoad}</p>
                                </div>
                              )}
                              {propMetadata?.clinicsCount && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">عدد العيادات</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.clinicsCount}</p>
                                </div>
                              )}
                              {propMetadata?.waitingArea && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">منطقة الانتظار</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.waitingArea}</p>
                                </div>
                              )}
                              {propMetadata?.healthLicense && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">رخصة صحية</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.healthLicense}</p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* المالية */}
                          <AccordionItem value="seller-financial">
                            <AccordionTrigger className="text-sm font-semibold">المالية</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">السعر</Label>
                                <p className="text-lg font-bold text-primary mt-1">
                                  {prop.price ? formatCurrency(prop.price) : "غير محدد"}
                                </p>
                              </div>
                              {propMetadata?.paymentPreference && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">طرق الدفع المقبولة</Label>
                                  <p className="text-sm font-medium mt-1">
                                    {propMetadata.paymentPreference === "cash" ? "كاش فقط" :
                                     propMetadata.paymentPreference === "finance" ? "أقبل التمويل البنكي" : propMetadata.paymentPreference}
                                  </p>
                                </div>
                              )}
                              {propMetadata?.bankName && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">البنك</Label>
                                  <p className="text-sm font-medium mt-1">{propMetadata.bankName}</p>
                                </div>
                              )}
                              {propMetadata?.offerType && (
                                <div>
                                  <Label className="text-xs font-semibold text-muted-foreground">نوع العرض</Label>
                                  <p className="text-sm font-medium mt-1">
                                    {propMetadata.offerType === "sale" ? "عرض للبيع" :
                                     propMetadata.offerType === "rent" ? "عرض للإيجار" : propMetadata.offerType}
                                  </p>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* المزايا الإضافية */}
                          {prop.amenities && prop.amenities.length > 0 && (
                            <AccordionItem value="seller-amenities">
                              <AccordionTrigger className="text-sm font-semibold">المزايا</AccordionTrigger>
                              <AccordionContent className="pt-2">
                                <div className="flex flex-wrap gap-2">
                                  {prop.amenities.map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* المميزات الذكية */}
                          {propMetadata?.smartTags && Array.isArray(propMetadata.smartTags) && propMetadata.smartTags.length > 0 && (
                            <AccordionItem value="seller-smart-tags">
                              <AccordionTrigger className="text-sm font-semibold">المميزات الذكية</AccordionTrigger>
                              <AccordionContent className="pt-2">
                                <div className="flex flex-wrap gap-2">
                                  {propMetadata.smartTags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* الوصف */}
                          {prop.description && (
                            <AccordionItem value="seller-description">
                              <AccordionTrigger className="text-sm font-semibold">الوصف</AccordionTrigger>
                              <AccordionContent className="pt-2">
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {prop.description.replace(/<metadata>.*?<\/metadata>/s, "").trim() || "لا يوجد وصف"}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل بيانات البائع */}
      <Dialog open={showSellerEditDialog} onOpenChange={setShowSellerEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {(() => {
            if (!selectedSellerMatchId) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            
            const match = matches.find(m => m.id === selectedSellerMatchId);
            if (!match) return <div className="text-center py-8 text-muted-foreground">المطابقة غير موجودة</div>;
            
            const prop = properties.find(p => p.id === match.propertyId);
            const seller = prop ? users.find(u => u.id === prop.sellerId) : null;
            if (!prop || !seller) return <div className="text-center py-8 text-muted-foreground">البيانات غير متوفرة</div>;

            // دالة لحفظ بيانات العقار
            const savePropertyField = async (field: string, value: any) => {
              try {
                const updatedData = { [field]: value };
                await apiRequest("PATCH", `/api/properties/${prop.id}`, updatedData);
                queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
                queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
                toast({ title: "تم الحفظ", description: "تم تحديث بيانات العقار بنجاح" });
              } catch (error: any) {
                toast({ title: "خطأ", description: error.message || "فشل في الحفظ", variant: "destructive" });
              }
            };

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div>بيانات البائع والعقار</div>
                      <DialogDescription className="mt-1">
                        {seller.name} - {prop.city || "غير محدد"}
                      </DialogDescription>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                  {/* بيانات البائع */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        بيانات البائع
                      </CardTitle>
                      <CardDescription className="text-sm">معلومات البائع للعرض فقط</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">الاسم</Label>
                          <div className="text-sm font-medium mt-1">{seller.name}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">الجوال</Label>
                          <div className="text-sm font-medium mt-1" dir="ltr">{seller.phone || "غير محدد"}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                          <div className="text-sm font-medium mt-1" dir="ltr">{seller.email || "غير محدد"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* بيانات العقار - قابلة للتعديل */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        بيانات العقار
                      </CardTitle>
                      <CardDescription className="text-sm">يمكنك تعديل بيانات العقار مباشرة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* الموقع */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h4 className="font-bold text-sm">الموقع</h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Edit2 className="w-3 h-3 ml-1" />
                            قابل للتعديل
                          </Badge>
                        </div>
                        
                        {/* المدينة */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700 flex items-center gap-2">
                            المدينة
                            <Edit2 className="w-3 h-3 text-muted-foreground" />
                          </label>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {saudiCities.map((city) => (
                              <button
                                key={city.name}
                                onClick={() => savePropertyField("city", city.name)}
                                className={`
                                  flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
                                  ${prop?.city === city.name 
                                    ? "bg-primary text-white border-primary shadow-sm scale-105" 
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                                `}
                              >
                                {prop?.city === city.name && <Check className="inline-block w-3 h-3 ml-1" />}
                                {city.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* الحي */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700 flex items-center gap-2">
                            الحي
                            <Edit2 className="w-3 h-3 text-muted-foreground" />
                          </label>
                          <div className="h-[200px] overflow-y-auto grid grid-cols-3 gap-2 pr-2">
                            {(() => {
                              const selectedCity = saudiCities.find(c => c.name === prop?.city);
                              const districts = selectedCity?.neighborhoods || [];
                              return districts.length > 0 ? districts.map((district) => (
                                <button
                                  key={district.name}
                                  onClick={() => savePropertyField("district", district.name)}
                                  className={`
                                    py-3 px-2 rounded-lg border text-sm font-bold transition-all
                                    ${prop?.district === district.name
                                      ? "bg-primary text-white border-primary" 
                                      : "bg-white hover:bg-muted border-border"}
                                  `}
                                >
                                  {prop?.district === district.name && <Check className="inline-block w-3 h-3 ml-1" />}
                                  {district.name}
                                </button>
                              )) : <p className="col-span-3 text-center text-muted-foreground py-10">اختر مدينة أولاً</p>;
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* المواصفات */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-primary" />
                          <h4 className="font-bold text-sm">المواصفات</h4>
                        </div>
                        
                        {/* النوع */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700">نوع العقار</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {Object.entries(propertyTypeLabels).map(([key, label]) => (
                              <button
                                key={key}
                                onClick={() => savePropertyField("propertyType", key)}
                                className={`
                                  flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
                                  ${prop?.propertyType === key 
                                    ? "bg-primary text-white border-primary shadow-sm scale-105" 
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                                `}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* الغرف */}
                        <ScrollableOptions 
                          label="عدد الغرف" 
                          options={SMART_RANGES.rooms} 
                          selected={prop?.rooms || ""} 
                          onSelect={(v) => savePropertyField("rooms", v)} 
                        />

                        {/* الحمامات */}
                        <ScrollableOptions 
                          label="عدد الحمامات" 
                          options={SMART_RANGES.bathrooms} 
                          selected={prop?.bathrooms || ""} 
                          onSelect={(v) => savePropertyField("bathrooms", v)} 
                        />

                        {/* المساحة */}
                        <ScrollableOptions 
                          label="المساحة (م²)" 
                          options={SMART_RANGES.area} 
                          selected={prop?.area || ""} 
                          onSelect={(v) => savePropertyField("area", v)} 
                          unit="م²"
                        />
                      </div>

                      {/* المالية */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className="w-4 h-4 text-primary" />
                          <h4 className="font-bold text-sm">المالية</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-700">السعر</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {(() => {
                              const priceRanges = [
                                { min: 0, max: 800000, label: "< 800 ألف" },
                                { min: 800000, max: 1200000, label: "800 - 1.2 مليون" },
                                { min: 1200000, max: 1800000, label: "1.2 - 1.8 مليون" },
                                { min: 1800000, max: 2500000, label: "1.8 - 2.5 مليون" },
                                { min: 2500000, max: 3500000, label: "2.5 - 3.5 مليون" },
                                { min: 3500000, max: 5000000, label: "3.5 - 5 مليون" },
                                { min: 5000000, max: 999999999, label: "+ 5 مليون" }
                              ];
                              const propPrice = prop?.price || 0;
                              return priceRanges.map((range) => {
                                const isSelected = propPrice >= range.min && propPrice <= range.max;
                                return (
                                  <button
                                    key={range.label}
                                    onClick={() => savePropertyField("price", Math.round(range.min + (range.max - range.min) / 2))}
                                    className={`
                                      flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap
                                      ${isSelected
                                        ? "bg-primary text-white border-primary shadow-sm scale-105" 
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                                    `}
                                  >
                                    {range.label}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* إضافية */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings2 className="w-4 h-4 text-primary" />
                          <h4 className="font-bold text-sm">إضافية</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">التشطيب</Label>
                            <Select defaultValue={prop?.furnishing || ""} onValueChange={(value) => savePropertyField("furnishing", value)}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="furnished">مفروش</SelectItem>
                                <SelectItem value="semi_furnished">شبه مفروش</SelectItem>
                                <SelectItem value="unfurnished">غير مفروش</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">الحالة</Label>
                            <Select defaultValue={prop?.status || ""} onValueChange={(value) => savePropertyField("status", value)}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ready">جاهز</SelectItem>
                                <SelectItem value="under_construction">قيد الإنشاء</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center pt-4 mt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSellerEditDialog(false)}
                  >
                    إغلاق
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* نافذة تفاصيل الرغبة */}
      <Dialog open={showPreferenceDetailsDialog} onOpenChange={(open) => {
        setShowPreferenceDetailsDialog(open);
        if (!open) {
          setSelectedPreferenceId(null);
          setIsEditingPreference(false);
          setPreferenceEditData({});
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {(() => {
            if (!selectedPreferenceId) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            
            const pref = preferences.find(p => p.id === selectedPreferenceId);
            if (!pref) return <div className="text-center py-8 text-muted-foreground">الرغبة غير موجودة</div>;
            
            const buyer = users.find(u => u.id === pref.userId);
            if (!buyer) return <div className="text-center py-8 text-muted-foreground">المشتري غير موجود</div>;

            const currentData = isEditingPreference ? preferenceEditData : pref;
            const currentCity = currentData.city || pref.city;
            const currentDistricts = currentData.districts || pref.districts || [];

            return (
              <>
                <DialogHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">تفاصيل الرغبة</DialogTitle>
                        <DialogDescription className="mt-1">
                          {buyer.name} - {pref.city}
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isEditingPreference ? "outline" : "default"}
                      className="gap-2"
                      onClick={() => {
                        if (isEditingPreference) {
                          setIsEditingPreference(false);
                          setPreferenceEditData({});
                        } else {
                          setIsEditingPreference(true);
                          setPreferenceEditData({
                            city: pref.city,
                            districts: pref.districts || [],
                            propertyType: pref.propertyType,
                            transactionType: pref.transactionType,
                            rooms: pref.rooms,
                            area: pref.area,
                            budgetMin: pref.budgetMin,
                            budgetMax: pref.budgetMax,
                            paymentMethod: pref.paymentMethod,
                            purpose: pref.purpose,
                            purchaseTimeline: pref.purchaseTimeline,
                            clientType: pref.clientType,
                            isActive: pref.isActive,
                          });
                        }
                      }}
                    >
                      {isEditingPreference ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          إلغاء التعديل
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          تعديل الرغبة
                        </>
                      )}
                    </Button>
                  </div>
                </DialogHeader>
                
                <div className="max-w-4xl mx-auto space-y-6 mt-6">
                  {/* معلومات المشتري - للعرض فقط */}
                  {!isEditingPreference && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          معلومات المشتري
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الاسم</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{buyer.name}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الجوال</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{toArabicPhone(buyer.phone || '')}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{buyer.email}</p>
                            </div>
                          </div>
                          {buyer.whatsappNumber && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">واتساب</Label>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm font-medium">{toArabicPhone(buyer.whatsappNumber)}</p>
                              </div>
                            </div>
                          )}
                          {buyer.websiteUrl && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">الموقع الإلكتروني</Label>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                <a href={buyer.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                                  {buyer.websiteUrl}
                                </a>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الحالة</Label>
                            <Badge className={pref.isActive ? "bg-green-500" : "bg-muted"}>
                              {pref.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">عدد المطابقات</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Link2 className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{matches.filter(m => m.buyerPreferenceId === pref.id).length} مطابقة</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* تفاصيل الرغبة */}
                  <div className="space-y-4">
                    {/* الموقع والمنطقة */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          الموقع والمنطقة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* المدينة */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">المدينة المفضلة</Label>
                            {isEditingPreference ? (
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                {saudiCities.map((city) => (
                                  <button
                                    key={city.name}
                                    type="button"
                                    onClick={() => {
                                      setPreferenceEditData({
                                        ...preferenceEditData,
                                        city: city.name,
                                        districts: [], // إعادة تعيين الأحياء عند تغيير المدينة
                                      });
                                    }}
                                    className={`
                                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap transition-colors
                                      ${currentCity === city.name 
                                        ? "bg-primary text-white border-primary shadow-sm" 
                                        : "bg-slate-50 border-gray-200 text-gray-500 hover:bg-slate-100"}
                                    `}
                                  >
                                    {currentCity === city.name && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                    {city.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                {saudiCities.map((city) => (
                                  <div
                                    key={city.name}
                                    className={`
                                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap cursor-default transition-colors
                                      ${pref.city === city.name 
                                        ? "bg-primary text-white border-primary shadow-sm" 
                                        : "bg-slate-50 border-gray-200 text-gray-500"}
                                    `}
                                  >
                                    {pref.city === city.name && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                    {city.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* الأحياء */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">
                              الأحياء المفضلة ({currentDistricts.length})
                            </Label>
                            {isEditingPreference ? (
                              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[200px] pb-2 scrollbar-hide -mx-1 px-1">
                                {(() => {
                                  const selectedCity = saudiCities.find(c => c.name === currentCity);
                                  const districts = selectedCity?.neighborhoods || [];
                                  
                                  if (districts.length === 0) {
                                    return <p className="w-full text-center text-muted-foreground py-8 text-sm">لا توجد أحياء متاحة</p>;
                                  }
                                  
                                  return districts.map((district) => {
                                    const isSelected = currentDistricts.includes(district.name);
                                    return (
                                      <button
                                        key={district.name}
                                        type="button"
                                        onClick={() => {
                                          const newDistricts = isSelected
                                            ? currentDistricts.filter(d => d !== district.name)
                                            : [...currentDistricts, district.name];
                                          setPreferenceEditData({
                                            ...preferenceEditData,
                                            districts: newDistricts,
                                          });
                                        }}
                                        className={`
                                          flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap transition-colors
                                          ${isSelected
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-slate-50 border-gray-200 text-gray-500 hover:bg-slate-100"}
                                        `}
                                      >
                                        {isSelected && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                        {district.name}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[200px] pb-2 scrollbar-hide -mx-1 px-1">
                                {(() => {
                                  const selectedCity = saudiCities.find(c => c.name === pref.city);
                                  const districts = selectedCity?.neighborhoods || [];
                                  const selectedDistricts = pref.districts || [];
                                  
                                  if (districts.length === 0) {
                                    return <p className="w-full text-center text-muted-foreground py-8 text-sm">لا توجد أحياء متاحة</p>;
                                  }
                                  
                                  if (selectedDistricts.length === 0) {
                                    return <p className="w-full text-center text-muted-foreground py-8 text-sm">لم يتم اختيار أي أحياء</p>;
                                  }
                                  
                                  return districts.filter(d => selectedDistricts.includes(d.name)).map((district) => (
                                    <div
                                      key={district.name}
                                      className="flex-shrink-0 px-4 py-2.5 rounded-lg border bg-primary text-white border-primary shadow-sm cursor-default text-sm font-bold whitespace-nowrap"
                                    >
                                      <Check className="inline-block w-3.5 h-3.5 ml-1.5" />
                                      {district.name}
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* نوع العقار والمواصفات */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Building2 className="h-4 w-4 text-green-600" />
                          </div>
                          نوع العقار والمواصفات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* نوع العقار */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">نوع العقار المطلوب</Label>
                            {isEditingPreference ? (
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                {Object.entries(propertyTypeLabels).map(([key, label]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      setPreferenceEditData({ ...preferenceEditData, propertyType: key });
                                    }}
                                    className={`
                                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap transition-colors
                                      ${(preferenceEditData.propertyType || pref.propertyType) === key 
                                        ? "bg-primary text-white border-primary shadow-sm" 
                                        : "bg-slate-50 border-gray-200 text-gray-500 hover:bg-slate-100"}
                                    `}
                                  >
                                    {(preferenceEditData.propertyType || pref.propertyType) === key && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                    {label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                {Object.entries(propertyTypeLabels).map(([key, label]) => (
                                  <div
                                    key={key}
                                    className={`
                                      flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm font-bold whitespace-nowrap cursor-default transition-colors
                                      ${pref.propertyType === key 
                                        ? "bg-primary text-white border-primary shadow-sm" 
                                        : "bg-slate-50 border-gray-200 text-gray-500"}
                                    `}
                                  >
                                    {pref.propertyType === key && <Check className="inline-block w-3.5 h-3.5 ml-1.5" />}
                                    {label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* المواصفات التفصيلية */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {/* الغرف */}
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Bed className="h-4 w-4" />
                                عدد الغرف
                              </Label>
                              {isEditingPreference ? (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                  {["1", "2", "3", "4", "5", "6", "7+"].map((room) => (
                                    <button
                                      key={room}
                                      type="button"
                                      onClick={() => {
                                        setPreferenceEditData({ ...preferenceEditData, rooms: room });
                                      }}
                                      className={`
                                        flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold whitespace-nowrap transition-colors
                                        ${(preferenceEditData.rooms || pref.rooms) === room 
                                          ? "bg-primary text-white border-primary shadow-sm" 
                                          : "bg-slate-50 border-gray-200 text-gray-500 hover:bg-slate-100"}
                                      `}
                                    >
                                      {(preferenceEditData.rooms || pref.rooms) === room && <Check className="inline-block w-3 h-3 ml-1" />}
                                      {room} غرفة
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                pref.rooms ? (
                                  <div className="p-3 rounded-lg bg-slate-50 border">
                                    <p className="text-base font-bold text-primary">{pref.rooms} غرفة</p>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                    <p className="text-sm text-muted-foreground">غير محدد</p>
                                  </div>
                                )
                              )}
                            </div>

                            {/* المساحة */}
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                المساحة
                              </Label>
                              {isEditingPreference ? (
                                <Input
                                  value={preferenceEditData.area || pref.area || ''}
                                  onChange={(e) => setPreferenceEditData({ ...preferenceEditData, area: e.target.value })}
                                  placeholder="متر مربع"
                                  dir="rtl"
                                />
                              ) : (
                                pref.area ? (
                                  <div className="p-3 rounded-lg bg-slate-50 border">
                                    <p className="text-base font-bold text-primary">{pref.area} م²</p>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                    <p className="text-sm text-muted-foreground">غير محدد</p>
                                  </div>
                                )
                              )}
                            </div>

                            {/* نوع المعاملة */}
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <Handshake className="h-4 w-4" />
                                نوع المعاملة
                              </Label>
                              {isEditingPreference ? (
                                <Select
                                  value={preferenceEditData.transactionType || pref.transactionType || 'buy'}
                                  onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, transactionType: value as 'buy' | 'rent' })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="buy">شراء</SelectItem>
                                    <SelectItem value="rent">إيجار</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-3 rounded-lg bg-slate-50 border">
                                  <Badge variant="outline" className="text-sm">
                                    {pref.transactionType === "buy" ? "شراء" : pref.transactionType === "rent" ? "إيجار" : "غير محدد"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* الميزانية والدفع */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-orange-100">
                            <Wallet className="h-4 w-4 text-orange-600" />
                          </div>
                          الميزانية وطريقة الدفع
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* الميزانية */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الميزانية المتاحة</Label>
                            {isEditingPreference ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">من (ريال)</Label>
                                  <Input
                                    type="number"
                                    value={preferenceEditData.budgetMin || pref.budgetMin || ''}
                                    onChange={(e) => setPreferenceEditData({ 
                                      ...preferenceEditData, 
                                      budgetMin: e.target.value ? parseInt(e.target.value) : undefined 
                                    })}
                                    placeholder="الحد الأدنى"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">إلى (ريال)</Label>
                                  <Input
                                    type="number"
                                    value={preferenceEditData.budgetMax || pref.budgetMax || ''}
                                    onChange={(e) => setPreferenceEditData({ 
                                      ...preferenceEditData, 
                                      budgetMax: e.target.value ? parseInt(e.target.value) : undefined 
                                    })}
                                    placeholder="الحد الأقصى"
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            ) : (
                              (pref.budgetMin || pref.budgetMax) ? (
                                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                                  <p className="text-xl font-bold text-primary">{maskBudget(pref.budgetMin, pref.budgetMax)}</p>
                                  {(pref.budgetMin || pref.budgetMax) && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {pref.budgetMin ? `من ${formatCurrency(pref.budgetMin)}` : ''} 
                                      {pref.budgetMin && pref.budgetMax ? ' إلى ' : ''}
                                      {pref.budgetMax ? `${formatCurrency(pref.budgetMax)}` : ''}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="p-4 rounded-lg bg-slate-50 border border-dashed">
                                  <p className="text-sm text-muted-foreground">غير محدد</p>
                                </div>
                              )
                            )}
                          </div>

                          {/* طريقة الدفع والغرض */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">طريقة الدفع</Label>
                              {isEditingPreference ? (
                                <Select
                                  value={preferenceEditData.paymentMethod || pref.paymentMethod || ''}
                                  onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, paymentMethod: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر طريقة الدفع" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">كاش</SelectItem>
                                    <SelectItem value="bank">تمويل بنكي</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                pref.paymentMethod ? (
                                  <div className="p-3 rounded-lg bg-slate-50 border">
                                    <Badge variant="outline" className="text-sm">
                                      {paymentMethodLabels[pref.paymentMethod] || pref.paymentMethod}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                    <p className="text-sm text-muted-foreground">غير محدد</p>
                                  </div>
                                )
                              )}
                            </div>

                            {/* الغرض */}
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">الغرض من الشراء</Label>
                              {isEditingPreference ? (
                                <Select
                                  value={preferenceEditData.purpose || pref.purpose || ''}
                                  onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, purpose: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الغرض" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="residence">سكن</SelectItem>
                                    <SelectItem value="investment">استثمار</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                pref.purpose ? (
                                  <div className="p-3 rounded-lg bg-slate-50 border">
                                    <Badge variant="outline" className="text-sm">
                                      {pref.purpose === "residence" ? "سكن" : pref.purpose === "investment" ? "استثمار" : pref.purpose}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                    <p className="text-sm text-muted-foreground">غير محدد</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* الجدول الزمني */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              الجدول الزمني للشراء
                            </Label>
                            {isEditingPreference ? (
                              <Select
                                value={preferenceEditData.purchaseTimeline || pref.purchaseTimeline || ''}
                                onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, purchaseTimeline: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الجدول الزمني" />
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
                            ) : (
                              pref.purchaseTimeline ? (
                                <div className="p-3 rounded-lg bg-slate-50 border">
                                  <Badge variant="outline" className="text-sm">
                                    {pref.purchaseTimeline === "asap" ? "فوراً" :
                                     pref.purchaseTimeline === "within_month" ? "خلال شهر" :
                                     pref.purchaseTimeline === "within_3months" ? "خلال 3 أشهر" :
                                     pref.purchaseTimeline === "within_6months" ? "خلال 6 أشهر" :
                                     pref.purchaseTimeline === "within_year" ? "خلال سنة" :
                                     pref.purchaseTimeline === "flexible" ? "مرن" : pref.purchaseTimeline}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-slate-50 border border-dashed">
                                  <p className="text-sm text-muted-foreground">غير محدد</p>
                                </div>
                              )
                            )}
                          </div>

                          {/* نوع العميل */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              نوع العميل
                            </Label>
                            {isEditingPreference ? (
                              <Select
                                value={preferenceEditData.clientType || pref.clientType || 'direct'}
                                onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, clientType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="direct">مباشر</SelectItem>
                                  <SelectItem value="broker">وسيط</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-3 rounded-lg bg-slate-50 border">
                                <Badge variant="outline" className="text-sm">
                                  {pref.clientType === "direct" ? "مباشر" : pref.clientType === "broker" ? "وسيط" : pref.clientType}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* الحالة */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Power className="h-4 w-4" />
                              حالة الرغبة
                            </Label>
                            {isEditingPreference ? (
                              <Select
                                value={preferenceEditData.isActive !== undefined ? (preferenceEditData.isActive ? 'active' : 'inactive') : (pref.isActive ? 'active' : 'inactive')}
                                onValueChange={(value) => setPreferenceEditData({ ...preferenceEditData, isActive: value === 'active' })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">نشط</SelectItem>
                                  <SelectItem value="inactive">غير نشط</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={pref.isActive ? "bg-green-500" : "bg-muted"}>
                                {pref.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* أزرار الحفظ */}
                  {isEditingPreference && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsEditingPreference(false);
                          setPreferenceEditData({});
                        }}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        إلغاء
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => {
                          if (pref.id) {
                            updatePreferenceMutation.mutate({ 
                              preferenceId: pref.id, 
                              data: preferenceEditData 
                            });
                          }
                        }}
                        disabled={updatePreferenceMutation.isPending}
                        className="gap-2"
                      >
                        {updatePreferenceMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* نافذة تفاصيل العقار */}
      <Dialog open={showPropertyDetailsDialog} onOpenChange={(open) => {
        setShowPropertyDetailsDialog(open);
        if (!open) {
          setSelectedPropertyId(null);
          setIsEditingProperty(false);
          setPropertyEditData({});
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {(() => {
            if (!selectedPropertyId) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;
            
            const prop = properties.find(p => p.id === selectedPropertyId);
            if (!prop) return <div className="text-center py-8 text-muted-foreground">العقار غير موجود</div>;
            
            const seller = users.find(u => u.id === prop.sellerId);
            if (!seller) return <div className="text-center py-8 text-muted-foreground">البائع غير موجود</div>;

            const currentData = isEditingProperty ? propertyEditData : prop;
            const currentCity = currentData.city || prop.city;
            const currentDistrict = currentData.district || prop.district;

            return (
              <>
                <DialogHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">تفاصيل العقار</DialogTitle>
                        <DialogDescription className="mt-1">
                          {propertyTypeLabels[prop.propertyType] || prop.propertyType} - {prop.city} - {prop.district}
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isEditingProperty ? "outline" : "default"}
                      className="gap-2"
                      onClick={() => {
                        if (isEditingProperty) {
                          setIsEditingProperty(false);
                          setPropertyEditData({});
                        } else {
                          setIsEditingProperty(true);
                          setPropertyEditData({
                            city: prop.city,
                            district: prop.district,
                            propertyType: prop.propertyType,
                            price: prop.price,
                            area: prop.area,
                            rooms: prop.rooms,
                            bathrooms: prop.bathrooms,
                            description: prop.description,
                            status: prop.status,
                            furnishing: prop.furnishing,
                            yearBuilt: prop.yearBuilt,
                            amenities: prop.amenities || [],
                            isActive: prop.isActive,
                          });
                        }
                      }}
                    >
                      {isEditingProperty ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          إلغاء التعديل
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          تعديل العقار
                        </>
                      )}
                    </Button>
                  </div>
                </DialogHeader>
                
                <div className="max-w-4xl mx-auto space-y-6 mt-6">
                  {/* معلومات البائع - للعرض فقط */}
                  {!isEditingProperty && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          معلومات البائع
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الاسم</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{seller.name}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الجوال</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50" dir="rtl">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{toArabicPhone(seller.phone || '')}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">البريد الإلكتروني</Label>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{seller.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الحالة</Label>
                            <Badge className={prop.isActive ? "bg-green-500" : "bg-muted"}>
                              {prop.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* تفاصيل العقار */}
                  <div className="space-y-4">
                    {/* الموقع */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          الموقع
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">المدينة</Label>
                            {isEditingProperty ? (
                              <Select
                                value={currentCity}
                                onValueChange={(value) => {
                                  setPropertyEditData({ ...propertyEditData, city: value, district: "" });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المدينة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {saudiCities.map(city => (
                                    <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium">{prop.city}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الحي</Label>
                            {isEditingProperty ? (
                              <Select
                                value={currentDistrict}
                                onValueChange={(value) => {
                                  setPropertyEditData({ ...propertyEditData, district: value });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الحي" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(() => {
                                    const selectedCity = saudiCities.find(c => c.name === currentCity);
                                    return selectedCity?.neighborhoods.map(neighborhood => (
                                      <SelectItem key={neighborhood.name} value={neighborhood.name}>{neighborhood.name}</SelectItem>
                                    )) || [];
                                  })()}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium">{prop.district}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* معلومات العقار */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Building2 className="h-4 w-4 text-green-600" />
                          </div>
                          معلومات العقار
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">نوع العقار</Label>
                              {isEditingProperty ? (
                                <Select
                                  value={currentData.propertyType || ""}
                                  onValueChange={(value) => {
                                    setPropertyEditData({ ...propertyEditData, propertyType: value });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر النوع" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(propertyTypeLabels).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">السعر (ريال)</Label>
                              {isEditingProperty ? (
                                <Input
                                  type="number"
                                  value={currentData.price || ""}
                                  onChange={(e) => setPropertyEditData({ ...propertyEditData, price: parseInt(e.target.value) || 0 })}
                                  dir="ltr"
                                />
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{formatCurrency(prop.price)} ريال</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">المساحة (م²)</Label>
                              {isEditingProperty ? (
                                <Input
                                  value={currentData.area || ""}
                                  onChange={(e) => setPropertyEditData({ ...propertyEditData, area: e.target.value })}
                                  dir="ltr"
                                />
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{prop.area || '-'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">عدد الغرف</Label>
                              {isEditingProperty ? (
                                <Input
                                  value={currentData.rooms || ""}
                                  onChange={(e) => setPropertyEditData({ ...propertyEditData, rooms: e.target.value })}
                                  dir="ltr"
                                />
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{prop.rooms || '-'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">دورات المياه</Label>
                              {isEditingProperty ? (
                                <Input
                                  value={currentData.bathrooms || ""}
                                  onChange={(e) => setPropertyEditData({ ...propertyEditData, bathrooms: e.target.value })}
                                  dir="ltr"
                                />
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{prop.bathrooms || '-'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">سنة البناء</Label>
                              {isEditingProperty ? (
                                <Input
                                  value={currentData.yearBuilt || ""}
                                  onChange={(e) => setPropertyEditData({ ...propertyEditData, yearBuilt: e.target.value })}
                                  dir="ltr"
                                />
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">{prop.yearBuilt || '-'}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">التأثيث</Label>
                              {isEditingProperty ? (
                                <Select
                                  value={currentData.furnishing || "unfurnished"}
                                  onValueChange={(value) => {
                                    setPropertyEditData({ ...propertyEditData, furnishing: value });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="furnished">مفروش</SelectItem>
                                    <SelectItem value="semi_furnished">شبه مفروش</SelectItem>
                                    <SelectItem value="unfurnished">غير مفروش</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">
                                    {prop.furnishing === "furnished" ? "مفروش" : 
                                     prop.furnishing === "semi_furnished" ? "شبه مفروش" : 
                                     prop.furnishing === "unfurnished" ? "غير مفروش" : prop.furnishing || '-'}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">حالة البناء</Label>
                              {isEditingProperty ? (
                                <Select
                                  value={currentData.status || "ready"}
                                  onValueChange={(value) => {
                                    setPropertyEditData({ ...propertyEditData, status: value });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ready">جاهز</SelectItem>
                                    <SelectItem value="under_construction">قيد الإنشاء</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="p-2 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">
                                    {prop.status === "ready" ? "جاهز" : prop.status === "under_construction" ? "قيد الإنشاء" : prop.status || '-'}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">الحالة</Label>
                              {isEditingProperty ? (
                                <Select
                                  value={currentData.isActive?.toString() || "true"}
                                  onValueChange={(value) => {
                                    setPropertyEditData({ ...propertyEditData, isActive: value === "true" });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">نشط</SelectItem>
                                    <SelectItem value="false">غير نشط</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={prop.isActive ? "bg-green-500" : "bg-muted"}>
                                  {prop.isActive ? "نشط" : "غير نشط"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">الوصف</Label>
                            {isEditingProperty ? (
                              <Textarea
                                value={currentData.description || ""}
                                onChange={(e) => setPropertyEditData({ ...propertyEditData, description: e.target.value })}
                                rows={4}
                                placeholder="اكتب وصفاً للعقار..."
                              />
                            ) : (
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium whitespace-pre-line">{prop.description || '-'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* المزايا */}
                    {prop.amenities && prop.amenities.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-100">
                              <Star className="h-4 w-4 text-purple-600" />
                            </div>
                            المزايا
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {prop.amenities.map((amenity, idx) => (
                              <Badge key={idx} variant="outline">{amenity}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* أزرار الحفظ */}
                  {isEditingProperty && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsEditingProperty(false);
                          setPropertyEditData({});
                        }}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        إلغاء
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => {
                          if (prop.id) {
                            updatePropertyMutation.mutate({ 
                              propertyId: prop.id, 
                              data: propertyEditData 
                            });
                          }
                        }}
                        disabled={updatePropertyMutation.isPending}
                        className="gap-2"
                      >
                        {updatePropertyMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmDialog({ open: false, type: null, id: null, name: "" });
        }
      }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {deleteConfirmDialog.type === "user" ? "المستخدم" : deleteConfirmDialog.type === "preference" ? "الرغبة" : deleteConfirmDialog.type === "property" ? "العقار" : "المطابقة"}؟
              <br />
              <span className="font-semibold text-foreground">{deleteConfirmDialog.name}</span>
              <br />
              <span className="text-red-600">لا يمكن التراجع عن هذا الإجراء.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteConfirmDialog.id || !deleteConfirmDialog.type) return;
                
                if (deleteConfirmDialog.type === "user") {
                  deleteUserMutation.mutate(deleteConfirmDialog.id);
                } else if (deleteConfirmDialog.type === "preference") {
                  deletePreferenceMutation.mutate(deleteConfirmDialog.id);
                } else if (deleteConfirmDialog.type === "property") {
                  deletePropertyMutation.mutate(deleteConfirmDialog.id);
                } else if (deleteConfirmDialog.type === "match") {
                  deleteMatchMutation.mutate(deleteConfirmDialog.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                deleteUserMutation.isPending ||
                deletePreferenceMutation.isPending ||
                deletePropertyMutation.isPending ||
                deleteMatchMutation.isPending
              }
            >
              {deleteUserMutation.isPending ||
              deletePreferenceMutation.isPending ||
              deletePropertyMutation.isPending ||
              deleteMatchMutation.isPending
                ? "جاري الحذف..."
                : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    faq: `<h2>ما هي منصة بركس؟</h2>
<p>بركس هي منصة مطابقة عقارية ذكية تربط بين المشترين والبائعين في السوق العقاري السعودي.</p>

<h2>كيف يمكنني تسجيل رغبتي العقارية؟</h2>
<p>يمكنك تسجيل رغبتي العقارية من خلال الصفحة الرئيسية عبر المحادثة الذكية مع مساعدنا الآلي.</p>

<h2>هل الخدمة مجانية؟</h2>
<p>نعم، تسجيل الرغبات العقارية مجاني تماماً.</p>

<h2>كيف سأعرف بالعقارات المطابقة؟</h2>
<p>سنرسل لك إشعارات أسبوعية عبر الواتساب بالعقارات التي تتطابق مع متطلباتك.</p>`,
    privacy: `<h2>سياسة الخصوصية</h2>
<p>نحن في بركس نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>

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
<p>باستخدامك لمنصة بركس، فإنك توافق على هذه الشروط والأحكام.</p>

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
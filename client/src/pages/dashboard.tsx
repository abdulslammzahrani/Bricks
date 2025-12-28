import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  Lock, 
  AlertTriangle, 
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  PieChart as PieChartIcon,
  BarChart3,
  Menu,
  FileCheck,
  Handshake,
  Target,
  Home,
  DollarSign,
  Users,
  Building2,
  FileText
} from "lucide-react";
import { DashboardSidebar, DashboardSidebarContent } from "@/components/DashboardSidebar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  requiresPasswordReset: boolean;
}

// Sample data for charts
const statusData = [
  { name: "مكتمل", value: 30, color: "hsl(142, 76%, 36%)" },
  { name: "قيد المعالجة", value: 45, color: "hsl(221, 83%, 53%)" },
  { name: "معلق", value: 15, color: "hsl(32, 95%, 44%)" },
  { name: "ملغي", value: 10, color: "hsl(0, 84%, 40%)" },
];

const revenueData = [
  { month: "يناير", revenue: 200, deals: 5 },
  { month: "فبراير", revenue: 300, deals: 8 },
  { month: "مارس", revenue: 400, deals: 10 },
  { month: "أبريل", revenue: 500, deals: 12 },
  { month: "مايو", revenue: 600, deals: 15 },
  { month: "يونيو", revenue: 700, deals: 18 },
  { month: "يوليو", revenue: 800, deals: 20 },
  { month: "أغسطس", revenue: 900, deals: 22 },
  { month: "سبتمبر", revenue: 950, deals: 24 },
  { month: "أكتوبر", revenue: 1000, deals: 25 },
  { month: "نوفمبر", revenue: 1050, deals: 26 },
  { month: "ديسمبر", revenue: 1100, deals: 28 },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevLocationRef = useRef<string | null>(null);

  // Use session-based auth via cookies (no localStorage)
  const userQuery = useQuery<{ user: UserData }>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في جلب بيانات المستخدم");
      }
      return res.json();
    },
    retry: false,
  });

  const user = userQuery.data?.user;

  useEffect(() => {
    if (userQuery.isError) {
      navigate("/");
    }
  }, [userQuery.isError, navigate]);

  useEffect(() => {
    if (user?.requiresPasswordReset) {
      setShowPasswordModal(true);
    }
  }, [user]);

  // Debug: Log mobile menu state changes
  useEffect(() => {
    console.log('Mobile menu state changed:', mobileMenuOpen);
  }, [mobileMenuOpen]);

  // Close mobile menu when location changes (but not on initial mount)
  useEffect(() => {
    if (prevLocationRef.current !== null && prevLocationRef.current !== location) {
      // Location actually changed, close menu if open
      console.log('Location changed from', prevLocationRef.current, 'to', location);
      if (mobileMenuOpen) {
        console.log('Closing menu due to location change');
        setMobileMenuOpen(false);
      }
    }
    // Update prevLocationRef
    prevLocationRef.current = location;
  }, [location, mobileMenuOpen]);

  // Fetch stats - using mock data for now
  const kpiData = {
    newClients: 89,
    newClientsChange: -3,
    propertiesSold: 142,
    propertiesSoldChange: 8,
    assetValue: 85.2,
    assetValueChange: 18,
    managedProperties: 248,
    managedPropertiesChange: 12,
  };

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/16d572c6-1305-46aa-bfbd-260998199616',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:118',message:'KPI data loaded',data:{kpiData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, [kpiData]);
  // #endregion

  const changePasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      setShowPasswordModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ newPassword });
  };

  // Get current date in Arabic
  const getCurrentDate = () => {
    const date = new Date();
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const dayName = days[date.getDay()];
    return `${dayName}، ${date.toLocaleDateString("ar-SA")}`;
  };

  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">لم يتم تسجيل الدخول</h2>
            <p className="text-muted-foreground mb-4">الرجاء تسجيل الدخول للوصول لهذه الصفحة</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">
              الرجوع للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden" dir="rtl">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col bg-background lg:mr-64 w-full min-w-0">
          {/* Header Bar */}
          <header className="sticky top-0 z-50 bg-background border-b border-border w-full">
            <div className="flex h-16 items-center gap-2 sm:gap-4 px-3 sm:px-6 w-full">
              {/* Mobile: Hamburger Menu */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-9 w-9"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Hamburger clicked, opening menu, current state:', mobileMenuOpen);
                  setMobileMenuOpen(true);
                }}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Mobile: Logo */}
              <div className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <span className="text-white font-bold text-sm">P</span>
              </div>

              {/* Search Bar */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="ابحث عن العقارات، العملاء، المعاملات..."
                    className="pr-10 w-full text-sm"
                  />
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Desktop: Date */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline">{getCurrentDate()}</span>
                </div>
                
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    3
                  </span>
                </Button>

                {/* Desktop: User Avatar */}
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                  <span className="text-white font-bold text-sm">P</span>
                </div>

                {/* Desktop: Add Property */}
                <Button className="bg-primary hover:bg-primary/90 hidden sm:inline-flex">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة عقار
                </Button>

                {/* Desktop: Export */}
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">تصدير</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 lg:pb-4 w-full">
            <div className="w-full max-w-full lg:max-w-[800px] lg:mx-auto">
              {/* Welcome Section */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">مرحباً بك في بركس 👋</h1>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  إليك نظرة عامة على أداء عقاراتك هذا الشهر
                </p>
              </div>

            {/* KPI Cards - Horizontal Scroll on mobile (2 visible), Grid on desktop (4 columns) */}
            <div className="mb-6 sm:mb-8">
              {/* Mobile: Horizontal Scroll Layout (2 visible, rest scrollable) */}
              {/* #region agent log */}
              {(() => {
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
                fetch('http://127.0.0.1:7242/ingest/16d572c6-1305-46aa-bfbd-260998199616',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.tsx:285',message:'Rendering KPI cards',data:{isMobile,windowWidth:typeof window !== 'undefined' ? window.innerWidth : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                return null;
              })()}
              {/* #endregion */}
              <div className="lg:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 sm:-mx-4">
                <div className="flex gap-3 sm:gap-4 px-3 sm:px-4">
                  {/* العقارات المباعة - الأول */}
                  <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up flex-shrink-0 w-[calc(50vw-18px)] sm:w-[280px] snap-start" style={{ animationDelay: "0.1s" }}>
                    <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">العقارات المباعة</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-green-500">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>+{kpiData.propertiesSoldChange}%</span>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-center">{kpiData.propertiesSold}</p>
                    </CardContent>
                  </Card>

                  {/* عملاء جدد - الثاني */}
                  <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up flex-shrink-0 w-[calc(50vw-18px)] sm:w-[240px] snap-start" style={{ animationDelay: "0.2s" }}>
                    <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${kpiData.newClientsChange < 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">عملاء جدد</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs sm:text-sm ${kpiData.newClientsChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {kpiData.newClientsChange < 0 ? (
                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                          <span>{kpiData.newClientsChange < 0 ? '' : '+'}{Math.abs(kpiData.newClientsChange)}%</span>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-center">{kpiData.newClients}</p>
                    </CardContent>
                  </Card>

                  {/* قيمة الأصول - الثالث */}
                  <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up flex-shrink-0 w-[calc(50vw-18px)] sm:w-[240px] snap-start" style={{ animationDelay: "0.3s" }}>
                    <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">قيمة الأصول</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-green-500">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>+{kpiData.assetValueChange}%</span>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-center">{kpiData.assetValue} م</p>
                    </CardContent>
                  </Card>

                  {/* العقارات المدارة - الرابع */}
                  <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up flex-shrink-0 w-[calc(50vw-18px)] sm:w-[240px] snap-start" style={{ animationDelay: "0.4s" }}>
                    <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">العقارات المدارة</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-green-500">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>+{kpiData.managedPropertiesChange}%</span>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-center">{kpiData.managedProperties}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Desktop: Grid Layout (3 columns - all visible) */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-4">
                {/* العقارات المباعة - الأول */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Home className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">العقارات المباعة</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{kpiData.propertiesSoldChange}%</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-center">{kpiData.propertiesSold}</p>
                  </CardContent>
                </Card>

                {/* عملاء جدد - الثاني */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${kpiData.newClientsChange < 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">عملاء جدد</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${kpiData.newClientsChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {kpiData.newClientsChange < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span>{kpiData.newClientsChange < 0 ? '' : '+'}{Math.abs(kpiData.newClientsChange)}%</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-center">{kpiData.newClients}</p>
                  </CardContent>
                </Card>

                {/* قيمة الأصول - الثالث */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">قيمة الأصول</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{kpiData.assetValueChange}%</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-center">{kpiData.assetValue} م</p>
                  </CardContent>
                </Card>

                {/* العقارات المدارة - الرابع */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">العقارات المدارة</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{kpiData.managedPropertiesChange}%</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-center">{kpiData.managedProperties}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {/* Status Analysis Chart */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                      <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      تحليل الحالة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="h-[220px] sm:h-[250px] lg:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {statusData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Generation Chart */}
                <Card className="hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        توليد الإيرادات
                      </CardTitle>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[90px] sm:w-[100px] h-7 sm:h-8 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="h-[220px] sm:h-[250px] lg:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }}
                            domain={[0, 1200]}
                          />
                          <RechartsTooltip />
                          <Bar dataKey="revenue" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="deals" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">الإيرادات (ألف ريال)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">الصفقات</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordModal} onOpenChange={(open) => {
        if (!user?.requiresPasswordReset) {
          setShowPasswordModal(open);
        }
      }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              تغيير كلمة المرور
            </DialogTitle>
            <DialogDescription>
              {user?.requiresPasswordReset 
                ? "من فضلك غيّر كلمة المرور المؤقتة لحماية حسابك"
                : "أدخل كلمة المرور الجديدة"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              كلمة المرور يجب أن تكون 6 أحرف على الأقل
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePasswordChange} 
              disabled={changePasswordMutation.isPending}
              className="flex-1"
              data-testid="button-submit-password"
            >
              {changePasswordMutation.isPending ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </Button>
            {!user?.requiresPasswordReset && (
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(false)}
                data-testid="button-cancel-password"
              >
                إلغاء
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-[100] safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2 pb-2">
          <button
            onClick={() => navigate("/deals")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors py-1 ${
              location === "/deals" 
                ? "text-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileCheck className={`h-5 w-5 ${location === "/deals" ? "text-emerald-600" : "text-gray-500"}`} />
            <span className="text-xs font-medium">الصفقات</span>
          </button>
          
          <button
            onClick={() => navigate("/matches")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors py-1 ${
              location === "/matches" 
                ? "text-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Handshake className={`h-5 w-5 ${location === "/matches" ? "text-emerald-600" : "text-gray-500"}`} />
            <span className="text-xs font-medium">المطابقات</span>
          </button>
          
          <button
            onClick={() => navigate("/crm")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors py-1 ${
              location === "/crm" 
                ? "text-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Target className={`h-5 w-5 ${location === "/crm" ? "text-emerald-600" : "text-gray-500"}`} />
            <span className="text-xs font-medium">CRM</span>
          </button>
          
          <button
            onClick={() => navigate("/ads")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors py-1 relative ${
              location === "/ads" 
                ? "text-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`absolute top-0 w-10 h-10 rounded-full ${location === "/ads" ? "bg-emerald-50" : ""}`}></div>
            <Bell className={`h-5 w-5 relative z-10 ${location === "/ads" ? "text-emerald-600" : "text-gray-500"}`} />
            <span className={`text-xs font-medium relative z-10 ${location === "/ads" ? "text-emerald-600" : "text-gray-500"}`}>الإعلانات</span>
          </button>
          
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors py-1 ${
              location === "/dashboard" || (typeof location === 'string' && location.startsWith("/dashboard"))
                ? "text-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className={`h-5 w-5 ${location === "/dashboard" || (typeof location === 'string' && location.startsWith("/dashboard")) ? "text-emerald-600" : "text-gray-500"}`} />
            <span className="text-xs font-medium">الرئيسية</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <Sheet 
        open={mobileMenuOpen} 
        onOpenChange={(open) => {
          console.log('Sheet onOpenChange called:', open, 'current state:', mobileMenuOpen);
          setMobileMenuOpen(open);
        }}
        modal={true}
      >
        <SheetContent 
          side="right" 
          className="w-64 p-0 z-[9999]" 
          dir="rtl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>القائمة</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full bg-white">
            <DashboardSidebarContent onNavigate={() => {
              console.log('Closing menu from navigation');
              setMobileMenuOpen(false);
            }} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

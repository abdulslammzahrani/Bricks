import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Handshake
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import type { User, BuyerPreference, Property, Match, ContactRequest } from "@shared/schema";

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

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState("جدة");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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

  const isLoading = statsLoading || usersLoading || prefsLoading || propsLoading;

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsers();
    refetchProperties();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = searchQuery === "" ||
      prop.city.includes(searchQuery) ||
      prop.district.includes(searchQuery);
    const matchesFilter = propertyFilter === "all" || 
      (propertyFilter === "active" && prop.isActive) ||
      (propertyFilter === "inactive" && !prop.isActive) ||
      prop.propertyType === propertyFilter;
    return matchesSearch && matchesFilter;
  });

  const buyers = users.filter(u => u.role === "buyer");
  const sellers = users.filter(u => u.role === "seller");
  const activeProperties = properties.filter(p => p.isActive);
  const activePreferences = preferences.filter(p => p.isActive);

  const recentActivity = [
    ...preferences.slice(0, 5).map(p => ({ type: "preference" as const, data: p, date: new Date() })),
    ...properties.slice(0, 5).map(p => ({ type: "property" as const, data: p, date: new Date() })),
  ].slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-admin-title">لوحة التحكم</h1>
              <p className="text-muted-foreground">إدارة شاملة للمنصة</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleRefreshAll} data-testid="button-refresh">
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card data-testid="card-stat-buyers">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
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
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Building2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
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
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Home className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">{activeProperties.length} نشط</span>
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

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <BarChart3 className="ml-2 h-4 w-4" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="ml-2 h-4 w-4" />
                المستخدمين
              </TabsTrigger>
              <TabsTrigger value="preferences" data-testid="tab-preferences">
                <ClipboardList className="ml-2 h-4 w-4" />
                الرغبات
              </TabsTrigger>
              <TabsTrigger value="properties" data-testid="tab-properties">
                <Building2 className="ml-2 h-4 w-4" />
                العقارات
              </TabsTrigger>
              <TabsTrigger value="matches" data-testid="tab-matches">
                <Handshake className="ml-2 h-4 w-4" />
                المطابقات
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <TrendingUp className="ml-2 h-4 w-4" />
                التحليلات
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
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
                        {properties.slice(0, 5).map((prop, idx) => (
                          <div key={prop.id} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                            <div className="p-2 rounded-full bg-green-500/10">
                              <Home className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">عقار جديد - {prop.district}</p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(prop.price)} ريال</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            data={demandByType.map((d) => ({
                              name: propertyTypeLabels[d.propertyType] || d.propertyType,
                              value: d.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
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

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      أكثر الأحياء طلباً
                    </CardTitle>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="جدة">جدة</SelectItem>
                        <SelectItem value="الرياض">الرياض</SelectItem>
                        <SelectItem value="مكة المكرمة">مكة</SelectItem>
                        <SelectItem value="الدمام">الدمام</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {topDistricts && topDistricts.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topDistricts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="district" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle>إدارة المستخدمين</CardTitle>
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
                            <div className="col-span-2 text-sm" dir="ltr">{user.phone}</div>
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
                                        <span dir="ltr">{user.phone}</span>
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
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
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
                                      <span className="flex items-center gap-1" dir="ltr">
                                        <Phone className="h-3 w-3" />
                                        {user.phone}
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
                                      {pref.budgetMin ? formatCurrency(pref.budgetMin) : "0"} - {pref.budgetMax ? formatCurrency(pref.budgetMax) : "غير محدد"} ريال
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
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-4">
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
                                      <span className="flex items-center gap-1" dir="ltr">
                                        <Phone className="h-3 w-3" />
                                        {seller.phone}
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
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="space-y-4">
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
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

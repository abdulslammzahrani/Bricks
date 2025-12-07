import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building2, 
  ClipboardList, 
  TrendingUp,
  MapPin,
  Wallet,
  Home,
  Filter,
  RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState("جدة");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ["/api/admin/preferences"],
  });

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: topDistricts } = useQuery({
    queryKey: ["/api/admin/analytics/top-districts", selectedCity],
  });

  const { data: budgetByCity } = useQuery({
    queryKey: ["/api/admin/analytics/budget-by-city"],
  });

  const { data: demandByType } = useQuery({
    queryKey: ["/api/admin/analytics/demand-by-type"],
  });

  const isLoading = statsLoading || usersLoading || prefsLoading || propsLoading;

  const propertyTypeLabels: Record<string, string> = {
    apartment: "شقة",
    villa: "فيلا",
    building: "عمارة",
    land: "أرض",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-admin-title">لوحة التحكم</h1>
              <p className="text-muted-foreground">إدارة المنصة وعرض التقارير</p>
            </div>
            <Button variant="outline" onClick={() => refetchStats()} data-testid="button-refresh">
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card data-testid="card-stat-buyers">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المشترين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBuyers || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-sellers">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">البائعين</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-properties">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">العقارات</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-preferences">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">الرغبات النشطة</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPreferences || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <TrendingUp className="ml-2 h-4 w-4" />
                التحليلات
              </TabsTrigger>
              <TabsTrigger value="buyers" data-testid="tab-buyers">
                <Users className="ml-2 h-4 w-4" />
                المشترين
              </TabsTrigger>
              <TabsTrigger value="properties" data-testid="tab-properties">
                <Building2 className="ml-2 h-4 w-4" />
                العقارات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-top-districts">
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
                        لا توجد بيانات كافية
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-demand-by-type">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      الطلب حسب نوع العقار
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {demandByType && demandByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={demandByType.map((d: any) => ({
                              name: propertyTypeLabels[d.propertyType] || d.propertyType,
                              value: d.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {demandByType.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات كافية
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2" data-testid="card-budget-by-city">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      متوسط الميزانيات حسب المدينة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {budgetByCity && budgetByCity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={budgetByCity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" />
                          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`} />
                          <Tooltip formatter={(value: number) => `${value.toLocaleString()} ريال`} />
                          <Bar dataKey="avgBudget" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات كافية
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="buyers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>رغبات المشترين</CardTitle>
                </CardHeader>
                <CardContent>
                  {preferences && preferences.length > 0 ? (
                    <div className="space-y-4">
                      {preferences.map((pref: any) => (
                        <Card key={pref.id} className="p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary">{pref.city}</Badge>
                                <Badge variant="outline">{propertyTypeLabels[pref.propertyType] || pref.propertyType}</Badge>
                                {pref.purpose && <Badge variant="outline">{pref.purpose === "residence" ? "سكن" : "استثمار"}</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {pref.districts && pref.districts.length > 0 && (
                                  <span>الأحياء: {pref.districts.join("، ")}</span>
                                )}
                              </div>
                              {pref.budgetMin && pref.budgetMax && (
                                <div className="text-sm">
                                  الميزانية: {pref.budgetMin.toLocaleString()} - {pref.budgetMax.toLocaleString()} ريال
                                </div>
                              )}
                            </div>
                            <Badge className={pref.isActive ? "bg-primary" : "bg-muted"}>
                              {pref.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد رغبات مسجلة بعد
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>العقارات المعروضة</CardTitle>
                </CardHeader>
                <CardContent>
                  {properties && properties.length > 0 ? (
                    <div className="space-y-4">
                      {properties.map((prop: any) => (
                        <Card key={prop.id} className="p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary">{prop.city}</Badge>
                                <Badge variant="outline">{prop.district}</Badge>
                                <Badge variant="outline">{propertyTypeLabels[prop.propertyType] || prop.propertyType}</Badge>
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {prop.price?.toLocaleString()} ريال
                              </div>
                              {prop.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{prop.description}</p>
                              )}
                              <div className="text-xs text-muted-foreground">
                                المشاهدات: {prop.viewsCount || 0}
                              </div>
                            </div>
                            <Badge className={prop.isActive ? "bg-primary" : "bg-muted"}>
                              {prop.status === "ready" ? "جاهز" : "تحت الإنشاء"}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد عقارات معروضة بعد
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

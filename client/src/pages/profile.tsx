import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Home, Building2, Heart, Phone, Mail, User, LogOut, ArrowRight, Eye, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

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

  const { data: preferences } = useQuery({
    queryKey: ["/api/buyers", userData?.id, "preferences"],
    enabled: isLoggedIn && userData?.role === "buyer",
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/sellers", userData?.id, "properties"],
    enabled: isLoggedIn && userData?.role === "seller",
  });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
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
          {/* User Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Badge variant={userData?.role === "buyer" ? "default" : "secondary"} className="gap-1">
                  {userData?.role === "buyer" ? (
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
                {userData?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{userData?.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content based on role */}
          {userData?.role === "buyer" ? (
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
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{pref.propertyType === "apartment" ? "شقة" : pref.propertyType === "villa" ? "فيلا" : pref.propertyType}</Badge>
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {pref.city}
                          </Badge>
                          {pref.districts?.map((d: string, i: number) => (
                            <Badge key={i} variant="outline">{d}</Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          الميزانية: {pref.budgetMin?.toLocaleString()} - {pref.budgetMax?.toLocaleString()} ريال
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">لا توجد رغبات مسجلة</p>
                    <Link href="/">
                      <Button className="mt-4">سجل رغبتك الآن</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                عقاراتي
              </h2>
              
              {properties && Array.isArray(properties) && properties.length > 0 ? (
                <div className="grid gap-4">
                  {properties.map((prop: any) => (
                    <Card key={prop.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{prop.propertyType === "apartment" ? "شقة" : prop.propertyType === "villa" ? "فيلا" : prop.propertyType}</Badge>
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {prop.city} - {prop.district}
                          </Badge>
                          <Badge variant={prop.isActive ? "default" : "secondary"}>
                            {prop.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {prop.price?.toLocaleString()} ريال
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {prop.views || 0} مشاهدة
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">لا توجد عقارات مسجلة</p>
                    <Link href="/">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">أضف عقارك الآن</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

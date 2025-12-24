import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { User, Home, Bell, Settings, LogOut, Lock, Building2, MapPin, Wallet, Clock, AlertTriangle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  requiresPasswordReset: boolean;
}

interface BuyerPreference {
  id: string;
  city: string;
  districts: string[];
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  paymentMethod: string | null;
  isActive: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const preferencesQuery = useQuery<BuyerPreference[]>({
    queryKey: ["/api/buyers", user?.id, "preferences"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/buyers/${user.id}/preferences`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("فشل تسجيل الخروج");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const formatBudget = (amount: number | null) => {
    if (!amount) return "غير محدد";
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} مليون ريال`;
    }
    return `${(amount / 1000).toFixed(0)} ألف ريال`;
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: "شقة",
      villa: "فيلا",
      land: "أرض",
      building: "عمارة",
      duplex: "دبلكس",
    };
    return types[type] || type;
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
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">بركس</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
            أهلاً {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            هذه صفحتك الخاصة لمتابعة طلباتك والعقارات المناسبة
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card data-testid="card-user-info">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">معلوماتك</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium" data-testid="text-user-name">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">الجوال:</span>
                <span className="font-medium" data-testid="text-user-phone">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">الدور:</span>
                <Badge variant="secondary" data-testid="badge-user-role">
                  {user.role === "buyer" ? "مشتري" : user.role === "seller" ? "بائع" : "مستثمر"}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => setShowPasswordModal(true)}
                data-testid="button-change-password"
              >
                <Lock className="h-4 w-4 ml-2" />
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2" data-testid="card-preferences">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-lg">طلباتك</CardTitle>
                <CardDescription>العقارات التي تبحث عنها</CardDescription>
              </div>
              <Home className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {preferencesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : preferencesQuery.data && preferencesQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {preferencesQuery.data.map((pref) => (
                    <div 
                      key={pref.id} 
                      className="border rounded-md p-4 space-y-3"
                      data-testid={`preference-${pref.id}`}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge>{getPropertyTypeLabel(pref.propertyType)}</Badge>
                          {pref.isActive ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">نشط</Badge>
                          ) : (
                            <Badge variant="secondary">متوقف</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{pref.city}</span>
                          {pref.districts.length > 0 && (
                            <span className="text-muted-foreground">({pref.districts.join("، ")})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {pref.budgetMin && pref.budgetMax 
                              ? `من ${formatBudget(pref.budgetMin)} إلى ${formatBudget(pref.budgetMax)}`
                              : pref.budgetMax 
                                ? `حتى ${formatBudget(pref.budgetMax)}`
                                : "غير محدد"}
                          </span>
                        </div>
                        {pref.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{pref.paymentMethod === "cash" ? "كاش" : "تمويل بنكي"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد طلبات بعد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6" data-testid="card-matches">
          <CardHeader>
            <CardTitle>العقارات المطابقة</CardTitle>
            <CardDescription>عقارات تناسب متطلباتك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">نبحث لك عن عقارات مناسبة</p>
              <p className="text-sm">سنرسل لك إشعار عند توفر عقارات تطابق متطلباتك</p>
            </div>
          </CardContent>
        </Card>
      </main>

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
    </div>
  );
}

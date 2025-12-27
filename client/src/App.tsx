import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SellerFormPage from "@/pages/seller-form";
import AdminDashboard from "@/pages/admin";
import ProfilePage from "@/pages/profile";
import InvestorPage from "@/pages/investor";
import PropertyPage from "@/pages/property";
import PropertyEditPage from "@/pages/property-edit";
import StaticPageView from "@/pages/static-page";
import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import SetupPasswordPage from "@/pages/setup-password";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import RegisterPage from "@/pages/register";
import OfferPage from "@/pages/offer";
import MarketerDashboard from "@/pages/marketer-dashboard";

/**
 * Router Component - تعريف جميع الـ Routes في التطبيق
 * 
 * 📍 للبحث عن صفحة معينة:
 * 1. ابحث عن path="/اسم_الصفحة" في هذا الملف
 * 2. ثم افتح الملف المحدد في component={...}
 * 
 * 📚 راجع PAGES_MAP.md و QUICK_REFERENCE.md لمزيد من التفاصيل
 */
function Router() {
  return (
    <Switch>
      {/* الصفحة الرئيسية - ملف: pages/home.tsx */}
      <Route path="/" component={Home} />
      
      {/* صفحات المصادقة - ملفات: pages/login.tsx, register.tsx, etc. */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/setup-password" component={SetupPasswordPage} />
      
      {/* صفحات النماذج - ملفات: pages/seller-form.tsx, investor.tsx */}
      <Route path="/seller-form" component={SellerFormPage} />
      <Route path="/investor" component={InvestorPage} />
      
      {/* لوحة التحكم الإدارية - ملف: pages/admin.tsx (ملف كبير ~9000 سطر) */}
      {/* 📍 للبحث عن قسم معين: ابحث عن activeSection === "اسم_القسم" */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* صفحات المستخدم - ملفات: pages/profile.tsx, dashboard.tsx */}
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* صفحة عرض العقار (Landing Page) - ملف: pages/offer.tsx */}
      {/* 📍 للبحث عن نموذج التقاط العملاء: ابحث عن LeadCaptureForm أو FormRenderer */}
      <Route path="/offer/:slug" component={OfferPage} />
      
      {/* لوحة تحكم المسوق - ملف: pages/marketer-dashboard.tsx */}
      <Route path="/marketer-dashboard" component={MarketerDashboard} />
      
      {/* صفحات العقارات - ملفات: pages/property.tsx, property-edit.tsx */}
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/property/:id/edit" component={PropertyEditPage} />
      
      {/* الصفحات الثابتة - ملف: pages/static-page.tsx */}
      {/* 📍 تستخدم نفس المكون مع slug مختلف */}
      <Route path="/faq" component={StaticPageView} />
      <Route path="/privacy" component={StaticPageView} />
      <Route path="/terms" component={StaticPageView} />
      
      {/* صفحة 404 - ملف: pages/not-found.tsx */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

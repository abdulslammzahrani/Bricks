import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellerPropertyForm from "@/components/SellerPropertyForm";
import { AdvancedSearchForm } from "@/components/AdvancedSearchForm";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SellerFormPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");

  const handleBuyerSubmit = (data: any) => {
    console.log("تم استلام بيانات البحث:", data);
    toast({
      title: "تم استلام طلبك بنجاح!",
      description: "جاري البحث عن العقارات المطابقة لمواصفاتك وسنتواصل معك قريباً.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">

          {/* --- أزرار التبديل --- */}
          <div className="flex flex-col items-center mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 font-sans">
              {activeTab === "seller" ? "اعرض عقارك للبيع" : "ابحث عن عقارك"}
            </h1>
            <p className="text-slate-500 text-center max-w-lg font-sans">
              {activeTab === "seller" 
                ? "سجل بيانات عقارك وسنوصله للمشترين المناسبين بكل سهولة"
                : "حدد مواصفات العقار الذي تبحث عنه وسنساعدك في إيجاده"
              }
            </p>

            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 inline-flex items-center gap-1">
              <Button
                onClick={() => setActiveTab("buyer")}
                variant={activeTab === "buyer" ? "default" : "ghost"}
                className={`w-32 h-10 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "buyer" ? "shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users className="ml-2 h-4 w-4" />
                مشتري
              </Button>

              <Button
                onClick={() => setActiveTab("seller")}
                variant={activeTab === "seller" ? "default" : "ghost"}
                className={`w-32 h-10 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "seller" ? "shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Building2 className="ml-2 h-4 w-4" />
                بائع
              </Button>
            </div>
          </div>

          {/* --- منطقة النماذج الموحدة --- */}
          {/* تم وضع الإطار هنا ليشمل النموذجين معاً ويضمن نفس المقاسات */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[600px] relative overflow-hidden">
            <div className="transition-all duration-300 ease-in-out h-full">
              {activeTab === "seller" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <SellerPropertyForm />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <AdvancedSearchForm 
                    onSearch={handleBuyerSubmit} 
                    onSwitchToChat={() => {}} 
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
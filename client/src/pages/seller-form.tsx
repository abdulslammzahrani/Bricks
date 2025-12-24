import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SellerPropertyForm from "@/components/SellerPropertyForm";

export default function SellerFormPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 font-sans">
              اعرض عقارك للبيع
            </h1>
            <p className="text-slate-500 text-center max-w-lg font-sans">
              سجل بيانات عقارك وسنوصله للمشترين المناسبين بكل سهولة
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[600px] relative overflow-hidden">
            <SellerPropertyForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
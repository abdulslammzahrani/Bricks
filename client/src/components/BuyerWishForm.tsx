import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, User, Home, Wallet, 
  Check, Phone, Mail, Building2, 
  DollarSign, Send, MessageCircle
} from "lucide-react";

// بيانات الخيارات الثابتة
const cities = ["جدة", "الرياض", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر"];
const jeddahDistricts = ["الحمراء", "الروضة", "الزهراء", "السليمانية", "النسيم", "البوادي", "المروة", "الصفا", "الفيصلية"];

interface BuyerFormData {
  name: string;
  phone: string;
  email: string;
  transactionType: "sale" | "rent"; // تمت الإضافة
  city: string;
  districts: string[];
  propertyType: string;
  rooms: string;
  area: string;
  budgetMin: string;
  budgetMax: string;
  paymentMethod: "cash" | "bank" | "";
  purpose: "residence" | "investment" | "";
}

export default memo(function BuyerWishForm() {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [consultantMessage, setConsultantMessage] = useState("");

  const [data, setData] = useState<BuyerFormData>({
    name: "",
    phone: "",
    email: "",
    transactionType: "sale", // القيمة الافتراضية
    city: "جدة",
    districts: [],
    propertyType: "",
    rooms: "",
    area: "",
    budgetMin: "",
    budgetMax: "",
    paymentMethod: "",
    purpose: "",
  });

  const totalCards = 4;

  // تعريف البطاقات وألوانها (الأخضر للمشتري)
  const cards = [
    { id: 0, icon: User, title: "معلوماتك الشخصية", color: "bg-emerald-500", lightColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    { id: 1, icon: MapPin, title: "الموقع المفضل", color: "bg-teal-500", lightColor: "bg-teal-100 dark:bg-teal-900/40" },
    { id: 2, icon: Home, title: "مواصفات العقار", color: "bg-green-500", lightColor: "bg-green-100 dark:bg-green-900/40" },
    { id: 3, icon: Wallet, title: "الميزانية والغرض", color: "bg-lime-500", lightColor: "bg-lime-100 dark:bg-lime-900/40" },
  ];

  const goNext = () => {
    if (activeCard < totalCards - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveCard(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goBack = (index: number) => {
    if (index < activeCard && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveCard(index);
        setIsAnimating(false);
      }, 100);
    }
  };

  const handleSubmit = () => {
    console.log("Buyer Form Submitted:", data);
    toast({
      title: "تم تسجيل رغبتك بنجاح!",
      description: `شكراً ${data.name.split(" ")[0]}، سنبحث لك عن ${data.propertyType} (${data.transactionType === 'sale' ? 'شراء' : 'إيجار'}) في ${data.city}`,
    });
  };

  const canProceed = () => {
    switch (activeCard) {
      case 0: return data.name.trim() !== "" && data.phone.trim() !== "";
      case 1: return data.city !== "";
      case 2: return data.propertyType !== "";
      case 3: return data.budgetMax !== "" && data.purpose !== "";
      default: return true;
    }
  };

  const toggleDistrict = (district: string) => {
    setData(d => ({
      ...d,
      districts: d.districts.includes(district) 
        ? d.districts.filter(x => x !== district) 
        : [...d.districts, district]
    }));
  };

  // حساب نسبة الاكتمال
  const matchIndexScore = (() => {
    let score = 0;
    if (data.name) score += 10;
    if (data.phone) score += 15;
    if (data.city) score += 10;
    if (data.districts.length > 0) score += 15;
    if (data.propertyType) score += 10;
    if (data.budgetMax) score += 20;
    if (data.paymentMethod) score += 10;
    if (data.purpose) score += 10;
    return Math.min(100, score);
  })();

  // ==================== RENDER ====================
  return (
    <>
    {/* ==================== DESKTOP VERSION ==================== */}
    <div className="hidden md:block p-6">
      {/* مؤشر الجدية */}
      {activeCard >= 1 && (
        <div className="mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">مؤشر اكتمال الطلب</span>
            <span className="text-sm font-bold text-emerald-600">{matchIndexScore}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${matchIndexScore}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative max-w-lg mx-auto" style={{ minHeight: "450px" }}>
        {/* البطاقات المكتملة */}
        {cards.slice(0, activeCard).map((card, idx) => (
          <div
            key={card.id}
            onClick={() => goBack(card.id)}
            className="absolute inset-x-0 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{ top: `${idx * 44}px`, zIndex: idx + 1 }}
          >
            <div className={`${card.lightColor} rounded-2xl p-4 flex items-center gap-4 border-2 border-emerald-500/30 shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center shadow-md`}>
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-bold truncate flex-1">{card.title}</span>
              <span className="text-xs text-emerald-600 font-medium">تعديل</span>
            </div>
          </div>
        ))}

        {/* البطاقة النشطة */}
        <div
          className={`absolute inset-x-0 transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 44}px`, zIndex: 10 }}
        >
          <div className="bg-card border-2 rounded-2xl shadow-lg">
            {/* رأس البطاقة */}
            <div className="flex items-center gap-4 p-5 border-b">
              <div className={`w-12 h-12 rounded-xl ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-6 h-6 text-emerald-600" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{cards[activeCard].title}</h3>
                <p className="text-xs text-muted-foreground">الخطوة {activeCard + 1} من {totalCards}</p>
              </div>
            </div>

            {/* محتوى البطاقة */}
            <div className="p-5">
              {/* الخطوة 0: البيانات الشخصية - ديسكتوب */}
              {activeCard === 0 && (
                <div className="space-y-4">
                  {/* أزرار نوع العملية */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { v: "sale", l: "شراء" },
                      { v: "rent", l: "إيجار" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          data.transactionType === t.v 
                            ? "border-emerald-500 bg-emerald-50 font-bold text-emerald-700" 
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">الاسم</label>
                      <Input value={data.name} onChange={e => setData(d => ({...d, name: e.target.value}))} className="h-12 text-center rounded-xl" placeholder="اسمك الكريم" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">الجوال</label>
                      <Input value={data.phone} onChange={e => setData(d => ({...d, phone: e.target.value}))} className="h-12 text-center rounded-xl" placeholder="05xxxxxxxx" dir="ltr" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">البريد الإلكتروني (اختياري)</label>
                    <Input value={data.email} onChange={e => setData(d => ({...d, email: e.target.value}))} className="h-12 text-center rounded-xl" placeholder="name@example.com" dir="ltr" type="email" />
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-emerald-500 hover:bg-emerald-600">التالي</Button>
                </div>
              )}

              {/* الخطوة 1: الموقع */}
              {activeCard === 1 && (
                <div className="space-y-4">
                  <label className="text-sm font-medium mb-2 block text-center">المدينة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => setData(d => ({...d, city}))}
                        className={`py-2 px-2 rounded-lg border text-sm transition-all ${data.city === city ? "bg-emerald-500 text-white border-emerald-500" : "hover:border-emerald-500/50"}`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  {data.city === "جدة" && (
                    <div className="mt-4">
                       <label className="text-sm font-medium mb-2 block text-center">الأحياء المفضلة</label>
                       <div className="flex flex-wrap gap-2 justify-center max-h-[120px] overflow-y-auto">
                         {jeddahDistricts.map(dist => (
                           <button
                             key={dist}
                             onClick={() => toggleDistrict(dist)}
                             className={`px-3 py-1.5 rounded-full border text-xs transition-all ${data.districts.includes(dist) ? "bg-emerald-100 text-emerald-700 border-emerald-500 font-bold" : "border-border text-muted-foreground"}`}
                           >
                             {dist}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-emerald-500 hover:bg-emerald-600 mt-4">التالي</Button>
                </div>
              )}

              {/* الخطوة 2: مواصفات العقار */}
              {activeCard === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "apartment", l: "شقة", i: Building2 },
                      { v: "villa", l: "فيلا", i: Home },
                      { v: "land", l: "أرض", i: MapPin },
                      { v: "building", l: "عمارة", i: Building2 },
                    ].map(type => (
                      <button
                        key={type.v}
                        onClick={() => setData(d => ({...d, propertyType: type.v}))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${data.propertyType === type.v ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-border"}`}
                      >
                         <type.i className={`h-6 w-6 mx-auto mb-1 ${data.propertyType === type.v ? "text-emerald-600" : "text-muted-foreground"}`} />
                         <span className="text-sm font-medium">{type.l}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-medium mb-1 block text-center">الغرف</label>
                       <select 
                         className="w-full h-10 rounded-lg border bg-background text-center text-sm"
                         value={data.rooms}
                         onChange={e => setData(d => ({...d, rooms: e.target.value}))}
                       >
                         <option value="">اختر</option>
                         {["1","2","3","4","5+"].map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-medium mb-1 block text-center">المساحة (م²)</label>
                       <Input type="number" value={data.area} onChange={e => setData(d => ({...d, area: e.target.value}))} className="h-10 text-center text-sm" placeholder="مثال: 200" />
                     </div>
                  </div>
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base bg-emerald-500 hover:bg-emerald-600">التالي</Button>
                </div>
              )}

              {/* الخطوة 3: الميزانية والغرض */}
              {activeCard === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-medium mb-1 block text-center">أقل سعر</label>
                       <Input type="number" value={data.budgetMin} onChange={e => setData(d => ({...d, budgetMin: e.target.value}))} className="h-10 text-center" placeholder="500,000" />
                     </div>
                     <div>
                       <label className="text-xs font-medium mb-1 block text-center">أعلى سعر</label>
                       <Input type="number" value={data.budgetMax} onChange={e => setData(d => ({...d, budgetMax: e.target.value}))} className="h-10 text-center font-bold" placeholder="1,000,000" />
                     </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    {[{v:"residence", l:"سكن"}, {v:"investment", l:"استثمار"}].map(p => (
                       <button
                         key={p.v}
                         onClick={() => setData(d => ({...d, purpose: p.v as any}))}
                         className={`px-4 py-2 rounded-lg border text-sm ${data.purpose === p.v ? "bg-emerald-500 text-white border-emerald-500" : "border-border"}`}
                       >
                         {p.l}
                       </button>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    {[{v:"cash", l:"كاش", i:DollarSign}, {v:"bank", l:"تمويل", i:Home}].map(p => (
                       <button
                         key={p.v}
                         onClick={() => setData(d => ({...d, paymentMethod: p.v as any}))}
                         className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${data.paymentMethod === p.v ? "bg-emerald-100 text-emerald-800 border-emerald-500 font-bold" : "border-border"}`}
                       >
                         <p.i className="w-4 h-4" />
                         {p.l}
                       </button>
                    ))}
                  </div>

                  <Button onClick={handleSubmit} disabled={!canProceed()} className="w-full h-12 rounded-xl text-base gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                    <Check className="h-5 w-5" />
                    تأكيد الطلب
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* معاينة البطاقات القادمة */}
        {cards.slice(activeCard + 1).map((card, idx) => {
           const Icon = card.icon;
           return (
             <div
               key={card.id}
               className="absolute inset-x-2 pointer-events-none"
               style={{
                 top: `${(activeCard * 44) + 360 + (idx * 24)}px`,
                 zIndex: -idx - 1,
                 opacity: 0.5 - (idx * 0.15),
               }}
             >
               <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-3 border border-border/40">
                 <div className={`w-9 h-9 rounded-lg ${card.lightColor} flex items-center justify-center opacity-70`}>
                   <Icon className="w-5 h-5 text-muted-foreground" />
                 </div>
                 <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
               </div>
             </div>
           );
         })}
      </div>

      {/* المحادثة مع المستشار - سطح المكتب */}
      <div className="mt-10 pt-6 border-t border-dashed max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">هل تحتاج مساعدة في تحديد طلبك؟</span>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 border rounded-full px-4 py-2.5">
          <Button size="icon" className="rounded-full h-9 w-9 bg-emerald-500 hover:bg-emerald-600">
            <Send className="h-4 w-4" />
          </Button>
          <input 
            type="text" 
            dir="rtl" 
            placeholder="تحدث مع مستشار المشتريات..." 
            className="flex-1 bg-transparent border-0 outline-none text-sm px-2"
          />
        </div>
      </div>
    </div>

    {/* ==================== MOBILE VERSION ==================== */}
    <div className="md:hidden relative px-3 py-3">
      {/* مؤشر الجدية - جوال */}
      {activeCard >= 1 && (
        <div className="mb-2 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">اكتمال الطلب</span>
            <span className="text-xs font-bold text-emerald-600">{matchIndexScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${matchIndexScore}%` }} />
          </div>
        </div>
      )}

      <div className="relative pb-2" style={{ minHeight: `${(activeCard * 28) + 260}px` }}>
        {/* البطاقات المكتملة */}
        {cards.slice(0, activeCard).map((card, idx) => (
          <div
            key={card.id}
            onClick={() => goBack(card.id)}
            className="absolute inset-x-0 cursor-pointer transition-all duration-200"
            style={{ top: `${idx * 28}px`, zIndex: idx + 1 }}
          >
            <div className={`${card.lightColor} rounded-xl p-2.5 flex items-center gap-2 border border-emerald-500/20`}>
              <div className={`w-7 h-7 rounded-lg ${card.color} flex items-center justify-center`}>
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium truncate flex-1">{card.title}</span>
            </div>
          </div>
        ))}

        {/* البطاقة النشطة */}
        <div
          className={`absolute inset-x-0 transition-all duration-200 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ top: `${activeCard * 28}px`, zIndex: 10 }}
        >
          <div className="bg-card border rounded-xl shadow-md">
            <div className="flex items-center gap-3 p-3 border-b">
              <div className={`w-9 h-9 rounded-xl ${cards[activeCard].lightColor} flex items-center justify-center`}>
                {(() => { const Icon = cards[activeCard].icon; return <Icon className="w-5 h-5 text-emerald-600" />; })()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{cards[activeCard].title}</h3>
              </div>
              <span className="text-xl font-bold text-muted-foreground/30">{activeCard + 1}</span>
            </div>

            <div className="p-3">
              {/* محتوى الجوال - خطوة 0 */}
              {activeCard === 0 && (
                <div className="space-y-2">
                  {/* أزرار نوع العملية - جوال (إضافة جديدة) */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { v: "sale", l: "شراء" },
                      { v: "rent", l: "إيجار" }
                    ].map(t => (
                      <button
                        key={t.v}
                        onClick={() => setData(d => ({ ...d, transactionType: t.v as "sale" | "rent" }))}
                        className={`p-2 rounded-lg border text-center text-xs font-bold transition-all ${
                          data.transactionType === t.v 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>

                  <Input value={data.name} onChange={e => setData(d => ({...d, name: e.target.value}))} className="h-10 text-sm text-center" placeholder="الاسم" />
                  <Input value={data.phone} onChange={e => setData(d => ({...d, phone: e.target.value}))} className="h-10 text-sm text-center" placeholder="الجوال" type="tel" dir="ltr" />
                  <div className="pb-12" />
                </div>
              )}
              {activeCard === 0 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                  <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-600 shadow-lg">التالي</Button>
                </div>
              )}

              {/* محتوى الجوال - خطوة 1 */}
              {activeCard === 1 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {cities.map(city => (
                      <button key={city} onClick={() => setData(d => ({...d, city}))} className={`py-1.5 px-1 rounded-lg border text-[10px] ${data.city === city ? "bg-emerald-500 text-white" : ""}`}>{city}</button>
                    ))}
                  </div>
                  {data.city === "جدة" && (
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                       {jeddahDistricts.map(dist => (
                         <button key={dist} onClick={() => toggleDistrict(dist)} className={`px-2 py-1 rounded-full border text-[10px] ${data.districts.includes(dist) ? "bg-emerald-100 text-emerald-700 border-emerald-500" : ""}`}>{dist}</button>
                       ))}
                    </div>
                  )}
                  <div className="pb-12" />
                </div>
              )}
              {activeCard === 1 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                   <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-600 shadow-lg">التالي</Button>
                </div>
              )}

              {/* محتوى الجوال - خطوة 2 */}
              {activeCard === 2 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[{v:"apartment",l:"شقة",i:Building2},{v:"villa",l:"فيلا",i:Home},{v:"land",l:"أرض",i:MapPin},{v:"building",l:"عمارة",i:Building2}].map(t => (
                      <button key={t.v} onClick={() => setData(d => ({...d, propertyType: t.v}))} className={`p-2 rounded-lg border text-center ${data.propertyType === t.v ? "bg-emerald-50 border-emerald-500" : ""}`}>
                        <t.i className={`h-4 w-4 mx-auto ${data.propertyType === t.v ? "text-emerald-600" : "text-muted-foreground"}`} />
                        <span className="text-[10px] block mt-1">{t.l}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select className="w-1/3 h-9 text-xs border rounded-lg text-center" value={data.rooms} onChange={e => setData(d => ({...d, rooms: e.target.value}))}>
                      <option value="">غرف</option>
                      {["1","2","3","4","5+"].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <Input type="number" className="w-2/3 h-9 text-xs text-center" placeholder="المساحة" value={data.area} onChange={e => setData(d => ({...d, area: e.target.value}))} />
                  </div>
                  <div className="pb-12" />
                </div>
              )}
              {activeCard === 2 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                   <Button onClick={goNext} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm bg-emerald-500 hover:bg-emerald-600 shadow-lg">التالي</Button>
                </div>
              )}

              {/* محتوى الجوال - خطوة 3 */}
              {activeCard === 3 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input type="number" className="h-9 text-xs text-center" placeholder="أقل سعر" value={data.budgetMin} onChange={e => setData(d => ({...d, budgetMin: e.target.value}))} />
                    <Input type="number" className="h-9 text-xs text-center font-bold" placeholder="أعلى سعر" value={data.budgetMax} onChange={e => setData(d => ({...d, budgetMax: e.target.value}))} />
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[{v:"residence", l:"سكن"}, {v:"investment", l:"استثمار"}].map(p => (
                       <button key={p.v} onClick={() => setData(d => ({...d, purpose: p.v as any}))} className={`px-3 py-1.5 rounded-lg border text-xs ${data.purpose === p.v ? "bg-emerald-500 text-white" : ""}`}>{p.l}</button>
                    ))}
                  </div>
                  <div className="pb-12" />
                </div>
              )}
              {activeCard === 3 && (
                <div className="fixed bottom-4 left-3 right-3 z-50">
                   <Button onClick={handleSubmit} disabled={!canProceed()} className="w-full h-10 rounded-xl text-sm gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                     <Check className="h-4 w-4" />
                     تأكيد الطلب
                   </Button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* معاينة البطاقات القادمة - جوال */}
        {cards.slice(activeCard + 1).map((card, idx) => {
           const Icon = card.icon;
           return (
             <div
               key={card.id}
               className="absolute inset-x-1 pointer-events-none"
               style={{
                 top: `${(activeCard * 28) + 240 + (idx * 16)}px`,
                 zIndex: -idx - 1,
                 opacity: 0.4 - (idx * 0.15),
               }}
             >
               <div className="bg-muted/50 rounded-xl p-2 flex items-center gap-2 border border-border/30">
                 <div className={`w-7 h-7 rounded-lg ${card.lightColor} flex items-center justify-center opacity-60`}>
                   <Icon className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <span className="text-xs text-muted-foreground">{card.title}</span>
               </div>
             </div>
           );
         })}
      </div>

      {/* المحادثة - جوال */}
      <div className="mt-8 pt-4 border-t border-dashed">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <MessageCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">تحدث مع مستشار المشتريات</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 border rounded-full px-3 py-2">
          <Button size="icon" className="rounded-full h-7 w-7 flex-shrink-0 bg-emerald-500 hover:bg-emerald-600">
            <Send className="h-3.5 w-3.5" />
          </Button>
          <input type="text" dir="rtl" placeholder="اكتب استفسارك..." className="flex-1 bg-transparent border-0 outline-none text-xs px-2" />
        </div>
      </div>
      <div className="pb-4" />
    </div>
    </>
  );
});
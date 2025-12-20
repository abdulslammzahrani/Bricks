import { useEffect, useRef, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  city: string;
  lat: number;
  lng: number;
}

interface SaudiMapProps {
  markers: MapMarker[];
  className?: string;
}

// 🌍 مركز المملكة
const KINGDOM_CENTER = { lat: 23.8859, lng: 45.0792 };
const KINGDOM_ZOOM = 5;

// 🏙️ مراكز المدن
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "الرياض": { lat: 24.7136, lng: 46.6753 },
  "جدة": { lat: 21.5433, lng: 39.1728 },
  "مكة المكرمة": { lat: 21.3891, lng: 39.8579 },
  "المدينة المنورة": { lat: 24.5247, lng: 39.5692 },
  "الدمام": { lat: 26.4207, lng: 50.0888 },
  "الخبر": { lat: 26.2172, lng: 50.1971 },
  "أبها": { lat: 18.2465, lng: 42.5117 },
  "تبوك": { lat: 28.3835, lng: 36.5662 },
};

const CITIES_ORDER = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك"];

// ✅ تصنيف البيانات والألوان (تم تعديل اللون الأخضر ليكون واضحاً جداً)
const DATA_CATEGORIES = {
  request: {
    id: "request",
    label: "طلب عقاري",
    color: "green", // ✅ تم التعديل إلى أخضر صريح
    texts: [
      "مطلوب شقة تمليك", "مطلوب شقة إيجار سنوي", "مطلوب فيلا درج صالة", 
      "مطلوب فيلا درج داخلي", "مطلوب دوبلكس", "مطلوب دور أرضي", 
      "مطلوب دور علوي", "مطلوب استديو", "مطلوب بمدخل مستقل", 
      "مطلوب حي راقي", "مطلوب سكن عمال", "مطلوب محل تجاري", 
      "مطلوب معرض على شارع رئيسي", "مطلوب مكتب إداري", "مطلوب مستودع"
    ]
  },
  offer: {
    id: "offer",
    label: "عرض عقاري",
    color: "orange", // برتقالي
    texts: [
      "شقة للبيع (إفراغ فوري)", "شقة فاخرة للإيجار", "فيلا مودرن للبيع", 
      "فيلا للإيجار", "دوبلكس متصل للبيع", "دور مؤسس شقق", "استديو مفروش",
      "محل للإيجار (موقع مميز)", "معرض تجاري للتقبيل", "مكتب مجهز بالكامل", 
      "مستودع مرخص", "عمارة سكنية تجارية", "فرصة سكنية (سعر مغري)"
    ]
  },
  investment: {
    id: "investment",
    label: "فرصة استثمارية",
    color: "amber", // ذهبي
    texts: [
      "فرصة: أرض خام", "مخطط معتمد للبيع", "عمارة تجارية دخل ممتاز", 
      "أرض استثمارية (ركنية)", "مجمع شقق مؤجر بالكامل", "مركز تجاري للبيع",
      "أرض تطوير عقاري", "شراكة بناء (موقع حيوي)", "فرصة تشغيل فندقي"
    ]
  }
};

const USERS_DB = [
  // رجال (نسبة أكبر)
  { name: "محمد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Ahmed&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "سلطان", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Omar&facialHair=beardLight&skinColor=f5d0c5&backgroundColor=b6e3f4" },
  { name: "فهد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Saud&facialHair=beardMajestic&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "خالد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Khaled&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "فيصل", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Faisal&facialHair=beardLight&skinColor=ffdbb4&backgroundColor=b6e3f4" },
  { name: "عبدالله", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Abdullah&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  // نساء (نسبة أقل)
  { name: "نورة", gender: 'f', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Fatima&top=hijab&clothingColor=262e33&skinColor=edb98a&backgroundColor=ffdfbf" },
  { name: "سارة", gender: 'f', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Aisha&top=hijab&clothingColor=3c4f5c&skinColor=f5d0c5&backgroundColor=ffdfbf" },
  { name: "هند", gender: 'f', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Huda&top=hijab&clothingColor=262e33&skinColor=ffdbb4&backgroundColor=ffdfbf" },
];

export function SaudiMap({ markers, className = "" }: SaudiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const requestTimersRef = useRef<NodeJS.Timeout[]>([]);

  const [displayCity, setDisplayCity] = useState(CITIES_ORDER[0]);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cityIndexRef = useRef(0);

  // ✅ توليد البيانات
  const points = useMemo(() => {
    if (isTransitioning) return [];

    const cityName = displayCity;
    const center = CITY_CENTERS[cityName];
    const generated = [];

    // المخزون الثابت: 10 طلبات، 6 عروض، 2 فرص
    const categoryPool = [
      ...Array(10).fill('request'),
      ...Array(6).fill('offer'),
      ...Array(2).fill('investment')
    ];

    const shuffledCategories = categoryPool.sort(() => Math.random() - 0.5);

    shuffledCategories.forEach((catKey) => {
      // انتشار عشوائي حول المركز
      const spreadFactor = 0.055; 
      const latOffset = (Math.random() - 0.5) * spreadFactor;
      const lngOffset = (Math.random() - 0.5) * spreadFactor;
      const ptLat = center.lat + latOffset;
      const ptLng = center.lng + lngOffset;

      // نسبة الجنس 80% رجال
      const isMale = Math.random() < 0.8; 
      const targetGender = isMale ? 'm' : 'f';
      const validUsers = USERS_DB.filter(u => u.gender === targetGender);
      const user = pickRandom(validUsers);

      const category = DATA_CATEGORIES[catKey as keyof typeof DATA_CATEGORIES];

      generated.push({
        lat: ptLat,
        lng: ptLng,
        ...user,
        category: category,
        request: pickRandom(category.texts),
        delay: Math.random() * 6000 
      });
    });

    return generated;
  }, [displayCity, isTransitioning]);

  const wait = (ms: number) => new Promise(resolve => {
    timerRef.current = setTimeout(resolve, ms);
  });

  useEffect(() => {
    isMountedRef.current = true;
    const runCinematicSequence = async () => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      while (isMountedRef.current) {
        const currentCityName = CITIES_ORDER[cityIndexRef.current];
        const center = CITY_CENTERS[currentCityName];
        setDisplayCity(currentCityName);

        // الدخول
        map.flyTo([center.lat, center.lng], 13, {
          duration: 3, easeLinearity: 0.5
        });
        await wait(3000); 
        if (!isMountedRef.current) break;

        // العرض الحي (تحويم)
        setIsTransitioning(false); 
        map.flyTo([center.lat + 0.005, center.lng + 0.005], 13, {
          duration: 12, easeLinearity: 0.1, noMoveStart: true    
        });

        await wait(12000); 
        if (!isMountedRef.current) break;

        // الخروج
        setIsTransitioning(true); 
        map.flyTo([KINGDOM_CENTER.lat, KINGDOM_CENTER.lng], KINGDOM_ZOOM, {
          duration: 2.5, easeLinearity: 0.5
        });
        await wait(2500);
        if (!isMountedRef.current) break;

        cityIndexRef.current = (cityIndexRef.current + 1) % CITIES_ORDER.length;
      }
    };

    if (mapInstanceRef.current) {
      runCinematicSequence();
    } else {
      setTimeout(runCinematicSequence, 1000);
    }
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [KINGDOM_CENTER.lat, KINGDOM_CENTER.lng],
      zoom: KINGDOM_ZOOM,
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();
    requestTimersRef.current.forEach(clearTimeout);
    requestTimersRef.current = [];

    if (isTransitioning) return;

    points.forEach((pt) => {
      const timeoutId = setTimeout(() => {
        if (!mapInstanceRef.current || isTransitioning) return;

        const color = pt.category.color;
        // ألوان خضراء فاقعة للطلبات (green-500/600)
        const textColor = `text-${color}-600`;
        const bgColor = `bg-${color}-500`;
        const rippleColor = `border-${color}-500`; // جعلنا الريبل أغمق ليكون أوضح

        const icon = L.divIcon({
          className: "radar-marker", 
          html: `
            <div class="relative flex flex-col items-center" style="direction: rtl;">
              <div class="animate-message-cycle absolute bottom-[120%] opacity-0 mb-2 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 z-50 min-w-[140px] pointer-events-none">
                <div class="flex items-center justify-end gap-1.5 mb-1">
                   <span class="relative flex h-2.5 w-2.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${bgColor}"></span>
                    </span>
                   <span class="font-bold ${textColor} text-[10px]">${pt.category.label}</span>
                </div>
                <div class="font-bold text-slate-900 text-center text-sm mb-1">${pt.name}</div>
                <div class="text-gray-600 font-medium text-center text-xs border-t border-gray-100 pt-1 leading-relaxed">${pt.request}</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45 -mt-2"></div>
              </div>

              <div class="relative z-10 animate-pop-in">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] pointer-events-none">
                  <div class="absolute inset-0 rounded-full border-2 ${rippleColor} opacity-0 animate-ripple"></div>
                </div>
                <div class="relative transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <img src="${pt.avatar}" class="w-12 h-12 rounded-full border-[3px] border-white shadow-md bg-white object-cover relative z-10" />
                  <span class="absolute bottom-1 right-1 w-3.5 h-3.5 ${bgColor} border-[2px] border-white rounded-full z-20"></span>
                </div>
              </div>
            </div>
          `,
          iconSize: [160, 120],
          iconAnchor: [80, 60],
        });
        L.marker([pt.lat, pt.lng], { icon }).addTo(layer);
      }, pt.delay);
      requestTimersRef.current.push(timeoutId);
    });
  }, [points, isTransitioning]);

  return (
    <>
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; border-width: 3px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
        .animate-ripple { animation: ripple 2.5s infinite ease-out; }

        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes messageCycle {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          90% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.95); pointer-events: none; }
        }
        .animate-message-cycle { animation: messageCycle 3s ease-in-out forwards; }
      `}</style>

      <div className={`relative w-full h-full rounded-lg overflow-hidden bg-slate-50 ${className}`} style={{ minHeight: "400px" }}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200/50 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">حركة السوق الحية</span>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md transition-all duration-500 transform" 
            style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'translateY(-10px)' : 'translateY(0)' }}>
            {displayCity}
          </div>
        </div>
        <div ref={mapRef} className="w-full h-full z-0" data-testid="saudi-map" />
      </div>
    </>
  );
}
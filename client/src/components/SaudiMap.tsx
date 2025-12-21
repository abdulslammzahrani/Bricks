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
const KINGDOM_CENTER = { lat: 24.5000, lng: 44.5000 }; 
const KINGDOM_ZOOM = 5; 

// 🏙️ إعدادات المدن
const CITY_CONFIG: Record<string, { lat: number; lng: number; spread: number }> = {
  "الرياض": { lat: 24.7136, lng: 46.6753, spread: 0.05 }, 
  "جدة": { lat: 21.6200, lng: 39.2200, spread: 0.04 },      
  "مكة المكرمة": { lat: 21.4225, lng: 39.8262, spread: 0.035 },
  "المدينة المنورة": { lat: 24.4672, lng: 39.6100, spread: 0.04 },
  "الدمام": { lat: 26.3900, lng: 50.0800, spread: 0.05 },   
  "الخبر": { lat: 26.2800, lng: 50.1800, spread: 0.035 },    
  "أبها": { lat: 18.2205, lng: 42.5055, spread: 0.03 },
  "تبوك": { lat: 28.3972, lng: 36.5489, spread: 0.04 },
};

const CITIES_ORDER = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك"];

// 🧭 قطاعات المسح الذكي
const SECTORS = [
  { name: "الوسط", dLat: 0, dLng: 0 },
  { name: "شمال", dLat: 0.015, dLng: 0 }, 
  { name: "شرق", dLat: 0, dLng: 0.015 },
  { name: "جنوب", dLat: -0.015, dLng: 0 },
  { name: "غرب", dLat: 0, dLng: -0.015 },
];

const DATA_CATEGORIES = {
  request: {
    id: "request",
    label: "طلب عقاري",
    color: "green",
    texts: ["مطلوب شقة تمليك", "مطلوب فيلا", "مطلوب أرض", "مطلوب دور", "مطلوب بيت شعبي"]
  },
  offer: {
    id: "offer",
    label: "عرض عقاري",
    color: "orange",
    texts: ["فيلا للبيع", "شقة تمليك", "أرض للبيع", "عمارة تجارية", "دوبلكس فاخر"]
  },
  investment: {
    id: "investment",
    label: "فرصة استثمارية",
    color: "amber",
    texts: ["أرض خام", "مخطط معتمد", "فرصة تجارية", "مجمع سكني", "فندق للبيع"]
  }
};

const USERS_DB = [
  { name: "محمد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Ahmed&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "سلطان", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Omar&facialHair=beardLight&skinColor=f5d0c5&backgroundColor=b6e3f4" },
  { name: "فهد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Saud&facialHair=beardMajestic&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "خالد", gender: 'm', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Khaled&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "سارة", gender: 'f', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Aisha&top=hijab&clothingColor=3c4f5c&skinColor=f5d0c5&backgroundColor=ffdfbf" },
  { name: "هند", gender: 'f', avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Huda&top=hijab&clothingColor=262e33&skinColor=ffdbb4&backgroundColor=ffdfbf" },
];

export function SaudiMap({ markers, className = "" }: SaudiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const requestTimersRef = useRef<NodeJS.Timeout[]>([]);

  const [isMapReady, setIsMapReady] = useState(false);
  const [displayLabel, setDisplayLabel] = useState("المملكة العربية السعودية");
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [currentFocusPoint, setCurrentFocusPoint] = useState<{lat: number, lng: number} | null>(null);
  const [currentCityForPoints, setCurrentCityForPoints] = useState<string>("الرياض");

  const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cityIndexRef = useRef(0);

  // توليد النقاط
  const points = useMemo(() => {
    if (isTransitioning || displayLabel === "المملكة العربية السعودية" || !currentFocusPoint) return [];

    const config = CITY_CONFIG[currentCityForPoints];
    if (!config) return [];

    const center = currentFocusPoint; 
    const generated = [];
    const categoryPool = [...Array(5).fill('request'), ...Array(2).fill('offer'), ...Array(1).fill('investment')];
    const shuffledCategories = categoryPool.sort(() => Math.random() - 0.5);

    shuffledCategories.forEach((catKey) => {
      const spreadFactor = 0.025; 
      const latOffset = (Math.random() - 0.5) * spreadFactor;
      const lngOffset = (Math.random() - 0.5) * spreadFactor; 

      const ptLat = center.lat + latOffset;
      const ptLng = center.lng + lngOffset;

      const isMale = Math.random() < 0.8;
      const targetGender = isMale ? 'm' : 'f';
      const validUsers = USERS_DB.filter(u => u.gender === targetGender);
      const user = pickRandom(validUsers);
      const category = DATA_CATEGORIES[catKey as keyof typeof DATA_CATEGORIES];

      generated.push({
        lat: ptLat, lng: ptLng, ...user, category: category,
        request: pickRandom(category.texts), delay: Math.random() * 2000 
      });
    });

    return generated;
  }, [currentFocusPoint, isTransitioning, displayLabel, currentCityForPoints]);

  const wait = (ms: number) => new Promise(resolve => {
    timerRef.current = setTimeout(resolve, ms);
  });

  // 1. السيناريو السينمائي (مصحح)
  useEffect(() => {
    if (!isMapReady) return;

    isMountedRef.current = true;
    const runCinematicSequence = async () => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      await wait(1000); 

      while (isMountedRef.current) {
        const currentCityName = CITIES_ORDER[cityIndexRef.current];
        const cityConfig = CITY_CONFIG[currentCityName];

        // 1. التجهيز للدخول
        setCurrentCityForPoints(currentCityName);
        setDisplayLabel(currentCityName);
        setIsTransitioning(true);
        setCurrentFocusPoint(null); 

        // 2. الطيران للمدينة
        // ✅ نستخدم flyTo للتأكد من الزووم
        map.flyTo([cityConfig.lat, cityConfig.lng], 13, { 
            duration: 3, 
            easeLinearity: 0.2 
        });

        await wait(3200); 
        if (!isMountedRef.current) break;

        // 3. السماح بظهور النقاط
        setIsTransitioning(false);

        // 4. حلقة المناطق (Scanning)
        for (const sector of SECTORS) {
            if (!isMountedRef.current) break;

            setDisplayLabel(`${currentCityName} - ${sector.name}`);

            const newLat = cityConfig.lat + sector.dLat;
            const newLng = cityConfig.lng + sector.dLng;
            const newCenter = { lat: newLat, lng: newLng };

            // ✅✅✅ التصحيح الجذري هنا:
            // استبدلنا panTo بـ flyTo مع تحديد الزووم 13
            // هذا يجبر الخريطة على إصلاح الزووم إذا كان معلقاً في وضع المملكة
            map.flyTo([newLat, newLng], 13, { 
                animate: true, 
                duration: 2.0, // جعلناها أبطأ قليلاً لتكون ناعمة
                easeLinearity: 0.25
            });

            await wait(500); // انتظار بسيط لثبات الكاميرا

            setCurrentFocusPoint(newCenter);

            await wait(4000); 
        }

        if (!isMountedRef.current) break;

        // 5. الخروج (Zoom Out)
        setIsTransitioning(true);
        setCurrentFocusPoint(null); 
        setDisplayLabel("المملكة العربية السعودية");

        map.flyTo([KINGDOM_CENTER.lat, KINGDOM_CENTER.lng], KINGDOM_ZOOM, { 
            duration: 3, 
            easeLinearity: 0.2 
        });
        await wait(3200);

        await wait(500); 

        if (!isMountedRef.current) break;
        cityIndexRef.current = (cityIndexRef.current + 1) % CITIES_ORDER.length;
      }
    };

    runCinematicSequence();

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMapReady]);

  // 2. تهيئة الخريطة
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const southWest = L.latLng(10.0, 30.0); 
    const northEast = L.latLng(35.0, 60.0); 
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(mapRef.current, {
      center: [KINGDOM_CENTER.lat, KINGDOM_CENTER.lng],
      zoom: KINGDOM_ZOOM,
      minZoom: 5, 
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      dragging: false, 
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: 'abcd',
      maxZoom: 20,
      minZoom: 5, 
      bounds: bounds,
      unloadInvisibleTiles: false, 
      updateWhenZooming: false,
      keepBuffer: 200, 
      reuseTiles: true
    });

    tileLayer.on("load", () => {
      console.log("Map tiles fully loaded/cached.");
      setIsMapReady(true);
    });

    tileLayer.addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // 3. رسم النقاط
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;

    layer.eachLayer((marker: any) => {
        if (marker.getElement()) {
            const el = marker.getElement();
            el.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
            el.style.opacity = "0";
            el.style.transform = "scale(0.8)"; 
        }
        setTimeout(() => { try { layer.removeLayer(marker); } catch (e) {} }, 300);
    });

    requestTimersRef.current.forEach(clearTimeout);
    requestTimersRef.current = [];

    if (isTransitioning || !currentFocusPoint) return;

    points.forEach((pt) => {
      const timeoutId = setTimeout(() => {
        if (!mapInstanceRef.current || isTransitioning) return;

        const color = pt.category.color;
        const textColor = `text-${color}-600`;
        const bgColor = `bg-${color}-500`;
        const rippleColor = `border-${color}-500`;

        const icon = L.divIcon({
          className: "radar-marker",
          html: `
            <div class="relative flex flex-col items-center font-sans" style="direction: rtl;">
              <div class="animate-message-cycle absolute bottom-[120%] opacity-0 mb-2 bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 z-50 min-w-[120px] pointer-events-none">
                <div class="flex items-center justify-end gap-1.5 mb-0.5">
                   <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 ${bgColor}"></span>
                    </span>
                   <span class="font-bold ${textColor} text-[9px]">${pt.category.label}</span>
                </div>
                <div class="font-bold text-slate-900 text-center text-xs mb-0.5 font-sans">${pt.name}</div>
                <div class="text-gray-500 font-medium text-center text-[10px] border-t border-gray-50 pt-0.5 leading-relaxed font-sans">${pt.request}</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45 -mt-1.5"></div>
              </div>

              <div class="relative z-10 animate-pop-in">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] pointer-events-none">
                  <div class="absolute inset-0 rounded-full border-2 ${rippleColor} opacity-0 animate-ripple"></div>
                </div>
                <div class="relative transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <img src="${pt.avatar}" class="w-10 h-10 rounded-full border-[2px] border-white shadow-sm bg-white object-cover relative z-10" />
                  <span class="absolute bottom-0.5 right-0.5 w-3 h-3 ${bgColor} border-[2px] border-white rounded-full z-20"></span>
                </div>
              </div>
            </div>
          `,
          iconSize: [140, 100], 
          iconAnchor: [70, 50],
        });
        L.marker([pt.lat, pt.lng], { icon }).addTo(layer);
      }, pt.delay);
      requestTimersRef.current.push(timeoutId);
    });
  }, [points, isTransitioning, currentFocusPoint]);

  return (
    <>
      <style>{`
        .leaflet-pane { will-change: transform; }
        .leaflet-container { background-color: #d4dadc !important; }

        @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.8; border-width: 2px; } 100% { transform: scale(2.0); opacity: 0; border-width: 0px; } }
        .animate-ripple { animation: ripple 2s infinite ease-out; }

        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes messageCycle { 0% { opacity: 0; transform: translateY(5px) scale(0.95); } 10% { opacity: 1; transform: translateY(0) scale(1); } 90% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-5px) scale(0.95); pointer-events: none; } }
        .animate-message-cycle { animation: messageCycle 3s ease-in-out forwards; }
      `}</style>

      <div className={`relative w-full h-full rounded-lg overflow-hidden bg-slate-100 ${className}`} style={{ minHeight: "400px" }}>
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200/50 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 font-sans">حركة السوق الحية</span>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md transition-all duration-500 transform font-sans"
            style={{ opacity: isTransitioning && displayLabel === "المملكة العربية السعودية" ? 0 : 1, transform: isTransitioning && displayLabel === "المملكة العربية السعودية" ? 'translateY(-10px)' : 'translateY(0)' }}>
            {displayLabel}
          </div>
        </div>
        <div ref={mapRef} className="w-full h-full z-0" data-testid="saudi-map" />
      </div>
    </>
  );
}
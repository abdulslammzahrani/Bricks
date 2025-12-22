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

const KINGDOM_CENTER = { lat: 24.5000, lng: 44.5000 }; 
const KINGDOM_ZOOM = 5; 

const CITY_CONFIG: Record<string, { lat: number; lng: number; spread: number }> = {
  "الرياض": { lat: 24.7136, lng: 46.6753, spread: 0.12 },
  "جدة": { lat: 21.5800, lng: 39.1800, spread: 0.10 }, 
  "مكة المكرمة": { lat: 21.4225, lng: 39.8262, spread: 0.08 },
  "المدينة المنورة": { lat: 24.4672, lng: 39.6100, spread: 0.08 },
  "الدمام": { lat: 26.3900, lng: 50.0800, spread: 0.10 },   
  "الخبر": { lat: 26.2800, lng: 50.1800, spread: 0.07 },     
  "أبها": { lat: 18.2205, lng: 42.5055, spread: 0.06 },
  "تبوك": { lat: 28.3972, lng: 36.5489, spread: 0.09 },
};

const CITIES_ORDER = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك"];

const SECTORS = [
  { name: "الوسط", dLat: 0, dLng: 0 },
  { name: "شمال", dLat: 0.08, dLng: 0 },  
  { name: "شرق", dLat: 0, dLng: 0.08 },   
  { name: "جنوب", dLat: -0.08, dLng: 0 }, 
  { name: "غرب", dLat: 0, dLng: -0.08 },  
];

const DATA_CATEGORIES = {
  request: { id: "request", label: "طلب", color: "green", texts: ["فيلا", "أرض", "شقة", "دور"] },
  offer: { id: "offer", label: "عرض", color: "orange", texts: ["فيلا", "شقة", "أرض", "عمارة"] },
  investment: { id: "investment", label: "فرصة", color: "amber", texts: ["أرض خام", "مخطط", "تجاري"] }
};

// ✅ تعديل قاعدة بيانات المستخدمين لتشمل الرجال فقط
const USERS_DB = [
  { name: "محمد", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Ahmed&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "سلطان", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Omar&facialHair=beardLight&skinColor=f5d0c5&backgroundColor=b6e3f4" },
  { name: "فهد", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Saud&facialHair=beardMajestic&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "خالد", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Khaled&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
  { name: "عبدالله", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Abdullah&facialHair=beardLight&skinColor=f5d0c5&backgroundColor=b6e3f4" },
  { name: "منصور", avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=Mansour&facialHair=beardMedium&skinColor=edb98a&backgroundColor=b6e3f4" },
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

  const wait = (ms: number) => new Promise(resolve => {
    timerRef.current = setTimeout(resolve, ms);
  });

  const points = useMemo(() => {
    if (isTransitioning || displayLabel === "المملكة العربية السعودية" || !currentFocusPoint) return [];

    const config = CITY_CONFIG[currentCityForPoints];
    if (!config) return [];

    const center = currentFocusPoint; 
    const generated = [];

    // ✅ عدد النقاط بين 15 و 20
    const minPoints = 15;
    const maxPoints = 20;
    const totalPoints = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;

    const offersCount = Math.floor(totalPoints * 0.20);
    const investmentCount = Math.floor(totalPoints * 0.10);
    const requestsCount = totalPoints - offersCount - investmentCount;

    const categoryPool = [
        ...Array(requestsCount).fill('request'), 
        ...Array(offersCount).fill('offer'), 
        ...Array(investmentCount).fill('investment')
    ];

    const shuffledCategories = categoryPool.sort(() => Math.random() - 0.5);

    shuffledCategories.forEach((catKey) => {
      const spreadFactor = config.spread * 0.9; 
      const latOffset = (Math.random() - 0.5) * spreadFactor;
      const lngOffset = (Math.random() - 0.5) * spreadFactor; 

      const ptLat = center.lat + latOffset;
      const ptLng = center.lng + lngOffset;

      // ✅ تم تعديل المنطق لاختيار الرجال فقط من المصفوفة المحدثة
      const user = pickRandom(USERS_DB);
      const category = DATA_CATEGORIES[catKey as keyof typeof DATA_CATEGORIES];

      generated.push({
        lat: ptLat, lng: ptLng, ...user, category: category,
        request: pickRandom(category.texts), 
        delay: Math.random() * 2000 
      });
    });

    return generated;
  }, [currentFocusPoint, isTransitioning, displayLabel, currentCityForPoints]);

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
        setCurrentCityForPoints(currentCityName);
        setDisplayLabel(currentCityName);
        setIsTransitioning(true);
        setCurrentFocusPoint(null); 
        map.flyTo([cityConfig.lat, cityConfig.lng], 11, { duration: 3, easeLinearity: 0.2 });
        await wait(3500); 
        if (!isMountedRef.current) break;
        setIsTransitioning(false); 

        for (const sector of SECTORS) {
            if (!isMountedRef.current) break;
            setDisplayLabel(`${currentCityName} - ${sector.name}`);
            const newLat = cityConfig.lat + sector.dLat;
            const newLng = cityConfig.lng + sector.dLng;
            const newCenter = { lat: newLat, lng: newLng };
            setIsTransitioning(true);
            setCurrentFocusPoint(null);
            map.flyTo([newLat, newLng], 11, { animate: true, duration: 2.5, easeLinearity: 0.1 });
            await wait(2500); 
            if (!isMountedRef.current) break;
            setIsTransitioning(false);
            setCurrentFocusPoint(newCenter);
            await wait(4500); 
        }

        if (!isMountedRef.current) break;
        setIsTransitioning(true);
        setCurrentFocusPoint(null); 
        setDisplayLabel("المملكة العربية السعودية");
        map.flyTo([KINGDOM_CENTER.lat, KINGDOM_CENTER.lng], KINGDOM_ZOOM, { duration: 3, easeLinearity: 0.2 });
        await wait(3200);
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
      subdomains: 'abcd', maxZoom: 20, minZoom: 5, bounds: bounds, unloadInvisibleTiles: false, updateWhenZooming: false, keepBuffer: 200, reuseTiles: true
    });
    tileLayer.on("load", () => setIsMapReady(true));
    tileLayer.addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    requestTimersRef.current.forEach(clearTimeout);
    requestTimersRef.current = [];
    if (isTransitioning) { layer.clearLayers(); return; }
    if (!currentFocusPoint) return;

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
            <div class="marker-inner-content relative flex flex-col items-center font-sans select-none" style="direction: rtl;">
              <div class="animate-message-cycle absolute bottom-[140%] opacity-0 mb-1 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-md border border-gray-100 z-50 whitespace-nowrap pointer-events-none transform origin-bottom">
                <div class="flex items-center justify-center gap-1 mb-0.5">
                   <span class="relative flex h-1.5 w-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5 ${bgColor}"></span>
                    </span>
                   <span class="font-bold ${textColor} text-[8px]">${pt.category.label}</span>
                </div>
                <div class="font-bold text-slate-800 text-center text-[10px] leading-tight font-sans">${pt.name}</div>
                <div class="text-gray-500 font-medium text-center text-[9px] border-t border-gray-100 pt-0.5 mt-0.5 leading-none font-sans">${pt.request}</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-100 transform rotate-45 -mt-1"></div>
              </div>
              <div class="relative z-10 animate-pop-in">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] pointer-events-none">
                  <div class="absolute inset-0 rounded-full border-[1.5px] ${rippleColor} opacity-0 animate-ripple"></div>
                </div>
                <div class="relative transition-transform duration-300 hover:scale-110">
                  <img src="${pt.avatar}" class="w-8 h-8 rounded-full border-[1.5px] border-white shadow-sm bg-white object-cover relative z-10" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 ${bgColor} border-[1.5px] border-white rounded-full z-20"></span>
                </div>
              </div>
            </div>
          `,
          iconSize: [80, 80], 
          iconAnchor: [40, 40], 
        });
        L.marker([pt.lat, pt.lng], { icon }).addTo(layer);
      }, pt.delay);
      requestTimersRef.current.push(timeoutId);
    });
  }, [points, isTransitioning, currentFocusPoint]);

  return (
    <>
      <style>{`
        .leaflet-marker-icon, .radar-marker { transition: none !important; will-change: auto !important; }
        .marker-inner-content { will-change: opacity; }
        .leaflet-pane { will-change: transform; }
        .leaflet-container { background-color: #d4dadc !important; }
        @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.6; border-width: 1.5px; } 100% { transform: scale(1.8); opacity: 0; border-width: 0px; } }
        .animate-ripple { animation: ripple 2.5s infinite ease-out; }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes messageCycle { 
            0% { opacity: 0; transform: translateY(8px) scale(0.9); } 
            10% { opacity: 1; transform: translateY(0) scale(1); } 
            85% { opacity: 1; transform: translateY(0) scale(1); } 
            100% { opacity: 0; transform: translateY(-3px) scale(0.95); pointer-events: none; } 
        }
        .animate-message-cycle { animation: messageCycle 5s ease-in-out forwards; }
      `}</style>
      <div className={`relative w-full h-full rounded-lg overflow-hidden bg-slate-100 ${className}`} style={{ minHeight: "400px" }}>
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-1.5 pointer-events-none w-full px-4">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50 flex items-center gap-2 transform scale-90 origin-top">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-700 font-sans">حركة السوق الحية</span>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm transition-all duration-500 transform font-sans"
            style={{ opacity: isTransitioning && displayLabel === "المملكة العربية السعودية" ? 0 : 1, transform: isTransitioning && displayLabel === "المملكة العربية السعودية" ? 'translateY(-5px)' : 'translateY(0)' }}>
            {displayLabel}
          </div>
        </div>
        <div ref={mapRef} className="w-full h-full z-0" data-testid="saudi-map" />
      </div>
    </>
  );
}
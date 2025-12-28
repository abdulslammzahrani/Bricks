import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Building2, Home, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  city?: string | null;
  accountType?: string | null;
  entityName?: string | null;
  isVerified?: boolean | null;
  officeAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface UsersMapProps {
  users: UserData[];
  height?: string;
  showFilters?: boolean;
  onUserClick?: (user: UserData) => void;
}

const cityCoordinates: Record<string, [number, number]> = {
  "الرياض": [24.7136, 46.6753],
  "جدة": [21.4858, 39.1925],
  "مكة": [21.3891, 39.8579],
  "المدينة": [24.5247, 39.5692],
  "الدمام": [26.4207, 50.0888],
  "الخبر": [26.2172, 50.1971],
  "الطائف": [21.2703, 40.4158],
  "تبوك": [28.3998, 36.5715],
  "أبها": [18.2164, 42.5053],
  "القصيم": [26.3267, 43.9708],
  "بريدة": [26.3260, 43.9750],
  "خميس مشيط": [18.3000, 42.7333],
  "حائل": [27.5114, 41.7208],
  "نجران": [17.4914, 44.1272],
  "جازان": [16.8894, 42.5706],
};

const roleLabels: Record<string, string> = {
  buyer: "مشتري",
  seller: "بائع",
  admin: "مدير",
};

const roleColors: Record<string, string> = {
  buyer: "bg-blue-500",
  seller: "bg-emerald-500",
  admin: "bg-purple-500",
};

// Custom icon component for different user roles
const createUserIcon = (role: string, isVerified: boolean = false) => {
  const color = role === "buyer" ? "#3b82f6" : role === "seller" ? "#10b981" : "#a855f7";
  const verifiedBadge = isVerified ? "✓" : "";
  
  return divIcon({
    className: "custom-user-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        position: relative;
      ">
        ${verifiedBadge}
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background-color: ${isVerified ? '#10b981' : '#9ca3af'};
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to fit map bounds to show all markers
function MapBounds({ usersWithCoords }: { usersWithCoords: Array<{ coords: [number, number] }> }) {
  const map = useMap();
  
  useEffect(() => {
    if (usersWithCoords.length > 0) {
      const bounds = usersWithCoords.map(u => u.coords);
      if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      } else {
        map.fitBounds(bounds as [number, number][], { padding: [50, 50] });
      }
    }
  }, [usersWithCoords, map]);
  
  return null;
}

export function UsersMap({ users, height = "600px", showFilters = true, onUserClick }: UsersMapProps) {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Get unique roles and cities
  const roles = useMemo(() => Array.from(new Set(users.map(u => u.role))).sort(), [users]);
  const cities = useMemo(() => Array.from(new Set(users.map(u => u.city).filter(Boolean))).sort(), [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesCity = selectedCity === "all" || user.city === selectedCity;
      const matchesVerified = !showVerifiedOnly || user.isVerified === true;
      return matchesRole && matchesCity && matchesVerified;
    });
  }, [users, selectedRole, selectedCity, showVerifiedOnly]);

  // Get coordinates for each user
  const getUserCoordinates = (user: UserData): [number, number] => {
    // 1. Use user's own coordinates if available
    if (user.latitude && user.longitude) {
      return [user.latitude, user.longitude];
    }

    // 2. Use city coordinates with small random offset to avoid overlapping markers
    const cityCoord = user.city && cityCoordinates[user.city] 
      ? cityCoordinates[user.city] 
      : [24.7136, 46.6753]; // Default to Riyadh
    
    // Add small random offset to prevent markers from overlapping
    const offsetLat = (Math.random() * 0.1 - 0.05); // ±0.05 degrees
    const offsetLng = (Math.random() * 0.1 - 0.05);
    
    return [cityCoord[0] + offsetLat, cityCoord[1] + offsetLng];
  };

  const usersWithCoords = filteredUsers.map(user => ({
    ...user,
    coords: getUserCoordinates(user),
  }));

  const defaultCenter: [number, number] = usersWithCoords.length > 0 
    ? usersWithCoords[0].coords 
    : [24.7136, 46.6753]; // Default to Riyadh

  if (users.length === 0) {
    return (
      <div className="rounded-lg bg-muted flex items-center justify-center" style={{ height }}>
        <div className="text-center p-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">لا توجد أشخاص لعرضهم على الخريطة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">نوع المستخدم:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="all">الكل</option>
                {roles.map(role => (
                  <option key={role} value={role}>{roleLabels[role] || role}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">المدينة:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="all">كل المدن</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVerifiedOnly}
                onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">الموثقون فقط</span>
            </label>

            <div className="flex-1"></div>

            <div className="text-sm text-gray-600">
              عرض <span className="font-bold text-emerald-600">{filteredUsers.length}</span> من <span className="font-bold">{users.length}</span> شخص
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200 relative z-0 shadow-lg" style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds usersWithCoords={usersWithCoords} />
          
          {usersWithCoords.map((user) => (
            <Marker 
              key={user.id} 
              position={user.coords}
              icon={createUserIcon(user.role, user.isVerified || false)}
              eventHandlers={{
                click: () => {
                  if (onUserClick) {
                    onUserClick(user);
                  }
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="text-right p-2" dir="rtl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                        {user.isVerified && (
                          <Badge variant="default" className="bg-emerald-500 text-white text-xs">
                            موثق
                          </Badge>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${roleColors[user.role] || "bg-gray-500"} text-white border-0 text-xs`}
                      >
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${roleColors[user.role] || "bg-gray-500"} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {user.name.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    
                    {user.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span>{user.city}</span>
                      </div>
                    )}
                    
                    {user.entityName && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{user.entityName}</span>
                      </div>
                    )}
                    
                    {user.officeAddress && (
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="line-clamp-2">{user.officeAddress}</span>
                      </div>
                    )}
                  </div>

                  {onUserClick && (
                    <button
                      onClick={() => onUserClick(user)}
                      className="mt-3 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      عرض التفاصيل
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">دليل الأيقونات:</span>
          {roles.map(role => (
            <div key={role} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${roleColors[role] || "bg-gray-500"}`}></div>
              <span className="text-sm text-gray-600">{roleLabels[role] || role}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white relative">
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
            </div>
            <span className="text-sm text-gray-600">موثق</span>
          </div>
        </div>
      </div>
    </div>
  );
}


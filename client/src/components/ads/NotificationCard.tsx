import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Eye,
  MessageCircle,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  Star,
  Calendar,
  Phone,
  Mail,
  Building2,
  Maximize,
  MessageSquare,
  Search,
} from "lucide-react";

export interface Notification {
  id: string;
  type: 'offer' | 'request';
  listingType: 'sale' | 'rent' | 'investment';
  title: string;
  description: string;
  propertyType: string;
  price: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  city: string;
  district: string;
  districts?: string[];
  area: string | number | null;
  bedrooms?: string | number | null;
  bathrooms?: string | number | null;
  features?: string[];
  images?: string[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  status: 'active' | 'inactive' | 'expired' | 'pending' | 'draft' | 'under_construction' | 'sold' | 'closed';
  isNew?: boolean;
  isFeatured?: boolean;
  views?: number;
  viewsCount?: number;
  inquiries?: number;
  createdAt?: string | null;
  coordinates?: { lat: number; lng: number };
}

interface NotificationCardProps {
  notification: Notification;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
  onStats: () => void;
}

const formatPrice = (price: number | null) => {
  if (!price) return "غير محدد";
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}م`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}ألف`;
  return price.toLocaleString('ar-SA');
};

export function NotificationCard({
  notification,
  onView,
  onEdit,
  onDelete,
  onPromote,
  onStats,
}: NotificationCardProps) {
  const isOffer = notification.type === 'offer';
  const isInvestment = notification.listingType === 'investment';
  const listingTypeLabel = 
    notification.listingType === 'sale' ? 'معروض للبيع' :
    notification.listingType === 'rent' ? 'معروض للإيجار' :
    'استثماري';

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    expired: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    under_construction: 'bg-blue-100 text-blue-700 border-blue-200',
    sold: 'bg-purple-100 text-purple-700 border-purple-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusLabels = {
    active: 'نشط',
    inactive: 'غير نشط',
    expired: 'منتهي',
    pending: 'معلق',
    draft: 'مسودة',
    under_construction: 'قيد الإنشاء',
    sold: 'مباع',
    closed: 'مغلق',
  };

  // Extract features from description or use default
  const extractFeatures = () => {
    const features: string[] = [];
    const desc = notification.description?.toLowerCase() || '';
    if (desc.includes('حديقة') || desc.includes('garden')) features.push('حديقة');
    if (desc.includes('مسبح') || desc.includes('pool')) features.push('مسبح');
    if (desc.includes('موقف') || desc.includes('parking')) features.push('موقف سيارات');
    if (desc.includes('مصعد') || desc.includes('elevator')) features.push('مصعد');
    return features;
  };

  const features = notification.features || extractFeatures();
  const displayPrice = notification.price 
    ? `${notification.price.toLocaleString('ar-SA')} ريال`
    : notification.budgetMin && notification.budgetMax
    ? `${notification.budgetMin.toLocaleString('ar-SA')} - ${notification.budgetMax.toLocaleString('ar-SA')} ريال`
    : 'غير محدد';

  const getTypeColor = () => {
    if (notification.listingType === 'sale') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (notification.listingType === 'rent') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const TypeIcon = Building2;
  const displayTags = features.slice(0, 2);
  const remainingTags = features.length > 2 ? features.length - 2 : 0;

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onView}
    >
      <div className="p-3">
        {/* الصف العلوي: الصورة + المحتوى الرئيسي */}
        <div className="flex flex-row-reverse gap-3 mb-3">
          {/* Image Section - على اليسار */}
          <div className="relative w-32 sm:w-40 md:w-56 lg:w-64 h-28 sm:h-36 md:h-40 lg:h-44 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {notification.type === 'offer' && notification.images && notification.images.length > 0 ? (
              <img
                src={notification.images[0]}
                alt={notification.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200">
                <Search className="w-12 sm:w-16 h-12 sm:h-16 text-amber-600 mb-2" />
                <span className="text-xs sm:text-sm text-amber-700 font-bold text-center px-2">{notification.type === 'request' ? 'طلب' : 'عرض'}</span>
              </div>
            )}
          </div>

          {/* Content Section - على اليمين */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Type Badge فقط */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeColor()}`}>
                <TypeIcon className="w-3.5 h-3.5" />
                {listingTypeLabel}
              </span>
            </div>

            {/* العنوان */}
            <h3 className="font-bold text-gray-900 sm:text-base md:text-lg leading-snug mb-2 line-clamp-2 text-[12px]">
              {notification.title}
            </h3>

            {/* الموقع */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {notification.type === 'offer' && notification.district ? (
                <span className="font-semibold">{notification.city} - {notification.district}</span>
              ) : notification.type === 'request' && notification.districts && notification.districts.length > 0 ? (
                <span className="font-semibold">{notification.city} - {notification.districts.join(', ')}</span>
              ) : (
                <span className="font-semibold">{notification.city}</span>
              )}
            </div>

            {/* السعر / الميزانية - ضخم */}
            <div className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 leading-none" dir="rtl">
              {notification.type === 'offer' && notification.price ? (
                <>{notification.price.toLocaleString('ar-SA')} ريال</>
              ) : notification.type === 'request' && notification.budgetMin && notification.budgetMax ? (
                <span className="text-amber-600">{notification.budgetMin.toLocaleString('ar-SA')} - {notification.budgetMax.toLocaleString('ar-SA')} ريال</span>
              ) : (
                <span className="text-gray-500">غير محدد</span>
              )}
            </div>
          </div>
        </div>

        {/* الصف السفلي: التفاصيل + Smart Tags + الإحصائيات */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* التفاصيل الأساسية */}
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            {notification.area && (
              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <span className="font-bold text-gray-900">{notification.area}</span>
                <Maximize className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
            
            {notification.bedrooms && (
              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <span className="font-bold text-gray-900">{notification.bedrooms}</span>
                <Bed className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
            
            {notification.bathrooms && (
              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <span className="font-bold text-gray-900">{notification.bathrooms}</span>
                <Bath className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
          </div>

          {/* الإحصائيات + Smart Tags */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Smart Tags - أول 2 فقط */}
            {displayTags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                {displayTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {remainingTags > 0 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold">
                    +{remainingTags}
                  </span>
                )}
              </div>
            )}

            {/* الإحصائيات */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {(notification.views || notification.viewsCount) && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-700">{notification.views || notification.viewsCount || 0}</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
              )}
              
              {notification.inquiries !== undefined && notification.inquiries > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-700">{notification.inquiries}</span>
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Download, 
  Upload, 
  Share2, 
  Building2, 
  Search as SearchIcon, 
  TrendingUp,
  X,
  AlertTriangle
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NotificationCard, type Notification } from "@/components/ads/NotificationCard";
import { AddNotificationModal } from "@/components/ads/AddNotificationModal";
import { NotificationPreviewModal } from "@/components/ads/NotificationPreviewModal";
import { DeleteNotificationModal } from "@/components/ads/DeleteNotificationModal";
import { PromoteNotificationModal } from "@/components/ads/PromoteNotificationModal";
import { NotificationStatsModal } from "@/components/ads/NotificationStatsModal";

interface Ad {
  id: string;
  adType: "buyer_preference" | "property_listing" | "investment_request" | "investment_opportunity";
  transactionType: "buy" | "rent" | "sale" | "investment";
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  city: string;
  districts: string[];
  propertyType: string;
  price: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  area: string | null;
  rooms: string | null;
  bathrooms?: string | null;
  description: string;
  status: "active" | "inactive" | "under_construction" | "sold" | "closed";
  createdAt: string | null;
  updatedAt: string | null;
  images?: string[];
  viewsCount?: number;
  investmentStrategy?: string | null;
  purpose?: string | null;
}

// Convert Ad to Notification format
const convertAdToNotification = (ad: Ad): Notification => {
  const isOffer = ad.adType === "property_listing" || ad.adType === "investment_opportunity";
  const listingType = 
    ad.transactionType === "sale" ? "sale" :
    ad.transactionType === "rent" ? "rent" :
    ad.transactionType === "investment" ? "investment" :
    ad.transactionType === "buy" ? "sale" : "sale";

  const getAdTitle = () => {
    if (ad.adType === "property_listing" || ad.adType === "investment_opportunity") {
      return `${ad.propertyType} في ${ad.city}`;
    }
    if (ad.adType === "buyer_preference") {
      const transactionLabel = ad.transactionType === "buy" ? "شراء" : "تأجير";
      return `مطلوب ${ad.propertyType} لل${transactionLabel} في ${ad.city}`;
    }
    if (ad.adType === "investment_request") {
      return `طلب استثمار في ${ad.city}`;
    }
    return "إعلان";
  };

  // Extract features from description
  const extractFeatures = (description: string): string[] => {
    const features: string[] = [];
    const desc = description.toLowerCase();
    if (desc.includes('حديقة') || desc.includes('garden')) features.push('حديقة');
    if (desc.includes('مسبح') || desc.includes('pool') || desc.includes('swimming')) features.push('مسبح');
    if (desc.includes('موقف') || desc.includes('parking') || desc.includes('garage')) features.push('موقف سيارات');
    if (desc.includes('مصعد') || desc.includes('elevator') || desc.includes('lift')) features.push('مصعد');
    if (desc.includes('شرفة') || desc.includes('balcony') || desc.includes('terrace')) features.push('شرفة');
    if (desc.includes('مخزن') || desc.includes('storage') || desc.includes('store')) features.push('مخزن');
    return features;
  };

  return {
    id: ad.id,
    type: isOffer ? "offer" : "request",
    listingType: listingType as "sale" | "rent" | "investment",
    title: getAdTitle(),
    description: ad.description || "",
    propertyType: ad.propertyType,
    price: ad.price,
    budgetMin: ad.budgetMin,
    budgetMax: ad.budgetMax,
    city: ad.city,
    district: ad.districts[0] || ad.city,
    districts: ad.districts,
    area: ad.area,
    bedrooms: ad.rooms,
    bathrooms: ad.bathrooms,
    images: ad.images || [],
    features: extractFeatures(ad.description || ""),
    contactName: ad.userName,
    contactPhone: ad.userPhone,
    contactEmail: ad.userEmail,
    status: ad.status,
    isNew: ad.createdAt ? (Date.now() - new Date(ad.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false,
    isFeatured: false,
    views: ad.viewsCount || 0,
    viewsCount: ad.viewsCount || 0,
    inquiries: Math.floor((ad.viewsCount || 0) * 0.07), // Simulate inquiries as 7% of views
    createdAt: ad.createdAt,
  };
};

export default function AdsPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'offer' | 'request'>('all');
  const [filterListingType, setFilterListingType] = useState<'all' | 'sale' | 'rent' | 'investment'>('all');
  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Fetch ads
  const { data: ads = [], isLoading, refetch, error } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/ads");
        const data = await res.json();
        console.log("Fetched ads:", data);
        return data;
      } catch (err: any) {
        console.error("Error fetching ads:", err);
        // Re-throw with more context
        throw new Error(`فشل في جلب الإعلانات: ${err.message || 'خطأ غير معروف'}`);
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Convert ads to notifications
  const notifications = useMemo(() => {
    const converted = ads.map(convertAdToNotification);
    console.log("Converted notifications:", converted);
    return converted;
  }, [ads]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    const filtered = notifications.filter(notification => {
      const matchesSearch = !searchQuery || 
                           notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.city.includes(searchQuery);
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesListingType = filterListingType === 'all' || notification.listingType === filterListingType;
      const matchesPropertyType = filterPropertyType === 'all' || notification.propertyType === filterPropertyType;
      const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
      const matchesCity = filterCity === 'all' || notification.city === filterCity;
      const matchesNew = !showNewOnly || notification.isNew;
      const matchesFeatured = !showFeaturedOnly || notification.isFeatured;
      
      return matchesSearch && matchesType && matchesListingType && matchesPropertyType && matchesStatus && matchesCity && matchesNew && matchesFeatured;
    });
    console.log("Filtered notifications:", filtered, {
      notificationsCount: notifications.length,
      searchQuery,
      filterType,
      filterListingType,
      filterPropertyType,
      filterStatus,
      filterCity,
      showNewOnly,
      showFeaturedOnly
    });
    return filtered;
  }, [notifications, searchQuery, filterType, filterListingType, filterPropertyType, filterStatus, filterCity, showNewOnly, showFeaturedOnly]);

  // Stats
  const stats = useMemo(() => {
    const totalNotifications = notifications.length;
    const totalOffers = notifications.filter(n => n.type === 'offer').length;
    const totalRequests = notifications.filter(n => n.type === 'request').length;
    const totalMatches = 15;
    
    return [
      { label: 'إجمالي الإعلانات', value: totalNotifications, icon: Building2, color: 'bg-emerald-400' },
      { label: 'العقارات المعروضة', value: totalOffers, icon: Building2, color: 'bg-emerald-400' },
      { label: 'الطلبات', value: totalRequests, icon: SearchIcon, color: 'bg-emerald-400' },
      { label: 'المطابقات المحتملة', value: totalMatches, icon: TrendingUp, color: 'bg-emerald-400' },
    ];
  }, [notifications]);

  // Get unique values for filters
  const cities = Array.from(new Set(notifications.map(n => n.city))).sort();
  const propertyTypes = Array.from(new Set(notifications.map(n => n.propertyType))).sort();

  const activeFiltersCount = [
    filterType !== 'all',
    filterListingType !== 'all',
    filterPropertyType !== 'all',
    filterStatus !== 'all',
    filterCity !== 'all',
    showNewOnly,
    showFeaturedOnly,
  ].filter(Boolean).length;

  // Handlers
  const handleAddNotification = (notification: Notification) => {
    toast({
      title: "تم",
      description: "سيتم توجيهك إلى نموذج الإعلان",
    });
  };

  const handleDeleteNotification = () => {
    if (selectedNotification) {
      toast({
        title: "تم الحذف",
        description: "تم حذف الإعلان بنجاح",
      });
      refetch();
    }
  };

  const handlePromote = (duration: number, price: number) => {
    if (selectedNotification) {
      toast({
        title: "تم الترقية",
        description: `تم ترقية الإعلان لمدة ${duration} يوم`,
      });
      refetch();
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsPreviewModalOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    toast({
      title: "تعديل",
      description: "سيتم توجيهك إلى صفحة التعديل",
    });
  };

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteModalOpen(true);
  };

  const handleStats = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsStatsModalOpen(true);
  };

  const handleShare = () => {
    toast({
      title: "مشاركة",
      description: "ميزة المشاركة قريباً",
    });
  };

  const handleImport = () => {
    toast({
      title: "استيراد",
      description: "ميزة الاستيراد قريباً",
    });
  };

  const handleExport = () => {
    toast({
      title: "تصدير",
      description: "ميزة التصدير قريباً",
    });
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden" dir="rtl">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col bg-gray-50 lg:mr-64 w-full min-w-0">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 w-full">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة الإعلانات</h1>
                <p className="text-sm text-gray-600 mt-1">
                  إدارة كاملة لجميع الإعلانات العقارية والطلبات
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">مشاركة</span>
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">استيراد</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">تصدير</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة إعلان</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:grid grid-cols-4 gap-2">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-2.5 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-600 mb-0.5 truncate">{stat.label}</p>
                      <p className="text-base font-bold text-gray-900 leading-tight">{stat.value}</p>
                    </div>
                    <div className={`p-1.5 rounded-lg ${stat.color} flex-shrink-0`}>
                      <stat.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              {/* Search */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative min-w-[250px]">
                  <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن إعلان..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white hover:border-gray-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Filters - Always Visible */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">كل الأنواع</option>
                  <option value="offer">إضافات فقط</option>
                  <option value="request">طلبات فقط</option>
                </select>

                <select
                  value={filterListingType}
                  onChange={(e) => setFilterListingType(e.target.value as any)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">بيع وإيجار</option>
                  <option value="sale">للبيع فقط</option>
                  <option value="rent">للإيجار فقط</option>
                  <option value="investment">استثماري فقط</option>
                </select>

                <select
                  value={filterPropertyType}
                  onChange={(e) => setFilterPropertyType(e.target.value)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">كل العقارات</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">كل المدن</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="expired">منتهي</option>
                  <option value="pending">معلق</option>
                  <option value="draft">مسودة</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                  <input
                    type="checkbox"
                    checked={showNewOnly}
                    onChange={(e) => setShowNewOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">الجديدة فقط</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">المميزة فقط</span>
                </label>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterListingType('all');
                      setFilterPropertyType('all');
                      setFilterStatus('all');
                      setFilterCity('all');
                      setShowNewOnly(false);
                      setShowFeaturedOnly(false);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-sm whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    إعادة تعيين ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {(searchQuery || activeFiltersCount > 0) && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm text-teal-800">
                  تم العثور على <span className="font-bold">{filteredNotifications.length}</span> إعلان
                </p>
              </div>
            )}

            {/* Content */}
            <div className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">خطأ في جلب البيانات</h4>
                      <p className="text-sm text-red-800 mb-2">
                        {error instanceof Error ? error.message : 'خطأ غير معروف'}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="text-sm text-red-700 hover:text-red-900 underline font-medium"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isLoading ? (
                <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                  <p className="text-gray-600">جاري التحميل...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                  <p className="text-sm text-gray-600 mb-2">جرب تعديل معايير البحث أو الفلترة</p>
                  <p className="text-xs text-gray-500">عدد الإعلانات المستلمة: {ads.length} | عدد الإعلانات بعد التحويل: {notifications.length}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="max-w-3xl mx-auto">
                      <NotificationCard
                        notification={notification}
                        onView={() => handleViewDetails(notification)}
                        onEdit={() => handleEdit(notification)}
                        onDelete={() => handleDelete(notification)}
                        onPromote={() => {
                          setSelectedNotification(notification);
                          setIsPromoteModalOpen(true);
                        }}
                        onStats={() => handleStats(notification)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modals */}
            <AddNotificationModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={handleAddNotification}
            />

            <NotificationPreviewModal
              isOpen={isPreviewModalOpen}
              onClose={() => {
                setIsPreviewModalOpen(false);
                setSelectedNotification(null);
              }}
              notification={selectedNotification}
              onEdit={() => {
                setIsPreviewModalOpen(false);
                handleEdit(selectedNotification!);
              }}
              onDelete={() => {
                setIsPreviewModalOpen(false);
                setIsDeleteModalOpen(true);
              }}
              onPromote={() => {
                setIsPreviewModalOpen(false);
                setIsPromoteModalOpen(true);
              }}
              onStats={() => {
                setIsPreviewModalOpen(false);
                setIsStatsModalOpen(true);
              }}
            />

            <DeleteNotificationModal
              isOpen={isDeleteModalOpen}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedNotification(null);
              }}
              onConfirm={handleDeleteNotification}
              notificationTitle={selectedNotification?.title || ''}
            />

            <PromoteNotificationModal
              isOpen={isPromoteModalOpen}
              onClose={() => {
                setIsPromoteModalOpen(false);
                setSelectedNotification(null);
              }}
              onPromote={handlePromote}
              notificationTitle={selectedNotification?.title || ''}
            />

            <NotificationStatsModal
              isOpen={isStatsModalOpen}
              onClose={() => {
                setIsStatsModalOpen(false);
                setSelectedNotification(null);
              }}
              notificationTitle={selectedNotification?.title || ''}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

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
import type { Property } from "@shared/schema";

// Convert Property to Notification format
const convertPropertyToNotification = (property: Property, sellerName: string = "غير معروف", sellerPhone: string = "", sellerEmail: string = ""): Notification => {
  // Extract features from amenities or description
  const extractFeatures = (): string[] => {
    const features: string[] = [];
    const amenities = property.amenities || [];
    const desc = (property.description || "").toLowerCase();
    
    // Map amenities to Arabic
    const amenityMap: Record<string, string> = {
      'parking': 'موقف سيارات',
      'garden': 'حديقة',
      'pool': 'مسبح',
      'elevator': 'مصعد',
      'balcony': 'شرفة',
      'storage': 'مخزن',
    };
    
    amenities.forEach(amenity => {
      if (amenityMap[amenity]) {
        features.push(amenityMap[amenity]);
      }
    });
    
    // Also check description
    if (desc.includes('حديقة') || desc.includes('garden')) features.push('حديقة');
    if (desc.includes('مسبح') || desc.includes('pool') || desc.includes('swimming')) features.push('مسبح');
    if (desc.includes('موقف') || desc.includes('parking') || desc.includes('garage')) features.push('موقف سيارات');
    if (desc.includes('مصعد') || desc.includes('elevator') || desc.includes('lift')) features.push('مصعد');
    
    // Remove duplicates
    return Array.from(new Set(features));
  };

  // Determine listing type (sale or rent) - properties are typically for sale, but we can check notes
  const listingType = property.notes?.includes("[transactionType:rent]") ? "rent" : "sale";
  
  // Determine status
  const status = property.isActive 
    ? (property.status === "ready" ? "active" : "under_construction")
    : "inactive";

  return {
    id: property.id,
    type: "offer", // Properties are always offers
    listingType: listingType as "sale" | "rent",
    title: `${property.propertyType} في ${property.city}`,
    description: property.description || "",
    propertyType: property.propertyType,
    price: property.price,
    budgetMin: null,
    budgetMax: null,
    city: property.city,
    district: property.district,
    districts: [property.district],
    area: property.area,
    bedrooms: property.rooms,
    bathrooms: property.bathrooms,
    images: property.images || [],
    features: extractFeatures(),
    contactName: sellerName,
    contactPhone: sellerPhone,
    contactEmail: sellerEmail,
    status: status as "active" | "inactive" | "under_construction" | "sold" | "closed",
    isNew: property.createdAt ? (Date.now() - new Date(property.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false,
    isFeatured: false,
    views: property.viewsCount || 0,
    viewsCount: property.viewsCount || 0,
    inquiries: Math.floor((property.viewsCount || 0) * 0.07), // Simulate inquiries as 7% of views
    createdAt: property.createdAt 
      ? (typeof property.createdAt === 'string' 
          ? property.createdAt 
          : property.createdAt instanceof Date 
            ? property.createdAt.toISOString() 
            : new Date(property.createdAt as any).toISOString())
      : null,
  };
};

export default function PropertiesPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch properties (using admin endpoint to get all properties including inactive)
  const { data: properties = [], isLoading, refetch, error } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/properties");
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error Response:", errorText);
          throw new Error(`فشل في جلب العقارات: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Fetched properties:", data);
        return data;
      } catch (err: any) {
        console.error("Error fetching properties:", err);
        throw new Error(`فشل في جلب العقارات: ${err.message || 'خطأ غير معروف'}`);
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Convert properties to notifications
  const notifications = useMemo(() => {
    return properties.map((property: any) => {
      const seller = property.seller;
      return convertPropertyToNotification(
        property,
        seller?.name || "غير معروف",
        seller?.phone || "",
        seller?.email || ""
      );
    });
  }, [properties]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    const filtered = notifications.filter(notification => {
      const matchesSearch = !searchQuery || 
                           notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.city.includes(searchQuery);
      const matchesListingType = filterListingType === 'all' || notification.listingType === filterListingType;
      const matchesPropertyType = filterPropertyType === 'all' || notification.propertyType === filterPropertyType;
      const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
      const matchesCity = filterCity === 'all' || notification.city === filterCity;
      const matchesNew = !showNewOnly || notification.isNew;
      const matchesFeatured = !showFeaturedOnly || notification.isFeatured;
      
      return matchesSearch && matchesListingType && matchesPropertyType && matchesStatus && matchesCity && matchesNew && matchesFeatured;
    });
    return filtered;
  }, [notifications, searchQuery, filterListingType, filterPropertyType, filterStatus, filterCity, showNewOnly, showFeaturedOnly]);

  // Stats - Property specific
  const stats = useMemo(() => {
    const totalProperties = notifications.length;
    const propertiesForSale = notifications.filter(n => n.listingType === 'sale').length;
    const propertiesForRent = notifications.filter(n => n.listingType === 'rent').length;
    const activeProperties = notifications.filter(n => n.status === 'active').length;
    
    return [
      { label: 'إجمالي العقارات', value: totalProperties, icon: Building2, color: 'bg-emerald-400' },
      { label: 'عقارات للبيع', value: propertiesForSale, icon: Building2, color: 'bg-emerald-400' },
      { label: 'عقارات للإيجار', value: propertiesForRent, icon: Building2, color: 'bg-emerald-400' },
      { label: 'العقارات النشطة', value: activeProperties, icon: TrendingUp, color: 'bg-emerald-400' },
    ];
  }, [notifications]);

  // Get unique values for filters
  const cities = Array.from(new Set(notifications.map(n => n.city))).sort();
  const propertyTypes = Array.from(new Set(notifications.map(n => n.propertyType))).sort();

  const activeFiltersCount = [
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
      description: "سيتم توجيهك إلى نموذج إضافة العقار",
    });
    navigate("/seller-form");
  };

  const handleDeleteNotification = () => {
    if (selectedNotification) {
      toast({
        title: "تم الحذف",
        description: "تم حذف العقار بنجاح",
      });
      refetch();
    }
  };

  const handlePromote = (duration: number, price: number) => {
    if (selectedNotification) {
      toast({
        title: "تم الترقية",
        description: `تم ترقية العقار لمدة ${duration} يوم`,
      });
      refetch();
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsPreviewModalOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    navigate(`/property/${notification.id}/edit`);
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
                <h1 className="text-2xl font-bold text-gray-900">إدارة العقارات</h1>
                <p className="text-sm text-gray-600 mt-1">
                  إدارة كاملة لجميع أنواع العقارات بمختلف أنواعها
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
                  <span>إضافة عقار</span>
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
                    placeholder="ابحث عن عقار..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white hover:border-gray-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Filters - Always Visible */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <select
                  value={filterListingType}
                  onChange={(e) => setFilterListingType(e.target.value as any)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-medium bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[center_left_0.4rem] bg-no-repeat pl-7"
                >
                  <option value="all">بيع وإيجار</option>
                  <option value="sale">للبيع فقط</option>
                  <option value="rent">للإيجار فقط</option>
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
                  <option value="inactive">غير نشط</option>
                  <option value="under_construction">قيد الإنشاء</option>
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
                  تم العثور على <span className="font-bold">{filteredNotifications.length}</span> عقار
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
                  <p className="text-xs text-gray-500">عدد العقارات المستلمة: {properties.length} | عدد العقارات بعد التحويل: {notifications.length}</p>
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


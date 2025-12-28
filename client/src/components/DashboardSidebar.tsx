import { useLocation } from "wouter";
import { 
  Home, 
  Bell, 
  Building2, 
  Target, 
  Handshake, 
  FileCheck, 
  MessageCircle, 
  Calendar, 
  UserCircle,
  Users,
  FileChartColumn,
  BarChart3,
  Settings
} from "lucide-react";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  page: string;
  newCount: number;
  section: 'main' | 'activity' | 'management' | 'other';
}

const menuItems: MenuItem[] = [
  // القائمة الرئيسية
  { icon: Home, label: 'لوحة التحكم', page: 'dashboard', newCount: 0, section: 'main' },
  { icon: Bell, label: 'الإعلانات', page: 'notifications', newCount: 0, section: 'main' },
  { icon: Building2, label: 'العقارات', page: 'properties', newCount: 5, section: 'main' },
  
  // النشاط
  { icon: Target, label: 'إدارة العملاء (CRM)', page: 'crm', newCount: 12, section: 'activity' },
  { icon: Handshake, label: 'المطابقات الذكية', page: 'matches', newCount: 8, section: 'activity' },
  { icon: FileCheck, label: 'الصفقات العقارية', page: 'deals', newCount: 6, section: 'activity' },
  { icon: MessageCircle, label: 'الرسائل', page: 'messages', newCount: 5, section: 'activity' },
  { icon: Calendar, label: 'المواعيد', page: 'appointments', newCount: 3, section: 'activity' },
  
  // الإدارة
  { icon: UserCircle, label: 'المستخدمين', page: 'users', newCount: 3, section: 'management' },
  { icon: Users, label: 'إدارة الفريق', page: 'teams', newCount: 0, section: 'management' },
  { icon: FileChartColumn, label: 'التقارير', page: 'reports', newCount: 0, section: 'management' },
  { icon: BarChart3, label: 'التحليلات', page: 'analytics', newCount: 0, section: 'management' },
  
  // أخرى
  { icon: Settings, label: 'الإعدادات', page: 'settings', newCount: 0, section: 'other' },
];

const getPagePath = (page: string): string => {
  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'notifications': '/ads', // Redirect to ads page
    'properties': '/properties', // Redirect to properties page
    'crm': '/crm',
    'matches': '/matches',
    'deals': '/admin#deals', // Redirect to admin deals section
    'messages': '/messages',
    'appointments': '/appointments',
    'users': '/admin#users', // Redirect to admin users section
    'teams': '/admin#overview', // Teams section doesn't exist, redirect to overview
    'reports': '/admin#analytics', // Reports section doesn't exist, redirect to analytics
    'analytics': '/admin#analytics', // Redirect to admin analytics section
    'settings': '/admin#overview', // Settings section doesn't exist, redirect to overview
  };
  return pathMap[page] || '/dashboard';
};

const getBadgeColor = (section: string, count: number): string => {
  if (section === 'activity') {
    if (count >= 10) {
      return 'bg-emerald-100 text-emerald-700';
    } else if (count >= 5) {
      return 'bg-amber-100 text-amber-700';
    } else {
      return 'bg-blue-100 text-blue-700';
    }
  } else if (section === 'main') {
    return 'bg-emerald-100 text-emerald-700';
  } else if (section === 'management') {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-gray-100 text-gray-700';
};

export function DashboardSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location, navigate] = useLocation();

  const handleNavigate = (page: string) => {
    const path = getPagePath(page);
    
    // If navigating to admin page with hash, extract section and navigate
    if (path.startsWith('/admin#')) {
      const section = path.split('#')[1];
      navigate('/admin');
      // Set activeSection in admin page using URL hash
      // Admin page will read hash from URL and set activeSection
      setTimeout(() => {
        window.location.hash = section;
        // Trigger a custom event to notify admin page
        window.dispatchEvent(new CustomEvent('admin-section-change', { detail: { section } }));
      }, 100);
    } else {
      navigate(path);
    }
    
    if (onNavigate) {
      onNavigate();
    }
  };

  const getCurrentPage = (): string => {
    if (location === '/dashboard' || (typeof location === 'string' && location.startsWith('/dashboard'))) return 'dashboard';
    if (location === '/ads') return 'notifications';
    if (location === '/admin' || (typeof location === 'string' && location.startsWith('/admin'))) {
      // Check hash for admin sections
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'marketing') return 'notifications';
        if (hash === 'properties') return 'properties';
        if (hash === 'deals') return 'deals';
        if (hash === 'users') return 'users';
        if (hash === 'analytics') return 'analytics';
      }
    }
    if (location === '/crm') return 'crm';
    if (location === '/matches') return 'matches';
    if (location === '/messages') return 'messages';
    if (location === '/appointments') return 'appointments';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const renderMenuItem = (item: MenuItem, index: number) => {
    const Icon = item.icon;
    const isActive = currentPage === item.page;

    return (
      <button
        key={index}
        onClick={() => handleNavigate(item.page)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
          isActive
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
        <span className="flex-1 text-right font-medium text-sm">{item.label}</span>
        {item.newCount > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(item.section, item.newCount)}`}>
            {item.newCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Logo & Admin Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            م
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-emerald-600">بركس</h1>
            <p className="text-xs text-gray-500">مدير النظام</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* القائمة الرئيسية */}
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">القائمة الرئيسية</p>
        </div>
        {menuItems.filter(item => item.section === 'main').map((item, index) => renderMenuItem(item, index))}

        {/* Divider */}
        <div className="my-3 border-t border-gray-200"></div>

        {/* النشاط */}
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">النشاط</p>
        </div>
        {menuItems.filter(item => item.section === 'activity').map((item, index) => renderMenuItem(item, index))}

        {/* Divider */}
        <div className="my-3 border-t border-gray-200"></div>

        {/* الإدارة */}
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">الإدارة</p>
        </div>
        {menuItems.filter(item => item.section === 'management').map((item, index) => renderMenuItem(item, index))}

        {/* Divider */}
        <div className="my-3 border-t border-gray-200"></div>

        {/* أخرى */}
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">أخرى</p>
        </div>
        {menuItems.filter(item => item.section === 'other').map((item, index) => renderMenuItem(item, index))}
      </nav>

      {/* Footer - Help Section */}
      <div className="p-3 border-t border-gray-200">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-900 mb-1">هل تحتاج مساعدة؟</p>
          <p className="text-xs text-emerald-700 mb-3">تواصل مع فريق الدعم الفني</p>
          <button 
            onClick={() => handleNavigate('settings')}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            تواصل معنا الآن
          </button>
        </div>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  return (
    <div className="hidden lg:flex w-64 bg-white border-l border-gray-200 h-screen flex-col fixed right-0 top-0 z-50 shadow-sm" dir="rtl">
      <DashboardSidebarContent />
    </div>
  );
}

/**
 * مثال على استخدام مكون UsersMap لعرض الأشخاص على خريطة تفاعلية
 * 
 * هذا الملف يوضح كيفية استخدام مكون UsersMap في صفحات مختلفة
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UsersMap } from "./UsersMap";
import { apiRequest } from "@/lib/queryClient";

// مثال 1: استخدام بسيط مع بيانات ثابتة
export function SimpleUsersMapExample() {
  const sampleUsers = [
    {
      id: "1",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966501234567",
      role: "buyer",
      city: "الرياض",
      isVerified: false,
    },
    {
      id: "2",
      name: "خالد العتيبي",
      email: "khaled@example.com",
      phone: "+966502345678",
      role: "seller",
      city: "جدة",
      accountType: "individual",
      isVerified: true,
    },
    {
      id: "3",
      name: "شركة العقارات المميزة",
      email: "info@premium.com",
      phone: "+966503456789",
      role: "seller",
      city: "الرياض",
      accountType: "office",
      entityName: "شركة العقارات المميزة",
      isVerified: true,
      officeAddress: "طريق الملك فهد، حي العليا",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">خريطة المستخدمين</h1>
      <UsersMap 
        users={sampleUsers} 
        height="600px"
        showFilters={true}
        onUserClick={(user) => {
          console.log("تم النقر على:", user);
          // يمكنك إضافة منطق التنقل أو فتح نافذة منبثقة
        }}
      />
    </div>
  );
}

// مثال 2: جلب البيانات من API
export function UsersMapWithAPI() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      const data = await res.json();
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">حدث خطأ في جلب البيانات</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">خريطة جميع المستخدمين</h1>
      <UsersMap 
        users={users} 
        height="700px"
        showFilters={true}
        onUserClick={(user) => {
          // التنقل إلى صفحة تفاصيل المستخدم
          window.location.href = `/users/${user.id}`;
        }}
      />
    </div>
  );
}

// مثال 3: تصفية حسب نوع المستخدم
export function FilteredUsersMapExample() {
  const [userType, setUserType] = useState<"all" | "buyer" | "seller">("all");

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users", userType],
    queryFn: async () => {
      const url = userType === "all" 
        ? "/api/users" 
        : `/api/users?role=${userType}`;
      const res = await apiRequest("GET", url);
      const data = await res.json();
      return data;
    },
  });

  // تصفية البيانات حسب النوع
  const filteredUsers = userType === "all" 
    ? users 
    : users.filter((u: any) => u.role === userType);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold">خريطة المستخدمين</h1>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">الكل</option>
          <option value="buyer">المشترون</option>
          <option value="seller">البائعون</option>
        </select>
      </div>
      
      <UsersMap 
        users={filteredUsers} 
        height="600px"
        showFilters={false} // إخفاء الفلاتر لأننا نستخدم فلتر خارجي
      />
    </div>
  );
}

// مثال 4: استخدام في لوحة الإدارة
export function AdminUsersMapView() {
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      const data = await res.json();
      return data;
    },
  });

  const handleUserClick = (user: any) => {
    // فتح نافذة منبثقة أو صفحة تفاصيل
    alert(`تفاصيل المستخدم: ${user.name}\nالبريد: ${user.email}\nالهاتف: ${user.phone}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-2">خريطة المستخدمين - لوحة الإدارة</h1>
        <p className="text-gray-600 mb-6">
          عرض جميع المستخدمين على خريطة تفاعلية مع إمكانية التصفية والبحث
        </p>
        
        <UsersMap 
          users={users} 
          height="700px"
          showFilters={true}
          onUserClick={handleUserClick}
        />
      </div>
    </div>
  );
}


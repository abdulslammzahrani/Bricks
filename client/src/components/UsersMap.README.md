# UsersMap Component

مكون خريطة تفاعلية لعرض الأشخاص (المستخدمين) على خريطة باستخدام Leaflet و React Leaflet.

## المميزات

- ✅ عرض المستخدمين على خريطة تفاعلية
- ✅ أيقونات مخصصة حسب نوع المستخدم (مشتري، بائع، مدير)
- ✅ إشارة بصرية للمستخدمين الموثقين
- ✅ فلاتر متقدمة (نوع المستخدم، المدينة، الموثقون فقط)
- ✅ نافذة منبثقة (Popup) تعرض معلومات المستخدم
- ✅ تكبير/تصغير تلقائي لعرض جميع العلامات
- ✅ دعم RTL (من اليمين لليسار)
- ✅ تصميم متجاوب

## التثبيت

المكون يستخدم المكتبات التالية التي يجب أن تكون مثبتة:

```bash
npm install leaflet react-leaflet
npm install @types/leaflet
```

## الاستخدام الأساسي

```tsx
import { UsersMap } from "@/components/UsersMap";

function MyPage() {
  const users = [
    {
      id: "1",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966501234567",
      role: "buyer",
      city: "الرياض",
    },
    // ... المزيد من المستخدمين
  ];

  return (
    <UsersMap 
      users={users}
      height="600px"
      showFilters={true}
      onUserClick={(user) => {
        console.log("تم النقر على:", user);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `users` | `UserData[]` | **required** | مصفوفة من بيانات المستخدمين |
| `height` | `string` | `"600px"` | ارتفاع الخريطة |
| `showFilters` | `boolean` | `true` | إظهار/إخفاء الفلاتر |
| `onUserClick` | `(user: UserData) => void` | `undefined` | دالة يتم استدعاؤها عند النقر على مستخدم |

## UserData Interface

```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // "buyer" | "seller" | "admin"
  city?: string | null;
  accountType?: string | null;
  entityName?: string | null;
  isVerified?: boolean | null;
  officeAddress?: string | null;
  latitude?: number | null; // إحداثيات خط العرض (اختياري)
  longitude?: number | null; // إحداثيات خط الطول (اختياري)
}
```

## أمثلة الاستخدام

### مثال 1: استخدام مع API

```tsx
import { useQuery } from "@tanstack/react-query";
import { UsersMap } from "@/components/UsersMap";
import { apiRequest } from "@/lib/queryClient";

function UsersPage() {
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json();
    },
  });

  return (
    <UsersMap 
      users={users}
      onUserClick={(user) => {
        window.location.href = `/users/${user.id}`;
      }}
    />
  );
}
```

### مثال 2: بدون فلاتر

```tsx
<UsersMap 
  users={users}
  showFilters={false}
  height="500px"
/>
```

### مثال 3: مع معالج النقر

```tsx
<UsersMap 
  users={users}
  onUserClick={(user) => {
    // فتح نافذة منبثقة
    alert(`اسم المستخدم: ${user.name}`);
    
    // أو التنقل إلى صفحة
    navigate(`/users/${user.id}`);
    
    // أو فتح نافذة منبثقة مخصصة
    setSelectedUser(user);
    setIsModalOpen(true);
  }}
/>
```

## الألوان حسب نوع المستخدم

- **مشتري (buyer)**: أزرق (`#3b82f6`)
- **بائع (seller)**: أخضر (`#10b981`)
- **مدير (admin)**: بنفسجي (`#a855f7`)

## الحصول على الإحداثيات

المكون يحاول الحصول على إحداثيات المستخدم بالترتيب التالي:

1. استخدام `latitude` و `longitude` إذا كانت متوفرة
2. استخدام إحداثيات المدينة مع إزاحة عشوائية صغيرة لتجنب تداخل العلامات
3. افتراض الرياض كموقع افتراضي

## التخصيص

يمكنك تخصيص المكون عن طريق:

1. **تعديل الألوان**: عدّل `roleColors` في الملف
2. **تعديل الأيقونات**: عدّل دالة `createUserIcon`
3. **تعديل النافذة المنبثقة**: عدّل محتوى `Popup` في المكون

## ملاحظات

- تأكد من استيراد CSS الخاص بـ Leaflet: `import "leaflet/dist/leaflet.css"`
- المكون يدعم RTL تلقائياً
- الخريطة تتكيف تلقائياً لعرض جميع العلامات

## المتطلبات

- React 18+
- Leaflet 1.9+
- React Leaflet 4.2+


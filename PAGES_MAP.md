# خريطة الصفحات والـ Routes

هذا الملف يوضح موقع كل صفحة في الكود وكيفية الوصول إليها.

## 📁 هيكل الملفات

```
client/src/
├── pages/              # جميع الصفحات الرئيسية
│   ├── admin.tsx       # لوحة التحكم الإدارية
│   ├── home.tsx       # الصفحة الرئيسية
│   ├── login.tsx      # صفحة تسجيل الدخول
│   ├── register.tsx   # صفحة التسجيل
│   ├── profile.tsx    # صفحة الملف الشخصي
│   ├── dashboard.tsx  # لوحة تحكم المستخدم
│   ├── offer.tsx      # صفحة عرض العقار (Landing Page)
│   ├── property.tsx   # صفحة تفاصيل العقار
│   ├── property-edit.tsx # صفحة تعديل العقار
│   ├── investor.tsx   # صفحة نموذج المستثمر
│   ├── seller-form.tsx # صفحة نموذج البائع
│   ├── static-page.tsx # الصفحات الثابتة (FAQ, Privacy, Terms)
│   ├── marketer-dashboard.tsx # لوحة تحكم المسوق
│   ├── forgot-password.tsx # صفحة نسيان كلمة المرور
│   ├── reset-password.tsx # صفحة إعادة تعيين كلمة المرور
│   ├── setup-password.tsx # صفحة إعداد كلمة المرور
│   └── not-found.tsx  # صفحة 404
│
└── App.tsx            # ملف تعريف الـ Routes الرئيسي
```

## 🗺️ خريطة الـ Routes

### الصفحات العامة

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/` | `pages/home.tsx` | الصفحة الرئيسية | `HeroSection`, `Features`, `HowItWorks`, `CTASection` |
| `/login` | `pages/login.tsx` | تسجيل الدخول | - |
| `/register` | `pages/register.tsx` | التسجيل | - |
| `/forgot-password` | `pages/forgot-password.tsx` | نسيان كلمة المرور | - |
| `/reset-password` | `pages/reset-password.tsx` | إعادة تعيين كلمة المرور | - |
| `/setup-password` | `pages/setup-password.tsx` | إعداد كلمة المرور | - |

### صفحات المستخدمين

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/dashboard` | `pages/dashboard.tsx` | لوحة تحكم المستخدم | `MemberLayout` |
| `/profile` | `pages/profile.tsx` | الملف الشخصي | `MemberLayout` |
| `/property/:id` | `pages/property.tsx` | تفاصيل العقار | - |
| `/property/:id/edit` | `pages/property-edit.tsx` | تعديل العقار | - |

### صفحات النماذج

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/seller-form` | `pages/seller-form.tsx` | نموذج البائع | `ListPropertyForm` |
| `/investor` | `pages/investor.tsx` | نموذج المستثمر | - |

### صفحات الإدارة

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/admin` | `pages/admin.tsx` | لوحة التحكم الإدارية | `UltraSimplifiedFormBuilder`, `LandingPagesManager`, `LeadsManager` |
| `/marketer-dashboard` | `pages/marketer-dashboard.tsx` | لوحة تحكم المسوق | - |

### صفحات الهبوط والعروض

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/offer/:slug` | `pages/offer.tsx` | صفحة عرض العقار (Landing Page) | `PropertyHero`, `LeadCaptureForm`, `FormRenderer`, `ContentLocker` |

### الصفحات الثابتة

| Route | الملف | الوصف | المكونات المستخدمة |
|-------|-------|-------|-------------------|
| `/faq` | `pages/static-page.tsx` | صفحة الأسئلة الشائعة | - |
| `/privacy` | `pages/static-page.tsx` | صفحة الخصوصية | - |
| `/terms` | `pages/static-page.tsx` | صفحة الشروط والأحكام | - |

### صفحة 404

| Route | الملف | الوصف |
|-------|-------|-------|
| `*` (أي route غير موجود) | `pages/not-found.tsx` | صفحة 404 |

## 📝 تفاصيل الصفحات المهمة

### 1. لوحة التحكم الإدارية (`/admin`)

**الملف:** `client/src/pages/admin.tsx`

**الأقسام الرئيسية:**
- **Overview** (`activeSection === "overview"`): نظرة عامة مع إحصائيات ورسوم بيانية
- **Users** (`activeSection === "users"`): إدارة المستخدمين
- **Preferences** (`activeSection === "preferences"`): إدارة رغبات المشترين
- **Leads** (`activeSection === "leads"`): إدارة الليدز
- **Properties** (`activeSection === "properties"`): إدارة العقارات
- **Matches** (`activeSection === "matches"`): إدارة المطابقات
- **Form Builder** (`activeSection === "form-builder"`): بناء النماذج
- **Deals** (`activeSection === "deals"`): الصفقات العقارية
- **Analytics** (`activeSection === "analytics"`): التحليلات
- **Sending** (`activeSection === "sending"`): الإرسال
- **Marketing** (`activeSection === "marketing"`): التسويق
- **Landing Pages** (`activeSection === "landing-pages"`): صفحات الهبوط
- **Static Pages** (`activeSection === "pages"`): الصفحات الثابتة

**API Endpoints المستخدمة:**
- `/api/admin/stats` - الإحصائيات العامة
- `/api/admin/users` - قائمة المستخدمين
- `/api/admin/preferences` - رغبات المشترين
- `/api/properties` - العقارات
- `/api/admin/matches` - المطابقات
- `/api/admin/contact-requests` - طلبات التواصل
- `/api/admin/form-builder/configs` - إعدادات Form Builder
- `/api/admin/analytics/*` - التحليلات

**كيفية التعديل:**
```typescript
// للبحث عن قسم معين، ابحث عن:
activeSection === "اسم_القسم"

// مثال: للبحث عن قسم Form Builder
// ابحث عن: activeSection === "form-builder"
// الموقع: حوالي السطر 6079
```

### 2. صفحة عرض العقار (`/offer/:slug`)

**الملف:** `client/src/pages/offer.tsx`

**المكونات المستخدمة:**
- `PropertyHero` - رأس الصفحة مع صورة العقار
- `LeadCaptureForm` - نموذج التقاط العملاء (إذا لم يكن هناك formName)
- `FormRenderer` - نموذج ديناميكي من Form Builder (إذا كان هناك formName)
- `ContentLocker` - قفل المحتوى
- `SimilarPropertiesBanner` - عقارات مشابهة

**API Endpoints المستخدمة:**
- `/api/landing-pages/:slug` - بيانات صفحة الهبوط
- `/api/landing-pages/:slug/unlock` - فتح المحتوى المقفل

**كيفية التعديل:**
```typescript
// للبحث عن جزء معين:
// - نموذج التقاط العملاء: ابحث عن "LeadCaptureForm"
// - نموذج Form Builder: ابحث عن "FormRenderer"
// - قفل المحتوى: ابحث عن "ContentLocker"
```

### 3. الصفحة الرئيسية (`/`)

**الملف:** `client/src/pages/home.tsx`

**المكونات المستخدمة:**
- `Header` - رأس الصفحة
- `HeroSection` - قسم البطل (نموذج البحث)
- `Features` - المميزات
- `HowItWorks` - كيف يعمل
- `CTASection` - دعوة للإجراء
- `Footer` - تذييل الصفحة

**كيفية التعديل:**
```typescript
// الملف صغير جداً، كل المكونات موجودة في client/src/components/
```

### 4. Form Builder (`/admin` → `activeSection === "form-builder"`)

**الملف:** `client/src/components/admin/FormBuilder/UltraSimplifiedFormBuilder.tsx`

**المكونات الفرعية:**
- `StepsList` - قائمة الخطوات
- `FieldsList` - قائمة الحقول
- `StepEditor` - محرر الخطوة
- `FieldEditor` - محرر الحقل
- `FormPreview` - معاينة النموذج
- `FormEmbeddingManager` - إدارة التضمين

**كيفية التعديل:**
```typescript
// للبحث عن جزء معين:
// - قائمة الخطوات: StepsList.tsx
// - قائمة الحقول: FieldsList.tsx
// - محرر الخطوة: StepEditor.tsx
// - محرر الحقل: FieldEditor.tsx
// - معاينة النموذج: FormPreview.tsx
// - إدارة التضمين: FormEmbeddingManager.tsx
```

## 🔍 نصائح للبحث والتعديل

### للبحث عن صفحة معينة:

1. **ابحث عن الـ Route في `App.tsx`:**
   ```typescript
   // مثال: للبحث عن صفحة admin
   // ابحث في App.tsx عن: path="/admin"
   ```

2. **ابحث عن الـ component name:**
   ```typescript
   // مثال: للبحث عن AdminDashboard
   // ابحث عن: import AdminDashboard
   ```

3. **ابحث عن الـ URL في المتصفح:**
   ```typescript
   // إذا كنت في صفحة معينة، افتح DevTools وابحث عن:
   // window.location.pathname
   ```

### للبحث عن قسم معين في صفحة كبيرة:

1. **استخدم البحث في الملف:**
   ```typescript
   // مثال: للبحث عن قسم Form Builder في admin.tsx
   // ابحث عن: activeSection === "form-builder"
   ```

2. **استخدم التعليقات:**
   ```typescript
   // معظم الأقسام لها تعليقات مثل:
   // {/* Form Builder Section */}
   ```

3. **استخدم الـ menuItems:**
   ```typescript
   // في admin.tsx، ابحث عن menuItems للعثور على id القسم
   // ثم ابحث عن: activeSection === "id"
   ```

## 📊 API Endpoints لكل صفحة

### `/admin`
- `/api/admin/stats`
- `/api/admin/users`
- `/api/admin/preferences`
- `/api/properties`
- `/api/admin/matches`
- `/api/admin/contact-requests`
- `/api/admin/form-builder/configs`
- `/api/admin/analytics/*`

### `/offer/:slug`
- `/api/landing-pages/:slug`
- `/api/landing-pages/:slug/unlock`

### `/property/:id`
- `/api/properties/:id`

### `/dashboard`
- `/api/buyer-preferences`
- `/api/matches`

## 🛠️ كيفية إضافة صفحة جديدة

1. **أنشئ ملف الصفحة في `client/src/pages/`:**
   ```typescript
   // مثال: pages/new-page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. **أضف الـ Route في `App.tsx`:**
   ```typescript
   import NewPage from "@/pages/new-page";
   
   <Route path="/new-page" component={NewPage} />
   ```

3. **أضف رابط في الـ Navigation (إذا لزم الأمر):**
   ```typescript
   // في Header.tsx أو Sidebar
   <Link href="/new-page">New Page</Link>
   ```

## 📌 ملاحظات مهمة

1. **الصفحات الكبيرة:** بعض الصفحات مثل `admin.tsx` كبيرة جداً (9000+ سطر). استخدم البحث للعثور على القسم المطلوب.

2. **المكونات المشتركة:** معظم المكونات موجودة في `client/src/components/` ويمكن إعادة استخدامها.

3. **الـ Routes الديناميكية:** بعض الـ Routes تحتوي على parameters مثل `/offer/:slug` و `/property/:id`.

4. **الصفحات الثابتة:** الصفحات الثابتة (FAQ, Privacy, Terms) تستخدم نفس المكون `static-page.tsx` مع slug مختلف.



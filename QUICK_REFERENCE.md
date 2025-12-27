# مرجع سريع للبحث في الكود

## 🔍 البحث السريع عن الصفحات

### حسب الـ URL:
```
/                    → pages/home.tsx
/admin               → pages/admin.tsx
/offer/:slug         → pages/offer.tsx
/property/:id        → pages/property.tsx
/dashboard           → pages/dashboard.tsx
/profile             → pages/profile.tsx
/login               → pages/login.tsx
/seller-form         → pages/seller-form.tsx
/investor            → pages/investor.tsx
```

### حسب الـ Component Name:
```
Home                 → pages/home.tsx
AdminDashboard       → pages/admin.tsx
OfferPage            → pages/offer.tsx
PropertyPage         → pages/property.tsx
Dashboard            → pages/dashboard.tsx
ProfilePage          → pages/profile.tsx
LoginPage            → pages/login.tsx
SellerFormPage       → pages/seller-form.tsx
InvestorPage         → pages/investor.tsx
```

## 📍 البحث في صفحة Admin (`/admin`)

### الأقسام الرئيسية:
```typescript
// ابحث عن: activeSection === "اسم_القسم"

"overview"        → نظرة عامة (السطر ~1807)
"users"           → المستخدمين (السطر ~1875)
"preferences"     → الرغبات (السطر ~2413)
"leads"           → الليدز
"properties"      → العقارات (السطر ~2875)
"matches"         → المطابقات (السطر ~3427)
"form-builder"   → Form Builder (السطر ~6079)
"deals"           → الصفقات العقارية
"analytics"       → التحليلات
"sending"         → الإرسال
"marketing"       → التسويق
"landing-pages"   → صفحات الهبوط (السطر ~6084)
"pages"           → الصفحات الثابتة (السطر ~6089)
```

### الكروت (KPI Cards):
```typescript
// الموقع: السطر ~1741
// ابحث عن: "Unified KPI Header"
// الكروت الأربعة:
// - المطابقات: matches.length
// - العقارات: activeProperties.length
// - الرغبات: activePreferences.length
// - طلبات التواصل: contactRequests.length
```

## 🎯 البحث في Form Builder

### الملفات الرئيسية:
```
UltraSimplifiedFormBuilder.tsx  → المكون الرئيسي
StepsList.tsx                    → قائمة الخطوات
FieldsList.tsx                   → قائمة الحقول
StepEditor.tsx                   → محرر الخطوة
FieldEditor.tsx                  → محرر الحقل
FormPreview.tsx                  → معاينة النموذج
DynamicFormRenderer.tsx          → عرض النموذج
FormEmbeddingManager.tsx         → إدارة التضمين
```

### البحث في UltraSimplifiedFormBuilder:
```typescript
// التبويبات:
"steps"      → الخطوات والحقول
"embedding"  → التضمين والصفحات

// ابحث عن: activeTab === "steps" أو activeTab === "embedding"
```

## 🔗 البحث في صفحة Offer (`/offer/:slug`)

### المكونات الرئيسية:
```typescript
// ابحث عن:
"LeadCaptureForm"     → نموذج التقاط العملاء
"FormRenderer"        → نموذج Form Builder
"PropertyHero"        → رأس الصفحة
"ContentLocker"       → قفل المحتوى
"SimilarPropertiesBanner" → عقارات مشابهة
```

### API Calls:
```typescript
// ابحث عن:
queryKey: ["/api/landing-pages", slug]
```

## 📦 البحث في المكونات

### المكونات المشتركة:
```
components/
├── Header.tsx              → رأس الصفحة
├── Footer.tsx              → تذييل الصفحة
├── HeroSection.tsx         → قسم البطل (نموذج البحث)
├── AdvancedSearchForm.tsx  → نموذج البحث المتقدم
├── ListPropertyForm.tsx    → نموذج إضافة عقار
└── MemberLayout.tsx       → تخطيط صفحات المستخدم
```

### مكونات Admin:
```
components/admin/
├── FormBuilder/            → جميع مكونات Form Builder
└── LandingPagesManager.tsx → إدارة صفحات الهبوط
```

## 🛠️ نصائح البحث السريع

### 1. البحث عن صفحة بالـ URL:
```bash
# في VS Code أو أي محرر:
# اضغط Ctrl+Shift+F (أو Cmd+Shift+F على Mac)
# ابحث عن: path="/admin"
```

### 2. البحث عن component:
```bash
# ابحث عن: import AdminDashboard
# أو: export default function AdminDashboard
```

### 3. البحث عن قسم في admin.tsx:
```bash
# ابحث عن: activeSection === "form-builder"
# أو: {/* Form Builder Section */}
```

### 4. البحث عن API endpoint:
```bash
# ابحث عن: queryKey: ["/api/admin/stats"]
# أو: /api/admin/stats
```

## 📝 أمثلة عملية

### مثال 1: تعديل قسم Form Builder في Admin
```typescript
// 1. افتح: pages/admin.tsx
// 2. ابحث عن: activeSection === "form-builder"
// 3. الموقع: السطر ~6079
// 4. المكون المستخدم: <FormBuilder />
// 5. الملف الفعلي: components/admin/FormBuilder/UltraSimplifiedFormBuilder.tsx
```

### مثال 2: تعديل الكروت في Admin
```typescript
// 1. افتح: pages/admin.tsx
// 2. ابحث عن: "Unified KPI Header"
// 3. الموقع: السطر ~1741
// 4. البيانات: matches, activeProperties, activePreferences, contactRequests
```

### مثال 3: تعديل صفحة Offer
```typescript
// 1. افتح: pages/offer.tsx
// 2. ابحث عن: FormRenderer أو LeadCaptureForm
// 3. المكونات المستخدمة موجودة في: components/landing/
```

## 🎨 البحث حسب الوظيفة

### نماذج:
```
AdvancedSearchForm.tsx    → نموذج البحث المتقدم
ListPropertyForm.tsx      → نموذج إضافة عقار
LeadCaptureForm.tsx       → نموذج التقاط العملاء
FormRenderer              → نموذج ديناميكي من Form Builder
```

### إدارة:
```
UltraSimplifiedFormBuilder.tsx → إدارة النماذج
LandingPagesManager.tsx         → إدارة صفحات الهبوط
LeadsManager.tsx                → إدارة الليدز
```

### عرض البيانات:
```
MatchCard.tsx            → بطاقة مطابقة
PropertyMap.tsx          → خريطة العقارات
MarketPulse.tsx          → نبض السوق
```

## 📍 مواقع مهمة في الكود

### Routes Definition:
```
App.tsx (السطر 24-47)    → جميع الـ Routes
```

### Admin Sections:
```
pages/admin.tsx:
  - السطر 374-388        → menuItems (قائمة الأقسام)
  - السطر 1741           → KPI Cards
  - السطر 1807           → Overview Section
  - السطر 1875           → Users Section
  - السطر 2413           → Preferences Section
  - السطر 2875           → Properties Section
  - السطر 3427           → Matches Section
  - السطر 6079           → Form Builder Section
```

### Form Builder:
```
components/admin/FormBuilder/UltraSimplifiedFormBuilder.tsx:
  - السطر ~100           → Tabs (Steps & Embedding)
  - السطر ~200           → Steps List
  - السطر ~400           → Fields List
```

## 💡 نصائح إضافية

1. **استخدم Bookmarks في VS Code** لوضع علامات على الأماكن المهمة
2. **استخدم Go to Definition** (F12) للانتقال إلى تعريف المكون
3. **استخدم Find References** (Shift+F12) للعثور على جميع استخدامات المكون
4. **استخدم File Search** (Ctrl+P) للبحث السريع عن الملفات



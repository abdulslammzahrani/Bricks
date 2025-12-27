# وصف كامل لتصميم فورم البحث العقاري - Figma Design Prompt

## نظرة عامة
نموذج بحث عقاري متعدد الخطوات (Multi-step Form) يتكون من 8 خطوات (Cards) تفاعلية. كل خطوة تحتوي على محتوى مختلف ويتم التنقل بينها بشكل سلس مع تأثيرات انتقالية.

---

## البنية العامة (Overall Structure)

### الحاوية الرئيسية
- **العرض**: كامل الشاشة (Full Width)
- **الخلفية**: بيضاء نظيفة (`#FFFFFF`)
- **الحدود**: بدون حدود خارجية
- **الظل**: `shadow-2xl` (ظل كبير وناعم)
- **الحدود الداخلية**: بدون حدود (`border-0`)
- **الشفافية**: `bg-white/95` (95% opacity)
- **Padding**: `p-4` (16px)

### الهيكل العام
```
┌─────────────────────────────────────────┐
│  Header (Progress Cards)                │
│  [Card 0] [Card 1] [Card 2] ... [Card 7]│
├─────────────────────────────────────────┤
│                                         │
│  Content Area (Dynamic)                 │
│  (يختلف حسب الخطوة النشطة)              │
│                                         │
├─────────────────────────────────────────┤
│  Navigation Buttons                     │
│  [السابق] [التالي]                      │
└─────────────────────────────────────────┘
```

---

## Header - Progress Cards (خطوات التقدم)

### التصميم
- **الارتفاع**: 50px (Desktop) / 42px (Mobile)
- **الخلفية**: شفافة
- **التخطيط**: أفقي (Horizontal) مع مسافات متساوية
- **الحد الأقصى للعرض**: `max-w-2xl mx-auto`

### كل Card في Header
- **العرض**: متساوي التوزيع
- **الارتفاع**: 50px
- **Border Radius**: `rounded-xl` (12px)
- **Padding**: `p-3` (12px)
- **الخلفية**: 
  - غير نشط: `bg-gray-100` أو `bg-muted`
  - نشط: لون مميز حسب الخطوة (انظر الألوان أدناه)
- **النص**: 
  - Font Size: `text-xs` (12px)
  - Font Weight: `font-bold`
  - اللون: `text-gray-600` (غير نشط) / `text-white` (نشط)

### الألوان لكل Card
1. **Card 0** (ابدأ رحلتك): `bg-emerald-500` / `bg-emerald-100`
2. **Card 1** (تفاصيل الطلب): `bg-amber-500` / `bg-amber-100`
3. **Card 2** (المدينة): `bg-blue-500` / `bg-blue-100`
4. **Card 3** (الحي): `bg-teal-500` / `bg-teal-100`
5. **Card 4** (نوع العقار): `bg-purple-500` / `bg-purple-100`
6. **Card 5** (المواصفات): `bg-orange-500` / `bg-orange-100`
7. **Card 6** (الميزانية): `bg-indigo-500` / `bg-indigo-100`
8. **Card 7** (اللمسات الأخيرة): `bg-pink-500` / `bg-pink-100`

### الأيقونات في Header Cards
- **الحجم**: `w-4 h-4` (16px)
- **اللون**: `text-gray-500` (غير نشط) / `text-white` (نشط)
- **المسافة**: `mr-2` (8px) من النص

---

## Content Area (منطقة المحتوى)

### التصميم العام
- **الارتفاع**: ديناميكي حسب المحتوى
- **Padding**: `p-4` أو `p-6`
- **Animation**: `animate-in slide-in-from-right-8` (انزلاق من اليمين)
- **المسافات**: `space-y-4` أو `space-y-6` بين العناصر

### Card 0: معلومات المستخدم (ابدأ رحلتك)

#### Input Fields
- **النوع**: Text Inputs
- **الارتفاع**: `h-10` (40px)
- **Border Radius**: `rounded-lg` (8px)
- **النص**: `text-center` (محاذاة في المنتصف)
- **Placeholder**: رمادي فاتح
- **الحدود**: `border-gray-200`
- **Focus State**: `border-primary` + `ring-2 ring-primary/20`

#### Fields:
1. **الاسم**: `placeholder="الاسم"`
2. **الهاتف**: `type="tel"` + `placeholder="05xxxxxxxx"` + `dir="ltr"`
3. **البريد**: `type="email"` + `placeholder="email@example.com"` + `dir="ltr"`

#### Category Selection (اختيار الفئة)
- **التخطيط**: `grid grid-cols-2 gap-4`
- **كل Card**:
  - **Border Radius**: `rounded-2xl` (16px)
  - **Border**: `border-2`
  - **Padding**: `p-4`
  - **الارتفاع**: `h-36` (144px)
  - **Hover**: `hover:shadow-lg`
  - **Selected State**: 
    - Border: `border-emerald-500` (سكني) / `border-amber-500` (تجاري)
    - Background: `bg-emerald-50` / `bg-amber-50`
    - Ring: `ring-2 ring-emerald-200` / `ring-amber-200`

#### Icon Circle داخل Category Card
- **الحجم**: `h-12 w-12` (48px)
- **Border Radius**: `rounded-full`
- **Background**: 
  - Selected: `bg-emerald-500` / `bg-amber-500`
  - Unselected: `bg-emerald-100` / `bg-amber-100`
- **Icon Size**: `h-6 w-6` (24px)

#### Button (التالي)
- **العرض**: `w-full`
- **الارتفاع**: `h-12` (48px)
- **Border Radius**: `rounded-xl` (12px)
- **Font Size**: `text-lg`
- **Disabled State**: `opacity-50` + `cursor-not-allowed`

---

### Card 1: تفاصيل الطلب

#### Transaction Type (الهدف من الطلب)
- **التخطيط**: `grid grid-cols-2 gap-4`
- **كل Card**:
  - **Border Radius**: `rounded-xl`
  - **Border**: `border-2`
  - **Padding**: `p-4`
  - **الارتفاع**: `h-32` (128px)
  - **Hover**: `hover:shadow-md`
  - **Selected**:
    - شراء: `border-emerald-500 bg-emerald-50`
    - إيجار: `border-blue-500 bg-blue-50`

#### Property Condition (حالة العقار)
- **التخطيط**: `grid grid-cols-3 gap-3`
- **كل Button**:
  - **Border Radius**: `rounded-xl`
  - **Border**: `border-2`
  - **Padding**: `p-3`
  - **Hover**: `hover:shadow-sm`
  - **Selected States**:
    - جديد: `border-amber-400 bg-amber-50`
    - مستخدم: `border-purple-400 bg-purple-50`
    - تحت الإنشاء: `border-orange-400 bg-orange-50`

#### Icon داخل Condition Button
- **Padding**: `p-2`
- **Border Radius**: `rounded-full`
- **Hover Effect**: `group-hover:scale-110` + `group-hover:-rotate-6` / `group-hover:rotate-6`

---

### Card 2: المدينة المفضلة

#### Search Input
- **Position**: `relative`
- **Icon**: `Search` icon في `absolute right-3 top-3`
- **Icon Size**: `h-4 w-4`
- **Input Height**: `h-12`
- **Border Radius**: `rounded-xl`
- **Padding Right**: `pr-10` (لإفساح المجال للأيقونة)

#### Cities Grid
- **Container**: `h-[240px] overflow-y-auto`
- **Grid**: `grid grid-cols-3 gap-2`
- **Padding**: `pr-2`
- **Scrollbar**: مخصص (`custom-scrollbar`)

#### City Button
- **Padding**: `py-3 px-2`
- **Border Radius**: `rounded-lg`
- **Border**: `border`
- **Font**: `text-sm font-bold`
- **States**:
  - **Unselected**: `bg-white hover:bg-muted border-border`
  - **Selected**: `bg-primary text-white border-primary`
- **Check Icon**: `w-3 h-3 ml-1` (يظهر عند الاختيار)

---

### Card 3: الحي المرغوب

#### Direction Filters (فلتر الاتجاهات)
- **Container**: `flex flex-wrap gap-2 justify-center`
- **Button Style**:
  - **Padding**: `px-4 py-2`
  - **Border Radius**: `rounded-full`
  - **Font**: `text-sm font-bold`
  - **States**:
    - Unselected: `bg-muted hover:bg-muted/80`
    - Selected: `bg-primary text-white`
- **Icons**: `Compass` icon `w-3 h-3` مع `gap-1`

#### Districts Grid
- **Container**: `h-[200px] overflow-y-auto`
- **Grid**: `grid grid-cols-3 gap-2`
- **Empty State**: `col-span-3 text-center text-muted-foreground py-10`

---

### Card 4: نوع العقار

#### Property Types Grid
- **Grid**: `grid grid-cols-3 gap-3`
- **Button Style**:
  - **Padding**: `p-4`
  - **Border Radius**: `rounded-xl`
  - **Border**: `border-2`
  - **Layout**: `flex flex-col items-center gap-2`
  - **States**:
    - Unselected: `border-border hover:bg-muted/50`
    - Selected: `border-primary bg-primary/5 text-primary`
- **Icon**: `h-6 w-6 opacity-70`
- **Text**: `text-xs font-bold text-center`

---

### Card 5: المواصفات الفنية

#### ScrollableOptions Component
هذا هو المكون الأساسي المستخدم في معظم الحقول:

**Container**:
- **Margin Bottom**: `mb-4`

**Label**:
- **Display**: `block`
- **Font**: `text-xs font-bold`
- **Color**: `text-gray-700`
- **Margin Bottom**: `mb-2`

**Options Container**:
- **Display**: `flex`
- **Gap**: `gap-2`
- **Overflow**: `overflow-x-auto`
- **Padding Bottom**: `pb-2`
- **Negative Margin**: `-mx-1 px-1` (لإزالة المسافات الجانبية)
- **Scrollbar**: مخفي (`scrollbar-hide`)

**Option Button**:
- **Flex**: `flex-shrink-0` (لا يتقلص)
- **Padding**: `px-3 py-2`
- **Border Radius**: `rounded-lg`
- **Border**: `border`
- **Font**: `text-xs font-bold`
- **Whitespace**: `whitespace-nowrap` (لا ينكسر)
- **Transition**: `transition-all`
- **States**:
  - **Unselected**: 
    - Background: `bg-white`
    - Border: `border-gray-200`
    - Text: `text-gray-600`
    - Hover: `hover:bg-gray-50`
  - **Selected**:
    - Background: `bg-primary`
    - Border: `border-primary`
    - Text: `text-white`
    - Shadow: `shadow-sm`
    - Scale: `scale-105` (تكبير بسيط)

#### أمثلة على الحقول:
- المساحة (م²)
- عدد الغرف
- عدد الحمامات
- عرض الواجهة
- ارتفاع السقف
- وغيرها...

---

### Card 6: الميزانية والاستثمار

#### Budget Options
- **Grid**: `grid grid-cols-2 gap-2`
- **Button Style**: نفس ScrollableOptions لكن `py-3 px-2`

#### Payment Method
- **Grid**: `grid grid-cols-2 gap-3`
- **Button Style**:
  - **Padding**: `p-3`
  - **Border Radius**: `rounded-xl`
  - **Border**: `border-2`
  - **Font**: `font-bold`
  - **Selected**: `border-primary bg-primary/10 text-primary`

#### Bank Selection (عند اختيار تمويل)
- **Grid**: `grid grid-cols-2 gap-2`
- **Button Style**:
  - **Padding**: `py-2 px-1`
  - **Border**: `border`
  - **Border Radius**: `rounded`
  - **Font**: `text-[10px] font-bold`
  - **Selected**: `bg-primary text-white`

---

### Card 7: اللمسات الأخيرة

#### Smart Tags (المميزات الإضافية)
- **Container**: `flex flex-wrap gap-2 max-h-40 overflow-y-auto`
- **Scrollbar**: مخصص (`custom-scrollbar`)
- **Button Style**:
  - **Padding**: `px-3 py-2`
  - **Border Radius**: `rounded-full`
  - **Border**: `border`
  - **Font**: `text-xs font-bold`
  - **Display**: `inline-flex items-center gap-2`
  - **Whitespace**: `whitespace-nowrap`
  - **Height**: `h-auto`
  - **States**:
    - **Unselected**: `bg-white hover:bg-gray-50 border-gray-200 text-gray-600`
    - **Selected**: `bg-primary text-white border-primary shadow-sm`
  - **Icons**: 
    - Unselected: `Plus` icon `w-3.5 h-3.5`
    - Selected: `Check` icon `w-3.5 h-3.5`

#### Notes Textarea
- **Height**: `h-24`
- **Resize**: `resize-none`
- **Border Radius**: `rounded-xl`
- **Placeholder**: "أو اكتب أي تفاصيل أخرى هنا..."

#### Submit Button
- **Width**: `w-full`
- **Height**: `h-12`
- **Border Radius**: `rounded-xl`
- **Font**: `text-lg`
- **Background**: `bg-gradient-to-r from-emerald-600 to-green-500`
- **Shadow**: `shadow-lg`
- **Text Color**: `text-white`
- **Hover**: `hover:from-emerald-700 hover:to-green-600`

---

## الألوان (Color Palette)

### Primary Colors
- **Primary**: `#3B82F6` (Blue) - يستخدم للأزرار والحالات النشطة
- **Emerald**: `#10B981` (Green) - للعناصر الإيجابية
- **Amber**: `#F59E0B` (Orange/Yellow) - للتنبيهات
- **Red**: `#EF4444` - للأخطاء

### Background Colors
- **White**: `#FFFFFF`
- **Gray 50**: `#F9FAFB` (hover states)
- **Gray 100**: `#F3F4F6` (muted backgrounds)
- **Gray 200**: `#E5E7EB` (borders)
- **Gray 600**: `#4B5563` (text)

### Card Colors (لكل خطوة)
1. Emerald: `#10B981` / `#D1FAE5`
2. Amber: `#F59E0B` / `#FEF3C7`
3. Blue: `#3B82F6` / `#DBEAFE`
4. Teal: `#14B8A6` / `#CCFBF1`
5. Purple: `#A855F7` / `#E9D5FF`
6. Orange: `#F97316` / `#FFEDD5`
7. Indigo: `#6366F1` / `#E0E7FF`
8. Pink: `#EC4899` / `#FCE7F3`

---

## الخطوط (Typography)

### Font Family
- **Primary**: نظامي (System Font)
- **Arabic Support**: دعم كامل للعربية

### Font Sizes
- **xs**: 12px (Labels, small text)
- **sm**: 14px (Body text)
- **base**: 16px (Default)
- **lg**: 18px (Buttons, headings)
- **xl**: 20px (Large headings)
- **2xl**: 24px (Page titles)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Bold**: 700

---

## التأثيرات والحركات (Animations & Transitions)

### Page Transitions
- **Slide In**: `slide-in-from-right-8` (انزلاق من اليمين)
- **Duration**: 200ms
- **Easing**: `ease-in-out`

### Button Hover Effects
- **Scale**: `scale-105` (تكبير 5%)
- **Shadow**: `shadow-sm` → `shadow-md`
- **Transition**: `transition-all duration-300`

### Icon Animations
- **Rotate**: `group-hover:rotate-6` / `group-hover:-rotate-6`
- **Scale**: `group-hover:scale-110`

### Selected States
- **Scale**: `scale-105` (للأزرار المختارة)
- **Ring**: `ring-2 ring-primary/20` (حلقة حول العنصر)

---

## الأيقونات (Icons)

### Icon Library
استخدام **Lucide React** icons

### Icon Sizes
- **Small**: `w-3 h-3` (12px) - للأيقونات الصغيرة
- **Medium**: `w-4 h-4` (16px) - للأيقونات المتوسطة
- **Large**: `w-6 h-6` (24px) - للأيقونات الكبيرة

### Icon Colors
- **Default**: `text-gray-500`
- **Active**: `text-primary` أو `text-white`
- **Muted**: `text-muted-foreground`

---

## الحالات التفاعلية (Interactive States)

### Input States
1. **Default**: `border-gray-200`
2. **Focus**: `border-primary` + `ring-2 ring-primary/20`
3. **Error**: `border-red-500` + `text-red-500`
4. **Disabled**: `opacity-50` + `cursor-not-allowed`

### Button States
1. **Default**: `bg-primary text-white`
2. **Hover**: `hover:bg-primary/90`
3. **Active**: `active:scale-95`
4. **Disabled**: `opacity-50 cursor-not-allowed`

### Selection States
1. **Unselected**: خلفية بيضاء + حدود رمادية
2. **Selected**: خلفية ملونة + حدود ملونة + نص أبيض
3. **Hover**: خلفية فاتحة + حدود ملونة

---

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- **Header Height**: 42px بدلاً من 50px
- **Content Height**: 480px بدلاً من 650px
- **Grid Columns**: تقليل الأعمدة (3 → 2 → 1)
- **Font Sizes**: تقليل الأحجام قليلاً
- **Padding**: تقليل المسافات

---

## Scrollbars

### Custom Scrollbar Style
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

## Spacing System

### Standard Spacing
- **xs**: 4px (gap-1)
- **sm**: 8px (gap-2)
- **md**: 12px (gap-3)
- **lg**: 16px (gap-4)
- **xl**: 24px (gap-6)

### Padding
- **Card**: `p-4` (16px) أو `p-6` (24px)
- **Input**: `px-3 py-2` أو `px-4 py-3`
- **Button**: `px-4 py-2` أو `px-6 py-3`

---

## Border Radius

- **sm**: 4px (`rounded`)
- **md**: 8px (`rounded-lg`)
- **lg**: 12px (`rounded-xl`)
- **xl**: 16px (`rounded-2xl`)
- **full**: 9999px (`rounded-full`)

---

## Shadows

- **sm**: `shadow-sm` - ظل خفيف
- **md**: `shadow-md` - ظل متوسط
- **lg**: `shadow-lg` - ظل كبير
- **xl**: `shadow-xl` - ظل كبير جداً
- **2xl**: `shadow-2xl` - ظل ضخم

---

## Accessibility

### Focus States
- **Visible**: دائماً مرئي
- **Style**: `ring-2 ring-primary/20`
- **Outline**: `outline-none` (يتم استبداله بالـ ring)

### ARIA Labels
- جميع الأزرار تحتوي على `aria-label`
- جميع الحقول تحتوي على `label` مرتبط

### Keyboard Navigation
- **Tab**: التنقل بين العناصر
- **Enter**: تفعيل الأزرار
- **Arrow Keys**: التنقل في القوائم

---

## ملاحظات إضافية للمصمم

1. **RTL Support**: التصميم يدعم العربية (RTL) بالكامل
2. **Consistency**: جميع العناصر متسقة في التصميم
3. **Visual Hierarchy**: استخدام الألوان والأحجام لإنشاء هرم بصري واضح
4. **Feedback**: كل تفاعل له رد فعل بصري واضح
5. **Loading States**: إضافة حالات تحميل عند الحاجة
6. **Error States**: تصميم واضح لحالات الخطأ
7. **Empty States**: تصميم لحالات عدم وجود بيانات

---

## أمثلة على التصميمات المطلوبة

### 1. ScrollableOptions Component
```
┌─────────────────────────────────────┐
│ المساحة (م²)                        │
├─────────────────────────────────────┤
│ [< 50] [50-100] [100-200] [200+] → │
│  ↑ Selected (Primary bg)            │
└─────────────────────────────────────┘
```

### 2. Category Selection
```
┌──────────────┬──────────────┐
│   [Icon]     │   [Icon]     │
│    سكني      │    تجاري     │
│  فلل، شقق    │  مكاتب، معارض│
└──────────────┴──────────────┘
```

### 3. City/District Grid
```
┌──────┬──────┬──────┐
│ [✓]  │      │      │
│ الرياض│ جدة │ الدمام│
├──────┼──────┼──────┤
│      │ [✓]  │      │
│ ...  │ ...  │ ...  │
└──────┴──────┴──────┘
```

---

## الملفات المرجعية

- **Component**: `client/src/components/AdvancedSearchForm.tsx`
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Colors**: نظام الألوان في Tailwind

---

## الخلاصة

هذا نموذج بحث عقاري متقدم يتكون من 8 خطوات تفاعلية. كل خطوة لها لون مميز وتصميم فريد. التصميم نظيف وحديث مع دعم كامل للعربية (RTL). جميع العناصر متسقة وتتبع نظام تصميم موحد.

**التركيز على**:
- ✅ بساطة الاستخدام
- ✅ وضوح التصميم
- ✅ تجربة مستخدم سلسة
- ✅ دعم كامل للعربية
- ✅ تصميم متجاوب (Responsive)
- ✅ تأثيرات بصرية جذابة



# Design Guidelines: منصة تطابق (Tatābuk) Real Estate Matching Platform

## Design Approach
**System-Based Approach**: Adapting Material Design principles for Arabic RTL layout with focus on clarity, functionality, and trust-building for a real estate SaaS platform.

## Core Design Principles
1. **Arabic-First RTL Design**: All layouts flow right-to-left naturally
2. **Example-Driven Clarity**: Show, don't just tell - use real examples throughout
3. **Professional Trust**: Clean, spacious layouts that convey reliability
4. **Friction-Free Forms**: Multi-step forms feel conversational, not bureaucratic

---

## Typography System

### Font Families
- **Primary Arabic**: 'Tajawal' (Google Fonts) - modern, highly legible for Arabic
- **Secondary/UI**: 'Cairo' for UI elements and numbers
- **Fallback**: system-ui Arabic fonts

### Type Scale (Desktop → Mobile)
- **Hero Headlines**: 56px → 36px, bold (700)
- **Section Titles**: 36px → 28px, bold (700)
- **Card Headers**: 24px → 20px, semibold (600)
- **Body Text**: 18px → 16px, regular (400)
- **Helper/Labels**: 14px → 13px, medium (500)
- **Captions**: 12px, regular (400)

### Hierarchy Rules
- Maintain 1.5 line height for body text (optimal Arabic readability)
- Use weight variation over size for subtle emphasis
- Numbers always use tabular figures for alignment

---

## Layout System

### Spacing Primitives
Use Tailwind units: **4, 6, 8, 12, 16, 24** (as in p-4, gap-6, mb-8, py-12, px-16, space-y-24)

### Container Strategy
- **Full-width sections**: w-full with inner container max-w-7xl
- **Content sections**: max-w-6xl mx-auto
- **Form containers**: max-w-2xl for optimal form completion
- **Text content**: max-w-prose (65ch) for readability

### Grid System
- **Desktop**: 12-column grid with gap-6
- **Tablet**: 8-column grid with gap-4  
- **Mobile**: 4-column grid with gap-4
- **Feature Cards**: 3 columns desktop → 2 tablet → 1 mobile

---

## Page Structure

### Landing Page (Home)

**Hero Section** (80vh):
- Container: max-w-7xl, px-8, centered
- Two-column split: 5/7 right (content) + 2/7 left (visual)
- Right side: Large headline + subtext + dual CTA buttons stacked vertically with gap-4
- Left side: Animated example cards showing user scenarios (see Images section)
- Mobile: Single column, visual above content

**Example Scenarios Section** (py-24):
- Title: "كيف تعمل المنصة" (How It Works)
- 3 example cards in grid (grid-cols-1 md:grid-cols-3, gap-8)
- Each card: Icon top, Arabic name/scenario, brief description
- Cards have elevated shadow and rounded-xl borders

**Features Section** (py-24):
- 6 feature cards in 2 rows (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card: Icon, bold title, 2-line description
- Spacing: gap-8 between cards, p-6 internal padding

**How Matching Works** (py-20):
- Single column max-w-4xl
- 4-step visual timeline (vertical on mobile, horizontal on desktop)
- Each step: Number badge + title + description

**CTA Section** (py-32):
- Centered content, max-w-3xl
- Large headline + supporting text + dual buttons (horizontal on desktop)

**Footer** (py-16):
- 4-column layout desktop → stack mobile
- Columns: About, Quick Links, Contact Info, Social Media
- Bottom bar: Copyright + Privacy/Terms links

### Registration Forms

**Multi-Step Form Container**:
- max-w-3xl, centered with shadow-2xl elevation
- Progress indicator: horizontal stepper showing 1/5, 2/5, etc.
- Each step: Single focused question with helper text
- Example text shown in muted style above input
- Navigation: "التالي" (Next) prominent, "السابق" (Back) subtle

**Step Layout Pattern**:
- Question number badge (1, 2, 3...)
- Large question text (24px)
- Helper/example text (16px, muted)
- Input field (large, min-h-12)
- Error/validation messages below input
- Spacing: gap-6 between elements

### Dashboards

**Buyer Dashboard**:
- Sidebar navigation (20% width) + main content (80%)
- Stats cards row: 4 cards showing (Active Wishes, Matches Found, Saved Properties, Messages)
- Tabbed content: "العروض المطابقة" / "رغباتي" / "المفضلة"
- Property cards: image top, details below, action buttons at bottom
- Grid: 2 columns desktop → 1 mobile with gap-6

**Seller Dashboard**:
- Similar sidebar structure
- Property management table: sortable columns, action buttons per row
- "Add Property" prominent FAB button (fixed bottom-right on mobile)
- Stats: Views, Interested Buyers, Active Listings

**Admin Dashboard**:
- Comprehensive sidebar with collapsible sections
- Top stats bar: 6 key metrics in grid
- Filters panel: collapsible right sidebar (300px width)
- Data table: alternating row styling, pagination at bottom
- Charts section: 2-column grid for analytics (using Chart.js)

---

## Component Library

### Buttons
- **Primary CTA**: Rounded-lg, px-8, py-4, text-lg, shadow-md
- **Secondary**: Rounded-lg, px-6, py-3, border-2, text-base
- **Ghost**: No border, underline on hover, px-4, py-2
- **Icon Buttons**: w-12, h-12, rounded-full for actions

### Form Inputs
- **Text Input**: Rounded-lg, border-2, px-4, py-3, text-base, min-h-12
- **Dropdown**: Same styling as text input with chevron icon
- **Radio/Checkbox**: Large touch targets (min 24px), labels with px-3 spacing
- **Multi-select Chips**: Rounded-full pills that can be clicked to toggle

### Cards
- **Property Card**: Rounded-xl, shadow-lg, overflow-hidden
  - Image: aspect-video, object-cover
  - Content padding: p-6
  - Footer: border-top, p-4, flex justify-between
- **Feature Card**: Rounded-lg, border, p-6, hover lift effect (transform -translate-y-1)
- **Stat Card**: Rounded-xl, p-6, number emphasis with large font

### Navigation
- **Top Nav**: h-20, sticky top-0, shadow-sm
  - Logo right side
  - Links centered  
  - User menu/login left side
- **Sidebar**: w-64, fixed right side, py-6
  - Nav items: rounded-lg, px-4, py-3, mb-2
  - Icons 20px, text 16px, gap-3

### Modals/Overlays
- **Modal**: max-w-2xl, rounded-2xl, shadow-2xl
- **Backdrop**: Semi-transparent overlay
- **Toast Notifications**: Fixed top-left (RTL), rounded-lg, p-4, slide-in animation

---

## Images

### Hero Section Image
Large illustration or photo showing a happy Saudi family with their home keys or in front of a modern Saudi building. Style: Professional photography or modern illustration. Placement: Left side of hero (2/7 width), rounded-2xl with shadow.

### Example Scenario Cards
Small avatar-style illustrations or icons representing:
1. "عبدالسلام محمد - جدة" with apartment icon
2. "فاطمة أحمد - الرياض" with villa icon  
3. "شركة التطوير" with building icon

These are decorative icons/avatars, not full images. Use icon libraries or simple SVG illustrations.

### Property Cards
Each property listing requires an image placeholder:
- Aspect ratio: 16:9
- Placeholder showing building facade or interior room
- Fallback: Gradient with property type icon

### Dashboard Empty States
Illustrations for:
- No matches yet: searching/matching concept
- No saved properties: bookmark/save concept
- No messages: communication concept

Use illustration libraries like unDraw or similar for consistent style.

---

## RTL-Specific Considerations

- All flex/grid directions reverse: flex-row-reverse is default
- Text alignment: text-right for paragraphs
- Icons: Mirror directional icons (arrows, chevrons)
- Forms: Labels positioned right of inputs
- Navigation: Breadcrumbs flow right-to-left
- Animations: Slide-in from right, slide-out to left
- Shadows: Adjust to maintain visual weight consistency

---

## Responsive Breakpoints

- **Mobile**: < 768px - single column, stacked CTAs, full-width cards
- **Tablet**: 768px - 1024px - 2-column grids, condensed spacing
- **Desktop**: > 1024px - full multi-column layouts, generous spacing

Use `md:` and `lg:` prefixes consistently for these breakpoints.

---

## Accessibility

- Minimum touch targets: 44px × 44px (critical for Arabic mobile users)
- Form labels: Always visible, never placeholder-only
- Focus states: 3px outline with offset for keyboard navigation
- ARIA labels: Proper Arabic labeling for screen readers
- Contrast: Minimum 4.5:1 for body text, 3:1 for large text

---

**Critical Note**: This is a professional SaaS platform requiring trust and clarity. Every section should feel complete and purposeful. Forms must feel conversational with clear examples. The Arabic language experience must be flawless and natural, not a translation.
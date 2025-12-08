# تطابق (Tatābuk) - Real Estate Matching Platform

## Overview

تطابق is an Arabic-first, RTL-oriented SaaS platform that intelligently matches real estate buyers with sellers. Unlike traditional listing platforms, it focuses on capturing buyer preferences and proactively recommending suitable properties through weekly notifications via WhatsApp and email. The platform serves three user types: buyers seeking properties, sellers (individuals, developers, or real estate offices), and administrators managing the matching system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Language**: React 18+ with TypeScript in strict mode, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight React router (~1.2KB). Routes include home (`/`), buyer form (`/buyer-form`), seller form (`/seller-form`), and admin dashboard (`/admin`).

**UI Component System**: Shadcn/ui components (New York style variant) built on Radix UI primitives, providing accessible, unstyled base components. The design system is heavily customized for Arabic RTL layouts with specific typography and spacing rules defined in `design_guidelines.md`.

**Styling Strategy**: Tailwind CSS with extensive CSS custom properties for theming. The color system uses HSL values with alpha channel support. Typography uses Google Fonts 'Tajawal' (primary Arabic font) and 'Cairo' (secondary/UI font) with carefully defined type scales that adapt from desktop to mobile.

**State Management**: TanStack Query (React Query) v5 for server state management with custom query client configured for credential-based authentication. No global client state management library - component state and React Query suffice.

**Form Handling**: Multi-step forms use local React state. The buyer and seller forms feature conversational UX with step-by-step progression and visual progress indicators.

**Design System Approach**: Material Design principles adapted for Arabic RTL with focus on spacious layouts, example-driven clarity (showing real examples rather than placeholders), and friction-free form experiences.

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js server, written in TypeScript and compiled to CommonJS for production using esbuild.

**API Design**: RESTful API with routes registered in `server/routes.ts`. Key endpoints include:
- `/api/buyers/register` - Create buyer preferences
- `/api/properties` - Property CRUD operations
- `/api/admin/*` - Administrative analytics and management
- `/api/admin/analytics/*` - Statistical data (top districts, budget analysis, property type demand)
- `/api/admin/clients` - Get all clients (buyers) with their preferences for sending management
- `/api/admin/clients/:preferenceId/send` - Manual send to a specific client
- `/api/admin/send-all` - Bulk send to all active clients
- `/api/admin/send-logs` - Get send history with enriched user/property data

**Data Access Layer**: Storage abstraction (`server/storage.ts`) defining an `IStorage` interface with methods for users, buyer preferences, properties, matches, and contact requests. This abstraction enables future storage backend changes without modifying business logic.

**Matching Algorithm**: The platform implements intelligent matching between buyer preferences and available properties. Methods `findMatchesForProperty` and `findMatchesForPreference` handle bidirectional matching logic, creating match records that track compatibility scores and statuses.

**Session Management**: Express sessions with support for PostgreSQL-backed session storage via `connect-pg-simple` (though session implementation may not be fully configured in current codebase).

### Data Storage

**Database**: PostgreSQL accessed through Drizzle ORM, with schema defined in `shared/schema.ts`.

**Schema Design**:
- **users**: Polymorphic table supporting buyer, seller, and admin roles with optional `accountType` (individual/developer/office) and `entityName` for sellers. Includes seller verification fields for REGA compliance (see Seller Verification section).
- **buyerPreferences**: Captures buyer requirements including city, districts (array), property type, budget range, payment method, and purchase purpose
- **properties**: Seller listings with type, location, price, area, rooms, status, and additional fields (bathrooms, furnishing, yearBuilt, amenities array)
- **matches**: Junction table linking buyer preferences to properties with compatibility scoring
- **contactRequests**: Tracks buyer-seller connection attempts

### Seller Verification System (REGA Compliance)

**Purpose**: Saudi Arabia's Real Estate General Authority (REGA) requires real estate advertisers to be licensed. The platform enforces regulatory compliance through seller verification.

**User Schema Verification Fields**:
- `isVerified`: Boolean flag indicating if seller is verified (displayed as "موثوق" badge)
- `verificationStatus`: Workflow status - pending, in_review, approved, rejected, expired
- `falLicenseNumber`: FAL license number from REGA (رقم رخصة فال)
- `adLicenseNumber`: Advertisement license number (رقم ترخيص الإعلان)
- `licenseIssueDate`: License issue date (تاريخ إصدار الترخيص)
- `licenseExpiryDate`: License expiry date (تاريخ انتهاء الترخيص)
- `commercialRegNumber`: Commercial registration number for companies (رقم السجل التجاري)
- `nationalId`: National ID / Iqama number (رقم الهوية/الإقامة)
- `city`: Office/headquarters city (مدينة المكتب)
- `officeAddress`: Office address (عنوان المكتب)
- `whatsappNumber`: WhatsApp contact number (رقم واتساب للتواصل)
- `websiteUrl`: Website URL (الموقع الإلكتروني)

**UI Display**:
- Verified sellers show green "موثوق" badge with ShieldCheck icon on property detail page
- License information section displays FAL license, ad license, expiry date, and commercial registration
- Unverified sellers show amber warning notice "لم يتم التحقق من هذا المعلن بعد"
- WhatsApp button appears if seller has whatsappNumber set

**Test IDs**:
- `badge-verified`: Verification badge
- `text-fal-license`: FAL license number
- `text-ad-license`: Advertisement license number
- `button-whatsapp`: WhatsApp contact button

**Unique Architectural Decisions**:
- Districts stored as PostgreSQL text arrays for multi-district preferences
- UUID primary keys using `gen_random_uuid()` for all tables
- Soft filtering with `isActive` flags rather than hard deletes
- Budget stored as integer (likely SAR fils or smallest currency unit)

**ORM Choice Rationale**: Drizzle ORM selected for type-safe queries with minimal runtime overhead and excellent TypeScript integration. Zod schemas auto-generated from Drizzle schemas via `drizzle-zod` ensure type consistency across validation layers.

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.)
- Recharts for admin dashboard analytics visualization
- Embla Carousel for potential property image carousels
- Lucide React for iconography
- React Icons (specifically `react-icons/si` for social media icons)

**Utility Libraries**:
- `class-variance-authority` (CVA) for type-safe component variant management
- `clsx` and `tailwind-merge` for conditional className composition
- `date-fns` for date manipulation
- `nanoid` for generating unique identifiers
- `zod` for runtime schema validation with `zod-validation-error` for user-friendly error messages

**Build & Development Tools**:
- Vite plugins: `@vitejs/plugin-react`, Replit-specific plugins for error overlays, cartographer, and dev banner
- esbuild for server-side bundling with selective dependency bundling (allowlist approach)
- Drizzle Kit for database migrations

**Communication Channels** (planned/implied):
- WhatsApp Business API (referenced in requirements but not yet implemented)
- Email service (nodemailer listed in package.json but not actively used in shown code)

**Database Infrastructure**:
- PostgreSQL via `pg` (node-postgres) driver
- Connection pooling through `pg.Pool`
- Environment-based connection string configuration

**Analytics & Monitoring**: Admin dashboard implements custom analytics (top districts, average budgets by city, demand by property type) using direct database queries with Drizzle ORM aggregations.

**Notable Absent Dependencies**: No authentication library fully implemented despite passport.js being in dependencies. No payment processing despite Stripe being listed. No file upload handling despite multer being present. These suggest planned features not yet implemented or scaffolding from template.

### Saudi Arabia Locations Database

**File Location**: `shared/saudi-locations.ts`

**Comprehensive Database**: Contains 23 major Saudi cities with their neighborhoods (over 400 neighborhoods total). Cities include:
- Riyadh (الرياض) - 50 neighborhoods
- Jeddah (جدة) - 40 neighborhoods
- Makkah (مكة المكرمة) - 20 neighborhoods
- Madinah (المدينة المنورة) - 20 neighborhoods
- Dammam (الدمام) - 25 neighborhoods
- Al Khobar (الخبر) - 20 neighborhoods
- And 17 more cities...

**Helper Functions**:
- `getCityNames()` - Returns list of all city names
- `getNeighborhoodsByCity(cityName)` - Returns neighborhoods for a specific city
- `getCityByName(cityName)` - Returns full city object with region and neighborhoods
- `searchNeighborhoods(query)` - Searches neighborhoods across all cities
- `getRegions()` - Returns list of Saudi regions
- `getCitiesByRegion(regionName)` - Returns cities in a specific region

**Usage in Profile Page**: City and neighborhood dropdowns are dynamically linked - selecting a city populates the neighborhood dropdown with that city's neighborhoods only.

### Profile Page Features

**Expandable Inline Editing**: Each property/preference card has an expand/collapse button (ChevronDown/ChevronUp icon) that reveals inline editing fields with auto-save functionality.

**Auto-Save**: Changes to any field trigger automatic save on blur, with loading spinner during save and toast confirmation.

**Tabbed Interface**: Profile page uses tabs to separate:
- Items tab: Shows buyer preferences or seller properties with inline editing
- Messages tab: In-app messaging system for buyer-seller communication

### In-App Messaging System

**Database Schema**:
- **conversations**: Links buyerId, sellerId, and propertyId with unread counts for both parties
- **messages**: Individual messages with senderId, content, messageType, and read status

**API Endpoints**:
- `GET /api/conversations` - Get user's conversations with query param `userId`
- `GET /api/conversations/:id` - Get specific conversation with messages
- `POST /api/conversations` - Create new conversation (buyerId, sellerId, propertyId)
- `POST /api/conversations/:id/read` - Mark conversation as read for user
- `POST /api/messages` - Send new message (conversationId, senderId, content)
- `GET /api/messages/:conversationId` - Get messages for a conversation

**MessagingPanel Component**: Located at `client/src/components/MessagingPanel.tsx`
- Two-column layout: conversations list and active chat
- Real-time polling every 5-10 seconds for new messages
- Unread badge counts on conversation list items
- Links to property detail pages from conversation headers
- RTL-optimized message bubbles (sent messages on left, received on right)

### Property Detail Page (/property/:id)

**Design**: Inspired by Bayut.sa layout with Arabic RTL orientation.

**Key Features**:
- Breadcrumb navigation: الرئيسية > للبيع > نوع العقار > المدينة > الحي
- Image gallery with main image (3-column span) and thumbnail grid (1 column, 3 rows)
- Fullscreen gallery modal with navigation controls (arrow buttons, image counter)
- Price display with per-square-meter calculation
- Quick specs row: غرف نوم, دورات مياه, مساحة
- Property info table: نوع العقار, حالة البناء, التأثيث, عدد الغرف, دورات المياه, سنة البناء
- Features/amenities section with icons (parking, ac, wifi, security, garden, gym, maid_room, electricity, water)
- Seller contact card with messaging and call buttons
- Google Maps embed if coordinates available
- CTA card encouraging visitors to register their preferences

**Database Fields** (added Dec 2025):
- `bathrooms`: Number of bathrooms (text)
- `furnishing`: Furnishing status - furnished, semi_furnished, unfurnished
- `yearBuilt`: Year the property was built (text)
- `amenities`: Array of amenity identifiers (text array)

**Test IDs**:
- `link-home`: Breadcrumb home link
- `img-property-main`: Main property image
- `img-thumbnail-{idx}`: Desktop thumbnail images
- `img-mobile-thumbnail-{idx}`: Mobile thumbnail images
- `text-property-price`: Price display
- `text-property-location`: Location text
- `text-property-title`: Property title
- `text-property-description`: Description text
- `text-seller-name`: Seller name
- `button-share`: Share button
- `button-favorite`: Favorite button
- `button-start-conversation`: Message seller button
- `button-call-seller`: Call seller button
- `button-close-gallery`: Close gallery modal
- `button-gallery-next`: Gallery next image
- `button-gallery-prev`: Gallery previous image
- `amenity-{amenityId}`: Amenity items
# تطابق (Tatābuk) - Real Estate Matching Platform

## Overview

تطابق is an Arabic-first, RTL-oriented SaaS platform designed to intelligently match real estate buyers with sellers. It moves beyond traditional listings by capturing detailed buyer preferences and proactively recommending suitable properties through weekly WhatsApp and email notifications. The platform operates on a unified account model, allowing any user to simultaneously hold buyer preferences and list properties as a seller, alongside an administrator role for system management. The business vision is to streamline the real estate matching process in the Arab world, offering a personalized and efficient experience for both parties, while ensuring compliance with local regulations like Saudi Arabia's REGA.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18+ and TypeScript, utilizing Vite for development and bundling. Wouter handles client-side routing, defining paths for home, buyer/seller forms, and an admin dashboard. UI components are built using Shadcn/ui (New York style) on Radix UI primitives, extensively customized for Arabic RTL layouts with specific typography (Google Fonts 'Tajawal' and 'Cairo') and spacing, detailed in `design_guidelines.md`. Styling is managed with Tailwind CSS, employing HSL values for a flexible color system. TanStack Query v5 manages server state, and multi-step forms use local React state for conversational UX. The design adheres to Material Design principles adapted for Arabic RTL, emphasizing spaciousness and friction-free user experiences.

### Backend Architecture

The backend is a Node.js Express.js server written in TypeScript. It exposes a RESTful API with endpoints for buyer registration, property CRUD operations, and comprehensive admin functionalities, including analytics, client management, and bulk/manual notification sending. A storage abstraction layer (`server/storage.ts`) ensures flexibility for future database changes. The core matching algorithm intelligently links buyer preferences with properties, creating match records with compatibility scores. Session management is planned with Express sessions and PostgreSQL storage.

### Data Storage

The platform uses PostgreSQL accessed via Drizzle ORM, with a schema defined in `shared/schema.ts`. Key tables include `users` (polymorphic for roles and account types, including seller verification fields), `buyerPreferences`, `properties`, `matches` (junction table), and `contactRequests`. UUIDs are used for primary keys, and soft filtering with `isActive` flags is preferred over hard deletes. Budget values are stored as integers. Drizzle ORM was chosen for its type-safe queries and strong TypeScript integration, complemented by Zod for runtime schema validation.

### Seller Verification System (REGA Compliance)

To comply with Saudi Arabia's Real Estate General Authority (REGA) regulations, the platform incorporates a seller verification system. The `users` schema includes fields like `isVerified`, `verificationStatus`, `falLicenseNumber`, `adLicenseNumber`, `commercialRegNumber`, and `nationalId`. The UI displays verification badges ("موثوق"), license information, and warnings for unverified sellers, alongside a WhatsApp contact button.

### Unique Architectural Decisions

- Districts are stored as PostgreSQL text arrays.
- UUID primary keys are used across all tables.
- Soft filtering is implemented with `isActive` flags.
- Budget is stored as an integer (smallest currency unit).
- The "unified account model" allows users to manage both buyer preferences and seller properties through a tabbed profile interface with inline editing and auto-save.
- An in-app messaging system facilitates communication between buyers and sellers, featuring conversation lists, real-time polling, unread counts, and RTL-optimized message bubbles.
- Property detail pages are designed akin to Bayut.sa, including comprehensive property information, an image gallery, price calculations, amenities with icons, a seller contact card, and Google Maps integration.

## External Dependencies

### Third-Party UI Libraries

- **Radix UI**: Primitives for accessible components (accordion, dialog, dropdown, etc.).
- **Shadcn/ui**: Component library built on Radix UI.
- **Recharts**: For admin dashboard analytics.
- **Embla Carousel**: For property image carousels.
- **Lucide React & React Icons**: For iconography.

### Utility Libraries

- **class-variance-authority (CVA)**: Type-safe component variant management.
- **clsx & tailwind-merge**: For conditional className composition.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **zod**: Runtime schema validation.

### Build & Development Tools

- **Vite**: Build tool and development server.
- **esbuild**: Server-side bundling.
- **Drizzle Kit**: Database migrations.

### Communication & Database Infrastructure

- **PostgreSQL**: Primary database accessed via `pg` driver and connection pooling.
- **Saudi Arabia Locations Database**: `shared/saudi-locations.ts` contains a comprehensive database of Saudi cities and neighborhoods, used for dynamic dropdowns.

### Planned/Implied External Services (not fully implemented)

- WhatsApp Business API
- Email service (Nodemailer)
- Payment processing (Stripe)
- File upload handling (Multer)
- Authentication (Passport.js)
```
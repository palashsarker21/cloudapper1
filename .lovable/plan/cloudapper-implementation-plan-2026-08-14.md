# CloudApper Implementation Plan

Build the initial production-quality foundation for CloudApper, a premium marketplace for AI tools, credits, and digital products.

## UI/UX Design
- **Theme**: Premium, modern, clean light mode.
- **Typography**: Clean sans-serif (Inter/Geist) with professional spacing.
- **Components**: shadcn/ui base with custom marketplace styling.
- **Layout**: Mobile-first responsive grid.

## Core Components
- **Navigation**: Sticky header with logo, main links (Marketplace, AI Tools, Credits, Extensions, Digital Products, Pricing, Support), search bar, and Login button.
- **Hero**: Impactful headline and description with "Explore Marketplace" and "Track Order" CTAs.
- **Category Grid**: Interactive icons for various categories (AI Credits, AI Tools, etc.).
- **Product Card**: Reusable component for featured products (title, category, price, thumbnail, rating placeholder).
- **Informational Sections**: "Why CloudApper" (features), "How It Works" (process steps), and FAQ preview.
- **Footer**: Multi-column layout with social links, legal, and site map.

## Technical Tasks
- [ ] Initialize shadcn/ui components (Button, Card, Input, Badge, Accordion, etc.).
- [ ] Implement `Header`, `Hero`, `CategorySection`, `FeaturedProducts`, `ProcessSection`, and `Footer`.
- [ ] Define shared Types for Marketplace items.
- [ ] Set up empty state components for missing data.
- [ ] Ensure Supabase-ready structure (clean data fetching patterns).

## Technical Details
- **Framework**: TanStack Start (React 19).
- **Styling**: Tailwind CSS v4.
- **Components**: Lucide-react for icons, Radix UI via shadcn/ui.
- **State**: Client-side navigation, ready for TanStack Query.
- **Assets**: Placeholder images/icons for initial build.

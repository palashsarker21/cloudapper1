# Enterprise Landing Page Upgrade Plan

Upgrade CloudApper's landing page into a polished, enterprise-grade marketplace while maintaining all existing functionality.

## User Review Required

> [!IMPORTANT]
> The plan uses real database data only. Sections like "Featured Products" will show professional empty states if no data is found.

- **Logo Verification**: The official logo `/brand/cloudapper-logo.png` will be used throughout.
- **Navigation**: Improved header with clear marketplace categorization.
- **Empty States**: Professional messaging instead of "No products found".

## Proposed Changes

### Core Foundation
- **SEO & Metadata**: Update `src/routes/index.tsx` with production-grade metadata, canonical URL, and Schema.org structured data.
- **Branding**: Ensure consistent use of the official CloudApper logo across Header, Hero, and Footer.

### Header & Navigation
- **Header**: Update `src/components/marketplace/Header.tsx` with a refined navigation menu (Marketplace sub-menu, AI Tools, AI Credits, Extensions, Support).
- **Mobile Drawer**: Ensure a clean, professional mobile navigation experience.

### Landing Page Sections (`src/routes/index.tsx`)
- **Hero**: Implement a high-impact enterprise hero with the requested headline, supporting line, and a compact trust row.
- **Categories**: Upgrade discovery section with clean icons for AI Tools, AI Credits, Extensions, SaaS, Digital Products, and Templates.
- **Featured Products**: Connect to real database via existing server functions; implement a professional "preparing next collection" empty state.
- **Value Proposition**: Add "Why teams choose CloudApper" section with four key value pillars.
- **Process (How It Works)**: Replace with "From discovery to delivery" 6-step flow.
- **New Sections**:
    - **Trust & Security**: Highlighting secure access, verification, and audit-ready workflows.
    - **Product Discovery**: Cards for Developers, Creators, and Teams.
    - **Order Tracking CTA**: Prominent section for existing customers.
    - **Account Benefits**: Explaining history, status, and licenses.

### Footer
- **Navigation**: Fix navigation links to point to real routes.
- **Branding**: Include logo and "AI Tools, Credits & Digital Products" tagline.

## Technical Details
- **Tech Stack**: TanStack Start v1, React 19, Tailwind v4, Lucide Icons, shadcn/ui.
- **Data Fetching**: Use TanStack Query with existing server functions.
- **Responsiveness**: Mobile-first design focusing on Android/iOS compatibility.
- **Accessibility**: Semantic HTML (H1-H6), ARIA labels, and keyboard navigation.

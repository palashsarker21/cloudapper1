# CloudApper Production Design System Implementation Plan

This plan outlines the steps to implement a premium, logo-derived visual design system for CloudApper, focusing on 3D/5D depth, layered backgrounds, and unified brand identity.

## 1. Core Design Tokens & Global Styles
- **Update `src/styles.css`**:
  - Define Surface 0 (base), Surface 1 (section), Surface 2 (elevated card), and Surface 3 (active/featured).
  - Refine `oklch` color palette based on logo analysis:
    - Primary: Electric Cyan (`oklch(0.65 0.25 240)`)
    - Secondary: Deep Space Blue (`oklch(0.2 0.1 260)`)
    - Accent: Vivid Magenta (`oklch(0.55 0.3 320)`)
  - Create layered gradient tokens (Brand, Hero, Surface).
  - Define a unified shadow system (Soft, Elevated, Glow).
  - Implement dimensional border tokens.

## 2. Base Components Refinement
- **Button System**: 
  - Centralize `default`, `secondary`, `outline`, and `ghost` variants in `src/components/ui/button.tsx`.
  - Add dimensional depth and brand-colored hover/active states.
- **Card System**:
  - Update `src/components/ui/card.tsx` to support surface levels.
  - Apply consistent radii and soft layered shadows.
- **Form Elements**:
  - Update `src/components/ui/input.tsx` and related components with brand focus states and refined backgrounds.

## 3. Layout & Navigation
- **Header**:
  - Apply Surface 1 styling with backdrop blur.
  - Refine navigation hover/active states using Electric Cyan accents.
  - Style search bar and account controls to match the premium theme.
- **Hero Section**:
  - Implement a layered gradient background using logo colors.
  - Add subtle 3D depth elements (glows, floating accents).
- **Footer**:
  - Apply Surface 0/Secondary styling for a grounded feel.

## 4. Product & Category Showcase
- **Product Cards**:
  - Enhance `src/components/marketplace/FeaturedProducts.tsx` (ProductCard) with Surface 2/3 styling.
  - Add 3D elevation on hover.
  - Ensure all metadata (price, rating, delivery) follows brand typography and contrast rules.
- **Category Cards**:
  - Update `src/components/marketplace/CategorySection.tsx` with controlled brand accents.
  - Standardize icon containers and visual weight.

## 5. Specialized Pages & Dashboards
- **Checkout & Track Order**:
  - Refine for high readability while maintaining brand identity through buttons and status indicators.
- **Login/Signup**:
  - Style as a focused "CloudApper Portal" with premium card treatment.
- **Admin & Customer Dashboard**:
  - Unify styling of sidebars, tables, and statistics cards with the main marketplace design system.

## 6. Audit & Cleanup
- Audit the entire codebase to replace hardcoded colors (e.g., `text-blue-600`, `bg-indigo-500`) with semantic tokens (`text-primary`, `bg-surface-2`).
- Ensure mobile responsiveness for all new visual elements.
- Verify contrast ratios for accessibility.

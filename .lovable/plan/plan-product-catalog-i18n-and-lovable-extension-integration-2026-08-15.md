# Plan: Product Catalog, i18n, and Lovable Extension Integration

Upgrade CloudApper into a real production digital marketplace by implementing a bilingual product catalog centered around the Lovable Unlimited Credits Extension.

## User Review Required

> [!IMPORTANT]
> The "Lifetime" package for the Lovable Extension will be marked as `provider_configuration_required` until verified with Eklas.

- **Language Support**: English (Primary) and Bengali (Secondary) will be accessible via a global header switcher.
- **Product Catalog**: All products, packages, and prices will be authoritative from the database.
- **Primary Product**: "Lovable Unlimited Credits Extension" will be featured on the homepage and in the marketplace.

## Proposed Changes

### Database & Schema
- Create `product_packages` table for multi-tiered pricing (24h, 3d, 7d, 15d, 30d, Lifetime).
- Add bilingual fields (`name_bn`, `description_bn`, `features_bn`) to `products` and `product_packages`.
- Add `is_primary_product` and `status` (active, coming_soon, draft, archived) to `products`.
- Seed the initial catalog for the Lovable Extension.

### Frontend Architecture
- Implement `useLanguage` hook and `i18n.ts` dictionary for bilingual UI.
- Update `Header.tsx` with an EN | বাংলা switcher.
- Update `FeaturedProducts.tsx` and `Hero.tsx` to fetch real data from Supabase.

### Product & Marketplace
- Create `/extensions/lovable-unlimited-credits` (or update existing) as a high-conversion landing page.
- Implement "Coming Soon" states for categories without active products.
- Enforce server-side pricing snapshots during checkout to prevent frontend tampering.

### Integration & Fulfillment
- Ensure Eklas license generation remains functional for the new packages.
- Add social contact links (WhatsApp +8801557749217, Facebook) to the footer and header.

## Technical Details
- **Tables**: `products` (updated), `product_packages` (new), `categories` (updated).
- **Hooks**: `useLanguage` (persisted via localStorage).
- **Routes**: `src/routes/index.tsx`, `src/routes/search.tsx`, `src/routes/extensions.lovable-unlimited-credits.tsx`.
- **Security**: RLS policies for public read access to active products/packages.

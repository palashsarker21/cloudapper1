# Production Product Management Implementation Plan

Upgrade CloudApper from demo-ready to production-ready product management. This plan implements a robust product schema, advanced inventory controls, license management, and a comprehensive admin editor.

## Database Schema (Supabase)

### Enums and Types
- `product_type`: ai_credits, ai_tools, browser_extensions, saas_products, digital_files, templates, prompts, automation_tools, developer_tools, services.
- `inventory_type`: unlimited, finite, license.
- `product_status`: draft, active, out_of_stock, archived.
- `delivery_method`: instant_download, email_delivery, license_key, external_link, manual_fulfillment.

### Enhanced `products` Table
- **General**: `sku`, `short_description`, `full_description`, `features` (jsonb), `whats_included` (jsonb), `requirements` (jsonb), `compatibility` (jsonb).
- **Fulfillment**: `delivery_method`, `delivery_instructions`, `version`.
- **Pricing**: `sale_price`, `currency` (default 'BDT').
- **Inventory**: `inventory_type`, `stock_quantity`, `license_duration` (days/months), `device_limit`.
- **Status**: `status` (replaces `is_active`).
- **SEO**: `seo_title`, `seo_description`, `seo_keywords` (text[]).
- **Internal**: `resale_auth_verified` (boolean).

### New `product_licenses` Table
- `id`, `product_id` (FK), `key` (encrypted/masked), `status` (available, assigned, expired, revoked, suspended), `assigned_to` (user_id), `expires_at`.

### New `product_media` Table
- `id`, `product_id` (FK), `url`, `alt_text`, `type` (image, thumbnail, gallery, file), `is_main` (boolean).

## Backend Logic (TanStack Server Functions)

- **Inventory Operations**: Atomic decrement for stock/license using Postgres functions to prevent overselling.
- **Price Calculation**: `calculateFinalPrice` server function that reads from DB based on product ID, ignoring client input.
- **License Management**: Admin functions for bulk import and revoking licenses.
- **Secure Downloads**: Signed URLs for private bucket files with entitlement checks.

## Admin UI (React + shadcn/ui)

- **Product Dashboard**: List view with status filters and inventory alerts.
- **Multi-Section Product Editor**:
    - **Basic Info**: Name, slug (auto-gen), SKU, category.
    - **Pricing**: BDT base, sale price toggle.
    - **Inventory**: Dynamic fields based on type (License UI vs Stock UI).
    - **Fulfillment**: Delivery settings.
    - **Media**: Upload dropzone for images and private files.
    - **SEO**: Preview for Google search result appearance.
    - **Publishing**: Validation check before "Active" status.

## Marketplace Updates
- **Visibility**: Filter out anything but `active` products.
- **Structured Data**: JSON-LD for Product and Breadcrumb on detail pages.
- **URL Handling**: Route by slug `/product/{slug}`.

## Technical Tasks
1. **Migration**: Update `products` table and create `product_licenses`, `product_media`. Add RLS for admin-only writes.
2. **Server Functions**: Implement `getProductPrice`, `updateInventory`, `getDownloadUrl`.
3. **Admin Routes**: Create `/admin/products/new` and `/admin/products/$id`.
4. **Components**: Build `ProductForm`, `LicenseManager`, `MediaUpload`.
5. **QA**: Test atomic inventory operations and slug-based routing.

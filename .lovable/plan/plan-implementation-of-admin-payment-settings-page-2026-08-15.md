# Plan: Implementation of Admin Payment Settings Page

I will implement a comprehensive Admin Payment Settings page to manage payment provider status, currencies, crypto networks, and expiration rules.

## Proposed Changes

### Database & Schema
- No new tables are required as we already have a `settings` table.
- I will ensure the `settings` table has records for:
  - `payment_providers`: Status and credentials.
  - `payment_config`: Global rules like expiry times, default currencies, and supported crypto networks.
  - `crypto_wallets`: Managed in its own table as per previous steps.

### Backend (Server Functions)
- Enhance `src/lib/admin.functions.ts` if necessary (current `getSettings` and `updateSettings` are generic and sufficient).

### Frontend (UI/UX)
- Create `src/routes/admin/settings/payments.tsx` (or update `src/routes/admin/settings.tsx` to include a more robust "Payments" tab).
- I will implement a multi-tab interface for:
  - **Provider Status**: Toggle switches for bKash, Binance Pay, Bitget, etc.
  - **Global Rules**: Input for payment expiry (e.g., 30 minutes).
  - **Currencies**: Manage supported fiat/crypto currencies.
  - **Crypto Networks**: Configure which networks are enabled for manual wallet payments.

## Technical Details
- **State Management**: React Query for fetching/mutating settings.
- **Form Handling**: Local state with Zod validation.
- **Security**: Strict `has_role(auth.uid(), 'admin')` check on all server functions.
- **UI Components**: shadcn/ui (Tabs, Switch, Input, Label, Card).

## User Review Required
- Should I split the settings into multiple routes (e.g., `/admin/settings/payments`) or keep it as a tab within `/admin/settings`? (I recommend a dedicated route for clarity as the payment configuration grows).

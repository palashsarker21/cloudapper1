# Plan: Phase 26 — Production Configuration & Fault-Tolerant Integration

Harden CloudApper infrastructure with centralized environment validation, graceful degradation for optional services, and enhanced system monitoring.

## User Review Required

> [!IMPORTANT]
> This plan implements "God Mode" infrastructure hardening. No features will be removed, but some payment/fulfillment methods will automatically disable themselves if their respective API keys are missing from the environment.

- **Graceful Degradation**: If Binance or Eklas keys are missing, the app will stay online but hide those options.
- **Admin Health Check**: A new dashboard at `/super-admin/system/health` will show the status of all integrations.
- **Data Integrity**: Orders will no longer fail if a fulfillment provider (like Eklas) is down; they will move to a `pending_configuration` state for manual admin retry.

## Technical Details

### 1. Centralized Environment Management
- Create `src/lib/env.server.ts` to categorize variables:
    - `REQUIRED_CORE`: Supabase URL/Key.
    - `OPTIONAL_PAYMENT`: Binance Pay.
    - `OPTIONAL_FULFILLMENT`: Eklas License API.
    - `OPTIONAL_EMAIL`: SMTP/Email provider.
- Implement `isConfigured(key)` helper to safely check status without leaking secrets.

### 2. Database Hardening
- **Migration**:
    - Update `orders` and `fulfillments` status enums (adding `pending_configuration`).
    - Ensure RLS policies explicitly check for `super_admin` role in addition to `admin`.
    - Add `email_delivery_status` to `licenses` table.

### 3. Fault-Tolerant Fulfillment
- Modify `src/lib/license-fulfillment.server.ts`: Catch configuration errors and return a "Missing Config" status instead of crashing the fulfillment loop.
- Modify `src/lib/fulfillment.server.ts`: If a provider is unconfigured, mark the fulfillment as `pending_configuration` and keep the order in a `paid` state.

### 4. Admin Control Center
- **System Health**: New route `/super-admin/system/health` showing status (Configured/Missing/Error) for all external services.
- **Fulfillment Retry**: Add a "Retry Fulfillment" button in the Super Admin license/order view that re-triggers the state machine.

### 5. Documentation & CI/CD
- Update `README.md` with a comprehensive "Production Deployment" section.
- Update `.env.example` with clear categorization.
- Audit `.github/workflows` to ensure migration checks are robust.

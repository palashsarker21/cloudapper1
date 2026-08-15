# Phase 24: Production License Automation Engine

Implement a secure, idempotent, and automated license fulfillment system using the Eklas API, integrated into CloudApper's existing marketplace architecture.

## Database Changes
- Add `licenses` table for encrypted storage and metadata.
- Add unique constraint on `fulfillments(order_id, idempotency_key)` to prevent duplicate delivery.
- Ensure all new tables have RLS and proper `GRANT` statements.

## Server-Side Implementation
- Create `src/lib/license-fulfillment.server.ts` to handle Eklas API calls.
- Implement `generateLicense` server function with strict authentication and authorization.
- Integrate with existing fulfillment flow in `src/lib/fulfillment.server.ts`.
- Implement idempotency checks using database transactions.

## Admin Features
- Extend Super Admin Control Center with a "License Center".
- Implement Provider Management for Eklas (config status, connection test).
- Add manual retry and test license generation (audited).

## Customer Experience
- Update Order Details page to display masked license keys and activation guides.
- Implement "Copy to Clipboard" with 3D button styling.
- Ensure real-time fulfillment updates.

## Technical Details
- **Secrets**: `EKLAS_LICENSE_API_KEY` stored in Lovable Secrets.
- **Provider**: Eklas API (POST `https://io.eklas.dev/api/v1/license/generate`).
- **Security**: Encrypt full license keys; display only last 4 chars in lists.
- **Audit**: Log all license-related actions (generation, viewing, retries).

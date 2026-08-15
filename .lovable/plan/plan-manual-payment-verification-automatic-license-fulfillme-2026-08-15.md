# Plan: Manual Payment Verification & Automatic License Fulfillment

Implement a robust manual payment verification workflow for bKash/Nagad with automatic Eklas license fulfillment.

## User Review Required

> [!IMPORTANT]
> The system requires manual admin verification because it uses personal bKash/Nagad accounts. Fulfillment only triggers after admin approval.

## Proposed Changes

### Database Schema (Supabase Migration)
- Update `payments` table to include: `customer_transaction_id`, `sender_mobile`, `expected_amount`, `email_delivery_requested`, `verified_by`, `rejection_reason`, `admin_notes`.
- Add a unique constraint on `(provider, customer_transaction_id)` for duplicate protection.
- Add `payment_status` and `fulfillment_status` enums if missing, covering all requested states (`awaiting_payment`, `payment_submitted`, `under_review`, etc.).
- Update `orders` status to sync with the new workflow.

### Customer Payment Flow
- **Payment Submission UI**: Update `src/routes/checkout/payment.$paymentId.tsx` to handle bKash/Nagad specifically.
  - Display exact amount and receiver number (+8801934857886) with copy buttons.
  - Add form for Transaction ID (required), Sender Mobile (optional), and "Send license to email" (optional).
  - Implement successful submission state (Payment under review).
- **Payment Tracking**: Improve the order status timeline to reflect real-time progress (Submitted -> Under Review -> Verified -> Ready).

### Super Admin Control Center
- **Payment Queue**: Create `/super-admin/payments/manual-verification` with tabs for Pending, Under Review, Duplicate, etc.
- **Verification Engine**: Create a server-side logic to compare customer-submitted TXID/Amount with admin-entered received data.
  - Results: `READY_FOR_CONFIRMATION`, `MISMATCH`, `DUPLICATE`, etc.
- **Admin Review UI**: Create `/super-admin/payments/:id` for detailed review.
  - Inputs for `Received Amount` and `Received Transaction ID`.
  - Visual match indicators (Green check for Match, Red for Mismatch).
  - Final "Confirm & Fulfill" or "Reject" actions.

### Fulfillment & Delivery
- **Automatic Fulfillment**: Once admin confirms, trigger `processOrderFulfillment` (existing) which calls Eklas API.
- **Idempotency**: Ensure a single payment only ever generates one license, even on retries.
- **Email Delivery**: Integrate email sending if the customer opted-in and payment is verified.
- **License Display**: Update customer account library/order details to show the license key, expiration, and copy buttons.

## Technical Details

### Server Functions (`src/lib/payments.functions.ts`)
- `submitPaymentVerification`: Customer submits TXID and sender info.
- `getAdminPaymentDetails`: Secure fetch for super-admin review.
- `verifyPaymentAnalysis`: Server-side logic to calculate match status.
- `confirmAndFulfillPayment`: Atomic transaction to mark paid, fulfill, and log audit.

### Security & RBAC
- Strict RLS on `payments` and `licenses`.
- `super_admin` role verification for all confirmation actions.
- Input validation via Zod.
- Duplicate TXID check at the database level.

### Fulfillment Lifecycle
1. `payment_submitted` (Customer)
2. `under_review` (Admin opens)
3. `payment_verified` (Admin confirms)
4. `fulfillment_pending` -> `fulfillment_processing` -> `fulfilled` (System)

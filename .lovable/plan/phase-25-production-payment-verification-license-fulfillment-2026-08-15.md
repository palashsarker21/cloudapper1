# Phase 25: Production Payment Verification & License Fulfillment

This phase hardens the manual payment verification workflow (bKash, Nagad, Crypto) and automates the post-approval license fulfillment via the Eklas API.

## Database Schema Enhancements
- `payment_receivers`: Database-driven configuration for bKash, Nagad, and Crypto accounts.
- `payment_risk_flags`: Deterministic flagging for amount mismatches, duplicate TXIDs, and other risks.
- `audit_logs`: Detailed, append-only records for all payment and fulfillment actions.
- `payments`: Extended with verification metadata (received amount, risk score, verification status).

## Server-Side Logic (Hardened)
- **Centralized Verification Engine**: A server-side service to compare expected vs. received amounts, validate TXID uniqueness, and calculate risk scores.
- **Idempotent Fulfillment**: Ensuring one successful order yields exactly one license generation request.
- **Security Gates**: Strict RBAC for Super Admin overrides and manual confirmations.

## Admin & Customer UX
- **Super Admin Verification Dashboard**: A dedicated queue for manual payments with real-time risk analysis.
- **Verification Console**: Side-by-side comparison of customer submissions vs. admin observations.
- **Customer Payment Submission**: A clean, mobile-first form for bKash/Nagad/Crypto transaction submissions with status tracking.
- **Automated Delivery**: Immediate license display and optional email delivery upon admin approval.

## Acceptance Tests
- Correct payment matching -> Automatic fulfillment.
- Amount mismatch detection -> Prevention of silent approval.
- Duplicate TXID detection -> High-risk flagging and manual review.
- Unauthorized access prevention (IDOR) for screenshots and licenses.
- Eklas API failure handling with retry capability.

## Technical Details
- Using `createServerFn` for all privileged operations.
- RLS policies enforced for all new tables.
- Transactional integrity for payment status and fulfillment triggers.
- Immutable price snapshots for every order.

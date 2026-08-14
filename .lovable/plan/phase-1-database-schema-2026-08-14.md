---
name: Checkout and Payment System
description: Implementation of a production-ready checkout and payment system with server-side validation, multi-provider support (bKash, Nagad, Binance Pay), and manual verification.
type: feature
---

## Phase 1: Database Schema
- [x] Create `order_status` and `payment_status` enums.
- [x] Create `orders` table to store order metadata and totals.
- [x] Create `order_items` table for product snapshots at time of purchase.
- [x] Create `payments` table for transaction tracking.
- [x] Create `coupons` table for discount management.
- [x] Enable RLS and add policies for customers (own data) and admins (all data).
- [x] Add audit fields for manual payment verification.

## Phase 2: Server-Side Logic
- [x] Implement `createOrder` server function:
    - Validate inventory (finite, license, unlimited).
    - Recalculate prices from DB (not frontend).
    - Validate coupons.
    - Create order and items in a transaction.
- [x] Implement `verifyPayment` server function (or webhook handler):
    - Handle provider-specific verification.
    - Idempotent processing.
    - Trigger fulfillment on success.

## Phase 3: Checkout UI
- [x] Create a Cart system (client-side state).
- [x] Implement Checkout page with:
    - Product summary.
    - Customer details form.
    - Payment provider selection (bKash, Nagad, Binance Pay).
    - Manual payment instructions for bKash/Nagad.
- [x] Create Order Confirmation page.

## Phase 4: Admin Management
- [x] Add Order Management dashboard.
- [x] Add Payment Verification UI for manual transactions.
- [x] Audit log for verification actions.

## Phase 5: Fulfillment Integration
- [x] Link verified payments to license key assignment or digital file access.

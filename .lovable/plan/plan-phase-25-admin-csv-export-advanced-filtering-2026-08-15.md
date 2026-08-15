# Plan - Phase 25: Admin CSV Export & Advanced Filtering

Add production-grade CSV export capabilities for Licenses and Fulfillments in the CloudApper Admin/Super Admin dashboards, including multi-parameter server-side filtering.

## User Review Required

> [!IMPORTANT]
> The CSV export will process data on the server and return a downloadable file. For large datasets, this might take a few seconds.

- **Filters included**: Order ID (UUID), User ID (UUID), Status (Enum), and Date Range (Start/End).
- **Format**: Standard CSV with headers suitable for Excel/Google Sheets.
- **Access**: Restricted to `admin` and `super_admin` roles via server-side RBAC validation.

## Proposed Changes

### Database & Backend Functions
- Create `src/lib/export.functions.ts` to host CSV generation logic.
- Implement `exportLicensesCsv` server function with Zod validation for filters (order_id, user_id, status, date_from, date_to).
- Implement `exportFulfillmentsCsv` server function with similar filtering capabilities.
- Ensure all queries use `supabaseAdmin` for full data access, protected by role-check middleware.

### Admin UI Enhancements
- **Licenses Page (`/super-admin/licenses`)**:
    - Add a "Export CSV" button with a filter popover/modal.
    - Implement a date range picker for selection.
    - Integrate the export server function and trigger browser download.
- **Fulfillment Page (`/admin/fulfillment`)**:
    - Add matching "Export CSV" functionality with filters.
    - Add a status filter dropdown to the UI to narrow down results before export.

### Reusable Components
- Create `src/components/admin/DataExportDialog.tsx` as a shared component for configuring and triggering exports.

## Technical Details

- **CSV Generation**: Use a clean string-building approach with proper escaping for special characters (commas, quotes) to ensure CSV integrity.
- **Filtering**: Translate Zod-validated inputs into Supabase filter chains (`.eq`, `.gte`, `.lte`).
- **Performance**: Use `.select()` with specific columns to minimize memory usage during export generation.
- **Security**: Strict `has_role` checks inside every export server function.

## Verification Plan

### Automated Tests
- Verify server functions return correct CSV headers.
- Verify filtering logic by passing specific date ranges and status codes in dev environment.

### Manual Verification
- Log in as Super Admin.
- Navigate to License Center.
- Trigger export with a specific date range.
- Open generated CSV in a spreadsheet to verify data alignment.
- Repeat for Fulfillment Center.

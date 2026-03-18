# Mini Procurement System — Frontend Implementation Plan

## Overview
This plan defines the foundational frontend architecture for the Mini Procurement System based entirely on the authorized backend contracts (`project-contract.md`, `backend-schema-summary.md`, `rls-summary.md`, and `seed-data-map.md`). It focuses exclusively on layout, route structures, component inventories, and role-based UX.

---

## 1. Page Map & Route Structure

The frontend will use a standard Single Page Application (SPA) routing model, nested under an authenticated `App Shell` Layout that provides global navigation and user state.

### Public Routes
- **`/login`**: Authentication entry point.

### Authenticated Routes (Wrapped in `<AppLayout>`)
- **`/` (Dashboard)**: Central hub with role-specific KPI cards and quick-action shortcuts.
- **`/requests`**: Purchase Requests module.
  - `/requests` (List View)
  - `/requests/new` (Creation Form)
  - `/requests/:id` (Detail View - Read Only / Editable drafts depending on role)
- **`/approvals`**: Approver Inbox module.
  - `/approvals` (List View of actionable / historical requests)
  - `/approvals/:id` (Review & Action Details)
- **`/orders`**: Purchase Orders module.
  - `/orders` (List View)
  - `/orders/new?request_id=xyz` (Creation Form pre-filled from approved PR)
  - `/orders/:id` (Detail View)
- **`/admin`**: Administration module.
  - `/admin/users` (User/Profile Management List)
  - `/admin/departments` (Department Management List)

---

## 2. Navigation Structure

The primary navigation mechanism (e.g., a left sidebar) will inherently adapt its visibility based on the authenticated user's `role_code` fetched from the `profiles` table.

- **Dashboard**: Visible to ALL roles.
- **My Requests**: Visible to REQUESTER and ADMIN.
- **Approval Inbox**: Visible to APPROVER and ADMIN.
- **Purchase Orders**: Visible to PROCUREMENT and ADMIN.
- **Admin Settings**: Visible to ADMIN only.

*(Note: The `App Shell` header will display the user's `full_name`, `role_code`, and a simple Log Out button securely tied to Supabase Auth.)*

---

## 3. Form and Table Inventory

### Key Tables (Data Grids)
1. **Purchase Requests Table**: Displays `request_no`, `request_date`, `department`, `supplier_name`, `grand_total`, and a strict color-coded `status` badge. Features search and status filters.
2. **Approval Inbox Table**: Similar to the Requests table but filtered specifically for 'Submitted' status PRs belonging to the user's department.
3. **Purchase Orders Table**: Displays `po_no`, `issue_date`, `supplier_name`, tied `purchase_request_id.request_no`, `total_amount`, and `status`.
4. **Admin Users Table**: Displays profile attributes (`full_name`, `email`, `role_code`, `department_id`, `is_active`).

### Key Forms
1. **Login Form**: Standard Email/Password fields.
2. **Create/Edit Purchase Request Form**: 
   - *Header Section*: `needed_by_date`, `supplier_name`, `currency_code`, `notes`.
   - *Items Section (Dynamic array)*: `item_name`, `description`, `quantity`, `unit_price`, `tax_percent`. (Rows can be added/removed).
3. **Approval Action Modal/Form**: Provides primary "Approve" button and secondary "Reject" button. If "Reject" is clicked, surfaces a required `rejection_reason` text area.
4. **Create Purchase Order Form**: Pre-populates PR details, requires input for `po_no`, `issue_date`, `delivery_date`, etc.
5. **Admin User Form**: Maps variables to the `profiles` record, including department assignments and Role selections. *Note: The frontend manages `profiles`; any `auth.users` creation or linking must happen through a secure admin flow / backend-controlled path.*

---

## 4. Role-Based UI Behavior Summary

The frontend must actively protect UX by masking elements the user cannot interact with under RLS (thus preventing frustrating 403 network errors).

- **REQUESTER**:
  - The "Create Request" button is visible.
  - On the PR Detail view, the "Edit Request" button is ONLY visible if `status === 'Draft'`. 
  - Cannot navigate to `/approvals` or `/orders`.
- **APPROVER**:
  - The Approval Inbox table populates natively via their department boundary.
  - On the PR Detail view, "Approve" and "Reject" buttons are ONLY active if `status === 'Submitted'`. Edit controls for PR fields are permanently disabled (Read-only UI).
- **PROCUREMENT**:
  - Within `/requests`, the "Convert to PO" button is visible ONLY on PRs where `status === 'Approved'`.
  - Can fully access and edit POs. Cannot edit PRs.
- **ADMIN**:
  - Views the complete, unfiltered `/requests` and `/orders` tables.
  - Access to the `/admin/*` routes to manage reference data. Displays read-only Audit Log data in related slide-outs or detail views.

---

## 5. Assumptions and Risks

1. **RPC Usage for Approvals/POs**: **Assumption**: The frontend will rely exclusively on the `supabase.rpc('approve_request')`, `supabase.rpc('reject_request')`, and `supabase.rpc('create_purchase_order_and_convert_request')` functions to mutate state during approval and PO conversions, avoiding manual REST `PATCH` calls to respect backend architecture.
2. **Complex Form State**: **Risk**: Managing a dynamic array of `purchase_request_items` inside a draft requires careful client-side state management (e.g. React Hook Form + Zod) before committing the full payload via Supabase `insert()` to ensure line items bind flawlessly to the newly generated `purchase_request.id`.
3. **Automation Compatibility (Playwright)**: **Assumption**: The UI must strictly implement `data-testid` attributes on every interactive element (Inputs, Rows, Buttons, Modals) from the absolute beginning to satisfy the "Playwright Automation Readiness" requirement listed in the contract.

---

## 6. Phased UI Implementation Order

*(Note: `data-testid` attributes must be added during page/component implementation from the very beginning, not as a final-stage addition.)*

1. Frontend implementation plan (Current phase)
2. App shell, layouts, and route navigation skeleton (with Auth guards)
3. React Hook Form + Validation logic setup
4. Dashboard (KPIs and metrics)
5. Purchase Request Pages (List, Form, Detail)
6. Approval Inbox Pages (List, Review, Action Modals utilizing RPCs)
7. Purchase Order Pages (List, Creation Flow)
8. Admin Reference Management Pages
9. Final `data-testid` structural review and documentation for QA (review only, not first introduction)

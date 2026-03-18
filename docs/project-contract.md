# Mini Procurement System — Project Contract

## 1) Project Overview
Mini Procurement System is a web-based internal procurement workflow system for managing:
- Purchase Request creation
- Request submission for approval
- Approval or rejection
- Purchase Order creation
- Search, tracking, and audit visibility

This file is the single shared contract for all agents.
All agents must read this file first before planning or implementing anything.

---

## 2) Project Goal
Build a simple but structured procurement system suitable for:
- internal company use
- Supabase backend
- role-based access control
- Playwright test automation readiness

---

## 3) Roles

### REQUESTER
Can:
- create purchase requests
- save requests as Draft
- edit their own Draft requests
- submit their own requests
- view their own requests
- view request details and status history

Cannot:
- approve requests
- reject requests
- create purchase orders
- manage users or departments

### APPROVER
Can:
- view submitted purchase requests for their department
- review request details
- approve submitted requests
- reject submitted requests
- enter rejection reason
- view approval history

Cannot:
- edit request items
- create purchase orders
- manage admin master data

### PROCUREMENT
Can:
- view approved requests
- create purchase orders from approved requests
- update purchase order status
- view purchase order details
- view linked purchase request information

Cannot:
- approve requests
- reject requests
- edit requester draft content

### ADMIN
Can:
- full access to all modules
- manage departments
- manage users/profiles
- view all requests and purchase orders
- view audit logs
- override access if needed in future phases

---

## 4) Core Modules
- Login / Authentication
- Dashboard
- Purchase Requests
- Approval Inbox
- Purchase Orders
- Search / Filters / Reports
- Admin Management
- Audit Logging

---

## 5) Purchase Request Statuses
Allowed Purchase Request statuses:
- Draft
- Submitted
- Approved
- Rejected
- Converted to PO

Rules:
- New request starts as Draft
- Only Draft can be edited by requester
- Submitted means ready for approver action
- Approved means eligible for PO creation
- Rejected means approval failed and rejection reason must exist
- Converted to PO means PO has been created from the request

---

## 6) Purchase Order Statuses
Allowed Purchase Order statuses:
- Draft
- Issued
- Closed
- Cancelled

---

## 7) Main Business Rules
1. A purchase request must have at least one line item before submission.
2. A request cannot be approved unless its status is Submitted.
3. A request cannot be rejected without a rejection reason.
4. A purchase order can only be created from an Approved purchase request.
5. Only one purchase order is allowed per purchase request in MVP.
6. Request number must be unique.
7. Purchase order number must be unique.
8. Request totals must be auto-calculated from line items.
9. Requester can only edit their own Draft requests.
10. Approver cannot edit request item details.
11. Procurement cannot create PO from non-approved requests.

---

## 8) Core Data Entities
The backend should support these main tables/entities:

- departments
- profiles
- purchase_requests
- purchase_request_items
- approvals
- purchase_orders
- audit_logs

### Entity Summary

#### departments
Stores department master data.

#### profiles
Stores user profile data linked to auth users.
Includes:
- full name
- email
- department
- role code
- active flag

#### purchase_requests
Stores request header data.

#### purchase_request_items
Stores request line items.

#### approvals
Stores approval and rejection actions.

#### purchase_orders
Stores PO header data linked to one purchase request.

#### audit_logs
Stores important system activity records.

---

## 9) High-Level Data Relationships
- one department -> many profiles
- one profile -> many purchase requests
- one purchase request -> many purchase request items
- one purchase request -> many approval actions
- one purchase request -> zero or one purchase order

---

## 10) Main Screens

### Authentication
- Login page

### Dashboard
- stat cards
- quick actions
- role-aware shortcuts

### Purchase Requests
- requests list
- create request
- edit request
- request details

### Approval
- approval inbox
- request review
- approve action
- reject action with reason

### Purchase Orders
- eligible approved requests list
- create PO
- PO list
- PO details

### Admin
- users/profiles management
- departments management

---

## 11) Key Purchase Request Fields
Request header should support:
- request_no
- requester
- department
- request_date
- needed_by_date
- supplier_name
- currency_code
- notes
- status
- total_before_tax
- total_tax
- grand_total

Request item should support:
- line_no
- item_name
- description
- quantity
- unit_price
- tax_percent
- line_total

---

## 12) Key Purchase Order Fields
PO should support:
- po_no
- linked request_id
- procurement_officer_id
- supplier_name
- issue_date
- delivery_date
- status
- total_amount

---

## 13) Supabase Expectations
Backend implementation should use Supabase for:
- authentication
- database
- row level security
- seed data readiness

Expected backend outputs:
- schema.sql
- rls.sql
- seed.sql

---

## 14) Frontend Expectations
Frontend should provide:
- clean responsive admin-style layout
- role-aware navigation
- stable page structure
- clear form validation
- list tables with filters
- status badges
- history sections
- deterministic controls for testing

Frontend must not change backend contract without clearly documenting the reason.

---

## 15) Playwright Readiness Expectations
The UI must be automation-friendly.

Required:
- stable semantic `data-testid` attributes
- predictable row identifiers for lists
- clear button naming
- searchable and filterable controls with stable selectors
- no reliance on fragile CSS selectors

Example selector style:
- auth-login-email-input
- pr-list-search-input
- pr-form-submit-btn
- approval-detail-approve-btn
- po-form-save-btn

---

## 16) Seed Data Expectations
Development seed data must include:
- departments
- profiles for all 4 roles
- purchase requests in these statuses:
  - Draft
  - Submitted
  - Approved
  - Rejected
  - Converted to PO
- one linked purchase order
- approval history records

Seed data should be:
- deterministic
- reusable
- easy for UI/API/DB tests

---

## 17) Agent Scope Rules

### Backend Agent
Owns:
- schema
- auth assumptions
- RLS
- seed data
- backend docs

Must not:
- build UI
- build Playwright tests

### Frontend Agent
Owns:
- layout
- pages
- forms
- tables
- Supabase frontend wiring
- `data-testid`

Must not:
- redesign schema
- modify RLS without clear documentation

### QA Agent
Owns:
- testability review
- Playwright test IDs matrix
- test scenarios matrix
- smoke tests
- RBAC tests

Must not:
- redesign business scope
- change backend contract casually

---

## 18) Implementation Order
Recommended execution order:
1. Backend plan
2. Schema
3. RLS and auth assumptions
4. Seed data
5. Frontend plan
6. App shell
7. Purchase Request pages
8. Approval pages
9. Purchase Order pages
10. Supabase frontend wiring
11. Playwright test IDs
12. QA review
13. Test IDs matrix
14. Scenarios matrix
15. Smoke tests
16. RBAC tests

---

## 19) Ambiguity Handling Rule
If any agent finds missing or ambiguous information:
- do not invent business behavior silently
- document the assumption clearly
- keep implementation aligned with this contract
- propose the minimum safe assumption

---

## 20) MVP Scope Boundary
Included in MVP:
- login
- role-based visibility
- purchase request lifecycle
- approval workflow
- purchase order creation
- search and filters
- audit visibility
- Playwright readiness

Excluded from MVP:
- multi-level approval
- attachments
- supplier master management
- budget control
- email notifications
- external ERP integrations
- advanced reporting
- mobile app

---

## 21) Final Rule
This file is the baseline contract.
All plans, schema, UI, test IDs, and test scenarios must stay aligned with this file unless a documented change is approved.
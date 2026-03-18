# Seed Data Map

## Overview
A deterministic developer seed script has been created in `supabase/seed.sql`. This script is engineered specifically to provide predictable backend state coverage during Playwright / E2E test runs. 

It handles cross-department validation, lifecycle state assertions, and purely standard **hex-only UUIDs**.

---

## 1. Initial Setup: The Test Users
Ensure these explicitly mapped Auth UUIDs are created within Supabase (`auth.users`) to anchor the matching mock profiles seamlessly.

| Department | Role | Name | Intended Login Email | Required Auth UUID |
|------------|------|------|----------------------|--------------------|
| **IT**     | `REQUESTER` | Alice IT Req | `alice@example.com` | `a1111111-1111-...` |
| **IT**     | `APPROVER` | Bob IT Appr | `bob@example.com` | `b1111111-1111-...` |
| **PROC**   | `PROCUREMENT`| Carol Buyer | `carol@example.com` | `c1111111-1111-...` |
| **IT**     | `ADMIN` | Dave Admin | `dave@example.com` | `d1111111-1111-...` |
| **FIN**    | `REQUESTER` | Eve FIN Req | `eve@example.com` | `e1111111-1111-...` |
| **FIN**    | `APPROVER` | Frank FIN Appr | `frank@example.com` | `f1111111-1111-...` |

*(This structure explicitly supports validating that Bob cannot approve Finance requests, while Frank can).*

---

## 2. Seed Workloads: Purchase Requests
The system seeds 6 core Purchase Requests covering standard lifecycle boundary states across the departments:

| Request No. | Requester | Dept | Supplier | Expected Status | Testing Purpose |
|-------------|-----------|------|----------|-----------------|-----------------|
| **PR-0001** | Alice | IT | Dell | `Draft` | Alice can freely edit values on this request. |
| **PR-0002** | Alice | IT | AWS | `Submitted` | Locked for Alice. Visible in Bob's Approver Inbox. |
| **PR-0003** | Alice | IT | Adobe | `Approved` | Bob approved this previously. Visible to Carol (Proc). |
| **PR-0004** | Alice | IT | Herman Miller | `Rejected` | Holds a rejection audit reason from Bob. |
| **PR-0005** | Alice | IT | Cisco | `Converted to PO` | Handled successfully by Procurement. |
| **PR-0006** | Eve | FIN | Intuit | `Submitted` | Cross-Department check: Bob cannot see this; Frank must approve/reject it. |

### Note on Generated Totals
A corresponding `purchase_request_items` ledger populates lines accurately describing the goods ordered for each Request. Thanks to postgres triggers dynamically calculating `grand_total` metrics from these items, the core headers do not manually input aggregate sums, demonstrating trigger resiliency on seed insertion.

---

## 3. Workflow Assertions

### Approvals 
Explicit `approvals` audit trace entries simulate completed workflow hops. You will find Bob's historic decisions stamped chronologically against `PR-0003`, `PR-0004`, and `PR-0005`.

### Purchase Orders
A definitive Purchase Order (`PO-9001`) natively pairs with the `Converted to PO` status on `PR-0005`. This confirms the one-to-one constraint and successfully bounds read access to users assuming Procurement or Admin profiles.

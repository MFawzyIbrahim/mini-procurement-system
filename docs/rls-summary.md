# Access Control and RLS Summary

## Overview
PostgreSQL Row-Level Security (RLS) has been enabled across all key tables in the Mini Procurement System database. The policies enforce strict Role-Based Access Control (RBAC) ensuring data privacy, workflow enforcement, and least privilege directly at the database layer.

Additionally, sensitive state transitions that mutate multiple tables—such as Appovals and PO Creation—are locked behind secure RPC functions executing in a trusted `SECURITY DEFINER` context. 

---

## Role Matrix & RLS Breakdown

### 1. `REQUESTER` Role
| Table | Permissions | Conditions |
|-------|-------------|------------|
| `purchase_requests` | **SELECT** | Only if `requester_id` matches Auth user. |
| `purchase_requests` | **INSERT** | Must explicitly set `requester_id` as their Auth uid, AND `status` must be 'Draft'. |
| `purchase_requests` | **UPDATE** | Can edit (`USING`) Draft requests. The resulting modification (`WITH CHECK`) must either keep the status as 'Draft' or advance it to 'Submitted'. |
| `purchase_requests` | **DELETE** | Authorized only if `status = 'Draft'` and they are the owner. |
| `purchase_request_items`| **SELECT** | If the parent Request is visible. |
| `purchase_request_items`| **INSERT / UPDATE / DELETE** | Only if the parent Request is owned, and `status = 'Draft'`. |

### 2. `APPROVER` Role
| Table | Permissions | Conditions |
|-------|-------------|------------|
| `purchase_requests` | **SELECT** | Only requests belonging to their `department_id` and NOT 'Draft' (e.g. 'Submitted', 'Approved', 'Rejected'). |
| `approvals` | **SELECT**| If the tied PR is visible to them. |

*Approvals are inserted exclusively via `approve_request` and `reject_request` RPC functions.*

### 3. `PROCUREMENT` Role
| Table | Permissions | Conditions |
|-------|-------------|------------|
| `purchase_requests` | **SELECT** | Only if `status` is 'Approved' or 'Converted to PO'. |
| `purchase_request_items`| **SELECT** | Same derived visibility as the PR head. |
| `purchase_orders` | **SELECT** | All. |
| `purchase_orders` | **UPDATE** | Can edit active POs where they are the tracked officer. |

*Purchase Orders are generated from Approved Requests exclusively via the `create_purchase_order_and_convert_request` RPC function.*

### 4. `ADMIN` Role
Admins retain full `CRUD` authority over almost every system table. They possess an explicit `ALL` policy on `purchase_requests`, `purchase_request_items`, `approvals`, `purchase_orders`, `departments`, and `profiles`.

Admins are importantly the **only** role with `SELECT` privilege over `audit_logs`.

---

## Secure RPC Workflow Functions

To prevent "partial" updates and enforce complex business logic securely, the system relies on stored functions rather than direct client `INSERT`/`UPDATE` calls for certain transitions. Because these functions use `SECURITY DEFINER`, they execute securely as the Postgres user, bypassing row RLS while implementing explicit permission checks in the plpgsql code.

### 1. `approve_request(p_request_id UUID)`
- Available via Supabase RPC.
- **Verification:** User must be an `APPROVER` belonging to the matching PR `department_id`, and the PR must currently be `Submitted`.
- **Action:** Updates PR to `Approved` and inserts the corresponding `approvals` record.

### 2. `reject_request(p_request_id UUID, p_reason TEXT)`
- Available via Supabase RPC.
- **Verification:** User must be an `APPROVER` belonging to the matching PR `department_id`, and the PR must currently be `Submitted`. A `p_reason` value cannot be empty.
- **Action:** Updates PR to `Rejected` and inserts the corresponding `approvals` record + reason.

### 3. `create_purchase_order_and_convert_request(...)`
- Available via Supabase RPC.
- **Verification:** User must be `PROCUREMENT`, and the targeted PR must currently be `Approved`.
- **Action:** Generates a new `purchase_orders` head record, and upgrades the PR status to `Converted to PO` symmetrically.

---

## Audit Logging Security
To ensure true audit trail immutability, **no client roles** (including Admin) possess `INSERT`, `UPDATE`, or `DELETE` capabilities over the `audit_logs` table.

Instead, the `audit_logs` table stays inaccessible for direct API writes. Audit mutations are strictly handled by **database-side trigger functions** designed to operate securely within a trusted execution environment.

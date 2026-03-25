# Mini Procurement System - Postman Usage Guide

This guide provides instructions on how to use the provided Postman collection to test and interact with the procurement API.

## 1. Prerequisites
- **Postman Desktop Agent** or Web Client.
- **Backend Running**: The NestJS API must be running locally (default: `http://localhost:3000`).
- **Supabase Account**: You need valid user credentials from the project's Supabase instance.

## 2. Setup Instructions

### Import Files
1. Import `mini-procurement.postman_collection.json` into Postman.
2. Import `mini-procurement.postman_environment.json` into Postman.

### Configure Environment
1. Select the **Mini Procurement - Dev** environment.
2. Edit the environment variables:
   - `supabase_anon_key`: Paste your project's anon key.
   - `test_email`: Enter a registered email (e.g., `requester@example.com`).
   - `test_password`: Enter the corresponding password.

## 3. Workflow Flow

### Step 1: Authentication
1. Open the **01. Auth** folder.
2. Run **Supabase Login**. 
3. This request will automatically extract the `access_token` and store it in your environment for all subsequent requests.

### Step 2: Role-Based Testing

#### Requester Flow
1. **Create Draft**: Run `POST /requests`. It will store the `request_id`.
2. **Submit**: Run `POST /requests/:id/submit`.

#### Approver Flow
1. **Inbox**: Run `GET /approvals` to see pending requests for your department.
2. **Action**: Run `POST /approvals/:id/approve` or `POST /approvals/:id/reject`.

#### Procurement Flow
1. **Queue**: Run `GET /procurement/approved-requests`.
2. **Generate PO**: Run `POST /purchase-orders/from-request/:requestId`. It will store `purchase_order_id`.
3. **Issue**: Run `POST /purchase-orders/:id/issue`.

## 4. Automation Features
- **Variable Chaining**: The collection automatically extracts IDs (Request ID, PO ID) from create/generate responses and reuses them in follow-up requests.
- **Bearer Auth**: All protected folders inherit the `{{access_token}}` from the collection root.

## 5. Known Limitations / Pending
- **Audit Logs**: Full audit log history is viewable via `GET /purchase-orders/:id` but direct audit log searching is restricted to ADMIN via RPC (not exposed as a flat list yet).
- **Admin Mutation**: `PATCH /admin/users/:id` requires a valid `user_id` in the environment.

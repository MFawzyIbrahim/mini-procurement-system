-- ==============================================================================
-- Mini Procurement System - Deterministic Seed Data (6 Auth Users Version)
-- ==============================================================================

-- Existing users in auth.users:
-- ADMIN:            372f71b7-31e0-4034-b481-7bc68e9b0346   mahmoud.f.s.ibrahim@gmail.com
-- REQUESTER (IT):   f377bf14-eacb-4e21-9df3-e5323e3b3d9b   ahmedamirsalem0@gmail.com
-- APPROVER (IT):    b8b0f7d9-31fb-4b19-a16d-c063b18e8e95   bahykaram9@gmail.com
-- PROCUREMENT:      60ef2fe8-8e2e-45a9-8b47-fd49229ec759   alaa.yousri2@gmail.com
-- REQUESTER (FIN):  d76451aa-8aa7-491c-a89c-c82aecf198ff   mfawzy.s.ibrahim@gmail.com
-- APPROVER (FIN):   073616b0-5bbc-4095-98a2-9710a99c4223   mahmoudadvac@gmail.com
-- ==============================================================================

-- 1. Departments
INSERT INTO public.departments (id, code, name) VALUES
('11111111-1111-1111-1111-111111111111', 'IT',   'Information Technology'),
('22222222-2222-2222-2222-222222222222', 'FIN',  'Finance'),
('33333333-3333-3333-3333-333333333333', 'PROC', 'Procurement & Logistics')
ON CONFLICT (id) DO UPDATE
SET
  code = EXCLUDED.code,
  name = EXCLUDED.name;

-- 2. Profiles
INSERT INTO public.profiles (id, full_name, email, department_id, role_code, is_active) VALUES
('372f71b7-31e0-4034-b481-7bc68e9b0346', 'Mahmoud Ibrahim',   'mahmoud.f.s.ibrahim@gmail.com', '11111111-1111-1111-1111-111111111111', 'ADMIN',       true),
('f377bf14-eacb-4e21-9df3-e5323e3b3d9b', 'Ahmed Amir Salem',  'ahmedamirsalem0@gmail.com',      '11111111-1111-1111-1111-111111111111', 'REQUESTER',   true),
('b8b0f7d9-31fb-4b19-a16d-c063b18e8e95', 'Bahy Karam',        'bahykaram9@gmail.com',            '11111111-1111-1111-1111-111111111111', 'APPROVER',    true),
('60ef2fe8-8e2e-45a9-8b47-fd49229ec759', 'Alaa Yousri',       'alaa.yousri2@gmail.com',          '33333333-3333-3333-3333-333333333333', 'PROCUREMENT', true),
('d76451aa-8aa7-491c-a89c-c82aecf198ff', 'Mfawzy S. Ibrahim', 'mfawzy.s.ibrahim@gmail.com',      '22222222-2222-2222-2222-222222222222', 'REQUESTER',   true),
('073616b0-5bbc-4095-98a2-9710a99c4223', 'Mahmoud Advac',     'mahmoudadvac@gmail.com',          '22222222-2222-2222-2222-222222222222', 'APPROVER',    true)
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  department_id = EXCLUDED.department_id,
  role_code = EXCLUDED.role_code,
  is_active = EXCLUDED.is_active;

-- 3. Purchase Requests
INSERT INTO public.purchase_requests (
  id, request_no, requester_id, department_id, supplier_name, status, notes
) VALUES
-- IT / Draft
(
  'a0000000-0000-0000-0000-000000000001',
  'PR-0001',
  'f377bf14-eacb-4e21-9df3-e5323e3b3d9b',
  '11111111-1111-1111-1111-111111111111',
  'Dell Technologies',
  'Draft',
  'Need new developer laptops.'
),

-- IT / Submitted
(
  'a0000000-0000-0000-0000-000000000002',
  'PR-0002',
  'f377bf14-eacb-4e21-9df3-e5323e3b3d9b',
  '11111111-1111-1111-1111-111111111111',
  'Amazon Web Services',
  'Submitted',
  'Monthly hosting credits.'
),

-- IT / Approved
(
  'a0000000-0000-0000-0000-000000000003',
  'PR-0003',
  'f377bf14-eacb-4e21-9df3-e5323e3b3d9b',
  '11111111-1111-1111-1111-111111111111',
  'Adobe Inc',
  'Approved',
  'Creative Cloud licenses for marketing.'
),

-- IT / Rejected
(
  'a0000000-0000-0000-0000-000000000004',
  'PR-0004',
  'f377bf14-eacb-4e21-9df3-e5323e3b3d9b',
  '11111111-1111-1111-1111-111111111111',
  'Herman Miller',
  'Rejected',
  'Requested high-end chairs.'
),

-- IT / Converted to PO
(
  'a0000000-0000-0000-0000-000000000005',
  'PR-0005',
  'f377bf14-eacb-4e21-9df3-e5323e3b3d9b',
  '11111111-1111-1111-1111-111111111111',
  'Cisco Systems',
  'Converted to PO',
  'Core switches for the new office layout.'
),

-- FIN / Submitted
(
  'e0000000-0000-0000-0000-000000000001',
  'PR-0006',
  'd76451aa-8aa7-491c-a89c-c82aecf198ff',
  '22222222-2222-2222-2222-222222222222',
  'Intuit',
  'Submitted',
  'QuickBooks Enterprise Renewal for Finance team.'
)
ON CONFLICT (id) DO UPDATE
SET
  request_no = EXCLUDED.request_no,
  requester_id = EXCLUDED.requester_id,
  department_id = EXCLUDED.department_id,
  supplier_name = EXCLUDED.supplier_name,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- 4. Purchase Request Items
INSERT INTO public.purchase_request_items (
  id, purchase_request_id, line_no, item_name, description, quantity, unit_price, tax_percent
) VALUES
-- PR 1
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1, 'Dell XPS 15', 'i9, 32GB RAM, 1TB SSD', 5, 2500.00, 10.0),

-- PR 2
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 1, 'AWS Credits', 'General compute coverage', 1, 5000.00, 0.0),

-- PR 3
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 1, 'Adobe CC License', 'Annual subscription', 10, 600.00, 5.0),

-- PR 4
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 1, 'Aeron Chair', 'Size C, Fully Loaded', 2, 1800.00, 8.0),

-- PR 5
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 1, 'Catalyst 9300', '48-port PoE switch', 3, 4200.00, 7.5),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 2, 'Fiber Modules', '10G SFP+', 12, 150.00, 7.5),

-- PR 6
('b0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 1, 'QuickBooks Enterprise', 'Annual 5-user license', 1, 4500.00, 0.0)
ON CONFLICT (id) DO UPDATE
SET
  purchase_request_id = EXCLUDED.purchase_request_id,
  line_no = EXCLUDED.line_no,
  item_name = EXCLUDED.item_name,
  description = EXCLUDED.description,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  tax_percent = EXCLUDED.tax_percent;

-- 5. Approvals
INSERT INTO public.approvals (
  id, purchase_request_id, approver_id, action, rejection_reason
) VALUES
-- IT approval
(
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'b8b0f7d9-31fb-4b19-a16d-c063b18e8e95',
  'Approved',
  NULL
),

-- IT rejection
(
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000004',
  'b8b0f7d9-31fb-4b19-a16d-c063b18e8e95',
  'Rejected',
  'Exceeds departmental budget limits for Q3.'
),

-- IT approval for converted PO
(
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000005',
  'b8b0f7d9-31fb-4b19-a16d-c063b18e8e95',
  'Approved',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  purchase_request_id = EXCLUDED.purchase_request_id,
  approver_id = EXCLUDED.approver_id,
  action = EXCLUDED.action,
  rejection_reason = EXCLUDED.rejection_reason;


-- 6. Purchase Orders
INSERT INTO public.purchase_orders (
  id, po_no, purchase_request_id, procurement_officer_id, supplier_name, status, total_amount
) VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'PO-9001',
  'a0000000-0000-0000-0000-000000000005',
  '60ef2fe8-8e2e-45a9-8b47-fd49229ec759',
  'Cisco Systems',
  'Issued',
  15480.00
)
ON CONFLICT (id) DO UPDATE
SET
  po_no = EXCLUDED.po_no,
  purchase_request_id = EXCLUDED.purchase_request_id,
  procurement_officer_id = EXCLUDED.procurement_officer_id,
  supplier_name = EXCLUDED.supplier_name,
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount;
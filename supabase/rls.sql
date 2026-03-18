-- ==============================================================================
-- Mini Procurement System - RLS Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Helper Functions
-- ==============================================================================

-- Get the current user's role code
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role_code FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Get the current user's department ID
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS UUID AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 1. Departments Policies
-- ==============================================================================
CREATE POLICY "Departments are viewable by all authenticated users"
ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only Admin can insert departments"
ON public.departments FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Only Admin can update departments"
ON public.departments FOR UPDATE TO authenticated USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Only Admin can delete departments"
ON public.departments FOR DELETE TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- ==============================================================================
-- 2. Profiles Policies
-- ==============================================================================
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT TO authenticated USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admin can insert profiles"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admin can update profiles"
ON public.profiles FOR UPDATE TO authenticated USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admin can delete profiles"
ON public.profiles FOR DELETE TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- ==============================================================================
-- 3. Purchase Requests Policies
-- ==============================================================================
-- REQUESTER: View own requests
CREATE POLICY "Requester can view own requests"
ON public.purchase_requests FOR SELECT TO authenticated USING (
    public.get_current_user_role() = 'REQUESTER' AND requester_id = auth.uid()
);

-- APPROVER: View submitted/historical requests for their department
CREATE POLICY "Approver can view department requests"
ON public.purchase_requests FOR SELECT TO authenticated USING (
    public.get_current_user_role() = 'APPROVER' 
    AND department_id = public.get_current_user_department()
    AND status != 'Draft'
);

-- PROCUREMENT: View approved/converted requests
CREATE POLICY "Procurement can view approved requests"
ON public.purchase_requests FOR SELECT TO authenticated USING (
    public.get_current_user_role() = 'PROCUREMENT' 
    AND status IN ('Approved', 'Converted to PO')
);

-- ADMIN: Manage all requests
CREATE POLICY "Admin can manage all purchase requests"
ON public.purchase_requests FOR ALL TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- REQUESTER: Insert own requests
CREATE POLICY "Requester can insert own requests"
ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'REQUESTER' 
    AND requester_id = auth.uid()
    AND status = 'Draft'
);

-- REQUESTER: Update own Draft requests (Allowing editing details or changing status to Submitted)
CREATE POLICY "Requester can update own DRAFT requests"
ON public.purchase_requests FOR UPDATE TO authenticated 
USING (
    public.get_current_user_role() = 'REQUESTER' 
    AND requester_id = auth.uid() 
    AND status = 'Draft'
)
WITH CHECK (
    public.get_current_user_role() = 'REQUESTER' 
    AND requester_id = auth.uid() 
    AND status IN ('Draft', 'Submitted')
);

-- REQUESTER: Delete own Draft requests
CREATE POLICY "Requester can delete own DRAFT requests"
ON public.purchase_requests FOR DELETE TO authenticated USING (
    public.get_current_user_role() = 'REQUESTER' 
    AND requester_id = auth.uid() 
    AND status = 'Draft'
);

-- ==============================================================================
-- 4. Purchase Request Items Policies
-- ==============================================================================
CREATE POLICY "Users can view items if they can view the PR"
ON public.purchase_request_items FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.purchase_requests pr 
        WHERE pr.id = purchase_request_id
    )
);

CREATE POLICY "Requester can insert items on own DRAFT request"
ON public.purchase_request_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.purchase_requests pr 
        WHERE pr.id = purchase_request_id 
        AND pr.requester_id = auth.uid() 
        AND pr.status = 'Draft'
    )
);

CREATE POLICY "Requester can update items on own DRAFT request"
ON public.purchase_request_items FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.purchase_requests pr 
        WHERE pr.id = purchase_request_id 
        AND pr.requester_id = auth.uid() 
        AND pr.status = 'Draft'
    )
);

CREATE POLICY "Requester can delete items on own DRAFT request"
ON public.purchase_request_items FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.purchase_requests pr 
        WHERE pr.id = purchase_request_id 
        AND pr.requester_id = auth.uid() 
        AND pr.status = 'Draft'
    )
);

CREATE POLICY "Admin can manage items"
ON public.purchase_request_items FOR ALL TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- ==============================================================================
-- 5. Approvals Policies
-- ==============================================================================
CREATE POLICY "Users can view approvals for visible PRs"
ON public.approvals FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.purchase_requests pr 
        WHERE pr.id = purchase_request_id
    )
);

-- Directly inserting into Approvals is blocked for standard roles.
-- Action is entirely managed by secure RPC functions to guarantee PR state transition.

CREATE POLICY "Admin can manage all approvals"
ON public.approvals FOR ALL TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- ==============================================================================
-- 6. Purchase Orders Policies
-- ==============================================================================
CREATE POLICY "Procurement and Admin can view POs"
ON public.purchase_orders FOR SELECT TO authenticated USING (
    public.get_current_user_role() IN ('PROCUREMENT', 'ADMIN')
);

-- Directly inserting into POs is restricted for standard roles.
-- Creation is handled via RPC to securely update the PR status to 'Converted to PO' concurrently.

CREATE POLICY "Procurement can update POs"
ON public.purchase_orders FOR UPDATE TO authenticated USING (
    public.get_current_user_role() = 'PROCUREMENT' 
    AND procurement_officer_id = auth.uid()
);

CREATE POLICY "Admin can manage POs"
ON public.purchase_orders FOR ALL TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- ==============================================================================
-- 7. Audit Logs Policies
-- ==============================================================================
CREATE POLICY "Only Admin can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated USING (public.get_current_user_role() = 'ADMIN');

-- No INSERT/UPDATE/DELETE policies are granted to ANY client user role for the audit_logs table. 
-- All mutations must be handled by secure, database-side trigger functions operating 
-- in a trusted execution context.

-- ==============================================================================
-- Secure RPC Workflow Functions (Option B Implementation)
-- ==============================================================================

-- 1. Approve Request
CREATE OR REPLACE FUNCTION public.approve_request(p_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Verify the user is an APPROVER for this department, and the PR is Submitted
    IF NOT EXISTS (
        SELECT 1 
        FROM public.purchase_requests pr
        JOIN public.profiles prof ON prof.department_id = pr.department_id
        WHERE pr.id = p_request_id
          AND pr.status = 'Submitted'
          AND prof.id = auth.uid()
          AND prof.role_code = 'APPROVER'
    ) THEN
        RAISE EXCEPTION 'Not authorized or request is not in Submitted state';
    END IF;

    -- Update PR Status
    UPDATE public.purchase_requests 
    SET status = 'Approved', updated_at = now()
    WHERE id = p_request_id;

    -- Insert Approval Record
    INSERT INTO public.approvals (purchase_request_id, approver_id, action)
    VALUES (p_request_id, auth.uid(), 'Approved');
END;
$$;

-- 2. Reject Request
CREATE OR REPLACE FUNCTION public.reject_request(p_request_id UUID, p_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF trim(COALESCE(p_reason, '')) = '' THEN
        RAISE EXCEPTION 'Rejection reason is required';
    END IF;

    -- Verify the user is an APPROVER for this department, and the PR is Submitted
    IF NOT EXISTS (
        SELECT 1 
        FROM public.purchase_requests pr
        JOIN public.profiles prof ON prof.department_id = pr.department_id
        WHERE pr.id = p_request_id
          AND pr.status = 'Submitted'
          AND prof.id = auth.uid()
          AND prof.role_code = 'APPROVER'
    ) THEN
        RAISE EXCEPTION 'Not authorized or request is not in Submitted state';
    END IF;

    -- Update PR Status
    UPDATE public.purchase_requests 
    SET status = 'Rejected', updated_at = now()
    WHERE id = p_request_id;

    -- Insert Rejection Record
    INSERT INTO public.approvals (purchase_request_id, approver_id, action, rejection_reason)
    VALUES (p_request_id, auth.uid(), 'Rejected', p_reason);
END;
$$;

-- 3. Create Purchase Order and Convert Request
CREATE OR REPLACE FUNCTION public.create_purchase_order_and_convert_request(
    p_request_id UUID, 
    p_po_no TEXT, 
    p_supplier_name TEXT, 
    p_total_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_po_id UUID;
BEGIN
    -- Verify the user is PROCUREMENT, and the PR is Approved
    IF NOT EXISTS (
        SELECT 1 
        FROM public.purchase_requests pr
        JOIN public.profiles prof ON prof.id = auth.uid()
        WHERE pr.id = p_request_id
          AND pr.status = 'Approved'
          AND prof.role_code = 'PROCUREMENT'
    ) THEN
        RAISE EXCEPTION 'Not authorized or request is not in Approved state';
    END IF;

    -- Insert PO Record
    INSERT INTO public.purchase_orders (
        po_no, purchase_request_id, procurement_officer_id, supplier_name, status, total_amount
    )
    VALUES (
        p_po_no, p_request_id, auth.uid(), p_supplier_name, 'Draft', p_total_amount
    )
    RETURNING id INTO new_po_id;

    -- Update PR Status
    UPDATE public.purchase_requests 
    SET status = 'Converted to PO', updated_at = now()
    WHERE id = p_request_id;

    RETURN new_po_id;
END;
$$;

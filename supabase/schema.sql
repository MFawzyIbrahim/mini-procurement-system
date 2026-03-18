-- ==============================================================================
-- Mini Procurement System - Initial Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_departments_code
    ON public.departments(code);

-- 2. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    role_code TEXT NOT NULL CHECK (role_code IN ('REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_code
    ON public.profiles(role_code);

CREATE INDEX IF NOT EXISTS idx_profiles_department_id
    ON public.profiles(department_id);

-- 3. Purchase Requests
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_no TEXT NOT NULL UNIQUE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    needed_by_date DATE,
    supplier_name TEXT,
    currency_code TEXT NOT NULL DEFAULT 'USD',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected', 'Converted to PO')),
    total_before_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_needed_by_date
        CHECK (needed_by_date IS NULL OR needed_by_date >= request_date)
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester_id
    ON public.purchase_requests(requester_id);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_department_id
    ON public.purchase_requests(department_id);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_status
    ON public.purchase_requests(status);

-- 4. Purchase Request Items
CREATE TABLE IF NOT EXISTS public.purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(15, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100),
    line_total NUMERIC(15, 2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 + tax_percent / 100)
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (purchase_request_id, line_no)
);

CREATE INDEX IF NOT EXISTS idx_purchase_request_items_pr_id
    ON public.purchase_request_items(purchase_request_id);

-- 5. Approvals
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN ('Approved', 'Rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_rejection_reason
        CHECK (
            (action = 'Rejected' AND rejection_reason IS NOT NULL AND trim(rejection_reason) <> '')
            OR
            (action = 'Approved' AND rejection_reason IS NULL)
        )
);

CREATE INDEX IF NOT EXISTS idx_approvals_purchase_request_id
    ON public.approvals(purchase_request_id);

-- 6. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_no TEXT NOT NULL UNIQUE,
    purchase_request_id UUID NOT NULL UNIQUE REFERENCES public.purchase_requests(id) ON DELETE RESTRICT,
    procurement_officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Issued', 'Closed', 'Cancelled')),
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_delivery_date
        CHECK (delivery_date IS NULL OR delivery_date >= issue_date)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_pr_id
    ON public.purchase_orders(purchase_request_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
    ON public.purchase_orders(status);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON public.audit_logs(entity_type, entity_id);

-- ==============================================================================
-- Triggers and Functions
-- ==============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_departments ON public.departments;
CREATE TRIGGER set_updated_at_departments
    BEFORE UPDATE ON public.departments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_purchase_requests ON public.purchase_requests;
CREATE TRIGGER set_updated_at_purchase_requests
    BEFORE UPDATE ON public.purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_purchase_request_items ON public.purchase_request_items;
CREATE TRIGGER set_updated_at_purchase_request_items
    BEFORE UPDATE ON public.purchase_request_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_purchase_orders ON public.purchase_orders;
CREATE TRIGGER set_updated_at_purchase_orders
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Auto-calculate totals on Purchase Requests
CREATE OR REPLACE FUNCTION public.calculate_pr_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.purchase_requests
    SET
        total_before_tax = COALESCE((
            SELECT SUM(quantity * unit_price)
            FROM public.purchase_request_items
            WHERE purchase_request_id = COALESCE(NEW.purchase_request_id, OLD.purchase_request_id)
        ), 0),
        total_tax = COALESCE((
            SELECT SUM(quantity * unit_price * (tax_percent / 100))
            FROM public.purchase_request_items
            WHERE purchase_request_id = COALESCE(NEW.purchase_request_id, OLD.purchase_request_id)
        ), 0),
        grand_total = COALESCE((
            SELECT SUM(line_total)
            FROM public.purchase_request_items
            WHERE purchase_request_id = COALESCE(NEW.purchase_request_id, OLD.purchase_request_id)
        ), 0)
    WHERE id = COALESCE(NEW.purchase_request_id, OLD.purchase_request_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pr_totals ON public.purchase_request_items;
CREATE TRIGGER update_pr_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_request_items
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_pr_totals();
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();

  const [request,   setRequest]   = useState<any>(null);
  const [items,     setItems]     = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [actionError,  setActionError]  = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason,    setRejectReason]    = useState('');

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      if (!id || !profile) return;
      try {
        setLoading(true);
        setFetchError(null);

        // Step 1: Fetch request header + department name.
        // No department filter applied here — RLS on purchase_requests already
        // scopes visibility. Both ADMIN and APPROVER reach this page via a real
        // Supabase UUID navigated from ApprovalInbox.
        const { data: reqData, error: reqError } = await supabase
          .from('purchase_requests')
          .select('*, departments ( name )')
          .eq('id', id)
          .single();

        if (reqError) throw reqError;

        // Step 2: Resolve requester full_name.
        // ADMIN can read all profiles; APPROVER can only read their own.
        // We attempt the lookup and fall back gracefully — never show raw UUID.
        if (reqData.requester_id) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', reqData.requester_id)
            .maybeSingle();
          reqData.requester_name = profData?.full_name || 'Requester';
        } else {
          reqData.requester_name = 'Requester';
        }
        setRequest(reqData);

        // Step 3: Line items
        const { data: itemsRes } = await supabase
          .from('purchase_request_items')
          .select('*')
          .eq('purchase_request_id', id)
          .order('line_no');
        if (itemsRes) setItems(itemsRes);

        // Step 4: Approval history
        const { data: approvalsRes, error: appErr } = await supabase
          .from('approvals')
          .select('*')
          .eq('purchase_request_id', id)
          .order('created_at', { ascending: false });

        if (appErr) throw appErr;

        if (approvalsRes && approvalsRes.length > 0) {
          const approverIds = [...new Set(approvalsRes.map((a: any) => a.approver_id).filter(Boolean))] as string[];
          let profMap: Record<string, string> = {};
          if (approverIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', approverIds);
            profMap = (profs || []).reduce((acc: any, p: any) => { acc[p.id] = p.full_name; return acc; }, {});
          }
          approvalsRes.forEach((a: any) => {
            a.approver_name = profMap[a.approver_id] || 'Approver';
          });
          setApprovals(approvalsRes);
        } else {
          setApprovals([]);
        }
      } catch (err: any) {
        console.error('ApprovalDetail fetch error', err);
        setFetchError(err.message || 'Failed to load request.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, profile]);


  // ─── Approve (via SECURITY DEFINER RPC) ───────────────────────────────────
  const handleApprove = async () => {
    if (!request || saving) return;
    setActionError(null);
    setActionSuccess(null);
    console.log('[approve_request] calling RPC', { p_request_id: request.id, role: profile?.role_code });
    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('approve_request', { p_request_id: request.id });
      console.log('[approve_request] result', { data, error });
      if (error) throw error;
      setRequest((prev: any) => ({ ...prev, status: 'Approved' }));
      setApprovals(prev => [{
        id: crypto.randomUUID(),
        purchase_request_id: request.id,
        approver_id: profile!.id,
        approver_name: profile!.full_name || 'You',
        action: 'Approved',
        rejection_reason: null,
        created_at: new Date().toISOString(),
      }, ...prev]);
      setActionSuccess('Request approved successfully.');
    } catch (err: any) {
      console.error('[approve_request] FAILED', err);
      setActionError(err.message || 'Approve failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Reject (via SECURITY DEFINER RPC) ────────────────────────────────────
  const handleReject = async () => {
    if (!request || saving) return;
    if (!rejectReason.trim()) {
      setActionError('Rejection reason is required.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    console.log('[reject_request] calling RPC', { p_request_id: request.id, p_reason: rejectReason.trim(), role: profile?.role_code });
    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('reject_request', {
        p_request_id: request.id,
        p_reason: rejectReason.trim(),
      });
      console.log('[reject_request] result', { data, error });
      if (error) throw error;
      setRequest((prev: any) => ({ ...prev, status: 'Rejected' }));
      setApprovals(prev => [{
        id: crypto.randomUUID(),
        purchase_request_id: request.id,
        approver_id: profile!.id,
        approver_name: profile!.full_name || 'You',
        action: 'Rejected',
        rejection_reason: rejectReason.trim(),
        created_at: new Date().toISOString(),
      }, ...prev]);
      setActionSuccess('Request rejected successfully.');
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      console.error('[reject_request] FAILED', err);
      setActionError(err.message || 'Reject failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading...</div>;
  if (fetchError) return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <p style={{ color: '#991b1b', fontWeight: 500 }}>Failed to load request.</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{fetchError}</p>
      <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
  if (!request) return <div className="page-container" style={{ padding: '2rem' }}>Request not found.</div>;

  const isPending = request.status === 'Submitted';
  const canAct = isPending && (profile?.role_code === 'APPROVER' || profile?.role_code === 'ADMIN');

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: request.currency_code || 'USD' }).format(amount || 0);

  const badgeStyle = (status: string) => {
    switch (status) {
      case 'Draft':           return { backgroundColor: '#f3f4f6', color: '#1f2937' };
      case 'Submitted':       return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Approved':        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Rejected':        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Converted to PO': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      default:                return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-container" data-testid="approval-detail-page" style={{ paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Review Request: {request.request_no}</h1>
        <span
          data-testid="approval-detail-status-badge"
          style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, marginLeft: 'auto', ...badgeStyle(request.status) }}
        >
          {request.status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Request Summary */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            Request Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Requester</p>
              <p style={{ fontWeight: 500, margin: 0 }}>
                {/* Never render a raw UUID — UUID pattern check as final safety net */}
                {(request.requester_name && !/^[0-9a-f-]{36}$/i.test(request.requester_name))
                  ? request.requester_name
                  : 'Requester'} ({request.departments?.name || '—'})
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Request Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.request_date}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Needed By</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.needed_by_date || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.supplier_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Currency</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.currency_code}</p>
            </div>
          </div>
          {request.notes && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Notes / Justification</p>
              <p style={{ margin: 0, backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', minHeight: '3rem', whiteSpace: 'pre-wrap' }}>
                {request.notes}
              </p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Line Items</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-main)' }}>
              <tr>
                <th style={{ padding: '0.75rem 2rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Item Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Tax %</th>
                <th style={{ padding: '0.75rem 2rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>{item.item_name}</td>
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{item.description}</td>
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.tax_percent}%</td>
                  <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>{fmt(item.line_total)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2rem' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>{fmt(request.total_before_tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <span>Total Tax</span><span>{fmt(request.total_tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Grand Total</span><span>{fmt(request.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback banners — always rendered, persist across status changes */}
        {actionSuccess && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> {actionSuccess}
          </div>
        )}
        {actionError && !actionSuccess && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 500 }}>
            {actionError}
          </div>
        )}

        {/* Action Buttons — APPROVER or ADMIN, only when Submitted */}
        {canAct && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: saving ? 0.7 : 1 }}
              onClick={() => { setActionError(null); setActionSuccess(null); setShowRejectModal(true); }}
              disabled={saving}
              data-testid="approval-detail-reject-btn"
            >
              <X size={18} /> Reject
            </button>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#16a34a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: saving ? 0.7 : 1 }}
              onClick={handleApprove}
              disabled={saving}
              data-testid="approval-detail-approve-btn"
            >
              <Check size={18} /> {saving ? 'Saving...' : 'Approve'}
            </button>
          </div>
        )}

        {/* Approval History */}
        <div
          style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
          data-testid="approval-detail-approval-history"
        >
          <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--text-muted)" /> Approval History
          </h3>
          {approvals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {approvals.map(a => (
                <div key={a.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{a.approver_name}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: a.action === 'Approved' ? '#dcfce7' : '#fee2e2', color: a.action === 'Approved' ? '#166534' : '#991b1b' }}>
                    {a.action}
                  </span>
                  {a.rejection_reason && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{a.rejection_reason}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
              No approval actions recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Reject Request</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Please provide a reason for rejecting this purchase request.
            </p>
            <textarea
              rows={4}
              placeholder="Rejection reason (required)..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', marginBottom: '1.5rem', resize: 'vertical' }}
              data-testid="approval-detail-reject-reason-input"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                style={{ background: 'white', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setActionError(null); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                data-testid="approval-detail-reject-confirm-btn"
                onClick={handleReject}
                disabled={saving}
              >
                {saving ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
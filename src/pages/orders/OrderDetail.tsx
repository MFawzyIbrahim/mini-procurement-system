import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Send, XCircle, CheckCircle2, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const [po, setPo] = useState<any>(null);
  const [request, setRequest] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [officer, setOfficer] = useState<string>('—');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        setFetchError(null);

        // 1. Fetch PO header
        const { data: poData, error: poErr } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('id', id)
          .single();
        if (poErr) throw poErr;
        setPo(poData);

        // 2. Resolve procurement officer name
        if (poData.procurement_officer_id) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', poData.procurement_officer_id)
            .maybeSingle();
          setOfficer(profData?.full_name || 'Procurement Officer Name Unavailable');
        }

        // 3. Fetch linked purchase request + department
        if (poData.purchase_request_id) {
          const { data: prData } = await supabase
            .from('purchase_requests')
            .select('*, departments ( name )')
            .eq('id', poData.purchase_request_id)
            .single();
          if (prData) setRequest(prData);

          // 4. Fetch line items from the linked PR
          const { data: itemsData } = await supabase
            .from('purchase_request_items')
            .select('*')
            .eq('purchase_request_id', poData.purchase_request_id)
            .order('line_no');
          if (itemsData) setItems(itemsData);
        }

        // (Step 5: Audit logs are now fetched in a dedicated useEffect below)
      } catch (err: any) {
        console.error('OrderDetail fetch error', err);
        setFetchError(err.message || 'Failed to load purchase order.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Dedicated effect for Audit Logs (Fulfillment History)
  useEffect(() => {
    async function fetchLogs() {
      // Use the UUID directly from the loaded PO object or the URL ID
      const targetId = po?.id || id;
      if (!targetId) return;
      
      try {
        const { data: logsData, error: logsErr } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('entity_type', 'purchase_order')
          .eq('entity_id', targetId)
          .order('created_at', { ascending: false });
        
        if (logsErr) {
          console.error('[OrderDetail] Failed to fetch audit logs', logsErr);
          return;
        }
        
        setAuditLogs(logsData || []);
      } catch (err) {
        console.error('[OrderDetail] Audit logs fetch encountered an error', err);
      }
    }
    fetchLogs();
  }, [id, po?.id]);

  const refreshPO = async () => {
    if (!id) return;
    try {
      // 1. Refresh PO main data
      const { data: poVal } = await supabase.from('purchase_orders').select('*').eq('id', id).single();
      if (poVal) setPo(poVal);
      
      // 2. Refresh Audit Logs explicitly after action
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'purchase_order')
        .eq('entity_id', id)
        .order('created_at', { ascending: false });
      if (logs) setAuditLogs(logs);
    } catch (err) {
      console.error('[OrderDetail] Failed to refresh PO data', err);
    }
  };

  const handleAction = async (rpcName: string, successMsg: string) => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase.rpc(rpcName, { p_po_id: id });
      if (error) throw error;
      setActionSuccess(successMsg);
      await refreshPO();
    } catch (err: any) {
      console.error(`[OrderDetail] ${rpcName} FAILED`, err);
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading...</div>;
  if (fetchError) return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <p style={{ color: '#991b1b', fontWeight: 500 }}>Failed to load purchase order.</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{fetchError}</p>
      <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
  if (!po) return <div className="page-container" style={{ padding: '2rem' }}>Purchase order not found.</div>;

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: request?.currency_code || 'USD' }).format(val || 0);

  const badgeStyle = (status: string) => {
    switch (status) {
      case 'Draft': return { backgroundColor: '#f3f4f6', color: '#1f2937' };
      case 'Issued': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Closed': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  return (
    <div className="page-container" data-testid="po-detail-page" style={{ paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Purchase Order: {po.po_no}</h1>
        
        {/* PROCUREMENT-only Lifecycle Actions */}
        {profile?.role_code === 'PROCUREMENT' && (
          <div style={{ marginLeft: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            {po.status === 'Draft' && (
              <>
                <button
                  className="btn-primary"
                  style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', fontSize: '0.875rem' }}
                  onClick={() => handleAction('issue_purchase_order', 'Purchase Order Issued successfully.')}
                  disabled={actionLoading}
                  data-testid="po-action-issue"
                >
                  <Send size={16} />
                  Issue PO
                </button>
                <button
                  style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#991b1b', border: '1px solid #fecaca', padding: '0 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                  onClick={() => handleAction('cancel_purchase_order', 'Purchase Order Cancelled.')}
                  disabled={actionLoading}
                  data-testid="po-action-cancel"
                >
                  <XCircle size={16} />
                  Cancel PO
                </button>
              </>
            )}
            {po.status === 'Issued' && (
              <>
                <button
                  style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '0 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  onClick={() => handleAction('close_purchase_order', 'Purchase Order Closed successfully.')}
                  disabled={actionLoading}
                  data-testid="po-action-close"
                >
                  <CheckCircle2 size={16} />
                  Close PO
                </button>
                <button
                  style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#991b1b', border: '1px solid #fecaca', padding: '0 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                  onClick={() => handleAction('cancel_purchase_order', 'Purchase Order Cancelled.')}
                  disabled={actionLoading}
                  data-testid="po-action-cancel"
                >
                  <XCircle size={16} />
                  Cancel PO
                </button>
              </>
            )}
          </div>
        )}

        <span
          data-testid="po-detail-status-badge"
          style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, marginLeft: 'auto', ...badgeStyle(po.status) }}
        >
          {po.status}
        </span>
      </div>

      {/* Action Banners */}
      {actionError && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 500 }} data-testid="po-action-error">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 500 }} data-testid="po-action-success">
          {actionSuccess}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* PO Information */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            PO Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Procurement Officer</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{officer}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Issue Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{po.issue_date || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Expected Delivery</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{po.delivery_date || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{po.supplier_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Total Amount</p>
              <p style={{ fontWeight: 500, margin: 0, color: 'var(--primary)' }}>{fmt(po.total_amount)}</p>
            </div>
          </div>
        </div>

        {/* Linked PR */}
        {request && (
          <div
            style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            data-testid="po-detail-linked-pr"
          >
            <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--text-muted)" />
              Originating Request
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Ref No</span>
                  <span style={{ fontWeight: 500 }}>{request.request_no}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department</span>
                  <span style={{ fontWeight: 500 }}>{request.departments?.name || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                  <span style={{ fontWeight: 500 }}>{request.status}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Supplier</span>
                  <span style={{ fontWeight: 500 }}>{request.supplier_name}</span>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                onClick={() => navigate(`/requests/${request.id}`)}
              >
                View PR Details
              </button>
            </div>
          </div>
        )}

        {/* Line Items from the originating PR */}
        {items.length > 0 && (
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
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{item.description || '—'}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.tax_percent}%</td>
                    <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>{fmt(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2rem' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                  <span>Total Amount</span>
                  <span>{fmt(po.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fulfillment Activity */}
        <div
          style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
          data-testid="po-detail-audit-logs"
        >
          <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--text-muted)" />
            Fulfillment Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.length > 0 ? (
              auditLogs.map(log => (
                <div key={log.id} style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.375rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 500, display: 'block' }}>{log.action}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {log.details?.old_status && `Status change: ${log.details.old_status} → `}
                      {log.details?.new_status || log.details?.status || (log.action === 'Issued' ? 'Issued' : log.action === 'Closed' ? 'Closed' : 'Cancelled')} • {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, ...badgeStyle(log.details?.new_status || log.details?.status || log.action) }}>
                    {log.details?.new_status || log.details?.status || log.action}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                No activity recorded yet after creation.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

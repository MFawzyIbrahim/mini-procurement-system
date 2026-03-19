import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileEdit, CheckCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function RequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  
  const [request, setRequest] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id || !profile) return;
      try {
        setLoading(true);
        // 1. Fetch Request Header
        const { data: reqData, error: reqError } = await supabase
          .from('purchase_requests')
          .select('*, departments ( name )')
          .eq('id', id)
          .single();
          
        if (reqError) throw reqError;
        
        // Fetch requester full name
        if (reqData.requester_id) {
          const { data: profData } = await supabase.from('profiles').select('full_name').eq('id', reqData.requester_id).single();
          reqData.requester_name = profData?.full_name || reqData.requester_id;
        }
        setRequest(reqData);

        // 2. Fetch Line Items
        const { data: itemsRes } = await supabase
          .from('purchase_request_items')
          .select('*')
          .eq('purchase_request_id', id)
          .order('line_no');
        
        if (itemsRes) setItems(itemsRes);

        // 3. Fetch Approvals
        const { data: approvalsRes } = await supabase
          .from('approvals')
          .select('*')
          .eq('purchase_request_id', id)
          .order('created_at', { ascending: false });
          
        if (approvalsRes && approvalsRes.length > 0) {
          // Fetch names for approvers
          const approverIds = [...new Set(approvalsRes.map(a => a.approver_id).filter(Boolean))];
          if (approverIds.length > 0) {
            const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', approverIds);
            const profMap = profs?.reduce((acc: any, p: any) => { acc[p.id] = p.full_name; return acc; }, {}) || {};
            approvalsRes.forEach(a => {
              a.approver_name = profMap[a.approver_id] || a.approver_id;
            });
          }
          setApprovals(approvalsRes);
        }

        // 4. Fetch Linked PO
        const { data: poRes } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('purchase_request_id', id)
          .maybeSingle();
          
        if (poRes) setPo(poRes);
        
      } catch (err) {
        console.error('Error fetching detail data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, profile]);

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading...</div>;
  if (!request) return <div className="page-container" style={{ padding: '2rem' }}>Request not found.</div>;

  const isDraft = request.status === 'Draft';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: request.currency_code || 'USD' }).format(amount || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return { backgroundColor: '#f3f4f6', color: '#1f2937' };
      case 'Submitted': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Approved': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Rejected': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Converted to PO': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      default: return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  return (
    <div className="page-container" data-testid="pr-detail-page" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Request Details: {request.request_no}</h1>
        <span
          data-testid="pr-detail-status-badge"
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginLeft: 'auto',
            ...getStatusColor(request.status)
          }}
        >
          {request.status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Summary */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Request Summary</h2>
            {isDraft && profile && request.requester_id === profile.id && (
              <button
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                onClick={() => navigate(`/requests/${id}/edit`)}
              >
                <FileEdit size={16} />
                Edit Draft
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Requester</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.requester_name} ({request.departments?.name || request.department_id})</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Request Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.request_date}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Needed By</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.needed_by_date || '-'}</p>
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
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
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
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                  <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.tax_percent}%</td>
                  <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2rem' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(request.total_before_tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <span>Total Tax</span>
                <span>{formatCurrency(request.total_tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Grand Total</span>
                <span>{formatCurrency(request.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approval History / Linked Info Placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} data-testid="pr-detail-approval-history">
            <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="var(--text-muted)" />
              Approval History
            </h3>
            {approvals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {approvals.map(approval => (
                  <div key={approval.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{approval.approver_name}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(approval.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: approval.action === 'Approved' ? '#dcfce7' : '#fee2e2',
                        color: approval.action === 'Approved' ? '#166534' : '#991b1b'
                      }}>
                        {approval.action}
                      </span>
                    </div>
                    {approval.rejection_reason && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{approval.rejection_reason}</p>
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

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} data-testid="pr-detail-linked-po">
            <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="var(--text-muted)" />
              Linked Purchase Order
            </h3>
            {po ? (
               <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
                 <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>{po.po_no}</p>
                 <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: {po.status}</p>
                 <button className="btn-secondary" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => navigate(`/orders/${po.id}`)}>
                    View Order
                 </button>
               </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
                No Purchase Order generated yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

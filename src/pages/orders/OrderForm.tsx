import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function OrderForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile: _profile } = useAuth(); // session used by Supabase auth internally

  // `?from=<request_id>` — the approved PR this PO is generated from
  const fromRequestId = searchParams.get('from');

  const [request, setRequest]     = useState<any>(null);
  const [items, setItems]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // User-editable PO fields — supplier and total are pre-filled from the PR
  const [supplierName, setSupplierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    async function loadRequest() {
      if (!fromRequestId) {
        setFetchError('No request selected. Please return to Approved Requests and click Generate PO.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setFetchError(null);

        const { data: reqData, error: reqErr } = await supabase
          .from('purchase_requests')
          .select('*, departments ( name )')
          .eq('id', fromRequestId)
          .single();

        if (reqErr) throw reqErr;

        // Guard: only Approved requests are eligible
        if (reqData.status !== 'Approved') {
          setFetchError(`This request is not eligible for PO generation. Current status: ${reqData.status}`);
          setLoading(false);
          return;
        }

        setRequest(reqData);
        setSupplierName(reqData.supplier_name || '');

        // Fetch line items
        const { data: itemsData } = await supabase
          .from('purchase_request_items')
          .select('*')
          .eq('purchase_request_id', fromRequestId)
          .order('line_no');
        if (itemsData) setItems(itemsData);

      } catch (err: any) {
        console.error('OrderForm fetch error', err);
        setFetchError(err.message || 'Failed to load request data.');
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [fromRequestId]);

  const handleGeneratePO = async () => {
    if (!request || saving) return;
    if (!supplierName.trim()) {
      setActionError('Supplier name is required.');
      return;
    }

    setActionError(null);
    setSaving(true);

    // Generate a unique PO number: PO-YYYYMMDD-XXXX (timestamp + random)
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const poNo = `PO-${datePart}-${randPart}`;

    console.log('[create_purchase_order_and_convert_request] calling RPC', {
      p_request_id: request.id,
      p_po_no: poNo,
      p_supplier_name: supplierName.trim(),
      p_total_amount: request.grand_total,
    });

    try {
      const { data: newPoId, error } = await supabase.rpc(
        'create_purchase_order_and_convert_request',
        {
          p_request_id: request.id,
          p_po_no: poNo,
          p_supplier_name: supplierName.trim(),
          p_total_amount: request.grand_total,
        }
      );

      console.log('[create_purchase_order_and_convert_request] result', { newPoId, error });

      if (error) throw error;

      // Optionally set delivery date after PO creation (direct update is safe since
      // PROCUREMENT created the PO and RLS allows their own PO updates)
      if (deliveryDate && newPoId) {
        await supabase
          .from('purchase_orders')
          .update({ delivery_date: deliveryDate })
          .eq('id', newPoId);
      }

      // Navigate to the new PO Detail
      navigate(`/orders/${newPoId}`);
    } catch (err: any) {
      console.error('[create_purchase_order_and_convert_request] FAILED', err);
      setActionError(err.message || 'Failed to generate purchase order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: request?.currency_code || 'USD' }).format(val || 0);

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading request data...</div>;
  if (fetchError) return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <p style={{ color: '#991b1b', fontWeight: 500 }}>Cannot generate PO</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{fetchError}</p>
      <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div className="page-container" data-testid="po-form-page" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Generate Purchase Order</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Linked Request Context (read-only) */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem', color: 'var(--text-muted)' }}>
            From Approved Request: {request.request_no}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Department</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.departments?.name || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.supplier_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Currency</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{request.currency_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Grand Total</p>
              <p style={{ fontWeight: 500, margin: 0, color: 'var(--primary)' }}>{fmt(request.grand_total)}</p>
            </div>
          </div>
        </div>

        {/* Line Items (read-only summary) */}
        {items.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Line Items ({items.length})</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'var(--bg-main)' }}>
                <tr>
                  <th style={{ padding: '0.625rem 1.5rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>#</th>
                  <th style={{ padding: '0.625rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Item</th>
                  <th style={{ padding: '0.625rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '0.625rem 1rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '0.625rem 1.5rem', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '0.625rem 1.5rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{item.line_no}</td>
                    <td style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)' }}>{item.item_name}</td>
                    <td style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                    <td style={{ padding: '0.625rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>{fmt(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', fontWeight: 700 }}>
              Total: {fmt(request.grand_total)}
            </div>
          </div>
        )}

        {/* PO Form Fields */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Purchase Order Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Supplier Name *</label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                placeholder="Confirm or update supplier name"
                style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                data-testid="po-form-supplier-name-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Expected Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                data-testid="po-form-delivery-date-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Total Amount</label>
              <input
                type="text"
                disabled
                value={fmt(request.grand_total)}
                style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 500 }}
                data-testid="po-form-total-amount-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inherited from linked Purchase Request</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {actionError && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 500 }}>
            {actionError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            style={{ background: 'white', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            onClick={handleGeneratePO}
            disabled={saving}
            data-testid="po-form-generate-btn"
          >
            <Send size={18} />
            {saving ? 'Generating...' : 'Generate PO'}
          </button>
        </div>

      </div>
    </div>
  );
}

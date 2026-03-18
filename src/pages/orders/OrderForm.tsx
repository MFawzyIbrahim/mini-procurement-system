import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';

export default function OrderForm() {
  const navigate = useNavigate();

  // Mock Request Data context for the PO
  const mockRequestData = {
    request_no: 'PR-0003',
    department: 'IT',
    supplier_name: 'Adobe',
    currency_code: 'USD',
    grand_total: '$1,200.00'
  };

  return (
    <div className="page-container" data-testid="po-form-page" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Create Purchase Order</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Linked Request Context (Read Only) */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem', color: 'var(--text-muted)' }}>From Approved Request: {mockRequestData.request_no}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Department</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{mockRequestData.department}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{mockRequestData.supplier_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Currency</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{mockRequestData.currency_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Total Amount</p>
              <p style={{ fontWeight: 500, margin: 0, color: 'var(--primary)' }}>{mockRequestData.grand_total}</p>
            </div>
          </div>
        </div>

        {/* PO Form Fields */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Purchase Order Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>PO Number *</label>
              <input type="text" placeholder="e.g. PO-9002" style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }} data-testid="po-form-po-no-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Supplier Name *</label>
              <input type="text" defaultValue={mockRequestData.supplier_name} style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }} data-testid="po-form-supplier-name-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Issue Date *</label>
              <input type="date" defaultValue="2026-03-15" style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }} data-testid="po-form-issue-date-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Delivery Date *</label>
              <input type="date" style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }} data-testid="po-form-delivery-date-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Status</label>
              <select style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white' }} data-testid="po-form-status-select" defaultValue="Draft">
                <option value="Draft">Draft</option>
                <option value="Issued">Issued</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Total Amount</label>
              <input type="text" disabled value={mockRequestData.grand_total} style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 500 }} data-testid="po-form-total-amount-input" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inherited from the linked Purchase Request</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Terms and Conditions / Instructions</label>
            <textarea rows={4} placeholder="Add standard terms or supplier instructions..." style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }} data-testid="po-form-terms-textarea"></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            type="button" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
            data-testid="po-form-save-draft-btn"
          >
            <Save size={18} />
            Save as Draft
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            data-testid="po-form-generate-btn"
          >
            <Send size={18} />
            Generate PO
          </button>
        </div>

      </div>
    </div>
  );
}

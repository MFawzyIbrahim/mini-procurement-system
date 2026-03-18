import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';

export default function OrderDetail() {
  const navigate = useNavigate();

  const mockStatus = 'Issued';

  return (
    <div className="page-container" data-testid="po-detail-page" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Purchase Order: PO-9001</h1>
        <span 
          data-testid="po-detail-status-badge"
          style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px', 
            fontSize: '0.875rem', 
            fontWeight: 500,
            backgroundColor: '#dbeafe', 
            color: '#1e40af',
            marginLeft: 'auto'
          }}
        >
          {mockStatus}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Summary */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>PO Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Procurement Officer</p>
              <p style={{ fontWeight: 500, margin: 0 }}>Carol Buyer</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Issue Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-14</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Expected Delivery</p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-20</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>Cisco</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Total Amount</p>
              <p style={{ fontWeight: 500, margin: 0, color: 'var(--primary)' }}>$12,500.00</p>
            </div>
          </div>
        </div>

        {/* Linked PR Context */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} data-testid="po-detail-linked-pr">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--text-muted)"/>
            Originating Request
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Type</span>
                <span style={{ fontWeight: 500 }}>Purchase Request</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Ref No</span>
                <span style={{ fontWeight: 500 }}>PR-0005</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department</span>
                <span style={{ fontWeight: 500 }}>IT</span>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View PR Details</button>
          </div>
        </div>

        {/* Audit Context */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} data-testid="po-detail-audit-logs">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--text-muted)"/>
            Fulfillment Activity
          </h3>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
            Issue event successfully recorded. No further tracking updates.
          </div>
        </div>

      </div>
    </div>
  );
}

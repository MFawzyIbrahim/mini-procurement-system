import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileEdit, CheckCircle, ShoppingBag } from 'lucide-react';

export default function RequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for preview state
  const mockStatus = 'Submitted' as string;
  const isDraft = mockStatus === 'Draft';

  return (
    <div className="page-container" data-testid="pr-detail-page" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Request Details: PR-0002</h1>
        <span
          data-testid="pr-detail-status-badge"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Request Summary</h2>
            {isDraft && (
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
              <p style={{ fontWeight: 500, margin: 0 }}>Alice IT Req (IT)</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Request Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-12</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Needed By</p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-30</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Supplier</p>
              <p style={{ fontWeight: 500, margin: 0 }}>AWS</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Currency</p>
              <p style={{ fontWeight: 500, margin: 0 }}>USD</p>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>Notes / Justification</p>
            <p style={{ margin: 0, backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', minHeight: '3rem' }}>
              Monthly compute resources needed for the new analytics project environment.
            </p>
          </div>
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
              <tr>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>AWS EC2 Instances</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>t3.large spot instances</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>4</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>$100.00</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>0%</td>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>$400.00</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>AWS S3 Storage</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Standard tier block storage</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>1</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>$100.00</td>
                <td style={{ padding: '1rem 1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>0%</td>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>$100.00</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2rem' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>$500.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                <span>Total Tax</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Grand Total</span>
                <span>$500.00</span>
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
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
              No approval actions recorded yet.
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} data-testid="pr-detail-linked-po">
            <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="var(--text-muted)" />
              Linked Purchase Order
            </h3>
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '0.375rem', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
              No Purchase Order generated yet.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

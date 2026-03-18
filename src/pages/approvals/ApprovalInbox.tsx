import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';

const MOCK_APPROVALS = [
  { id: '2', request_no: 'PR-0002', request_date: '2026-03-12', department: 'IT', supplier_name: 'AWS', grand_total: '$500.00', status: 'Submitted' },
  { id: '6', request_no: 'PR-0006', request_date: '2026-03-15', department: 'FIN', supplier_name: 'Intuit', grand_total: '$150.00', status: 'Submitted' },
];

export default function ApprovalInbox() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container" data-testid="approval-list-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Approval Inbox</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search request number or supplier..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="approval-list-search-input"
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="approval-list-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Approved">Approved (History)</option>
            <option value="Rejected">Rejected (History)</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Request No</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Supplier</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_APPROVALS.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`approval-list-row-${req.request_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{req.request_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{req.request_date}</td>
                <td style={{ padding: '1rem' }}>{req.department}</td>
                <td style={{ padding: '1rem' }}>{req.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{req.grand_total}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    ...getStatusColor(req.status).includes('bg-gray-100') ? { backgroundColor: '#f3f4f6', color: '#1f2937' } :
                    getStatusColor(req.status).includes('bg-blue-100') ? { backgroundColor: '#dbeafe', color: '#1e40af' } :
                    getStatusColor(req.status).includes('bg-green-100') ? { backgroundColor: '#dcfce7', color: '#166534' } :
                    getStatusColor(req.status).includes('bg-red-100') ? { backgroundColor: '#fee2e2', color: '#991b1b' } :
                    { backgroundColor: '#f3e8ff', color: '#6b21a8' }
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => navigate(`/approvals/${req.id}`)}
                  >
                    <Eye size={18} />
                    <span>Review</span>
                  </button>
                </td>
              </tr>
            ))}
            {MOCK_APPROVALS.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending approvals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

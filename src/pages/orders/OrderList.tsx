import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';

const MOCK_ORDERS = [
  { id: '1', po_no: 'PO-9001', request_no: 'PR-0005', issue_date: '2026-03-14', supplier_name: 'Cisco', total_amount: '$12,500.00', status: 'Issued' },
];

export default function OrderList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Issued': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container" data-testid="po-list-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Purchase Orders</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search PO number or supplier..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="po-list-search-input"
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="po-list-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>PO No</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Issue Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Request No</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Supplier</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((po) => (
              <tr key={po.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`po-list-row-${po.po_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{po.po_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{po.issue_date}</td>
                <td style={{ padding: '1rem' }}>{po.request_no}</td>
                <td style={{ padding: '1rem' }}>{po.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{po.total_amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    ...getStatusColor(po.status).includes('bg-gray-100') ? { backgroundColor: '#f3f4f6', color: '#1f2937' } :
                    getStatusColor(po.status).includes('bg-blue-100') ? { backgroundColor: '#dbeafe', color: '#1e40af' } :
                    getStatusColor(po.status).includes('bg-green-100') ? { backgroundColor: '#dcfce7', color: '#166534' } :
                    { backgroundColor: '#fee2e2', color: '#991b1b' }
                  }}>
                    {po.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => navigate(`/orders/${po.id}`)}
                  >
                    <Eye size={18} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {MOCK_ORDERS.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

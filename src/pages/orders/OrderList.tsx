import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function OrderList() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [orders, setOrders]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!profile) return;
      try {
        setLoading(true);
        setFetchError(null);

        // PROCUREMENT and ADMIN — RLS already scopes visibility
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, purchase_requests ( request_no )')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        console.error('OrderList fetch error', err);
        setFetchError(err.message || 'Failed to load purchase orders.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [profile]);

  const badgeStyle = (status: string) => {
    switch (status) {
      case 'Draft':     return { backgroundColor: '#f3f4f6', color: '#1f2937' };
      case 'Issued':    return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Closed':    return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:          return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const filtered = orders.filter(po => {
    const matchSearch =
      po.po_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purchase_requests?.request_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-container" data-testid="po-list-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Purchase Orders</h1>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search PO number, supplier, or request number..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="po-list-search-input"
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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

      {/* Table */}
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
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading purchase orders...
                </td>
              </tr>
            )}
            {!loading && fetchError && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>
                  Error: {fetchError}
                </td>
              </tr>
            )}
            {!loading && !fetchError && filtered.map(po => (
              <tr key={po.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`po-list-row-${po.po_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{po.po_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{po.issue_date}</td>
                <td style={{ padding: '1rem' }}>{po.purchase_requests?.request_no || '—'}</td>
                <td style={{ padding: '1rem' }}>{po.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{fmt(po.total_amount)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, ...badgeStyle(po.status) }}>
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
            {!loading && !fetchError && filtered.length === 0 && (
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

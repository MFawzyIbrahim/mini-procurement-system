import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, FileOutput } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApprovedRequests() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [requests, setRequests]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');

  useEffect(() => {
    async function fetchApproved() {
      if (!profile) return;
      try {
        setLoading(true);
        setFetchError(null);

        // Fetch Approved and Converted-to-PO requests so PROCUREMENT can see history too.
        // RLS scopes visibility — PROCUREMENT and ADMIN can see all non-Draft.
        const { data, error } = await supabase
          .from('purchase_requests')
          .select('*, departments ( name )')
          .in('status', ['Approved', 'Converted to PO'])
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err: any) {
        console.error('ApprovedRequests fetch error', err);
        setFetchError(err.message || 'Failed to load approved requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchApproved();
  }, [profile]);

  const filteredRequests = requests.filter(req =>
    req.request_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.departments?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const badgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Converted to PO': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      default:                return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const fmt = (val: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(val || 0);

  return (
    <div className="page-container" data-testid="approved-requests-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Approved Requests</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Approved requests eligible for Purchase Order generation
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search request number, supplier, or department..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="approved-requests-search-input"
          />
        </div>
      </div>

      {/* Table */}
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
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading approved requests...
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
            {!loading && !fetchError && filteredRequests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`approved-request-row-${req.request_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{req.request_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{req.request_date}</td>
                <td style={{ padding: '1rem' }}>{req.departments?.name || '—'}</td>
                <td style={{ padding: '1rem' }}>{req.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{fmt(req.grand_total, req.currency_code)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, ...badgeStyle(req.status) }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    data-testid={`approved-request-view-btn-${req.request_no}`}
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  {/* Generate PO — PROCUREMENT only; backend RPC does not authorize ADMIN */}
                  {req.status === 'Approved' && profile?.role_code === 'PROCUREMENT' && (
                    <button
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                      onClick={() => navigate(`/orders/new?from=${req.id}`)}
                      data-testid={`approved-request-generate-po-btn-${req.request_no}`}
                    >
                      <FileOutput size={16} />
                      <span>Generate PO</span>
                    </button>
                  )}
                  {req.status === 'Converted to PO' && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      PO Generated
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !fetchError && filteredRequests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No approved requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

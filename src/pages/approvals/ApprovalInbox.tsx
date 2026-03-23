import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApprovalInbox() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [requests, setRequests]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('Submitted');

  useEffect(() => {
    async function fetchApprovals() {
      if (!profile) return;
      try {
        setLoading(true);
        setFetchError(null);

        // Base query — exclude Drafts (not actionable for approvers)
        let query = supabase
          .from('purchase_requests')
          .select('*, departments ( name )')
          .neq('status', 'Draft')
          .order('created_at', { ascending: false });

        // APPROVER: scoped to their department by RLS (and we reflect it here).
        // ADMIN: no department filter — sees all departments.
        if (profile.role_code === 'APPROVER') {
          query = query.eq('department_id', profile.department_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRequests(data || []);
      } catch (err: any) {
        console.error('ApprovalInbox fetch error', err);
        setFetchError(err.message || 'Failed to load approvals.');
      } finally {
        setLoading(false);
      }
    }
    fetchApprovals();
  }, [profile]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Submitted':       return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Approved':        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Rejected':        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Converted to PO': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      default:                return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const fmt = (val: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(val || 0);

  const filtered = requests.filter(req => {
    const matchSearch =
      req.request_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-container" data-testid="approval-list-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Approval Inbox</h1>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search request number or supplier..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="approval-list-search-input"
          />
        </div>
        <div style={{ position: 'relative', width: '220px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            data-testid="approval-list-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Approved">Approved (History)</option>
            <option value="Rejected">Rejected (History)</option>
          </select>
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
                  Loading approvals...
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
            {!loading && !fetchError && filtered.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`approval-list-row-${req.request_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{req.request_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{req.request_date}</td>
                <td style={{ padding: '1rem' }}>{req.departments?.name || '—'}</td>
                <td style={{ padding: '1rem' }}>{req.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{fmt(req.grand_total, req.currency_code)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, ...getStatusStyle(req.status) }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {/* Navigate with real Supabase UUID — ApprovalDetail fetches by this id */}
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
            {!loading && !fetchError && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No approvals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

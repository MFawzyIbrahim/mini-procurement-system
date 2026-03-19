import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function RequestList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      if (!profile) return;
      try {
        let query = supabase
          .from('purchase_requests')
          .select('*, departments(name)')
          .order('request_date', { ascending: false });

        if (profile.role_code === 'REQUESTER') {
          query = query.eq('requester_id', profile.id);
        } else if (profile.role_code === 'APPROVER') {
          query = query.eq('department_id', profile.department_id).neq('status', 'Draft');
        } else if (profile.role_code === 'PROCUREMENT') {
          query = query.in('status', ['Approved', 'Converted to PO']);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error('Error fetching requests', err);
      }
    }
    fetchRequests();
  }, [profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Converted to PO': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(req => {
    const term = searchTerm.toLowerCase();
    const deptName = req.departments?.name || '';
    const matchesSearch = 
      (req.request_no && req.request_no.toLowerCase().includes(term)) ||
      (req.supplier_name && req.supplier_name.toLowerCase().includes(term)) ||
      (deptName.toLowerCase().includes(term));
      
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container" data-testid="pr-list-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Purchase Requests</h1>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => navigate('/requests/new')}
          data-testid="pr-list-create-btn"
        >
          <Plus size={18} />
          <span>Create Request</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search details..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="pr-list-search-input"
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="pr-list-status-filter"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Converted to PO">Converted to PO</option>
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
            {filteredRequests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`pr-list-row-${req.request_no}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{req.request_no}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{req.request_date}</td>
                <td style={{ padding: '1rem' }}>{req.departments?.name || req.department_id}</td>
                <td style={{ padding: '1rem' }}>{req.supplier_name}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: req.currency_code || 'USD' }).format(req.grand_total || 0)}
                </td>
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
                    onClick={() => navigate(`/requests/${req.id}`)}
                  >
                    <Eye size={18} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

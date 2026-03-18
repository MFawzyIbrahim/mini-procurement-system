import { useState } from 'react';
import { Search, Filter, Eye, Edit } from 'lucide-react';

const MOCK_USERS = [
  { id: '1', full_name: 'Alice IT Req', email: 'alice@example.com', role_code: 'REQUESTER', department: 'IT', is_active: true },
  { id: '2', full_name: 'Bob IT Appr', email: 'bob@example.com', role_code: 'APPROVER', department: 'IT', is_active: true },
  { id: '3', full_name: 'Carol Buyer', email: 'carol@example.com', role_code: 'PROCUREMENT', department: 'PROC', is_active: true },
  { id: '4', full_name: 'Dave Admin', email: 'dave@example.com', role_code: 'ADMIN', department: 'IT', is_active: true },
  { id: '5', full_name: 'Eve FIN Req', email: 'eve@example.com', role_code: 'REQUESTER', department: 'FIN', is_active: true },
  { id: '6', full_name: 'Frank FIN Appr', email: 'frank@example.com', role_code: 'APPROVER', department: 'FIN', is_active: false },
];

const ROLE_OPTIONS = ['REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN'];
const DEPT_OPTIONS = ['IT', 'FIN', 'PROC'];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  return (
    <div className="page-container" data-testid="admin-users-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">User Management</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search name or email..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="admin-users-search-input"
          />
        </div>

        <div style={{ position: 'relative', width: '180px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            data-testid="admin-users-role-filter"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '180px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white', appearance: 'none' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            data-testid="admin-users-department-filter"
          >
            <option value="">All Departments</option>
            {DEPT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`admin-users-row-${user.email}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{user.full_name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    backgroundColor: user.role_code === 'ADMIN' ? '#f3e8ff' : '#f3f4f6',
                    color: user.role_code === 'ADMIN' ? '#6b21a8' : '#1f2937',
                  }}>
                    {user.role_code}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{user.department}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                    color: user.is_active ? '#166534' : '#991b1b',
                  }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={16} /> View
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

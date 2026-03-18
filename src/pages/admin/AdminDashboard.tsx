import { useNavigate } from 'react-router-dom';
import { Users, Building2, FileSearch } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-container" data-testid="page-admin">
      <div className="page-header">
        <h1 className="page-title">Administration</h1>
      </div>
      <div className="card-grid">
        <div
          className="stat-card"
          data-testid="admin-users-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/users')}
        >
          <Users size={24} color="var(--primary)" />
          <span style={{ fontWeight: 600, marginTop: '0.5rem' }}>User Management</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage profiles and roles</span>
        </div>
        <div
          className="stat-card"
          data-testid="admin-departments-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/departments')}
        >
          <Building2 size={24} color="var(--primary)" />
          <span style={{ fontWeight: 600, marginTop: '0.5rem' }}>Department Management</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage active departments</span>
        </div>
        <div
          className="stat-card"
          data-testid="admin-audit-logs-card"
          style={{ cursor: 'default', opacity: 0.6 }}
        >
          <FileSearch size={24} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, marginTop: '0.5rem' }}>Audit Logs</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>View system activity (coming soon)</span>
        </div>
      </div>
    </div>
  );
}

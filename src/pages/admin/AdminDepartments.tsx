import { Plus, Eye, Edit } from 'lucide-react';

const MOCK_DEPARTMENTS = [
  { id: '1', code: 'IT', name: 'Information Technology' },
  { id: '2', code: 'FIN', name: 'Finance' },
  { id: '3', code: 'PROC', name: 'Procurement' },
];

export default function AdminDepartments() {
  return (
    <div className="page-container" data-testid="admin-departments-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Department Management</h1>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          data-testid="admin-departments-create-btn"
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Code</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DEPARTMENTS.map((dept) => (
              <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`admin-departments-row-${dept.code}`}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{dept.code}</td>
                <td style={{ padding: '1rem' }}>{dept.name}</td>
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

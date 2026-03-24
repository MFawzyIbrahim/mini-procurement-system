import { useEffect, useState } from 'react';
import { Search, Filter, Edit, Save, X, UserCheck, UserMinus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ROLE_OPTIONS = ['REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN'];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch Departments
      const { data: depts, error: deptsErr } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (deptsErr) throw deptsErr;
      setDepartments(depts || []);

      // Fetch Profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*, departments ( name )')
        .order('full_name');
      if (profErr) throw profErr;
      setUsers(profiles || []);

    } catch (err: any) {
      console.error('AdminUsers fetch error:', err);
      setError(err.message || 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser || isUpdating) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(null);

      const { error: patchErr } = await supabase
        .from('profiles')
        .update({
          role_code: editingUser.role_code,
          department_id: editingUser.department_id,
          is_active: editingUser.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingUser.id);

      if (patchErr) throw patchErr;

      setUpdateSuccess('User profile updated successfully.');
      setTimeout(() => setUpdateSuccess(null), 3000);
      
      // Refresh local state
      await fetchInitialData();
      setEditingUser(null);
    } catch (err: any) {
      console.error('Update user error:', err);
      setUpdateError(err.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || u.role_code === roleFilter;
    const matchesDept = deptFilter === '' || u.department_id === deptFilter;
    const matchesStatus =
      statusFilter === '' || (statusFilter === 'active' ? u.is_active : !u.is_active);

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading Users...</div>;

  return (
    <div className="page-container" data-testid="admin-users-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">User Management</h1>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

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
          <select
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            data-testid="admin-users-department-filter"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '150px' }}>
          <select
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'white' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="admin-users-status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching filters.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                  <td style={{ padding: '1rem' }}>{user.departments?.name || '—'}</td>
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
                    <button 
                      onClick={() => setEditingUser({ ...user })}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      data-testid={`admin-users-edit-${user.email}`}
                    >
                      <Edit size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit User: {editingUser.full_name}</h2>
              <button 
                onClick={() => { setEditingUser(null); setUpdateError(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {updateError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {updateSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                <select
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                  value={editingUser.role_code}
                  onChange={(e) => setEditingUser({ ...editingUser, role_code: e.target.value })}
                  required
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                <select
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                  value={editingUser.department_id || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department_id: e.target.value || null })}
                >
                  <option value="">No Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Account Status</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, is_active: true })}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: editingUser.is_active ? '#bbf7d0' : 'var(--border)',
                      backgroundColor: editingUser.is_active ? '#f0fdf4' : 'white',
                      color: editingUser.is_active ? '#166534' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      cursor: 'pointer', fontWeight: editingUser.is_active ? 600 : 400
                    }}
                  >
                    <UserCheck size={18} /> Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, is_active: false })}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: !editingUser.is_active ? '#fecaca' : 'var(--border)',
                      backgroundColor: !editingUser.is_active ? '#fef2f2' : 'white',
                      color: !editingUser.is_active ? '#991b1b' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      cursor: 'pointer', fontWeight: !editingUser.is_active ? 600 : 400
                    }}
                  >
                    <UserMinus size={18} /> Inactive
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setUpdateError(null); }}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

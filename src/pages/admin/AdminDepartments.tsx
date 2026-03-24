import { useEffect, useState } from 'react';
import { Plus, Edit, Save, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null); // null means "Add New"
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (fetchErr) throw fetchErr;
      setDepartments(data || []);
    } catch (err: any) {
      console.error('Fetch departments error:', err);
      setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingDept(null);
    setFormData({ code: '', name: '' });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(dept: any) {
    setEditingDept(dept);
    setFormData({ code: dept.code, name: dept.name });
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setModalError(null);

      if (editingDept) {
        // Update
        const { error: updateErr } = await supabase
          .from('departments')
          .update({
            code: formData.code.toUpperCase(),
            name: formData.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDept.id);
        if (updateErr) throw updateErr;
        setSuccessMsg('Department updated successfully.');
      } else {
        // Insert
        const { error: insertErr } = await supabase
          .from('departments')
          .insert([{
            code: formData.code.toUpperCase(),
            name: formData.name
          }]);
        if (insertErr) throw insertErr;
        setSuccessMsg('Department added successfully.');
      }

      setTimeout(() => setSuccessMsg(null), 3000);
      setIsModalOpen(false);
      await fetchDepartments();
    } catch (err: any) {
      console.error('Department save error:', err);
      setModalError(err.message || 'Failed to save department details.');
    } finally {
      setIsSaving(false);
    }
  }

  const filtered = departments.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="page-container" style={{ padding: '2rem' }}>Loading Departments...</div>;

  return (
    <div className="page-container" data-testid="admin-departments-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Department Management</h1>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={openAddModal}
          data-testid="admin-departments-create-btn"
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by code or name..."
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="admin-departments-search-input"
        />
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', width: '150px' }}>Code</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No departments found.</td>
              </tr>
            ) : (
              filtered.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }} data-testid={`admin-departments-row-${dept.code}`}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{dept.code}</td>
                  <td style={{ padding: '1rem' }}>{dept.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => openEditModal(dept)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      data-testid={`admin-departments-edit-${dept.code}`}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {editingDept ? `Edit Department: ${editingDept.code}` : 'Add New Department'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {modalError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {modalError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Code (e.g., IT, FIN)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="DEPT"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  data-testid="admin-dept-code-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Department Name"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', outline: 'none' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="admin-dept-name-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

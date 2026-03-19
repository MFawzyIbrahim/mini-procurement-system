import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ drafts: 0, pending: 0, approved: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!profile) return;
      try {
        const role = profile.role_code;
        const myId = profile.id;
        const myDept = profile.department_id;

        // Base queries
        let draftsQuery = supabase.from('purchase_requests').select('id', { count: 'exact', head: true }).eq('status', 'Draft');
        let pendingQuery = supabase.from('purchase_requests').select('id', { count: 'exact', head: true }).eq('status', 'Submitted');
        let approvedQuery = supabase.from('purchase_requests').select('id', { count: 'exact', head: true }).in('status', ['Approved', 'Converted to PO']);

        let skipDrafts = false;

        if (role === 'REQUESTER') {
          draftsQuery = draftsQuery.eq('requester_id', myId);
          pendingQuery = pendingQuery.eq('requester_id', myId);
          approvedQuery = approvedQuery.eq('requester_id', myId);
        } else if (role === 'APPROVER') {
          skipDrafts = true;
          pendingQuery = pendingQuery.eq('department_id', myDept);
          approvedQuery = approvedQuery.eq('department_id', myDept);
        } else if (role === 'PROCUREMENT') {
          skipDrafts = true;
          pendingQuery = supabase.from('purchase_requests').select('id', { count: 'exact', head: true }).eq('status', 'Approved');
          approvedQuery = supabase.from('purchase_requests').select('id', { count: 'exact', head: true }).eq('status', 'Converted to PO');
        } else if (role === 'ADMIN') {
          // Status filters already apply 'all' visibility
        }

        const [draftsRes, pendingRes, approvedRes] = await Promise.all([
          skipDrafts ? Promise.resolve({ count: 0 }) : draftsQuery,
          pendingQuery,
          approvedQuery
        ]);

        setStats({
          drafts: draftsRes?.count || 0,
          pending: pendingRes?.count || 0,
          approved: approvedRes?.count || 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, [profile]);

  return (
    <div className="page-container" data-testid="page-dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="card-grid">
        <div className="stat-card" data-testid="stat-card-my-drafts">
          <span className="stat-label">My Drafts</span>
          <span className="stat-value">{stats.drafts}</span>
        </div>
        <div className="stat-card" data-testid="stat-card-pending-approvals">
          <span className="stat-label">Pending Approvals</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card" data-testid="stat-card-approved-requests">
          <span className="stat-label">Approved Requests</span>
          <span className="stat-value">{stats.approved}</span>
        </div>
      </div>
    </div>
  );
}

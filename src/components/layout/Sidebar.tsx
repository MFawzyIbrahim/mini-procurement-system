import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, ShoppingCart, Settings, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { profile } = useAuth();
  const role = profile?.role_code;

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-header" data-testid="sidebar-header">
        <h2>Mini Procurement</h2>
      </div>
      <nav className="sidebar-nav" data-testid="sidebar-nav">
        <NavLink to="/" className="nav-link" data-testid="nav-dashboard">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {(role === 'REQUESTER' || role === 'ADMIN') && (
          <NavLink to="/requests" className="nav-link" data-testid="nav-requests">
            <FileText size={20} />
            <span>My Requests</span>
          </NavLink>
        )}

        {(role === 'APPROVER' || role === 'ADMIN') && (
          <NavLink to="/approvals" className="nav-link" data-testid="nav-approvals">
            <CheckSquare size={20} />
            <span>Approval Inbox</span>
          </NavLink>
        )}

        {(role === 'PROCUREMENT' || role === 'ADMIN') && (
          <NavLink to="/procurement" className="nav-link" data-testid="nav-approved-requests">
            <ClipboardCheck size={20} />
            <span>Approved Requests</span>
          </NavLink>
        )}

        {(role === 'PROCUREMENT' || role === 'ADMIN') && (
          <NavLink to="/orders" className="nav-link" data-testid="nav-orders">
            <ShoppingCart size={20} />
            <span>Purchase Orders</span>
          </NavLink>
        )}

        {role === 'ADMIN' && (
          <NavLink to="/admin" className="nav-link" data-testid="nav-admin">
            <Settings size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

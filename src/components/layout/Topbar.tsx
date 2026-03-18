import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const navigate = useNavigate();
  const { profile, profileLoading, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const displayName = profile?.full_name || user?.email || 'User';
  const displayRole = profileLoading ? '' : profile?.role_code ? ` (${profile.role_code})` : '';

  return (
    <header className="topbar" data-testid="topbar">
      <div className="topbar-title" />
      <div className="topbar-actions">
        <div className="user-profile" data-testid="user-profile-menu">
          <User size={20} />
          <span>{displayName}{displayRole}</span>
        </div>

        <button className="btn-logout" data-testid="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
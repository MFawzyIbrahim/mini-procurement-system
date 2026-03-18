import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestList from './pages/requests/RequestList';
import RequestForm from './pages/requests/RequestForm';
import RequestDetail from './pages/requests/RequestDetail';
import ApprovalInbox from './pages/approvals/ApprovalInbox';
import ApprovalDetail from './pages/approvals/ApprovalDetail';
import OrderList from './pages/orders/OrderList';
import OrderForm from './pages/orders/OrderForm';
import OrderDetail from './pages/orders/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import './index.css';

// Inline AuthGuard with debug diagnostics for visibility
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'left', fontFamily: 'monospace', background: '#ffebee', color: 'black' }}>
        <h2>Loading Auth State... (Blocked)</h2>
        <pre style={{ background: '#fff', padding: 12, border: '1px solid red' }}>
          Branch: rendering loading
          {'\n'}
          Session ID: {session?.user?.id || 'null'}
          {'\n'}
          Profile ID: {profile?.id || 'null'}
          {'\n'}
          Profile Name: {profile?.full_name || 'null'}
          {'\n'}
          Profile Role: {profile?.role_code || 'null'}
          {'\n'}
          Loading state variable: {loading ? 'true' : 'false'}
        </pre>
      </div>
    );
  }

  if (!session) {
    console.log('[AuthGuard] Redirecting to /login branch taken');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="requests" element={<RequestList />} />
            <Route path="requests/new" element={<RequestForm />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="requests/:id/edit" element={<RequestForm />} />
            <Route path="approvals" element={<ApprovalInbox />} />
            <Route path="approvals/:id" element={<ApprovalDetail />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/departments" element={<AdminDepartments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
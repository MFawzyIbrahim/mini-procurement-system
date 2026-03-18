import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
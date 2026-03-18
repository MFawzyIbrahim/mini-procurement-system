import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="layout-container" data-testid="app-layout">
      <Sidebar />
      <div className="main-container">
        <Topbar />
        <main className="content-area" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="page-container" data-testid="page-dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="card-grid">
        <div className="stat-card" data-testid="stat-card-my-drafts">
          <span className="stat-label">My Drafts</span>
          <span className="stat-value">2</span>
        </div>
        <div className="stat-card" data-testid="stat-card-pending-approvals">
          <span className="stat-label">Pending Approvals</span>
          <span className="stat-value">5</span>
        </div>
        <div className="stat-card" data-testid="stat-card-approved-requests">
          <span className="stat-label">Approved Requests</span>
          <span className="stat-value">8</span>
        </div>
      </div>
    </div>
  );
}

import React from "react";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Snooker Management System</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Active Games</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Available Tables</h3>
          <p className="stat-number">8</p>
        </div>
        <div className="stat-card">
          <h3>Today's Revenue</h3>
          <p className="stat-number">$0</p>
        </div>
        <div className="stat-card">
          <h3>Total Members</h3>
          <p className="stat-number">0</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activities">
          <h2>Recent Activities</h2>
          <p>No recent activities</p>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">Start New Game</button>
            <button className="action-btn">Add Member</button>
            <button className="action-btn">Create Booking</button>
            <button className="action-btn">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

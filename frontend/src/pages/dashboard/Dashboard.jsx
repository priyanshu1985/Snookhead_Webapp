import React, { useState } from "react";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const [activeGameType, setActiveGameType] = useState("Snooker");

  const gameTypes = ["Snooker", "Pool", "PlayStation5", "Table Tennis"];

  // Generate table data (8 tables total)
  const tables = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    number: String(index + 1).padStart(2, "0"),
    status: "available",
    lastReceipt: "Last Receipt",
  }));

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header with date */}
      <div className="dashboard-header">
        <div className="date-display">{getCurrentDate()}</div>
      </div>

      {/* Game Type Tabs */}
      <div className="game-type-tabs">
        {gameTypes.map((type) => (
          <button
            key={type}
            className={`game-tab ${activeGameType === type ? "active" : ""}`}
            onClick={() => setActiveGameType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table.id} className="snooker-table">
            <div className="table-surface">
              <div className="table-number">{table.number}</div>
            </div>
            <div className="table-status">
              <span className="status-indicator"></span>
              {table.lastReceipt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

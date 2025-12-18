import React, { useState } from "react";

const Tables = () => {
  // TODO: Replace with API call
  const mockTables = [
    { id: 1, name: "Table 1", status: "available", type: "full-size" },
    { id: 2, name: "Table 2", status: "occupied", type: "full-size" },
    { id: 3, name: "Table 3", status: "maintenance", type: "full-size" },
    { id: 4, name: "Table 4", status: "available", type: "compact" },
  ];
  const [tables] = useState(mockTables);

  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "status-available";
      case "occupied":
        return "status-occupied";
      case "maintenance":
        return "status-maintenance";
      default:
        return "";
    }
  };

  return (
    <div className="tables-page">
      <div className="page-header">
        <h1>Tables Management</h1>
        <button className="btn-primary">Add New Table</button>
      </div>

      <div className="tables-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${getStatusClass(table.status)}`}
          >
            <h3>{table.name}</h3>
            <p className="table-type">{table.type}</p>
            <p className={`table-status ${getStatusClass(table.status)}`}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </p>
            <div className="table-actions">
              <button className="btn-secondary">View Details</button>
              <button className="btn-primary">Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;

import React, { useState } from "react";

const Reports = () => {
  const [reportType, setReportType] = useState("revenue");
  const [dateRange, setDateRange] = useState("week");
  const getReportData = (type) => {
    switch (type) {
      case "revenue":
        return {
          title: "Revenue Report",
          total: 2500,
          items: [
            { date: "2025-12-13", amount: 350 },
            { date: "2025-12-14", amount: 420 },
            { date: "2025-12-15", amount: 380 },
            { date: "2025-12-16", amount: 290 },
            { date: "2025-12-17", amount: 460 },
            { date: "2025-12-18", amount: 320 },
            { date: "2025-12-19", amount: 280 },
          ],
        };
      case "usage":
        return {
          title: "Table Usage Report",
          items: [
            { table: "Table 1", hours: 45, utilization: "75%" },
            { table: "Table 2", hours: 38, utilization: "63%" },
            { table: "Table 3", hours: 42, utilization: "70%" },
            { table: "Table 4", hours: 35, utilization: "58%" },
          ],
        };
      case "customers":
        return {
          title: "Customer Report",
          items: [
            { name: "John Doe", visits: 12, spent: 450 },
            { name: "Jane Smith", visits: 8, spent: 320 },
            { name: "Mike Johnson", visits: 15, spent: 550 },
            { name: "Sarah Wilson", visits: 6, spent: 240 },
          ],
        };
      default:
        return null;
    }
  };

  // TODO: Replace with API call - compute data based on current filters
  const reportData = getReportData(reportType);

  const exportReport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting ${reportType} report as ${format}`);
    alert(`Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="export-buttons">
          <button className="btn-outline" onClick={() => exportReport("pdf")}>
            Export PDF
          </button>
          <button className="btn-outline" onClick={() => exportReport("excel")}>
            Export Excel
          </button>
        </div>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="revenue">Revenue Report</option>
            <option value="usage">Table Usage Report</option>
            <option value="customers">Customer Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {reportData && (
        <div className="report-content">
          <h2>{reportData.title}</h2>

          {reportType === "revenue" && (
            <div className="revenue-report">
              <div className="report-summary">
                <h3>Total Revenue: ${reportData.total}</h3>
              </div>
              <div className="revenue-chart">
                <h4>Daily Revenue</h4>
                <div className="chart-container">
                  {reportData.items.map((item, index) => (
                    <div key={index} className="chart-bar">
                      <div className="bar-label">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div className="bar-container">
                        <div
                          className="bar"
                          style={{ height: `${(item.amount / 500) * 100}px` }}
                        ></div>
                      </div>
                      <div className="bar-value">${item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reportType === "usage" && (
            <div className="usage-report">
              <div className="usage-table">
                <table>
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Hours Used</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.table}</td>
                        <td>{item.hours}h</td>
                        <td>
                          <div className="utilization-bar">
                            <div
                              className="utilization-fill"
                              style={{ width: item.utilization }}
                            ></div>
                            <span>{item.utilization}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "customers" && (
            <div className="customers-report">
              <div className="customers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Visits</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.visits}</td>
                        <td>${item.spent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

import React from "react";

const OwnerDashboardStats = ({ data, loading, error, getStat }) => {
  if (loading) {
    return <div className="loading-state">Loading detailed analysis...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <>
      <div className="owners-dashboard">
        <h5>Owners Dashboard</h5>
        {/* 1. KEY FINANCIALS ROW */}
        <div className="owners-cards">
          {/* Total Revenue */}
          <div className="card">
            <div>
              <p>Total Revenue</p>
              <h4>{data?.summary?.totalRevenueFormatted || "₹0.00"}</h4>
            </div>
            <span
              className={`trend ${
                data?.summary?.revenueTrend?.includes("-") ? "negative" : "positive"
              }`}
            >
              {data?.summary?.revenueTrend?.includes("-") ? "↓" : "↑"}{" "}
              {data?.summary?.revenueTrend?.replace("-", "") || "0%"} vs last week
            </span>
          </div>

          {/* Net Profit */}
          <div className="card">
            <div>
              <p>Net Profit</p>
              <h4>{data?.summary?.netProfitFormatted || "₹0.00"}</h4>
            </div>
            <span className="trend positive">Healthy margin</span>
          </div>

          {/* Occupancy Rate */}
          <div className="card">
            <div>
              <p>Occupancy Rate</p>
              <h4>{data?.summary?.occupancyRate || 0}%</h4>
              <div
                className="progress"
                style={{ height: "6px", background: "#f0f0f0", marginTop: "12px" }}
              >
                <span
                  style={{
                    width: `${data?.summary?.occupancyRate || 0}%`,
                    background: "#f08626",
                    display: "block",
                    height: "100%",
                    borderRadius: "3px"
                  }}
                />
              </div>
            </div>
            <span className="trend neutral" style={{ marginTop: "8px", fontSize: "12px" }}>
              {data?.summary?.activeTables} active tables
            </span>
          </div>

          {/* Low Stock Alert */}
          {(() => {
            const lowStockStat = getStat("Low Stock Items");
            return (
              <div
                className="card"
                style={{
                  borderLeft:
                    lowStockStat.value > 0 ? "4px solid #FF5252" : "4px solid #4CAF50",
                }}
              >
                <div>
                  <p>Inventory Health</p>
                  <h4>{lowStockStat.value || 0} Items</h4>
                </div>
                <span
                  className={`trend ${
                    lowStockStat.positive ? "positive" : "negative"
                  }`}
                >
                  {lowStockStat.trend || "Healthy"}
                </span>
              </div>
            );
          })()}
        </div>

        {/* 2. ANALYTICS GRID */}
        <div className="analytics-grid">
          {/* Revenue Breakdown */}
          <div className="analytics-card">
            <h6>
              Revenue Breakdown
              <span style={{ fontSize: "12px", color: "#999", fontWeight: "400" }}>
                {" "}
                Game vs Food
              </span>
            </h6>

            <div className="split-bar-container">
              <div
                className="split-bar-segment"
                style={{
                  width: `${
                    (data?.summary?.gameRevenue / (data?.summary?.totalRevenue || 1)) *
                    100
                  }%`,
                  background: "#f08626",
                }}
              />
              <div
                className="split-bar-segment"
                style={{
                  width: `${
                    (data?.summary?.foodRevenue / (data?.summary?.totalRevenue || 1)) *
                    100
                  }%`,
                  background: "#FFA726",
                }}
              />
            </div>

            <div className="segment-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#f08626" }} />
                <div>
                  <div style={{ fontWeight: "600", color: "#333" }}>Game Revenue</div>
                  <div>
                    {data?.summary?.gameRevenueFormatted} (
                    {(
                      (data?.summary?.gameRevenue / (data?.summary?.totalRevenue || 1)) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#FFA726" }} />
                <div>
                  <div style={{ fontWeight: "600", color: "#333" }}>Food & Bev</div>
                  <div>
                    {data?.summary?.foodRevenueFormatted} (
                    {(
                      (data?.summary?.foodRevenue / (data?.summary?.totalRevenue || 1)) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="analytics-card">
            <h6>Operational Insights</h6>

            <div className="metric-row">
              <div className="metric-label">
                <span style={{ fontSize: "18px" }}>⏱</span> Avg Session Duration
              </div>
              <div className="metric-value">{data?.summary?.avgSessionDuration || 0} mins</div>
            </div>

            <div className="metric-row">
              <div className="metric-label">
                <span style={{ fontSize: "18px" }}>🔥</span> Peak Activity
              </div>
              <div className="metric-value">{data?.summary?.peakHourLabel || "N/A"}</div>
            </div>

            <div className="metric-row">
              <div className="metric-label">
                <span style={{ fontSize: "18px" }}>🎱</span> Total Sessions
              </div>
              <div className="metric-value">{data?.summary?.totalSessions || 0}</div>
            </div>
          </div>
        </div>

        {/* 3. DETAILED REVENUE ANALYSIS */}
        <h6 style={{ margin: "24px 0 16px 4px", color: "#666", fontWeight: "600" }}>
          Detailed Revenue Analysis
        </h6>
        <div className="analytics-grid">
          {/* By Flow */}
          <div className="analytics-card">
            <h6>Revenue by Flow</h6>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Dashboard (Direct)</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.flow?.dashboard || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Reservation</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.flow?.reservation || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Queue System</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.flow?.queue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* By Booking Type */}
          <div className="analytics-card">
            <h6>Revenue by Booking Type</h6>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Timer Mode</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.bookingType?.timer || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Set Game (Stopwatch)</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.bookingType?.set || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Frame Mode</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.bookingType?.frame || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* By Collection Mode */}
          <div className="analytics-card">
            <h6>Revenue Collection</h6>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Cash</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.paymentMode?.cash || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>UPI / Online</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.paymentMode?.upi || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Wallet</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.paymentMode?.wallet || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* By Food Source */}
          <div className="analytics-card">
            <h6>Food & Beverage Source</h6>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Table Orders</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{(data?.summary?.breakdown?.foodSource?.table || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#666" }}>Direct Orders (POS)</span>
                <span style={{ fontWeight: "600" }}>
                  ₹{
                    (
                      data?.summary?.breakdown?.foodSource?.order_screen || 0
                    ).toLocaleString()
                  }
                </span>
              </div>
              <div style={{ height: "1px", background: "#eee", margin: "4px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#333", fontWeight: "500" }}>Total Food</span>
                <span style={{ fontWeight: "700", color: "#FFA726" }}>
                  {data?.summary?.foodRevenueFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. WALLET & NETWORK HEALTH */}
        <h6 style={{ margin: "0 0 16px 4px", color: "#666", fontWeight: "600" }}>
          Network & Members
        </h6>
        <div className="wallet-section" style={{ marginBottom: "32px" }}>
          {/* Map specific stats manually for better control */}
          {(() => {
            const activeWallets = getStat("Active Wallets");
            const newMembers = getStat("New Members");
            const creditMembers = getStat("Credit Member");

            return (
              <>
                <div className="wallet-card active">
                  <div
                    className="wallet-icon"
                    style={{ background: "#FFF3E0", color: "#f08626" }}
                  >
                    <i className="ri-wallet-3-line"></i>
                  </div>
                  <div className="wallet-info">
                    <h4>{activeWallets.value}</h4>
                    <p>Active Wallets</p>
                    <div
                      className="sub-text"
                      style={{ color: activeWallets.positive ? "green" : "red" }}
                    >
                      {activeWallets.trend}
                    </div>
                  </div>
                </div>

                <div className="wallet-card">
                  <div
                    className="wallet-icon"
                    style={{ background: "#fff8e1", color: "#FFB300" }}
                  >
                    <i className="ri-user-add-line"></i>
                  </div>
                  <div className="wallet-info">
                    <h4>{newMembers.value}</h4>
                    <p>New Members</p>
                    <div className="sub-text">{newMembers.trend} vs last week</div>
                  </div>
                </div>

                <div className="wallet-card warning">
                  <div
                    className="wallet-icon"
                    style={{ background: "#ffebee", color: "#FF5252" }}
                  >
                    <i className="ri-error-warning-line"></i>
                  </div>
                  <div className="wallet-info">
                    <h4>{creditMembers.value}</h4>
                    <p>Credit Members</p>
                    <div className="sub-text" style={{ color: "#FF5252" }}>
                      {creditMembers.trend}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* 4. TOP GAMES PERFORMANCE */}
        <h6 style={{ margin: "0 0 16px 4px", color: "#666", fontWeight: "600" }}>
          Game Performance
        </h6>
        <div
          className="analytics-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {data?.gameData?.map((game, index) => (
            <div className="card" key={index} style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h6 style={{ margin: 0, fontSize: "15px" }}>{game.name}</h6>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "#FFF3E0",
                    color: "#f08626",
                  }}
                >
                  {game.status}
                </span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <p style={{ margin: 0, fontSize: "12px" }}>Usage</p>
                <div className="progress" style={{ height: "4px", marginTop: "4px" }}>
                  <span
                    style={{
                      width: `${game.usage}%`,
                      background: "#f08626",
                      display: "block",
                      height: "100%",
                      borderRadius: "2px"
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "auto",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "12px" }}>Revenue</p>
                  <div style={{ fontWeight: "700", color: "#333" }}>{game.revenue}</div>
                </div>
                <div style={{ fontSize: "18px", color: "#ccc" }}>
                  <i className={game.icon}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* 5. STAFF PERFORMANCE */}
      <h6 style={{ margin: "24px 0 16px 4px", color: "#666", fontWeight: "600" }}>
        Staff Performance (Shifts)
      </h6>
      <div className="analytics-card" style={{ overflowX: "auto" }}>
         {(!data?.summary?.employee_shifts || data.summary.employee_shifts.length === 0) ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
               No shifts found for this period
            </div>
         ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead>
                  <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                     <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#666" }}>Employee</th>
                     <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#666" }}>Date</th>
                     <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#666" }}>Shift Time</th>
                     <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", color: "#666" }}>Duration</th>
                     <th style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#666" }}>Bills Generated</th>
                     <th style={{ padding: "12px", textAlign: "right", fontSize: "13px", color: "#666" }}>Revenue</th>
                  </tr>
               </thead>
               <tbody>
                  {data.summary.employee_shifts.map((shift, idx) => (
                     <tr key={shift.id || idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500" }}>{shift.name} <span style={{fontSize: '11px', color: '#888', fontWeight: 'normal'}}>({shift.role})</span></td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#444" }}>{shift.date}</td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#444" }}>{shift.time}</td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#444" }}>{shift.duration}</td>
                        <td style={{ padding: "12px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#333" }}>{shift.bills_generated}</td>
                        <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#2e7d32" }}>{shift.revenueFormatted}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </div>

    </div>
    </>
  );
};

export default OwnerDashboardStats;

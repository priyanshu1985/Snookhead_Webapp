import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Activity
} from "react-feather";

const COLORS = ["#f08626", "#FFA726", "#FFCC80", "#FFE0B2"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const OwnerDashboardStats = ({ data, loading, error, getStat }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Analyzing business metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <AlertCircle size={48} color="#ff5252" />
        <p>{error}</p>
      </div>
    );
  }

  // --- PREPARE DATA FOR CHARTS ---

  // 1. Revenue Split Data (Pie Chart)
  const revenueSplitData = useMemo(() => {
    if (!data?.summary) return [];
    return [
      { name: "Game Revenue", value: data.summary.gameRevenue || 0 },
      { name: "Food & Bev", value: data.summary.foodRevenue || 0 },
    ];
  }, [data]);

  // 2. Game Usage Data (Bar Chart)
  const gameUsageData = useMemo(() => {
    if (!data?.gameData) return [];
    return data.gameData.map(g => ({
      name: g.name,
      usage: g.usage, // percentage
      revenue: parseFloat(g.revenue.replace(/[^0-9.]/g, '')) || 0
    }));
  }, [data]);

  // 3. Flow Revenue Data (Bar/Pie)
  const flowData = useMemo(() => {
    const flow = data?.summary?.breakdown?.flow;
    if (!flow) return [];
    return [
      { name: "Direct", value: flow.dashboard || 0 },
      { name: "Reservation", value: flow.reservation || 0 },
      { name: "Queue", value: flow.queue || 0 },
    ];
  }, [data]);


  return (
    <div className="owners-dashboard">
      
      {/* --- HEADER SECTION --- */}
      <div className="dashboard-header">
        <div>
          <h5>Business Overview</h5>
          <p className="subtitle">
            {data?.period === 'custom' 
              ? `Range: ${new Date(data?.currentDate || Date.now()).toLocaleDateString()}` 
              : `Showing analytics for ${data?.period}`}
          </p>
        </div>
        <div className="live-tag">
            <span className="dot"></span> Live Updates
        </div>
      </div>

      {/* --- 1. HERO CARDS (KEY METRICS) --- */}
      <div className="hero-metrics-grid">
        {/* Total Revenue */}
        <div className="metric-card primary">
          <div className="metric-icon-bg">
            <DollarSign size={24} color="#f08626" />
          </div>
          <div className="metric-content">
            <p className="label">Total Revenue</p>
            <h3>{data?.summary?.totalRevenueFormatted || "₹0.00"}</h3>
            <div className={`trend-badge ${data?.summary?.revenueTrend?.includes("-") ? "down" : "up"}`}>
               {data?.summary?.revenueTrend?.includes("-") ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
               <span>{data?.summary?.revenueTrend?.replace("-", "") || "0%"}</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="metric-card">
          <div className="metric-icon-bg green">
            <Activity size={24} color="#2e7d32" />
          </div>
          <div className="metric-content">
            <p className="label">Net Profit</p>
            <h3>{data?.summary?.netProfitFormatted || "₹0.00"}</h3>
            <p className="sub-label">After expenses</p>
          </div>
        </div>

        {/* Active Tables */}
        <div className="metric-card">
           <div className="metric-icon-bg purple">
            <Target size={24} color="#7b1fa2" />
          </div>
          <div className="metric-content">
             <p className="label">Occupancy</p>
             <h3>{data?.summary?.occupancyRate || 0}%</h3>
             <p className="sub-label">{data?.summary?.activeTables} tables active</p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="metric-card">
           <div className="metric-icon-bg blue">
            <Users size={24} color="#1976d2" />
          </div>
          <div className="metric-content">
             <p className="label">Sessions</p>
             <h3>{data?.summary?.totalSessions || 0}</h3>
             <p className="sub-label">Avg {data?.summary?.avgSessionDuration || 0} mins</p>
          </div>
        </div>
      </div>

      {/* --- 2. CHARTS SECTION --- */}
      <div className="charts-row">
        
        {/* REVENUE SPLIT (PIE) */}
        <div className="chart-card">
           <div className="card-header">
              <h6>Revenue Sources</h6>
              <button className="icon-btn"><Activity size={16}/></button>
           </div>
           <div className="chart-container" style={{ height: 250 }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueSplitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* GAME PERFORMANCE (BAR) */}
        <div className="chart-card wide">
           <div className="card-header">
              <h6>Game Performance (Usage %)</h6>
           </div>
           <div className="chart-container" style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={gameUsageData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                        cursor={{fill: '#f5f5f5'}}
                        formatter={(value, name) => [name === 'revenue' ? `₹${value}` : `${value}%`, name === 'revenue' ? 'Revenue' : 'Usage']} 
                    />
                    <Bar dataKey="usage" fill="#f08626" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* --- 3. DETAILED STATS GRID --- */}
      <div className="stats-grid">
         {/* Booking Types */}
         <div className="stat-group-card">
            <h6>Booking Types</h6>
            <div className="mini-stat-row">
               <span>Timer Mode</span>
               <strong>₹{(data?.summary?.breakdown?.bookingType?.timer || 0).toLocaleString()}</strong>
            </div>
            <div className="mini-stat-row">
               <span>Set Game</span>
               <strong>₹{(data?.summary?.breakdown?.bookingType?.set || 0).toLocaleString()}</strong>
            </div>
            <div className="mini-stat-row">
               <span>Frame Mode</span>
               <strong>₹{(data?.summary?.breakdown?.bookingType?.frame || 0).toLocaleString()}</strong>
            </div>
         </div>

         {/* Payment Methods */}
         <div className="stat-group-card">
            <h6>Collections</h6>
            <div className="mini-stat-row">
               <span>Cash</span>
               <strong className="cash-text">₹{(data?.summary?.breakdown?.paymentMode?.cash || 0).toLocaleString()}</strong>
            </div>
            <div className="mini-stat-row">
               <span>UPI / Online</span>
               <strong className="upi-text">₹{(data?.summary?.breakdown?.paymentMode?.upi || 0).toLocaleString()}</strong>
            </div>
            <div className="mini-stat-row">
               <span>Wallet</span>
               <strong>₹{(data?.summary?.breakdown?.paymentMode?.wallet || 0).toLocaleString()}</strong>
            </div>
         </div>

         {/* Inventory Health */}
         {(() => {
            const lowStockStat = getStat("Low Stock Items");
            return (
              <div className="stat-group-card" style={{borderLeft: lowStockStat.value > 0 ? "4px solid #ff5252" : "4px solid #4CAF50"}}>
                  <h6>Inventory Health</h6>
                  <div className="inventory-stat">
                      <h3>{lowStockStat.value || 0}</h3>
                      <p>Low Stock Items</p>
                  </div>
                  <div className={`status-badge ${lowStockStat.value > 0 ? 'warning' : 'success'}`}>
                     {lowStockStat.value > 0 ? 'Action Required' : 'All Good'}
                  </div>
              </div>
            );
         })()}
      </div>

      {/* --- 4. STAFF PERFORMANCE TABLE --- */}
      <div className="staff-section">
          <div className="section-header">
             <h6>Staff Performance</h6>
             <button className="view-all-btn">View All Shifts</button>
          </div>
          <div className="table-container">
            {(!data?.summary?.employee_shifts || data.summary.employee_shifts.length === 0) ? (
                <div className="empty-state">
                   <Users size={48} color="#eee" />
                   <p>No shift data available for this period</p>
                </div>
             ) : (
                <table className="modern-table">
                   <thead>
                      <tr>
                         <th>Employee</th>
                         <th>Date</th>
                         <th className="text-center">Shift</th>
                         <th className="text-center">Bills</th>
                         <th className="text-right">Revenue</th>
                      </tr>
                   </thead>
                   <tbody>
                      {data.summary.employee_shifts.map((shift, idx) => (
                         <tr key={shift.id || idx}>
                            <td>
                               <div className="user-cell">
                                  <div className="avatar-circle">{shift.name.charAt(0)}</div>
                                  <div>
                                     <div className="fw-bold">{shift.name}</div>
                                     <div className="text-muted small">{shift.role}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="text-muted">{shift.date}</td>
                            <td className="text-center">
                               <span className="pill regular">{shift.time}</span>
                            </td>
                            <td className="text-center fw-bold">{shift.bills_generated}</td>
                            <td className="text-right fw-bold text-success">{shift.revenueFormatted}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             )}
          </div>
      </div>

    </div>
  );
};

export default OwnerDashboardStats;

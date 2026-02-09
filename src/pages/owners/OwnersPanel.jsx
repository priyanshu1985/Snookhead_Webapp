import { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import OwnerSafetyPanel from "../../components/owner/OwnerSafetyPanel";
import { ownerAPI } from "../../services/api";
import OwnerDashboardStats from "../../components/owner/OwnerDashboardStats";
import AddEmployee from "../../components/owner/AddEmployee";
import AddExpenses from "../../components/owner/AddExpenses";
import "../../styles/owners.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "react-feather";

const OwnersPanel = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState("today"); // Default to today

  useEffect(() => {
    // Set default date range for 'today'
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    setStartDate(start);
    setEndDate(end);
    fetchDashboardData(start, end, "today");
  }, []);

  const fetchDashboardData = async (start, end, p) => {
    try {
      setLoading(true);
      const s = start || startDate;
      const e = end || endDate;
      const per = p || period;

      const response = await ownerAPI.getSummary(
        per, 
        s.toISOString(), 
        e.toISOString()
      );
      setData(response);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      setPeriod("custom");
      fetchDashboardData(start, end, "custom");
    }
  };

  const handlePresetChange = (newPeriod) => {
      setPeriod(newPeriod);
      const now = new Date();
      let start = new Date();
      let end = new Date();

      switch(newPeriod) {
          case 'today':
              start.setHours(0,0,0,0);
              end.setHours(23,59,59,999);
              break;
          case 'yesterday':
              start.setDate(now.getDate() - 1);
              start.setHours(0,0,0,0);
              end.setDate(now.getDate() - 1);
              end.setHours(23,59,59,999);
              break;
          case 'week':
              start.setDate(now.getDate() - 7);
              start.setHours(0,0,0,0);
              break;
          case 'month':
              start.setMonth(now.getMonth() - 1);
              start.setHours(0,0,0,0);
              break;
          default:
              break;
      }
      setStartDate(start);
      setEndDate(end);
      fetchDashboardData(start, end, newPeriod);
  };

  // Helper to get stats by title (since IDs might shift)
  const getStat = (title) => data?.stats?.find((s) => s.title === title) || {};

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div
        className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`}
      />

      <div className="dashboard-main">
        <Navbar />

        <OwnerSafetyPanel>
          <div className="owners-dashboard-container">
            {/* TABS NAVIGATION */}
            <div
              className="owners-tabs"
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                padding: "20px 20px 0 20px",
              }}
            >
              {[
                { key: "dashboard", label: "Owner Dashboard" },
                { key: "employee", label: "Add Employee" },
                { key: "expenses", label: "Add Expenses" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "30px",
                    border: "none",
                    background:
                      activeTab === tab.key ? "#f08626" : "transparent",
                    color: activeTab === tab.key ? "white" : "#666",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "15px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* DATE FILTER BAR */}
            {activeTab === 'dashboard' && (
                <div style={{
                    padding: '0 20px 20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <div className="date-presets" style={{ display: 'flex', gap: '8px' }}>
                        {['today', 'yesterday', 'week', 'month'].map(p => (
                            <button
                                key={p}
                                onClick={() => handlePresetChange(p)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    border: `1px solid ${period === p ? '#f08626' : '#e0e0e0'}`,
                                    background: period === p ? '#fff3e0' : 'white',
                                    color: period === p ? '#f08626' : '#666',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        background: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <Calendar size={16} color="#666" />
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            dateFormat="MMM d, yyyy"
                            className="custom-date-picker"
                            placeholderText="Select date range"
                        />
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <div style={{ padding: "0" }}>
              {activeTab === "dashboard" && (
                <OwnerDashboardStats
                  data={data}
                  loading={loading}
                  error={error}
                  getStat={getStat}
                />
              )}

              {activeTab === "employee" && <AddEmployee />}

              {activeTab === "expenses" && <AddExpenses />}
            </div>
          </div>
        </OwnerSafetyPanel>
      </div>
    </div>
  );
};

export default OwnersPanel;

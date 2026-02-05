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

const OwnersPanel = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getSummary("week"); // Default to weekly view
      setData(response);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
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

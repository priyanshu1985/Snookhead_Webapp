import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ordersAPI, tablesAPI, menuAPI, adminStationsAPI } from "../../services/api";
import "../../styles/adminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalTables: 0,
    totalMenuItems: 0,
    totalRevenue: 0,
  });

  // Stations state
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

  // Fetch analytics data
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersResponse = await ordersAPI.getAll();
      const orders = ordersResponse?.data || [];

      // Fetch tables
      let tables = [];
      try {
        const tablesResponse = await tablesAPI.getAll();
        tables = tablesResponse?.data || (Array.isArray(tablesResponse) ? tablesResponse : []);
      } catch (err) {
        console.log("Could not fetch tables:", err);
      }

      // Fetch menu items
      let menuItems = [];
      try {
        const menuResponse = await menuAPI.getAll();
        menuItems = menuResponse?.data || (Array.isArray(menuResponse) ? menuResponse : []);
      } catch (err) {
        console.log("Could not fetch menu:", err);
      }

      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const completedOrders = orders.filter(o => o.status === "completed").length;
      const totalRevenue = orders
        .filter(o => o.status === "completed")
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalTables: tables.length,
        totalMenuItems: menuItems.length,
        totalRevenue,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations
  const fetchStations = async () => {
    try {
      setStationsLoading(true);
      setStationsError("");

      const params = subscriptionFilter !== "all"
        ? { subscription_type: subscriptionFilter }
        : {};

      const data = await adminStationsAPI.getAll(params);
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch stations:", err);
      setStationsError(err.message || "Failed to load stations");
    } finally {
      setStationsLoading(false);
    }
  };

  // Handle pause subscription
  const handlePauseSubscription = async (stationId) => {
    try {
      await adminStationsAPI.pauseSubscription(stationId);
      fetchStations(); // Refresh list
    } catch (err) {
      console.error("Failed to pause subscription:", err);
      alert(err.message || "Failed to pause subscription");
    }
  };

  // Handle remove station
  const handleRemoveStation = async (stationId) => {
    if (!window.confirm("Are you sure you want to remove this station?")) return;

    try {
      await adminStationsAPI.remove(stationId);
      fetchStations(); // Refresh list
    } catch (err) {
      console.error("Failed to remove station:", err);
      alert(err.message || "Failed to remove station");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchStations();
  }, []);

  useEffect(() => {
    fetchStations();
  }, [subscriptionFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get subscription badge class
  const getSubscriptionClass = (type) => {
    switch (type) {
      case "enterprise": return "subscription-enterprise";
      case "pro": return "subscription-pro";
      case "basic": return "subscription-basic";
      default: return "subscription-free";
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "active": return "status-active";
      case "paused": return "status-paused";
      case "expired": return "status-expired";
      case "removed": return "status-removed";
      default: return "";
    }
  };

  return (
    <div className="admin-page">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h4 className="admin-brand">SNOKEHEAD</h4>
          <span className="admin-role-badge">Admin Panel</span>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name || "Admin"}</span>
            <span className="admin-user-role">{user?.role || "Admin"}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {/* Analytics Section */}
          <section className="admin-section">
            <div className="section-header">
              <h5 className="section-title">Analytics Overview</h5>
              <button className="refresh-btn" onClick={fetchStats} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loading ? (
              <p className="loading-text">Loading analytics...</p>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon orders-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalOrders}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.pendingOrders}</span>
                    <span className="stat-label">Pending Orders</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon completed-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.completedOrders}</span>
                    <span className="stat-label">Completed Orders</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon tables-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalTables}</span>
                    <span className="stat-label">Total Tables</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalMenuItems}</span>
                    <span className="stat-label">Menu Items</span>
                  </div>
                </div>

                <div className="stat-card revenue-card">
                  <div className="stat-icon revenue-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalRevenue.toFixed(2)}</span>
                    <span className="stat-label">Total Revenue</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Stations Management Section */}
          <section className="admin-section">
            <div className="section-header">
              <h5 className="section-title">Station Management</h5>
              <div className="section-actions">
                <select
                  className="filter-select"
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                >
                  <option value="all">All Subscriptions</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <button className="refresh-btn" onClick={fetchStations} disabled={stationsLoading}>
                  {stationsLoading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {stationsError && <div className="alert-danger">{stationsError}</div>}

            {stationsLoading ? (
              <p className="loading-text">Loading stations...</p>
            ) : stations.length === 0 ? (
              <div className="empty-state">
                <p>No stations found</p>
                <small>Stations will appear here once they are onboarded</small>
              </div>
            ) : (
              <div className="stations-grid">
                {stations.map((station) => (
                  <div className="station-card" key={station.id}>
                    <div className="station-header">
                      <div className="station-logo">
                        {station.station_photo_url ? (
                          <img src={station.station_photo_url} alt={station.station_name} />
                        ) : (
                          <span>{station.station_name?.charAt(0) || "S"}</span>
                        )}
                      </div>
                      <div className="station-title">
                        <h6>{station.station_name}</h6>
                        <span className="station-location">
                          {station.location_city}, {station.location_state}
                        </span>
                      </div>
                    </div>

                    <div className="station-badges">
                      <span className={`subscription-badge ${getSubscriptionClass(station.subscription_type)}`}>
                        {station.subscription_type}
                      </span>
                      <span className={`status-badge ${getStatusClass(station.subscription_status)}`}>
                        {station.subscription_status}
                      </span>
                    </div>

                    <div className="station-info">
                      <div className="info-row">
                        <span className="info-label">Owner:</span>
                        <span className="info-value">{station.owner_name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{station.owner_phone}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Onboarded:</span>
                        <span className="info-value">{formatDate(station.onboarding_date)}</span>
                      </div>
                      {station.StationPayments?.length > 0 && (
                        <div className="info-row">
                          <span className="info-label">Payments:</span>
                          <span className="info-value">{station.StationPayments.length} records</span>
                        </div>
                      )}
                      {station.StationIssues?.length > 0 && (
                        <div className="info-row">
                          <span className="info-label">Issues:</span>
                          <span className="info-value issue-count">
                            {station.StationIssues.filter(i => i.status === "open").length} open
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="station-actions">
                      {station.subscription_status === "active" && (
                        <button
                          className="action-btn pause-btn"
                          onClick={() => handlePauseSubscription(station.id)}
                        >
                          Pause
                        </button>
                      )}
                      <button
                        className="action-btn view-btn"
                        onClick={() => navigate(`/admin/stations/${station.id}`)}
                      >
                        View
                      </button>
                      {station.status !== "removed" && (
                        <button
                          className="action-btn remove-btn"
                          onClick={() => handleRemoveStation(station.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

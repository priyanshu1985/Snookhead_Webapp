import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ordersAPI, tablesAPI, menuAPI, adminStationsAPI, bugsAPI } from "../../services/api";
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

  // Bugs state
  const [bugs, setBugs] = useState([]);
  const [bugsLoading, setBugsLoading] = useState(true);

  // Selected Bug for View Modal
  const [selectedBug, setSelectedBug] = useState(null);

  // Render Bug Details Modal
  const renderBugModal = () => {
    if (!selectedBug) return null;

    return (
      <div className="bug-modal-overlay" onClick={() => setSelectedBug(null)}>
        <div className="bug-modal-content" onClick={e => e.stopPropagation()}>
          <div className="bug-modal-header">
            <h4>Bug Details</h4>
            <button className="close-btn" onClick={() => setSelectedBug(null)}>×</button>
          </div>
          <div className="bug-modal-body">
            <div className="bug-detail-row">
              <span className="label">Title:</span>
              <span className="value title">{selectedBug.title}</span>
            </div>
            <div className="bug-detail-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${getStatusClass(selectedBug.status)}`}>{selectedBug.status}</span>
            </div>
            <div className="bug-detail-row">
               <span className="label">Description:</span>
               <p className="description-text">{selectedBug.description || "No description provided."}</p>
            </div>
            
            {(selectedBug.imageurl || selectedBug.image_url || selectedBug.audiourl || selectedBug.audio_url) && (
               <div className="attachments-section">
                  <span className="label">Attachments:</span>
                  <div className="attachments-grid">
                     {(selectedBug.imageurl || selectedBug.image_url) && (
                        <div className="attachment-item">
                           <p>Screen Capture</p>
                           <a href={selectedBug.imageurl || selectedBug.image_url} target="_blank" rel="noreferrer">
                              <img src={selectedBug.imageurl || selectedBug.image_url} alt="Bug Screenshot" className="bug-image-preview" />
                           </a>
                        </div>
                     )}
                     {(selectedBug.audiourl || selectedBug.audio_url) && (
                        <div className="attachment-item">
                           <p>Voice Report</p>
                           <audio controls src={selectedBug.audiourl || selectedBug.audio_url} className="bug-audio-player" />
                        </div>
                     )}
                  </div>
               </div>
            )}

            <div className="reporter-info">
               <small>Reported by: {selectedBug.reporter?.name || "Unknown"}</small>
               <small>Station: {selectedBug.station?.station_name || "Unknown"}</small>
               <small>Date: {formatDate(selectedBug.createdAt)}</small>
            </div>
          </div>
          <div className="bug-modal-footer">
             {selectedBug.status !== 'resolved' && (
                 <button 
                   className="resolve-btn"
                   onClick={() => {
                      handleUpdateBugStatus(selectedBug.id, 'resolved');
                      setSelectedBug(null);
                   }}
                 >
                   Mark as Resolved
                 </button>
             )}
             <button className="secondary-btn" onClick={() => setSelectedBug(null)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

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

  // Fetch bugs
  const fetchBugs = async () => {
    try {
      setBugsLoading(true);
      const data = await bugsAPI.getAll();
      setBugs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bugs:", err);
    } finally {
      setBugsLoading(false);
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

  // Handle bug status update
  const handleUpdateBugStatus = async (bugId, newStatus) => {
    try {
      await bugsAPI.updateStatus(bugId, newStatus);
      fetchBugs();
    } catch (err) {
       console.error("Failed to update bug:", err);
       alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchStations();
    fetchBugs();
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

  // Get bug priority color
  const getBugPriorityColor = (priority) => {
     switch(priority) {
       case 'critical': return '#d32f2f';
       case 'high': return '#f57c00';
       case 'medium': return '#1976d2';
       default: return '#757575';
     }
  };

  return (
    <div className="admin-page">
      {renderBugModal()}
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h4 className="admin-brand">SNOKHEAD</h4>
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

                <div className="stat-card completed-icon">
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

          {/* Reported Issues Section */}
          <section className="admin-section">
            <div className="section-header">
              <h5 className="section-title">Reported Issues</h5>
              <button className="refresh-btn" onClick={fetchBugs} disabled={bugsLoading}>
                {bugsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
            
            {bugsLoading ? (
               <p className="loading-text">Loading bugs...</p>
            ) : bugs.length === 0 ? (
               <div className="empty-state">
                 <p>No issues reported</p>
                 <small>Great job! The system is running smoothly.</small>
               </div>
            ) : (
               <div className="table-container">
                  <table className="admin-table">
                    <thead>
                       <tr>
                          <th>Status</th>
                          <th>Severity</th>
                          <th>Issue</th>
                          <th>Attachments</th>
                          <th>Station / Owner</th>
                          <th>Date</th>
                          <th>Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                      {bugs.map(bug => (
                        <tr key={bug.id}>
                           <td>
                             <span className={`status-badge ${getStatusClass(bug.status === 'in_progress' ? 'active' : bug.status === 'resolved' ? 'active' : bug.status)}`}
                                   style={{ 
                                     background: bug.status === 'pending' ? '#fff3e0' : bug.status === 'resolved' ? '#e8f5e9' : '#f5f5f5', 
                                     color: bug.status === 'pending' ? '#f57c00' : bug.status === 'resolved' ? '#2e7d32' : '#666' 
                                   }}>
                                {bug.status?.replace('_', ' ')}
                             </span>
                           </td>
                           <td>
                              <div className="severity-cell">
                                <span className="severity-dot" style={{ background: getBugPriorityColor(bug.priority) }}></span>
                                <span className="severity-text">{bug.priority}</span>
                              </div>
                           </td>
                           <td>
                              <div className="issue-title">{bug.title}</div>
                              {bug.description && <div className="issue-desc">{bug.description}</div>}
                           </td>
                           <td>
                              <div className="attachment-icons">
                                {bug.audio_url && (
                                  <span className="attach-icon audio" title="Voice Report">
                                    🎤
                                  </span>
                                )}
                                {bug.image_url && (
                                  <span className="attach-icon image" title="Screen Capture">
                                    📷
                                  </span>
                                )}
                                {!bug.audio_url && !bug.image_url && <span className="no-attach">-</span>}
                              </div>
                           </td>
                           <td>
                              <div className="station-name">
                                 {bug.station?.stationname || "Unknown Station"}
                              </div>
                              <div className="owner-name">
                                 {bug.reporter?.name || bug.owner?.name || bug.station?.ownername || "Unknown Owner"}
                              </div>
                           </td>
                           <td className="date-cell">
                              {formatDate(bug.createdAt)}
                           </td>
                           <td>
                              <div className="action-buttons">
                                 <button
                                   className="view-btn-sm"
                                   onClick={() => setSelectedBug(bug)}
                                 >
                                   View
                                 </button>
                                 {bug.status !== 'resolved' && (
                                    <button 
                                      className="resolve-btn-sm"
                                      onClick={() => handleUpdateBugStatus(bug.id, 'resolved')}
                                    >
                                      Resolve
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ordersAPI, tablesAPI, menuAPI } from "../../services/api";
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

  // Cafe details - these would typically come from a backend API
  const [cafeDetails] = useState({
    name: "SNOKEHEAD",
    location: "123 Main Street, City Center",
    ownerName: "John Doe",
    ownerPhone: "+91 98765 43210",
    email: "contact@snokehead.com",
    openingHours: "10:00 AM - 11:00 PM",
    establishedYear: "2023",
  });

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

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          {/* Cafe Details Section */}
          <section className="admin-section">
            <h5 className="section-title">Cafe Details</h5>
            <div className="cafe-details-card">
              <div className="cafe-header">
                <div className="cafe-logo">
                  <span className="logo-text">{cafeDetails.name.charAt(0)}</span>
                </div>
                <div className="cafe-name-section">
                  <h2 className="cafe-name">{cafeDetails.name}</h2>
                  <p className="cafe-tagline">Premium Snooker & Cafe</p>
                </div>
              </div>

              <div className="cafe-info-grid">
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{cafeDetails.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Owner Name</span>
                  <span className="info-value">{cafeDetails.ownerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact Number</span>
                  <span className="info-value">{cafeDetails.ownerPhone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{cafeDetails.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Opening Hours</span>
                  <span className="info-value">{cafeDetails.openingHours}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Established</span>
                  <span className="info-value">{cafeDetails.establishedYear}</span>
                </div>
              </div>
            </div>
          </section>

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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

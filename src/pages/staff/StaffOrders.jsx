import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../services/api";
import "../../styles/foodOrder.css";
import "../../styles/staffOrders.css";

const StaffOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Source filter options
  const sourceFilters = [
    { key: "all", label: "All" },
    { key: "table_booking", label: "Table Booking" },
    { key: "counter", label: "Counter/Screen" },
    { key: "zomato", label: "Zomato" },
    { key: "swiggy", label: "Swiggy" },
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      // Backend returns { total, currentPage, data: orders }
      const ordersList =
        response?.data || (Array.isArray(response) ? response : []);
      setOrders(ordersList);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      // Refresh orders list after status update
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(
        "Failed to update order status: " + (err.message || "Unknown error")
      );
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders by status (pending) and source
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const filteredOrders =
    sourceFilter === "all"
      ? pendingOrders
      : pendingOrders.filter((o) => o.order_source === sourceFilter);

  // Count orders by source
  const getSourceCount = (source) => {
    if (source === "all") return pendingOrders.length;
    return pendingOrders.filter((o) => o.order_source === source).length;
  };

  // Get source label for display
  const getSourceLabel = (source) => {
    const sourceMap = {
      table_booking: "Table",
      counter: "Counter",
      zomato: "Zomato",
      swiggy: "Swiggy",
    };
    return sourceMap[source] || source;
  };

  // Get source badge class
  const getSourceClass = (source) => {
    const classMap = {
      table_booking: "source-table",
      counter: "source-counter",
      zomato: "source-zomato",
      swiggy: "source-swiggy",
    };
    return classMap[source] || "";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="staff-page">
      {/* Staff Header */}
      <header className="staff-header">
        <div className="staff-header-left">
          <h4 className="staff-brand">SNOKEHEAD</h4>
          <span className="staff-role-badge">Staff Portal</span>
        </div>
        <div className="staff-header-right">
          <div className="staff-user-info">
            <span className="staff-user-name">
              {user?.name || "Staff Member"}
            </span>
            <span className="staff-user-role">{user?.role || "Staff"}</span>
          </div>
          <button className="staff-logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-main">
        <div className="staff-content">
          <div className="staff-title-row">
            <h5>
              <span>Active Orders</span>
              {filteredOrders.length > 0 && (
                <span
                  style={{
                    marginLeft: "12px",
                    fontSize: "16px",
                    color: "#F08626",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #FEF3E7 0%, #FDF0E1 100%)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    border: "1px solid #F08626",
                  }}
                >
                  {filteredOrders.length}
                </span>
              )}
            </h5>
            <button
              className="refresh-btn"
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span style={{ marginRight: "8px" }}>⟳</span>
                  Refreshing...
                </span>
              ) : (
                <span>
                  <span style={{ marginRight: "8px" }}>↻</span>
                  Refresh
                </span>
              )}
            </button>
          </div>

          {error && (
            <div
              className="alert alert-danger"
              style={{
                background: "linear-gradient(135deg, #ffe6e6 0%, #ffcccc 100%)",
                color: "#cc0000",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid #ff9999",
                marginBottom: "20px",
                fontWeight: "600",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Source Filter Tabs */}
          <div className="source-filter-tabs">
            {sourceFilters.map((filter) => (
              <button
                key={filter.key}
                className={`source-tab ${
                  sourceFilter === filter.key ? "active" : ""
                }`}
                onClick={() => setSourceFilter(filter.key)}
              >
                <span>{filter.label}</span>
                <span className="source-count">
                  {getSourceCount(filter.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="orders-list">
            {loading && orders.length === 0 ? (
              <div className="loading-text">
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
                <div>Loading orders...</div>
                <div
                  style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}
                >
                  Please wait while we fetch the latest orders
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-text">
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <div>
                  {sourceFilter === "all"
                    ? "No active orders at the moment"
                    : `No active orders from ${
                        sourceFilters.find((f) => f.key === sourceFilter)?.label
                      }`}
                </div>
                <div
                  style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}
                >
                  New orders will appear here automatically
                </div>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div
                      style={{ display: "flex", alignItems: "center", flex: 1 }}
                    >
                      <span className="order-index">{index + 1}</span>
                      <div className="order-info">
                        <span className="order-date">
                          📅 {formatDate(order.createdAt)}
                        </span>
                        <span className="order-customer">
                          👤 {order.personName || "Customer"}
                        </span>
                      </div>
                    </div>
                    <div className="order-badges">
                      {order.order_source && (
                        <span
                          className={`source-badge ${getSourceClass(
                            order.order_source
                          )}`}
                        >
                          {getSourceLabel(order.order_source)}
                        </span>
                      )}
                      <span
                        className={`order-status ${order.status || "pending"}`}
                      >
                        {order.status === "pending"
                          ? "🕐 Pending"
                          : "✅ " + (order.status || "Pending")}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-items">
                    {order.OrderItems &&
                      order.OrderItems.map((orderItem, idx) => (
                        <div className="order-card-item" key={idx}>
                          <span>🍽️ {orderItem.MenuItem?.name || "Item"}</span>
                          <span>×{orderItem.qty}</span>
                          <span>
                            ₹
                            {(
                              Number(orderItem.priceEach || 0) * orderItem.qty
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-payment">
                      <span className="payment-method">
                        💳{" "}
                        {order.paymentMethod === "cash"
                          ? "Cash"
                          : order.paymentMethod || "Cash"}
                      </span>
                    </div>
                    <span className="order-total">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="order-card-actions">
                    <button
                      className="complete-btn"
                      onClick={() => handleUpdateStatus(order.id, "completed")}
                    >
                      ✅ Mark as Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffOrders;

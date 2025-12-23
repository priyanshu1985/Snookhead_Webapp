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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      const ordersList = Array.isArray(data) ? data : [];
      setOrders(ordersList);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <span className="staff-role-badge">Staff View</span>
        </div>
        <div className="staff-header-right">
          <div className="staff-user-info">
            <span className="staff-user-name">{user?.name || "Staff"}</span>
            <span className="staff-user-role">{user?.role || "Staff"}</span>
          </div>
          <button className="staff-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-main">
        <div className="staff-content">
          <div className="staff-title-row">
            <h5>Active Orders</h5>
            <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Orders List */}
          <div className="orders-list">
            {loading && orders.length === 0 ? (
              <p className="loading-text">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="empty-text">No active orders</p>
            ) : (
              orders.map((order, index) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <span className="order-index">{index + 1}.</span>
                    <div className="order-info">
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                      <span className="order-customer">
                        {order.personName || "Customer"}
                      </span>
                    </div>
                    <span className={`order-status ${order.status || "pending"}`}>
                      {order.status || "Pending"}
                    </span>
                  </div>
                  <div className="order-card-items">
                    {order.cart &&
                      order.cart.map((cartItem, idx) => (
                        <div className="order-card-item" key={idx}>
                          <span>{cartItem.item?.name || "Item"}</span>
                          <span>x{cartItem.qty}</span>
                          <span>
                            ₹
                            {(Number(cartItem.item?.price || 0) * cartItem.qty).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="order-card-footer">
                    <div className="order-payment">
                      <span className="payment-method">
                        {order.paymentMethod || "Cash"}
                      </span>
                    </div>
                    <span className="order-total">
                      ₹{Number(order.orderTotal || 0).toFixed(2)}
                    </span>
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

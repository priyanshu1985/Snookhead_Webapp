import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../../services/api";
import { 
  OrdersIcon, 
  TableIcon, 
  CounterIcon, 
  RefreshIcon, 
  SearchIcon, 
  CheckIcon, 
  CloseIcon 
} from "../../components/common/Icons";
import "../../styles/foodOrder.css";
import "../../styles/staffOrders.css";

const StaffOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exitingOrders, setExitingOrders] = useState([]);

  // Source filter options matching the screenshot
  const sourceFilters = [
    { key: "all", label: "All Orders", Icon: OrdersIcon },
    { key: "table_booking", label: "Table", Icon: TableIcon },
    { key: "counter", label: "Counter", Icon: CounterIcon },
    { key: "zomato", label: "Zomato", Icon: null },
    { key: "swiggy", label: "Swiggy", Icon: null },
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      const ordersList = response?.data || (Array.isArray(response) ? response : []);
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
    if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;

    // Trigger animation if completing
    if (newStatus === "completed") {
        setExitingOrders(prev => [...prev, orderId]);
        
        // Wait for animation to finish (e.g. 500ms)
        setTimeout(async () => {
            try {
                await ordersAPI.updateStatus(orderId, newStatus);
                // Refresh list
                fetchOrders();
                // Remove from exiting list
                setExitingOrders(prev => prev.filter(id => id !== orderId));
            } catch (err) {
                console.error("Failed to update order status:", err);
                alert("Failed to update order status: " + (err.message || "Unknown error"));
                setExitingOrders(prev => prev.filter(id => id !== orderId));
            }
        }, 500);
        return;
    }

    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status: " + (err.message || "Unknown error"));
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const filteredOrders = sourceFilter === "all"
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
      table_booking: "Table",
      counter: "Counter",
      zomato: "Zomato",
      swiggy: "Swiggy",
      queue: "Queue",
      reservation: "Reservation",
      active_session: "Active Table"
    };
    return sourceMap[source] || source;
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
          <h4 className="staff-brand">SNOKHEAD</h4>
          <span className="staff-role-badge">Staff Portal</span>
        </div>
        <div className="staff-header-right">
          <div className="staff-user-info">
            <span className="staff-user-name">{user?.name || "Staff Member"}</span>
            <span className="staff-user-role">{user?.role || "Staff"}</span>
          </div>
          <button className="staff-logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-main">
        <div className="staff-content" style={{ padding: '0', background: 'transparent', boxShadow: 'none', border: 'none' }}>
          
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Source Filter Tabs - Copied style from FoodOrder */}
          <div className="source-filter-tabs">
            {sourceFilters.map((filter) => {
              const FilterIcon = filter.Icon;
              return (
                <button
                  key={filter.key}
                  className={`source-chip ${sourceFilter === filter.key ? "active" : ""}`}
                  onClick={() => setSourceFilter(filter.key)}
                >
                  <span className="source-icon">
                    {FilterIcon ? <FilterIcon size={16} color={sourceFilter === filter.key ? "#fff" : "#F08626"} /> : null}
                  </span>
                  <span>{filter.label}</span>
                  <span className="source-count">{getSourceCount(filter.key)}</span>
                </button>
              );
            })}
            <button
              className="refresh-btn"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshIcon size={16} color="#F08626" /> Refresh
            </button>
          </div>

          {/* Orders Table - Replicating Active Orders Screen */}
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Order Type</th>
                  <th>Customer Name</th>
                  <th>Payment</th>
                  <th>Grand Total (₹)</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                      <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                      <p>Loading orders...</p>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                      <OrdersIcon size={48} color="#ccc" />
                      <p style={{ marginTop: "10px", color: "#666" }}>No active orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                     const total = Number(order.total || 0);
                                          return (
                      <tr 
                        key={order.id} 
                        className={exitingOrders.includes(order.id) ? "slide-out-right" : ""}
                        style={exitingOrders.includes(order.id) ? { pointerEvents: "none" } : {}}
                      >
                        <td>
                          <span className="table-order-no">#{index + 1}</span>
                        </td>
                        <td>
                          <div className="table-order-source">
                            <span className="source-main">{getSourceLabel(order.order_source || "Counter")}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-customer-name">
                            {order.personName || "Walk-in Customer"}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: "#3d4152", textTransform: "capitalize" }}>
                            {order.paymentMethod === "offline" ? "Cash" : order.paymentMethod === "online" ? "UPI" : order.paymentMethod || "Cash"}
                          </span>
                        </td>
                        <td>
                            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>
                              {total.toFixed(2)}
                            </span>
                        </td>
                        <td>
                          <div className="table-date-time">
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#3d4152" }}>
                              {new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </td>
                        <td>
                           <div className="table-actions">
                               <button 
                                  className="action-btn" 
                                  title="View Details"
                                  onClick={() => setSelectedOrder(order)} // Logic to view details can be added
                               >
                                  <SearchIcon size={18} />
                               </button>
                               <button 
                                  className="action-btn complete-icon" 
                                  onClick={() => handleUpdateStatus(order.id, "completed")}
                                  title="Mark Completed"
                                  disabled={exitingOrders.includes(order.id)}
                               >
                                  {/* Use currentColor (remove explicit color prop) to let CSS control it */}
                                  <CheckIcon size={18} /> 
                               </button>
                               <button 
                                  className="action-btn cancel-icon"
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                  title="Cancel Order"
                               >
                                  <CloseIcon size={18} color="#FF5252" />
                               </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default StaffOrders;

import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, ordersAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/foodOrder.css";

const categories = [
  { key: "all", label: "All Items" },
  { key: "prepared", label: "Prepared Food" },
  { key: "packed", label: "Packed Foods" },
  { key: "cigarette", label: "Cigarette" },
  { key: "Beverages", label: "Beverages" },
  { key: "Food", label: "Food" },
  { key: "Fast Food", label: "Fast Food" },
  { key: "Snacks", label: "Snacks" },
  { key: "Desserts", label: "Desserts" },
];

// Source filter options for orders
const sourceFilters = [
  { key: "all", label: "All" },
  { key: "table_booking", label: "Table Booking" },
  { key: "counter", label: "Counter/Screen" },
  { key: "zomato", label: "Zomato" },
  { key: "swiggy", label: "Swiggy" },
];

const FoodOrder = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // Tab state
  const [activeTab, setActiveTab] = useState("menu");

  // Menu items state
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // Active orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [personName, setPersonName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);
        setMenuItems(items);
        setError("");
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
        setError(err.message || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  // Fetch orders when switching to orders tab
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getAll();
      // Backend returns { total, currentPage, data: orders }
      const ordersList = response?.data || (Array.isArray(response) ? response : []);
      setOrders(ordersList);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB") + " " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      // Refresh orders list after status update
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status: " + (err.message || "Unknown error"));
    }
  };

  // Filter orders by status (pending) and source
  const pendingOrders = orders.filter(o => o.status === "pending");
  const filteredOrders = sourceFilter === "all"
    ? pendingOrders
    : pendingOrders.filter(o => o.order_source === sourceFilter);

  // Count orders by source
  const getSourceCount = (source) => {
    if (source === "all") return pendingOrders.length;
    return pendingOrders.filter(o => o.order_source === source).length;
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

  // Filter items by category
  const filteredItems = activeCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addItem = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, type) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, qty: type === "inc" ? item.qty + 1 : item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // Open payment modal
  const handleProceedToPay = () => {
    if (cart.length === 0) {
      alert("Please add items to cart first");
      return;
    }
    setShowPaymentModal(true);
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!personName.trim()) {
      alert("Please enter customer name");
      return;
    }

    // Validate payment amounts for hybrid
    if (paymentMethod === "hybrid") {
      const cashAmt = Number(cashAmount) || 0;
      const onlineAmt = Number(onlineAmount) || 0;
      if (Math.abs((cashAmt + onlineAmt) - total) > 0.01) {
        alert("Cash + Online amount must equal total");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const orderPayload = {
        personName: personName.trim(),
        orderTotal: total,
        paymentMethod,
        cashAmount: paymentMethod === "offline" ? total : (paymentMethod === "hybrid" ? Number(cashAmount) : 0),
        onlineAmount: paymentMethod === "online" ? total : (paymentMethod === "hybrid" ? Number(onlineAmount) : 0),
        order_source: "counter", // Orders from this screen are counter orders
        cart: cart.map(item => ({
          item: { id: item.id, name: item.name, price: item.price },
          qty: item.qty
        }))
      };

      await ordersAPI.create(orderPayload);

      // Success - reset everything
      setCart([]);
      setShowPaymentModal(false);
      setPersonName("");
      setPaymentMethod("offline");
      setCashAmount("");
      setOnlineAmount("");
      alert("Order placed successfully!");

    } catch (err) {
      console.error("Order submission failed:", err);
      setError(err.message || "Failed to place order");
      alert("Failed to place order: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="food-page">
          <h5 className="mb-3">Food & Order</h5>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Main Tabs */}
          <div className="food-tabs">
            <button
              className={activeTab === "menu" ? "active" : ""}
              onClick={() => setActiveTab("menu")}
            >
              MENU ITEMS
            </button>
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              ACTIVE ORDERS ({pendingOrders.length})
            </button>
          </div>

          {/* MENU TAB CONTENT */}
          {activeTab === "menu" && (
            <>
              {/* Category Tabs */}
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    className={`category-tab ${activeCategory === cat.key ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="food-layout">
                {/* FOOD LIST */}
                <div className="food-list">
                  {loading ? (
                    <p className="loading-text">Loading menu items...</p>
                  ) : filteredItems.length === 0 ? (
                    <p className="empty-text">No items available in this category</p>
                  ) : (
                    filteredItems.map((item) => (
                      <div className="food-card" key={item.id}>
                        <h6>{item.name}</h6>
                        <p className="item-category">{item.category}</p>
                        <p className="item-price">₹ {item.price}</p>
                        <button onClick={() => addItem(item)}>Add</button>
                      </div>
                    ))
                  )}
                </div>

                {/* ORDER SUMMARY */}
                <div className="order-summary">
                  <h6>Order Summary</h6>

                  {cart.length === 0 && <p className="empty">No items added</p>}

                  {cart.map((item) => (
                    <div className="order-item" key={item.id}>
                      <span>{item.name}</span>
                      <div className="qty">
                        <button onClick={() => updateQty(item.id, "dec")}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, "inc")}>+</button>
                      </div>
                      <span className="item-total">₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="price-box">
                    <div>
                      <span>Subtotal</span>
                      <span>₹ {subtotal.toFixed(2)}</span>
                    </div>
                    <div>
                      <span>Tax (5%)</span>
                      <span>₹ {tax.toFixed(2)}</span>
                    </div>
                    <div className="total">
                      <strong>Total</strong>
                      <strong>₹ {total.toFixed(2)}</strong>
                    </div>
                  </div>

                  <button
                    className="pay-btn"
                    onClick={handleProceedToPay}
                    disabled={cart.length === 0}
                  >
                    Proceed to Pay
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB CONTENT */}
          {activeTab === "orders" && (
            <>
              {/* Source Filter Tabs */}
              <div className="source-filter-tabs">
                {sourceFilters.map((filter) => (
                  <button
                    key={filter.key}
                    className={`source-tab ${sourceFilter === filter.key ? "active" : ""}`}
                    onClick={() => setSourceFilter(filter.key)}
                  >
                    {filter.label}
                    <span className="source-count">{getSourceCount(filter.key)}</span>
                  </button>
                ))}
                <button
                  className="refresh-btn"
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                >
                  {ordersLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* Orders List */}
              <div className="orders-list">
                {ordersLoading && orders.length === 0 ? (
                  <p className="loading-text">Loading orders...</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="empty-text">
                    {sourceFilter === "all"
                      ? "No active orders"
                      : `No active orders from ${sourceFilters.find(f => f.key === sourceFilter)?.label}`}
                  </p>
                ) : (
                  filteredOrders.map((order, index) => (
                    <div className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <span className="order-index">{index + 1}.</span>
                        <div className="order-info">
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                          <span className="order-customer">{order.personName || "Customer"}</span>
                        </div>
                        <div className="order-badges">
                          {order.order_source && (
                            <span className={`source-badge ${getSourceClass(order.order_source)}`}>
                              {getSourceLabel(order.order_source)}
                            </span>
                          )}
                          <span className={`order-status ${order.status || "pending"}`}>
                            {order.status || "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="order-card-items">
                        {order.OrderItems && order.OrderItems.map((orderItem, idx) => (
                          <div className="order-card-item" key={idx}>
                            <span>{orderItem.MenuItem?.name || "Item"}</span>
                            <span>x{orderItem.qty}</span>
                            <span>₹{(Number(orderItem.priceEach || 0) * orderItem.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <div className="order-payment">
                          <span className="payment-method">{order.paymentMethod || "Cash"}</span>
                        </div>
                        <span className="order-total">₹{Number(order.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="order-card-actions">
                        <button
                          className="complete-btn"
                          onClick={() => handleUpdateStatus(order.id, "completed")}
                        >
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h5>Complete Payment</h5>
              <button
                className="close-btn"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <div className="payment-modal-body">
              {/* Customer Name */}
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={submitting}
                >
                  <option value="offline">Cash</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Cash + Online</option>
                </select>
              </div>

              {/* Hybrid Payment Amounts */}
              {paymentMethod === "hybrid" && (
                <>
                  <div className="form-group">
                    <label>Cash Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>Online Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={onlineAmount}
                      onChange={(e) => setOnlineAmount(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </>
              )}

              {/* Order Total */}
              <div className="payment-total">
                <strong>Total to Pay:</strong>
                <strong>₹ {total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodOrder;

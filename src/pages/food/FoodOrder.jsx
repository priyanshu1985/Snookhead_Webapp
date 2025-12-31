import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, ordersAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import {
  PlateIcon,
  FoodIcon,
  FastFoodIcon,
  SnacksIcon,
  BeveragesIcon,
  DessertsIcon,
  PreparedFoodIcon,
  PackedFoodIcon,
  CigaretteIcon,
  OrdersIcon,
  TableIcon,
  CounterIcon,
  SearchIcon,
  CartIcon,
  PlusIcon,
  MinusIcon,
  CloseIcon,
  RefreshIcon,
  CheckIcon,
  CashIcon,
  OnlinePayIcon,
  SplitPayIcon,
} from "../../components/common/Icons";
import "../../styles/foodOrder.css";

const categories = [
  { key: "all", label: "All", Icon: PlateIcon },
  { key: "Food", label: "Food", Icon: FoodIcon },
  { key: "Fast Food", label: "Fast Food", Icon: FastFoodIcon },
  { key: "Snacks", label: "Snacks", Icon: SnacksIcon },
  { key: "Beverages", label: "Beverages", Icon: BeveragesIcon },
  { key: "Desserts", label: "Desserts", Icon: DessertsIcon },
  { key: "prepared", label: "Prepared", Icon: PreparedFoodIcon },
  { key: "packed", label: "Packed", Icon: PackedFoodIcon },
  { key: "cigarette", label: "Cigarette", Icon: CigaretteIcon },
];

// Source filter options for orders
const sourceFilters = [
  { key: "all", label: "All Orders", Icon: OrdersIcon },
  { key: "table_booking", label: "Table", Icon: TableIcon },
  { key: "counter", label: "Counter", Icon: CounterIcon },
  { key: "zomato", label: "Zomato", Icon: null },
  { key: "swiggy", label: "Swiggy", Icon: null },
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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Cart drawer state (mobile)
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  // Filter items by category and search
  const filteredItems = menuItems
    .filter(item => activeCategory === "all" || item.category === activeCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Get item quantity in cart
  const getItemQty = (itemId) => {
    const cartItem = cart.find(c => c.id === itemId);
    return cartItem ? cartItem.qty : 0;
  };

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

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Open payment modal
  const handleProceedToPay = () => {
    if (cart.length === 0) {
      alert("Please add items to cart first");
      return;
    }
    setShowPaymentModal(true);
    setIsCartOpen(false);
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!personName.trim()) {
      alert("Please enter customer name");
      return;
    }

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
        order_source: "counter",
        cart: cart.map(item => ({
          item: { id: item.id, name: item.name, price: item.price },
          qty: item.qty
        }))
      };

      await ordersAPI.create(orderPayload);

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
          {/* Header */}
          <div className="food-header">
            <div className="food-header-left">
              <h4>Food & Order</h4>
              <p className="food-subtitle">Order delicious food items</p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Main Tabs */}
          <div className="food-tabs">
            <button
              className={activeTab === "menu" ? "active" : ""}
              onClick={() => setActiveTab("menu")}
            >
              <span className="tab-icon"><FoodIcon size={18} color={activeTab === "menu" ? "#fff" : "#F08626"} /></span>
              Menu
            </button>
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <span className="tab-icon"><OrdersIcon size={18} color={activeTab === "orders" ? "#fff" : "#F08626"} /></span>
              Active Orders
              {pendingOrders.length > 0 && (
                <span className="tab-badge">{pendingOrders.length}</span>
              )}
            </button>
          </div>

          {/* MENU TAB CONTENT */}
          {activeTab === "menu" && (
            <>
              {/* Search Bar */}
              <div className="food-search-container">
                <div className="food-search-box">
                  <span className="search-icon"><SearchIcon size={20} color="#93959f" /></span>
                  <input
                    type="text"
                    placeholder="Search for food items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery("")}>
                      <CloseIcon size={12} color="#666" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Scroll */}
              <div className="category-scroll">
                {categories.map((cat) => {
                  const IconComponent = cat.Icon;
                  return (
                    <button
                      key={cat.key}
                      className={`category-chip ${activeCategory === cat.key ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat.key)}
                    >
                      <span className="category-icon">
                        <IconComponent size={24} color={activeCategory === cat.key ? "#fff" : "#F08626"} />
                      </span>
                      <span className="category-label">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="food-layout">
                {/* FOOD GRID */}
                <div className="food-grid">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading menu items...</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon"><PlateIcon size={64} color="#ccc" /></span>
                      <p>{searchQuery ? `No items found for "${searchQuery}"` : "No items in this category"}</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const qty = getItemQty(item.id);
                      return (
                        <div className="food-item-card" key={item.id}>
                          {/* Food Image Placeholder */}
                          <div className="food-item-image">
                            <div className="food-placeholder-img">
                              <PlateIcon size={40} color="#ccc" />
                            </div>
                            {/* Veg/Non-Veg Indicator */}
                            <span className={`food-type-badge ${item.isVeg !== false ? 'veg' : 'non-veg'}`}>
                              <span className="food-type-dot"></span>
                            </span>
                          </div>

                          {/* Food Details */}
                          <div className="food-item-details">
                            <h6 className="food-item-name">{item.name}</h6>
                            <p className="food-item-category">{item.category}</p>
                            <div className="food-item-footer">
                              <span className="food-item-price">₹{item.price}</span>

                              {qty === 0 ? (
                                <button className="add-to-cart-btn" onClick={() => addItem(item)}>
                                  ADD
                                  <span className="plus-icon"><PlusIcon size={12} color="#fff" /></span>
                                </button>
                              ) : (
                                <div className="qty-controls">
                                  <button onClick={() => updateQty(item.id, "dec")}><MinusIcon size={16} color="#F08626" /></button>
                                  <span>{qty}</span>
                                  <button onClick={() => updateQty(item.id, "inc")}><PlusIcon size={16} color="#F08626" /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ORDER CART - Desktop */}
                <div className="order-cart desktop-cart">
                  <div className="cart-header">
                    <h6>
                      <span className="cart-icon"><CartIcon size={20} color="#F08626" /></span>
                      Your Order
                    </h6>
                    {cart.length > 0 && (
                      <button className="clear-cart-btn" onClick={clearCart}>
                        Clear All
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <span className="empty-cart-icon"><CartIcon size={56} color="#ccc" /></span>
                      <p>Your cart is empty</p>
                      <span className="empty-cart-hint">Add items to get started</span>
                    </div>
                  ) : (
                    <>
                      <div className="cart-items">
                        {cart.map((item) => (
                          <div className="cart-item" key={item.id}>
                            <div className="cart-item-info">
                              <span className="cart-item-name">{item.name}</span>
                              <span className="cart-item-price">₹{item.price} each</span>
                            </div>
                            <div className="cart-item-actions">
                              <div className="qty-controls small">
                                <button onClick={() => updateQty(item.id, "dec")}><MinusIcon size={14} color="#F08626" /></button>
                                <span>{item.qty}</span>
                                <button onClick={() => updateQty(item.id, "inc")}><PlusIcon size={14} color="#F08626" /></button>
                              </div>
                              <span className="cart-item-total">₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary">
                        <div className="summary-row">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Tax (5%)</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                          <strong>Total</strong>
                          <strong>₹{total.toFixed(2)}</strong>
                        </div>
                      </div>

                      <button className="checkout-btn" onClick={handleProceedToPay}>
                        Proceed to Checkout
                        <span className="checkout-amount">₹{total.toFixed(2)}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Floating Cart Button - Mobile */}
              {cart.length > 0 && (
                <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
                  <span className="cart-badge">{totalItems}</span>
                  <span className="cart-text">View Cart</span>
                  <span className="cart-total">₹{total.toFixed(2)}</span>
                </button>
              )}

              {/* Cart Drawer - Mobile */}
              {isCartOpen && (
                <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
                  <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                    <div className="cart-drawer-header">
                      <h6>Your Order ({totalItems} items)</h6>
                      <button className="close-drawer" onClick={() => setIsCartOpen(false)}><CloseIcon size={18} color="#666" /></button>
                    </div>

                    <div className="cart-drawer-items">
                      {cart.map((item) => (
                        <div className="cart-drawer-item" key={item.id}>
                          <div className="drawer-item-info">
                            <span className="drawer-item-name">{item.name}</span>
                            <span className="drawer-item-price">₹{item.price}</span>
                          </div>
                          <div className="drawer-item-actions">
                            <div className="qty-controls">
                              <button onClick={() => updateQty(item.id, "dec")}><MinusIcon size={16} color="#F08626" /></button>
                              <span>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, "inc")}><PlusIcon size={16} color="#F08626" /></button>
                            </div>
                            <span className="drawer-item-total">₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-drawer-footer">
                      <div className="drawer-summary">
                        <div className="drawer-summary-row">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="drawer-summary-row">
                          <span>Tax (5%)</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="drawer-summary-row total">
                          <strong>Total</strong>
                          <strong>₹{total.toFixed(2)}</strong>
                        </div>
                      </div>
                      <button className="drawer-checkout-btn" onClick={handleProceedToPay}>
                        Proceed to Checkout • ₹{total.toFixed(2)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ORDERS TAB CONTENT */}
          {activeTab === "orders" && (
            <>
              {/* Source Filter Tabs */}
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
                  disabled={ordersLoading}
                >
                  <RefreshIcon size={16} color="#F08626" /> Refresh
                </button>
              </div>

              {/* Orders Grid */}
              <div className="orders-grid">
                {ordersLoading && orders.length === 0 ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon"><OrdersIcon size={64} color="#ccc" /></span>
                    <p>No active orders</p>
                    <span className="empty-hint">
                      {sourceFilter !== "all" && "Try selecting 'All Orders'"}
                    </span>
                  </div>
                ) : (
                  filteredOrders.map((order, index) => (
                    <div className="order-card-new" key={order.id}>
                      <div className="order-card-top">
                        <div className="order-number">#{index + 1}</div>
                        <div className="order-meta">
                          <span className="order-time">{formatDate(order.createdAt)}</span>
                          <span className="order-customer-name">{order.personName || "Customer"}</span>
                        </div>
                        <div className="order-tags">
                          {order.order_source && (
                            <span className={`order-source-tag ${getSourceClass(order.order_source)}`}>
                              {getSourceLabel(order.order_source)}
                            </span>
                          )}
                          <span className={`order-status-tag ${order.status || "pending"}`}>
                            {order.status || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="order-card-items-list">
                        {order.OrderItems && order.OrderItems.map((orderItem, idx) => (
                          <div className="order-item-row" key={idx}>
                            <span className="order-item-qty">{orderItem.qty}x</span>
                            <span className="order-item-name">{orderItem.MenuItem?.name || "Item"}</span>
                            <span className="order-item-price">₹{(Number(orderItem.priceEach || 0) * orderItem.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-bottom">
                        <div className="order-payment-info">
                          <span className="payment-badge">{order.paymentMethod || "Cash"}</span>
                        </div>
                        <div className="order-amount">₹{Number(order.total || 0).toFixed(2)}</div>
                      </div>

                      <button
                        className="complete-order-btn"
                        onClick={() => handleUpdateStatus(order.id, "completed")}
                      >
                        <CheckIcon size={16} color="#fff" /> Mark as Completed
                      </button>
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
        <div className="food-payment-overlay">
          <div className="food-payment-modal">
            <div className="payment-modal-header">
              <h5>Complete Order</h5>
              <button
                className="close-btn"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                <CloseIcon size={18} color="#666" />
              </button>
            </div>

            <div className="payment-modal-body">
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

              <div className="form-group">
                <label>Payment Method *</label>
                <div className="payment-method-options">
                  <button
                    className={`payment-option ${paymentMethod === "offline" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("offline")}
                    disabled={submitting}
                  >
                    <CashIcon size={18} color={paymentMethod === "offline" ? "#F08626" : "#666"} /> Cash
                  </button>
                  <button
                    className={`payment-option ${paymentMethod === "online" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("online")}
                    disabled={submitting}
                  >
                    <OnlinePayIcon size={18} color={paymentMethod === "online" ? "#F08626" : "#666"} /> Online
                  </button>
                  <button
                    className={`payment-option ${paymentMethod === "hybrid" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("hybrid")}
                    disabled={submitting}
                  >
                    <SplitPayIcon size={18} color={paymentMethod === "hybrid" ? "#F08626" : "#666"} /> Split
                  </button>
                </div>
              </div>

              {paymentMethod === "hybrid" && (
                <div className="split-payment">
                  <div className="form-group half">
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
                  <div className="form-group half">
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
                </div>
              )}

              <div className="order-summary-mini">
                <div className="summary-line">
                  <span>Items ({totalItems})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-line total">
                  <strong>Grand Total</strong>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>
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
                {submitting ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodOrder;

import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, ordersAPI, walletsAPI, IMAGE_BASE_URL } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
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
  WalletIcon,
} from "../../components/common/Icons";
import "../../styles/foodOrder.css";

const categories = [
  { key: "all", label: "All", Icon: PlateIcon },
  { key: "prepared", label: "Prepared Food", Icon: PreparedFoodIcon },
  { key: "packed", label: "Packed Food", Icon: PackedFoodIcon },
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
  
  // NEW: Type state
  const [activeType, setActiveType] = useState("prepared"); // 'prepared' | 'packed'
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Active orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null); // For popup details

  // Compute filtered categories based on Active Type
  const computedCategories = menuItems
    .filter(item => (item.item_type || 'prepared') === activeType)
    .reduce((acc, item) => {
      // Skip if no category
      if (!item.category) return acc;

      const exists = acc.some(cat => cat.key === item.category);
      if (!exists) {
          // Use local categories config if available (for icons)
          const defaultCat = categories.find(c => c.key === item.category);
          if (defaultCat) {
               acc.push(defaultCat);
          } else {
               acc.push({
                  key: item.category,
                  label: item.category,
                  Icon: PlateIcon
               });
          }
      }
      return acc;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  // Ensure active category is valid when type changes
  useEffect(() => {
    if (computedCategories.length > 0) {
        // Default to first category
        setActiveCategory(computedCategories[0].key);
    } else {
        setActiveCategory("");
    }
  }, [activeType, menuItems]); // Re-run when type changes or items load

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [personName, setPersonName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel"
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "alert",
      onConfirm: null,
      confirmText: "OK"
    });
  };

  const showConfirm = (title, message, onConfirm, confirmText = "Confirm", type = "confirm", isHtml = false) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText: "Cancel",
      isHtml
    });
  };

  // Wallet specific state
  const [memberId, setMemberId] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [memberChecked, setMemberChecked] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");

  const handleCheckMember = async () => {
    if (!memberId.trim()) {
      setWalletError("Please enter a Member ID");
      return;
    }
    setWalletLoading(true);
    setWalletError("");
    try {
      const walletData = await walletsAPI.getByCustomerId(memberId);
      setWalletBalance(Number(walletData.balance || 0));
      setMemberChecked(true);
    } catch (err) {
      setWalletError("Member not found or no wallet exists");
      setWalletBalance(null);
      setMemberChecked(false);
    } finally {
      setWalletLoading(false);
    }
  };

  // Cart drawer state (mobile)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);
        
        // Sanitize image URLs
        const processedItems = items.map(item => {
          if (item.imageUrl && item.imageUrl.includes('localhost:4000')) {
             const cleanUrl = item.imageUrl.replace(/https?:\/\/localhost:4000/g, IMAGE_BASE_URL);
             return { ...item, imageUrl: cleanUrl };
          }
          return item;
        });

        setMenuItems(processedItems);
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
    .filter(item => activeCategory && item.category === activeCategory)
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
  const total = subtotal;
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

      if (paymentMethod === "wallet") {
        if (!memberChecked || walletBalance === null) {
           alert("Please verify member ID first");
           setSubmitting(false);
           return;
        }
        if (walletBalance < total) {
           alert(`Insufficient wallet balance. Available: ₹${Number(walletBalance).toFixed(2)}`);
           setSubmitting(false);
           return;
        }
        // Deduct from wallet before creating order
        await walletsAPI.deductMoney(memberId, total);
      }

      const orderPayload = {
        personName: personName.trim() || undefined, // Allow empty for default "Walk-in"
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
      setCashAmount("");
      setOnlineAmount("");
      showAlert("Success", "Order placed successfully!");

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
              <h4 style={{ fontSize: '20px' }}>Food & Order</h4>
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
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '0 20px' }}>
                  <button 
                     onClick={() => setActiveType('prepared')}
                     style={{
                         flex: 1,
                         padding: '12px',
                         borderRadius: '12px',
                         background: activeType === 'prepared' ? '#F08626' : '#fff',
                         color: activeType === 'prepared' ? '#fff' : '#333',
                         border: activeType === 'prepared' ? 'none' : '1px solid #ddd',
                         fontWeight: 'bold',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         gap: '10px',
                         boxShadow: activeType === 'prepared' ? '0 4px 10px rgba(240, 134, 38, 0.3)' : 'none',
                         transition: 'all 0.2s'
                     }}
                  >
                      <PreparedFoodIcon size={20} /> Prepared Food
                  </button>
                  <button 
                     onClick={() => setActiveType('packed')}
                     style={{
                         flex: 1,
                         padding: '12px',
                         borderRadius: '12px',
                         background: activeType === 'packed' ? '#F08626' : '#fff',
                         color: activeType === 'packed' ? '#fff' : '#333',
                         border: activeType === 'packed' ? 'none' : '1px solid #ddd',
                         fontWeight: 'bold',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         gap: '10px',
                         boxShadow: activeType === 'packed' ? '0 4px 10px rgba(240, 134, 38, 0.3)' : 'none',
                         transition: 'all 0.2s'
                     }}
                  >
                      <PackedFoodIcon size={20} /> Packed Food
                  </button>
              </div>

              <div className="food-layout-split" style={{ display: 'flex', gap: '20px', padding: '0 20px', height: 'calc(100vh - 230px)' }}> 
                
                {/* LEFT SIDE: Search + Category Sidebar + Grid */}
                <div className="food-left-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* Search Bar */}
                    <div className="food-search-container" style={{ marginBottom: '15px' }}>
                        <div className="food-search-box" style={{ maxWidth: '400px', width: '100%' }}>
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

                    {/* Content Area (Sidebar + Grid) */}
                    <div className="food-layout" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                        {/* Vertical Category Sidebar */}
                        <div className="food-sidebar-categories" style={{ 
                            width: '110px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px',
                            overflowY: 'auto',
                            paddingRight: '5px',
                            flexShrink: 0
                        }}>
                            {computedCategories.map((cat) => {
                                const IconComponent = cat.Icon;
                                const isActive = activeCategory === cat.key;
                                return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(cat.key)}
                                    style={{
                                        padding: '10px 5px',
                                        borderRadius: '12px',
                                        background: isActive ? '#F08626' : '#fff',
                                        border: isActive ? 'none' : '1px solid #f0f0f0',
                                        color: isActive ? '#fff' : '#4b5563',
                                        display: 'flex',
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        width: '100%',
                                        boxShadow: isActive ? '0 3px 8px rgba(240, 134, 38, 0.3)' : '0 2px 5px rgba(0,0,0,0.03)',
                                        minHeight: '90px'
                                    }}
                                >
                                    <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isActive ? 'rgba(255,255,255,0.2)' : '#FFF3E0',
                                        color: isActive ? '#fff' : '#F08626',
                                        marginBottom: '2px'
                                    }}>
                                    <IconComponent size={20} />
                                    </span>
                                    <span style={{ 
                                        fontSize: '12px',
                                        fontWeight: isActive ? '700' : '600',
                                        textAlign: 'center',
                                        lineHeight: '1.2',
                                        wordBreak: 'break-word'
                                    }}>{cat.label}</span>
                                </button>
                                );
                            })}
                            {computedCategories.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '11px' }}>
                                    Empty
                                </div>
                            )}
                        </div>

                        {/* FOOD GRID */}
                        <div className="food-grid" style={{ overflowY: 'auto', padding: '5px', flex: 1 }}>
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
                                            {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                                            />
                                            ) : null}
                                            <div className="food-placeholder-img" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
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
                                                <button 
                                                className="add-to-cart-btn" 
                                                onClick={() => showConfirm(
                                                    `Add ${item.name}?`,
                                                    `Are you sure you want to add <strong>${item.name}</strong> to the cart?`,
                                                    () => addItem(item),
                                                    "Yes, Add",
                                                    "confirm",
                                                    true
                                                )}
                                                >
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
                    </div>
                </div>

                {/* RIGHT SIDE: ORDER CART */}
                <div className="order-cart desktop-cart" style={{ width: '380px', flexShrink: 0, maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
                    {ordersLoading && orders.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                          <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                          <p>Loading orders...</p>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                          <OrdersIcon size={48} color="#ccc" />
                          <p style={{ marginTop: "10px", color: "#666" }}>No active orders found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, index) => {
                         const total = Number(order.total || 0);
                         
                         return (
                          <tr key={order.id}>
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
                                      onClick={() => setSelectedOrder(order)}
                                   >
                                      <SearchIcon size={18} />
                                   </button>
                                   <button 
                                      className="action-btn complete-icon" 
                                      onClick={() => handleUpdateStatus(order.id, "completed")}
                                      title="Mark Completed"
                                   >
                                      <CheckIcon size={18} color="#fff" />
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
            </>
          )}
        </div>
      </div>

      {/* Order Details Popup */}
      {selectedOrder && (
        <div className="food-payment-overlay">
          <div className="food-payment-modal" style={{ maxWidth: "600px" }}>
            <div className="payment-modal-header" style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "16px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                 <h5 style={{ margin: 0, color: "#1a1a2e", fontSize: "18px" }}>Order Details</h5>
                 <span style={{ fontSize: "13px", color: "#888" }}>#{selectedOrder.id ? selectedOrder.id.toString().slice(-6) : "Unknown"} • {selectedOrder.personName}</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
                style={{ background: "#f5f5f5", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
            
            <div className="payment-modal-body" style={{ padding: "0" }}>
               <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0 24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <th style={{ textAlign: "left", padding: "12px 0", fontSize: "12px", color: "#888", textTransform: "uppercase" }}>Item</th>
                        <th style={{ textAlign: "center", padding: "12px 0", fontSize: "12px", color: "#888", textTransform: "uppercase" }}>Qty</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontSize: "12px", color: "#888", textTransform: "uppercase" }}>Price</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontSize: "12px", color: "#888", textTransform: "uppercase" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const items = selectedOrder.OrderItems || selectedOrder.orderitems || [];
                        return items.length > 0 ? (
                          items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px dashed #eee" }}>
                              <td style={{ padding: "12px 0", fontSize: "14px", fontWeight: "600", color: "#3d4152" }}>
                                {item.MenuItem?.name || item.menu_item?.name || "Unknown Item"}
                              </td>
                              <td style={{ padding: "12px 0", textAlign: "center", fontSize: "14px", color: "#3d4152" }}>
                                {item.qty}
                              </td>
                              <td style={{ padding: "12px 0", textAlign: "right", fontSize: "14px", color: "#3d4152" }}>
                                ₹{Number(item.priceEach || item.price_each || 0).toFixed(2)}
                              </td>
                              <td style={{ padding: "12px 0", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                                ₹{(Number(item.priceEach || item.price_each || 0) * (item.qty || 1)).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No items found</td></tr>
                        );
                      })()}
                    </tbody>
                    <tfoot>
                       <tr>
                          <td colSpan="3" style={{ textAlign: "right", padding: "16px 0", fontWeight: "700" }}>Total Amount:</td>
                          <td style={{ textAlign: "right", padding: "16px 0", fontWeight: "700", fontSize: "16px", color: "#F08626" }}>
                             ₹{Number(selectedOrder.total || 0).toFixed(2)}
                          </td>
                       </tr>
                    </tfoot>
                  </table>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (Existing) */}
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
                <label>Customer Name</label>
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
                <div className="payment-method-options" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
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
                    <OnlinePayIcon size={18} color={paymentMethod === "online" ? "#F08626" : "#666"} /> UPI
                  </button>
                  <button
                    className={`payment-option ${paymentMethod === "wallet" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("wallet")}
                    disabled={submitting}
                  >
                    <WalletIcon size={18} color={paymentMethod === "wallet" ? "#F08626" : "#666"} /> Wallet
                  </button>
                </div>
              </div>

              {/* Wallet Section */}
              {paymentMethod === "wallet" && (
                <div style={{ marginTop: "16px", padding: "16px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="text"
                      value={memberId}
                      onChange={(e) => {
                        setMemberId(e.target.value);
                        setMemberChecked(false);
                        setWalletError("");
                      }}
                      placeholder="Enter Member ID"
                      disabled={submitting}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}
                    />
                    <button
                      onClick={handleCheckMember}
                      disabled={submitting || walletLoading}
                      style={{ 
                        padding: "8px 16px", 
                        background: "#F08626", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontWeight: "600",
                        opacity: walletLoading ? 0.7 : 1
                      }}
                    >
                      {walletLoading ? "..." : "Check"}
                    </button>
                  </div>

                  {walletError && <div style={{ color: "#DC2626", fontSize: "13px", marginTop: "4px" }}>{walletError}</div>}

                  {memberChecked && walletBalance !== null && (
                    <div style={{ 
                      marginTop: "12px", 
                      padding: "12px", 
                      background: walletBalance >= total ? "#ECFDF5" : "#FEF2F2", 
                      borderRadius: "6px", 
                      border: `1px solid ${walletBalance >= total ? "#10B981" : "#EF4444"}` 
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", color: "#666" }}>Wallet Balance:</span>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937" }}>₹{Number(walletBalance).toFixed(2)}</span>
                      </div>
                      {walletBalance < total && (
                        <div style={{ color: "#DC2626", fontSize: "12px", fontWeight: "600" }}>Insufficient balance</div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
      
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        isHtml={modalConfig.isHtml}
      />
    </div>
  );
};

export default FoodOrder;

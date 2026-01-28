import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import TableBookedModal from "../../components/tables/TableBookedModel";
import { menuAPI, activeTablesAPI, tablesAPI, IMAGE_BASE_URL } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import FoodCategoryTabs from "../../components/common/FoodCategoryTabs";

import "../../styles/tableBooking.css";


const TableBooking = () => {
  const { game, tableId } = useParams();
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // Time selection
  const [timeMode, setTimeMode] = useState("timer"); // timer, set, frame
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [setTimeValue, setSetTimeValue] = useState("");
  const [frameCount, setFrameCount] = useState(1);

  // Food selection
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Table info
  const [tableInfo, setTableInfo] = useState(null);

  // Booking state
  const [showSuccess, setShowSuccess] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);
        
        // Sanitize image URLs: Replace localhost:4000 with current backend URL
        const processedItems = items.map(item => {
          if (item.imageUrl && item.imageUrl.includes('localhost:4000')) {
             // Replace both http and https variants just in case
             const cleanUrl = item.imageUrl.replace(/https?:\/\/localhost:4000/g, IMAGE_BASE_URL);
             return { ...item, imageUrl: cleanUrl };
          }
          return item;
        });

        setMenuItems(processedItems);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // Fetch table info
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const data = await tablesAPI.getById(tableId);
        setTableInfo(data);
      } catch (err) {
        console.error("Failed to fetch table:", err);
      }
    };
    if (tableId) fetchTable();
  }, [tableId]);

  // Filter menu
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Calculate duration in minutes
  // For "set" mode (stopwatch), duration is 0 - timer will count UP
  const getDurationMinutes = () => {
    if (timeMode === "timer") return timerMinutes;
    if (timeMode === "frame") return frameCount * 15; // Approx 15 mins per frame
    if (timeMode === "set") return 0; // Stopwatch mode - no preset duration, will count up
    return 0;
  };

  // Check if booking is valid based on mode
  const isBookingValid = () => {
    if (timeMode === "timer") return timerMinutes > 0;
    if (timeMode === "frame") return frameCount > 0;
    if (timeMode === "set") return true; // Stopwatch mode is always valid - no duration needed
    return false;
  };

  // Add item to cart
  const addToCart = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Update cart quantity
  const updateCartQty = (id, delta) => {
    setCart(
      cart
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  // Handle booking
  const handleBook = async () => {
    // Customer Name is Optional - will default to "Walk-in Customer" if empty

    // Validate booking based on mode
    if (!isBookingValid()) {
      setError("Please set a valid time");
      return;
    }

    const duration = getDurationMinutes();
    const finalCustomerName = customerName.trim() || "Walk-in Customer";

    try {
      setBooking(true);
      setError("");

      // Start active table session with duration and booking type
      await activeTablesAPI.start({
        table_id: tableId,
        game_id: tableInfo?.gameid || tableInfo?.game_id,
        duration_minutes: duration,
        customer_name: finalCustomerName,
        booking_type: timeMode, // 'timer' = countdown, 'set' = stopwatch (count up), 'frame' = frame-based
        frame_count: timeMode === "frame" ? frameCount : null, // Send frame count for frame mode
        cart: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
      });

      // Show Success Modal - let the modal handle navigation on close
      setShowSuccess(true);
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Failed to book table");
      setBooking(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  // Image error handling
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (id) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
      <div className="dashboard-main">
        <Navbar />

        <div className="table-booking-page">
          {/* Header */}
          <div className="booking-header">
            <button className="back-btn" onClick={() => navigate(-1)}>←</button>
            <h5>{game || "Game"}</h5>
            <span className="table-code">{tableInfo?.name || `Table ${tableId}`}</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Main Content - Two Column Layout for Laptop */}
          <div className="booking-content">
            {/* Left Column - Time Selection */}
            <div className="booking-left-column">
              <div className="booking-panel">
                
                {/* Section 1: Customer Details */}
                <div className="panel-section">
                  <label className="panel-label">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-control compact-input"
                  />
                </div>

                {/* Section 2: Mode Selection */}
                <div className="panel-section">
                   <div className="radio-row">
                    <label className={timeMode === "timer" ? "active" : ""}>
                      <input
                        type="radio"
                        name="time"
                        value="timer"
                        checked={timeMode === "timer"}
                        onChange={(e) => setTimeMode(e.target.value)}
                      />
                      Timer
                    </label>

                    <label className={timeMode === "set" ? "active" : ""}>
                      <input
                        type="radio"
                        name="time"
                        value="set"
                        checked={timeMode === "set"}
                        onChange={(e) => setTimeMode(e.target.value)}
                      />
                      Stopwatch
                    </label>

                    <label className={timeMode === "frame" ? "active" : ""}>
                      <input
                        type="radio"
                        name="time"
                        value="frame"
                        checked={timeMode === "frame"}
                        onChange={(e) => setTimeMode(e.target.value)}
                      />
                      Frames
                    </label>
                  </div>
                </div>

                {/* Section 3: Variable Input (Controls) */}
                <div className="panel-section highlight-section">
                  {timeMode === "timer" && (
                    <div className="timer-input-compact">
                      <div className="timer-controls">
                        <button onClick={() => setTimerMinutes(Math.max(5, timerMinutes - 5))}>-</button>
                        <input
                          type="number"
                          value={timerMinutes}
                          onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                          min="1"
                        />
                        <button onClick={() => setTimerMinutes(timerMinutes + 5)}>+</button>
                        <span className="unit-label">mins</span>
                      </div>
                      <div className="quick-times">
                        {[30, 60, 90, 120].map((mins) => (
                          <button
                            key={mins}
                            className={timerMinutes === mins ? "active" : ""}
                            onClick={() => setTimerMinutes(mins)}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {timeMode === "set" && (
                    <div className="info-message">
                      <span>⏱ Stopwatch Mode</span>
                      <small>Billing typically starts after booking.</small>
                    </div>
                  )}

                  {timeMode === "frame" && (
                    <div className="frame-input-compact">
                      <div className="frame-controls">
                        <button onClick={() => setFrameCount(Math.max(1, frameCount - 1))}>-</button>
                        <span>{frameCount}</span>
                        <button onClick={() => setFrameCount(frameCount + 1)}>+</button>
                        <span className="unit-label">Frames</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Bill / Pricing */}
                <div className="panel-section bill-section">
                  {tableInfo && (
                    <div className="bill-details">
                      {/* Price Rate Line */}
                      <div className="bill-row">
                        <span>Rate</span>
                        <span>
                          {timeMode === "frame" 
                            ? `₹${tableInfo.frameCharge || 0}/frame` 
                            : `₹${tableInfo.pricePerMin || 0}/min`}
                        </span>
                      </div>

                      {/* Estimated Cost Line */}
                      {timeMode !== "set" && (
                         <div className="bill-row highlight">
                           <span>{timeMode === "frame" ? "Frame Cost" : "Time Cost"}</span>
                           <span>
                             {timeMode === "frame" 
                               ? `₹${(frameCount * (tableInfo.frameCharge || 0)).toFixed(2)}`
                               : `₹${(getDurationMinutes() * (tableInfo.pricePerMin || 0)).toFixed(2)}`
                             }
                           </span>
                         </div>
                      )}

                      {/* Food Items List */}
                      {cart.length > 0 && (
                        <div className="bill-food-list">
                          <label>Food Items</label>
                          {cart.map((item) => (
                            <div className="bill-food-row" key={item.id}>
                              <span className="name">{item.name}</span>
                              <span className="qty">{item.qty} x</span>
                              <span className="price">₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Total Divider */}
                      <div className="panel-divider"></div>

                      {/* Grand Total */}
                      <div className="bill-total-row">
                        <span>Total to Pay</span>
                         {timeMode === "set" ? (
                            <span>₹{cartTotal.toFixed(2)} + Time</span>
                          ) : (
                            <span>
                              ₹{((timeMode === "frame" 
                                  ? (frameCount * (tableInfo.frameCharge || 0)) 
                                  : (getDurationMinutes() * (tableInfo.pricePerMin || 0))
                                ) + cartTotal).toFixed(2)
                              }
                            </span>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="book-btn-unified" onClick={handleBook} disabled={booking}>
                    {booking ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column - Food Selection */}
            <div className="booking-right-column">
              {/* Category Tabs */}
              <FoodCategoryTabs 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />

              <div className="menu-header">
                <h6>Food & Drinks</h6>
                {/* Search Bar */}
                <div className="food-search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery("")}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="menu-items-grid">
                {loadingMenu ? (
                  <p className="loading-text">Loading menu...</p>
                ) : filteredMenu.length === 0 ? (
                  <p className="empty-text">{searchQuery ? `No items found for "${searchQuery}"` : "No food items available"}</p>
                ) : (
                  filteredMenu.map((item) => {
                    const cartItem = cart.find(c => c.id === item.id);
                    const quantity = cartItem ? cartItem.qty : 0;
                    const hasValidImage = item.imageUrl && item.imageUrl.trim() !== "" && !failedImages.has(item.id);

                    return (
                      <div className="menu-item-card" key={item.id}>
                        {/* LEFT: Info */}
                        <div className="menu-item-info">
                          <div className={item.isVeg === false ? "non-veg-icon" : "veg-icon"}></div>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">₹{item.price}</span>
                          <p className="item-description">{item.description || "Delicious food item"}</p>
                        </div>

                        {/* RIGHT: Image + Floating Action */}
                        <div className="menu-item-image-container">
                          {item.imageUrl ? (
                             <img 
                               src={item.imageUrl} 
                               alt={item.name} 
                               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                             />
                          ) : null}
                          <div className="placeholder-img" style={{
                            height: '100%', 
                            borderRadius: '12px', 
                            display: item.imageUrl ? 'none' : 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: '#f8f8f8', 
                            fontSize: '32px'
                          }}>🍽</div>

                          {/* Floating Button Overlap */}
                          <div className="add-btn-container">
                             {quantity > 0 ? (
                               <div className="qty-controls-floating">
                                 <button onClick={() => updateCartQty(item.id, -1)}>-</button>
                                 <span>{quantity}</span>
                                 <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                               </div>
                             ) : (
                               <button className="add-btn" onClick={() => addToCart(item)}>
                                 ADD
                               </button>
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
        </div>

        {/* SUCCESS MODAL */}
        {showSuccess && <TableBookedModal onClose={handleSuccessClose} />}
      </div>
    </div>
  );
};

export default TableBooking;

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import TableBookedModal from "../../components/tables/TableBookedModel";
import { menuAPI, activeTablesAPI, tablesAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";

import "../../styles/tableBooking.css";

const categories = [
  { key: "Food", label: "Food", icon: "🥗" },
  { key: "packed", label: "Pack Food", icon: "🍟" },
  { key: "Beverages", label: "Beverages", icon: "🥤" },
];

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
  const [activeCategory, setActiveCategory] = useState("Food");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Table info
  const [tableInfo, setTableInfo] = useState(null);

  // Booking state
  const [showSuccess, setShowSuccess] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);
        setMenuItems(items);
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
        console.error("Failed to fetch table info:", err);
      }
    };
    if (tableId) fetchTable();
  }, [tableId]);

  // Filter menu by category
  const filteredMenu = menuItems.filter((item) => item.category === activeCategory);

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

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  // Get duration in minutes based on mode
  const getDurationMinutes = () => {
    switch (timeMode) {
      case "timer":
        return timerMinutes;
      case "set":
        // Parse time like "1:30" to minutes
        if (setTimeValue) {
          const [hours, mins] = setTimeValue.split(":").map(Number);
          return (hours || 0) * 60 + (mins || 0);
        }
        return 0;
      case "frame":
        // Assume 15 minutes per frame
        return frameCount * 15;
      default:
        return 0;
    }
  };

  // Handle booking
  const handleBook = async () => {
    const duration = getDurationMinutes();
    if (duration <= 0) {
      setError("Please set a valid time");
      return;
    }

    try {
      setBooking(true);
      setError("");

      // Start active table session with duration
      const response = await activeTablesAPI.start({
        table_id: tableId,
        game_id: tableInfo?.game_id,
        duration_minutes: duration,
        cart: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
      });

      // Store session info for navigation
      const newSession = response?.session;
      setShowSuccess(true);

      // Navigate to active session after short delay with session data
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/session/${game}/${tableId}/${newSession?.active_id || ""}`, {
          state: { session: newSession }
        });
      }, 1500);
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Failed to book table");
    } finally {
      setBooking(false);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/session/${game}/${tableId}`);
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

          {/* Time Selection */}
          <p className="section-title">Select Time</p>
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
              Set Time
            </label>

            <label className={timeMode === "frame" ? "active" : ""}>
              <input
                type="radio"
                name="time"
                value="frame"
                checked={timeMode === "frame"}
                onChange={(e) => setTimeMode(e.target.value)}
              />
              Select Frame
            </label>
          </div>

          {/* Time Input based on mode */}
          <div className="time-input-section">
            {timeMode === "timer" && (
              <div className="timer-input">
                <label>Duration (minutes)</label>
                <div className="timer-controls">
                  <button onClick={() => setTimerMinutes(Math.max(5, timerMinutes - 5))}>-</button>
                  <input
                    type="number"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                    min="1"
                  />
                  <button onClick={() => setTimerMinutes(timerMinutes + 5)}>+</button>
                </div>
                <div className="quick-times">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      className={timerMinutes === mins ? "active" : ""}
                      onClick={() => setTimerMinutes(mins)}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {timeMode === "set" && (
              <div className="set-time-input">
                <label>Set End Time</label>
                <input
                  type="time"
                  value={setTimeValue}
                  onChange={(e) => setSetTimeValue(e.target.value)}
                />
              </div>
            )}

            {timeMode === "frame" && (
              <div className="frame-input">
                <label>Number of Frames</label>
                <div className="frame-controls">
                  <button onClick={() => setFrameCount(Math.max(1, frameCount - 1))}>-</button>
                  <span>{frameCount}</span>
                  <button onClick={() => setFrameCount(frameCount + 1)}>+</button>
                </div>
                <small>~{frameCount * 15} minutes</small>
              </div>
            )}
          </div>

          {/* Food Categories */}
          <p className="section-title">Add Food</p>
          <div className="food-categories">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className={`food-box ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <span className="food-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          <div className="menu-items-grid">
            {loadingMenu ? (
              <p className="loading-text">Loading menu...</p>
            ) : filteredMenu.length === 0 ? (
              <p className="empty-text">No items in this category</p>
            ) : (
              filteredMenu.map((item) => (
                <div className="menu-item-card" key={item.id}>
                  <div className="menu-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">₹{item.price}</span>
                  </div>
                  <button className="add-btn" onClick={() => addToCart(item)}>
                    ADD
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="cart-summary">
              <h6>Selected Items ({cart.length})</h6>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span className="cart-item-name">{item.name}</span>
                  <div className="cart-item-controls">
                    <button onClick={() => updateCartQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                  </div>
                  <span className="cart-item-price">₹{Number(item.price) * item.qty}</span>
                </div>
              ))}
              <div className="cart-total">
                <strong>Food Total:</strong>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {/* Pricing Info */}
          {tableInfo && (
            <div className="pricing-info">
              <div>
                <span>Price per minute:</span>
                <span>₹{tableInfo.pricePerMin || 0}</span>
              </div>
              {tableInfo.frameCharge > 0 && (
                <div>
                  <span>Frame charge:</span>
                  <span>₹{tableInfo.frameCharge}</span>
                </div>
              )}
              <div className="estimate">
                <span>Est. Table Cost ({getDurationMinutes()} mins):</span>
                <span>₹{(getDurationMinutes() * (tableInfo.pricePerMin || 0)).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="booking-actions">
            <button className="book-btn" onClick={handleBook} disabled={booking}>
              {booking ? "Booking..." : "Book Table"}
            </button>
          </div>
        </div>

        {/* SUCCESS MODAL */}
        {showSuccess && <TableBookedModal onClose={handleSuccessClose} />}
      </div>
    </div>
  );
};

export default TableBooking;

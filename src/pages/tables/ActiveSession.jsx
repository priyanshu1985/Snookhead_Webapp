import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, activeTablesAPI, tablesAPI, billingAPI } from "../../services/api";

import "../../styles/activeSession.css";

const categories = [
  { key: "Food", label: "Food", icon: "🥗" },
  { key: "packed", label: "Pack Food", icon: "🍟" },
  { key: "Beverages", label: "Beverages", icon: "🥤" },
];

const ActiveSession = () => {
  const { game, tableId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedSession = location.state?.session;

  // Session state
  const [session, setSession] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Timer state - countdown mode
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const timerRef = useRef(null);
  const hasAutoReleased = useRef(false);

  // Food selection
  const [activeCategory, setActiveCategory] = useState("Food");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Action states
  const [generating, setGenerating] = useState(false);

  // Auto-release handler
  const handleAutoRelease = async (sessionToRelease) => {
    if (!sessionToRelease || hasAutoReleased.current) return;

    hasAutoReleased.current = true;

    try {
      await activeTablesAPI.autoRelease({ active_id: sessionToRelease.active_id });
    } catch (err) {
      console.error("Auto-release failed:", err);
    } finally {
      navigate("/dashboard");
    }
  };

  // Initialize session from passed state or fetch from API
  useEffect(() => {
    const initializeSession = (sessionData) => {
      console.log("Session data received:", sessionData);
      setSession(sessionData);

      const startTime = new Date(sessionData.start_time);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));

      // Check if session has booking_end_time or duration_minutes (countdown mode)
      const hasDuration = sessionData.booking_end_time || sessionData.duration_minutes;
      console.log("Has duration:", hasDuration, "booking_end_time:", sessionData.booking_end_time, "duration_minutes:", sessionData.duration_minutes);

      if (hasDuration) {
        setIsTimerMode(true);

        let remaining;
        if (sessionData.booking_end_time) {
          // Calculate from booking_end_time
          const endTime = new Date(sessionData.booking_end_time);
          remaining = Math.floor((endTime - now) / 1000);
          console.log("Calculated remaining from booking_end_time:", remaining);
        } else if (sessionData.duration_minutes) {
          // Calculate from duration_minutes
          const totalDurationSeconds = sessionData.duration_minutes * 60;
          remaining = totalDurationSeconds - elapsed;
          console.log("Calculated remaining from duration_minutes:", remaining);
        } else {
          remaining = 0;
        }

        if (remaining <= 0) {
          setRemainingSeconds(0);
          handleAutoRelease(sessionData);
        } else {
          setRemainingSeconds(remaining);
          console.log("Set remainingSeconds to:", remaining);
        }
      } else {
        console.log("No duration found, using elapsed time mode");
      }
    };

    const fetchSession = async () => {
      try {
        setLoading(true);

        // If session was passed via navigation state, use it directly
        if (passedSession) {
          initializeSession(passedSession);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const sessions = await activeTablesAPI.getAll();

        // Find session by tableId (string comparison) or sessionId
        const currentSession = sessions.find((s) => {
          const matchByTableId = String(s.table_id) === String(tableId);
          const matchBySessionId = sessionId && s.active_id === Number(sessionId);
          return matchByTableId || matchBySessionId;
        });

        if (currentSession) {
          initializeSession(currentSession);
        } else {
          setError("Session not found");
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setError(err.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, sessionId, passedSession]);

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

  // Timer effect - handles both countdown and elapsed time
  useEffect(() => {
    if (!isPaused && session && !hasAutoReleased.current) {
      timerRef.current = setInterval(() => {
        // Update elapsed time
        setElapsedSeconds((prev) => prev + 1);

        // Update countdown if in timer mode
        if (isTimerMode) {
          setRemainingSeconds((prev) => {
            if (prev === null || prev <= 0) return 0;

            const newValue = prev - 1;

            // Auto-release when timer hits zero
            if (newValue <= 0) {
              clearInterval(timerRef.current);
              handleAutoRelease(session);
              return 0;
            }
            return newValue;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, session, isTimerMode]);

  // Format time display (HH:MM:SS)
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds < 0) return "00:00:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format countdown display (MM:SS)
  const formatCountdown = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds < 0) return "00:00";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (!isTimerMode || remainingSeconds === null) return "";
    if (remainingSeconds <= 60) return "timer-critical";
    if (remainingSeconds <= 300) return "timer-warning";
    return "";
  };

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

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const elapsedMinutes = Math.ceil(elapsedSeconds / 60);
  const tableCost = elapsedMinutes * (tableInfo?.pricePerMin || 0);
  const grandTotal = tableCost + cartTotal;

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle update (add more items to order)
  const handleUpdate = async () => {
    alert("Items added to order!");
    setCart([]);
  };

  // Handle generate bill
  const handleGenerateBill = async () => {
    if (!session) return;

    try {
      setGenerating(true);
      setError("");

      // Stop the session
      await activeTablesAPI.stop({ active_id: session.active_id });

      // Create bill
      await billingAPI.create({
        customer_name: "Walk-in Customer",
        table_id: tableId,
        session_id: session.active_id,
        session_duration: elapsedMinutes,
        table_price_per_min: tableInfo?.pricePerMin || 0,
        frame_charges: tableInfo?.frameCharge || 0,
        selected_menu_items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
      });

      navigate("/billing");
    } catch (err) {
      console.error("Failed to generate bill:", err);
      setError(err.message || "Failed to generate bill");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-main">
          <Navbar />
          <div className="active-session-page">
            <p className="loading-text">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="active-session-page">
          {/* Header */}
          <div className="session-header">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>←</button>
            <h5>{game || "Snooker"}</h5>
            <span className="table-code">{tableInfo?.name || `Table ${tableId}`}</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Timer Section */}
          <div className="timer-section">
            {isTimerMode ? (
              <>
                {/* Countdown Timer Display */}
                <p className="timer-label">Time Remaining</p>
                <div className={`timer-display countdown ${getTimerColor()}`}>
                  {formatCountdown(remainingSeconds)}
                </div>
                {remainingSeconds !== null && remainingSeconds <= 300 && remainingSeconds > 0 && (
                  <p className="timer-warning-text">
                    {remainingSeconds <= 60 ? "Session ending soon!" : "Less than 5 minutes remaining"}
                  </p>
                )}
                <p className="elapsed-time">Elapsed: {formatTime(elapsedSeconds)}</p>
              </>
            ) : (
              <>
                {/* Elapsed Time Display (no booking end time) */}
                <p className="timer-label">Total Time Span</p>
                <div className="timer-display">{formatTime(elapsedSeconds)}</div>
              </>
            )}

            <p className="timer-hint">
              {isPaused ? "⏸ Session paused" : "● Session active"}
            </p>

            {/* Controls */}
            <div className="timer-controls">
              <button className={`control-btn pause ${isPaused ? "active" : ""}`} onClick={togglePause}>
                <span className="icon">{isPaused ? "▶" : "⏸"}</span>
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
              <button className="control-btn switch">
                <span className="icon">🔄</span>
                <span>Switch</span>
              </button>
            </div>
          </div>

          {/* Food Categories */}
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
          <div className="menu-items-list">
            {loadingMenu ? (
              <p className="loading-text">Loading menu...</p>
            ) : filteredMenu.length === 0 ? (
              <p className="empty-text">No items in this category</p>
            ) : (
              filteredMenu.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div className="menu-item-row" key={item.id}>
                    <div className="item-image">
                      <div className="placeholder-img">🍽</div>
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">{inCart ? `${inCart.qty} qty` : "0 qty"}</span>
                    </div>
                    <div className="item-actions">
                      <button className="add-btn" onClick={() => addToCart(item)}>
                        ADD
                      </button>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="order-summary">
              <h6>Order Items</h6>
              {cart.map((item) => (
                <div className="order-item" key={item.id}>
                  <span>{item.name}</span>
                  <div className="qty-controls">
                    <button onClick={() => updateCartQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                  </div>
                  <span>₹{Number(item.price) * item.qty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Summary */}
          <div className="pricing-summary">
            <div className="price-row">
              <span>Table Time ({elapsedMinutes} mins)</span>
              <span>₹{tableCost.toFixed(2)}</span>
            </div>
            {cartTotal > 0 && (
              <div className="price-row">
                <span>Food & Beverages</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="price-row total">
              <strong>Total</strong>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="session-actions">
            <button className="update-btn" onClick={handleUpdate} disabled={cart.length === 0}>
              Update
            </button>
            <button className="generate-bill-btn" onClick={handleGenerateBill} disabled={generating}>
              {generating ? "Generating..." : "Generate Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;

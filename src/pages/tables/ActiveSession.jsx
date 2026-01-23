import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, activeTablesAPI, tablesAPI, billingAPI, ordersAPI, IMAGE_BASE_URL } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import FoodCategoryTabs from "../../components/common/FoodCategoryTabs";

import "../../styles/activeSession.css";


const ActiveSession = () => {
  const { game, tableId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedSession = location.state?.session;
  const initialCart = location.state?.initialCart || []; // Cart items from booking
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // Session state
  const [session, setSession] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Timer state - countdown mode
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false); // true = countdown timer (auto-release)
  const [isStopwatchMode, setIsStopwatchMode] = useState(false); // true = count up stopwatch (manual release)
  const [isFrameMode, setIsFrameMode] = useState(false); // true = frame-based billing (manual release)
  const timerRef = useRef(null);
  const hasAutoReleased = useRef(false);

  // Food selection
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(initialCart); // Initialize with items from booking
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const cartRef = useRef(initialCart); // Ref to access cart in timer callbacks

  // Action states
  const [generating, setGenerating] = useState(false);

  // Auto-release handler - generates bill when timer ends and releases table
  const handleAutoRelease = async (sessionToRelease, cartItems = []) => {
    console.log("handleAutoRelease triggered", { sessionToRelease, hasReleased: hasAutoReleased.current });
    
    if (!sessionToRelease || hasAutoReleased.current) return;

    hasAutoReleased.current = true;

    try {
      console.log("Calling autoRelease API...");
      // Use auto-release endpoint which stops session, generates bill, and sets table to available
      // Pass cart items so they are included in the bill
      const response = await activeTablesAPI.autoRelease({
        active_id: sessionToRelease.active_id,
        cart_items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
      });
      console.log("Auto-release successful", response);

      // Navigate to billing page
      navigate("/billing");
    } catch (err) {
      console.error("Auto-release failed:", err);
      alert("Auto-release failed check console. Redirecting to billing anyway."); 
      // Still navigate to billing even if there's an error so user isn't stuck
      navigate("/billing");
    }
  };

  // Initialize session from passed state or fetch from API
  useEffect(() => {
    const initializeSession = (sessionData) => {
      // Normalize session data keys to handle both snake_case (frontend state) and lowercase (DB response)
      // The backend returns lowercase column names (starttime, bookingendtime, durationminutes)
      const data = {
        ...sessionData,
        active_id: sessionData.activeid || sessionData.active_id,
        table_id: sessionData.tableid || sessionData.table_id,
        game_id: sessionData.gameid || sessionData.game_id,
        start_time: sessionData.starttime || sessionData.start_time,
        booking_end_time: sessionData.bookingendtime || sessionData.booking_end_time,
        duration_minutes: sessionData.durationminutes || sessionData.duration_minutes,
        booking_type: sessionData.bookingtype || sessionData.booking_type || 'timer', // Default to timer for backward compatibility
        frame_count: sessionData.framecount || sessionData.frame_count || null, // Frame count for frame-based bookings
      };

      setSession(data);

      const startTime = new Date(data.start_time);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));

      // Check booking type to determine timer behavior
      // 'timer' = countdown mode (count DOWN, auto-release at 0)
      // 'set' = stopwatch mode (count UP, no auto-release, manual bill)
      // 'frame' = frame mode (count UP, no auto-release, manual bill, billing by frames)
      const bookingType = data.booking_type;

      if (bookingType === 'set') {
        // Stopwatch mode - just count up, no countdown, no auto-release
        setIsStopwatchMode(true);
        setIsTimerMode(false);
        setIsFrameMode(false);
        // No remaining seconds for stopwatch - it only counts up
      } else if (bookingType === 'frame') {
        // Frame mode - count up elapsed time, no countdown, no auto-release
        // Billing is based on frame count, not time
        setIsFrameMode(true);
        setIsStopwatchMode(false);
        setIsTimerMode(false);
        // No remaining seconds for frame mode - owner manually generates bill
      } else {
        // Timer mode - countdown with auto-release
        setIsStopwatchMode(false);
        setIsFrameMode(false);

        // Check if session has booking_end_time or duration_minutes (countdown mode)
        const hasDuration = data.booking_end_time || data.duration_minutes;

        if (hasDuration) {
          setIsTimerMode(true);

          let remaining;

          if (data.booking_end_time) {
            // Calculate from booking_end_time
            const endTime = new Date(data.booking_end_time);
            remaining = Math.floor((endTime - now) / 1000);
          } else if (data.duration_minutes) {
            // Calculate from duration_minutes
            const totalDurationSeconds = data.duration_minutes * 60;
            remaining = totalDurationSeconds - elapsed;
          } else {
            remaining = 0;
          }

          if (remaining <= 0) {
            setRemainingSeconds(0);
            handleAutoRelease(data);
          } else {
            setRemainingSeconds(remaining);
          }
        }
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
          const sTableId = s.tableid || s.table_id;
          const sActiveId = s.activeid || s.active_id;
          
          // CRITICAL FIX: If sessionId is provided in URL, ONLY match that specific session.
          // Otherwise, fall back to matching by tableId.
          if (sessionId) {
            return String(sActiveId) === String(sessionId);
          }
          return String(sTableId) === String(tableId);
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

  // Fetch linked order to restore cart if needed
  useEffect(() => {
    const fetchLinkedOrder = async () => {
      if (!session || !session.active_id) return;
      
      try {
        // Fetch order linked to this session
        // Using ORDERS API
        const response = await ordersAPI.getBySession(session.active_id);
        
        // If we have items in the order, and our local cart is effectively empty (or initial), merge them?
        // Actually, we should prioritise server items if it's a restore (page refresh).
        // But if user just booked, local cart might be same as server items.
        // Let's assume server is truth.
        if (response && response.consolidated_items && response.consolidated_items.length > 0) {
          const serverItems = response.consolidated_items.map(item => ({
             id: item.id,
             name: item.name,
             price: item.price,
             qty: item.quantity
          }));
          
          // Only update if we are seemingly starting fresh/empty or if items differ substantially
          // Optimization: If cart is empty, set it.
          // If cart has items, we might be double adding?
          // If this runs on mount/session-load, cart is likely just initialCart from nav state.
          // If nav state is present, use that?
          // If passedSession is missing (refresh), then nav state is undefined.
          
          // Strategy: Always prioritize server items as the source of truth.
          // This ensures that items booked in the previous step (saved to DB) appear correctly,
          // and also handles page refreshes.
          setCart(serverItems);
          
          // Populate savedItems map for delta calculation
          const savedMap = {};
          serverItems.forEach(item => {
              savedMap[item.id] = item.qty;
          });
          setSavedItems(savedMap);
        }
        
        // Store the order ID if available (usually the first one from consolidated response or we might need to fetch raw orders)
        // ordersAPI.getBySession returns { orders: [...] }
        if (response && response.orders && response.orders.length > 0) {
            // Use the first pending order as the active one to append to
            const pendingOrder = response.orders.find(o => o.status === 'pending');
            if (pendingOrder) {
                setActiveOrderId(pendingOrder.id);
            } else if (response.orders.length > 0) {
                // Should we append to a completed order? Probably not.
                // If all are completed, maybe we need a new order?
                // For now, assume a session has one main order.
                setActiveOrderId(response.orders[0].id);
            }
        }
      } catch (err) {
        console.error("Failed to fetch linked order:", err);
      }
    };
    
    if (session) {
        fetchLinkedOrder();
    }
  }, [session, passedSession]);

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

        // Sanitize image URLs
        const processedItems = items.map(item => {
          if (item.imageUrl && item.imageUrl.includes('localhost:4000')) {
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

  // Keep cartRef in sync with cart state for use in timer callbacks
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Timer effect - handles both countdown and elapsed time (stopwatch)
  useEffect(() => {
    if (!isPaused && session && !hasAutoReleased.current) {
      timerRef.current = setInterval(() => {
        // Update elapsed time (always counts up for both modes)
        setElapsedSeconds((prev) => prev + 1);

        // Update countdown if in timer mode (NOT stopwatch mode)
        // In stopwatch mode, we only count up - no countdown, no auto-release
        if (isTimerMode && !isStopwatchMode) {
          setRemainingSeconds((prev) => {
            // Safety check
            if (prev === null) return 0;
            
            // If already at 0, don't keep decrementing, just return 0
            if (prev <= 0) return 0;

            const newValue = prev - 1;

            // Auto-release when timer hits zero (only for countdown timer mode)
            if (newValue <= 0) {
              console.log("Timer hit zero, triggering auto-release");
              clearInterval(timerRef.current);
              handleAutoRelease(session, cartRef.current);
              return 0; // Set state to 0
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
  }, [isPaused, session, isTimerMode, isStopwatchMode]);

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

  // Filter menu by search query AND category
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

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

  // For timer mode, use the booked duration
  // For stopwatch mode, use elapsed time
  // For frame mode, billing is by frames (not time)
  const billingMinutes = (isTimerMode && session?.duration_minutes)
    ? session.duration_minutes
    : elapsedMinutes;

  // Calculate table cost based on mode
  // Frame mode: frameCount * frameCharge
  // Timer/Stopwatch mode: billingMinutes * pricePerMin
  const frameCount = session?.frame_count || 0;
  const tableCost = isFrameMode
    ? frameCount * (tableInfo?.frameCharge || 0)
    : billingMinutes * (tableInfo?.pricePerMin || 0);
  const grandTotal = tableCost + cartTotal;

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Track saved item quantities to calculate deltas
  const [savedItems, setSavedItems] = useState({});
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Handle update (confirm items added - sync to backend order)
  const handleUpdate = async () => {
    if (!activeOrderId) {
        alert("No active order found for this session. Please try refreshing.");
        return;
    }

    // Calculate items to add (delta between current cart and savedItems)
    const itemsToAdd = [];
    
    cart.forEach(item => {
        const savedQty = savedItems[item.id] || 0;
        const currentQty = item.qty;
        
        if (currentQty > savedQty) {
            const delta = currentQty - savedQty;
            itemsToAdd.push({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: delta
            });
        }
    });

    if (itemsToAdd.length === 0) {
        alert("No new items to update.");
        return;
    }

    try {
        setGenerating(true); // Reuse generating state for loading
        await ordersAPI.addItems(activeOrderId, itemsToAdd);
        
        // Update saved items reference
        const newSavedItems = { ...savedItems };
        itemsToAdd.forEach(item => {
            newSavedItems[item.id] = (newSavedItems[item.id] || 0) + item.qty;
        });
        setSavedItems(newSavedItems);
        
        alert("Order updated successfully!");
    } catch (err) {
        console.error("Failed to update order:", err);
        alert("Failed to update order. Please try again.");
    } finally {
        setGenerating(false);
    }
  };

  // Handle generate bill
  const handleGenerateBill = async () => {
    if (!session) return;

    try {
      setGenerating(true);
      setError("");

      // Create comprehensive bill with table charges + food items
      // For frame mode: use frame_count * frameCharge (no time-based billing)
      // For timer mode: use booked duration * pricePerMin
      // For stopwatch mode: use elapsed time * pricePerMin
      await billingAPI.create({
        customer_name: session.customer_name || "Walk-in Customer",
        table_id: tableId,
        session_id: session.active_id,
        // For frame mode, session_duration is 0 (billing is by frames, not time)
        session_duration: isFrameMode ? 0 : billingMinutes,
        table_price_per_min: isFrameMode ? 0 : (tableInfo?.pricePerMin || 0),
        // Frame charges: frameCount * frameCharge for frame mode, 0 for other modes
        frame_charges: isFrameMode ? (frameCount * (tableInfo?.frameCharge || 0)) : 0,
        frame_count: isFrameMode ? frameCount : null,
        booking_type: session.booking_type,
        selected_menu_items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
      });

      // Stop the session and release the table (skip_bill=true to avoid duplicate bill)
      await activeTablesAPI.stop({ active_id: session.active_id, skip_bill: true });

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
        <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
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

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

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

          {/* Main Content - Two Column Layout for Laptop */}
          <div className="session-content">
            {/* Left Column - Timer & Pricing */}
            <div className="session-left-column">
              {/* Timer Section */}
              <div className="timer-section">
                {isFrameMode ? (
                  <>
                    {/* Frame Mode - Show frame count */}
                    <p className="timer-label">Frame Mode</p>
                    <div className="timer-display frame-display">
                      {frameCount} Frame{frameCount !== 1 ? 's' : ''}
                    </div>
                    <p className="elapsed-time">Elapsed: {formatTime(elapsedSeconds)}</p>
                    <p className="stopwatch-hint">
                      Click "Generate Bill" when done
                    </p>
                  </>
                ) : isStopwatchMode ? (
                  <>
                    {/* Stopwatch Mode - Count UP */}
                    <p className="timer-label">Stopwatch Mode</p>
                    <div className="timer-display stopwatch">
                      {formatTime(elapsedSeconds)}
                    </div>
                    <p className="stopwatch-hint">
                      Click "Generate Bill" when done to calculate charges
                    </p>
                  </>
                ) : isTimerMode ? (
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

              {/* Pricing Summary - Desktop Only in Left Column */}
              <div className="pricing-summary desktop-pricing">
                <div className="price-row">
                  {isFrameMode ? (
                    <>
                      <span>Frame Charges ({frameCount} frame{frameCount !== 1 ? 's' : ''})</span>
                      <span>₹{tableCost.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <span>Table Time ({billingMinutes} mins{isStopwatchMode ? " - elapsed" : isTimerMode ? " - booked" : ""})</span>
                      <span>₹{tableCost.toFixed(2)}</span>
                    </>
                  )}
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

              {/* Action Buttons - Desktop Only in Left Column */}
              <div className="session-actions desktop-actions">
                <button className="update-btn" onClick={handleUpdate} disabled={cart.length === 0}>
                  Update
                </button>
                <button className="generate-bill-btn" onClick={handleGenerateBill} disabled={generating}>
                  {generating ? "Generating..." : "Generate Bill"}
                </button>
              </div>
            </div>

            {/* Right Column - Food Selection */}
            <div className="session-right-column">
              {/* Category Tabs */}
              <FoodCategoryTabs 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
              
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

              {/* Menu Items */}
              <div className="menu-items-list">
                {loadingMenu ? (
                  <p className="loading-text">Loading menu...</p>
                ) : filteredMenu.length === 0 ? (
                  <p className="empty-text">{searchQuery ? `No items found for "${searchQuery}"` : "No food items available"}</p>
                ) : (
                  filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    return (
                      <div className="menu-item-row" key={item.id}>
                        <div className="item-image">
                          {item.imageUrl ? (
                             <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                          ) : (
                             <div className="placeholder-img">🍽</div>
                          )}
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className={`item-qty ${inCart ? "has-qty" : ""}`}>
                            {inCart ? `${inCart.qty} in cart` : "Add to cart"}
                          </span>
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
            </div>
          </div>

          {/* Mobile Only - Pricing Summary */}
          <div className="pricing-summary mobile-pricing">
            <div className="price-row">
              {isFrameMode ? (
                <>
                  <span>Frame Charges ({frameCount} frame{frameCount !== 1 ? 's' : ''})</span>
                  <span>₹{tableCost.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <span>Table Time ({billingMinutes} mins{isStopwatchMode ? " - elapsed" : isTimerMode ? " - booked" : ""})</span>
                  <span>₹{tableCost.toFixed(2)}</span>
                </>
              )}
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

          {/* Mobile Only - Action Buttons */}
          <div className="session-actions mobile-actions">
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

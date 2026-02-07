import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, activeTablesAPI, tablesAPI, billingAPI, ordersAPI, reservationsAPI, IMAGE_BASE_URL } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import FoodCategoryTabs, { DEFAULT_CATEGORIES } from "../../components/common/FoodCategoryTabs";
import { PlateIcon, PreparedFoodIcon, PackedFoodIcon } from "../../components/common/Icons";
import ConfirmationModal from "../../components/common/ConfirmationModal";

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

  // Advance Payment State
  const [advancePayment, setAdvancePayment] = useState(0);
  const [reservationNotes, setReservationNotes] = useState("");

  // Timer state - countdown mode
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false); // true = countdown timer (auto-release)
  const [isStopwatchMode, setIsStopwatchMode] = useState(false); // true = count up stopwatch (manual release)
  const [isFrameMode, setIsFrameMode] = useState(false); // true = frame-based billing (manual release)
  const timerRef = useRef(null);
  const hasAutoReleased = useRef(false);
  const [shouldAutoBill, setShouldAutoBill] = useState(false);

  // Food selection
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(initialCart); // Initialize with items from booking
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const cartRef = useRef(initialCart); // Ref to access cart in timer callbacks

  // Keep cartRef in sync with cart state
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Main types (Tabs)
  const ITEM_TYPES = [
    { key: "prepared", label: "Prepared Food", icon: <PreparedFoodIcon size={20} /> },
    { key: "packed", label: "Packed Food", icon: <PackedFoodIcon size={20} /> },
  ];

  const [activeType, setActiveType] = useState("prepared"); // 'prepared' or 'packed'

  // Filter items by search query and active Type first
  const typeItems = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = (item.item_type || 'prepared') === activeType;
      return matchesSearch && matchesType;
  });

  // Compute Sub-categories from the filtered items (or all items if we want consistent internal tabs)
  // Here we compute based on available items for this type
  const computedCategories = typeItems.reduce((acc, item) => {
    // Skip if no category
    if (!item.category) return acc;
    
    // Check if category already added
    const exists = acc.some(cat => cat.id === item.category);
    if (!exists) {
        acc.push({
          id: item.category,
          label: item.category,
          // icon: <PlateIcon size={20} />
        });
    }
    return acc;
  }, []).sort((a, b) => a.label.localeCompare(b.label));

  // Ensure active selected category is valid for this type
  // "All" is always valid
  useEffect(() => {
    if (selectedCategory !== "All") {
        const catExists = computedCategories.some(c => c.id === selectedCategory);
        if (!catExists) setSelectedCategory("All");
    }
  }, [activeType, computedCategories]);


  // Action states
  const [generating, setGenerating] = useState(false);

  // Manual Time Add Modal State
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [manualTime, setManualTime] = useState(30);

  // Manual Frame Add Modal State
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [framesToAdd, setFramesToAdd] = useState(1);


  // Early Exit Modal State
  const [showEarlyExitModal, setShowEarlyExitModal] = useState(false);
  const [earlyExitData, setEarlyExitData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 1. Fetch Session Data
  useEffect(() => {
    const fetchSession = async () => {
       try {
         setLoading(true);
         setError("");

         // Check if passed via navigation state
         if (passedSession) {
             setSession(passedSession);
             if (passedSession.tableid) {
                 try {
                    const tData = await tablesAPI.getById(passedSession.tableid);
                    setTableInfo(tData);
                 } catch (e) { console.warn("Failed to fetch table info", e); }
             }
             setLoading(false);
             return;
         }

         // Fetch from API
         let foundSession = null;
         
         // Priority 1: Fetch by Session ID
         if (sessionId) {
              try {
                  foundSession = await activeTablesAPI.getById(sessionId);
              } catch (e) {
                  console.warn("Session ID lookup failed:", e);
              }
         }
         
         // Priority 2: Fetch by Table ID
         if (!foundSession && tableId) {
              const sessions = await activeTablesAPI.getAll({ tableid: tableId });
              foundSession = sessions.find(s => 
                  String(s.tableid) === String(tableId) && s.status === 'active'
              );
         }

         if (foundSession) {
             setSession(foundSession);
             // Load persisted cart if available and initialCart is empty
             if (foundSession.food_orders && (!initialCart || initialCart.length === 0)) {
                 try {
                    const savedCart = typeof foundSession.food_orders === 'string' 
                        ? JSON.parse(foundSession.food_orders) 
                        : foundSession.food_orders;
                    setCart(Array.isArray(savedCart) ? savedCart : []);
                 } catch (e) {
                    console.warn("Failed to parse saved food_orders", e);
                 }
             }
             if (foundSession.tableid) {
                 const tData = await tablesAPI.getById(foundSession.tableid);
                 setTableInfo(tData);
             }
         } else {
             setError("No active session found for this table.");
         }

       } catch (err) {
           console.error("Fetch session error:", err);
           setError(err.message || "Failed to load session");
       } finally {
           setLoading(false);
       }
    };

    fetchSession();
  }, [tableId, sessionId, passedSession]);

  // 2. Initialize Timer & Mode based on Session
  useEffect(() => {
      if (!session) return;

      const type = session.bookingtype || session.booking_type || 'timer'; // timer, set, frame
      setIsTimerMode(type === 'timer');
      setIsStopwatchMode(type === 'set');
      setIsFrameMode(type === 'frame');
      
      if (type === 'frame') {
          // Frame mode logic
          return; 
      }

      // Time calculation
      const calculateTime = () => {
          const now = new Date();
          const start = new Date(session.starttime); // start_time vs starttime? API uses starttime usually
          const allocatedMins = session.durationminutes || session.duration_minutes || 0;
          
          if (type === 'timer') {
              // Countdown
              const endTime = new Date(start.getTime() + allocatedMins * 60000);
              const diff = Math.floor((endTime - now) / 1000); // seconds
              setRemainingSeconds(Math.max(0, diff));
              
              const elapsed = Math.floor((now - start) / 1000);
              setElapsedSeconds(Math.max(0, elapsed));

              // Auto-release check
              if (diff <= 0 && !hasAutoReleased.current && !session.endtime) {
                  hasAutoReleased.current = true;
                  setShouldAutoBill(true);
              }
          } else {
              // Stopwatch (Set)
              const elapsed = Math.floor((now - start) / 1000);
              setElapsedSeconds(Math.max(0, elapsed));
          }
      };

      calculateTime(); // Initial call
      
      // Interval
      timerRef.current = setInterval(calculateTime, 1000);

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [session]);

  // Derived state for billing
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const billingMinutes = isFrameMode ? 
      0 : 
      (isTimerMode ? (session?.durationminutes || session?.duration_minutes || 0) : Math.ceil(elapsedSeconds / 60));
  
  const pricePerMin = Number(tableInfo?.pricePerMin ?? 0);
  const frameCharge = Number(tableInfo?.frameCharge ?? 0);
  const frameCount = session?.framecount || session?.frame_count || 0;

  const tableCost = isFrameMode ? (frameCount * frameCharge) : (billingMinutes * pricePerMin);
  
  // Calculate Cart Total
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  const grandTotal = tableCost + cartTotal;


  // Missing State for Images & Modals
  const [failedImages, setFailedImages] = useState(new Set());
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Yes",
    cancelText: "Cancel",
    type: "confirm",
    isHtml: false
  });

  // Derived filtered menu
  // Derived filtered menu (from typeItems)
  const filteredMenu = typeItems.filter(item => {
    if (selectedCategory === "All" || !selectedCategory) return true;
    return item.category === selectedCategory;
  });

  // --- Helper Functions ---

  const handleImageError = (id) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showConfirm = (title, message, onConfirm, confirmText = "Yes", type = "confirm", isHtml = false) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText: "Cancel",
      type,
      isHtml
    });
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds) => {
    if (seconds === null) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!remainingSeconds) return ""; // default
    if (remainingSeconds <= 60) return "timer-critical";
    if (remainingSeconds <= 300) return "timer-warning";
    return "timer-safe";
  };

  // --- Actions ---

  const togglePause = async () => {
      // Toggle pause state (local only for now, unless backend support added)
      setIsPaused(!isPaused);
  };

  const handleUpdate = async () => {
      if (!session) return;
      try {
          setGenerating(true);
          const sessionId = session.active_id || session.activeid;
          
          await activeTablesAPI.update(sessionId, { 
              food_orders: cart 
          });
          
          alert("Order saved successfully!");
      } catch (err) {
          console.error("Failed to save order:", err);
          alert("Failed to save order");
      } finally {
          setGenerating(false);
      }
  };


  // Fetch Menu
  useEffect(() => {
      const fetchMenu = async () => {
          try {
              setLoadingMenu(true);
              const data = await menuAPI.getAll();
              setMenuItems(data?.data || (Array.isArray(data) ? data : []));
          } catch (err) {
              console.error("Failed to load menu:", err);
          } finally {
              setLoadingMenu(false);
          }
      };
      fetchMenu();
  }, []); // Run once on mount

  // Cart Actions
  const addToCart = async (item) => {
      setCart(prev => {
          let newCart = [];
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
              newCart = prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
          } else {
              newCart = [...prev, { ...item, qty: 1 }];
          }

          // Persist immediately (fire and forget)
          if (session) {
             const sessionId = session.active_id || session.activeid;
             activeTablesAPI.update(sessionId, { food_orders: newCart }).catch(e => {
                 console.error("Failed to persist cart:", e);
             });
          }
          
          return newCart;
      });

      // TRIGGER KITCHEN ORDER
      if (session) {
        try {
             // We use a small timeout or just fire it
             const orderPayload = {
                 session_id: session.active_id || session.activeid,
                 table_id: session.tableid || session.table_id,
                 personName: session.customer_name || session.customername || "Table Customer",
                 order_source: 'active_session',
                 status: 'pending',
                 payment_status: 'pending',
                 total: Number(item.price),
                 items: [{
                     menu_item_id: item.id,
                     quantity: 1,
                     price: Number(item.price)
                 }]
             };
             ordersAPI.create(orderPayload).catch(e => console.error("Kitchen order trigger failed", e));
        } catch (err) {
            console.error("Order trigger error", err);
        }
    }
  };

  const updateCartQty = async (itemId, change) => {
      setCart(prev => {
          const newCart = prev.map(item => {
              if (item.id === itemId) {
                  const newQty = Math.max(0, item.qty + change);
                  return { ...item, qty: newQty };
              }
              return item;
          }).filter(item => item.qty > 0);

          // Persist immediately
          if (session) {
             const sessionId = session.active_id || session.activeid;
             activeTablesAPI.update(sessionId, { food_orders: newCart }).catch(e => {
                 console.error("Failed to persist cart quantity:", e);
             });
          }
          
          return newCart;
      });

      // TRIGGER KITCHEN ORDER (Only on Add)
      if (change > 0 && session) {
        try {
            const menuItem = menuItems.find(m => m.id === itemId);
            if (menuItem) {
                 const orderPayload = {
                     session_id: session.active_id || session.activeid,
                     table_id: session.tableid || session.table_id,
                     personName: session.customer_name || session.customername || "Table Customer",
                     order_source: 'active_session',
                     status: 'pending', 
                     payment_status: 'pending', 
                     total: Number(menuItem.price),
                     items: [{
                         menu_item_id: menuItem.id,
                         quantity: change,
                         price: Number(menuItem.price)
                     }]
                 };
                 ordersAPI.create(orderPayload).catch(e => console.error("Kitchen order trigger failed", e));
            }
        } catch (err) {
            console.error("Order trigger error", err);
        }
    }
  };

  const handleAddTimeSubmit = async () => {
      if (!session) return;
      try {
          setGenerating(true);
          const addedMinutes = Number(manualTime);
          
          // Current accumulated duration or specific duration update
          // Usually we update 'duration_minutes' in DB
          const newDuration = (session.duration_minutes || session.durationminutes || 0) + addedMinutes;
          
          const sessionId = session.active_id || session.activeid;
          await activeTablesAPI.update(sessionId, { 
              duration_minutes: newDuration 
          });
          
          // Update local state immediately for responsiveness
          setSession(prev => ({ 
              ...prev, 
              duration_minutes: newDuration,
              durationminutes: newDuration
          }));
          
          setShowTimeModal(false);
          alert(`Added ${addedMinutes} minutes to session.`);
      } catch (err) {
          console.error("Failed to add time:", err);
          alert("Failed to update session time.");
      } finally {
          setGenerating(false);
      }
  };

  const handleAddFramesSubmit = async () => {
      if (!session) return;
      try {
          setGenerating(true);
          const added = Number(framesToAdd);
          const newCount = (session.frame_count || session.framecount || 0) + added;
          
          const sessionId = session.active_id || session.activeid;
          await activeTablesAPI.update(sessionId, { 
              frame_count: newCount 
          });
          
          setSession(prev => ({ 
              ...prev, 
              frame_count: newCount,
              framecount: newCount
          }));
          
          setShowFrameModal(false);
      } catch (err) {
          console.error("Failed to add frames:", err);
          alert("Failed to update frames.");
      } finally {
          setGenerating(false);
      }
  };


  // Handle generate bill click (with confirmation and Early Exit logic)
  const handleGenerateBillClick = () => {
      // Check for Early Exit in Timer Mode (booked time > elapsed time + buffer)
      // Buffer of 1 minute to avoid minor timing differences
      const durationMins = session?.duration_minutes || session?.durationminutes || 0;
      const isEarlyExit = isTimerMode && session && (durationMins > elapsedMinutes + 1);

      if (isEarlyExit) {
          const bookedDuration = durationMins;
          const actualDuration = elapsedMinutes;
          
          // Calculate costs
          const bookedCost = bookedDuration * pricePerMin;
          const actualCost = actualDuration * pricePerMin;

          setEarlyExitData({
              bookedDuration,
              actualDuration,
              bookedCost,
              actualCost,
              pricePerMin
          });
          setShowEarlyExitModal(true);
          return;
      }

      // Normal flow
      showBillConfirmation();
  };

  const showBillConfirmation = (overrideDuration = null) => {
      // Recalculate based on override if present
      let finalTableCost = tableCost;
      let finalGrandTotal = grandTotal;
      let durationText = "";

      if (overrideDuration !== null) {
          const cost = overrideDuration * pricePerMin; // Assuming not frame mode if override is used (only for timer mode)
          finalTableCost = cost;
          finalGrandTotal = finalTableCost + cartTotal;
          durationText = ` (${overrideDuration} mins)`;
      }

      const isPaid = finalGrandTotal <= advancePayment && finalGrandTotal > 0;
      const actionText = isPaid ? "End Session" : "Generate Bill";
      
      const confirmMessage = `
        <div style="text-align: left">
           <p>Are you sure you want to finish this session?${durationText}</p>
           <div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 8px;">
              <p><strong>Total Bill:</strong> ₹${finalGrandTotal.toFixed(2)}</p>
              ${advancePayment > 0 ? `<p style="color: #f59e0b"><strong>Advance Paid:</strong> -₹${advancePayment.toFixed(2)}</p>` : ''}
              <p style="font-size: 1.1em; margin-top: 6px;"><strong>To Pay:</strong> ₹${Math.max(0, finalGrandTotal - advancePayment).toFixed(2)}</p>
           </div>
        </div>
      `;

      showConfirm(
          `${actionText}?`, 
          confirmMessage, 
          () => processGenerateBill(overrideDuration),
          actionText,
          "confirm",
          true
      );
  };



  // Handle Early Exit Selection
  const handleEarlyExitSelection = (choice) => {
      setShowEarlyExitModal(false);
      if (choice === 'full') {
          // Charge for full booked time (no override needed, uses logic default)
          showBillConfirmation(null);
      } else {
          // Charge for actual elapsed time
          showBillConfirmation(earlyExitData.actualDuration);
      }
  };

  // Actual Bill Generation Logic (moved from handleGenerateBill)
  const processGenerateBill = async (overrideDuration = null) => {
    if (!session) return;

    try {
      setGenerating(true);
      setError("");

      const sessionId = session.active_id || session.activeid;
      if (!sessionId) {
          throw new Error("Invalid session ID");
      }

      // Normalize price fields again for consistency
      const pricePerMin = Number(tableInfo?.pricePerMin ?? tableInfo?.pricepermin ?? tableInfo?.price_per_min ?? 0);
      const frameCharge = Number(tableInfo?.frameCharge ?? tableInfo?.framecharge ?? tableInfo?.frame_charge ?? 0);

      // Determine final duration
      // If override provided, use it.
      // Else if frame mode, 0.
      // Else use billingMinutes (which is set to session.duration in timer mode, or elapsed in stopwatch)
      const finalDuration = overrideDuration !== null 
          ? overrideDuration 
          : (isFrameMode ? 0 : billingMinutes);

      // Create comprehensive bill with table charges + food items
      const billResponse = await billingAPI.create({
        customer_name: session.customer_name || "Walk-in Customer",
        table_id: tableId,
        session_id: sessionId,
        session_duration: finalDuration,
        table_price_per_min: isFrameMode ? 0 : pricePerMin,
        // Frame charges: frameCount * frameCharge for frame mode, 0 for other modes
        frame_charges: isFrameMode ? (frameCount * frameCharge) : 0,
        frame_count: isFrameMode ? frameCount : null,
        booking_type: session.booking_type || session.bookingtype,
        selected_menu_items: (cartRef.current || cart).map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
        // Pass advance payment
        advance_payment: advancePayment,
      });

      // Stop the session and release the table (skip_bill=true to avoid duplicate bill)
      await activeTablesAPI.stop({ active_id: sessionId, skip_bill: true });

      // Pass the new bill ID to the billing page for highlighting
      const newBillId = billResponse?.data?.id || billResponse?.id || billResponse?.bill?.id;
      
      navigate("/billing", { state: { billGenerated: true, newBillId } });
    } catch (err) {
      console.error("Failed to generate bill:", err);
      setError(err.message || "Failed to generate bill");
    } finally {
      setGenerating(false);
    }
  };

  // Effect to handle auto-bill trigger (Moved here to access processGenerateBill)
  useEffect(() => {
    if (shouldAutoBill) {
        // Auto-generate bill without confirmation for timer expiry
        processGenerateBill();
        setShouldAutoBill(false);
    }
  }, [shouldAutoBill]);

  // Fetch linked reservation to check for advance payment
  useEffect(() => {
    const fetchLinkedReservation = async () => {
        if (!tableId || !session) return;
        
        try {
            const data = await reservationsAPI.getAll();
            const list = data?.data || (Array.isArray(data) ? data : []);
            // Filter out completed or cancelled reservations to prevent matching old/irrelevant bookings
            const tableRes = list.filter(r => 
                String(r.tableId || r.table_id) === String(tableId) &&
                r.status !== 'completed' && 
                r.status !== 'cancelled'
            );
            
            tableRes.sort((a, b) => {
               const ta = new Date(a.reservationtime || a.reservation_time || a.fromTime);
               const tb = new Date(b.reservationtime || b.reservation_time || b.fromTime);
               return tb - ta;
            });

            const sessionStart = new Date(session.start_time);
            const match = tableRes.find(r => {
                const rTime = new Date(r.reservationtime || r.reservation_time || r.fromTime);
                const diffMins = Math.abs((sessionStart - rTime) / 60000);
                return diffMins < 60;
            });

            if (match && match.notes) {
                setReservationNotes(match.notes);
                // Regex to match any PAID tag: [PAID_X: amount]
                const paymentMatch = match.notes.match(/\[PAID_(?:ADVANCE|HALF|CASH|UPI|WALLET):\s*(\d+(\.\d+)?)\]/);
                
                if (paymentMatch && paymentMatch[1]) {
                    setAdvancePayment(Number(paymentMatch[1]));
                }
            }
        } catch (err) {
            console.error("Failed to fetch linked reservation:", err);
        }
    };
    
    fetchLinkedReservation();
  }, [tableId, session]);

  // Handle Cancel Booking Click
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // Confirm Cancel Booking
  const confirmCancelBooking = async () => {
    if (!session) return;
    
    try {
        setGenerating(true);
        setShowCancelModal(false);
        // Stop session with skip_bill flag to prevent bill generation
        const sessionId = session.active_id || session.activeid;
        if (!sessionId) throw new Error("Invalid Session ID");
        await activeTablesAPI.stop({ active_id: sessionId, skip_bill: true });
        
        navigate("/dashboard");
    } catch (err) {
        console.error("Failed to cancel booking:", err);
        alert("Failed to cancel booking: " + err.message);
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
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate("/dashboard")}>←</button>
              <div className="header-title-group">
                <h5>{game || "Snooker"}</h5>
                <span className="table-code">{tableInfo?.name || `Table ${tableId}`}</span>
              </div>
            </div>

            {/* Search Bar Moved to Header */}
            <div className="food-search-bar header-search">
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

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Main Content - Two Column Layout for Laptop */}
          <div className="session-content">
            {/* Left Column - Timer & Pricing */}
            {/* Left Column - Unified Booking Panel Style */}
            <div className="session-left-column">
              <div className="booking-panel">
                
                {/* Section 1: Session Status & Timer */}
                <div className="panel-section highlight-section text-center">
                   <p className="panel-label" style={{textAlign: 'center', marginBottom: '16px'}}>
                      {isFrameMode ? "Frame Mode" : isStopwatchMode ? "Stopwatch Mode" : "Time Remaining"}
                   </p>
                   
                   {/* Main Timer Display */}
                   <div className={`timer-display-unified ${isTimerMode && getTimerColor()}`}>
                      {isFrameMode ? frameCount : 
                       isStopwatchMode ? formatTime(elapsedSeconds) : 
                       formatCountdown(remainingSeconds)}
                      {isFrameMode && <span className="unit-label">Frames</span>}
                   </div>

                   {/* Secondary Info / warnings */}
                   {isTimerMode && remainingSeconds !== null && remainingSeconds <= 300 && remainingSeconds > 0 && (
                      <p className="timer-warning-text">
                        {remainingSeconds <= 60 ? "Ending soon!" : "< 5 mins left"}
                      </p>
                   )}

                   {/* Elapsed / Hint */}
                   {!isFrameMode && (
                     <p className="elapsed-text-unified">
                       Elapsed: {formatTime(elapsedSeconds)}
                     </p>
                   )}
                   {isFrameMode && (
                     <p className="elapsed-text-unified">
                       Elapsed Time: {formatTime(elapsedSeconds)}
                     </p>
                   )}

                   {/* Session Controls */}
                   <div className="session-controls-unified">
                     <button className={`control-btn-unified ${isPaused ? "paused" : ""}`} onClick={togglePause}>
                        {isPaused ? "▶ Resume" : "⏸ Pause"}
                     </button>
                     
                     {/* Add Frame Button (Frame Mode) */}
                     {/* Frame Controls (Frame Mode) */}
                     {isFrameMode && (
                        <div className="frame-controls-unified" style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            <button 
                                className="control-btn-unified action" 
                                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' }}
                                onClick={() => {
                                    if ((session.frame_count || 0) <= 0) return;
                                    showConfirm(
                                        "Remove Frame?",
                                        "Are you sure you want to reduce the frame count by 1?",
                                        async () => {
                                            try {
                                                setGenerating(true);
                                                const newCount = Math.max(0, (session.frame_count || 0) - 1);
                                                setSession(prev => ({ ...prev, frame_count: newCount }));
                                                await activeTablesAPI.update(session.active_id, { frame_count: newCount });
                                            } catch (err) {
                                                console.error("Failed to remove frame:", err);
                                                alert("Failed to remove frame");
                                                setSession(prev => ({ ...prev, frame_count: (prev.frame_count || 0) + 1 }));
                                            } finally {
                                                setGenerating(false);
                                            }
                                        },
                                        "Yes, Remove"
                                    );
                                }}
                                disabled={generating || (session.frame_count || 0) <= 0}
                            >
                                - Frame
                            </button>

                            <button 
                                className="control-btn-unified action" 
                                onClick={() => {
                                    setFramesToAdd(1);
                                    setShowFrameModal(true);
                                }}
                                disabled={generating}
                            >
                                + Frame
                            </button>
                        </div>
                     )}

                     {/* Add Time Button (Timer Mode) */}
                     {isTimerMode && !isStopwatchMode && (
                        <button 
                            className="control-btn-unified action" 
                            onClick={() => {
                                setManualTime(30); // Default start
                                setShowTimeModal(true);
                            }}
                            disabled={generating}
                        >
                            + Add Time
                        </button>
                     )}
                   </div>
                </div>

                {/* Section 2: Bill / Pricing Details */}
                <div className="panel-section bill-section">
                  <div className="bill-details">
                    
                    {/* Table Charges */}
                    <div className="bill-row highlight" style={{ background: '#f0f7ff', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e0e7ff' }}>
                       <span style={{ color: '#1a1a2e', fontWeight: '700', fontSize: '14px' }}>
                         {isFrameMode ? `Frame Charges (${frameCount})` : 
                          `Table Time (${billingMinutes} mins)`}
                       </span>
                       <span style={{ color: '#1a1a2e', fontWeight: '700', fontSize: '15px' }}>₹{tableCost.toFixed(2)}</span>
                    </div>
                    
                    {/* Itemized Food List */}
                    {cart.length > 0 && (
                        <div className="bill-food-section" style={{ marginTop: '12px' }}>
                            <label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#999', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Food & Drinks</label>
                            {cart.map((item) => (
                              <div className="bill-row item-row" key={item.id} style={{ fontSize: '13px', color: '#666', marginBottom: '8px', marginTop: '0', alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Name Left */}
                                <span style={{ color: '#555', fontWeight: '500' }}>{item.name}</span>

                                {/* Controls + Price Right */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                     <div className="mini-qty-controls" style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '6px', padding: '2px' }}>
                                        <button 
                                            onClick={() => updateCartQty(item.id, -1)}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 8px', fontSize: '14px', color: '#555', display: 'flex', alignItems: 'center' }}
                                        >−</button>
                                        <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '18px', textAlign: 'center', color: '#333' }}>{item.qty}</span>
                                        <button 
                                            onClick={() => updateCartQty(item.id, 1)}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 8px', fontSize: '14px', color: '#555', display: 'flex', alignItems: 'center' }}
                                        >+</button>
                                    </div>
                                    <span style={{ fontWeight: '600', color: '#333', minWidth: '60px', textAlign: 'right' }}>₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Divider */}
                    <div className="panel-divider"></div>

                    {/* Advance Payment Status */}
                    {advancePayment > 0 && (
                      <div className="bill-row" style={{ color: grandTotal <= advancePayment ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                          <span>
                             {grandTotal <= advancePayment ? "Full Bill Paid" : "Half Paid Advance"}
                          </span>
                          <span>-₹{advancePayment.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="bill-total-row">
                       <span>Total</span>
                       <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons-unified">


                       <button 
                         className="cancel-btn-unified"
                         onClick={handleCancelClick}
                         disabled={generating}
                         style={{
                             marginBottom: '8px',
                             background: 'transparent',
                             border: '1px solid #ff4d4d',
                             color: '#ff4d4d',
                             width: '100%',
                             padding: '12px',
                             borderRadius: '12px',
                             fontWeight: '600',
                             cursor: 'pointer',
                             transition: 'all 0.2s'
                         }}
                         onMouseOver={(e) => {
                             e.currentTarget.style.background = '#fff0f0';
                         }}
                         onMouseOut={(e) => {
                             e.currentTarget.style.background = 'transparent';
                         }}
                       >
                         Cancel Booking
                       </button>

                       {/* Dynamic Button Text based on Payment Status */}
                       <button 
                         className="book-btn-unified" 
                         onClick={handleGenerateBillClick} 
                         disabled={generating}
                         style={
                            (grandTotal <= advancePayment && grandTotal > 0) ? {
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green for Paid
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            } : {}
                         }
                       >
                         {generating ? "Processing..." : 
                          (grandTotal <= advancePayment && grandTotal > 0) ? "End Session (Paid)" : "Generate Bill"}
                       </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Right Column - Food Selection */}
            <div className="session-right-column">
              {/* Item Type Switcher */}
              <div className="item-type-tabs" style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '0 10px' }}>
                  {ITEM_TYPES.map(type => (
                      <button
                          key={type.key}
                          onClick={() => setActiveType(type.key)}
                          style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '12px',
                              border: 'none',
                              background: activeType === type.key ? '#F08626' : '#fff',
                              color: activeType === type.key ? '#fff' : '#666',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: activeType === type.key ? '0 4px 12px rgba(240, 134, 38, 0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
                              transition: 'all 0.2s'
                          }}
                      >
                          {type.icon}
                          {type.label}
                      </button>
                  ))}
              </div>

              {/* Category Tabs */}
              <FoodCategoryTabs 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
                categories={[{ id: 'All', label: 'All', icon: <PlateIcon size={20} /> }, ...computedCategories]}
              />
              


              {/* Menu Items */}
              <div className="menu-items-list">
                {loadingMenu ? (
                  <p className="loading-text">Loading menu...</p>
                ) : filteredMenu.length === 0 ? (
                  <p className="empty-text">{searchQuery ? `No items found for "${searchQuery}"` : "No food items available"}</p>
                ) : (
                  filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    const quantity = inCart ? inCart.qty : 0;
                    
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
                          {item.imageUrl && !failedImages.has(item.id) ? (
                             <img 
                               src={item.imageUrl} 
                               alt={item.name} 
                               onError={() => handleImageError(item.id)}
                             />
                          ) : (
                             <div className="placeholder-img" style={{
                               height: '100%', 
                               borderRadius: '12px', 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center', 
                               background: '#f8f8f8', 
                               fontSize: '32px'
                             }}>🍽</div>
                          )}

                          {/* Floating Button Overlap */}
                          <div className="add-btn-container">
                             {quantity > 0 ? (
                               <div className="qty-controls-floating">
                                 <button onClick={() => updateCartQty(item.id, -1)}>-</button>
                                 <span>{quantity}</span>
                                 <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                               </div>
                             ) : (
                               <button 
                                 className="add-btn" 
                                 onClick={() => {
                                     showConfirm(
                                         `Add ${item.name}?`,
                                         `Are you sure you want to add <strong>${item.name}</strong> to the order?`,
                                         () => addToCart(item),
                                         "Yes, Add",
                                         "confirm",
                                         true
                                     );
                                 }}
                               >
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

              {/* Cart Summary removed as per user request */}
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
            <button 
                className="generate-bill-btn" 
                onClick={handleGenerateBillClick} 
                disabled={generating}
                style={
                    (grandTotal <= advancePayment && grandTotal > 0) ? {
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    } : {}
                 }
            >
               {generating ? "Processing..." : 
                (grandTotal <= advancePayment && grandTotal > 0) ? "End Session (Paid)" : "Generate Bill"}
            </button>
          </div>
        </div>
      </div>
    {/* Manual Time Add Modal */}
    {showTimeModal && (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}>
        <div className="modal-content" style={{
          background: 'white', padding: '24px', borderRadius: '20px',
          width: '90%', maxWidth: '340px', textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '20px', fontWeight: '700' }}>Add Time</h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>Enter minutes to extend session</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <button 
                onClick={() => setManualTime(prev => Math.max(5, Number(prev) - 5))} 
                style={{
                  width: '44px', height: '44px', borderRadius: '12px', border: '1px solid #eee', 
                  background: '#f8f8f8', fontSize: '20px', cursor: 'pointer', color: '#555',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eee'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8f8f8'}
            >−</button>
            
            <div style={{ position: 'relative' }}>
                <input 
                type="number" 
                value={manualTime} 
                onChange={(e) => setManualTime(e.target.value)}
                style={{
                    width: '100px', textAlign: 'center', fontSize: '32px', fontWeight: '800',
                    border: 'none', outline: 'none', color: '#333', background: 'transparent'
                }}
                />
                <div style={{ position: 'absolute', bottom: '-4px', left: '10px', right: '10px', height: '3px', background: 'linear-gradient(90deg, #f08626 0%, #ff6b00 100%)', borderRadius: '2px' }}></div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', fontWeight: '500' }}>MINS</div>
            </div>

            <button 
                onClick={() => setManualTime(prev => Number(prev) + 5)} 
                style={{
                  width: '44px', height: '44px', borderRadius: '12px', border: '1px solid #eee', 
                  background: '#f8f8f8', fontSize: '20px', cursor: 'pointer', color: '#555',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eee'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8f8f8'}
            >+</button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowTimeModal(false)} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: '#f5f5f5', color: '#666', fontWeight: '600', cursor: 'pointer', fontSize: '15px'
            }}>Cancel</button>
            
            <button onClick={handleAddTimeSubmit} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: 'linear-gradient(135deg, #f08626 0%, #ff6b00 100%)', color: 'white', fontWeight: '600', cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(240, 134, 38, 0.3)', fontSize: '15px'
            }}>Confirm</button>
          </div>
        </div>
      </div>
    )}


    {/* Manual Frame Add Modal */}
    {showFrameModal && (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}>
        <div className="modal-content" style={{
          background: 'white', padding: '24px', borderRadius: '20px',
          width: '90%', maxWidth: '340px', textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '20px', fontWeight: '700' }}>Add Frames</h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>How many frames to add?</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <button 
                onClick={() => setFramesToAdd(prev => Math.max(1, Number(prev) - 1))} 
                style={{
                  width: '44px', height: '44px', borderRadius: '12px', border: '1px solid #eee', 
                  background: '#f8f8f8', fontSize: '20px', cursor: 'pointer', color: '#555',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eee'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8f8f8'}
            >−</button>
            
            <div style={{ position: 'relative' }}>
                <input 
                type="number" 
                value={framesToAdd} 
                onChange={(e) => setFramesToAdd(e.target.value)}
                style={{
                    width: '100px', textAlign: 'center', fontSize: '32px', fontWeight: '800',
                    border: 'none', outline: 'none', color: '#333', background: 'transparent'
                }}
                />
                <div style={{ position: 'absolute', bottom: '-4px', left: '10px', right: '10px', height: '3px', background: 'linear-gradient(90deg, #f08626 0%, #ff6b00 100%)', borderRadius: '2px' }}></div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', fontWeight: '500' }}>FRAMES</div>
            </div>

            <button 
                onClick={() => setFramesToAdd(prev => Number(prev) + 1)} 
                style={{
                  width: '44px', height: '44px', borderRadius: '12px', border: '1px solid #eee', 
                  background: '#f8f8f8', fontSize: '20px', cursor: 'pointer', color: '#555',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eee'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8f8f8'}
            >+</button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowFrameModal(false)} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: '#f5f5f5', color: '#666', fontWeight: '600', cursor: 'pointer', fontSize: '15px'
            }}>Cancel</button>
            
            <button onClick={handleAddFramesSubmit} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: 'linear-gradient(135deg, #f08626 0%, #ff6b00 100%)', color: 'white', fontWeight: '600', cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(240, 134, 38, 0.3)', fontSize: '15px'
            }}>Add Frames</button>
          </div>
        </div>
      </div>
    )}


    {/* Early Exit Confirmation Modal */}
    {showEarlyExitModal && earlyExitData && (
       <div className="modal-overlay" style={{
         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
         background: 'rgba(0,0,0,0.5)', zIndex: 9999,
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         backdropFilter: 'blur(4px)'
       }}>
         <div className="modal-content" style={{
           background: 'white', padding: '24px', borderRadius: '20px',
           width: '90%', maxWidth: '400px', textAlign: 'center',
           boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
           animation: 'fadeIn 0.2s ease-out'
         }}>
            <div style={{
               width: '50px', height: '50px', background: '#ffe0b2', borderRadius: '50%',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               margin: '0 auto 16px', color: '#f57c00', fontSize: '24px'
            }}>
               ⏱️
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '20px', fontWeight: '700' }}>Early Exit Detected</h3>
            <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px', lineHeight: '1.5' }}>
               This session was booked for <strong>{earlyExitData.bookedDuration} mins</strong>,<br/>
               but currently only <strong>{earlyExitData.actualDuration} mins</strong> have elapsed.
            </p>
            <p style={{ color: '#333', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
               How would you like to bill?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {/* Option 1: Actual Time */}
               <button onClick={() => handleEarlyExitSelection('actual')} style={{
                 padding: '16px', borderRadius: '12px', border: '1px solid #e0e0e0', 
                 background: '#fff', textAlign: 'left', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
               }}
               onMouseOver={(e) => e.currentTarget.style.borderColor = '#4caf50'}
               onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
               >
                  <div>
                     <div style={{ fontWeight: '700', color: '#333', marginBottom: '4px' }}>Actual Time ({earlyExitData.actualDuration}m)</div>
                     <div style={{ fontSize: '12px', color: '#666' }}>Pay only for time played</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#4caf50', fontSize: '16px' }}>
                     ₹{earlyExitData.actualCost.toFixed(2)}
                  </div>
               </button>

               {/* Option 2: Full Time */}
               <button onClick={() => handleEarlyExitSelection('full')} style={{
                 padding: '16px', borderRadius: '12px', border: '1px solid #e0e0e0', 
                 background: '#fcfcfc', textAlign: 'left', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
               }}
               onMouseOver={(e) => e.currentTarget.style.borderColor = '#f57c00'}
               onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
               >
                  <div>
                     <div style={{ fontWeight: '700', color: '#333', marginBottom: '4px' }}>Full Booking ({earlyExitData.bookedDuration}m)</div>
                     <div style={{ fontSize: '12px', color: '#666' }}>Pay for full booked session</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#333', fontSize: '16px' }}>
                     ₹{earlyExitData.bookedCost.toFixed(2)}
                  </div>
               </button>
            </div>
            
            <button onClick={() => setShowEarlyExitModal(false)} style={{
               marginTop: '20px',
               padding: '12px', width: '100%',
               border: 'none', background: 'transparent',
               color: '#999', cursor: 'pointer', fontSize: '14px'
            }}>
               Cancel
            </button>
         </div>
       </div>
    )}

    {/* Cancel Booking Confirmation Modal */}
    {showCancelModal && (
      <div className="modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}>
        <div className="modal-content" style={{
          background: 'white', padding: '24px', borderRadius: '20px',
          width: '90%', maxWidth: '340px', textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
              width: '50px', height: '50px', background: '#ffebeb', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: '#ff4d4d', fontSize: '24px'
          }}>
              ⚠️
          </div>
          <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a', fontSize: '20px', fontWeight: '700' }}>Cancel Booking?</h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
            Are you sure? Use this only for mistakes.<br/>
            <strong>No bill will be generated</strong> and the table will be released immediately.
          </p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCancelModal(false)} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: '#f5f5f5', color: '#666', fontWeight: '600', cursor: 'pointer', fontSize: '15px'
            }}>No, Go Back</button>
            
            <button onClick={confirmCancelBooking} style={{
              flex: 1, padding: '14px', borderRadius: '12px', border: 'none', 
              background: '#ff4d4d', color: 'white', fontWeight: '600', cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(255, 77, 77, 0.3)', fontSize: '15px'
            }}>Yes, Cancel</button>
          </div>
        </div>
       </div>
    )}
    
    {/* Unified Confirmation Modal */}
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

export default ActiveSession;

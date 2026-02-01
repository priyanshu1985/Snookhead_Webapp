import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { menuAPI, activeTablesAPI, tablesAPI, billingAPI, ordersAPI, reservationsAPI, IMAGE_BASE_URL } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import FoodCategoryTabs, { DEFAULT_CATEGORIES } from "../../components/common/FoodCategoryTabs";
import { PlateIcon } from "../../components/common/Icons";
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

  // Food selection
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(initialCart); // Initialize with items from booking
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const cartRef = useRef(initialCart); // Ref to access cart in timer callbacks

  // Compute categories - Strict Mode: Only show categories that have items
  const computedCategories = menuItems.reduce((acc, item) => {

    // Skip if no category
    if (!item.category) return acc;
    
    // Check if category already added
    const exists = acc.some(cat => cat.id === item.category);
    if (!exists) {
      // Check if it matches a known default category to get icon/label
      const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === item.category);
      
      if (defaultCat) {
        acc.push(defaultCat);
      } else {
        // Add as proper custom category
        acc.push({
          id: item.category,
          label: item.category,
          icon: <PlateIcon size={24} />
        });
      }
    }
    return acc;
  }, []);

  // Ensure active category is valid
  useEffect(() => {
    if (computedCategories.length > 0) {
        // If current active is not in list (or empty), switch to first one
        const currentExists = computedCategories.some(c => c.id === selectedCategory);
        if (!currentExists) {
            setSelectedCategory(computedCategories[0].id);
        }
    }
  }, [computedCategories, selectedCategory]);

  // Action states
  const [generating, setGenerating] = useState(false);

  // Manual Time Add Modal State
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [manualTime, setManualTime] = useState(30);

  // Manual Frame Add Modal State
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [framesToAdd, setFramesToAdd] = useState(1);

  // Cancel Booking Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm", 
    onConfirm: null,
    confirmText: "Yes"
  });

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
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
  
  // Image error handling
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (id) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  // Handle Manual Frame Addition
  const handleAddFramesSubmit = async () => {
    if (!framesToAdd || framesToAdd <= 0) return;
    
    setShowFrameModal(false);
    const countToAdd = Number(framesToAdd);
    
    try {
        setGenerating(true);
        const newCount = (session.frame_count || 0) + countToAdd;
        
        // Optimistic update
        setSession(prev => ({ ...prev, frame_count: newCount }));
        
        // API Update
        await activeTablesAPI.update(session.active_id, { frame_count: newCount });
    } catch (err) {
        console.error("Failed to add frames:", err);
        alert("Failed to add frames");
        setSession(prev => ({ ...prev, frame_count: (prev.frame_count || 1) - countToAdd }));
    } finally {
        setGenerating(false);
    }
  };

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
        // Pass advance payment to include in bill details
        advance_payment: advancePayment, 
        cart_items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
      });
      console.log("Auto-release successful", response);
      
      const newBillId = response?.bill_id || response?.id || response?.bill?.id || response?.data?.id;

      // Navigate to billing page
      navigate("/billing", { state: { billGenerated: true, newBillId } });
    } catch (err) {
      console.error("Auto-release failed:", err);
      alert("Auto-release failed check console. Redirecting to billing anyway."); 
      // Still navigate to billing even if there's an error so user isn't stuck
      navigate("/billing", { state: { billGenerated: true } });
    }
  };

  // Handle Manual Time Addition
  const handleAddTimeSubmit = async () => {
    if (!manualTime || manualTime <= 0) return;
    
    setShowTimeModal(false);
    const minutesToAdd = Number(manualTime);
    
    try {
        setGenerating(true);
        
        // Calculate new end time
        // Ensure we work with valid dates
        const currentEndTime = new Date(session.booking_end_time);
        if (isNaN(currentEndTime.getTime())) {
            throw new Error("Invalid current end time");
        }
        
        const newEndTime = new Date(currentEndTime.getTime() + minutesToAdd * 60000);
        const newDuration = (parseInt(session.duration_minutes) || 0) + minutesToAdd;

        console.log("Adding time:", { minutesToAdd, newEndTime, newDuration });

        // Optimistic Update
        setSession(prev => ({ 
            ...prev, 
            booking_end_time: newEndTime.toISOString(),
            duration_minutes: newDuration
        }));
        
        // Also update the running timer immediately
        setRemainingSeconds(prev => (prev || 0) + minutesToAdd * 60);
        
        // API Update
        await activeTablesAPI.update(session.active_id, { 
            booking_end_time: newEndTime.toISOString(),
            duration_minutes: newDuration
        });
    } catch (err) {
        console.error("Failed to add time:", err);
        alert("Failed to add time: " + err.message);
        // Ideally revert optimistic update here if needed (refetch session)
        // For now, simpler error handling
    } finally {
        setGenerating(false);
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
    const matchesCategory = selectedCategory && item.category === selectedCategory;
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
  
  // Normalize price fields (handle potential backend case differences)
  const pricePerMin = Number(tableInfo?.pricePerMin ?? tableInfo?.pricepermin ?? tableInfo?.price_per_min ?? 0);
  const frameCharge = Number(tableInfo?.frameCharge ?? tableInfo?.framecharge ?? tableInfo?.frame_charge ?? 0);

  const tableCost = isFrameMode
    ? frameCount * frameCharge
    : billingMinutes * pricePerMin;
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

  // Handle generate bill click (with confirmation)
  const handleGenerateBillClick = () => {
      const isPaid = grandTotal <= advancePayment && grandTotal > 0;
      const actionText = isPaid ? "End Session" : "Generate Bill";
      const confirmMessage = `
        <div style="text-align: left">
           <p>Are you sure you want to finish this session?</p>
           <div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 8px;">
              <p><strong>Total Bill:</strong> ₹${grandTotal.toFixed(2)}</p>
              ${advancePayment > 0 ? `<p style="color: #f59e0b"><strong>Advance Paid:</strong> -₹${advancePayment.toFixed(2)}</p>` : ''}
              <p style="font-size: 1.1em; margin-top: 6px;"><strong>To Pay:</strong> ₹${Math.max(0, grandTotal - advancePayment).toFixed(2)}</p>
           </div>
        </div>
      `;

      showConfirm(
          `${actionText}?`, 
          confirmMessage, 
          () => processGenerateBill(),
          actionText,
          "confirm",
          true
      );
  };

  // Actual Bill Generation Logic (moved from handleGenerateBill)
  const processGenerateBill = async () => {
    if (!session) return;

    try {
      setGenerating(true);
      setError("");

      // Normalize price fields again for consistency
      const pricePerMin = Number(tableInfo?.pricePerMin ?? tableInfo?.pricepermin ?? tableInfo?.price_per_min ?? 0);
      const frameCharge = Number(tableInfo?.frameCharge ?? tableInfo?.framecharge ?? tableInfo?.frame_charge ?? 0);

      // Create comprehensive bill with table charges + food items
      // For frame mode: use frame_count * frameCharge (no time-based billing)
      // For timer mode: use booked duration * pricePerMin
      // For stopwatch mode: use elapsed time * pricePerMin
      const billResponse = await billingAPI.create({
        customer_name: session.customer_name || "Walk-in Customer",
        table_id: tableId,
        session_id: session.active_id,
        // For frame mode, session_duration is 0 (billing is by frames, not time)
        session_duration: isFrameMode ? 0 : billingMinutes,
        table_price_per_min: isFrameMode ? 0 : pricePerMin,
        // Frame charges: frameCount * frameCharge for frame mode, 0 for other modes
        frame_charges: isFrameMode ? (frameCount * frameCharge) : 0,
        frame_count: isFrameMode ? frameCount : null,
        booking_type: session.booking_type,
        selected_menu_items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.qty,
        })),
        // Pass advance payment
        advance_payment: advancePayment,
      });

      // Stop the session and release the table (skip_bill=true to avoid duplicate bill)
      await activeTablesAPI.stop({ active_id: session.active_id, skip_bill: true });

      // Pass the new bill ID to the billing page for highlighting
      // The API likely returns the created bill object, check if it has id or _id or bill_id
      const newBillId = billResponse?.data?.id || billResponse?.id || billResponse?.bill?.id;
      
      navigate("/billing", { state: { billGenerated: true, newBillId } });
    } catch (err) {
      console.error("Failed to generate bill:", err);
      setError(err.message || "Failed to generate bill");
    } finally {
      setGenerating(false);
    }
  };

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
        await activeTablesAPI.stop({ active_id: session.active_id, skip_bill: true });
        
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
            <button className="back-btn" onClick={() => navigate("/dashboard")}>←</button>
            <h5>{game || "Snooker"}</h5>
            <span className="table-code">{tableInfo?.name || `Table ${tableId}`}</span>
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
              {/* Category Tabs */}
              <FoodCategoryTabs 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
                categories={computedCategories}
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

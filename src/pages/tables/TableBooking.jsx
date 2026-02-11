import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import TableBookedModal from "../../components/tables/TableBookedModel";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import TimeConflictModal from "../../components/common/TimeConflictModal";
import {
  menuAPI,
  activeTablesAPI,
  tablesAPI,
  reservationsAPI,
  IMAGE_BASE_URL,
} from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import FoodCategoryTabs, {
  DEFAULT_CATEGORIES,
} from "../../components/common/FoodCategoryTabs";
import {
  PlateIcon,
  PreparedFoodIcon,
  PackedFoodIcon,
} from "../../components/common/Icons";

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

  // Item Type State
  const ITEM_TYPES = [
    {
      key: "prepared",
      label: "Prepared Food",
      icon: <PreparedFoodIcon size={20} />,
    },
    { key: "packed", label: "Packed Food", icon: <PackedFoodIcon size={20} /> },
  ];
  const [activeType, setActiveType] = useState("prepared");

  // Filter items by Type first
  const typeItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = (item.item_type || "prepared") === activeType;
    return matchesSearch && matchesType;
  });

  // Compute Categories from typeItems
  const computedCategories = typeItems
    .reduce((acc, item) => {
      // Skip if no category
      if (!item.category) return acc;

      // Check if category already added
      const exists = acc.some((cat) => cat.id === item.category);
      if (!exists) {
        acc.push({
          id: item.category,
          label: item.category,
          icon: <PlateIcon size={20} />,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  // Table info
  const [tableInfo, setTableInfo] = useState(null);
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  // Booking state
  const [showSuccess, setShowSuccess] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Time conflict resolution state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        const data = await menuAPI.getAll();
        const items = data?.data || (Array.isArray(data) ? data : []);

        // Sanitize image URLs: Replace localhost:4000 with current backend URL
        const processedItems = items.map((item) => {
          if (item.imageUrl && item.imageUrl.includes("localhost:4000")) {
            // Replace both http and https variants just in case
            const cleanUrl = item.imageUrl.replace(
              /https?:\/\/localhost:4000/g,
              IMAGE_BASE_URL,
            );
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

  // Ensure active category is valid
  useEffect(() => {
    if (selectedCategory !== "All") {
      const catExists = computedCategories.some(
        (c) => c.id === selectedCategory,
      );
      if (!catExists) setSelectedCategory("All");
    }
  }, [activeType, computedCategories]);

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

  // Fetch reservations for conflict check
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationsAPI.getAll();
        const list = data?.data || (Array.isArray(data) ? data : []);

        // Filter: This Table + Pending + Future
        const now = new Date();
        const filtered = list.filter((r) => {
          if (String(r.tableId || r.table_id) !== String(tableId)) return false;
          if (r.status !== "pending") return false;

          const rTime = new Date(
            r.reservationtime || r.reservation_time || r.fromTime,
          );
          return rTime > now;
        });

        // Sort by time asc
        filtered.sort((a, b) => {
          const ta = new Date(
            a.reservationtime || a.reservation_time || a.fromTime,
          );
          const tb = new Date(
            b.reservationtime || b.reservation_time || b.fromTime,
          );
          return ta - tb;
        });

        setUpcomingReservations(filtered);
      } catch (err) {
        console.error("Failed to fetch reservations for conflict check", err);
      }
    };
    if (tableId) fetchReservations();
  }, [tableId]);

  // Filter menu (Final)
  const filteredMenu = typeItems.filter((item) => {
    if (selectedCategory === "All" || !selectedCategory) return true;
    return item.category === selectedCategory;
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
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)),
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Update cart quantity
  const updateCartQty = (id, delta) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  // Calculate totals
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0,
  );

  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
    confirmText: "OK",
  });

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "alert",
      onConfirm: null,
      confirmText: "OK",
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
      confirmText: "Yes, Book Anyway",
      cancelText: "Cancel",
    });
  };

  // Handle booking
  const handleBook = async () => {
    // Validate booking based on mode
    if (!isBookingValid()) {
      showAlert("Invalid Duration", "Please set a valid time or frame count.");
      return;
    }

    const duration = getDurationMinutes();
    const finalCustomerName = customerName.trim() || "Walk-in Customer";

    const bookingData = {
      table_id: tableId,
      game_id: tableInfo?.gameid || tableInfo?.game_id,
      duration_minutes: duration,
      customer_name: finalCustomerName,
      booking_type: timeMode,
      frame_count: timeMode === "frame" ? frameCount : null,
      cart: cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.qty,
      })),
      food_orders: cart, // Pass raw cart for persistence
    };

    await executeBooking(bookingData);
  };

  const executeBooking = async (bookingData, forceBooking = false) => {
    try {
      setBooking(true);
      setError("");

      // Add force flag if this is a forced booking after conflict resolution
      const requestData = { ...bookingData };
      if (forceBooking) {
        requestData.acknowledge_conflicts = true;
      }

      await activeTablesAPI.start(requestData);

      setShowSuccess(true);
      setShowConflictModal(false);
      setConflictData(null);
      setPendingBookingData(null);
    } catch (err) {
      console.error("Booking failed:", err);

      // Check if this is a conflict error response
      if (err.response?.status === 409 && err.response?.data?.error) {
        const conflictResponse = err.response.data;

        if (
          conflictResponse.error === "BOOKING_CONFLICT" ||
          conflictResponse.error === "BOOKING_WARNING"
        ) {
          // Show conflict resolution modal
          setConflictData(conflictResponse);
          setPendingBookingData(bookingData);
          setShowConflictModal(true);
          setBooking(false);
          return;
        }
      }

      // Handle other errors normally
      showAlert("Booking Failed", err.message || "Failed to book table");
      setBooking(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  // Time conflict resolution handlers
  const handleConflictConfirm = async () => {
    if (pendingBookingData) {
      await executeBooking(pendingBookingData, true); // Force booking
    }
  };

  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setConflictData(null);
    setPendingBookingData(null);
    setBooking(false);
  };

  const handleAlternativeSelect = async (alternative) => {
    if (pendingBookingData) {
      // Update booking data with new time
      const updatedBookingData = {
        ...pendingBookingData,
        start_time: alternative.startTime,
        end_time: alternative.endTime,
      };

      await executeBooking(updatedBookingData);
    }
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
      <div
        className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`}
      />
      <div className="dashboard-main">
        <Navbar />

        <div className="table-booking-page">
          {/* Header */}
          {/* Header */}
          <div className="booking-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ←
              </button>
              <div className="header-title-group">
                <h5>{game || "Game"}</h5>
                <span className="table-code">
                  {tableInfo?.name || `Table ${tableId}`}
                </span>
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
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
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
                        <button
                          onClick={() =>
                            setTimerMinutes(Math.max(5, timerMinutes - 5))
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={timerMinutes}
                          onChange={(e) =>
                            setTimerMinutes(Math.max(1, Number(e.target.value)))
                          }
                          min="1"
                        />
                        <button
                          onClick={() => setTimerMinutes(timerMinutes + 5)}
                        >
                          +
                        </button>
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
                        <button
                          onClick={() =>
                            setFrameCount(Math.max(1, frameCount - 1))
                          }
                        >
                          -
                        </button>
                        <span className="frame-count-val">{frameCount}</span>
                        <button onClick={() => setFrameCount(frameCount + 1)}>
                          +
                        </button>
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
                        <span style={{ color: "#555" }}>Rate</span>
                        <span style={{ color: "#555" }}>
                          {timeMode === "frame"
                            ? `₹${Number(tableInfo.frameCharge ?? tableInfo.framecharge ?? tableInfo.frame_charge ?? 0)}/frame`
                            : `₹${Number(tableInfo.pricePerMin ?? tableInfo.pricepermin ?? tableInfo.price_per_min ?? 0)}/min`}
                        </span>
                      </div>

                      {/* Estimated Cost Line */}
                      {timeMode !== "set" && (
                        <div
                          className="bill-row highlight"
                          style={{
                            background: "#f0f7ff",
                            padding: "12px",
                            borderRadius: "8px",
                            marginTop: "8px",
                            border: "1px solid #e0e7ff",
                          }}
                        >
                          <span style={{ color: "#1a1a2e", fontWeight: "700" }}>
                            {timeMode === "frame" ? "Frame Cost" : "Time Cost"}
                          </span>
                          <span
                            style={{
                              color: "#1a1a2e",
                              fontWeight: "700",
                              fontSize: "15px",
                            }}
                          >
                            {timeMode === "frame"
                              ? `₹${(frameCount * Number(tableInfo.frameCharge ?? tableInfo.framecharge ?? tableInfo.frame_charge ?? 0)).toFixed(2)}`
                              : `₹${(getDurationMinutes() * Number(tableInfo.pricePerMin ?? tableInfo.pricepermin ?? tableInfo.price_per_min ?? 0)).toFixed(2)}`}
                          </span>
                        </div>
                      )}

                      {/* Food Items List */}
                      {cart.length > 0 && (
                        <div
                          className="bill-food-list"
                          style={{ marginTop: "16px" }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              textTransform: "uppercase",
                              color: "#999",
                              fontWeight: "700",
                              letterSpacing: "0.5px",
                              marginBottom: "8px",
                              display: "block",
                            }}
                          >
                            Food Items
                          </label>
                          {cart.map((item) => (
                            <div
                              className="bill-food-row"
                              key={item.id}
                              style={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                              }}
                            >
                              {/* Name Left */}
                              <span
                                className="name"
                                style={{ color: "#555", fontWeight: "500" }}
                              >
                                {item.name}
                              </span>

                              {/* Controls + Price Right */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  className="mini-qty-controls"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#f5f5f5",
                                    borderRadius: "6px",
                                    padding: "2px",
                                  }}
                                >
                                  <button
                                    onClick={() => updateCartQty(item.id, -1)}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                      padding: "2px 8px",
                                      fontSize: "14px",
                                      color: "#555",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {" "}
                                    −{" "}
                                  </button>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      minWidth: "18px",
                                      textAlign: "center",
                                      color: "#333",
                                    }}
                                  >
                                    {item.qty}
                                  </span>
                                  <button
                                    onClick={() => updateCartQty(item.id, 1)}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                      padding: "2px 8px",
                                      fontSize: "14px",
                                      color: "#555",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {" "}
                                    +{" "}
                                  </button>
                                </div>
                                <span
                                  className="price"
                                  style={{
                                    fontWeight: "600",
                                    color: "#333",
                                    minWidth: "60px",
                                    textAlign: "right",
                                  }}
                                >
                                  ₹{(Number(item.price) * item.qty).toFixed(2)}
                                </span>
                              </div>
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
                            ₹
                            {(
                              (timeMode === "frame"
                                ? frameCount *
                                  Number(
                                    tableInfo.frameCharge ??
                                      tableInfo.framecharge ??
                                      tableInfo.frame_charge ??
                                      0,
                                  )
                                : getDurationMinutes() *
                                  Number(
                                    tableInfo.pricePerMin ??
                                      tableInfo.pricepermin ??
                                      tableInfo.price_per_min ??
                                      0,
                                  )) + cartTotal
                            ).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    className="book-btn-unified"
                    onClick={handleBook}
                    disabled={booking}
                  >
                    {booking ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Food Selection */}
            <div className="booking-right-column">
              {/* Item Type Switcher */}
              <div
                className="item-type-tabs"
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  padding: "0 10px",
                }}
              >
                {ITEM_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setActiveType(type.key)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: activeType === type.key ? "#F08626" : "#fff",
                      color: activeType === type.key ? "#fff" : "#666",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow:
                        activeType === type.key
                          ? "0 4px 12px rgba(240, 134, 38, 0.3)"
                          : "0 2px 6px rgba(0,0,0,0.05)",
                      transition: "all 0.2s",
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
                categories={[
                  { id: "All", label: "All", icon: <PlateIcon size={20} /> },
                  ...computedCategories,
                ]}
              />

              <div className="menu-header">
                <h6>Food & Drinks</h6>
              </div>

              {/* Menu Items */}
              <div className="menu-items-grid">
                {loadingMenu ? (
                  <p className="loading-text">Loading menu...</p>
                ) : filteredMenu.length === 0 ? (
                  <p className="empty-text">
                    {searchQuery
                      ? `No items found for "${searchQuery}"`
                      : "No food items available"}
                  </p>
                ) : (
                  filteredMenu.map((item) => {
                    const cartItem = cart.find((c) => c.id === item.id);
                    const quantity = cartItem ? cartItem.qty : 0;
                    const hasValidImage =
                      item.imageUrl &&
                      item.imageUrl.trim() !== "" &&
                      !failedImages.has(item.id);

                    return (
                      <div className="menu-item-card" key={item.id}>
                        {/* LEFT: Info */}
                        <div className="menu-item-info">
                          <div
                            className={
                              item.isVeg === false ? "non-veg-icon" : "veg-icon"
                            }
                          ></div>
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">₹{item.price}</span>
                          <p className="item-description">
                            {item.description || "Delicious food item"}
                          </p>
                        </div>

                        {/* RIGHT: Image + Floating Action */}
                        <div className="menu-item-image-container">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="placeholder-img"
                            style={{
                              height: "100%",
                              borderRadius: "12px",
                              display: item.imageUrl ? "none" : "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f8f8f8",
                              fontSize: "32px",
                            }}
                          >
                            🍽
                          </div>

                          {/* Floating Button Overlap */}
                          <div className="add-btn-container">
                            {quantity > 0 ? (
                              <div className="qty-controls-floating">
                                <button
                                  onClick={() => updateCartQty(item.id, -1)}
                                >
                                  -
                                </button>
                                <span>{quantity}</span>
                                <button
                                  onClick={() => updateCartQty(item.id, 1)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className="add-btn"
                                onClick={() =>
                                  showConfirm(
                                    `Add ${item.name}?`,
                                    `Are you sure you want to add <strong>${item.name}</strong> to the booking?`,
                                    () => addToCart(item),
                                  )
                                }
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
            </div>
          </div>
        </div>

        {/* Modal for Alerts */}
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          type={modalConfig.type}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText || "Cancel"}
          isHtml={true}
        />

        {/* Time Conflict Resolution Modal */}
        <TimeConflictModal
          show={showConflictModal}
          conflictData={conflictData}
          onConfirm={handleConflictConfirm}
          onCancel={handleConflictCancel}
          onSelectAlternative={handleAlternativeSelect}
          loading={booking}
        />

        {/* SUCCESS MODAL */}
        {showSuccess && <TableBookedModal onClose={handleSuccessClose} />}
      </div>
    </div>
  );
};

export default TableBooking;

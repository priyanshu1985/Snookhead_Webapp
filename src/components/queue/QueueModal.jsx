import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, queueAPI, activeTablesAPI, reservationsAPI, menuAPI } from "../../services/api";
import ConfirmationModal from "../common/ConfirmationModal";
import "../../styles/queueModal.css";

const QueueModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedGame, setSelectedGame] = useState("");
  const [preferredTable, setPreferredTable] = useState("");

  // Time selection state
  const [timeMode, setTimeMode] = useState("timer"); // timer, set, frame
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [setTimeValue, setSetTimeValue] = useState("");
  const [frameCount, setFrameCount] = useState(1);

  // Data state
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Food State
  const [menuItems, setMenuItems] = useState([]);
  const [foodCart, setFoodCart] = useState([]);
  const [foodType, setFoodType] = useState("prepared"); // prepared, packed
  const [foodCategory, setFoodCategory] = useState("All");

  // Filtered Food
  const typeFood = menuItems.filter(item => (item.item_type || 'prepared') === foodType);
  const availableCategories = [...new Set(typeFood.map(item => item.category).filter(Boolean))].sort();
  
  const filteredFood = typeFood.filter(item => {
      if (foodCategory !== "All" && item.category !== foodCategory) return false;
      return true;
  });

  const updateFoodCart = (item, delta) => {
      setFoodCart(prev => {
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
              const newQty = existing.qty + delta;
              if (newQty <= 0) return prev.filter(i => i.id !== item.id);
              return prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
          }
          if (delta > 0) return [...prev, { ...item, qty: 1 }];
          return prev;
      });
  };

  // Alert/Confirm Modal State
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: null
  });

  // Fetch games and tables on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [gamesData, tablesData, activeSessionsData, reservationsData, menuData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
          activeTablesAPI.getAll(),
          reservationsAPI.getAll(),
          menuAPI.getAll()
        ]);

        const gamesArr = gamesData?.data || (Array.isArray(gamesData) ? gamesData : []);
        const tablesArr = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
        const sessionsArr = activeSessionsData?.data || (Array.isArray(activeSessionsData) ? activeSessionsData : []);
        const reservationsArr = reservationsData?.data || (Array.isArray(reservationsData) ? reservationsData : []);
        const menuArr = menuData?.data || (Array.isArray(menuData) ? menuData : []);

        setGames(gamesArr);
        setTables(tablesArr);
        setActiveSessions(sessionsArr);
        setReservations(reservationsArr);
        setMenuItems(menuArr);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load games and tables");
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filter tables when game is selected
  useEffect(() => {
    if (selectedGame) {
      const filtered = tables.filter(
        (table) => (table.gameid || table.game_id) === parseInt(selectedGame)
      ).sort((a, b) => {
        const nameA = a.name || `Table ${a.id}`;
        const nameB = b.name || `Table ${b.id}`;
        // Extract numbers for robust sorting
        const numA = parseInt(nameA.replace(/\D/g, '')) || 0;
        const numB = parseInt(nameB.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      setFilteredTables(filtered);
      setPreferredTable(""); // Reset table selection
    } else {
      setFilteredTables([]);
      setPreferredTable("");
    }
  }, [selectedGame, tables]);

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setPhone("");

    setSelectedGame("");
    setPreferredTable("");
    setTimeMode("timer");
    setTimerMinutes(30);
    setFrameCount(1);
    setSetTimeValue("");
    
    setFoodCart([]); // Reset Cart
    setFoodType("prepared");
    
    setError("");
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Extracted submission logic
  const executeAdd = async () => {
    try {
      setLoading(true);
      setError("");

      await queueAPI.add({
        customername: customerName.trim(),
        phone: phone.trim(),
        members: 1,
        gameid: parseInt(selectedGame),
        preferredtableid: preferredTable ? parseInt(preferredTable) : null,
        booking_type: timeMode,
        duration_minutes: timeMode === "timer" ? timerMinutes : null,
        frame_count: timeMode === "frame" ? frameCount : null,
        set_time: timeMode === "set" ? setTimeValue : null,
        food_orders: foodCart.map(item => ({ menu_item_id: item.id, quantity: item.qty }))
      });

      // Success
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to add to queue:", err);
      setAlertModal({
         isOpen: true,
         title: "Error",
         message: err.message || "Failed to add to queue",
         type: "alert"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!selectedGame) {
      setError("Please select a game");
      return;
    }

    // AVAILABILITY CHECK (New Requirement)
    // If table is free, block queue addition
    const isTableActive = (tId) => {
        return activeSessions.some(s => String(s.tableid || s.table_id) === String(tId) && s.status === 'active');
    };

    if (preferredTable) {
        // Specific table selected
        if (!isTableActive(preferredTable)) {
             setAlertModal({
                isOpen: true,
                title: "Table Available",
                message: "This table is currently available. Please book it directly from the dashboard.",
                type: "alert" 
             });
             return;
        }
    } else {
        // No specific table, check if ANY table for this game is free
        const gameTables = tables.filter(t => String(t.gameid || t.game_id) === String(selectedGame));
        // We only care if there is AT LEAST one free table
        const freeTable = gameTables.find(t => !isTableActive(t.id));
        
        if (freeTable) {
             setAlertModal({
                isOpen: true,
                title: "Table Available",
                message: `Table "${freeTable.name}" is currently available. Please book it directly from the dashboard.`,
                type: "alert"
             });
             return;
        }
    }

    // CONFLICT CHECK
    if (preferredTable) {
        const now = new Date();
        const duration = timeMode === "timer" ? (timerMinutes || 60) : 60; // Estimate 60 for others
        
        // Determine Start Time (Now vs Late Table)
        let projectedStart = now;
        const activeSession = activeSessions.find(s => String(s.tableid || s.table_id) === String(preferredTable) && s.status === 'active');
        
        if (activeSession && (activeSession.end_time || activeSession.endtimer)) {
            const currentSessionEnd = new Date(activeSession.end_time || activeSession.endtimer);
            if (currentSessionEnd > now) {
                projectedStart = currentSessionEnd;
            }
        }

        const sessionEnd = new Date(projectedStart.getTime() + duration * 60000);

        // Find overlapping reservation for THIS table
        // Status: pending
        const conflict = reservations.find(r => {
             if (r.status !== 'pending') return false;
             if (String(r.tableId || r.table_id) !== String(preferredTable)) return false;

             const rTime = new Date(r.reservationtime || r.reservation_time || r.fromTime);
             
             // Logic: Reservation Starts BEFORE our session ends AND Reservation is in valid future
             return rTime < sessionEnd && rTime > new Date(now.getTime() - 15*60000);
        });

        if (conflict) {
             const rTime = new Date(conflict.reservationtime || conflict.reservation_time || conflict.fromTime);
             const timeStr = rTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
             // Show Alert
             setAlertModal({
                isOpen: true,
                title: "Reservation Conflict",
                message: `Table will be free at <strong>${projectedStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>.<br/>With a <strong>${duration} min</strong> session, it will end at <strong>${sessionEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>.<br/><br/>This overlaps with a reservation at <strong>${timeStr}</strong> for <strong>${conflict.customerName}</strong>.`,
                type: "confirm", // Changed to confirm type
                confirmText: "Add Anyway",
                cancelText: "Cancel",
                onConfirm: () => {
                    setAlertModal(prev => ({ ...prev, isOpen: false }));
                    executeAdd();
                },
                isHtml: true
             });
             return; // Block default flow, wait for confirm
        }
    }

    executeAdd();
  };

  if (!isOpen) return null;

  return (
    <div className="queue-modal-overlay" onClick={handleClose}>
      <div className="queue-modal" onClick={(e) => e.stopPropagation()}>
        <div className="queue-modal-header">
          <h5>Add to Queue</h5>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="queue-modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {loadingData ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <>
              {/* Customer Name */}
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="form-control"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="form-control"
                />
              </div>



              {/* Booking Type Selection */}
              <div className="form-group">
                <label>Booking Type *</label>
                <div className="booking-type-options">
                  <label>
                    <input
                      type="radio"
                      name="bookingType"
                      value="timer"
                      checked={timeMode === "timer"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Timer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bookingType"
                      value="set"
                      checked={timeMode === "set"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Set Time
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="bookingType"
                      value="frame"
                      checked={timeMode === "frame"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Frame
                  </label>
                </div>

                {/* Dynamic Inputs based on Time Mode */}
                {timeMode === "timer" && (
                   <div className="dynamic-input-group">
                      <button type="button" onClick={() => setTimerMinutes(Math.max(5, timerMinutes - 5))} className="qty-btn">-</button>
                      <input
                        type="number"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                        className="form-control minutes-input"
                      />
                      <button type="button" onClick={() => setTimerMinutes(timerMinutes + 5)} className="qty-btn">+</button>
                      <span className="time-unit-label">minutes</span>
                   </div>
                )}
                 {timeMode === "frame" && (
                   <div className="dynamic-input-group">
                      <button type="button" onClick={() => setFrameCount(Math.max(1, frameCount - 1))} className="qty-btn">-</button>
                      <span className="item-count-display">{frameCount}</span>
                      <button type="button" onClick={() => setFrameCount(frameCount + 1)} className="qty-btn">+</button>
                      <span className="time-unit-label">Frames (~{frameCount * 15} mins)</span>
                   </div>
                )}
                 {timeMode === "set" && (
                   <div className="dynamic-input-group">
                       <input
                        type="time"
                        value={setTimeValue}
                        onChange={(e) => setSetTimeValue(e.target.value)}
                        className="form-control"
                        placeholder="Target End Time (Optional)"
                      />
                   </div>
                )}
                {timeMode === "set" && (
                    <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>
                        Currently counts up (stopwatch) if left empty.
                    </small>
                )}
              </div>

              {/* Game Selection */}
              <div className="form-group">
                <label>Select Game *</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Game --</option>
                  {games.map((game) => (
                    <option key={game.gameid || game.id} value={game.gameid || game.id}>
                      {game.gamename || game.game_name || game.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Table (Optional) */}
              <div className="form-group">
                <label>Preferred Table (Optional)</label>
                <select
                  value={preferredTable}
                  onChange={(e) => setPreferredTable(e.target.value)}
                  className="form-control"
                  disabled={!selectedGame}
                >
                  <option value="">
                    {selectedGame ? "-- Any Available --" : "-- Select a game first --"}
                  </option>
                  {filteredTables.map((table) => {
                     // Calculate wait time
                     const session = activeSessions.find(s => s.tableid === table.id && s.status === 'active');
                     let statusText = "";
                     if (session) {
                         if (session.bookingtype === 'timer' && session.endtimer) {
                             const now = new Date();
                             const end = new Date(session.endtimer);
                             const diffMins = Math.ceil((end - now) / 60000);
                             statusText = diffMins > 0 ? ` (~${diffMins}m wait)` : " (Finishing soon)";
                         } else {
                             statusText = " (Occupied)";
                         }
                     }
                     return (
                        <option key={table.id} value={table.id}>
                          {table.name || `Table ${table.id}`}
                          {statusText}
                        </option>
                     );
                  })}
                </select>
              </div>

               {/* FOOD SELECTION SECTION */}
               <div className="form-divider" style={{ borderTop: '1px solid #eee', margin: '20px 0', padding: '10px 0' }}></div>
               
               <h6 style={{ marginBottom: '15px', color: '#444' }}>Add Food (Optional)</h6>
               
               {/* Type Tabs */}
               <div className="item-type-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setFoodType("prepared")}
                    style={{ 
                        flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd',
                        background: foodType === "prepared" ? '#F08626' : '#f9f9f9',
                        color: foodType === "prepared" ? '#fff' : '#444',
                        fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Prepared Food
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFoodType("packed")}
                    style={{ 
                        flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd',
                        background: foodType === "packed" ? '#F08626' : '#f9f9f9',
                        color: foodType === "packed" ? '#fff' : '#444',
                        fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Packed Food
                  </button>
               </div>

                {/* Sub-Category Filter */}
                {availableCategories.length > 0 && (
                   <div className="sub-cat-filter" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
                       <button
                          type="button"
                          onClick={() => setFoodCategory("All")}
                          style={{
                              whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                              background: foodCategory === "All" ? '#333' : '#eee',
                              color: foodCategory === "All" ? '#fff' : '#333',
                              border: 'none', cursor: 'pointer'
                          }}
                       >
                          All
                       </button>
                       {availableCategories.map(cat => (
                           <button
                              key={cat}
                              type="button"
                              onClick={() => setFoodCategory(cat)}
                              style={{
                                  whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                                  background: foodCategory === cat ? '#333' : '#eee',
                                  color: foodCategory === cat ? '#fff' : '#333',
                                  border: 'none', cursor: 'pointer'
                              }}
                           >
                              {cat}
                           </button>
                       ))}
                   </div>
                )}


               {/* Food List */}
               <div className="modal-food-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
                   {filteredFood.length === 0 ? (
                       <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '20px' }}>No items found in this category</p>
                   ) : (
                       filteredFood.map(item => {
                           const inCart = foodCart.find(c => c.id === item.id);
                           const qty = inCart ? inCart.qty : 0;
                           return (
                               <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f5f5f5' }}>
                                   <div>
                                       <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{item.name}</div>
                                       <div style={{ fontSize: '12px', color: '#666' }}>₹{item.price}</div>
                                   </div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                       {qty > 0 ? (
                                           <>
                                             <button type="button" onClick={() => updateFoodCart(item, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }}>-</button>
                                             <span style={{ fontSize: '13px', fontWeight: '600' }}>{qty}</span>
                                             <button type="button" onClick={() => updateFoodCart(item, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }}>+</button>
                                           </>
                                       ) : (
                                           <button 
                                              type="button" 
                                              onClick={() => updateFoodCart(item, 1)}
                                              style={{ padding: '4px 12px', borderRadius: '6px', background: '#f8f8f8', border: '1px solid #ddd', fontSize: '12px', fontWeight: '600', color: '#333', cursor: 'pointer' }}
                                           >
                                              Add
                                           </button>
                                       )}
                                   </div>
                               </div>
                           );
                       })
                   )}
               </div>
               

               {/* Cart Summary (Tiny) */}
               {foodCart.length > 0 && (
                   <div className="mini-cart-summary" style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px' }}>
                       <strong>Selected Items:</strong> {foodCart.map(i => `${i.name} x${i.qty}`).join(', ')}
                   </div>
               )}

            </>
          )}

           <div className="queue-modal-footer">
             <button type="button" className="cancel-btn" onClick={handleClose}>
               Cancel
             </button>
             <button type="submit" className="submit-btn" disabled={loading || loadingData}>
               {loading ? "Adding..." : "Add to Queue"}
             </button>
           </div>
         </form>
      </div>

      <ConfirmationModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        onConfirm={alertModal.onConfirm}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        isHtml={alertModal.isHtml}
      />
    </div>
  );
};

export default QueueModal;

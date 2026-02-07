import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, reservationsAPI, walletsAPI, menuAPI } from "../../services/api";
import "../../styles/reservationModal.css";

const ReservationModal = ({ isOpen, onClose, onSuccess, reservationToEdit = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Missing State Declarations
  const [loadingData, setLoadingData] = useState(false);
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  
  // Booking Type State
  const [bookingType, setBookingType] = useState("timer"); // 'timer', 'set', 'frame'
  const [frameCount, setFrameCount] = useState(1);
  const [setTimeValue, setSetTimeValue] = useState("");
  
  const [notes, setNotes] = useState("");

  // Payment Step State
  const [step, setStep] = useState('booking'); // 'booking', 'payment'
  const [createdResId, setCreatedResId] = useState(null);
  const [paymentOption, setPaymentOption] = useState(null); // 'now', 'later'
  const [advanceAmount, setAdvanceAmount] = useState("");
  
  // Wallet & Payment Mode State
  const [paymentMode, setPaymentMode] = useState("cash"); // 'cash', 'upi', 'wallet'
  const [memberId, setMemberId] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [memberChecked, setMemberChecked] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

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

  // Fetch games and tables on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [gamesData, tablesData, menuData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
          menuAPI.getAll()
        ]);

        const gamesArr = gamesData?.data || (Array.isArray(gamesData) ? gamesData : []);
        const tablesArr = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
        const menuArr = menuData?.data || (Array.isArray(menuData) ? menuData : []);

        // Debug: Log table pricing to ensure we have the right data
        console.log("ReservationModal Debug: Tables Loaded", tablesArr.map(t => ({
             id: t.id, 
             name: t.name, 
             price: t.pricePerMin ?? t.pricepermin ?? t.price_per_min,
             frame: t.frameCharge ?? t.framecharge ?? t.frame_charge
        })));

        setGames(gamesArr);
        setTables(tablesArr);
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
      
      if (reservationToEdit) {
          // EDIT MODE: Populate fields
          setCustomerName(reservationToEdit.customerName || reservationToEdit.customer_name || "");
          setCustomerPhone(reservationToEdit.customerPhone || reservationToEdit.customer_phone || "");
          
          // Table & Game
          const tId = reservationToEdit.tableId || reservationToEdit.tableid || reservationToEdit.table_id;
          const gId = reservationToEdit.gameId || reservationToEdit.gameid || reservationToEdit.game_id || 
                      (reservationToEdit.TableAsset?.gameid) || (reservationToEdit.TableAsset?.game_id);
          
          if (gId) setSelectedGame(String(gId));
          if (tId) setSelectedTable(String(tId));

          // Date & Time
          const fromTime = reservationToEdit.reservationtime || reservationToEdit.reservation_time || reservationToEdit.fromTime;
          if (fromTime) {
              const dt = new Date(fromTime);
              setReservationDate(dt.toISOString().split('T')[0]);
              setStartTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
          }

          // Booking Details
          const bType = reservationToEdit.booking_type || 'timer';
          setBookingType(bType);
          setDurationMinutes(reservationToEdit.durationminutes || reservationToEdit.duration_minutes || 60);
          setFrameCount(reservationToEdit.frame_count || 1);
          setSetTimeValue(reservationToEdit.set_time || "");
          setNotes(reservationToEdit.notes || "");
          
          // Load Food (if needed, but structure is tricky. Assume empty or parse if exists)
          // For now, assume empty on edit
          setFoodCart([]); 

      } else {
          // CREATE MODE: Defaults
          // Set default date to today (Local Time)
          const now = new Date();
          const localDate = [
              now.getFullYear(),
              String(now.getMonth() + 1).padStart(2, '0'),
              String(now.getDate()).padStart(2, '0')
          ].join('-');
          
          setReservationDate(localDate);
      }
    }
  }, [isOpen, reservationToEdit]);


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
      setSelectedTable(""); // Reset table selection
    } else {
      setFilteredTables([]);
      setSelectedTable("");
    }
  }, [selectedGame, tables]);

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setSelectedGame("");
    setSelectedTable("");
    setReservationDate(new Date().toISOString().split("T")[0]);
    setStartTime("");
    setDurationMinutes(60);

    setBookingType("timer");
    setFrameCount(1);
    setSetTimeValue("");
    setNotes("");
    setError("");

    // Reset payment steps
    setStep('booking');
    setCreatedResId(null);
    setPaymentOption(null);
    setAdvanceAmount("");
    
    // Reset Wallet/Mode
    setPaymentMode("cash");
    setMemberId("");
    setWalletBalance(null);
    setMemberChecked(false);
  };

  // Auto-calculate advance amount when entering payment step
  useEffect(() => {
     if (step === 'payment' && (paymentOption === 'now' || paymentOption === 'half')) {
         const tableObj = tables.find(t => String(t.id) === String(selectedTable));
         let total = 0;
         
         // Robust property access
         const pricePerMin = tableObj ? Number(
             tableObj.pricePerMin ?? 
             tableObj.pricepermin ?? 
             tableObj.price_per_min ?? 
             0
         ) : 0;
         
         const frameCharge = tableObj ? Number(
             tableObj.frameCharge ?? 
             tableObj.framecharge ?? 
             tableObj.frame_charge ?? 
             0
         ) : 0;

         if (bookingType === 'timer') {
             total = (durationMinutes || 0) * pricePerMin;
         } else if (bookingType === 'frame') {
             total = (frameCount || 0) * frameCharge;
         }

         if (total > 0) {
             if (paymentOption === 'now') {
                 setAdvanceAmount(total);
             } else {
                 setAdvanceAmount(Math.ceil(total / 2));
             }
         } else {
             setAdvanceAmount("");
         }
     }
  }, [step, paymentOption, durationMinutes, frameCount, bookingType, selectedTable, tables]);

  // Check member wallet balance
  const handleCheckMember = async () => {
    if (!memberId.trim()) {
      setError("Please enter a Member ID");
      return;
    }

    try {
      setWalletLoading(true);
      setError("");
      const walletData = await walletsAPI.getByCustomerId(memberId);
      // Ensure we treat balance as number
      setWalletBalance(Number(walletData.balance || 0));
      setMemberChecked(true);
    } catch (err) {
      console.error("Wallet check failed:", err);
      setError("Member not found or no wallet exists");
      setWalletBalance(null);
      setMemberChecked(false);
    } finally {
      setWalletLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 'booking') {
        // Validation
        if (!customerName.trim()) {
            setError("Customer name is required");
            return;
        }
        if (!selectedGame) {
            setError("Please select a game");
            return;
        }
        if (!selectedTable) {
            setError("Please select a table");
            return;
        }
        if (!reservationDate) {
            setError("Please select a date");
            return;
        }
        if (!startTime) {
            setError("Please select a time");
            return;
        }

        // IF EDITING: Update immediately (Skip payment step mostly, or assume payment is handled separately)
        if (reservationToEdit) {
             try {
                setLoading(true);
                setError("");
                
                const updatePayload = {
                    customer_name: customerName.trim(),
                    customer_phone: customerPhone.trim(),
                    game_id: parseInt(selectedGame),
                    table_id: parseInt(selectedTable),
                    reservation_date: reservationDate,
                    start_time: startTime,
                    duration_minutes: bookingType === "timer" ? durationMinutes : null,
                    booking_type: bookingType,
                    frame_count: bookingType === "frame" ? frameCount : null,
                    set_time: bookingType === "set" ? setTimeValue : null,
                    notes: notes.trim(),
                };

                await reservationsAPI.update(reservationToEdit.id, updatePayload);
                
                resetForm();
                onSuccess?.();
                onClose();
             } catch (err) {
                console.error("Failed to update reservation:", err);
                if (err.response && err.response.status === 409) {
                     setError(err.response.data.message || "Time slot conflict");
                } else {
                     setError(err.message || "Failed to update reservation");
                }
             } finally {
                setLoading(false);
             }
             return;
        }

        // CREATE MODE: Transition to payment step
        setStep('payment');
    } else if (step === 'payment') {
        if (!paymentOption) {
            setError("Please select a payment option");
            return;
        }

        // Prepare reservation data
        const reservationPayload = {
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            game_id: parseInt(selectedGame),
            table_id: parseInt(selectedTable),
            reservation_date: reservationDate,
            start_time: startTime,
            duration_minutes: bookingType === "timer" ? durationMinutes : null,
            booking_type: bookingType,
            frame_count: bookingType === "frame" ? frameCount : null,
            set_time: bookingType === "set" ? setTimeValue : null,
            notes: notes.trim(),
            food_orders: foodCart.map(item => ({ menu_item_id: item.id, quantity: item.qty }))
        };

        // Handle Payment Note & Wallet Deduction
        if (paymentOption === 'now' || paymentOption === 'half') {
            if (!advanceAmount || parseFloat(advanceAmount) <= 0) {
                setError("Please enter a valid amount");
                return;
            }

            // Wallet Validation & Deduction
            if (paymentMode === 'wallet') {
                 if (!memberChecked || walletBalance === null) {
                    setError("Please verify Member ID for wallet payment");
                    return;
                 }
                 if (walletBalance < parseFloat(advanceAmount)) {
                    // Allow negative balance with confirmation
                    const deficit = parseFloat(advanceAmount) - walletBalance;
                    const confirmMsg = `Insufficient wallet balance. Wallet will go negative by ₹${deficit.toFixed(2)}. \n\nAvailable: ₹${walletBalance.toFixed(2)}\nRequired: ₹${parseFloat(advanceAmount).toFixed(2)}\n\nDo you want to proceed?`;
                    
                    if (!window.confirm(confirmMsg)) {
                        return; // Stop if cancelled
                    }
                    // If confirmed, proceed to deduction
                 }

                 try {
                    // Attempt deduction BEFORE creating reservation
                    await walletsAPI.deductMoney(memberId, parseFloat(advanceAmount));
                 } catch (walletErr) {
                    console.error("Wallet deduction failed:", walletErr);
                    setError(walletErr.message || "Wallet deduction failed. Please try again.");
                    return;
                 }
            }

            // Generate Note Tag based on mode
            let sourceTag = "CASH";
            if (paymentMode === 'upi') sourceTag = "UPI";
            if (paymentMode === 'wallet') sourceTag = "WALLET";

            // We preserve 'PAID_ADVANCE' / 'PAID_HALF' context? 
            // The user requested specific tags: [PAID_CASH: ...], [PAID_UPI: ...], [PAID_WALLET: ...]
            // This replaces the old format `[PAID_ADVANCE: ...]`.
            
            const paymentTag = `PAID_${sourceTag}`; 
            const paymentNote = `[${paymentTag}: ${advanceAmount}]`;
            
            reservationPayload.notes = reservationPayload.notes 
                ? `${reservationPayload.notes}\n${paymentNote}` 
                : paymentNote;
        }

        try {
            setLoading(true);
            setError("");
            
            // Create Reservation (Single Call)
            await reservationsAPI.create(reservationPayload);

            // Finish
            resetForm();
            onSuccess?.();
            onClose();
        } catch(err) {
            console.error("Failed to create reservation:", err);
            if (err.response && err.response.status === 409) {
                 setError(err.response.data.message || "Time slot conflict");
            } else {
                 setError(err.message || "Failed to create reservation");
            }
        } finally {
            setLoading(false);
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reservation-modal-overlay" onClick={handleClose}>
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reservation-modal-header">
          <h5>{step === 'booking' ? "New Reservation" : "Payment Options"}</h5>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {step === 'booking' ? (
              // BOOKING FORM STEP
             loadingData ? (
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

                  {/* Customer Phone */}
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="form-control"
                    />
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

                  {/* Table Selection */}
                  <div className="form-group">
                    <label>Select Table *</label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="form-control"
                      disabled={!selectedGame}
                    >
                      <option value="">
                        {selectedGame ? "-- Select Table --" : "-- Select a game first --"}
                      </option>
                      {filteredTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name || `Table ${table.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Reservation Date *</label>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        min={[
                            new Date().getFullYear(),
                            String(new Date().getMonth() + 1).padStart(2, '0'),
                            String(new Date().getDate()).padStart(2, '0')
                        ].join('-')}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Booking Type Selection */}
                  <div className="form-group">
                    <label>Booking Type *</label>
                    <div className="booking-type-options">
                      <label className={`type-option ${bookingType === "timer" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="bookingType"
                          value="timer"
                          checked={bookingType === "timer"}
                          onChange={(e) => setBookingType(e.target.value)}
                        />
                        Timer (Duration)
                      </label>
                      <label className={`type-option ${bookingType === "set" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="bookingType"
                          value="set"
                          checked={bookingType === "set"}
                          onChange={(e) => setBookingType(e.target.value)}
                        />
                        Stopwatch (Set Time)
                      </label>
                      <label className={`type-option ${bookingType === "frame" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="bookingType"
                          value="frame"
                          checked={bookingType === "frame"}
                          onChange={(e) => setBookingType(e.target.value)}
                        />
                        Frame Mode
                      </label>
                    </div>
                  </div>

                  {/* Dynamic Inputs based on Booking Type */}
                  {bookingType === "timer" && (
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                        className="form-control"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={180}>3 hours</option>
                        <option value={240}>4 hours</option>
                      </select>
                    </div>
                  )}

                  {bookingType === "set" && (
                    <div className="form-group">
                      <label>Set Time (Stopwatch Limit)</label>
                      <input
                        type="time"
                        value={setTimeValue}
                        onChange={(e) => setSetTimeValue(e.target.value)}
                        className="form-control"
                        placeholder="HH:MM (Optional)"
                      />
                      <small className="form-text text-muted">
                        Leave empty for unlimited stopwatch
                      </small>
                    </div>
                  )}

                  {bookingType === "frame" && (
                    <div className="form-group">
                      <label>Number of Frames</label>
                      <div className="frame-input-group">
                        <button
                          type="button"
                          className="frame-btn"
                          onClick={() => setFrameCount(Math.max(1, frameCount - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={frameCount}
                          onChange={(e) =>
                            setFrameCount(Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="form-control frame-input"
                          min="1"
                        />
                        <button
                          type="button"
                          className="frame-btn"
                          onClick={() => setFrameCount(frameCount + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or notes..."
                      className="form-control"
                      rows={3}
                    />
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
              )
          ) : (

              // PAYMENT STEP
              <div className="payment-options-step">
                  <p className="payment-intro">Please select a payment option to confirm reservation:</p>
                  
                  <div className="payment-choices">
                      {/* Option 1: Pay Now (Auto-calc Full) */}
                      <label className={`payment-choice-card ${paymentOption === 'now' ? 'active' : ''}`}
                             onClick={() => setPaymentOption('now')}
                      >
                          <input 
                              type="radio" 
                              name="payment" 
                              value="now" 
                              checked={paymentOption === 'now'}
                              onChange={() => {}} 
                          />
                          <span className="choice-title">Pay Now</span>
                          <span className="choice-desc">Full Est. Total</span>
                      </label>

                      {/* Option 2: Pay Half (Auto-calc) */}
                      <label className={`payment-choice-card ${paymentOption === 'half' ? 'active' : ''}`}
                             onClick={() => setPaymentOption('half')}
                      >
                          <input 
                              type="radio" 
                              name="payment" 
                              value="half" 
                              checked={paymentOption === 'half'}
                              onChange={() => {}}
                          />
                          <span className="choice-title">Pay Half</span>
                          <span className="choice-desc">50% of Est. Total</span>
                      </label>
                      
                      {/* Option 3: Pay Later */}
                      <label className={`payment-choice-card ${paymentOption === 'later' ? 'active' : ''}`}
                             onClick={() => setPaymentOption('later')}
                      >
                          <input 
                              type="radio" 
                              name="payment" 
                              value="later" 
                              checked={paymentOption === 'later'}
                              onChange={() => {}}
                          />
                          <span className="choice-title">Pay Later</span>
                          <span className="choice-desc">Skip payment</span>
                      </label>
                  </div>

                  {(paymentOption === 'now' || paymentOption === 'half') && (
                      <div className="advance-input-container">
                          
                          {/* Payment Mode Selection */}
                          <div className="payment-mode-selector" style={{ marginBottom: '15px' }}>
                             <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#555' }}>Payment Mode</label>
                             <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="button"
                                    onClick={() => setPaymentMode('cash')}
                                    className={`mode-btn ${paymentMode === 'cash' ? 'active' : ''}`}
                                    style={{ 
                                        padding: '8px 16px', 
                                        border: paymentMode === 'cash' ? '2px solid #f08626' : '1px solid #ddd',
                                        background: paymentMode === 'cash' ? '#fff8f3' : '#fff',
                                        color: paymentMode === 'cash' ? '#f08626' : '#555',
                                        borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Cash
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPaymentMode('upi')}
                                    className={`mode-btn ${paymentMode === 'upi' ? 'active' : ''}`}
                                    style={{ 
                                        padding: '8px 16px', 
                                        border: paymentMode === 'upi' ? '2px solid #f08626' : '1px solid #ddd',
                                        background: paymentMode === 'upi' ? '#fff8f3' : '#fff',
                                        color: paymentMode === 'upi' ? '#f08626' : '#555',
                                        borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    UPI
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPaymentMode('wallet')}
                                    className={`mode-btn ${paymentMode === 'wallet' ? 'active' : ''}`}
                                    style={{ 
                                        padding: '8px 16px', 
                                        border: paymentMode === 'wallet' ? '2px solid #f08626' : '1px solid #ddd',
                                        background: paymentMode === 'wallet' ? '#fff8f3' : '#fff',
                                        color: paymentMode === 'wallet' ? '#f08626' : '#555',
                                        borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Wallet
                                </button>
                             </div>
                          </div>

                          {/* Wallet Check UI */}
                          {paymentMode === 'wallet' && (
                             <div className="wallet-check-box" style={{ marginBottom: '15px', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                 <div style={{ display: 'flex', gap: '10px' }}>
                                     <input 
                                        type="text" 
                                        placeholder="Member ID"
                                        value={memberId}
                                        onChange={(e) => { setMemberId(e.target.value); setMemberChecked(false); }}
                                        className="form-control"
                                        style={{ flex: 1 }}
                                     />
                                     <button 
                                        type="button" 
                                        onClick={handleCheckMember}
                                        disabled={walletLoading}
                                        style={{ background: '#333', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer' }}
                                     >
                                         {walletLoading ? '...' : 'Check'}
                                     </button>
                                 </div>
                                 {memberChecked && walletBalance !== null && (
                                     <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '600', color: walletBalance >= parseFloat(advanceAmount || 0) ? '#10b981' : '#ef4444' }}>
                                         Balance: ₹{walletBalance.toFixed(2)}
                                     </div>
                                 )}
                             </div>
                          )}

                          <label>
                             {paymentOption === 'half' ? 'Calculated Advance (50%)' : 'Calculated Full Amount'}
                          </label>
                          <div className="input-with-icon">
                             <span className="currency-symbol">₹</span>
                             <input 
                                type="number" 
                                value={advanceAmount}
                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                placeholder="0.00"
                                className="form-control"
                                min="0"
                             />
                          </div>
                          {paymentOption === 'half' && advanceAmount > 0 && (
                            <small className="text-muted d-block mt-2">
                                Estimated Total: ₹{advanceAmount * 2}
                            </small>
                          )}
                      </div>
                  )}
              </div>
          )}

          <div className="reservation-modal-footer">
            {step === 'booking' ? (
                <>
                    <button type="button" className="cancel-btn" onClick={handleClose}>
                    Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading || loadingData}>
                    {loading ? (reservationToEdit ? "Updating..." : "Creating...") : (reservationToEdit ? "Update Reservation" : "Create Reservation")}
                    </button>
                </>
            ) : (
                <>
                   {/* In Payment Step, Back allows editing details */}
                    <button type="button" className="cancel-btn" onClick={() => setStep('booking')}>
                        Back
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading || !paymentOption}>
                        {loading ? "Confirming..." : "Confirm & Create"}
                    </button>
                </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;

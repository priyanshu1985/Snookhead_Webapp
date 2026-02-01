import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, queueAPI, activeTablesAPI } from "../../services/api";
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
  const [loadingData, setLoadingData] = useState(true);

  // Fetch games and tables on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [gamesData, tablesData, activeSessionsData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
          activeTablesAPI.getAll(),
        ]);

        const gamesArr = gamesData?.data || (Array.isArray(gamesData) ? gamesData : []);
        const tablesArr = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
        const sessionsArr = activeSessionsData?.data || (Array.isArray(activeSessionsData) ? activeSessionsData : []);

        setGames(gamesArr);
        setTables(tablesArr);
        setActiveSessions(sessionsArr);
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
    setError("");
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
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
      });

      // Success
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to add to queue:", err);
      setError(err.message || "Failed to add to queue");
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

export default QueueModal;

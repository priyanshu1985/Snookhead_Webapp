import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { gamesAPI, tablesAPI, queueAPI, activeTablesAPI } from "../../services/api";
import "../../styles/addqueue.css";

const AddQueue = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  // Time selection (identical to TableBooking)
  const [timeMode, setTimeMode] = useState("timer"); // timer, set, frame
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [setTimeValue, setSetTimeValue] = useState("");
  const [frameCount, setFrameCount] = useState(1);

  // Data state
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Fetch games on mount
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
        setError("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter tables for selected game
  const filteredTables = selectedGame
    ? tables.filter((t) => (t.gameid || t.game_id) === selectedGame)
    : [];

  // Calculate wait time status
  const getWaitTimeStatus = (tableId) => {
    const session = activeSessions.find(s => s.tableid === tableId && s.status === 'active');
    if (!session) return { text: "Available", color: "#28a745", minutes: 0 };

    if (session.bookingtype === 'set' || session.booking_type === 'set') { // Stopwatch
       return { text: "Occupied (Stopwatch)", color: "#dc3545", minutes: null };
    }
    
    if (session.bookingtype === 'frame' || session.booking_type === 'frame') {
        return { text: "Occupied (Frame)", color: "#dc3545", minutes: null };
    }

    if (session.endtimer) {
      const now = new Date();
      const end = new Date(session.endtimer);
      const diffMs = end - now;
      const diffMins = Math.ceil(diffMs / 60000);
      
      if (diffMins <= 0) return { text: "Finishing soon", color: "#ffc107", minutes: 0 };
      return { text: `~${diffMins} mins wait`, color: "#ffc107", minutes: diffMins };
    }

    return { text: "Occupied", color: "#dc3545", minutes: null };
  };

  const selectedTableStatus = selectedTable ? getWaitTimeStatus(selectedTable) : null;
  const estimatedStartTime = selectedTableStatus?.minutes !== null && selectedTableStatus?.minutes >= 0
    ? new Date(new Date().getTime() + selectedTableStatus.minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!customerName.trim()) {
      setError("Please enter customer name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter phone number");
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
        gameid: selectedGame,
        preferredtableid: selectedTable || null,
        booking_type: timeMode,
        duration_minutes: timeMode === "timer" ? timerMinutes : null,
        frame_count: timeMode === "frame" ? frameCount : null,
        set_time: timeMode === "set" ? setTimeValue : null,
      });

      // Success - navigate back to queue
      navigate("/queue");
    } catch (err) {
      console.error("Failed to add to queue:", err);
      setError(err.message || "Failed to add to queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="add-queue-page">
          {/* Header */}
          <h5 className="page-header" onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            ← Add to Queue
          </h5>

          {/* Tabs */}
          <div className="queue-tabs">
            <button className="active">QUEUE</button>
            <button onClick={() => navigate("/bookings/upcoming-reservation")}>
              UPCOMING RESERVATION
            </button>
          </div>

          {/* Error */}
          {error && <div className="alert alert-danger">{error}</div>}

          {loadingData ? (
            <div className="loading-state">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Customer Info */}
              <div className="form-section">
                <h6>Customer Information</h6>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="form-control"
                    />
                  </div>
                </div>

              </div>

              {/* Time Selection */}
              <div className="form-section">
                <h6>Booking Type *</h6>
                <div className="queue-options" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <label>
                    <input
                      type="radio"
                      name="time"
                      value="timer"
                      checked={timeMode === "timer"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Timer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="time"
                      value="set"
                      checked={timeMode === "set"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Set Time (Stopwatch)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="time"
                      value="frame"
                      checked={timeMode === "frame"}
                      onChange={(e) => setTimeMode(e.target.value)}
                    /> Select Frame
                  </label>
                </div>

                {/* Specific controls based on mode */}
                {timeMode === "timer" && (
                    <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setTimerMinutes(Math.max(5, timerMinutes - 5))}>-</button>
                      <input
                        type="number"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                      <button onClick={() => setTimerMinutes(timerMinutes + 5)}>+</button>
                      <span>minutes</span>
                    </div>
                )}
                {timeMode === "frame" && (
                     <div className="frame-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setFrameCount(Math.max(1, frameCount - 1))}>-</button>
                      <span style={{ fontWeight: 'bold' }}>{frameCount}</span>
                      <button onClick={() => setFrameCount(frameCount + 1)}>+</button>
                      <span>Frames (~{frameCount * 15} mins)</span>
                    </div>
                )}
                 {timeMode === "set" && (
                    <div className="set-time-input">
                       <p style={{fontSize: '0.9rem', color: '#666'}}>Stopwatch mode: Billing based on elapsed time.</p>
                       {/* No input needed for stopwatch/set time usually, or just a target end time? 
                           TableBooking uses setTimeValue as target end time? Or just general stopwatch?
                           User said "aset time timer and frame".
                           In TableBooking, "set" mode had a time input "Set End Time".
                       */}
                       <input
                        type="time"
                        value={setTimeValue}
                        onChange={(e) => setSetTimeValue(e.target.value)}
                        className="form-control"
                      />
                    </div>
                )}
              </div>

              {/* Game selection */}
              <div className="form-section">
                <h6>Select Game *</h6>
                <div className="game-selection">
                  {games.map((game) => {
                    const gameId = game.gameid || game.id;
                    const gameName = game.gamename || game.game_name || game.name;
                    return (
                      <div
                        className={`game-card ${selectedGame === gameId ? "selected" : ""}`}
                        key={gameId}
                        onClick={() => {
                          setSelectedGame(gameId);
                          setSelectedTable(null); // Reset table when game changes
                        }}
                      >
                        {gameName}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table selection (optional) */}
              {selectedGame && filteredTables.length > 0 && (
                <div className="form-section">
                  <h6>Preferred Table (Optional)</h6>
                  <div className="table-selection">
                    <div
                      className={`table-card ${!selectedTable ? "selected" : ""}`}
                      onClick={() => setSelectedTable(null)}
                    >
                      Any Available
                    </div>
                    {filteredTables.map((table) => (
                      <div
                        className={`table-card ${selectedTable === table.id ? "selected" : ""} ${table.status !== "available" ? "unavailable" : ""}`}
                        key={table.id}
                        onClick={() => setSelectedTable(table.id)}
                      >
                        {table.name || `Table ${table.id}`}
                        {table.status !== "available" && (
                          <span className="status-badge">{table.status}</span>
                        )}
                         {/* Estimation Badge */}
                        {table.status !== "available" && (
                           <div style={{ fontSize: '0.8rem', marginTop: '5px', color: getWaitTimeStatus(table.id).color }}>
                             {getWaitTimeStatus(table.id).text}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
               {/* Summary of Est Time */}
              {selectedTable && estimatedStartTime && (
                  <div className="form-section">
                      <div style={{ backgroundColor: '#e9f7ef', padding: '10px', borderRadius: '5px', border: '1px solid #28a745', color: '#155724' }}>
                          <strong>Estimated Start Time: </strong> {estimatedStartTime}
                      </div>
                  </div>
              )}

              {/* Footer */}
              <div className="queue-footer">
                <button
                  className="cancel-btn"
                  onClick={() => navigate("/queue")}
                >
                  Cancel
                </button>
                <button
                  className="next-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add to Queue"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQueue;

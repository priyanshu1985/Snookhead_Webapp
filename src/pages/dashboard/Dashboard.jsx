import { useState, useEffect, useContext, useRef } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { gamesAPI, tablesAPI, activeTablesAPI, reservationsAPI, queueAPI, getGameImageUrl } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import { playAlertSound } from "../../utils/soundUtils";
import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/common/ConfirmationModal";

// New component to handle individual table card state (image rotation)
// New component to handle individual table card state (image rotation)
const TableCardItem = ({ 
  table, 
  selectedGame, 
  handleTableClick, 
  getStatusClass, 
  getActiveSession, 
  getReservationForTable, 
  formatResTime, 
  getSessionDisplayString,
  currentTime 
}) => {
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);
    const lastPlayedSessionId = useRef(null);

    const session = getActiveSession(table.id);
    const hasActiveSession = !!session;
    const bookedBy = session ? (session.customer_name || session.customername) : null;
    const displayStatus = hasActiveSession ? "occupied" : table.status;
    const bookingLabel = "Playing"; 
    
    const upcomingRes = !hasActiveSession ? getReservationForTable(table.id) : null;
    const isReserved = !!upcomingRes;

    useEffect(() => {
        if (!session || session.booking_type !== 'timer' || !session.end_time) {
            setIsUrgent(false);
            return;
        }

        const endTime = new Date(session.end_time);
        const diffMs = endTime - currentTime;
        const minutesLeft = diffMs / 60000;

        if (minutesLeft <= 3 && minutesLeft > 0) {
             setIsUrgent(true);
             const sId = session.activeid || session.active_id;
             if (lastPlayedSessionId.current !== sId) {
                 playAlertSound();
                 lastPlayedSessionId.current = sId;
             }
        } else {
             setIsUrgent(false);
             if (minutesLeft > 3) {
                 lastPlayedSessionId.current = null;
             }
        }
    }, [session, currentTime]);

    return (
        <div
        className={`table-card ${getStatusClass(displayStatus)} ${isReserved ? 'has-reservation' : ''} ${isUrgent ? 'urgent-alert' : ''}`}
        onClick={() => handleTableClick(table)}
        >
            {/* Game Image with Auto-Rotation */}
            {(selectedGame?.image_key || selectedGame?.imagekey) && (
                <img
                className={`table-card-img ${isHorizontal ? 'rotated-vertical' : ''}`}
                src={getGameImageUrl(selectedGame.image_key || selectedGame.imagekey)}
                alt={selectedGame.game_name || selectedGame.gamename}
                onLoad={(e) => {
                    // Check if image is horizontal (width > height)
                    if (e.target.naturalWidth > e.target.naturalHeight) {
                        setIsHorizontal(true);
                    }
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                }}
                />
            )}

            {/* Table Number */}
            <div className="table-number">
                {table.name}
            </div>

            {/* Show live timer if active session exists */}
            {hasActiveSession && (
                <div className="active-timer-badge">
                <span>{getSessionDisplayString(session)}</span>
                </div>
            )}

            {/* Show booked by info if active session exists */}
            {hasActiveSession && bookedBy && (
                <div className="table-booked-info">
                <span className="booked-label">
                    {bookingLabel}
                </span>
                <span className="booked-name">{bookedBy}</span>
                </div>
            )}

            {/* Show Reservation Badge if available but reserved */}
            {isReserved && !hasActiveSession && (
                <div className="reservation-badge">
                    <span className="res-label">RESERVED</span>
                    <span className="res-time">{formatResTime(upcomingRes)}</span>
                    <span className="res-name">{upcomingRes.customerName || upcomingRes.customer_name}</span>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [todaysReservations, setTodaysReservations] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date()); // For live timer ticks
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert", // alert | confirm
    onConfirm: null,
    confirmText: "OK"
  });

  // Track triggered reservations to prevent loops
  const triggeredReservationsRef = useRef(new Set());

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "alert",
      onConfirm: null,
      confirmText: "OK"
    });
  };

  const showConfirm = (title, message, onConfirm, confirmText = "Yes, Start") => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
      confirmText,
      cancelText: "Cancel",
      isHtml: true 
    });
  };

  const [queueSummary, setQueueSummary] = useState(null);

  // Drag State
  const [draggedGameIndex, setDraggedGameIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Fetch games, tables, and active sessions from API
  const fetchData = async (isBackground = false) => {
    try {
      // Only set loading on first load or manual refresh
      if (!isBackground && games.length === 0) setLoading(true);
      
      const [gamesData, tablesData, sessionsData, reservationsData, queueData] = await Promise.all([
        gamesAPI.getAll(),
        tablesAPI.getAll(),
        activeTablesAPI.getAll().catch(() => []), 
        reservationsAPI.getAll().catch(() => []),
        queueAPI.getSummary().catch(() => null),
      ]);

      // Stable Sort: Games by LocalStorage Order -> ID
      const savedOrder = JSON.parse(localStorage.getItem('gameOrder') || '[]');
      const gamesList = (Array.isArray(gamesData) ? gamesData : []).sort((a, b) => {
          const idA = a.gameid || a.id;
          const idB = b.gameid || b.id;
          const indexA = savedOrder.indexOf(idA);
          const indexB = savedOrder.indexOf(idB);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          return idA - idB;
      });

      // Stable Sort: Tables by "Table X" number, or fallback to ID
      const tablesListRaw = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
      const tablesList = tablesListRaw.sort((a, b) => {
           // Try to extract number from name "Table 1" -> 1
           const nameA = a.name || "";
           const nameB = b.name || "";
           const numA = parseInt(nameA.replace(/\D/g, '')) || 0;
           const numB = parseInt(nameB.replace(/\D/g, '')) || 0;
           
           if (numA !== numB) return numA - numB;
           return (a.id || 0) - (b.id || 0);
      });

      let sessionsList = Array.isArray(sessionsData) ? sessionsData : [];
      let reservationsList = reservationsData?.data || (Array.isArray(reservationsData) ? reservationsData : []);

      // Filter reservations: Status=Pending, Date=Today, Time >= now (or recent past)
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();
      
      const upcoming = reservationsList.filter(r => {
        if (r.status !== 'pending') return false;
        const rTime = new Date(r.reservationtime || r.reservation_time || r.fromTime);
        if (rTime.getFullYear() !== todayYear) return false;
        if (rTime.getMonth() !== todayMonth) return false;
        if (rTime.getDate() !== todayDate) return false;
        const diffMinutes = (rTime - now) / 60000;
        return diffMinutes <= 10 && diffMinutes > -30;
      });

      setTodaysReservations(upcoming);
      
      // Update Queue Summary
      setQueueSummary(queueData);

      // Normalize session keys
      sessionsList = sessionsList.map(s => ({
        ...s,
        active_id: s.activeid || s.active_id,
        table_id: s.tableid || s.table_id,
        game_id: s.gameid || s.game_id,
        start_time: s.starttime || s.start_time,
        end_time: s.endtimer || s.bookingendtime || s.booking_end_time,
        booking_type: s.bookingtype || s.booking_type || 'timer',
        frame_count: s.framecount || s.frame_count || 0,
        duration_minutes: s.durationminutes || s.duration_minutes,
      }));

      // Only re-set games if length changed to avoid jitter during drag (or handle differently)
      // Actually, if we are dragging, we don't want fetch to overwrite our optimistic state
      // unless the set of games actually changed (added/removed).
      // For now, simpler check: if local state length matches and IDs present, maybe keep order?
      // But user wants to update FROM local storage on load.
      // If we just overwrite, it respects local storage sort, so it's fine.
      
      // OPTIMIZATION: If we are midway dragging something, don't reset state?
      // Since fetch happens on poll (every 5s), it might snap back if we are slow.
      // But we just sorted by savedOrder. If drag updates savedOrder immediately, then poll will respect it.
      setGames(gamesList);
      
      setTables(tablesList);
      setActiveSessions(sessionsList);

      if (!selectedGame && gamesList.length > 0) {
        setSelectedGame(gamesList[0]);
      }
      setError("");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Drag Handlers
  const handleDragStart = (e, index) => {
    setDraggedGameIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set custom drag image if needed
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Necessary for Drop
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
        setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (draggedGameIndex === null || draggedGameIndex === dropIndex) return;

    const newGames = [...games];
    const [draggedItem] = newGames.splice(draggedGameIndex, 1);
    newGames.splice(dropIndex, 0, draggedItem);

    setGames(newGames);
    setDraggedGameIndex(null);
    

    // Persist new order
    const newOrder = newGames.map(g => g.gameid || g.id);
    localStorage.setItem('gameOrder', JSON.stringify(newOrder));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data (Polling)
  useEffect(() => {
    // Polling Function
    const pollData = () => {
        if (!loading) fetchData(true);
    };

    const intervalId = setInterval(pollData, 5000); // Check every 5s

    // Listen for global updates
    const handleTableUpdate = () => {
        console.log("Received table update event, refreshing Dashboard...");
        fetchData(true);
    };
    window.addEventListener('table-data-changed', handleTableUpdate);

    // Live timer ticker
    const timerInterval = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    return () => {
        clearInterval(intervalId);
        clearInterval(timerInterval);
        window.removeEventListener('table-data-changed', handleTableUpdate);
    };
  }, []); // Run once on mount

  // Reservation Auto-Trigger Interval
  useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        todaysReservations.forEach(res => {
             if (res.status !== 'pending') return;
             const rId = String(res.id);
             if (triggeredReservationsRef.current.has(rId)) return;

             const rTime = new Date(res.reservationtime || res.reservation_time || res.fromTime);
             const diffMinutes = (now - rTime) / 60000;
             
             if (diffMinutes >= 0 && diffMinutes < 30) {
                 const tableId = res.tableId || res.table_id;
                 const table = tables.find(t => String(t.id) === String(tableId));
                 if (table && table.status === 'available') {
                     triggeredReservationsRef.current.add(rId);
                     handleStartSession(res, table);
                 }
             }
        });
      }, 5000);
      return () => clearInterval(interval);
  }, [todaysReservations, tables]);

  // Check for Queue Waiters (Auto-Prompt)
  useEffect(() => {
     if (!queueSummary || !queueSummary.waiting || queueSummary.waiting.length === 0) return;
     if (modalConfig.isOpen) return; // Wait for modal to close

     // Organize queue by game
     const queueByGame = {};
     queueSummary.waiting.forEach(entry => {
         const gid = entry.gameid;
         if (!queueByGame[gid]) queueByGame[gid] = [];
         queueByGame[gid].push(entry);
     });

     // Check available tables
     for (const table of tables) {
         if (table.status !== 'available') continue;

         const gameId = table.gameid || table.game_id;
         const queueForGame = queueByGame[gameId];

         if (queueForGame && queueForGame.length > 0) {
             const nextPerson = queueForGame[0];
             const promptKey = `queue-prompt-${table.id}-${nextPerson.id}`;
             
             // Check if already triggered
             if (triggeredReservationsRef.current.has(promptKey)) continue;

             // Don't prompt if there is a blocking reservation very soon
             const tableRes = todaysReservations.find(r => String(r.tableId || r.table_id) === String(table.id));
             if (tableRes) continue;

             // Trigger Prompt
             triggeredReservationsRef.current.add(promptKey);

             showConfirm(
                "Table Available from Queue", 
                `Table <strong>${table.name}</strong> is now free and <strong>${nextPerson.customername}</strong> is next in queue.<br/><br/>Seat them now?`,
                async () => {
                     try {
                          const result = await queueAPI.next(gameId);
                          if (result.success) {
                              showAlert("Success", `Seated ${nextPerson.customername} at ${table.name}`);
                              fetchData(true);
                          }
                     } catch (err) {
                          showAlert("Error", "Failed to seat queue member: " + err.message);
                     }
                },
                "Yes, Seat Now"
             );
             
             // Break after one prompt to avoid pop-up storm
             break; 
         }
     }
  }, []); // Mount only
  
  // Reservation Auto-Trigger Interval (Separated for clarity)
  useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        todaysReservations.forEach(res => {
             if (res.status !== 'pending') return;
             const rId = String(res.id);
             if (triggeredReservationsRef.current.has(rId)) return;

             const rTime = new Date(res.reservationtime || res.reservation_time || res.fromTime);
             const diffMinutes = (now - rTime) / 60000;
             
             if (diffMinutes >= 0 && diffMinutes < 30) {
                 const tableId = res.tableId || res.table_id;
                 const table = tables.find(t => String(t.id) === String(tableId));
                 if (table && table.status === 'available') {
                     triggeredReservationsRef.current.add(rId);
                     handleStartSession(res, table);
                 }
             }
        });
      }, 5000);
      return () => clearInterval(interval);
  }, [todaysReservations, tables]);

  // Filter tables by selected game

  // Filter tables by selected game
  const getTablesForGame = (gameId) => {
    return tables.filter((table) => {
       const tableGameId = table.game_id || table.gameid;
       return String(tableGameId) === String(gameId);
    });
  };

  const selectedGameId = selectedGame ? (selectedGame.game_id || selectedGame.gameid) : null;
  const currentTables = selectedGameId 
    ? getTablesForGame(selectedGameId).sort((a, b) => a.id - b.id) 
    : [];

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "status-available";
      case "reserved":
      case "occupied":
        return "status-reserved";
      case "maintenance":
        return "status-maintenance";
      default:
        return "";
    }
  };

  // Get active session for a table
  const getActiveSession = (tableId) => {
    // Filter all sessions for this table
    const tableSessions = activeSessions.filter((s) => String(s.tableid || s.table_id) === String(tableId));
    
    // If multiple sessions exist (duplicate/ghost), pick the one with highest ID (latest)
    if (tableSessions.length > 0) {
      return tableSessions.sort((a, b) => {
         const idA = a.activeid || a.active_id;
         const idB = b.activeid || b.active_id;
         return idB - idA; // Descending
      })[0];
    }
    return undefined;
  };

  // Get matching reservation for a table
  const getReservationForTable = (tableId) => {
    // Find earliest upcoming reservation for this table
    const tableRes = todaysReservations.filter(r => String(r.tableId || r.table_id) === String(tableId));
    
    if (tableRes.length === 0) return null;

    // Return the soonest one
    return tableRes.sort((a, b) => {
       const timeA = new Date(a.reservationtime || a.reservation_time || a.fromTime);
       const timeB = new Date(b.reservationtime || b.reservation_time || b.fromTime);
       return timeA - timeB;
    })[0];
  };

  // Helper to format reservation time
  const formatResTime = (r) => {
     const date = new Date(r.reservationtime || r.reservation_time || r.fromTime);
     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to get session display string (Timer or Frames)
  const getSessionDisplayString = (session) => {
      if (!session) return "";

      // Frame Mode
      if (session.booking_type === 'frame') {
          return `${session.frame_count || 0} Frames`;
      }

      // Timer Mode logic
      const start = new Date(session.start_time);
      const now = currentTime;
      
      // Check if it has a fixed duration/end time
      // 'end_time' is usually populated for fixed sessions.
      // Or check duration_minutes > 0? Let's check end_time presence.
      if (session.end_time) {
          const end = new Date(session.end_time);
          const diff = end - now; // Positive if time remaining, Negative if overtime

          const absDiff = Math.abs(diff);
          const seconds = Math.floor((absDiff / 1000) % 60);
          const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
          const hours = Math.floor((absDiff / (1000 * 60 * 60)));

          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          if (diff >= 0) {
              return `-${timeStr}`; // Remaining time (User requested "negative")
          } else {
              return `+${timeStr}`; // Overtime
          }
      } 
      
      // Stopwcath / No fixed end
      const diff = Math.max(0, now - start);
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)));

      return `+${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reusable Session Start Logic
  const handleStartSession = (reservation, table) => {
      const customerName = reservation.customerName || reservation.customer_name || "Customer";
      const timeStr = formatResTime(reservation);
      
      const confirmMessage = `
        <div style="text-align: left; margin-top: 8px;">
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Time:</strong> ${timeStr}</p>
          <p style="margin-top: 8px;">Are you sure you want to start this session?</p>
        </div>
      `;
      
      showConfirm("Start Session?", confirmMessage, async () => {
          try {
              await activeTablesAPI.start({
                  table_id: table.id,
                  game_id: table.game_id || table.gameid || selectedGame.gameid || selectedGame.game_id,
                  duration_minutes: Number(reservation.durationMinutes ?? reservation.duration_minutes ?? reservation.durationminutes ?? 60),
                  booking_type: reservation.booking_type || reservation.bookingType || reservation.bookingtype || 'timer',
                  frame_count: reservation.frame_count ?? reservation.framecount ?? reservation.frameCount,
                  set_time: reservation.set_time ?? reservation.settime ?? reservation.setTime,
                  notes: reservation.notes,
                  reservationId: reservation.id,
                  customer_name: customerName,
              });

              // Mark active locally if not auto-updated
              if (reservation.id) {
                   try {
                      await reservationsAPI.update(reservation.id, { status: 'active' }); 
                   } catch (e) { console.warn("Could not update reservation status", e); }
              }

              showAlert("Success", "Session started successfully!");
              fetchData(true); 
              
          } catch (err) {
              console.error("Failed to start reserved session", err);
              showAlert("Error", "Failed to start session: " + err.message);
          }
      }, "Start Session");
  };

  // Handle table click - navigate based on status
  const handleTableClick = async (table) => {
    const gameName = (selectedGame?.game_name || selectedGame?.gamename || "game").toLowerCase();
    
    // Check occupied status (reserved/occupied)
    if (table.status === "reserved" || table.status === "occupied") {
      // Table is reserved/occupied - go to active session screen
      const session = getActiveSession(table.id);
      
      // If we have a running session, pass its ID to ensure correct loading
      const sessionId = session ? (session.activeid || session.active_id) : "";
      
      navigate(`/session/${gameName}/${table.id}${sessionId ? `/${sessionId}` : ""}`);
    } else if (table.status === "available") {
      
      // CHECK FOR RESERVATION FIRST
      const reservation = getReservationForTable(table.id);
      
      if (reservation) {
        const customerName = reservation.customerName || reservation.customer_name || "Customer";
        const timeStr = formatResTime(reservation);
        
        const resTime = new Date(reservation.reservationtime || reservation.reservation_time || reservation.fromTime);
        const now = new Date();

        if (now < resTime) {
            showAlert("Too Early", `You can start only when the time comes exactly what the owner selected in reservation form (${timeStr}).`);
            return;
        }

        // Trigger the shared start logic
        handleStartSession(reservation, table);
        return; 
      }

      // Table is available and NO reservation (or user cancelled start) - go to booking screen
      navigate(`/tables/${gameName}/${table.id}`);
    } else {
      // Maintenance or other status - show alert
      showAlert("Maintenance", "This table is currently under maintenance");
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Sidebar Spacer - takes up space when sidebar is visible */}
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Body */}
        <div className="dashboard-content">
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <>
              {/* Games & Tables Section */}
              {games.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">🎮</div>
                  <h3 className="empty-state-title">No Games Found</h3>
                  <p className="empty-state-description">
                    Get started by creating your first game in the setup menu.
                  </p>
                  <button 
                    className="create-game-btn" 
                    onClick={() => navigate('/setup-menu')}
                  >
                    Go to Setup Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Category Tabs - Game Selection */}
                  <div className="category-tabs">
                    {games.map((game, index) => {
                      const gId = game.gameid || game.id || game.game_id;
                      const gName = game.game_name || game.gamename;
                      const isSelected = selectedGame && (selectedGame.gameid || selectedGame.id || selectedGame.game_id) === gId;
                      
                      return (
                        <button
                          key={gId || `game-${index}`}
                          className={`
                            ${isSelected ? "active" : ""} 
                            ${draggedGameIndex === index ? "dragging" : ""}
                            ${dragOverIndex === index && draggedGameIndex !== index ? "drag-over" : ""}
                          `.trim()}
                          onClick={() => setSelectedGame(game)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={() => setDragOverIndex(null)}
                          onDrop={(e) => handleDrop(e, index)}
                          title="Drag to reorder"
                        >
                          {gName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tables Grid */}
                  <div className="tables-grid">
                    {currentTables.length === 0 ? (
                      <div className="empty-table-state">
                        <p className="no-tables-text">No tables added for this game yet.</p>
                        <button 
                          className="create-game-btn small" 
                          onClick={() => navigate('/setup-menu')}
                        >
                          Add Tables
                        </button>
                      </div>
                    ) : (
                      currentTables.map((table, index) => (
                        <TableCardItem 
                            key={table.id || `table-${index}`}
                            table={table}
                            selectedGame={selectedGame}
                            handleTableClick={handleTableClick}
                            getStatusClass={getStatusClass}
                            getActiveSession={getActiveSession}
                            getReservationForTable={getReservationForTable}
                            formatResTime={formatResTime}
                            getSessionDisplayString={getSessionDisplayString}
                            currentTime={currentTime}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
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

export default Dashboard;

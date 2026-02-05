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

    const [isMuted, setIsMuted] = useState(false);
    const stopSoundRef = useRef(null);

    const session = getActiveSession(table.id);
    const hasActiveSession = !!session;
    const bookedBy = session ? (session.customer_name || session.customername) : null;
    const displayStatus = hasActiveSession ? "occupied" : table.status;
    const bookingLabel = "Playing"; 
    
    // Check for upcoming reservations
    const upcomingRes = getReservationForTable(table.id);
    
    // Logic: Only show "RESERVED" badge if within 30 mins
    let isReserved = false;
    if (upcomingRes) {
        const rTime = new Date(upcomingRes.reservationtime || upcomingRes.reservation_time || upcomingRes.fromTime || upcomingRes.fromtime || upcomingRes.start_time);
        const diff = (rTime - currentTime) / 60000;
        isReserved = diff <= 30; // Only true if starting soon
    }

    // Reset mute state when session changes or ends
    useEffect(() => {
        setIsMuted(false);
        if (stopSoundRef.current) {
            stopSoundRef.current();
            stopSoundRef.current = null;
        }
    }, [session?.activeid, session?.active_id]);

    useEffect(() => {
        if (!session || session.booking_type !== 'timer' || !session.end_time) {
            setIsUrgent(false);
            if (stopSoundRef.current) {
                stopSoundRef.current();
                stopSoundRef.current = null;
            }
            return;
        }

        const endTime = new Date(session.end_time);
        const diffMs = endTime - currentTime;
        const minutesLeft = diffMs / 60000;

        if (minutesLeft <= 3 && minutesLeft > 0) {
             setIsUrgent(true);
             const sId = session.activeid || session.active_id;
             
             // Only play if not already muted and it's a new trigger or ongoing urgent state
             if (lastPlayedSessionId.current !== sId && !isMuted) {
                 if (stopSoundRef.current) stopSoundRef.current(); // Stop previous if any
                 stopSoundRef.current = playAlertSound();
                 lastPlayedSessionId.current = sId;
             }
        } else {
             setIsUrgent(false);
             if (minutesLeft > 3) {
                 lastPlayedSessionId.current = null;
             }
             // Stop sound if we exit urgent state
             if (stopSoundRef.current) {
                stopSoundRef.current();
                stopSoundRef.current = null;
             }
        }
    }, [session, currentTime, isMuted]); // Added isMuted

    const toggleMute = (e) => {
        e.stopPropagation(); // Prevent card click
        if (isMuted) {
            setIsMuted(false);
            // Sound will restart via useEffect if still urgent
            lastPlayedSessionId.current = null; // Reset identifier to force replay
        } else {
            setIsMuted(true);
            if (stopSoundRef.current) {
                stopSoundRef.current();
                stopSoundRef.current = null;
            }
        }
    };

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

            {/* Show Reservation Badge if available but reserved OR if upcoming reservation is near (even if active) */}
            {isReserved && (
                <div className="reservation-badge">
                    <span className="res-label">RESERVED</span>
                    <span className="res-time">{formatResTime(upcomingRes)}</span>
                    <span className="res-name">{upcomingRes.customerName || upcomingRes.customer_name}</span>
                </div>
            )}

            {/* Mute Toggle for Urgent Sessions */}
            {isUrgent && (
                <button 
                    className={`mute-toggle-btn ${isMuted ? 'muted' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                    {isMuted ? "🔇" : "🔊"}
                </button>
            )}
        </div>
    );
};

// ... (Dashboard component starts here, but TableCardItem is static for now)

  // Check for Queue Waiters (Auto-Prompt) effect inside Dashboard
  // Since we are replacing lines 13-168 (TableCardItem) AND lines 435-489 (Queue Effect),
  // I must be careful. I can't replace non-contiguous blocks with ONE tool call unless I replace EVERYTHING in between.
  // The user asked for sequential edits? No, standard.
  // I will replace `TableCardItem` first (above) and then the effect in separate call?
  // Or I can replace the whole file content if needed, but it's large.
  // The instruction said "1. Update TableCardItem... 2. Update Auto-Prompt".
  // If I can't do both in one block (they are far apart), I should do 2 calls.
  // WAIT. `TableCardItem` is lines 13-168.
  // `useEffect` is lines 435-489.
  // They are far apart.
  // I will ONLY replace `TableCardItem` in this call. I will do `useEffect` in next call.


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
        activeTablesAPI.getAll(), // Allow error to propagate
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
        // Robust field reading - matching backend fix
        const rTime = new Date(r.reservationtime || r.reservation_time || r.fromTime || r.fromtime || r.start_time);
        
        if (isNaN(rTime.getTime())) return false; // Invalid date check

        if (rTime.getFullYear() !== todayYear) return false;
        if (rTime.getMonth() !== todayMonth) return false;
        if (rTime.getDate() !== todayDate) return false;
        
        // Return ALL future pending reservations for today
        const diffMinutes = (rTime - now) / 60000;
        return diffMinutes > -120; // Keep recent past too
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
             
             // Prevent multiple prompts for same reservation
             if (triggeredReservationsRef.current.has(rId)) return;

             const rTime = new Date(res.reservationtime || res.reservation_time || res.fromTime);
             // Diff in minutes: Positive = Now is AFTER reservation time
             const diffMinutes = (now - rTime) / 60000;
             
             // Trigger if time has arrived (within last 30 mins) or is about to (1 min before)
             // This gives a prompt "as schedule time arrive"
             if (diffMinutes >= -1 && diffMinutes < 30) {
                 const tableId = res.tableId || res.table_id;
                 const table = tables.find(t => String(t.id) === String(tableId));
                 
                 // Only prompt if table is actually available
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

             // Don't prompt if there is a blocking reservation within the NEW session duration
             const tableRes = todaysReservations.find(r => String(r.tableId || r.table_id) === String(table.id));
             if (tableRes) {
                 const now = new Date();
                 const rTime = new Date(tableRes.reservationtime || tableRes.reservation_time || tableRes.fromTime);
                 
                 // If reservation is already passed (shouldn't happen for pending) or very soon
                 // Check overlap: StartNow + Duration vs ResTime
                 // Use member duration or default 60m
                 const duration = nextPerson.duration_minutes || 60;
                 const sessionEnd = new Date(now.getTime() + duration * 60000);

                 // If ResTime is BEFORE our session ends, it's a conflict
                 if (rTime < sessionEnd && rTime > new Date(now.getTime() - 15*60000)) {
                    // Conflict found - don't prompt
                    continue;
                 }
             }

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
  }, [queueSummary, tables, todaysReservations]); // Added todaysReservations dependency
  


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
     const date = new Date(r.reservationtime || r.reservation_time || r.fromTime || r.fromtime || r.start_time);
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

  // Reusable Session Start Logic (Restored)
  const handleStartSession = (reservation, table) => {
      const customerName = reservation.customerName || reservation.customer_name || "Customer";
      const timeStr = formatResTime(reservation);
      
      const confirmMessage = `
        <div style="text-align: left; margin-top: 8px;">
          <p><strong>Reservation Time Arrived!</strong></p>
          <p>Customer: <strong>${customerName}</strong></p>
          <p>Time: ${timeStr}</p>
          <p style="margin-top: 8px;">Start session and assign table to <strong>${customerName}</strong>?</p>
        </div>
      `;
      
      showConfirm("Start Reservation Session", confirmMessage, async () => {
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

              // Mark active locally
              if (reservation.id) {
                   try {
                      await reservationsAPI.update(reservation.id, { status: 'active' }); 
                   } catch (e) { console.warn("Could not update reservation status", e); }
              }

              showAlert("Success", `Session started for ${customerName}`);
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
      
      // Check if there is an upcoming reservation that is "due" (Time has arrived or past)
      // "scheduled time arrive... and we clicked on that table"
      const upcomingRes = getReservationForTable(table.id);
      
      if (upcomingRes) {
          const now = new Date();
          const rTime = new Date(upcomingRes.reservationtime || upcomingRes.reservation_time || upcomingRes.fromTime);
          const diffMinutes = (now - rTime) / 60000;
          
          // If time has passed (diff > 0) OR is within 1 min (diff > -1)
          if (diffMinutes > -1) {
               // Trigger the custom start session prompt instead of booking screen
               handleStartSession(upcomingRes, table);
               return; 
          }
      }

      // Default: Go to booking screen
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

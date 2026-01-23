import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { gamesAPI, tablesAPI, activeTablesAPI, getGameImageUrl } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch games, tables, and active sessions from API
  const fetchData = async (isBackground = false) => {
    try {
      // Only set loading on first load or manual refresh
      if (!isBackground && games.length === 0) setLoading(true);
      
      const [gamesData, tablesData, sessionsData] = await Promise.all([
        gamesAPI.getAll(),
        tablesAPI.getAll(),
        activeTablesAPI.getAll().catch(() => []), // Don't fail if no active sessions
      ]);

      const gamesList = Array.isArray(gamesData) ? gamesData : [];
      const tablesList = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
      let sessionsList = Array.isArray(sessionsData) ? sessionsData : [];

      // Normalize session keys to handle DB lowercase vs frontend camelCase
      sessionsList = sessionsList.map(s => ({
        ...s,
        active_id: s.activeid || s.active_id,
        table_id: s.tableid || s.table_id,
        game_id: s.gameid || s.game_id,
        start_time: s.starttime || s.start_time,
        // endtimer is often what DB returns for 'endtimer' column, but be robust
        end_time: s.endtimer || s.bookingendtime || s.booking_end_time,
        booking_type: s.bookingtype || s.booking_type || 'timer',
        duration_minutes: s.durationminutes || s.duration_minutes,
      }));

      setGames(gamesList);
      setTables(tablesList);
      setActiveSessions(sessionsList);

      // Select first game by default if not set
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

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 5 seconds to keep UI in sync
  useEffect(() => {
    const intervalId = setInterval(() => {
        // Only fetch if not already loading to avoid overlap
        if (!loading) fetchData(true);
    }, 5000);

    // Listen for global updates (e.g. auto-release) to refresh immediately
    const handleTableUpdate = () => {
        console.log("Received table update event, refreshing Dashboard...");
        fetchData(true);
    };
    window.addEventListener('table-data-changed', handleTableUpdate);

    return () => {
        clearInterval(intervalId);
        window.removeEventListener('table-data-changed', handleTableUpdate);
    };
  }, [loading]);



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

  // Handle table click - navigate based on status
  const handleTableClick = (table) => {
    const gameName = (selectedGame?.game_name || selectedGame?.gamename || "game").toLowerCase();
    
    // Check occupied status (reserved/occupied)
    if (table.status === "reserved" || table.status === "occupied") {
      // Table is reserved/occupied - go to active session screen
      const session = getActiveSession(table.id);
      
      // If we have a running session, pass its ID to ensure correct loading
      const sessionId = session ? (session.activeid || session.active_id) : "";
      
      navigate(`/session/${gameName}/${table.id}${sessionId ? `/${sessionId}` : ""}`);
    } else if (table.status === "available") {
      // Table is available - go to booking screen
      navigate(`/tables/${gameName}/${table.id}`);
    } else {
      // Maintenance or other status - show alert
      alert("This table is currently under maintenance");
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
                      const gId = game.game_id || game.gameid;
                      const gName = game.game_name || game.gamename;
                      return (
                        <button
                          key={gId || `game-${index}`}
                          className={selectedGameId === gId ? "active" : ""}
                          onClick={() => setSelectedGame(game)}
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
                      currentTables.map((table, index) => {
                        // Find active session for this table
                        const session = getActiveSession(table.id);
                        const hasActiveSession = !!session;
                        // For queue booking, we can check a flag or order_source, or just treat all active as "Playing"
                        // If user specifically wants to identify "Queue" booked sessions:
                        // We need to verify if session has metadata. 
                        // Assuming 'order_source' or similar isn't in top level session usually, but let's just show "Playing" for now
                        // OR check if query param/data allows distinguishing.
                        
                        // For now, if there is a session, it is OCCUPIED.
                        // The user said "show me exact details which is of queue person...". 
                        // Just displaying the name is a good start.

                        const bookedBy = session ? (session.customer_name || session.customername) : null;
                        const displayStatus = hasActiveSession ? "occupied" : table.status;
                        
                        // Optional: distinguishing label
                        // If we want "Queue", we'd need to know source. 
                        // But "Playing" is safe for all active sessions.
                        const bookingLabel = "Playing"; 

                        return (
                          <div
                            className={`table-card ${getStatusClass(displayStatus)}`}
                            key={table.id || `table-${index}`}
                            onClick={() => handleTableClick(table)}
                          >
                            {/* Game Image */}
                            {(selectedGame?.image_key || selectedGame?.imagekey) && (
                              <img
                                className="table-card-img"
                                src={getGameImageUrl(selectedGame.image_key || selectedGame.imagekey)}
                                alt={selectedGame.game_name || selectedGame.gamename}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}

                            {/* Table Number */}
                            <div className="table-number">
                              {table.name}
                            </div>

                            {/* Show booked by info if active session exists */}
                            {hasActiveSession && bookedBy && (
                              <div className="table-booked-info">
                                <span className="booked-label">
                                  {bookingLabel}
                                </span>
                                <span className="booked-name">{bookedBy}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

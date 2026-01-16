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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamesData, tablesData, sessionsData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
          activeTablesAPI.getAll().catch(() => []), // Don't fail if no active sessions
        ]);

        const gamesList = Array.isArray(gamesData) ? gamesData : [];
        const tablesList = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);
        const sessionsList = Array.isArray(sessionsData) ? sessionsData : [];

        setGames(gamesList);
        setTables(tablesList);
        setActiveSessions(sessionsList);

        // Select first game by default
        if (gamesList.length > 0) {
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

    fetchData();
  }, []);

  // Filter tables by selected game
  const getTablesForGame = (gameId) => {
    return tables.filter((table) => {
       const tableGameId = table.game_id || table.gameid;
       return String(tableGameId) === String(gameId);
    });
  };

  const selectedGameId = selectedGame ? (selectedGame.game_id || selectedGame.gameid) : null;
  const currentTables = selectedGameId ? getTablesForGame(selectedGameId) : [];

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
                      currentTables.map((table, index) => (
                        <div
                          className={`table-card ${getStatusClass(table.status)}`}
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
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>
                      ))
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

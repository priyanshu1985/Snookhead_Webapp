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
    return tables.filter((table) => table.game_id === gameId);
  };

  const currentTables = selectedGame ? getTablesForGame(selectedGame.game_id) : [];

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case "available":
        return "status-available";
      case "reserved":
        return "status-reserved";
      case "maintenance":
        return "status-maintenance";
      default:
        return "";
    }
  };

  // Get active session for a table
  const getActiveSession = (tableId) => {
    return activeSessions.find((s) => String(s.table_id) === String(tableId));
  };

  // Handle table click - navigate based on status
  const handleTableClick = (table) => {
    const gameName = selectedGame?.game_name?.toLowerCase() || "game";

    if (table.status === "reserved") {
      // Table is reserved - go to active session screen
      const session = getActiveSession(table.id);
      navigate(`/session/${gameName}/${table.id}${session ? `/${session.id}` : ""}`);
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
              {/* Category Tabs - Game Selection */}
              <div className="category-tabs">
                {games.length === 0 ? (
                  <p className="no-games-text">No games available. Please create games in Setup Menu.</p>
                ) : (
                  games.map((game, index) => (
                    <button
                      key={game.game_id || `game-${index}`}
                      className={selectedGame?.game_id === game.game_id ? "active" : ""}
                      onClick={() => setSelectedGame(game)}
                    >
                      {game.game_name}
                    </button>
                  ))
                )}
              </div>

              {/* Tables Grid */}
              <div className="tables-grid">
                {currentTables.length === 0 ? (
                  <p className="no-tables-text">No tables added for this game yet.</p>
                ) : (
                  currentTables.map((table, index) => (
                    <div
                      className={`table-card ${getStatusClass(table.status)}`}
                      key={table.id || `table-${index}`}
                      onClick={() => handleTableClick(table)}
                    >
                      {/* Game Image */}
                      {selectedGame?.image_key && (
                        <img
                          className="table-card-img"
                          src={getGameImageUrl(selectedGame.image_key)}
                          alt={selectedGame.game_name}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

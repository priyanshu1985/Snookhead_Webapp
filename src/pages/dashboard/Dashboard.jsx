import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { gamesAPI, tablesAPI } from "../../services/api";
import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch games and tables from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamesData, tablesData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
        ]);

        const gamesList = Array.isArray(gamesData) ? gamesData : [];
        const tablesList = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);

        setGames(gamesList);
        setTables(tablesList);

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

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

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
              {/* Category Tabs - Games */}
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
                      onClick={() => navigate(`/tables/${selectedGame?.game_name?.toLowerCase() || 'game'}/${table.id}`)}
                    >
                      <div className="table-number">{table.name}</div>
                      <span className={`table-status ${getStatusClass(table.status)}`}>
                        {table.status || "available"}
                      </span>
                      {table.pricePerMin && (
                        <span className="table-price">₹{table.pricePerMin}/min</span>
                      )}
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

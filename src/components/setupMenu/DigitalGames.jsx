import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, getGameImageUrl } from "../../services/api";
import CreateTablePopUp from "./CreateTablePopUp";

const DigitalGames = () => {
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

      // Select first game by default if available
      if (gamesList.length > 0 && !selectedGame) {
        setSelectedGame(gamesList[0]);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTablesForGame = (gameId) => {
    return tables.filter((table) => table.game_id === gameId);
  };

  const openAddModal = () => {
    if (!selectedGame) {
      setError("Please select a game first");
      return;
    }
    console.log("Opening modal with selectedGame:", selectedGame);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCreateTable = async (payload) => {
    try {
      setError("");
      await tablesAPI.create(payload);
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to add table");
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      await tablesAPI.delete(id);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete table");
    }
  };

  if (loading) {
    return <div className="setup-grid"><p>Loading...</p></div>;
  }

  const gameTables = selectedGame ? getTablesForGame(selectedGame.game_id) : [];

  return (
    <div className="digital-games-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Game Tabs */}
      <div className="game-tabs">
        {games.length === 0 ? (
          <p className="no-data">No games available. Please create games first in "Manage Table Games".</p>
        ) : (
          games.map((game, index) => (
            <button
              key={game.game_id || `game-${index}`}
              className={`game-tab ${selectedGame?.game_id === game.game_id ? "active" : ""}`}
              onClick={() => setSelectedGame(game)}
            >
              {game.game_name}
            </button>
          ))
        )}
      </div>

      {/* Tables Grid */}
      {selectedGame && (
        <div className="tables-section">
          <h6>Tables for {selectedGame.game_name}</h6>

          <div className="setup-grid">
            {gameTables.length === 0 ? (
              <p className="no-data">No tables added for this game yet.</p>
            ) : (
              gameTables.map((table, index) => (
                <div className="game-box table-box" key={table.id || `table-${index}`}>
                  {/* Show game image if available */}
                  {selectedGame?.image_key && (
                    <div className="game-image">
                      <img
                        src={getGameImageUrl(selectedGame.image_key)}
                        alt={selectedGame.game_name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="table-info">
                    <span className="table-name">{table.name}</span>
                    <span className={`table-status status-${table.status}`}>
                      {table.status}
                    </span>
                    {table.pricePerMin && (
                      <span className="table-price">₹{table.pricePerMin}/min</span>
                    )}
                  </div>
                  <div className="game-actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteTable(table.id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}

            <button className="add-btn" onClick={openAddModal}>
              + Add New Table
            </button>
          </div>
        </div>
      )}

      {/* Create Table Popup */}
      {showModal && (
        <CreateTablePopUp
          onClose={closeModal}
          onSubmit={handleCreateTable}
        />
      )}
    </div>
  );
};

export default DigitalGames;

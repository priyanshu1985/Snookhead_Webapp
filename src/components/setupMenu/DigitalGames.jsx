import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, getGameImageUrl } from "../../services/api";
import CreateTablePopUp from "./CreateTablePopUp";
import "../../styles/setupMenuCardList.css";

const DigitalGames = () => {
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Helper to safely get game ID
  const getGameId = (game) => game?.game_id || game?.gameid;

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

      // Select first game by default if available and none selected
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
    // Some tables might use game_id, some gameid. Normalized check.
    return tables.filter((table) => {
        const tGameId = table.game_id || table.gameid;
        return String(tGameId) === String(gameId);
    });
  };

  const openAddModal = () => {
    if (!selectedGame) {
      setError("Please select a game first");
      return;
    }
    setEditingTable(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTable(null);
  };

  const handleCreateOrUpdateTable = async (payload) => {
    try {
      setError("");
      if (editingTable) {
        await tablesAPI.update(editingTable.id, payload);
      } else {
        await tablesAPI.create(payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to save table");
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
    return <div className="setup-content-wrapper"><p>Loading...</p></div>;
  }
  
  const selectedGameId = getGameId(selectedGame);
  const gameTables = selectedGame ? getTablesForGame(selectedGameId) : [];

  return (
    <div className="digital-games-container">
      {error && !showModal && <div className="alert alert-danger">{error}</div>}

      {/* Game Tabs */}
      <div className="game-tabs">
        {games.length === 0 ? (
          <p className="no-data">No games available. Please create games first in "Manage Table Games".</p>
        ) : (
          games.map((game, index) => (
            <button
              key={game.game_id || game.gameid || `game-${index}`}
              className={`game-tab ${selectedGame?.game_id === (game.game_id || game.gameid) ? "active" : ""}`}
              onClick={() => setSelectedGame(game)}
            >
              {game.game_name || game.gamename}
            </button>
          ))
        )}
      </div>

      {/* Tables List */}
      {selectedGame && (
        <div className="tables-section">
          <h6>Tables for {selectedGame.game_name || selectedGame.gamename}</h6>

          <div className="setup-card-list">
            {gameTables.length === 0 ? (
              <p className="no-data">No tables added for this game yet.</p>
            ) : (
              gameTables.map((table, index) => (
                <div className="setup-card-item" key={table.id || `table-${index}`}>
                  <div className="setup-card-index">{index + 1}</div>

                  <div className="setup-card-details">
                    <span className="setup-card-title">{table.name}</span>
                    <span className="setup-card-subtitle">
                      Status: <span className={`table-status status-${table.status}`}>{table.status}</span>
                      {table.pricePerMin && ` • ₹${table.pricePerMin}/min`}
                    </span>
                  </div>

                  <div className="setup-card-actions">
                    <button 
                      className="setup-action-btn edit" 
                      onClick={() => openEditModal(table)}
                      title="Edit Table"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <button
                      className="setup-action-btn delete"
                      onClick={() => handleDeleteTable(table.id)}
                      title="Delete Table"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
           </div>

            <button className="add-btn" onClick={openAddModal}>
              + Add New Table
            </button>
        </div>
      )}

      {/* Create/Edit Table Popup */}
      {showModal && (
        <CreateTablePopUp
          onClose={closeModal}
          onSubmit={handleCreateOrUpdateTable}
          editingTable={editingTable}
        />
      )}
    </div>
  );
};

export default DigitalGames;

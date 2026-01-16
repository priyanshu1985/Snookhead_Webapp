import { useState, useEffect } from "react";
import { gamesAPI, getGameImageUrl } from "../../services/api";
import CreateGameModal from "./CreateGamePopUp";
import "../../styles/creategame.css";
import "../../styles/setupMenuCardList.css";

const TableGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await gamesAPI.getAll();
      setGames(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  /* ---------------- ADD / UPDATE ---------------- */

  const handleCreateOrUpdate = async ({ game_name, image_key }) => {
    try {
      setSubmitting(true);
      setError("");

      if (editingGame) {
        await gamesAPI.update(editingGame.game_id || editingGame.gameid, {
          game_name: game_name,
          image_key: image_key,
        });
      } else {
        await gamesAPI.create({
          game_name: game_name,
          image_key: image_key,
        });
      }

      setShowModal(false);
      setEditingGame(null);
      fetchGames();
    } catch (err) {
      setError(err.message || "Failed to save game");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteGame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;

    try {
      await gamesAPI.delete(id);
      fetchGames();
    } catch (err) {
      setError(err.message || "Failed to delete game");
    }
  };

  /* ---------------- MODAL CONTROL ---------------- */

  const openAddModal = () => {
    setEditingGame(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGame(null);
    setError("");
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="setup-grid">
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className="setup-content-wrapper">
      {error && !showModal && <div className="alert alert-danger">{error}</div>}

      <div className="setup-card-list">
        {games.length === 0 && (
          <p className="no-data">No games created yet. Add your first game!</p>
        )}

        {games.map((game, index) => {
          const gameId = game.game_id || game.gameid;
          const gameName = game.game_name || game.gamename;
          
          return (
            <div className="setup-card-item" key={gameId || `game-${index}`}>
              <div className="setup-card-index">{index + 1}</div>
              
              <div className="setup-card-details">
                <span className="setup-card-title">{gameName}</span>
                <span className="setup-card-subtitle">
                  Created: {game.created_at ? new Date(game.created_at).toLocaleDateString() : "Just now"}
                </span>
              </div>

              <div className="setup-card-actions">
                <button 
                  className="setup-action-btn edit" 
                  onClick={() => openEditModal(game)}
                  title="Edit Game"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>

                <button
                  className="setup-action-btn delete"
                  onClick={() => handleDeleteGame(gameId)}
                  title="Delete Game"
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
          );
        })}
      </div>

      <button className="add-btn" onClick={openAddModal}>
        + Add New Game
      </button>

      {/* -------- CREATE / EDIT POPUP -------- */}
      {showModal && (
        <CreateGameModal
          onClose={closeModal}
          onSubmit={handleCreateOrUpdate}
          editingGame={editingGame}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default TableGames;

import { useState, useEffect } from "react";
import { gamesAPI, getGameImageUrl } from "../../services/api";
import CreateGameModal from "./CreateGamePopUp";

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
    <div className="setup-grid">
      {error && !showModal && <div className="alert alert-danger">{error}</div>}

      {games.length === 0 && (
        <p className="no-data">No games created yet. Add your first game!</p>
      )}

      {games.map((game, index) => {
         const gameId = game.game_id || game.gameid;
         const gameName = game.game_name || game.gamename;
         const imageKey = game.image_key || game.imagekey;
         
         return (
        <div className="game-box" key={gameId || `game-${index}`}>
          {imageKey && (
            <div className="game-image">
              <img
                src={getGameImageUrl(imageKey)}
                alt={gameName}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <span className="game-name">{gameName}</span>

          <div className="game-actions">
            <button className="btn-edit" onClick={() => openEditModal(game)}>
              Edit
            </button>

            <button
              className="btn-delete"
              onClick={() => handleDeleteGame(gameId)}
            >
              Delete
            </button>
          </div>
        </div>
      )})}

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

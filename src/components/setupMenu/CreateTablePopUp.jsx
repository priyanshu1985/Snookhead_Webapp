import { useState, useEffect } from "react";
import { gamesAPI } from "../../services/api";
import "../../styles/creategame.css";

const CreateTablePopUp = ({ onClose, onSubmit, editingTable }) => {
  const [formData, setFormData] = useState({
    name: "",
    dimension: "",
    type: "",
    pricePerMin: "",
    frameCharge: "",
    status: "available",
  });

  // Game search state
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState(null);
  const [gameError, setGameError] = useState("");
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Fetch all games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoadingGames(true);
        const data = await gamesAPI.getAll();
        const gamesList = Array.isArray(data) ? data : [];
        setGames(gamesList);

        // If editing, try to match game
        if (editingTable && gamesList.length > 0) {
          const tableGameId = editingTable.game_id || editingTable.gameid;
          const matched = gamesList.find(g => (g.game_id || g.gameid) == tableGameId);
          if (matched) {
             setGameId(matched.game_id || matched.gameid);
             setGameName(matched.game_name || matched.gamename);
          }
        }

      } catch (err) {
        console.error("Failed to fetch games:", err);
        setGameError("Failed to load games");
      } finally {
        setLoadingGames(false);
      }
    };
    fetchGames();
  }, []); // Only run once on mount

  // Populate form if editingTable provided (run when editingTable or games loads - handled above for games, but needed here for form fields)
  useEffect(() => {
    if (editingTable) {
      setFormData({
        name: editingTable.name || "",
        dimension: editingTable.dimension || "",
        type: editingTable.type || "",
        pricePerMin: editingTable.pricePerMin || "",
        frameCharge: editingTable.frameCharge || "",
        status: editingTable.status || "available",
      });
      // Game ID logic is handled in fetchGames to ensure games list is ready, 
      // but if games are already loaded (e.g. if we move fetching up), we might need it here.
      // Since we fetch inside this component, the dependency on games in the other useEffect handles it? 
      // No, fetchGames is async. 
      // Let's rely on the fetchGames logic for game mapping, or add a separate effect.
    }
  }, [editingTable]);


  // Find game ID when game name changes
  const handleGameNameChange = (e) => {
    const value = e.target.value;
    setGameName(value);
    setGameError("");
    setGameId(null);

    if (value.trim()) {
      // Find matching game (case-insensitive)
      const matchedGame = games.find((g) => {
        const name = g.game_name || g.gamename;
        return name && name.toLowerCase() === value.toLowerCase();
      });

      if (matchedGame) {
        setGameId(matchedGame.game_id || matchedGame.gameid);
        setGameError("");
      }
    }
  };

  // Handle game selection from datalist
  const handleGameSelect = (selectedName) => {
    if (!selectedName) return;
    const matchedGame = games.find((g) => {
        const name = g.game_name || g.gamename;
        return name && name.toLowerCase() === selectedName.toLowerCase();
    });
    if (matchedGame) {
      setGameId(matchedGame.game_id || matchedGame.gameid);
      setGameName(matchedGame.game_name || matchedGame.gamename);
      setGameError("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter table name");
      return;
    }

    if (!gameName.trim()) {
      setGameError("Please enter a game name");
      return;
    }

    if (!gameId) {
      setGameError("Game not found. Please enter a valid game name from the list.");
      return;
    }

    const payload = {
      name: formData.name,
      dimension: formData.dimension || null,
      type: formData.type || null,
      pricePerMin: formData.pricePerMin ? parseFloat(formData.pricePerMin) : null,
      frameCharge: formData.frameCharge ? parseFloat(formData.frameCharge) : null,
      status: formData.status,
      game_id: gameId,
    };

    console.log("Submitting table payload:", payload);
    onSubmit?.(payload);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal">
        {/* Header */}
        <div className="create-game-header">
          <h5>{editingTable ? "Edit Table" : "Create New Table"}</h5>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Form */}
        <form className="create-game-form" onSubmit={handleSubmit}>
          {/* Game Name Input with Datalist */}
          <div className="form-group">
            <label>Game Name *</label>
            <input
              type="text"
              name="game_name"
              placeholder={loadingGames ? "Loading games..." : "Type game name (e.g., Snooker, Pool)"}
              value={gameName}
              onChange={handleGameNameChange}
              onBlur={() => handleGameSelect(gameName)}
              list="games-list"
              required
              disabled={loadingGames}
              autoComplete="off"
            />
            <datalist id="games-list">
              {games.map((game, index) => (
                <option key={game.game_id || game.gameid || index} value={game.game_name || game.gamename} />
              ))}
            </datalist>
            {gameId && (
              <small className="text-success">Game found (ID: {gameId})</small>
            )}
            {gameError && <small className="text-danger">{gameError}</small>}
            {!loadingGames && games.length === 0 && (
              <small className="text-warning">No games available. Please create a game first.</small>
            )}
          </div>

          {/* Table Name */}
          <div className="form-group">
            <label>Table Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Table 1, VIP Table"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dimension */}
          <div className="form-group">
            <label>Dimension</label>
            <input
              type="text"
              name="dimension"
              placeholder="e.g., 12x6 ft"
              value={formData.dimension}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label>Type</label>
            <input
              type="text"
              name="type"
              placeholder="e.g., Standard, Premium"
              value={formData.type}
              onChange={handleChange}
            />
          </div>

          {/* Price Per Minute */}
          <div className="form-group">
            <label>Price Per Minute (₹)</label>
            <input
              type="number"
              name="pricePerMin"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.pricePerMin}
              onChange={handleChange}
            />
          </div>

          {/* Frame Charge */}
          <div className="form-group">
            <label>Frame Charge (₹)</label>
            <input
              type="number"
              name="frameCharge"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.frameCharge}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              Back
            </button>
            <button type="submit" className="submit-btn" disabled={!gameId}>
              {editingTable ? "Update Table" : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTablePopUp;

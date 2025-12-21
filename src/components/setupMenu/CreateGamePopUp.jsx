import { useState } from "react";
import "../../styles/creategame.css";

const CreateGameModal = ({ onClose, onSubmit, editingGame, submitting }) => {
  const [gameName, setGameName] = useState(editingGame?.game_name || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!gameName.trim()) {
      alert("Please enter game name");
      return;
    }

    const payload = {
      name: gameName.trim(),
    };

    onSubmit?.(payload);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal">
        {/* Header */}
        <div className="create-game-header">
          <h5>{editingGame ? "Edit Game" : "Create New Game"}</h5>
          <button className="close-btn" onClick={onClose} disabled={submitting}>
            ×
          </button>
        </div>

        {/* Form */}
        <form className="create-game-form" onSubmit={handleSubmit}>
          {/* Game Name */}
          <div className="form-group">
            <label>Game Name *</label>
            <input
              type="text"
              placeholder="e.g., Snooker, Pool, 8-Ball"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose} disabled={submitting}>
              Back
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingGame ? "Update Game" : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;

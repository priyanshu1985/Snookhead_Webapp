import { useState, useEffect } from "react";
import { stockImagesAPI, IMAGE_BASE_URL } from "../../services/api";
import "../../styles/creategame.css";

const CreateGameModal = ({ onClose, onSubmit, editingGame, submitting }) => {
  const [gameName, setGameName] = useState(editingGame?.game_name || editingGame?.gamename || editingGame?.name || "");
  const [selectedImageKey, setSelectedImageKey] = useState(editingGame?.image_key || null);
  const [stockImages, setStockImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  // Fetch stock images on mount
  useEffect(() => {
    const fetchStockImages = async () => {
      try {
        setImagesLoading(true);
        const images = await stockImagesAPI.getGameImages();
        setStockImages(Array.isArray(images) ? images : []);
      } catch (err) {
        console.error("Failed to fetch stock images:", err);
        setStockImages([]);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchStockImages();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!gameName.trim()) {
      alert("Please enter game name");
      return;
    }

    const payload = {
      game_name: gameName.trim(),
      image_key: selectedImageKey,
    };

    onSubmit?.(payload);
  };

  const handleImageSelect = (imageKey) => {
    // Toggle selection - if same image clicked, deselect it
    setSelectedImageKey(prev => prev === imageKey ? null : imageKey);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal">
        {/* Header */}
        <div className="create-game-header">
          <h5>{editingGame ? "Edit Game" : "Create New Game"}</h5>
          <button className="close-btn" onClick={onClose} disabled={submitting} aria-label="Close"></button>
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

          {/* Image Selection */}
          <div className="form-group">
            <label>Select Game Image</label>
            {imagesLoading ? (
              <p className="loading-text">Loading images...</p>
            ) : stockImages.length === 0 ? (
              <p className="no-images-text">No stock images available</p>
            ) : (
              <div className="image-grid">
                {stockImages.map((img) => (
                  <div
                    key={img.key}
                    className={`image-item ${selectedImageKey === img.key ? "selected" : ""}`}
                    onClick={() => handleImageSelect(img.key)}
                  >
                    <img
                      src={`${IMAGE_BASE_URL}${img.url}`}
                      alt={img.filename}
                      loading="lazy"
                    />
                    {selectedImageKey === img.key && (
                      <div className="selected-overlay">
                        <span className="checkmark">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {selectedImageKey && (
              <button
                type="button"
                className="clear-selection-btn"
                onClick={() => setSelectedImageKey(null)}
              >
                Clear Selection
              </button>
            )}
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

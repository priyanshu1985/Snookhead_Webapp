import { useState } from "react";
import { PreparedFoodIcon, PackedFoodIcon } from "../common/Icons";
import "../../styles/creategame.css"; // Reuse existing modal styles

const CreateCategoryModal = ({ onClose, onConfirm, initialType = "prepared" }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState(initialType);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a category name");
      return;
    }
    onConfirm(name.trim(), type);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal" style={{ maxWidth: '400px' }}>
        <div className="create-game-header">
          <h5>Create New Category</h5>
          <button className="close-btn" onClick={onClose} aria-label="Close"></button>
        </div>

        <form className="create-game-form" onSubmit={handleSubmit}>
          <div className="form-scroll-content">
            
            {/* Type Selection */}
            <div className="form-group">
              <label>Food Type</label>
              <div className="booking-type-options" style={{ display: 'flex', gap: '10px' }}>
                <button
                    type="button"
                    onClick={() => setType("prepared")}
                    className={`type-select-btn ${type === "prepared" ? "active" : ""}`}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: type === "prepared" ? '2px solid #F08626' : '1px solid #e5e7eb',
                        background: type === "prepared" ? '#FFF3E0' : '#fff',
                        color: type === "prepared" ? '#F08626' : '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: '600',
                        fontSize: '13px'
                    }}
                >
                    <PreparedFoodIcon size={18} />
                    Prepared
                </button>
                <button
                    type="button"
                    onClick={() => setType("packed")}
                    className={`type-select-btn ${type === "packed" ? "active" : ""}`}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: type === "packed" ? '2px solid #F08626' : '1px solid #e5e7eb',
                        background: type === "packed" ? '#FFF3E0' : '#fff',
                        color: type === "packed" ? '#F08626' : '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: '600',
                        fontSize: '13px'
                    }}
                >
                    <PackedFoodIcon size={18} />
                    Packed
                </button>
              </div>
            </div>

            {/* Category Name */}
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Italian, Drinks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

          </div>

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;

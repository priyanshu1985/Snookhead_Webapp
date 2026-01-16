import { useState } from "react";
import "../../styles/creategame.css";

const CATEGORIES = [
  { value: "Food", label: "Food" },
  { value: "Fast Food", label: "Fast Food" },
  { value: "Beverages", label: "Beverages" },
  { value: "Snacks", label: "Snacks" },
  { value: "Desserts", label: "Desserts" },
  { value: "prepared", label: "Prepared Food" },
  { value: "packed", label: "Packed Food" },
  { value: "cigarette", label: "Cigarette" },
];

const CreateMenuPopUp = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter item name");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.price) {
      alert("Please enter price");
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
    };

    onSubmit?.(payload);
  };

  return (
    <div className="create-game-overlay">
      <div className="create-game-modal">
        {/* Header */}
        <div className="create-game-header">
          <h5>Create New Menu Item</h5>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Form */}
        <form className="create-game-form" onSubmit={handleSubmit}>
          {/* Item Name */}
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Paneer Wrap"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={onClose}>
              Back
            </button>
            <button type="submit" className="submit-btn">
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMenuPopUp;

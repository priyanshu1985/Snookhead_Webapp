import React, { useState } from "react";
import { inventoryAPI } from "../../services/api";

const AddItemModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "Cafe Asset",
    current_quantity: 0,
    minimum_threshold: 5,
    unit: "pcs",
    cost_per_unit: "",
    supplier: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await inventoryAPI.create(formData);
      if (response.success) {
        onAdd(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
            <h4>Add New Inventory Item</h4>
            <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
             <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="Cafe Asset">Cafe Asset</option>
                    <option value="Packed Food">Packed Food</option>
                    <option value="Prepared Food">Prepared Food</option>
                    <option value="Sticks">Sticks</option>
                    <option value="Tables">Tables</option>
                    <option value="Other">Other</option>
                </select>
             </div>
             <div className="form-group">
                <label>Unit *</label>
                <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="pcs, kg, ltr"
                    required
                />
             </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Current Quantity</label>
                <input
                type="number"
                name="current_quantity"
                value={formData.current_quantity}
                onChange={handleChange}
                min="0"
                />
            </div>
            <div className="form-group">
                <label>Min Threshold</label>
                <input
                type="number"
                name="minimum_threshold"
                value={formData.minimum_threshold}
                onChange={handleChange}
                min="0"
                />
            </div>
          </div>

          <div className="form-row">
             <div className="form-group">
                <label>Cost Per Unit</label>
                <input
                    type="number"
                    name="cost_per_unit"
                    value={formData.cost_per_unit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                />
             </div>
             <div className="form-group">
                <label>Supplier</label>
                <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                />
             </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;

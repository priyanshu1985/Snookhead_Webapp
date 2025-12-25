import { useState } from "react";
import { customersAPI } from "../../services/api";
import "../../styles/members.css";

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    external_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Name and phone are required");
      return;
    }

    setLoading(true);
    try {
      const newMember = await customersAPI.create({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        external_id: formData.external_id.trim() || undefined,
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        external_id: "",
      });

      if (onMemberAdded) {
        onMemberAdded(newMember);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create member");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      external_id: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="member-modal-overlay" onClick={handleClose}>
      <div className="member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="member-modal-header">
          <h5>Add New Member</h5>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="member-modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="external_id">External ID</label>
                <input
                  type="text"
                  id="external_id"
                  name="external_id"
                  value={formData.external_id}
                  onChange={handleChange}
                  placeholder="Enter external ID"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="member-modal-footer">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;

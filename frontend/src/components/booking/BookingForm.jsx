import React, { useState } from "react";

const BookingForm = ({ onSubmit, onCancel, availableTables = [] }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    tableId: "",
    date: "",
    startTime: "",
    duration: 1,
    gameType: "standard",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    }

    if (!formData.tableId) {
      newErrors.tableId = "Please select a table";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (formData.duration < 0.5 || formData.duration > 8) {
      newErrors.duration = "Duration must be between 0.5 and 8 hours";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedTable = availableTables.find(
      (table) => table.id === parseInt(formData.tableId)
    );
    const totalAmount = selectedTable
      ? selectedTable.hourlyRate * formData.duration
      : 0;

    const bookingData = {
      ...formData,
      totalAmount,
      status: "pending",
    };

    onSubmit(bookingData);
  };

  const calculateTotal = () => {
    const selectedTable = availableTables.find(
      (table) => table.id === parseInt(formData.tableId)
    );
    return selectedTable ? selectedTable.hourlyRate * formData.duration : 0;
  };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={errors.customerName ? "error" : ""}
              />
              {errors.customerName && (
                <span className="error-message">{errors.customerName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number *</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className={errors.customerPhone ? "error" : ""}
              />
              {errors.customerPhone && (
                <span className="error-message">{errors.customerPhone}</span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="customerEmail">Email (Optional)</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Booking Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tableId">Select Table *</label>
              <select
                id="tableId"
                name="tableId"
                value={formData.tableId}
                onChange={handleChange}
                className={errors.tableId ? "error" : ""}
              >
                <option value="">Choose a table</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} - ${table.hourlyRate}/hour
                  </option>
                ))}
              </select>
              {errors.tableId && (
                <span className="error-message">{errors.tableId}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="gameType">Game Type</label>
              <select
                id="gameType"
                name="gameType"
                value={formData.gameType}
                onChange={handleChange}
              >
                <option value="standard">Standard</option>
                <option value="tournament">Tournament</option>
                <option value="practice">Practice</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={errors.date ? "error" : ""}
              />
              {errors.date && (
                <span className="error-message">{errors.date}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? "error" : ""}
              />
              {errors.startTime && (
                <span className="error-message">{errors.startTime}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration (hours) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0.5"
                max="8"
                step="0.5"
                className={errors.duration ? "error" : ""}
              />
              {errors.duration && (
                <span className="error-message">{errors.duration}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>

        <div className="booking-summary">
          <div className="summary-item">
            <span>Total Amount:</span>
            <span className="total-amount">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

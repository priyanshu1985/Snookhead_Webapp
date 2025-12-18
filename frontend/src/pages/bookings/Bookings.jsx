import React, { useState } from "react";

const Bookings = () => {
  // TODO: Replace with API call
  const mockBookings = [
    {
      id: 1,
      tableId: 1,
      tableName: "Table 1",
      customerName: "John Doe",
      date: "2025-12-19",
      startTime: "14:00",
      endTime: "16:00",
      status: "confirmed",
      totalAmount: 50,
    },
    {
      id: 2,
      tableId: 2,
      tableName: "Table 2",
      customerName: "Jane Smith",
      date: "2025-12-19",
      startTime: "18:00",
      endTime: "20:00",
      status: "pending",
      totalAmount: 50,
    },
    {
      id: 3,
      tableId: 3,
      tableName: "Table 3",
      customerName: "Mike Johnson",
      date: "2025-12-20",
      startTime: "10:00",
      endTime: "12:00",
      status: "cancelled",
      totalAmount: 50,
    },
  ];
  const [bookings] = useState(mockBookings);
  const [filter, setFilter] = useState("all");

  const filteredBookings = bookings.filter(
    (booking) => filter === "all" || booking.status === filter
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h1>Bookings Management</h1>
        <button className="btn-primary">New Booking</button>
      </div>

      <div className="bookings-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      <div className="bookings-list">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <h3>{booking.tableName}</h3>
              <span
                className={`booking-status ${getStatusClass(booking.status)}`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
            <div className="booking-details">
              <p>
                <strong>Customer:</strong> {booking.customerName}
              </p>
              <p>
                <strong>Date:</strong> {booking.date}
              </p>
              <p>
                <strong>Time:</strong> {booking.startTime} - {booking.endTime}
              </p>
              <p>
                <strong>Amount:</strong> ${booking.totalAmount}
              </p>
            </div>
            <div className="booking-actions">
              <button className="btn-secondary">View Details</button>
              <button className="btn-outline">Edit</button>
              {booking.status === "pending" && (
                <>
                  <button className="btn-success">Confirm</button>
                  <button className="btn-danger">Cancel</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="empty-state">
          <p>No bookings found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;

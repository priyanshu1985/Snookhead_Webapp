import { useParams } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import TableBookedModal from "../../components/tables/TableBookedModel";

import "../../styles/tableBooking.css";

const dates = ["Today", "17sept", "18sept", "19sept", "20sept", "21sept"];

const TableBooking = () => {
  const { game, tableId } = useParams();

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBook = () => {
    if (!selectedTime) {
      alert("Please select a time option");
      return;
    }
    setShowSuccess(true);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="table-booking-page">
          {/* Header */}
          <div className="booking-header">
            <h5>{game}</h5>
            <span className="table-code">T2 {tableId}</span>
          </div>

          {/* Date */}
          <p className="section-title">Select date</p>
          <div className="date-row">
            {dates.map((d) => (
              <span
                key={d}
                className={selectedDate === d ? "active" : ""}
                onClick={() => setSelectedDate(d)}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Time */}
          <p className="section-title">Select Time</p>
          <div className="radio-row">
            <label>
              <input
                type="radio"
                name="time"
                value="set"
                checked={selectedTime === "set"}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              Set Time
            </label>

            <label>
              <input
                type="radio"
                name="time"
                value="timer"
                checked={selectedTime === "timer"}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              Timer
            </label>

            <label>
              <input
                type="radio"
                name="time"
                value="frame"
                checked={selectedTime === "frame"}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              Select Frame
            </label>
          </div>

          {/* Food */}
          <p className="section-title">Add Food</p>
          <div className="food-row">
            <div className="food-box">
              🥗<span>Food</span>
            </div>
            <div className="food-box">
              🍟<span>Packfood</span>
            </div>
            <div className="food-box">
              🥤<span>Beverages</span>
            </div>
          </div>

          {/* Actions */}
          <button className="book-btn" onClick={handleBook}>
            Book
          </button>

          <span className="new-user">New User</span>
        </div>

        {/* SUCCESS MODAL — CORRECT PLACEMENT */}
        {showSuccess && (
          <TableBookedModal onClose={() => setShowSuccess(false)} />
        )}
      </div>
    </div>
  );
};

export default TableBooking;

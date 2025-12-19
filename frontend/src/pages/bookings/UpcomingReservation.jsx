import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import "../../styles/upcomingReservation.css";
import { useNavigate } from "react-router-dom";

const reservations = [
  { id: 1, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
  { id: 2, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
  { id: 3, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
  { id: 4, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
  { id: 5, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
  { id: 6, name: "Rohit", date: "22-06-2025", time: "11.00PM" },
];

const UpcomingReservation = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="upcoming-page">
          {/* Header */}
          <h5 className="mb-3">← Queue Management</h5>

          {/* Tabs */}
          <div className="queue-tabs">
            <button>QUEUE</button>
            <button className="active">UPCOMING RESERVATION</button>
          </div>

          {/* Reservation List */}
          <div className="reservation-list">
            {reservations.map((item, index) => (
              <div className="reservation-item" key={item.id}>
                <div className="left">
                  <span className="index">{index + 1}.</span>
                  <span className="name">{item.name}</span>
                </div>

                <span className="date">{item.date}</span>
                <span className="time">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="reservation-footer">
            <button
              className="add-queue-btn"
              onClick={() => navigate("/bookings/add-queue")}
            >
              upcoming Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingReservation;

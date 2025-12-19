import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import "../../styles/queue.css";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const navigate = useNavigate();

  const queueList = [
    { id: 1, name: "Rohit", time: "11.00PM" },
    { id: 2, name: "Rohit", time: "11.00PM" },
    { id: 3, name: "Rohit", time: "11.00PM" },
    { id: 4, name: "Rohit", time: "11.00PM" },
    { id: 5, name: "Rohit", time: "11.00PM" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="dashboard-main">
        {/* Navbar */}
        <Navbar />

        {/* Queue Content */}
        <div className="queue-page">
          {/* Page Header */}
          <div className="queue-header">
            <h5>← Queue Management</h5>
          </div>

          {/* Tabs */}
          <div className="queue-tabs">
            <button
              className="add-queue-btn"
              onClick={() => navigate("/bookings")}
            >
              queue
            </button>

            <button
              className="add-queue-btn"
              onClick={() => navigate("/bookings/upcoming-reservation")}
            >
              Upcoming Reservation
            </button>
          </div>

          {/* Queue List */}
          <div className="queue-list">
            {queueList.map((item, index) => (
              <div className="queue-item" key={item.id}>
                <div className="queue-left">
                  <span className="queue-number">{index + 1}.</span>
                  <span className="queue-name">{item.name}</span>
                </div>
                <span className="queue-time">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="queue-footer">
            <button
              className="add-queue-btn"
              onClick={() => navigate("/bookings/add-queue")}
            >
              Add Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;

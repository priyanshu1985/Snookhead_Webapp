import { useContext, useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import { reservationsAPI } from "../../services/api";
import "../../styles/upcomingReservation.css";
import { useNavigate } from "react-router-dom";

const UpcomingReservation = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // State
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await reservationsAPI.getAll();
      const reservationsList = data?.data || (Array.isArray(data) ? data : []);

      // Filter only future/upcoming reservations and sort by date
      const now = new Date();
      const upcoming = reservationsList
        .filter((r) => {
          const reservationTime = new Date(r.reservationtime || r.reservation_time || r.fromTime);
          return reservationTime >= now && (r.status === "pending" || r.status === "active");
        })
        .sort((a, b) => {
          const timeA = new Date(a.reservationtime || a.reservation_time || a.fromTime);
          const timeB = new Date(b.reservationtime || b.reservation_time || b.fromTime);
          return timeA - timeB;
        });

      setReservations(upcoming);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  // Format time for display
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle cancel reservation
  const handleCancel = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await reservationsAPI.cancel(reservationId);
      // Refresh the list
      fetchReservations();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      alert("Failed to cancel reservation: " + (err.message || "Unknown error"));
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchReservations();
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="upcoming-page">
          {/* Header */}
          <h5 className="page-header" onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            ← Queue Management
          </h5>

          {/* Tabs */}
          <div className="queue-tabs">
            <button onClick={() => navigate("/queue")}>QUEUE</button>
            <button className="active">UPCOMING RESERVATION</button>
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <p>Loading reservations...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming reservations</p>
              <span>Click the button below to create a new reservation</span>
            </div>
          ) : (
            /* Reservation List */
            <div className="reservation-list">
              {reservations.map((item, index) => {
                const reservationTime = item.reservationtime || item.reservation_time || item.fromTime;
                const customerName = item.customerName || item.customer_name || item.User?.name || "Guest";
                const tableName = item.TableAsset?.name || item.table?.name || `Table ${item.tableId || item.table_id}`;
                const gameName = item.TableAsset?.Game?.gamename || item.TableAsset?.Game?.game_name || "";

                return (
                  <div className="reservation-item" key={item.id}>
                    <div className="left">
                      <span className="index">{index + 1}.</span>
                      <div className="customer-info">
                        <span className="name">{customerName}</span>
                        {gameName && <span className="game-name">{gameName} - {tableName}</span>}
                      </div>
                    </div>

                    <span className="date">{formatDate(reservationTime)}</span>
                    <span className="time">{formatTime(reservationTime)}</span>

                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(item.id)}
                      title="Cancel reservation"
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="reservation-footer">
            <button className="add-queue-btn" onClick={() => setShowModal(true)}>
              + New Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default UpcomingReservation;

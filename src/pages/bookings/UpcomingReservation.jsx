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
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [reservationToEdit, setReservationToEdit] = useState(null);

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await reservationsAPI.getAll();
      const reservationsList = data?.data || (Array.isArray(data) ? data : []);

      // Filter only future/upcoming reservations and sort by date
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const upcoming = reservationsList
        .filter((r) => {
          // Robust field reading - matching backend fix
          const reservationTime = new Date(r.reservationtime || r.reservation_time || r.fromTime || r.fromtime || r.start_time);
          
          if (isNaN(reservationTime.getTime())) return false;

          // Show all pending/active reservations from today onwards (even if slightly past time)
          return reservationTime >= startOfToday && (r.status === "pending" || r.status === "active");
        })
        .sort((a, b) => {
          const timeA = new Date(a.reservationtime || a.reservation_time || a.fromTime || a.fromtime || a.start_time);
          const timeB = new Date(b.reservationtime || b.reservation_time || b.fromTime || b.fromtime || b.start_time);
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
    if (!reservationId) {
        console.error("No reservation ID to cancel");
        return;
    }
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      setProcessingId(reservationId);
      await reservationsAPI.cancel(reservationId);
      // Refresh the list
      await fetchReservations();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      // Improved error message
      const msg = err.response?.data?.error || err.message || "Unknown error";
      alert("Failed to cancel reservation: " + msg);
    } finally {
        setProcessingId(null);
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchReservations();
  };

  // Filter based on search query
  const filteredReservations = reservations.filter((item) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    
    // Match customer name
    const customerName = item.customerName || item.customer_name || item.User?.name || "Guest";
    if (customerName.toLowerCase().includes(lowerQuery)) return true;

    // Match table name
    const tableName = item.TableAsset?.name || item.table?.name || `Table ${item.tableId || item.table_id}`;
    if (tableName.toLowerCase().includes(lowerQuery)) return true;
    
    // Match game name
    const gameName = item.TableAsset?.Game?.gamename || item.TableAsset?.Game?.game_name || "";
    if (gameName.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="upcoming-page">
          {/* Header */}
          <div className="queue-header">
            <h5 onClick={() => navigate(-1)}> Reservations</h5>
          </div>

          {/* Search Bar */}
          <div className="reservation-search" style={{ marginBottom: "20px" }}>
             <input
              type="text"
              placeholder="Search by customer, table, or game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ padding: "10px", width: "100%", maxWidth: "400px" }}
            />
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <p>Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? `No reservations matching "${searchQuery}"` : "No upcoming reservations"}</p>
              {!searchQuery && <span>Click the button below to create a new reservation</span>}
            </div>
          ) : (
            /* Reservation List */
            <div className="reservation-list">
              {filteredReservations.map((item, index) => {
                const reservationTime = item.reservationtime || item.reservation_time || item.fromTime || item.fromtime || item.start_time;
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

                    <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="edit-btn"
                        onClick={() => {
                            setShowModal(true);
                            setReservationToEdit(item);
                        }}
                        title="Edit reservation"
                        style={{ 
                            padding: '6px 12px',
                            background: '#fff',
                            border: '1px solid #F08626',
                            borderRadius: '6px',
                            color: '#F08626',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(item.id)}
                        title="Cancel reservation"
                        disabled={processingId === item.id}
                        style={{ 
                            padding: '6px 12px', 
                            background: '#fff', 
                            border: '1px solid #dc3545', 
                            borderRadius: '6px', 
                            color: '#dc3545', 
                            cursor: processingId === item.id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: processingId === item.id ? 0.7 : 1
                        }}
                      >
                        {processingId === item.id ? "..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="reservation-footer">
            <button className="add-queue-btn" onClick={() => {
                setReservationToEdit(null); // Clear edit state
                setShowModal(true);
            }}>
              + New Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showModal}
        onClose={() => {
            setShowModal(false);
            setReservationToEdit(null);
        }}
        onSuccess={handleModalSuccess}
        reservationToEdit={reservationToEdit}
      />
    </div>
  );
};

export default UpcomingReservation;

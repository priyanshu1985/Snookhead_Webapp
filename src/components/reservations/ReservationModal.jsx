import { useState, useEffect } from "react";
import { gamesAPI, tablesAPI, reservationsAPI } from "../../services/api";
import "../../styles/reservationModal.css";

const ReservationModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");

  // Data state
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch games and tables on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [gamesData, tablesData] = await Promise.all([
          gamesAPI.getAll(),
          tablesAPI.getAll(),
        ]);

        const gamesArr = gamesData?.data || (Array.isArray(gamesData) ? gamesData : []);
        const tablesArr = tablesData?.data || (Array.isArray(tablesData) ? tablesData : []);

        setGames(gamesArr);
        setTables(tablesArr);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load games and tables");
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      fetchData();
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setReservationDate(today);
    }
  }, [isOpen]);

  // Filter tables when game is selected
  useEffect(() => {
    if (selectedGame) {
      const filtered = tables.filter(
        (table) => (table.gameid || table.game_id) === parseInt(selectedGame)
      );
      setFilteredTables(filtered);
      setSelectedTable(""); // Reset table selection
    } else {
      setFilteredTables([]);
      setSelectedTable("");
    }
  }, [selectedGame, tables]);

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setSelectedGame("");
    setSelectedTable("");
    setReservationDate(new Date().toISOString().split("T")[0]);
    setStartTime("");
    setDurationMinutes(60);
    setNotes("");
    setError("");
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!selectedGame) {
      setError("Please select a game");
      return;
    }
    if (!selectedTable) {
      setError("Please select a table");
      return;
    }
    if (!reservationDate) {
      setError("Please select a date");
      return;
    }
    if (!startTime) {
      setError("Please select a time");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await reservationsAPI.create({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        game_id: parseInt(selectedGame),
        table_id: parseInt(selectedTable),
        reservation_date: reservationDate,
        start_time: startTime,
        duration_minutes: durationMinutes,
        notes: notes.trim(),
      });

      // Success
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create reservation:", err);
      setError(err.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reservation-modal-overlay" onClick={handleClose}>
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reservation-modal-header">
          <h5>New Reservation</h5>
          <button className="close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {loadingData ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <>
              {/* Customer Name */}
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="form-control"
                />
              </div>

              {/* Customer Phone */}
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="form-control"
                />
              </div>

              {/* Game Selection */}
              <div className="form-group">
                <label>Select Game *</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Game --</option>
                  {games.map((game) => (
                    <option key={game.gameid || game.id} value={game.gameid || game.id}>
                      {game.gamename || game.game_name || game.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table Selection */}
              <div className="form-group">
                <label>Select Table *</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="form-control"
                  disabled={!selectedGame}
                >
                  <option value="">
                    {selectedGame ? "-- Select Table --" : "-- Select a game first --"}
                  </option>
                  {filteredTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name || `Table ${table.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>Reservation Date *</label>
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="form-group">
                <label>Duration (minutes)</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="form-control"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  className="form-control"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="reservation-modal-footer">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading || loadingData}>
              {loading ? "Creating..." : "Create Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;

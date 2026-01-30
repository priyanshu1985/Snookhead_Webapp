import { useContext, useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { queueAPI, gamesAPI, activeTablesAPI } from "../../services/api";
import QueueModal from "../../components/queue/QueueModal";
import "../../styles/queue.css";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  // State
  const [queueList, setQueueList] = useState([]);
  const [playingList, setPlayingList] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({ totalWaiting: 0, totalPlaying: 0, nextPlayer: null });

  // Fetch active sessions
  const [activeSessions, setActiveSessions] = useState([]);

  // Fetch queue data and active sessions
  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch queue summary, active sessions, waiting queue, playing list in parallel
      const [summaryData, activeSessionsData, waitingData, playingData] = await Promise.all([
        queueAPI.getSummary(),
        activeTablesAPI.getAll().catch(() => []),
        queueAPI.getAll(selectedGame ? { gameid: selectedGame } : {}),
        queueAPI.getAll({ ...(selectedGame ? { gameid: selectedGame } : {}), status: "playing" })
      ]);

      setSummary(summaryData);
      
      // Normalize active sessions
      const sessions = (Array.isArray(activeSessionsData) ? activeSessionsData : []).map(s => ({
         ...s,
         table_id: s.tableid || s.table_id,
         active_id: s.activeid || s.active_id,
         end_time: s.endtimer || s.bookingendtime || s.booking_end_time,
         game_id: s.gameid || s.game_id
      }));
      setActiveSessions(sessions);

      setQueueList(Array.isArray(waitingData) ? waitingData : []);
      setPlayingList(Array.isArray(playingData) ? playingData : []);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated time helper
  const getEstimatedTime = (item) => {
      // 1. Check if preferred table is set
      if (item.PreferredTable || item.preferredtableid) {
          const tableId = item.PreferredTable?.id || item.preferredtableid;
          
          // Find active session for this table
          const session = activeSessions.find(s => String(s.table_id) === String(tableId) && s.status === 'active');
          
          if (!session) {
              return "Table Available";
          }
          
          // Check if session has a fixed end time
          if (session.end_time) {
              const endTime = new Date(session.end_time);
              const now = new Date();
              
              if (endTime < now) return "Table Available"; // Should be auto-released soon

              return `Expected at ${endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
          } else {
              // Stopwatch mode or undetermined
              return "Currently Playing";
          }
      }
      
      // 2. If no preferred table, we *could* find the earliest available table for this game
      return `~${item.estimatedwaitminutes} min wait`; 
  };


  // Fetch games for filter
  const fetchGames = async () => {
    try {
      const data = await gamesAPI.getAll();
      const gamesList = data?.data || (Array.isArray(data) ? data : []);
      setGames(gamesList);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [selectedGame]);

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle seat next
  const handleSeatNext = async () => {
    try {
      const result = await queueAPI.next(selectedGame);
      if (result.success) {
        alert(result.message);
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || "Failed to seat next customer");
    }
  };

  // Handle cancel
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to remove this entry from the queue?")) {
      return;
    }
    try {
      await queueAPI.cancel(id);
      fetchQueue();
    } catch (err) {
      alert(err.message || "Failed to cancel queue entry");
    }
  };

  // Handle complete game
  const handleComplete = async (id) => {
    if (!window.confirm("Mark this game as completed?")) {
      return;
    }
    try {
      await queueAPI.complete(id);
      fetchQueue();
    } catch (err) {
      alert(err.message || "Failed to complete game");
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchQueue();
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="queue-page">
          {/* Header */}
          <div className="queue-header">
            <h5 onClick={() => navigate(-1)}> Queue Management</h5>
          </div>

          {/* Tabs */}


          {/* Summary Cards */}
          <div className="queue-summary">
            <div className="summary-card">
              <div className="count">{summary.totalWaiting}</div>
              <div className="label">In Queue</div>
            </div>
            <div className="summary-card playing">
              <div className="count">{summary.totalPlaying}</div>
              <div className="label">Now Playing</div>
            </div>
          </div>

          {/* Game Filter */}
          {games.length > 0 && (
            <div className="game-filter-tabs">
              <button
                className={!selectedGame ? "active" : ""}
                onClick={() => setSelectedGame(null)}
              >
                All Games
              </button>
              {games.map((game) => (
                <button
                  key={game.gameid || game.id}
                  className={selectedGame === (game.gameid || game.id) ? "active" : ""}
                  onClick={() => setSelectedGame(game.gameid || game.id)}
                >
                  {game.gamename || game.name}
                </button>
              ))}
            </div>
          )}

          {/* Next Player Card */}
          {summary.nextPlayer && (
            <div className="next-player-card">
              <div>
                <div className="label">Next in Queue</div>
                <div className="name">{summary.nextPlayer.customername}</div>
                <div className="game">
                  {summary.nextPlayer.Game?.gamename || "Unknown Game"}
                </div>
              </div>
              <button className="seat-next-btn" onClick={handleSeatNext}>
                Seat Now
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <p>Loading queue...</p>
            </div>
          ) : (
            <>
              {/* Currently Playing Section */}
              {playingList.length > 0 && (
                <>
                  <h6 style={{ marginTop: "20px", marginBottom: "10px", color: "#28a745" }}>
                    Now Playing ({playingList.length})
                  </h6>
                  <div className="queue-list">
                    {playingList.map((item) => (
                      <div className="queue-item playing" key={item.id}>
                        <div className="queue-left">
                          <div className="queue-info">
                            <span className="queue-name">{item.customername}</span>
                            <span className="queue-game">
                              {item.Game?.gamename || "Unknown"} - {item.PreferredTable?.name || `Table ${item.preferredtableid}`}
                            </span>
                          </div>
                          {item.members > 1 && (
                            <span className="queue-members">{item.members} players</span>
                          )}
                        </div>
                        <span className="queue-time">{formatTime(item.createdat)}</span>
                        <span className="queue-status playing">Playing</span>
                        <div className="queue-actions">
                          <button className="btn-complete" onClick={() => handleComplete(item.id)}>
                            End Game
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Waiting Queue Section */}
              <h6 style={{ marginTop: "20px", marginBottom: "10px", color: "#F08626" }}>
                Waiting Queue ({queueList.length})
              </h6>
              {queueList.length === 0 ? (
                <div className="empty-state">
                  <p>No one in queue</p>
                  <span>Click the button below to add someone to the queue</span>
                </div>
              ) : (
                <div className="queue-list">
                  {queueList.map((item, index) => (
                    <div className="queue-item" key={item.id}>
                      <div className="queue-left">
                        <span className="queue-number">{index + 1}.</span>
                        <div className="queue-info">
                          <span className="queue-name">{item.customername}</span>
                          <span className="queue-game">
                            {item.Game?.gamename || "Unknown Game"}
                          </span>
                        </div>
                        {item.members > 1 && (
                          <span className="queue-members">{item.members} players</span>
                        )}
                      </div>
                      <div>
                        <span className="queue-time">{formatTime(item.createdat)}</span>
                        <div className="queue-wait">{getEstimatedTime(item)}</div>
                      </div>
                      <span className="queue-status waiting">Waiting</span>
                      <div className="queue-actions">
                        <button className="btn-cancel" onClick={() => handleCancel(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="queue-footer">
            <button className="add-queue-btn" onClick={() => setShowModal(true)}>
              + Add to Queue
            </button>
            {queueList.length > 0 && (
              <button
                className="seat-next-btn"
                onClick={handleSeatNext}
              >
                Seat Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Queue Modal */}
      <QueueModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Bookings;

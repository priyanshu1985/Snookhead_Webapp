import { useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/addqueue.css";

const dates = [
  "Today",
  "17sept",
  "18sept",
  "19sept",
  "20sept",
  "21sept",
  "22sept",
  "23sept",
];

const games = [
  { id: 1, name: "Snooker" },
  { id: 2, name: "Pool" },
  { id: 3, name: "Table Tennis" },
  { id: 4, name: "PS5" },
];

const AddQueue = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="add-queue-page">
          {/* Header */}
          <h5 className="mb-3">← Queue Management</h5>

          {/* Tabs */}
          <div className="queue-tabs">
            <button className="active">QUEUE</button>
            <button>UPCOMING RESERVATION</button>
          </div>

          {/* Date selector */}
          <div className="date-strip">
            {dates.map((d, i) => (
              <button key={i} className={d === "17sept" ? "active" : ""}>
                {d}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="queue-options">
            <label>
              <input type="radio" /> Set Time
            </label>
            <label>
              <input type="radio" /> Timer
            </label>
            <label>
              <input type="radio" /> Select Frame
            </label>
          </div>

          {/* Game cards */}
          <div className="game-selection">
            {games.map((game) => (
              <div className="game-card" key={game.id}>
                {game.name}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="queue-footer">
            <button className="next-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQueue;

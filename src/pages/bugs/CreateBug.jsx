import { useState, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/createBug.css";
import { useNavigate } from "react-router-dom";
import BugSuccessModal from "../../components/bugs/BugSuccessModal";

const CreateBug = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="create-bug-page">
          <h5>← Report a bug</h5>

          {/* Upload Image */}
          <div className="upload-box">
            <div className="upload-placeholder">Upload table image</div>
          </div>

          {/* Dropdown */}
          <select className="bug-select">
            <option>Select an option</option>
            <option>App Issue</option>
            <option>Billing Issue</option>
            <option>Game Issue</option>
            <option>Food Order Issue</option>
          </select>

          {/* Title */}
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <label>Description of bug (optional)</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Audio Section */}
          <div className="audio-section">
            <span>Or</span>
            <p className="record-text">Record the issue</p>

            <div className="mic-circle">🎤</div>
            <div className="audio-wave">████████████</div>

            <button className="pause-btn">⏸</button>
          </div>

          {/* Actions */}
          <div className="bug-actions">
            <button className="secondary">Report Again</button>
            <button className="primary" onClick={() => setShowSuccess(true)}>
              Continue
            </button>

            {showSuccess && (
              <BugSuccessModal
                onClose={() => setShowSuccess(false)}
                onBack={() => navigate("/report-bugs")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBug;

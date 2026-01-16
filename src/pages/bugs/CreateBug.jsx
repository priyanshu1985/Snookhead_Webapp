import { useState, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { bugsAPI } from "../../services/api";
import "../../styles/createBug.css";
import { useNavigate } from "react-router-dom";
import BugSuccessModal from "../../components/bugs/BugSuccessModal";

const categories = [
  { value: "App Issue", label: "App Issue" },
  { value: "Billing Issue", label: "Billing Issue" },
  { value: "Game Issue", label: "Game Issue" },
  { value: "Food Order Issue", label: "Food Order Issue" },
  { value: "Table Issue", label: "Table Issue" },
  { value: "Other", label: "Other" },
];

const CreateBug = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("App Issue");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Validate
    if (!title.trim()) {
      setError("Please enter a title for the bug");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await bugsAPI.create({
        title: title.trim(),
        description: description.trim() || null,
        category,
      });

      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to submit bug:", err);
      setError(err.message || "Failed to submit bug report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportAgain = () => {
    setTitle("");
    setDescription("");
    setCategory("App Issue");
    setError("");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/report-bugs");
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="create-bug-page">
          <h5 onClick={() => navigate("/report-bugs")} style={{ cursor: "pointer" }}>
            ← Report a bug
          </h5>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Upload Image */}
          <div className="upload-box">
            <div className="upload-placeholder">Upload table image</div>
          </div>

          {/* Dropdown */}
          <select
            className="bug-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Title */}
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            disabled={submitting}
          />

          {/* Description */}
          <label>Description of bug (optional)</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the bug..."
            disabled={submitting}
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
            <button
              className="secondary"
              onClick={handleReportAgain}
              disabled={submitting}
            >
              Clear Form
            </button>
            <button
              className="primary"
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>

            {showSuccess && (
              <BugSuccessModal
                onClose={handleSuccessClose}
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

import { useContext, useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { bugsAPI } from "../../services/api";
import "../../styles/reportBugs.css";
import { useNavigate } from "react-router-dom";

const ReportBugs = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch bugs from API
  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        setError("");
        const params = filter !== "all" ? { status: filter } : {};
        const data = await bugsAPI.getAll(params);
        setBugs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
        setError(err.message || "Failed to load bugs");
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, [filter]);

  // Map status to display text
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Reported";
      case "in_progress":
        return "In Process";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  // Map status to CSS class
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "reported";
      case "in_progress":
        return "progress";
      case "resolved":
        return "resolved";
      case "closed":
        return "closed";
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="bugs-page">
          <div className="bugs-header">
            <h5> List of Bugs reported</h5>
            <div className="filter-tabs">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={filter === "pending" ? "active" : ""}
                onClick={() => setFilter("pending")}
              >
                Reported
              </button>
              <button
                className={filter === "in_progress" ? "active" : ""}
                onClick={() => setFilter("in_progress")}
              >
                In Progress
              </button>
              <button
                className={filter === "resolved" ? "active" : ""}
                onClick={() => setFilter("resolved")}
              >
                Resolved
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="bug-list">
            {loading ? (
              <p className="loading-text">Loading bugs...</p>
            ) : bugs.length === 0 ? (
              <p className="empty-text">No bugs reported yet</p>
            ) : (
              bugs.map((bug) => (
                <div className={`bug-item ${getStatusClass(bug.status)}`} key={bug.id}>
                  <div className="bug-info">
                    <span className="bug-title">{bug.title}</span>
                    <span className="bug-meta">
                      {bug.category} • {formatDate(bug.createdAt)}
                    </span>
                  </div>

                  <span className={`status ${getStatusClass(bug.status)}`}>
                    {getStatusText(bug.status)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="bug-footer">
            <button
              className="report-btn"
              onClick={() => navigate("/report-bugs/create")}
            >
              Report A Bug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBugs;

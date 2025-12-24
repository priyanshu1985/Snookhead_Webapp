import { useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/reportBugs.css";
import { useNavigate } from "react-router-dom";

const bugs = [
  { id: 1, title: "Ticket number : 489748", status: "reported" },
  { id: 2, title: "Ticket number : 489748", status: "reported" },
  { id: 3, title: "App not working #53", status: "resolved" },
  { id: 4, title: "Ticket number : 453435", status: "progress" },
  { id: 5, title: "App not working #53", status: "resolved" },
  { id: 6, title: "App not working #53", status: "resolved" },
];

const ReportBugs = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="bugs-page">
          <h5>← List of Bugs reported</h5>

          <div className="bug-list">
            {bugs.map((bug) => (
              <div className={`bug-item ${bug.status}`} key={bug.id}>
                <span>{bug.title}</span>

                <span className={`status ${bug.status}`}>
                  {bug.status === "reported" && "Reported"}
                  {bug.status === "progress" && "In process"}
                  {bug.status === "resolved" && "Resolved"}
                </span>
              </div>
            ))}
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

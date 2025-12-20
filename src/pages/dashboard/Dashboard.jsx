import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import "../../styles/dashboard.css";

const tables = ["01", "02", "03", "04", "01", "02", "03", "04"];

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Body */}
        <div className="dashboard-content">
          {/* Category Tabs */}
          <div className="category-tabs">
            <button className="active">Snooker</button>
            <button>Pool</button>
            <button>PlayStation5</button>
            <button>Table Tennis</button>
          </div>

          {/* Tables Grid */}
          <div className="tables-grid">
            {tables.map((num, index) => (
              <div className="table-card" key={index}>
                <div className="table-number">{num}</div>
                <span className="table-status">Lost Receipt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

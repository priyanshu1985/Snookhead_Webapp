import { useEffect, useState, useContext } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import AddMemberModal from "../../components/member/AddMemberModel";
import { customersAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";

import "../../styles/members.css";

const Members = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await customersAPI.getAll();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="members-page">
          <div className="members-header">
            <h4>Members</h4>
            <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
              + Add Member
            </button>
          </div>

          {loading ? (
            <p>Loading members...</p>
          ) : error ? (
            <p className="error-message">Error: {error}</p>
          ) : (
            <table className="members-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {members.map((m, index) => (
                  <tr key={m.id}>
                    <td>{index + 1}</td>
                    <td>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>{m.email || "-"}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${m.is_active ? "active" : "inactive"}`}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
};

export default Members;

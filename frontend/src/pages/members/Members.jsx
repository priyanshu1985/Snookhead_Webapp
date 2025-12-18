import React, { useState } from "react";

const Members = () => {
  // TODO: Replace with API call
  const mockMembers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      membershipType: "Premium",
      joinDate: "2025-01-15",
      status: "active",
      totalGames: 45,
      totalSpent: 1250,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1234567891",
      membershipType: "Standard",
      joinDate: "2025-03-22",
      status: "active",
      totalGames: 28,
      totalSpent: 750,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      phone: "+1234567892",
      membershipType: "Basic",
      joinDate: "2025-06-10",
      status: "inactive",
      totalGames: 12,
      totalSpent: 300,
    },
  ];
  const [members] = useState(mockMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembershipClass = (type) => {
    switch (type) {
      case "Premium":
        return "membership-premium";
      case "Standard":
        return "membership-standard";
      case "Basic":
        return "membership-basic";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    return status === "active" ? "status-active" : "status-inactive";
  };

  return (
    <div className="members-page">
      <div className="page-header">
        <h1>Members Management</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          Add New Member
        </button>
      </div>

      <div className="members-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="members-grid">
        {filteredMembers.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-header">
              <h3>{member.name}</h3>
              <div className="member-badges">
                <span
                  className={`membership-badge ${getMembershipClass(
                    member.membershipType
                  )}`}
                >
                  {member.membershipType}
                </span>
                <span
                  className={`status-badge ${getStatusClass(member.status)}`}
                >
                  {member.status}
                </span>
              </div>
            </div>

            <div className="member-details">
              <p>
                <strong>Email:</strong> {member.email}
              </p>
              <p>
                <strong>Phone:</strong> {member.phone}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(member.joinDate).toLocaleDateString()}
              </p>
            </div>

            <div className="member-stats">
              <div className="stat">
                <span className="stat-label">Games Played</span>
                <span className="stat-value">{member.totalGames}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value">${member.totalSpent}</span>
              </div>
            </div>

            <div className="member-actions">
              <button className="btn-secondary">View Profile</button>
              <button className="btn-outline">Edit</button>
              <button className="btn-danger">Deactivate</button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="empty-state">
          <p>No members found matching your search.</p>
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form className="member-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" required />
                </div>
                <div className="form-group">
                  <label>Membership Type</label>
                  <select required>
                    <option value="">Select type</option>
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

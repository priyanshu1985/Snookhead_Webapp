import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import AddMemberModal from "../../components/member/AddMemberModel";
import { customersAPI, walletsAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";

import "../../styles/members.css";

const Members = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [members, setMembers] = useState([]);
  const [wallets, setWallets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const customersData = await customersAPI.getAll();
        setMembers(customersData);

            // Fetch all wallets and create a map by customer_id
        try {
          const walletsData = await walletsAPI.getAll();
          
          const walletMap = {};
          walletsData.forEach((w) => {
            // Backend might return lowercase keys (customerid) from direct DB query
            const cId = w.customer_id || w.customerid;
            if (cId) {
                walletMap[cId] = w;
            }
          });
          
          setWallets(walletMap);
        } catch (walletErr) {
          console.log("Could not fetch wallets:", walletErr.message);
        }
      } catch (err) {
        console.error("Failed to fetch members", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  // Get wallet balance for a member
  const getBalance = (memberId) => {
    const wallet = wallets[memberId];
    return wallet ? Number(wallet.balance || 0) : 0;
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (num < 0) {
      return `-₹${Math.abs(num).toFixed(2)}`;
    }
    return `₹${num.toFixed(2)}`;
  };

  // Get contact info (prefer phone, fallback to email)
  const getContact = (member) => {
    return member.phone || member.email || "-";
  };

  // Filter members based on active tab
  const getFilteredMembers = () => {
    switch (activeTab) {
      case "credits":
        // User Request: < 0 goes to Credits
        return members.filter((m) => getBalance(m.id) < 0);
      case "balance":
        // User Request: > 0 goes to Balance
        return members.filter((m) => getBalance(m.id) > 0);
      default:
        return members;
    }
  };

  const filteredMembers = getFilteredMembers();

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="members-page">
          {/* Tabs */}
          <div className="members-tabs">
            <button
              className={`members-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`members-tab ${activeTab === "credits" ? "active" : ""}`}
              onClick={() => setActiveTab("credits")}
            >
              Credits
            </button>
            <button
              className={`members-tab ${activeTab === "balance" ? "active" : ""}`}
              onClick={() => setActiveTab("balance")}
            >
              Balance
            </button>

            <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
              + Add Member
            </button>
          </div>

          {/* Members Table */}
          <div className="members-table-container">
            {loading ? (
              <p className="loading-text">Loading members...</p>
            ) : error ? (
              <p className="error-message">Error: {error}</p>
            ) : (
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Contact</th>
                    <th className="text-right">Balance amount</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-row">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const balance = getBalance(m.id);
                      return (
                        <tr
                          key={m.id}
                          className="clickable"
                          onClick={() => navigate(`/members/${m.id}`)}
                        >
                          <td className="customer-name">{m.name}</td>
                          <td className="contact">{getContact(m)}</td>
                          <td className={`balance-amount ${balance < 0 ? "negative" : balance > 0 ? "positive" : ""}`}>
                            {formatCurrency(balance)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
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

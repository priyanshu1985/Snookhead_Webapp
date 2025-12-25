import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { customersAPI, walletsAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/members.css";
import "../../styles/memberDetail.css";

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useContext(LayoutContext);

  const [member, setMember] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletError, setWalletError] = useState(null);

  // Add money modal state
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const memberData = await customersAPI.getById(id);
        setMember(memberData);

        // Try to fetch wallet data
        try {
          const walletData = await walletsAPI.getByCustomerId(id);
          setWallet(walletData);
        } catch (walletErr) {
          // Wallet may not exist for this customer
          if (walletErr.message.includes("not found")) {
            setWalletError("No wallet found for this member");
          } else {
            setWalletError(walletErr.message);
          }
        }
      } catch (err) {
        console.error("Failed to fetch member details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  const handleAddMoney = async () => {
    if (!addAmount || Number(addAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setAddingMoney(true);
      const result = await walletsAPI.addMoney(id, Number(addAmount));
      setWallet((prev) => ({
        ...prev,
        balance: result.new_balance,
      }));
      setShowAddMoneyModal(false);
      setAddAmount("");
      alert("Money added successfully!");
    } catch (err) {
      alert("Failed to add money: " + err.message);
    } finally {
      setAddingMoney(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      const result = await walletsAPI.create({
        customer_id: id,
        phone_no: member?.phone,
      });
      // Refetch wallet after creation
      const walletData = await walletsAPI.getByCustomerId(id);
      setWallet(walletData);
      setWalletError(null);
      alert("Wallet created successfully!");
    } catch (err) {
      alert("Failed to create wallet: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
        <div className="dashboard-main">
          <Navbar />
          <div className="member-detail-page">
            <p className="loading-text">Loading member details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
        <div className="dashboard-main">
          <Navbar />
          <div className="member-detail-page">
            <p className="error-message">Error: {error}</p>
            <button className="back-btn" onClick={() => navigate("/members")}>
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />
      <div className="dashboard-main">
        <Navbar />

        <div className="member-detail-page">
          <div className="member-detail-header">
            <button className="back-btn" onClick={() => navigate("/members")}>
              ← Back to Members
            </button>
            <h4>Member Details</h4>
          </div>

          <div className="member-detail-content">
            {/* Member Info Card */}
            <div className="detail-card member-info-card">
              <div className="card-header">
                <h5>Personal Information</h5>
                <span className={`status ${member?.is_active ? "active" : "inactive"}`}>
                  {member?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{member?.name || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{member?.phone || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{member?.email || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Join Date</label>
                    <span>{formatDate(member?.createdAt)}</span>
                  </div>
                  {member?.address && (
                    <div className="info-item full-width">
                      <label>Address</label>
                      <span>{member.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="detail-card wallet-card">
              <div className="card-header">
                <h5>Wallet</h5>
                {wallet && (
                  <button
                    className="add-money-btn"
                    onClick={() => setShowAddMoneyModal(true)}
                  >
                    + Add Money
                  </button>
                )}
              </div>
              <div className="card-body">
                {walletError ? (
                  <div className="no-wallet">
                    <p>{walletError}</p>
                    <button className="create-wallet-btn" onClick={handleCreateWallet}>
                      Create Wallet
                    </button>
                  </div>
                ) : wallet ? (
                  <div className="wallet-info">
                    <div className="wallet-balance">
                      <label>Current Balance</label>
                      <span className="balance-amount">
                        {formatCurrency(wallet.balance)}
                      </span>
                    </div>
                    <div className="wallet-details-grid">
                      <div className="wallet-detail-item">
                        <label>Currency</label>
                        <span>{wallet.currency || "INR"}</span>
                      </div>
                      <div className="wallet-detail-item">
                        <label>Credit Limit</label>
                        <span>{formatCurrency(wallet.credit_limit)}</span>
                      </div>
                      <div className="wallet-detail-item">
                        <label>QR ID</label>
                        <span>{wallet.qr_id || "N/A"}</span>
                      </div>
                      <div className="wallet-detail-item">
                        <label>Last Transaction</label>
                        <span>
                          {wallet.last_transaction_at
                            ? formatDate(wallet.last_transaction_at)
                            : "No transactions"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="loading-text">Loading wallet...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="member-modal-overlay" onClick={() => setShowAddMoneyModal(false)}>
          <div className="member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="member-modal-header">
              <h5>Add Money to Wallet</h5>
              <button className="close-btn" onClick={() => setShowAddMoneyModal(false)}>
                ×
              </button>
            </div>
            <div className="member-modal-body">
              <div className="form-group full-width">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
            </div>
            <div className="member-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowAddMoneyModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleAddMoney}
                disabled={addingMoney || !addAmount}
              >
                {addingMoney ? "Adding..." : "Add Money"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetail;

import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import PaymentModal from "../../components/billing/PaymentModal";
import BillHistoryModal from "../../components/billing/BillHistoryModal";
import { billingAPI } from "../../services/api";
import { LayoutContext } from "../../context/LayoutContext";

import "../../styles/billing.css";

const Billing = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [activeTab, setActiveTab] = useState("active");
  const [showPayment, setShowPayment] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch bills from API
  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billingAPI.getAll();
      const billsList = Array.isArray(data) ? data : [];
      setBills(billsList);
      setError("");
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Filter bills by status
  const activeBills = bills.filter((bill) => bill.status === "pending");
  const paidBills = bills.filter((bill) => bill.status === "paid");

  const billsToRender = activeTab === "active" ? activeBills : paidBills;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Get tags from bill items
  const getTags = (bill) => {
    const tags = [];
    if (bill.table_info?.game_name) tags.push(bill.table_info.game_name);
    if (bill.items_summary) {
      const items = bill.items_summary.split(", ").slice(0, 3);
      tags.push(...items);
    }
    return tags.length > 0 ? tags : ["Bill"];
  };

  // Handle view bill click
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    if (activeTab === "active") {
      setShowPayment(true);
    } else {
      setShowHistoryModal(true);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedBill(null);
    fetchBills(); // Refresh bills list
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="billing-page">
          <h5 className="mb-3">Bill Management</h5>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Tabs */}
          <div className="billing-tabs">
            <button
              className={activeTab === "active" ? "active" : ""}
              onClick={() => setActiveTab("active")}
            >
              ACTIVE BILLS ({activeBills.length})
            </button>

            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              BILL HISTORY ({paidBills.length})
            </button>
          </div>

          {/* List */}
          <div className="billing-list">
            {loading ? (
              <p className="loading-text">Loading bills...</p>
            ) : billsToRender.length === 0 ? (
              <p className="empty-text">
                {activeTab === "active"
                  ? "No active bills"
                  : "No bill history"}
              </p>
            ) : (
              billsToRender.map((bill, index) => (
                <div className="billing-item" key={bill.id}>
                  {/* Left */}
                  <div className="billing-left">
                    <span className="index">{index + 1}.</span>
                    <div>
                      <small className="date">{formatDate(bill.createdAt)}</small>
                      <div className="name">{bill.customer_name || "Customer"}</div>
                      <small className="bill-number">{bill.bill_number}</small>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="billing-tags">
                    {getTags(bill).map((tag, i) => (
                      <span className="tag" key={i}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Amount */}
                  <div className="billing-amount">
                    ₹{Number(bill.total_amount || 0).toFixed(2)}
                  </div>

                  {/* Action */}
                  <button
                    className={
                      activeTab === "active"
                        ? "view-bill-btn"
                        : "view-bill-btn history"
                    }
                    onClick={() => handleViewBill(bill)}
                  >
                    View Bill
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Popup (Active Bills only) */}
      {showPayment && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => {
            setShowPayment(false);
            setSelectedBill(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showHistoryModal && selectedBill && (
        <BillHistoryModal
          bill={selectedBill}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
};

export default Billing;

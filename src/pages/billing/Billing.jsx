import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import PaymentModal from "../../components/billing/PaymentModal";
import BillHistoryModal from "../../components/billing/BillHistoryModal";

import "../../styles/billing.css";

const activeBills = [
  {
    id: 1,
    date: "02/08/2025",
    name: "Amit sharma",
    tags: ["TT", "Food", "Cigaret", "Pool"],
  },
  {
    id: 2,
    date: "02/08/2025",
    name: "Hardik",
    tags: ["TT", "Food", "Cigaret", "Pool"],
  },
];

const billHistory = [
  {
    id: 1,
    date: "02/08/2025",
    name: "Amit sharma",
    tags: ["TT", "Food", "Cigaret", "Pool"],
  },
  {
    id: 2,
    date: "02/08/2025",
    name: "Hardik",
    tags: ["TT", "Food", "Cigaret", "Pool"],
  },
  {
    id: 3,
    date: "02/08/2025",
    name: "Rohit sharma",
    tags: ["TT", "Food", "Cigaret", "Pool"],
  },
];

const Billing = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [showPayment, setShowPayment] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const billsToRender = activeTab === "active" ? activeBills : billHistory;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="billing-page">
          <h5 className="mb-3">← Bill Management</h5>

          {/* Tabs */}
          <div className="billing-tabs">
            <button
              className={activeTab === "active" ? "active" : ""}
              onClick={() => setActiveTab("active")}
            >
              ACTIVE BILLS
            </button>

            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              BILL HISTORY
            </button>
          </div>

          {/* List */}
          <div className="billing-list">
            {billsToRender.map((bill, index) => (
              <div className="billing-item" key={bill.id}>
                {/* Left */}
                <div className="billing-left">
                  <span className="index">{index + 1}.</span>
                  <div>
                    <small className="date">{bill.date}</small>
                    <div className="name">{bill.name}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="billing-tags">
                  {bill.tags.map((tag, i) => (
                    <span className="tag" key={i}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <button
                  className={
                    activeTab === "active"
                      ? "view-bill-btn"
                      : "view-bill-btn history"
                  }
                  onClick={() => {
                    if (activeTab === "active") {
                      setShowPayment(true);
                    } else {
                      setShowHistoryModal(true);
                    }
                  }}
                >
                  View Bill
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Popup (Active Bills only) */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}

      {showHistoryModal && (
        <BillHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
};

export default Billing;

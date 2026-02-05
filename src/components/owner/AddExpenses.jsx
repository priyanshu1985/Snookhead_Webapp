import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { expensesAPI } from "../../services/api";

const AddExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Operational",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await expensesAPI.create({
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        description: formData.description
      });
      
      // Refresh list
      await fetchExpenses();
      
      setIsModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        category: "Operational",
        date: new Date().toISOString().split('T')[0],
        description: ""
      });
    } catch (err) {
      setError(err.message || "Failed to log expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesAPI.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete expense");
    }
  };

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const currentMonth = new Date().getMonth();
  const thisMonthExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth)
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div className="owners-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h5 style={{ margin: 0 }}>Expense Tracking</h5>
          <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
            Total: <strong>₹{totalExpenses.toLocaleString()}</strong> | This Month: <strong>₹{thisMonthExpenses.toLocaleString()}</strong>
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "#f08626",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "10px 24px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(240, 134, 38, 0.3)"
          }}
        >
          <span style={{ fontSize: "20px" }}>+</span> Log Expense
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>Loading expenses...</div>
      ) : expenses.length === 0 ? (
         <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No expenses logged yet.
        </div>
      ) : (
        <div className="expenses-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {expenses.map((expense) => {
            const categoryConfig = {
              Operational: { icon: "ri-tools-line", color: "#3498db", bg: "#e8f6fc" },
              Inventory: { icon: "ri-shopping-cart-2-line", color: "#9b59b6", bg: "#f5eef8" },
              Salary: { icon: "ri-user-smile-line", color: "#2ecc71", bg: "#eafaf1" },
              Utilities: { icon: "ri-lightbulb-flash-line", color: "#f1c40f", bg: "#fef9e7" },
              Marketing: { icon: "ri-megaphone-line", color: "#e67e22", bg: "#fdf2e9" },
              Other: { icon: "ri-file-list-3-line", color: "#95a5a6", bg: "#f4f6f6" }
            }[expense.category] || { icon: "ri-file-list-line", color: "#95a5a6", bg: "#f4f6f6" };

            return (
              <div 
                key={expense.id} 
                className="card" 
                style={{ 
                  padding: "16px", 
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                {/* ICON */}
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: categoryConfig.bg,
                  color: categoryConfig.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0
                }}>
                  <i className={categoryConfig.icon}></i>
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h6 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#2c3e50" }}>
                    {expense.title}
                  </h6>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#95a5a6" }}>
                    <span style={{ fontWeight: "500", color: categoryConfig.color }}>{expense.category}</span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {expense.description && (
                       <>
                        <span>•</span>
                        <span style={{ 
                          maxWidth: "150px", 
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis" 
                        }} title={expense.description}>
                          {expense.description}
                        </span>
                       </>
                    )}
                  </div>
                </div>
                
                {/* RIGHT SIDE */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#e74c3c", whiteSpace: "nowrap" }}>
                    - ₹{parseFloat(expense.amount).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    style={{ 
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "#fee",
                      border: "none", 
                      color: "#e74c3c", 
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s"
                    }}
                    title="Delete Expense"
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fcd"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fee"}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Log New Expense"
      >
        {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Expense Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. Table Cloth Replacement"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-control"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              <option value="Operational">Operational (Maintenance/Repairs)</option>
              <option value="Inventory">Inventory Purchase</option>
              <option value="Salary">Staff Salary</option>
              <option value="Utilities">Utilities (Bill, Internet)</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Additional details..."
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "80px" }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              marginTop: "10px",
              width: "100%"
            }}
          >
            {submitting ? "Saving..." : "Log Expense"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AddExpenses;

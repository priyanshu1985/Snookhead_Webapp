import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { usersAPI, attendanceAPI, ownerAPI } from "../../services/api";

const AddEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initial State Helper
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    salary_type: "monthly",
    salary_amount: "",
    shift: {
        start_time: "09:00",
        end_time: "17:00",
        work_days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      // Filter only staff and managers, exclude current user or customers if mixed
      const staffList = data.filter(u => u.role === 'staff' || u.role === 'manager' || u.role === 'admin'); 
      setEmployees(staffList);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Details/Edit Logic
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [activityStats, setActivityStats] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await usersAPI.create(formData);
      
      setFormData(initialFormState);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchActiveAttendance = async (userId) => {
    try {
        setCheckingAttendance(true);
        const data = await attendanceAPI.getActive(userId);
        setActiveAttendance(data);
    } catch (err) {
        console.error("Failed to fetch attendance", err);
    } finally {
        setCheckingAttendance(false);
    }
  };

  const handleCardClick = (emp) => {
    setSelectedEmp(emp);
    setIsDetailsModalOpen(true);
    setIsEditMode(false);
    setActiveAttendance(null); // Reset first
    setActivityStats(null); // Reset stats
    fetchActiveAttendance(emp.id);
    fetchActivityStats(emp.id);

    // Reset form for editing
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      salary_type: emp.salary_type || "monthly",
      salary_amount: emp.salary_amount || "",
      password: "",
      confirmPassword: "",
      shift: { ...initialFormState.shift } 
    });
  };

  const fetchActivityStats = async (userId) => {
      try {
          // Default: Fetch for today
          const data = await ownerAPI.getEmployeeActivity(userId);
          setActivityStats(data);
      } catch (err) {
          console.error("Failed to fetch activity stats", err);
      }
  };

  const handleCheckIn = async () => {
    if (!selectedEmp) return;
    try {
        setCheckingAttendance(true);
        await attendanceAPI.checkIn(selectedEmp.id);
        await fetchActiveAttendance(selectedEmp.id);
    } catch (err) {
        alert("Check-in failed: " + err.message);
    } finally {
        setCheckingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmp || !activeAttendance) return;
    try {
        setCheckingAttendance(true);
        await attendanceAPI.checkOut(selectedEmp.id, activeAttendance.id);
        setActiveAttendance(null);
    } catch (err) {
        alert("Check-out failed: " + err.message);
    } finally {
        setCheckingAttendance(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    if (!window.confirm(`Are you sure you want to remove ${selectedEmp.name}?`)) return;

    try {
      await usersAPI.delete(selectedEmp.id);
      setIsDetailsModalOpen(false);
      await fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee: " + err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      setSubmitting(true);
      await usersAPI.update(selectedEmp.id, {
        name: formData.name,
        phone: formData.phone,
        salary_type: formData.salary_type,
        salary_amount: formData.salary_amount
      });
      
      if (formData.role !== selectedEmp.role) {
         await usersAPI.changeRole(selectedEmp.id, formData.role);
      }

      await fetchEmployees();
      setIsDetailsModalOpen(false);
      setIsEditMode(false);
    } catch (err) {
      setError(err.message || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to close everything
  const closeDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedEmp(null);
  };

  const handleShiftDayChange = (day) => {
     const days = formData.shift.work_days.includes(day)
        ? formData.shift.work_days.filter(d => d !== day)
        : [...formData.shift.work_days, day];
     setFormData({ ...formData, shift: { ...formData.shift, work_days: days } });
  };

  return (
    <div className="owners-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h5>Employee Management</h5>
        <button 
          onClick={() => {
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
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
          <span style={{ fontSize: "20px" }}>+</span> Add Employee
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No employees added yet.
        </div>
      ) : (
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "20px" 
          }}
        >
          {employees.map((emp) => (
            <div 
              key={emp.id} 
              className="card" 
              onClick={() => handleCardClick(emp)}
              style={{ 
                padding: "20px", 
                margin: 0,
                borderLeft: emp.role === 'manager' || emp.role === 'admin' ? '4px solid #f08626' : '4px solid #ccc',
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                <div 
                  style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    background: "#f5f5f5", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "#555",
                    textTransform: "uppercase"
                  }}
                >
                  {emp.name.charAt(0)}
                </div>
                <span 
                  style={{ 
                    background: emp.role === 'manager' || emp.role === 'admin' ? '#FFF3E0' : '#f5f5f5', 
                    color: emp.role === 'manager' || emp.role === 'admin' ? '#f08626' : '#666',
                    padding: "4px 12px", 
                    borderRadius: "15px", 
                    fontSize: "12px", 
                    fontWeight: "600",
                    textTransform: "capitalize"
                  }}
                >
                  {emp.role}
                </span>
              </div>
              
              <h6 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{emp.name}</h6>
              <p style={{ margin: "0 0 15px 0", color: "#888", fontSize: "14px" }}>{emp.email}</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>
                 {emp.salary_type === 'hourly' ? `₹${emp.salary_amount}/hr` : `₹${emp.salary_amount}/mo`}
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "14px" }}>
                <i className="ri-phone-line"></i> {emp.phone || "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL FORM */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Employee"
      >
        {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Basic Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" placeholder="e.g. John Doe" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder="e.g. 9876543210" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
              </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
               <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" placeholder="e.g. john@snookhead.com" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-control" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
          </div>

          <hr style={{border: 'none', borderTop: '1px solid #eee', margin: '4px 0'}} />
          <h6 style={{margin:0, fontSize: '14px', color:'var(--primary-color)'}}>Salary</h6>
         
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Salary Type</label>
                <select name="salary_type" value={formData.salary_type} onChange={handleChange} className="form-control" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                  <option value="monthly">Monthly Salary</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Amount (₹)</label>
                <input type="number" name="salary_amount" value={formData.salary_amount} onChange={handleChange} placeholder="0.00" className="form-control" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
              </div>
          </div>
          
           <hr style={{border: 'none', borderTop: '1px solid #eee', margin: '4px 0'}} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-control" placeholder="Min 6 chars" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
            </div>
            <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>Confirm PW</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="form-control" placeholder="Confirmation" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
            </div>
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
              marginTop: "5px",
              width: "100%"
            }}
          >
            {submitting ? "Creating..." : "Create Employee Account"}
          </button>
        </form>
      </Modal>

      {/* DETAILS / EDIT MODAL */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={closeDetails} 
        title={isEditMode ? "Edit Employee" : "Employee Details"}
      >
        {selectedEmp && (
          isEditMode ? (
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
              </div>

               <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Salary</label>
                <div style={{display:'flex', gap:'5px'}}>
                     <select name="salary_type" value={formData.salary_type} onChange={handleChange} className="form-control" style={{ width: "40%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}>
                        <option value="monthly">Monthly</option>
                        <option value="hourly">Hourly</option>
                    </select>
                    <input type="number" name="salary_amount" value={formData.salary_amount} onChange={handleChange} placeholder="Amount" className="form-control" style={{ width: "60%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
                </div>
              </div>
              
              {/* Note: Full Shift editing optional, keeping simple for now */}
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-control" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                 <button type="submit" disabled={submitting} style={{ flex: 1, padding: "12px", background: "#f08626", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setIsEditMode(false)} style={{ flex: 0.5, padding: "12px", background: "#f5f5f5", color: "#333", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* ... Existing details view ... */}
               <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                 <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f08626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "white", textTransform: "uppercase" }}>{selectedEmp.name.charAt(0)}</div>
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>{selectedEmp.name}</h4>
                  <span style={{ background: "#f5f5f5", color: "#666", padding: "4px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>{selectedEmp.role}</span>
                </div>
              </div>

              {activityStats && (
                  <div style={{ background: "linear-gradient(135deg, #fff3e0, #ffffff)", padding: "12px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #ffe0b2" }}>
                      <h6 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#e65100", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="ri-bar-chart-fill"></i> Today's Activity
                      </h6>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "white", padding: "8px", borderRadius: "6px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>{activityStats.tables_booked}</div>
                              <div style={{ fontSize: "11px", color: "#888" }}>Tables</div>
                          </div>
                          <div style={{ background: "white", padding: "8px", borderRadius: "6px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>{activityStats.bills_generated}</div>
                              <div style={{ fontSize: "11px", color: "#888" }}>Bills</div>
                          </div>
                          <div style={{ background: "white", padding: "8px", borderRadius: "6px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2e7d32" }}>₹{activityStats.bill_revenue}</div>
                              <div style={{ fontSize: "11px", color: "#888" }}>Revenue</div>
                          </div>
                          <div style={{ background: "white", padding: "8px", borderRadius: "6px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1976d2" }}>{activityStats.hours_worked}</div>
                              <div style={{ fontSize: "11px", color: "#888" }}>Hours</div>
                          </div>
                      </div>
                  </div>
              )}

              <div style={{ background: "#fafafa", padding: "15px", borderRadius: "10px" }}>
                 {/* Attendance Section */}
                 <div style={{ marginBottom: "15px", padding: "10px", background: activeAttendance ? "#e8f5e9" : "#fff3e0", borderRadius: "8px", border: activeAttendance ? "1px solid #c8e6c9" : "1px solid #ffe0b2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: activeAttendance ? "#2e7d32" : "#e65100", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {activeAttendance ? "Currently Working" : "Not Checked In"}
                            </div>
                            {activeAttendance && (
                                <div style={{ fontSize: "13px", marginTop: "4px", color: "#555" }}>
                                    Started: {new Date(activeAttendance.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={activeAttendance ? handleCheckOut : handleCheckIn}
                            disabled={checkingAttendance}
                            style={{
                                padding: "6px 16px",
                                background: activeAttendance ? "#ff5252" : "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "50px",
                                fontWeight: "600",
                                fontSize: "13px",
                                cursor: checkingAttendance ? "wait" : "pointer",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                            }}
                        >
                            {checkingAttendance ? "..." : (activeAttendance ? "Check Out" : "Check In")}
                        </button>
                    </div>
                 </div>

                <div style={{ marginBottom: "10px", display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   <div>
                      <label style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", fontWeight: "600" }}>Email</label>
                      <div style={{ fontSize: "14px", color: "#333", wordBreak: 'break-all' }}>{selectedEmp.email}</div>
                   </div>
                   <div>
                      <label style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", fontWeight: "600" }}>Phone</label>
                      <div style={{ fontSize: "14px", color: "#333" }}>{selectedEmp.phone || "N/A"}</div>
                   </div>
                </div>
                 <div>
                      <label style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", fontWeight: "600" }}>Salary</label>
                      <div style={{ fontSize: "16px", color: "#333", fontWeight: 'bold' }}>
                        {selectedEmp.salary_type === 'hourly' ? `₹${selectedEmp.salary_amount}/hr` : `₹${selectedEmp.salary_amount}/mo`}
                      </div>
                   </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => setIsEditMode(true)} style={{ flex: 1, padding: "12px", background: "#333", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <i className="ri-pencil-line"></i> Edit Details
                </button>
                <button onClick={handleDelete} style={{ flex: 1, padding: "12px", background: "#fff", color: "#e74c3c", border: "1px solid #e74c3c", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <i className="ri-delete-bin-line"></i> Remove
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default AddEmployee;

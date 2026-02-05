import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/api";
import "../../styles/dashboard.css"; // Reuse dashboard styles for cards

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActiveAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await attendanceAPI.getActive(user.id);
      setActiveAttendance(data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      // Don't show error for 404 (just means not checked in)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAttendance();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    try {
      setCheckingAttendance(true);
      setError("");
      await attendanceAPI.checkIn(user.id);
      await fetchActiveAttendance();
    } catch (err) {
      setError("Check-in failed: " + err.message);
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !activeAttendance) return;
    try {
      setCheckingAttendance(true);
      setError("");
      await attendanceAPI.checkOut(user.id, activeAttendance.id);
      setActiveAttendance(null);
    } catch (err) {
      setError("Check-out failed: " + err.message);
    } finally {
      setCheckingAttendance(false);
    }
  };

  if (loading && !activeAttendance) {
    return <div className="p-4">Loading attendance status...</div>;
  }

  return (
    <div className="attendance-page" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>My Attendance</h2>
      
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "15px", padding: "10px", background: "#fdecea", color: "#d9534f", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", maxWidth: "500px" }}>
        <h5 style={{ marginBottom: "15px", color: "#555" }}>Current Status</h5>
        
        <div style={{ 
          padding: "20px", 
          background: activeAttendance ? "#e8f5e9" : "#fff3e0", 
          borderRadius: "8px", 
          border: activeAttendance ? "1px solid #c8e6c9" : "1px solid #ffe0b2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "700", 
              color: activeAttendance ? "#2e7d32" : "#e65100", 
              textTransform: "uppercase", 
              letterSpacing: "1px",
              marginBottom: "5px"
            }}>
              {activeAttendance ? "Currently Working" : "Not Checked In"}
            </div>
            {activeAttendance && (
              <div style={{ fontSize: "14px", color: "#555" }}>
                Started: {new Date(activeAttendance.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
           {!activeAttendance && (
              <div style={{ fontSize: "14px", color: "#555" }}>
                Ready to start your shift?
              </div>
            )}
          </div>

          <button 
            onClick={activeAttendance ? handleCheckOut : handleCheckIn}
            disabled={checkingAttendance}
            style={{
              padding: "12px 30px",
              background: activeAttendance ? "#ff5252" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: checkingAttendance ? "wait" : "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.1s",
              minWidth: "150px"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {checkingAttendance ? "Processing..." : (activeAttendance ? "Check Out" : "Check In")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;

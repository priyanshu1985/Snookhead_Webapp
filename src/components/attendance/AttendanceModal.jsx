import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { attendanceAPI } from "../../services/api";

const AttendanceModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActiveAttendance = async () => {
    if (!user || !isOpen) return;
    try {
      setLoading(true);
      const data = await attendanceAPI.getActive(user.id);
      setActiveAttendance(data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        fetchActiveAttendance();
        setError("");
    }
  }, [isOpen, user]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Attendance">
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Loading status...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", padding: "10px" }}>
            
          {error && (
            <div className="alert alert-danger" style={{ width: "100%", padding: "10px", background: "#fdecea", color: "#d9534f", borderRadius: "4px", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ 
            width: "100%",
            padding: "20px", 
            background: activeAttendance ? "#e8f5e9" : "#fff3e0", 
            borderRadius: "12px", 
            border: activeAttendance ? "1px solid #c8e6c9" : "1px solid #ffe0b2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "700", 
                color: activeAttendance ? "#2e7d32" : "#e65100", 
                textTransform: "uppercase", 
                letterSpacing: "1px",
                marginBottom: "5px"
              }}>
                {activeAttendance ? "Active Shift" : "Off Duty"}
              </div>
              {activeAttendance ? (
                <div style={{ fontSize: "14px", color: "#555" }}>
                  Started: {new Date(activeAttendance.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              ) : (
                 <div style={{ fontSize: "14px", color: "#555" }}>
                  Ready to start work?
                </div>
              )}
            </div>
            
            <div style={{ width: "100%", height: "1px", background: activeAttendance ? "#c8e6c9" : "#ffe0b2", margin: "5px 0" }}></div>

            <button 
                onClick={activeAttendance ? handleCheckOut : handleCheckIn}
                disabled={checkingAttendance}
                style={{
                width: "100%",
                padding: "14px",
                background: activeAttendance ? "#ef5350" : "#66bb6a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "16px",
                cursor: checkingAttendance ? "wait" : "pointer",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
                }}
            >
                {checkingAttendance ? (
                    <span>Processing...</span>
                ) : (
                    <>
                        <i className={activeAttendance ? "ri-logout-box-r-line" : "ri-login-box-line"} style={{ fontSize: "20px" }}></i>
                        {activeAttendance ? "Check Out Now" : "Check In Now"}
                    </>
                )}
            </button>
          </div>
          
           <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
              {activeAttendance 
                 ? "Don't forget to check out when you leave!" 
                 : "Your shift hours will be calculated from check-in time."}
           </div>
        </div>
      )}
    </Modal>
  );
};

export default AttendanceModal;

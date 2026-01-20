import React, { useState, useEffect } from "react";
import { ownerAPI } from "../../services/api";

const OwnerSafetyPanel = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await ownerAPI.checkSetupStatus();
      setNeedsSetup(response.needsSetup);
      setLoading(false);
    } catch (err) {
      setError("Failed to check owner panel status.");
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    try {
      setLoading(true);
      await ownerAPI.setupPassword(password, confirmPassword);
      setNeedsSetup(false);
      setIsVerified(true); // Auto verified after setup
      setError("");
    } catch (err) {
      setError(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      await ownerAPI.verifyPassword(password);
      setIsVerified(true);
      setError("");
    } catch (err) {
      setError("Incorrect password");
      // Don't show specific error for security, or show from API
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
      // Just reload page or navigate away? 
      // For prompt, user said "after he sets the password one time the after that every time he logins the screen will apear"
      // So verify is enough.
      window.location.reload();
  };

  if (loading) {
    return <div className="owner-safety-overlay"><p>Loading security check...</p></div>;
  }

  // If verified, show the actual dashboard (children)
  if (isVerified) {
    return <>{children}</>;
  }

  // Use inline styles or re-use existing CSS classes
  // Mimicking the style from OwnersPanel.jsx
  return (
    <div className="owners-auth">
       <h5>Owners panel</h5>

      {needsSetup ? (
        <>
          <p className="title">Set Owner Password</p>
          <p className="subtitle" style={{marginBottom: '20px', fontSize: '0.9rem', color: '#666'}}>
            Set a secure password for future access.
          </p>
          
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{marginBottom: '10px'}}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
           {error && <p className="error" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
          <button onClick={handleSetup} style={{marginTop: '20px'}}>Set Password</button>
        </>
      ) : (
        <>
          <p className="title">Enter Owner Password</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
          <span className="forgot">Forgot your password? Contact Admin.</span>
          <button onClick={handleVerify}>Access Dashboard</button>
        </>
      )}
    </div>
  );
};

export default OwnerSafetyPanel;

import React, { useState, useEffect } from "react";
import { ownerAPI } from "../../services/api";
import { Shield, Lock, Key, AlertTriangle } from "react-feather";

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

  if (loading) {
    return <div className="owner-safety-overlay"><p>Loading security check...</p></div>;
  }

  // If verified, show the actual dashboard (children)
  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="owner-login-container">
      {/* Background Decorations */}
      <div className="login-bg-pattern">
         <Shield className="bg-icon icon-1" />
         <Lock className="bg-icon icon-2" />
         <div className="bg-grid"></div>
      </div>

      <div className="owner-auth-card">
        <div className="auth-header">
           <div className="icon-badge">
              <Shield size={32} />
           </div>
           <h5>Owner Access</h5>
           <p className="subtitle">Secure Dashboard Entry</p>
        </div>

      {needsSetup ? (
        <div className="auth-form">
          <p className="form-instruction">
            Welcome! Please set a secure password for your owner dashboard.
          </p>
          
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

           {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
          
          <button onClick={handleSetup} className="auth-btn">
             Set Password & Login
          </button>
        </div>
      ) : (
        <div className="auth-form">
          <div className="input-group">
            <Key className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Enter Access Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>

          {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}
          
          <button onClick={handleVerify} className="auth-btn">
            Access Dashboard
          </button>
          
          <div className="auth-footer">
             <span className="forgot">Forgot password? Contact Administrator</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OwnerSafetyPanel;

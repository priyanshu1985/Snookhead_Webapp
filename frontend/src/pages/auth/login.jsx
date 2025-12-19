import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks";
import "../../styles/auth.css";

const Login = () => {
  const { login, user, loading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "demo@gmail.com",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        // Navigation will happen automatically via ProtectedRoute redirect
        console.log("Login successful");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Use demo credentials for quick login
      const result = await login("demo@gmail.com", "password123");
      if (result.success) {
        console.log("Quick login successful");
      }
    } catch (err) {
      setError(err.message || "Quick login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-header">
          <div className="brand-logo">
            <i className="fas fa-circle"></i>
            <span className="brand-name">SNOKEHEAD</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <h1 className="auth-title">Sign in</h1>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="demo@gmail.com"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="Enter your password"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox-input"
                  />
                  <label htmlFor="remember" className="checkbox-label">
                    <i className="fas fa-check"></i>
                    Remember Me
                  </label>
                </div>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading || loading}
              >
                {isLoading || loading ? "Signing In..." : "Login"}
              </button>
            </form>

            {/* Quick Test Login Button */}
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button
                type="button"
                className="auth-button"
                style={{
                  background: "#28a745",
                  fontSize: "14px",
                  padding: "12px 20px",
                  opacity: isLoading || loading ? 0.6 : 1,
                }}
                disabled={isLoading || loading}
                onClick={handleQuickLogin}
              >
                {isLoading || loading ? "Logging In..." : "Quick Login (Demo)"}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an Account?{" "}
                <Link to="/register" className="signup-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="home-indicator"></div>
      </div>
    </div>
  );
};

export default Login;

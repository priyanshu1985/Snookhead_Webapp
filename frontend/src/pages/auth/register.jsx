import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks";
import "../../styles/auth.css";

const Register = () => {
  const { register, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      // Navigation will happen automatically via context
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
            <h1 className="auth-title">Sign up</h1>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="Enter your full name"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="Enter your email"
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
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="Enter your password"
                    className="auth-input"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading || loading}
                    placeholder="Confirm your password"
                    className="auth-input"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading || loading}
              >
                {isLoading || loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an Account?{" "}
                <Link to="/login" className="signup-link">
                  Sign in
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

export default Register;

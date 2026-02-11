import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/custom.css";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Please enter your email address";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    setFieldError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setTouched(true);

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        setEmail("");
        setTouched(false);
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      
      const errorMessage = err.message || "";
      
      if (errorMessage.includes("not found") || errorMessage.includes("No user") || errorMessage.includes("does not exist")) {
        setError({
          title: "User Not Found",
          message: "No account found with this email address. Please check your email or create a new account.",
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setError({
          title: "Connection Error",
          message: "Unable to connect to the server. Please check your internet connection and try again.",
        });
      } else {
        setError({
          title: "Error",
          message: errorMessage || "Something went wrong. Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-11 col-sm-9 col-md-6 col-lg-4">
          <div className="login-card shadow-sm">
            {/* Brand */}
            <div className="text-center mb-4">
              <img
                src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : ""}/static/app-logo/logo.jpg`}
                alt="Logo"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  marginBottom: "10px",
                }}
              />
              <h4 className="fw-bold brand-title">SNOOKHEAD</h4>
              <p className="text-muted small">Reset your password</p>
            </div>

            {/* Success Message */}
            {success && (
              <div
                className="alert alert-success d-flex align-items-start mb-3"
                role="alert"
                style={{
                  borderRadius: "10px",
                  padding: "12px 16px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                  color: "#166534",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="me-2"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "14px" }}>
                    Reset Link Sent Successfully!
                  </strong>
                  <span style={{ fontSize: "13px" }}>
                    We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
                  </span>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center mb-3"
                role="alert"
                style={{
                  borderRadius: "10px",
                  padding: "12px 16px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="me-2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "14px" }}>
                    {error.title}
                  </strong>
                  <span style={{ fontSize: "13px" }}>{error.message}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                  style={{ marginLeft: "8px" }}
                ></button>
              </div>
            )}

            {/* Instruction Text */}
            {!success && (
              <div className="mb-4 text-center">
                <p className="text-muted small mb-0">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} noValidate>
                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${touched && fieldError ? "is-invalid" : ""} ${touched && !fieldError && email ? "is-valid" : ""}`}
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched) {
                        setFieldError(validateEmail(e.target.value));
                      }
                    }}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                  />
                  {touched && fieldError && (
                    <div className="field-error">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {fieldError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 fw-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="text-center mt-3">
              <Link
                to="/login"
                className="text-warning text-decoration-none small"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

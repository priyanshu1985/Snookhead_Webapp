import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/custom.css";

const validatePassword = (password) => {
  if (!password) return "Please enter your new password";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false);
      setError({
        title: "Invalid Link",
        message: "This password reset link is invalid. Please request a new one.",
      });
    }
  }, [token]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "password") {
      const passwordError = validatePassword(password);
      setFieldErrors((prev) => ({ ...prev, password: passwordError }));
    }
    if (field === "confirmPassword") {
      const confirmError = password !== confirmPassword ? "Passwords do not match" : null;
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setTouched({ password: true, confirmPassword: true });

    // Validate
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? "Passwords do not match" : null;

    if (passwordError || confirmError) {
      setFieldErrors({ password: passwordError, confirmPassword: confirmError });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
        setPassword("");
        setConfirmPassword("");
        setTouched({});
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      
      const errorMessage = err.message || "";
      
      if (errorMessage.includes("expired") || errorMessage.includes("invalid token")) {
        setError({
          title: "Link Expired",
          message: "This password reset link has expired or is invalid. Please request a new one.",
        });
        setTokenValid(false);
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
              <p className="text-muted small">Set your new password</p>
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
                    Password Reset Successfully!
                  </strong>
                  <span style={{ fontSize: "13px" }}>
                    Your password has been updated. You can now log in with your new password. Redirecting to login...
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

            {/* Form */}
            {!success && tokenValid && (
              <form onSubmit={handleSubmit} noValidate>
                {/* New Password Field */}
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${touched.password && fieldErrors.password ? "is-invalid" : ""} ${touched.password && !fieldErrors.password && password ? "is-valid" : ""}`}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: validatePassword(e.target.value),
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("password")}
                    disabled={isLoading}
                    autoComplete="new-password"
                    autoFocus
                  />
                  {touched.password && fieldErrors.password && (
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
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${touched.confirmPassword && fieldErrors.confirmPassword ? "is-invalid" : ""} ${touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword ? "is-valid" : ""}`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: password !== e.target.value ? "Passwords do not match" : null,
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
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
                      {fieldErrors.confirmPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 fw-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            )}

            {/* Back to Login or Request New Link */}
            <div className="text-center mt-3">
              {!tokenValid ? (
                <Link
                  to="/forgot-password"
                  className="text-warning text-decoration-none small"
                >
                  Request New Reset Link
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-warning text-decoration-none small"
                >
                  ← Back to Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/custom.css";

// Error messages mapping for user-friendly display
const getErrorMessage = (error) => {
  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code || "";

  // Network errors - check first as it's most specific
  if (errorMessage.includes("network") || errorMessage.includes("fetch") ||
      errorMessage.includes("failed to fetch") || errorCode === "ERR_NETWORK" ||
      errorMessage.includes("connection") || errorMessage.includes("offline")) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      type: "network"
    };
  }

  // User not found - check before invalid credentials
  if (errorMessage.includes("not found") || errorMessage.includes("no user") ||
      errorMessage.includes("doesn't exist") || errorMessage.includes("does not exist") ||
      errorMessage.includes("no account") || errorMessage.includes("user not") ||
      errorMessage.includes("not registered") || errorMessage.includes("no such user")) {
    return {
      title: "User Does Not Exist",
      message: "No account found with this email address. Please check your email or create a new account.",
      type: "not-found"
    };
  }

  // Invalid credentials - wrong password or general auth failure
  if (errorMessage.includes("invalid") || errorMessage.includes("incorrect") ||
      errorMessage.includes("wrong") || errorMessage.includes("401") ||
      errorMessage.includes("unauthorized") || errorMessage.includes("credential") ||
      errorMessage.includes("password") || errorMessage.includes("authentication failed") ||
      errorMessage.includes("login failed") || errorMessage.includes("mismatch")) {
    return {
      title: "Invalid Credentials",
      message: "The email address or password is incorrect. Please check your details and try again.",
      type: "credentials"
    };
  }

  // Account locked/disabled
  if (errorMessage.includes("locked") || errorMessage.includes("disabled") ||
      errorMessage.includes("blocked") || errorMessage.includes("suspended") ||
      errorMessage.includes("deactivated")) {
    return {
      title: "Account Locked",
      message: "Your account has been temporarily locked. Please contact support or try again later.",
      type: "locked"
    };
  }

  // Too many attempts
  if (errorMessage.includes("too many") || errorMessage.includes("rate limit") ||
      errorMessage.includes("try again later") || errorMessage.includes("attempts")) {
    return {
      title: "Too Many Attempts",
      message: "Too many login attempts. Please wait a few minutes before trying again.",
      type: "rate-limit"
    };
  }

  // Server error
  if (errorMessage.includes("500") || errorMessage.includes("server error") ||
      errorMessage.includes("internal")) {
    return {
      title: "Server Error",
      message: "Something went wrong on our end. Please try again in a few moments.",
      type: "server"
    };
  }

  // Default error - show as invalid credentials
  return {
    title: "Invalid Credentials",
    message: "The email address or password is incorrect. Please check your details and try again.",
    type: "credentials"
  };
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Please enter your email address";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (password) => {
  if (!password) return "Please enter your password";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate individual field on blur
    if (field === "email") {
      const emailError = validateEmail(email);
      setFieldErrors(prev => ({ ...prev, email: emailError }));
    }
    if (field === "password") {
      const passwordError = validatePassword(password);
      setFieldErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled by AppRoutes based on role
      // Force a re-render by navigating to current location
      window.location.href = "/";
    } catch (err) {
      // Set error state to display on UI
      const errorInfo = getErrorMessage(err);
      setError(errorInfo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid">
      <div className="row min-vh-100 align-items-center justify-content-center">
        {/* Login Card */}
        <div className="col-11 col-sm-9 col-md-6 col-lg-4">
          <div className="login-card shadow-sm">
            {/* Brand */}
            <div className="text-center mb-4">
              <h4 className="fw-bold brand-title">SNOKEHEAD</h4>
              <p className="text-muted small">Sign in to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Main Error Alert - Simple Bootstrap Alert */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert" style={{
                  borderRadius: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{error.title}</strong>
                    <span style={{ fontSize: '13px' }}>{error.message}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                    style={{ marginLeft: '8px' }}
                  ></button>
                </div>
              )}

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${touched.email && fieldErrors.email ? "is-invalid" : ""} ${touched.email && !fieldErrors.email && email ? "is-valid" : ""}`}
                  placeholder="demo@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) {
                      setFieldErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
                    }
                  }}
                  onBlur={() => handleBlur("email")}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {touched.email && fieldErrors.email && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${touched.password && fieldErrors.password ? "is-invalid" : ""} ${touched.password && !fieldErrors.password && password ? "is-valid" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setFieldErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                    }
                  }}
                  onBlur={() => handleBlur("password")}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {touched.password && fieldErrors.password && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>

                <span className="text-warning small cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center mt-3 small">
              Don't have an account?{" "}
              <Link to="/register" className="text-warning text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

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

  // Email/User already exists - most common registration error
  if (errorMessage.includes("already") || errorMessage.includes("exists") ||
      errorMessage.includes("duplicate") || errorMessage.includes("taken") ||
      errorMessage.includes("409") || errorMessage.includes("conflict") ||
      errorMessage.includes("registered") || errorMessage.includes("in use") ||
      errorMessage.includes("email is already") || errorMessage.includes("user already") ||
      errorMessage.includes("account already") || errorMessage.includes("unique")) {
    return {
      title: "User Already Exists",
      message: "An account with this email already exists. Please sign in instead or use a different email address.",
      type: "duplicate"
    };
  }

  // Invalid email format
  if (errorMessage.includes("invalid email") || errorMessage.includes("email format") ||
      errorMessage.includes("valid email")) {
    return {
      title: "Invalid Email",
      message: "Please enter a valid email address.",
      type: "validation"
    };
  }

  // Password too weak
  if (errorMessage.includes("password") && (errorMessage.includes("weak") ||
      errorMessage.includes("strong") || errorMessage.includes("requirement"))) {
    return {
      title: "Weak Password",
      message: "Please choose a stronger password with at least 8 characters, including letters and numbers.",
      type: "validation"
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

  // Default error - check if it might be a duplicate user error
  if (errorMessage.includes("email") || errorMessage.includes("user")) {
    return {
      title: "User Already Exists",
      message: "An account with this email may already exist. Please try signing in or use a different email.",
      type: "duplicate"
    };
  }

  // Generic default error
  return {
    title: "Registration Failed",
    message: error?.message || "Unable to create your account. Please check your details and try again.",
    type: "general"
  };
};

// Validation helpers
const validateName = (name) => {
  if (!name.trim()) return "Please enter your full name";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 50) return "Name must be less than 50 characters";
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Please enter your email address";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePhone = (phone) => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
  return null;
};

const validatePassword = (password) => {
  if (!password) return "Please enter a password";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

// Password strength calculator
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 1) return { level: 1, label: "Weak", color: "#dc3545" };
  if (strength <= 2) return { level: 2, label: "Fair", color: "#ffc107" };
  if (strength <= 3) return { level: 3, label: "Good", color: "#17a2b8" };
  return { level: 4, label: "Strong", color: "#28a745" };
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "staff",
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for touched fields
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "password":
        error = validatePassword(value);
        // Also revalidate confirm password when password changes
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(value, formData.confirmPassword);
          setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    const errors = {};

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (passwordError) errors.password = passwordError;
    if (confirmError) errors.confirmPassword = confirmError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Pass all form data to register (excluding confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      // Force page reload to trigger AppRoutes role-based routing
      window.location.href = "/";
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo);
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="login-page container-fluid">
      <div className="row min-vh-100 align-items-center justify-content-center">
        {/* Register Card */}
        <div className="col-11 col-sm-9 col-md-6 col-lg-4">
          <div className="login-card shadow-sm">
            {/* Brand */}
            <div className="text-center mb-4">
              <h4 className="fw-bold brand-title">SNOKEHEAD</h4>
              <p className="text-muted small">Create your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Main Error Alert */}
              {error && (
                <div className={`auth-error-box error-${error.type}`} role="alert">
                  <div className="error-icon">
                    {error.type === "network" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 1l22 22M9 9a3 3 0 014.24 4.24M5.64 5.64A9 9 0 0012 21a9 9 0 006.36-2.64M12 3a9 9 0 00-6.36 2.64"/>
                      </svg>
                    )}
                    {error.type === "duplicate" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M16 12H8"/><path d="M12 16V8"/>
                      </svg>
                    )}
                    {error.type === "validation" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    )}
                    {(error.type === "server" || error.type === "general") && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    )}
                  </div>
                  <div className="error-content">
                    <strong className="error-title">{error.title}</strong>
                    <p className="error-message">{error.message}</p>
                  </div>
                  <button
                    type="button"
                    className="error-close"
                    onClick={() => setError(null)}
                    aria-label="Dismiss"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Name Field */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${touched.name && fieldErrors.name ? "is-invalid" : ""} ${touched.name && !fieldErrors.name && formData.name ? "is-valid" : ""}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {touched.name && fieldErrors.name && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${touched.email && fieldErrors.email ? "is-invalid" : ""} ${touched.email && !fieldErrors.email && formData.email ? "is-valid" : ""}`}
                  placeholder="demo@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
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

              {/* Phone Field (Optional) */}
              <div className="mb-3">
                <label className="form-label">
                  Phone <span className="text-muted">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-control ${touched.phone && fieldErrors.phone ? "is-invalid" : ""} ${touched.phone && !fieldErrors.phone && formData.phone ? "is-valid" : ""}`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  disabled={isLoading}
                  autoComplete="tel"
                />
                {touched.phone && fieldErrors.phone && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>

              {/* Role Field */}
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control ${touched.password && fieldErrors.password ? "is-invalid" : ""} ${touched.password && !fieldErrors.password && formData.password ? "is-valid" : ""}`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`strength-bar ${passwordStrength.level >= level ? "active" : ""}`}
                          style={{ backgroundColor: passwordStrength.level >= level ? passwordStrength.color : "#e9ecef" }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                {touched.password && fieldErrors.password && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-control ${touched.confirmPassword && fieldErrors.confirmPassword ? "is-invalid" : ""} ${touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword ? "is-valid" : ""}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <div className="field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {fieldErrors.confirmPassword}
                  </div>
                )}
                {/* Password Match Indicator */}
                {touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword && (
                  <div className="field-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Passwords match
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-3 small">
              Already have an account?{" "}
              <Link to="/login" className="text-warning text-decoration-none">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

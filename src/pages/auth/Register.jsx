import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/custom.css";

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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Pass all form data to register (excluding confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      console.log('Sending registration data:', registerData);
      console.log('Role being sent:', registerData.role);
      await register(registerData);
      // Force page reload to trigger AppRoutes role-based routing
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

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
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="demo@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Phone (Optional) */}
              <div className="mb-3">
                <label className="form-label">
                  Phone <span className="text-muted">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Role */}
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

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
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

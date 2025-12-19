import { useNavigate } from "react-router-dom";
import "../../styles/custom.css";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Later: API authentication logic
    navigate("/"); // redirect to dashboard
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
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="demo@gmail.com"
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
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
              >
                Login
              </button>
            </form>

            <p className="text-center mt-3 small">
              Don’t have an account?{" "}
              <span className="text-warning cursor-pointer">Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

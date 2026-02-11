import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/custom.css";

// Error messages mapping for OTP verification
const getErrorMessage = (error) => {
  const errorMessage = error?.message?.toLowerCase() || "";

  if (
    errorMessage.includes("invalid code") ||
    errorMessage.includes("incorrect")
  ) {
    return {
      title: "Invalid Code",
      message:
        "The verification code you entered is incorrect. Please try again.",
      type: "invalid-code",
    };
  }

  if (errorMessage.includes("expired") || errorMessage.includes("expire")) {
    return {
      title: "Code Expired",
      message: "Your verification code has expired. Please request a new one.",
      type: "expired",
    };
  }

  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return {
      title: "Connection Error",
      message:
        "Unable to connect to the server. Please check your connection and try again.",
      type: "network",
    };
  }

  return {
    title: "Verification Failed",
    message: error?.message || "Unable to verify your code. Please try again.",
    type: "general",
  };
};

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

  // Get email from location state or redirect to register
  useEffect(() => {
    const emailFromState = location.state?.email;
    if (!emailFromState) {
      navigate("/register");
      return;
    }
    setEmail(emailFromState);
  }, [location.state, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError({
        title: "Incomplete Code",
        message: "Please enter all 4 digits of your verification code.",
        type: "validation",
      });
      return;
    }

    setIsLoading(true);

    try {
      await verifyOTP(email, otpCode);
      // Successfully verified - redirect to dashboard
      navigate("/");
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo);
      // Clear OTP inputs on error
      setOtp(["", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setResendCooldown(30); // 30 second cooldown

      // Show success message briefly
      setError({
        title: "Code Sent",
        message: "A new verification code has been sent to your email.",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch {
      setError({
        title: "Resend Failed",
        message: "Unable to resend verification code. Please try again.",
        type: "resend-error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-page container-fluid">
      <div className="row min-vh-100 align-items-center justify-content-center">
        {/* OTP Verification Card */}
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
              <p className="text-muted small">Verify your email address</p>
            </div>

            {/* Info */}
            <div className="text-center mb-4">
              <p className="text-muted">
                We've sent a 4-digit verification code to
              </p>
              <p className="fw-semibold">{email}</p>
              <p className="text-muted small">
                Please enter the code to complete your registration
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Error Alert */}
              {error && (
                <div
                  className={`alert d-flex align-items-center mb-3 ${error.type === "success" ? "alert-success" : "alert-danger"}`}
                  role="alert"
                  style={{
                    borderRadius: "10px",
                    padding: "12px 16px",
                    backgroundColor:
                      error.type === "success" ? "#f0f9ff" : "#fef2f2",
                    border: `1px solid ${error.type === "success" ? "#bee5eb" : "#fecaca"}`,
                    color: error.type === "success" ? "#0c5460" : "#991b1b",
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
                    {error.type === "success" ? (
                      <path d="M20 6L9 17l-5-5" />
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    )}
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

              {/* OTP Inputs */}
              <div className="mb-4">
                <label className="form-label text-center w-100 mb-3">
                  Enter Verification Code
                </label>
                <div className="d-flex justify-content-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      className="form-control text-center fw-bold"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "20px",
                        borderRadius: "8px",
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                      maxLength="1"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-warning w-100 fw-semibold mb-3"
                disabled={isLoading || otp.some((digit) => !digit)}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-muted small mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleResendOTP}
                  disabled={isResending || resendCooldown > 0}
                >
                  {isResending
                    ? "Sending..."
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                </button>
              </div>
            </form>

            {/* Back to Register */}
            <p className="text-center mt-4 small">
              Wrong email?{" "}
              <Link
                to="/register"
                className="text-warning text-decoration-none"
              >
                Go back to registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

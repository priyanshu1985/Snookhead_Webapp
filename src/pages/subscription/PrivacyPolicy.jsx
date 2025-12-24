import { useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/privacyPolicy.css";

const PrivacyPolicy = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="privacy-page">
          <h5>← Privacy Policy</h5>

          <div className="policy-content">
            <p>
              <strong>Effective Date:</strong> [Insert Date]
            </p>

            <p>
              At <strong>Snokehead</strong>, we value your privacy and are
              committed to protecting your personal information.
            </p>

            <h6>1. Information We Collect</h6>
            <ul>
              <li>Personal Information (name, email, phone)</li>
              <li>Technical Data (IP address, browser type)</li>
              <li>Usage Data (pages visited, actions)</li>
            </ul>

            <h6>2. How We Use Your Information</h6>
            <ul>
              <li>Improve our services</li>
              <li>Customer support</li>
              <li>Personalized experience</li>
            </ul>

            <h6>3. Data Sharing</h6>
            <p>
              We do not sell your personal data. Information may be shared only
              with trusted service providers or legal authorities.
            </p>

            <h6>4. Security</h6>
            <p>We use industry-standard measures to protect your data.</p>

            <h6>5. Your Rights</h6>
            <ul>
              <li>Access or delete your data</li>
              <li>Withdraw consent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

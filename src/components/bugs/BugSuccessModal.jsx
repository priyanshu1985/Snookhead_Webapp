import "../../styles/bugSuccessModal.css";

const BugSuccessModal = ({ onClose, onBack }) => {
  return (
    <div className="bug-success-overlay">
      <div className="bug-success-modal">
        {/* Close */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Icon */}
        <div className="success-icon">✓</div>

        {/* Text */}
        <h4>Successed!</h4>

        <p>
          Your <span>Bug Report</span> request has been submitted successfully!
        </p>

        <button className="back-btn" onClick={onBack}>
          Back to page
        </button>
      </div>
    </div>
  );
};

export default BugSuccessModal;

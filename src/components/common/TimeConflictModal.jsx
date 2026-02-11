import { useState } from "react";
import "./TimeConflictModal.css";

/**
 * TimeConflictModal - Reusable modal for handling booking time conflicts
 * Shows conflict details, suggests alternatives, allows user to proceed or cancel
 * @param {boolean} show - Whether to show the modal
 * @param {Object} conflictData - Conflict information from backend
 * @param {Function} onConfirm - Callback when user confirms to proceed anyway
 * @param {Function} onCancel - Callback when user cancels
 * @param {Function} onSelectAlternative - Callback when user selects suggested time
 * @param {boolean} loading - Shows loading state during resolution
 */
const TimeConflictModal = ({
  show,
  conflictData,
  onConfirm,
  onCancel,
  onSelectAlternative,
  loading = false,
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState(null);

  if (!show || !conflictData) return null;

  const {
    details = {},
    conflicts = [],
    suggestions = [],
    canForce = false,
    error = "",
  } = conflictData;

  const isError = details.severity === "error";
  const isWarning = details.severity === "warning";

  const handleAlternativeSelect = (suggestion) => {
    setSelectedAlternative(suggestion);
  };

  const handleConfirmAlternative = () => {
    if (selectedAlternative && onSelectAlternative) {
      onSelectAlternative(selectedAlternative);
    }
  };

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal">
        {/* Header */}
        <div
          className={`conflict-modal-header ${isError ? "error" : "warning"}`}
        >
          <div className="conflict-icon">
            {isError ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <h3>
            {details.title ||
              (isError ? "Booking Conflict" : "Booking Warning")}
          </h3>
        </div>

        {/* Content */}
        <div className="conflict-modal-content">
          {/* Main message */}
          <div className="conflict-message">
            <p className="main-message">{conflictData.message}</p>
            {details.question && (
              <p className="question-text">{details.question}</p>
            )}
          </div>

          {/* Conflict details list */}
          {conflicts.length > 0 && (
            <div className="conflict-details">
              <h4>Conflict Details:</h4>
              <div className="conflict-list">
                {conflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className={`conflict-item ${conflict.severity}`}
                  >
                    <div className="conflict-item-header">
                      <span className="conflict-source">{conflict.source}</span>
                      <span className="conflict-customer">
                        {conflict.customer}
                      </span>
                    </div>
                    <div className="conflict-item-message">
                      {conflict.message}
                    </div>
                    {conflict.details?.phone && (
                      <div className="conflict-item-phone">
                        📞 {conflict.details.phone}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative time suggestions */}
          {suggestions.length > 0 && (
            <div className="alternative-suggestions">
              <h4>Available Time Slots:</h4>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`suggestion-slot ${
                      selectedAlternative?.label === suggestion.label
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleAlternativeSelect(suggestion)}
                    disabled={loading}
                  >
                    <div className="suggestion-time">{suggestion.label}</div>
                    <div className="suggestion-duration">
                      {Math.round(
                        (new Date(suggestion.endTime) -
                          new Date(suggestion.startTime)) /
                          60000,
                      )}{" "}
                      mins
                    </div>
                  </button>
                ))}
              </div>
              {selectedAlternative && (
                <div className="selected-alternative">
                  <strong>Selected:</strong> {selectedAlternative.label}
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="conflict-modal-actions">
          {/* Alternative selection action */}
          {selectedAlternative && (
            <button
              className="btn btn-primary"
              onClick={handleConfirmAlternative}
              disabled={loading}
            >
              {loading ? "Processing..." : "Book Selected Time"}
            </button>
          )}

          {/* Proceed anyway button - only if conflicts allow it */}
          {canForce && !selectedAlternative && (
            <button
              className={`btn ${isError ? "btn-danger" : "btn-warning"}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed Anyway"}
            </button>
          )}

          {/* Cancel button */}
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Footer note */}
        <div className="conflict-modal-footer">
          {isError && (
            <p className="footer-note error">
              ❌ Cannot proceed with current time due to active bookings
            </p>
          )}
          {isWarning && canForce && (
            <p className="footer-note warning">
              ⚠️ Proceeding may cause inconvenience to other customers
            </p>
          )}
          {suggestions.length > 0 && (
            <p className="footer-note info">
              💡 Select an alternative time slot for smooth booking
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeConflictModal;

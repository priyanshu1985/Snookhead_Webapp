import React, { useEffect } from "react";
import "../../styles/confirmationModal.css"; // Reuse existing modal styles

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div 
        className="confirmation-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '90%' }} // Slightly wider defaults for forms
      >
        <div className="confirmation-modal-header">
          <h5>{title}</h5>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="confirmation-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

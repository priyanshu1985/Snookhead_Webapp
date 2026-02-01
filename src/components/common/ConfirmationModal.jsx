import React, { useEffect } from 'react';
import '../../styles/confirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  confirmText = "OK", 
  cancelText = "Cancel",
  type = "confirm", // 'confirm' or 'alert'
  isHtml = false
}) => {
  if (!isOpen) return null;

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <h5>{title}</h5>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="confirmation-modal-body">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <p>{message}</p>
          )}
        </div>

        <div className="confirmation-modal-footer">
          {type === 'confirm' && (
            <button className="confirmation-btn btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button 
            className={`confirmation-btn btn-confirm ${type === 'alert' ? 'btn-full' : ''}`}
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

import "../../styles/tableBookedModal.css";

const TableBookedModal = ({ onClose }) => {
  return (
    <div className="table-booked-overlay">
      <div className="table-booked-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="success-icon">✓</div>

        <h4>Table Booked Successfully!</h4>
        <p>Your table has been booked.</p>

        <button className="ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default TableBookedModal;

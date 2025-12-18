import React from "react";

const EmptyState = ({
  icon = "📄",
  title = "No data found",
  message = "There are no items to display at the moment.",
  action = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <span className="icon">{icon}</span>
      </div>

      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
      </div>

      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;

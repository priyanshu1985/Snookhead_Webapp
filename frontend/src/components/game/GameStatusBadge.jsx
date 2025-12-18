import React from "react";

const GameStatusBadge = ({ status, size = "medium" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          className: "status-active",
          icon: "▶",
        };
      case "available":
        return {
          text: "Available",
          className: "status-available",
          icon: "✓",
        };
      case "occupied":
        return {
          text: "Occupied",
          className: "status-occupied",
          icon: "●",
        };
      case "maintenance":
        return {
          text: "Maintenance",
          className: "status-maintenance",
          icon: "🔧",
        };
      case "reserved":
        return {
          text: "Reserved",
          className: "status-reserved",
          icon: "📅",
        };
      case "cleaning":
        return {
          text: "Cleaning",
          className: "status-cleaning",
          icon: "🧹",
        };
      default:
        return {
          text: "Unknown",
          className: "status-unknown",
          icon: "?",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = `badge-${size}`;

  return (
    <span className={`game-status-badge ${config.className} ${sizeClass}`}>
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-text">{config.text}</span>
    </span>
  );
};

export default GameStatusBadge;

import React, { useState, useEffect } from "react";

const GameTimer = ({ startTime, isRunning = true, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(startTime).getTime();
      setElapsedTime(elapsed);

      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning, onTimeUpdate]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(elapsedTime);

  return (
    <div className="game-timer">
      <div className="timer-display">
        <span className="time-unit">
          <span className="time-value">{time.hours}</span>
          <span className="time-label">h</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{time.minutes}</span>
          <span className="time-label">m</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{time.seconds}</span>
          <span className="time-label">s</span>
        </span>
      </div>

      <div className="timer-status">
        <span
          className={`status-indicator ${isRunning ? "running" : "paused"}`}
        >
          {isRunning ? "▶" : "⏸"}
        </span>
        <span className="status-text">{isRunning ? "Running" : "Paused"}</span>
      </div>
    </div>
  );
};

export default GameTimer;

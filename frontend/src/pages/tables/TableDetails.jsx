import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

const TableDetails = () => {
  const { id } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());

  // TODO: Replace with API call
  const mockTable = {
    id: parseInt(id),
    name: `Table ${id}`,
    status: "occupied",
    type: "full-size",
    hourlyRate: 25,
    location: "Ground Floor",
    features: ["LED Lighting", "Digital Scoreboard", "Climate Control"],
  };

  const mockGame = useMemo(
    () => ({
      id: 1,
      startTime: new Date(2025, 11, 19, 16, 0), // Fixed start time for demo
      player1: "John Doe",
      player2: "Jane Smith",
      score1: 45,
      score2: 32,
      gameType: "Standard",
    }),
    []
  );

  const [table] = useState(mockTable);
  const [currentGame] = useState(mockGame);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!table) {
    return <div className="loading">Loading table details...</div>;
  }

  const calculateDuration = () => {
    if (!currentGame) return "0h 0m";
    const duration = currentTime.getTime() - currentGame.startTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="table-details">
      <div className="table-info">
        <h1>{table.name}</h1>
        <div className="table-meta">
          <span className={`status ${table.status}`}>{table.status}</span>
          <span className="type">{table.type}</span>
          <span className="rate">${table.hourlyRate}/hour</span>
        </div>

        <div className="table-specs">
          <h3>Specifications</h3>
          <p>
            <strong>Location:</strong> {table.location}
          </p>
          <p>
            <strong>Features:</strong>
          </p>
          <ul>
            {table.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>

      {currentGame && (
        <div className="current-game">
          <h2>Current Game</h2>
          <div className="game-info">
            <div className="players">
              <div className="player">
                <h4>{currentGame.player1}</h4>
                <p className="score">{currentGame.score1}</p>
              </div>
              <div className="vs">VS</div>
              <div className="player">
                <h4>{currentGame.player2}</h4>
                <p className="score">{currentGame.score2}</p>
              </div>
            </div>
            <div className="game-stats">
              <p>
                <strong>Duration:</strong> {calculateDuration()}
              </p>
              <p>
                <strong>Game Type:</strong> {currentGame.gameType}
              </p>
              <p>
                <strong>Started:</strong>{" "}
                {currentGame.startTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="game-actions">
              <button className="btn-danger">End Game</button>
              <button className="btn-secondary">Update Score</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-actions">
        <button className="btn-primary">Book This Table</button>
        <button className="btn-secondary">View History</button>
        <button className="btn-outline">Edit Table</button>
      </div>
    </div>
  );
};

export default TableDetails;

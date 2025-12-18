import React from "react";

const GameCard = ({
  game,
  onStartGame,
  onEndGame,
  onUpdateScore,
  currentTime = new Date(),
}) => {
  const formatDuration = (startTime) => {
    if (!startTime) return "0h 0m";
    const duration = currentTime.getTime() - new Date(startTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className={`game-card ${game.status}`}>
      <div className="game-header">
        <h3>{game.tableName}</h3>
        <span className={`game-status ${game.status}`}>
          {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
        </span>
      </div>

      {game.status === "active" && (
        <div className="game-details">
          <div className="players">
            <div className="player">
              <span className="player-name">{game.player1 || "Player 1"}</span>
              <span className="player-score">{game.score1 || 0}</span>
            </div>
            <div className="vs">VS</div>
            <div className="player">
              <span className="player-name">{game.player2 || "Player 2"}</span>
              <span className="player-score">{game.score2 || 0}</span>
            </div>
          </div>

          <div className="game-info">
            <div className="info-item">
              <span className="label">Duration:</span>
              <span className="value">{formatDuration(game.startTime)}</span>
            </div>
            <div className="info-item">
              <span className="label">Started:</span>
              <span className="value">
                {new Date(game.startTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Current Cost:</span>
              <span className="value">
                {formatCurrency(game.currentCost || 0)}
              </span>
            </div>
          </div>

          <div className="game-actions">
            <button
              className="btn-secondary"
              onClick={() => onUpdateScore(game.id)}
            >
              Update Score
            </button>
            <button className="btn-danger" onClick={() => onEndGame(game.id)}>
              End Game
            </button>
          </div>
        </div>
      )}

      {game.status === "available" && (
        <div className="available-actions">
          <p className="table-rate">Rate: ${game.hourlyRate}/hour</p>
          <button
            className="btn-primary start-game-btn"
            onClick={() => onStartGame(game.tableId)}
          >
            Start New Game
          </button>
        </div>
      )}

      {game.status === "maintenance" && (
        <div className="maintenance-info">
          <p className="maintenance-message">
            Table is currently under maintenance
          </p>
        </div>
      )}
    </div>
  );
};

export default GameCard;

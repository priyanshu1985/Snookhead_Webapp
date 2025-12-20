const DigitalGames = () => {
  return (
    <div className="setup-grid">
      {[...Array(8)].map((_, i) => (
        <div className="game-box" key={i}></div>
      ))}

      <button className="add-btn">+ Add New Game</button>
    </div>
  );
};

export default DigitalGames;

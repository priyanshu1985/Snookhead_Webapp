const TableGames = () => {
  return (
    <div className="setup-grid">
      {[...Array(8)].map((_, i) => (
        <div className="game-box" key={i}></div>
      ))}

      <button className="add-btn">+ Add New Type</button>
    </div>
  );
};

export default TableGames;

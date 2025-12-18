import React, { createContext, useState, useEffect } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize with mock data
    initializeTables();
    loadActiveGames();
  }, []);

  const initializeTables = () => {
    const mockTables = [
      {
        id: 1,
        name: "Table 1",
        status: "available",
        type: "full-size",
        hourlyRate: 25,
        location: "Ground Floor",
      },
      {
        id: 2,
        name: "Table 2",
        status: "occupied",
        type: "full-size",
        hourlyRate: 25,
        location: "Ground Floor",
      },
      {
        id: 3,
        name: "Table 3",
        status: "maintenance",
        type: "full-size",
        hourlyRate: 25,
        location: "Ground Floor",
      },
      {
        id: 4,
        name: "Table 4",
        status: "available",
        type: "compact",
        hourlyRate: 20,
        location: "First Floor",
      },
    ];
    setTables(mockTables);
  };

  const loadActiveGames = () => {
    // TODO: Load from API
    const mockGames = [
      {
        id: 1,
        tableId: 2,
        tableName: "Table 2",
        player1: "John Doe",
        player2: "Jane Smith",
        score1: 45,
        score2: 32,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "active",
        gameType: "standard",
        hourlyRate: 25,
      },
    ];
    setGames(mockGames);
  };

  const startGame = async (tableId, gameData) => {
    setIsLoading(true);
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) {
        throw new Error("Table not found");
      }

      const newGame = {
        id: Date.now(), // Mock ID
        tableId,
        tableName: table.name,
        ...gameData,
        startTime: new Date(),
        status: "active",
        score1: 0,
        score2: 0,
        hourlyRate: table.hourlyRate,
      };

      setGames((prev) => [...prev, newGame]);

      // Update table status
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status: "occupied" } : t))
      );

      return { success: true, game: newGame };
    } catch (error) {
      console.error("Start game error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const endGame = async (gameId) => {
    setIsLoading(true);
    try {
      const game = games.find((g) => g.id === gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      const endTime = new Date();
      const duration =
        (endTime.getTime() - game.startTime.getTime()) / (1000 * 60 * 60); // hours
      const totalCost = duration * game.hourlyRate;

      const endedGame = {
        ...game,
        endTime,
        duration,
        totalCost,
        status: "completed",
      };

      // Remove from active games
      setGames((prev) => prev.filter((g) => g.id !== gameId));

      // Update table status
      setTables((prev) =>
        prev.map((t) =>
          t.id === game.tableId ? { ...t, status: "available" } : t
        )
      );

      // TODO: Save completed game to database
      // TODO: Generate bill

      return { success: true, game: endedGame, bill: endedGame };
    } catch (error) {
      console.error("End game error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameScore = async (gameId, score1, score2) => {
    try {
      setGames((prev) =>
        prev.map((game) =>
          game.id === gameId ? { ...game, score1, score2 } : game
        )
      );
      return { success: true };
    } catch (error) {
      console.error("Update score error:", error);
      return { success: false, error: error.message };
    }
  };

  const getCurrentGameForTable = (tableId) => {
    return games.find(
      (game) => game.tableId === tableId && game.status === "active"
    );
  };

  const getAvailableTables = () => {
    return tables.filter((table) => table.status === "available");
  };

  const calculateCurrentCost = (game) => {
    const duration = (Date.now() - game.startTime.getTime()) / (1000 * 60 * 60);
    return duration * game.hourlyRate;
  };

  const value = {
    games,
    tables,
    isLoading,
    startGame,
    endGame,
    updateGameScore,
    getCurrentGameForTable,
    getAvailableTables,
    calculateCurrentCost,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;

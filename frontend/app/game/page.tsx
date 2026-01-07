'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { getAIMove, getOpponents, type Opponent } from '../../lib/api';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  unlockedLevels: number[];
}

export default function GamePage() {
  const [game, setGame] = useState(new Chess());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [opponents, setOpponents] = useState<Record<number, Opponent>>({});
  const [gameStatus, setGameStatus] = useState<string>('');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    unlockedLevels: [1, 2, 3, 4, 5], // All levels unlocked
  });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [boardWidth, setBoardWidth] = useState(600);
  const [illegalMoveMessage, setIllegalMoveMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('chessGameStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }

    // Fetch opponents
    getOpponents().then(setOpponents);

    // Set board width based on window size
    const updateBoardWidth = () => {
      setBoardWidth(Math.min(600, window.innerWidth - 100));
    };
    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem('chessGameStats', JSON.stringify(newStats));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const startGame = (level: number) => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedLevel(level);
    setGameStatus('');
    setIsPlayerTurn(true);
    setMoveHistory([]);
  };

  const makeAIMove = async (fenAfterPlayerMove: string) => {
    if (!selectedLevel) return;

    console.log('Sending FEN to AI:', fenAfterPlayerMove);

    try {
      const response = await getAIMove(fenAfterPlayerMove, selectedLevel);
      const newGame = new Chess(response.fen);
      setGame(newGame);
      setMoveHistory((prev) => [...prev, response.move]);

      if (response.is_checkmate) {
        setGameStatus('Checkmate! You lost.');
        const newStats = { ...stats, losses: stats.losses + 1 };
        saveStats(newStats);
      } else if (response.is_stalemate) {
        setGameStatus('Stalemate! It\'s a draw.');
        const newStats = { ...stats, draws: stats.draws + 1 };
        saveStats(newStats);
      } else if (response.is_check) {
        setGameStatus('Check!');
      }

      setIsPlayerTurn(true);
    } catch (error) {
      console.error('AI move error:', error);
      setIsPlayerTurn(true); // Reset turn even on error
    }
  };

  const onDrop = ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
    console.log('onDrop called:', { sourceSquare, targetSquare, isPlayerTurn });

    if (!isPlayerTurn || !selectedLevel || !targetSquare) {
      setIllegalMoveMessage('Wait for your turn!');
      setTimeout(() => setIllegalMoveMessage(''), 2000);
      return false;
    }

    // Clear any previous illegal move message
    setIllegalMoveMessage('');

    try {
      const gameCopy = new Chess(game.fen());

      console.log('Attempting move from', sourceSquare, 'to', targetSquare);

      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) {
        console.log('Move was null - illegal');
        setIllegalMoveMessage('Illegal move! Please try again.');
        setTimeout(() => setIllegalMoveMessage(''), 2000);
        return false;
      }

      console.log('Move successful:', move.san);

      setGame(gameCopy);
      setMoveHistory((prev) => [...prev, move.san]);
      setIsPlayerTurn(false);
      setGameStatus('');

      if (gameCopy.isCheckmate()) {
        setGameStatus('Checkmate! You won!');
        const newStats = {
          ...stats,
          wins: stats.wins + 1,
          unlockedLevels: stats.unlockedLevels.includes(selectedLevel + 1)
            ? stats.unlockedLevels
            : selectedLevel < 5
            ? [...stats.unlockedLevels, selectedLevel + 1]
            : stats.unlockedLevels,
        };
        saveStats(newStats);
        return true;
      }

      if (gameCopy.isStalemate()) {
        setGameStatus('Stalemate! It\'s a draw.');
        const newStats = { ...stats, draws: stats.draws + 1 };
        saveStats(newStats);
        return true;
      }

      if (gameCopy.isCheck()) {
        setGameStatus('Check!');
      }

      // Pass the FEN AFTER the player's move to the AI
      const fenAfterPlayerMove = gameCopy.fen();
      setTimeout(() => makeAIMove(fenAfterPlayerMove), 500);
      return true;
    } catch (error) {
      console.error('Move error:', error);
      setIllegalMoveMessage('Invalid move!');
      setTimeout(() => setIllegalMoveMessage(''), 2000);
      return false;
    }
  };

  const undoMove = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo(); // Undo AI move
    gameCopy.undo(); // Undo player move
    setGame(gameCopy);
    setGameStatus('');
    setIsPlayerTurn(true);
    setMoveHistory(moveHistory.slice(0, -2));
  };

  return (
    <div className={`min-h-screen p-3 sm:p-4 md:p-8 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className={`flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 backdrop-blur-md rounded-lg transition-all shadow-md text-sm sm:text-base ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                : 'bg-white/70 hover:bg-white/90 border border-white/60 text-gray-900'
            }`}
          >
            <span>←</span>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Checkmate AI</h1>
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-2 sm:px-4 backdrop-blur-md rounded-lg transition-all shadow-md text-lg sm:text-base ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                : 'bg-white/70 hover:bg-white/90 border border-white/60 text-gray-900'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Opponent Selection */}
          <div className={`backdrop-blur-md shadow-lg p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
            isDarkMode
              ? 'bg-white/10 border border-white/20'
              : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Opponent</h2>
            <div className="space-y-2">
              {Object.entries(opponents).map(([level, opponent]) => (
                <button
                  key={level}
                  onClick={() => startGame(Number(level))}
                  disabled={!stats.unlockedLevels.includes(Number(level))}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    stats.unlockedLevels.includes(Number(level))
                      ? selectedLevel === Number(level)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                        : isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 border border-white/20 shadow-md'
                        : 'bg-white/70 hover:bg-white/90 border border-white/60 shadow-md'
                      : isDarkMode
                      ? 'bg-white/5 opacity-50 cursor-not-allowed border border-white/10'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-semibold ${
                        selectedLevel === Number(level)
                          ? 'text-white'
                          : isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}>{opponent.name}</div>
                      <div className={`text-xs ${
                        selectedLevel === Number(level)
                          ? 'text-gray-100'
                          : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>{opponent.title}</div>
                    </div>
                    {!stats.unlockedLevels.includes(Number(level)) && (
                      <div className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>🔒</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 backdrop-blur-md rounded-xl shadow-md ${
              isDarkMode
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/70 border border-white/60'
            }`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Stats</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Wins:</span>
                  <span className="text-green-500 font-semibold">{stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Losses:</span>
                  <span className="text-red-500 font-semibold">{stats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Draws:</span>
                  <span className="text-amber-500 font-semibold">{stats.draws}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2">
            {selectedLevel ? (
              <div>
                <div className={`backdrop-blur-md shadow-lg p-4 md:p-6 rounded-2xl mb-4 ${
                  isDarkMode
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/70 border border-white/60'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        vs {opponents[selectedLevel]?.name}
                      </h3>
                      <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>You: White ♔</span> · <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{opponents[selectedLevel]?.name}: Black ♚</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-md ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/70 border border-white/60'
                    }`}>
                      <div className="text-2xl">
                        {isPlayerTurn ? '♔' : '♚'}
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Turn</div>
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {isPlayerTurn ? 'Your move' : 'AI thinking...'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {gameStatus && (
                    <div className={`mt-3 p-3 rounded-lg text-center font-semibold ${
                      gameStatus.includes('won')
                        ? isDarkMode
                          ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                          : 'bg-green-100 text-green-700 border border-green-200'
                        : gameStatus.includes('lost')
                        ? isDarkMode
                          ? 'bg-red-900/30 text-red-400 border border-red-500/50'
                          : 'bg-red-100 text-red-700 border border-red-200'
                        : isDarkMode
                        ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {gameStatus}
                    </div>
                  )}
                  {illegalMoveMessage && (
                    <div className={`mt-3 p-3 rounded-lg text-center font-semibold animate-pulse ${
                      isDarkMode
                        ? 'bg-red-900/30 text-red-400 border border-red-500/50'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      ❌ {illegalMoveMessage}
                    </div>
                  )}
                </div>

                <div className={`backdrop-blur-md shadow-lg p-4 rounded-2xl mb-4 flex justify-center ${
                  isDarkMode
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/70 border border-white/60'
                }`}>
                  <div style={{ maxWidth: boardWidth }}>
                    <Chessboard
                      options={{
                        position: game.fen(),
                        onPieceDrop: onDrop,
                        boardOrientation: 'white',
                        allowDragging: isPlayerTurn,
                        showNotation: true,
                        boardStyle: {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={undoMove}
                    disabled={moveHistory.length < 2 || !isPlayerTurn}
                    className={`flex-1 px-4 py-3 rounded-xl transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white disabled:bg-white/5'
                        : 'bg-white/70 hover:bg-white/90 border border-white/60 text-gray-900 disabled:bg-gray-100'
                    }`}
                  >
                    ↶ Undo
                  </button>
                  <button
                    onClick={() => startGame(selectedLevel)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-medium"
                  >
                    New Game
                  </button>
                </div>

                {moveHistory.length > 0 && (
                  <div className={`mt-4 backdrop-blur-md shadow-lg p-4 rounded-2xl ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/70 border border-white/60'
                  }`}>
                    <h3 className={`font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="mr-2">📜</span> Move History
                    </h3>
                    <div className="text-sm max-h-48 overflow-y-auto space-y-1">
                      {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                        const whiteMove = moveHistory[i * 2];
                        const blackMove = moveHistory[i * 2 + 1];
                        return (
                          <div key={i} className={`flex items-center py-2 rounded-lg px-3 transition-colors ${
                            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/50'
                          }`}>
                            <span className={`w-8 font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{i + 1}.</span>
                            <span className={`font-medium w-24 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{whiteMove}</span>
                            {blackMove && (
                              <span className={`w-24 font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{blackMove}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`backdrop-blur-md shadow-lg p-12 rounded-2xl text-center ${
                isDarkMode
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/70 border border-white/60'
              }`}>
                <div className="text-6xl mb-4">♟</div>
                <h2 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ready to Play?</h2>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Select an opponent from the left to begin</p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>All opponents are unlocked and ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

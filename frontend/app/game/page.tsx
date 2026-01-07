'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { getAIMove, getOpponents, warmupBackend, type Opponent } from '../../lib/api';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  unlockedLevels: number[];
}

export default function GamePage() {
  const [game, setGame] = useState(new Chess());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'ai' | 'human' | null>(null); // 'ai' for vs AI, 'human' for 2-player
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
  const [boardWidth, setBoardWidth] = useState(450);
  const [illegalMoveMessage, setIllegalMoveMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const [isBackendWarming, setIsBackendWarming] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [warmupAttempts, setWarmupAttempts] = useState(0);

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
      setBoardWidth(Math.min(450, window.innerWidth - 100));
    };
    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  // Warm up backend on page load
  useEffect(() => {
    const warmup = async () => {
      setIsBackendWarming(true);
      setWarmupAttempts((prev) => prev + 1);

      const result = await warmupBackend(10000);

      if (result.success) {
        console.log(`Backend warmed up in ${result.duration.toFixed(0)}ms`);
        setBackendReady(true);
        setIsBackendWarming(false);
      } else {
        console.error(`Backend warmup failed after ${result.duration.toFixed(0)}ms`);
        setBackendReady(false);
        setIsBackendWarming(false);
      }
    };

    warmup();
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

  const retryBackendWarmup = async () => {
    setIsBackendWarming(true);
    setWarmupAttempts((prev) => prev + 1);

    const result = await warmupBackend(10000);

    if (result.success) {
      console.log(`Backend warmed up in ${result.duration.toFixed(0)}ms (attempt ${warmupAttempts + 1})`);
      setBackendReady(true);
      setIsBackendWarming(false);
    } else {
      console.error(`Backend warmup failed after ${result.duration.toFixed(0)}ms (attempt ${warmupAttempts + 1})`);
      setBackendReady(false);
      setIsBackendWarming(false);
    }
  };

  const getPieceSymbol = (piece: string, isWhite: boolean) => {
    const symbols: { [key: string]: { white: string; black: string } } = {
      p: { white: '♙', black: '♟' },
      n: { white: '♘', black: '♞' },
      b: { white: '♗', black: '♝' },
      r: { white: '♖', black: '♜' },
      q: { white: '♕', black: '♛' },
      k: { white: '♔', black: '♚' },
    };
    return isWhite ? symbols[piece.toLowerCase()]?.white : symbols[piece.toLowerCase()]?.black;
  };

  const startGame = (level: number) => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedLevel(level);
    setGameMode('ai');
    setGameStatus('');
    setIsPlayerTurn(true);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
  };

  const startHumanVsHumanGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedLevel(0); // Use 0 to indicate 2-player mode
    setGameMode('human');
    setGameStatus('');
    setIsPlayerTurn(true);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
  };

  const makeAIMove = async (fenAfterPlayerMove: string) => {
    if (!selectedLevel) return;

    console.log('Sending FEN to AI:', fenAfterPlayerMove);

    try {
      const response = await getAIMove(fenAfterPlayerMove, selectedLevel);

      // Track AI captures
      const tempGame = new Chess(fenAfterPlayerMove);
      const aiMoveObj = tempGame.move(response.move);
      if (aiMoveObj && aiMoveObj.captured) {
        const capturedPiece = aiMoveObj.captured;
        setCapturedPieces((prev) => ({
          ...prev,
          white: [...prev.white, capturedPiece],
        }));
      }

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

    if (!targetSquare) {
      return false;
    }

    // For 2-player mode, allow both players to move
    if (gameMode === 'human') {
      // In 2-player mode, both players can always move
    } else {
      // For AI mode, only allow moves on player's turn
      if (!isPlayerTurn || !selectedLevel) {
        setIllegalMoveMessage('Wait for your turn!');
        setTimeout(() => setIllegalMoveMessage(''), 2000);
        return false;
      }
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

      // Track captures based on whose turn it was
      if (move.captured) {
        const capturedPiece = move.captured;
        if (game.turn() === 'w') {
          // White just moved, so they captured a black piece
          setCapturedPieces((prev) => ({
            ...prev,
            black: [...prev.black, capturedPiece],
          }));
        } else {
          // Black just moved, so they captured a white piece
          setCapturedPieces((prev) => ({
            ...prev,
            white: [...prev.white, capturedPiece],
          }));
        }
      }

      setGame(gameCopy);
      setMoveHistory((prev) => [...prev, move.san]);
      setGameStatus('');

      if (gameCopy.isCheckmate()) {
        if (gameMode === 'human') {
          const winner = game.turn() === 'w' ? 'Black' : 'White';
          setGameStatus(`Checkmate! ${winner} wins!`);
        } else {
          setGameStatus('Checkmate! You won!');
          const newStats = {
            ...stats,
            wins: stats.wins + 1,
            unlockedLevels: selectedLevel !== null && stats.unlockedLevels.includes(selectedLevel + 1)
              ? stats.unlockedLevels
              : selectedLevel !== null && selectedLevel < 5
              ? [...stats.unlockedLevels, selectedLevel + 1]
              : stats.unlockedLevels,
          };
          saveStats(newStats);
        }
        return true;
      }

      if (gameCopy.isStalemate()) {
        setGameStatus('Stalemate! It\'s a draw.');
        if (gameMode === 'ai') {
          const newStats = { ...stats, draws: stats.draws + 1 };
          saveStats(newStats);
        }
        return true;
      }

      if (gameCopy.isCheck()) {
        setGameStatus('Check!');
      }

      // For AI mode, make AI move
      if (gameMode === 'ai') {
        setIsPlayerTurn(false);
        const fenAfterPlayerMove = gameCopy.fen();
        setTimeout(() => makeAIMove(fenAfterPlayerMove), 500);
      }

      return true;
    } catch (error) {
      console.error('Move error:', error);
      setIllegalMoveMessage('Invalid move!');
      setTimeout(() => setIllegalMoveMessage(''), 2000);
      return false;
    }
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
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Game Mode</h2>

            {/* Backend Warmup Status */}
            {isBackendWarming && (
              <div className={`mb-4 p-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-blue-500/20 border-blue-400/30 text-blue-200'
                  : 'bg-blue-100 border-blue-300 text-blue-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="animate-spin">⏳</div>
                  <div className="text-sm">Waking up server...</div>
                </div>
              </div>
            )}

            {!isBackendWarming && !backendReady && (
              <div className={`mb-4 p-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-red-500/20 border-red-400/30 text-red-200'
                  : 'bg-red-100 border-red-300 text-red-800'
              }`}>
                <div className="text-sm mb-2">Server not responding</div>
                <button
                  onClick={retryBackendWarmup}
                  className={`text-xs px-3 py-1 rounded transition-all ${
                    isDarkMode
                      ? 'bg-red-400/30 hover:bg-red-400/50 border border-red-400/50'
                      : 'bg-red-200 hover:bg-red-300 border border-red-400'
                  }`}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!isBackendWarming && backendReady && (
              <div className={`mb-4 p-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-green-500/20 border-green-400/30 text-green-200'
                  : 'bg-green-100 border-green-300 text-green-800'
              }`}>
                <div className="flex items-center gap-2">
                  <div>✓</div>
                  <div className="text-sm">Server ready!</div>
                </div>
              </div>
            )}

            {/* 2-Player Mode Button */}
            <button
              onClick={startHumanVsHumanGame}
              className={`w-full p-3 rounded-xl text-left transition-all mb-4 ${
                selectedLevel === 0 && gameMode === 'human'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 border border-white/20 shadow-md'
                  : 'bg-white/70 hover:bg-white/90 border border-white/60 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${
                    selectedLevel === 0 && gameMode === 'human'
                      ? 'text-white'
                      : isDarkMode
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>2 Player Mode</div>
                  <div className={`text-xs ${
                    selectedLevel === 0 && gameMode === 'human'
                      ? 'text-gray-100'
                      : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}>Human vs Human</div>
                </div>
                <div className="text-2xl">👥</div>
              </div>
            </button>

            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VS AI</h3>
            <div className="space-y-2">
              {Object.entries(opponents).map(([level, opponent]) => (
                <button
                  key={level}
                  onClick={() => startGame(Number(level))}
                  disabled={!stats.unlockedLevels.includes(Number(level)) || isBackendWarming || !backendReady}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    stats.unlockedLevels.includes(Number(level))
                      ? selectedLevel === Number(level) && gameMode === 'ai'
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
                        selectedLevel === Number(level) && gameMode === 'ai'
                          ? 'text-white'
                          : isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}>{opponent.name}</div>
                      <div className={`text-xs ${
                        selectedLevel === Number(level) && gameMode === 'ai'
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

          {/* Chess Board and Game Area */}
          <div className="lg:col-span-2">
            {selectedLevel !== null ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Board and Controls */}
                <div className="lg:col-span-2">
                  <div className={`backdrop-blur-md shadow-lg p-4 md:p-6 rounded-2xl mb-4 ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/70 border border-white/60'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {gameMode === 'human' ? '2 Player Mode' : `vs ${opponents[selectedLevel]?.name}`}
                        </h3>
                        <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {gameMode === 'human' ? (
                            <>
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Player 1: White ♔</span> · <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Player 2: Black ♚</span>
                            </>
                          ) : (
                            <>
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>You: White ♔</span> · <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{opponents[selectedLevel]?.name}: Black ♚</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-md ${
                        isDarkMode
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/70 border border-white/60'
                      }`}>
                        <div className="text-2xl">
                          {game.turn() === 'w' ? '♔' : '♚'}
                        </div>
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Turn</div>
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {gameMode === 'human'
                              ? (game.turn() === 'w' ? 'White to move' : 'Black to move')
                              : (isPlayerTurn ? 'Your move' : 'AI thinking...')
                            }
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
                          allowDragging: gameMode === 'human' ? true : isPlayerTurn,
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
                      onClick={() => gameMode === 'human' ? startHumanVsHumanGame() : startGame(selectedLevel!)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-medium"
                    >
                      New Game
                    </button>
                  </div>
                </div>

                {/* Right: Move History and Captured Pieces */}
                {moveHistory.length > 0 && (
                  <div className="space-y-4">
                    {/* Move History */}
                    <div className={`backdrop-blur-md shadow-lg p-4 rounded-2xl ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/70 border border-white/60'
                    }`}>
                      <h3 className={`font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span className="mr-2">📜</span> Move History
                      </h3>
                      <div className="text-sm max-h-64 overflow-y-auto space-y-1">
                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                          const whiteMove = moveHistory[i * 2];
                          const blackMove = moveHistory[i * 2 + 1];
                          return (
                            <div key={i} className={`flex items-center py-2 rounded-lg px-3 transition-colors ${
                              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/50'
                            }`}>
                              <span className={`w-8 font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{i + 1}.</span>
                              <span className={`font-medium w-20 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{whiteMove}</span>
                              {blackMove && (
                                <span className={`w-20 font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{blackMove}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Captured Pieces */}
                    <div className={`backdrop-blur-md shadow-lg p-4 rounded-2xl ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/70 border border-white/60'
                    }`}>
                      <h3 className={`font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span className="mr-2">⚔️</span> Captured Pieces
                      </h3>
                      <div className="space-y-3">
                        {/* Captured by White (Player) */}
                        <div>
                          <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gameMode === 'human' ? 'White captured:' : 'You captured:'}
                          </div>
                          <div className="text-2xl flex flex-wrap gap-1">
                            {capturedPieces.black.length > 0 ? (
                              capturedPieces.black.map((piece, index) => (
                                <span key={index}>{getPieceSymbol(piece, false)}</span>
                              ))
                            ) : (
                              <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>None</span>
                            )}
                          </div>
                        </div>
                        {/* Captured by Black (AI) */}
                        <div>
                          <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gameMode === 'human' ? 'Black captured:' : `${opponents[selectedLevel]?.name} captured:`}
                          </div>
                          <div className="text-2xl flex flex-wrap gap-1">
                            {capturedPieces.white.length > 0 ? (
                              capturedPieces.white.map((piece, index) => (
                                <span key={index}>{getPieceSymbol(piece, true)}</span>
                              ))
                            ) : (
                              <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>None</span>
                            )}
                          </div>
                        </div>
                      </div>
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

'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HowToPlay() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 backdrop-blur-md rounded-lg transition-all shadow-md text-sm sm:text-base ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                : 'bg-white/70 hover:bg-white/90 border border-white/60 text-gray-900'
            }`}
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
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

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            How to Play
          </h1>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Master the game and beat all AI opponents
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">

          {/* Getting Started */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Getting Started
            </h2>
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  1. Select an Opponent
                </h3>
                <p className="text-sm sm:text-base">
                  Choose from five AI opponents, each with increasing difficulty levels:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Joe (Beginner)</strong> - Perfect for learning the basics</li>
                  <li><strong>Sarah (Casual Player)</strong> - Moderate challenge with occasional mistakes</li>
                  <li><strong>Marcus (Club Player)</strong> - Strategic gameplay with solid tactics</li>
                  <li><strong>Elena (Master)</strong> - Advanced strategies and strong positions</li>
                  <li><strong>Magnus (Grandmaster)</strong> - Near-perfect play, maximum challenge</li>
                </ul>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  2. Make Your Move
                </h3>
                <p className="text-sm sm:text-base">
                  Click and drag pieces to make your moves. You play as White and always move first.
                  The AI opponent plays as Black and responds automatically.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  3. Win the Game
                </h3>
                <p className="text-sm sm:text-base">
                  Checkmate your opponent to win! Your statistics will be tracked including wins, losses, and draws.
                </p>
              </div>
            </div>
          </section>

          {/* Basic Chess Rules */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Basic Chess Rules
            </h2>
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  The Objective
                </h3>
                <p className="text-sm sm:text-base">
                  The goal of chess is to checkmate your opponent's King. This means the King is under attack
                  (in check) and cannot escape capture.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  How Pieces Move
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      King ♔
                    </p>
                    <p className="text-sm sm:text-base">Moves one square in any direction (horizontally, vertically, or diagonally)</p>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Queen ♕
                    </p>
                    <p className="text-sm sm:text-base">Moves any number of squares horizontally, vertically, or diagonally</p>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Rook ♖
                    </p>
                    <p className="text-sm sm:text-base">Moves any number of squares horizontally or vertically</p>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Bishop ♗
                    </p>
                    <p className="text-sm sm:text-base">Moves any number of squares diagonally</p>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Knight ♘
                    </p>
                    <p className="text-sm sm:text-base">Moves in an L-shape: two squares in one direction, then one square perpendicular. Can jump over other pieces</p>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pawn ♙
                    </p>
                    <p className="text-sm sm:text-base">Moves forward one square (or two squares on its first move). Captures diagonally forward one square</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Special Moves */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Special Moves
            </h2>
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Castling
                </h3>
                <p className="text-sm sm:text-base">
                  A special move involving the King and a Rook. The King moves two squares toward the Rook,
                  and the Rook moves to the square the King crossed. Can only be done if:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm sm:text-base">
                  <li>Neither piece has moved before</li>
                  <li>There are no pieces between them</li>
                  <li>The King is not in check</li>
                  <li>The King does not move through or into check</li>
                </ul>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  En Passant
                </h3>
                <p className="text-sm sm:text-base">
                  A special pawn capture. If an opponent's pawn moves two squares forward from its starting
                  position and lands beside your pawn, you can capture it as if it had only moved one square.
                  This can only be done immediately after the opponent's move.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pawn Promotion
                </h3>
                <p className="text-sm sm:text-base">
                  When a pawn reaches the opposite end of the board, it must be promoted to a Queen, Rook,
                  Bishop, or Knight. Usually players choose a Queen as it is the most powerful piece.
                </p>
              </div>
            </div>
          </section>

          {/* Game Endings */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              How Games End
            </h2>
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Checkmate
                </h3>
                <p className="text-sm sm:text-base">
                  The King is under attack and cannot escape. The attacking player wins the game.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Stalemate
                </h3>
                <p className="text-sm sm:text-base">
                  The player to move has no legal moves and their King is not in check. The game ends in a draw.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Draw by Insufficient Material
                </h3>
                <p className="text-sm sm:text-base">
                  Neither player has enough pieces to checkmate (e.g., King vs King, King and Bishop vs King).
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Threefold Repetition
                </h3>
                <p className="text-sm sm:text-base">
                  The same position occurs three times with the same player to move. Either player can claim a draw.
                </p>
              </div>
            </div>
          </section>

          {/* Game Features */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Game Features
            </h2>
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Move History
                </h3>
                <p className="text-sm sm:text-base">
                  All moves are recorded and displayed on the right side of the board using standard chess notation.
                  This helps you review your game and learn from your moves.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Undo Move
                </h3>
                <p className="text-sm sm:text-base">
                  Made a mistake? Click the "Undo" button to take back your last move (and the AI's response).
                  This feature helps you learn by trying different approaches.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Game Statistics
                </h3>
                <p className="text-sm sm:text-base">
                  Track your performance with wins, losses, and draws. Your stats are saved locally and persist
                  across sessions.
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dark Mode
                </h3>
                <p className="text-sm sm:text-base">
                  Toggle between light and dark themes using the moon/sun button. Your preference is saved automatically.
                </p>
              </div>
            </div>
          </section>

          {/* Tips for Beginners */}
          <section className={`backdrop-blur-md shadow-lg p-5 sm:p-8 rounded-xl sm:rounded-2xl ${
            isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white/70 border border-white/60'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Tips for Beginners
            </h2>
            <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>1.</span>
                <p className="text-sm sm:text-base"><strong>Control the center</strong> - Try to occupy and control the central squares (e4, d4, e5, d5) with your pawns and pieces</p>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>2.</span>
                <p className="text-sm sm:text-base"><strong>Develop your pieces</strong> - Move your Knights and Bishops out early in the game, don't move the same piece twice in the opening</p>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>3.</span>
                <p className="text-sm sm:text-base"><strong>Protect your King</strong> - Castle early to move your King to safety and connect your Rooks</p>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>4.</span>
                <p className="text-sm sm:text-base"><strong>Don't waste time</strong> - Every move should have a purpose, avoid making unnecessary pawn moves in the opening</p>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>5.</span>
                <p className="text-sm sm:text-base"><strong>Think before you move</strong> - Always check if your opponent has any threats before making your move</p>
              </li>
              <li className="flex items-start gap-3">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>6.</span>
                <p className="text-sm sm:text-base"><strong>Learn from losses</strong> - Review your games and try to understand where you went wrong</p>
              </li>
            </ul>
          </section>

        </div>

        {/* Back to Game Button */}
        <div className="text-center mt-8 sm:mt-12 pb-6">
          <Link
            href="/game"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/30"
          >
            <span>Ready to Play</span>
            <span>→</span>
          </Link>
        </div>

      </main>
    </div>
  );
}

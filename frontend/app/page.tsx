'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-2 sm:mb-4">
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-2 sm:px-4 backdrop-blur-md rounded-lg transition-all shadow-md text-xl sm:text-base ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                : 'bg-white/70 hover:bg-white/90 border border-white/60 text-gray-900'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-16 pt-4 sm:pt-12">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Checkmate AI
          </h1>
          <p className={`text-base sm:text-xl max-w-2xl mx-auto px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            An AI-powered chess game with progressive difficulty from Beginner to Grandmaster
          </p>
        </div>

        {/* Opponents Grid */}
        <div className="mb-8 sm:mb-16">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Opponents</h2>
          <p className={`text-sm sm:text-base text-center mb-4 sm:mb-6 px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Five unique AI personalities, each with their own playing style</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { icon: "♟", name: "Joe", level: "Beginner", color: "from-green-500 to-emerald-600" },
              { icon: "♞", name: "Sarah", level: "Casual", color: "from-blue-500 to-cyan-600" },
              { icon: "♝", name: "Marcus", level: "Club", color: "from-purple-500 to-violet-600" },
              { icon: "♜", name: "Elena", level: "Master", color: "from-orange-500 to-red-600" },
              { icon: "♛", name: "Magnus", level: "Grandmaster", color: "from-yellow-500 to-amber-600" },
            ].map((opponent, idx) => (
              <div
                key={idx}
                className={`relative group overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-md shadow-lg p-4 sm:p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/70 border border-white/60'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${opponent.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-center">{opponent.icon}</div>
                  <h3 className={`text-sm sm:text-base font-semibold text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{opponent.name}</h3>
                  <p className={`text-xs sm:text-sm text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{opponent.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className={`backdrop-blur-md shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-all ${
              isDarkMode
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/70 border border-white/60'
            }`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-md">
                🎯
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Progressive Difficulty</h3>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start easy, master the challenge</p>
            </div>
            <div className={`backdrop-blur-md shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-all ${
              isDarkMode
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/70 border border-white/60'
            }`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-md">
                🔓
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Play Freely</h3>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>All opponents available from the start</p>
            </div>
            <div className={`backdrop-blur-md shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-all ${
              isDarkMode
                ? 'bg-white/10 border border-white/20'
                : 'bg-white/70 border border-white/60'
            }`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 shadow-md">
                📊
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Track Progress</h3>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monitor your wins and stats</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pb-6">
          <Link
            href="/game"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/30"
          >
            <span>Start Playing</span>
            <span>→</span>
          </Link>
          <div className="mt-4 sm:mt-6">
            <Link
              href="/how-to-play"
              className={`text-sm sm:text-base underline hover:no-underline transition-all ${
                isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              How to Play & Rules
            </Link>
          </div>
          <p className={`text-xs sm:text-sm mt-2 sm:mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Powered by Stockfish Engine
          </p>
        </div>
      </main>
    </div>
  );
}

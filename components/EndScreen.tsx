import React from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';

interface EndScreenProps {
  score: number;
  didWin: boolean;
  onRestart: () => void;
  onGoToMenu: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, didWin, onRestart, onGoToMenu }) => {
  const title = didWin ? "You Win!" : "Game Over";
  const titleColor = didWin ? "text-green-400" : "text-red-500";
  const buttonColor = didWin ? "bg-green-500 hover:bg-green-400 focus:ring-green-300" : "bg-red-600 hover:bg-red-500 focus:ring-red-400";

  return (
    <div
      className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-10 shadow-2xl"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
    >
      <h2 className={`text-5xl font-bold mb-4 ${titleColor}`}>{title}</h2>
      <p className="text-2xl text-slate-200 mb-8">Your final score is: <span className="font-bold text-white">{score}</span></p>
      <div className="flex space-x-4">
        <button
          onClick={onGoToMenu}
          className="px-6 py-3 bg-slate-600 text-white font-bold text-lg rounded-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 shadow-lg"
        >
          Main Menu
        </button>
        <button
          onClick={onRestart}
          className={`px-8 py-4 ${buttonColor} text-white font-bold text-xl rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 shadow-lg`}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default EndScreen;

import React from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';

interface PauseScreenProps {
  onResume: () => void;
  onExit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onExit }) => {
  return (
    <div
      className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-10 z-30"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      aria-modal="true"
      role="dialog"
    >
      <h2 className="text-5xl font-bold mb-8 text-white animate-pulse">Paused</h2>
      <div className="flex flex-col space-y-4">
        <button
          onClick={onResume}
          className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold text-xl rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
        >
          Resume
        </button>
        <button
          onClick={onExit}
          className="px-8 py-3 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400 shadow-lg"
        >
          Exit to Menu
        </button>
      </div>
    </div>
  );
};

export default PauseScreen;

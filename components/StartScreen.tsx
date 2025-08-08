import React from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';

interface StartScreenProps {
  onStart: () => void;
  onGoToSettings: () => void;
  onGoToHighScores: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onGoToSettings, onGoToHighScores }) => {
  return (
    <div
      className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-10 shadow-2xl"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
    >
      <h2 className="text-4xl font-bold mb-4 text-white">Welcome to Brick Wall!</h2>
      <p className="text-slate-300 max-w-md mb-8">
        Your goal is to break all the bricks without letting the ball fall. You have 3 lives.
        Configure your controls in the Settings menu.
      </p>
      <div className="flex flex-col space-y-4">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold text-xl rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
        >
          Start Game
        </button>
        <button
          onClick={onGoToHighScores}
          className="px-8 py-3 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 shadow-lg"
        >
          High Scores
        </button>
        <button
          onClick={onGoToSettings}
          className="px-8 py-3 bg-slate-600 text-white font-bold text-lg rounded-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 shadow-lg"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default StartScreen;

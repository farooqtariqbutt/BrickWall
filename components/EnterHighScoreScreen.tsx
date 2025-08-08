import React, { useState } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';

interface EnterHighScoreScreenProps {
  score: number;
  onSave: (name: string) => void;
}

const EnterHighScoreScreen: React.FC<EnterHighScoreScreenProps> = ({ score, onSave }) => {
  const [name, setName] = useState('');

  const NAME_MIN_LENGTH = 2;
  const NAME_MAX_LENGTH = 12;

  const isNameValid = name.trim().length >= NAME_MIN_LENGTH && name.trim().length <= NAME_MAX_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameValid) {
      onSave(name.trim());
    }
  };

  return (
    <div
      className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-10 shadow-2xl"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
    >
      <h2 className="text-4xl font-bold mb-2 text-cyan-400">New High Score!</h2>
      <p className="text-2xl text-slate-200 mb-8">Your score: <span className="font-bold text-white">{score.toLocaleString()}</span></p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center">
        <label htmlFor="name-input" className="text-xl text-slate-300 mb-4">
          Enter your name to save your score
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          minLength={NAME_MIN_LENGTH}
          maxLength={NAME_MAX_LENGTH}
          className="w-full text-center p-3 bg-slate-900 text-white text-2xl rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all"
          autoFocus
        />
        <p className="text-sm text-slate-500 mt-2 h-4">
          {name.trim().length > 0 && !isNameValid ? `Name must be ${NAME_MIN_LENGTH}-${NAME_MAX_LENGTH} characters` : ''}
        </p>

        <button
          type="submit"
          disabled={!isNameValid}
          className="mt-6 px-10 py-4 bg-cyan-500 text-slate-900 font-bold text-xl rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          Save Score
        </button>
      </form>
    </div>
  );
};

export default EnterHighScoreScreen;

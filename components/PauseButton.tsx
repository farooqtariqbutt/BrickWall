import React from 'react';

interface PauseButtonProps {
  onPause: () => void;
}

const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  return (
    <button
      onClick={onPause}
      className="w-14 h-14 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
      aria-label="Pause Game"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>
  );
};

export default PauseButton;
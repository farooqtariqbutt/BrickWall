import React, { useState, useEffect } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';
import { HighScore } from '../types.ts';
import { getHighScores } from '../lib/scoreManager.ts';

interface HighScoresScreenProps {
  onGoToMenu: () => void;
}

const HighScoresScreen: React.FC<HighScoresScreenProps> = ({ onGoToMenu }) => {
  const [scores, setScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const highScores = await getHighScores();
        setScores(highScores);
      } catch (error) {
        console.error("Failed to load high scores", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <div
        className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-8 shadow-2xl"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      >
        <p className="text-xl text-slate-300 animate-pulse">Loading High Scores...</p>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-between text-center p-8 shadow-2xl"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
    >
      <h2 className="text-4xl font-bold text-white flex-shrink-0">Top 10 High Scores</h2>
      
      <div className="w-full max-w-xl overflow-y-auto flex-grow my-6 pr-2">
        {scores.length > 0 ? (
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-slate-400 font-bold px-3 py-1 text-sm sticky top-0 bg-slate-800/80 backdrop-blur-sm z-10">
                <span className="w-12 text-left">Rank</span>
                <span className="flex-grow text-left pl-4">Name</span>
                <span className="w-32 text-right">Score</span>
                <span className="w-24 text-right">Date</span>
            </li>
            {scores.map((score, index) => (
              <li
                key={`${score.date}-${score.score}-${index}`}
                className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg text-lg transform hover:scale-[1.02] hover:bg-slate-700 transition-all duration-200"
              >
                <span className="font-bold text-cyan-400 w-12 text-left">{index + 1}.</span>
                <span className="font-semibold text-white flex-grow text-left pl-4 truncate" title={score.name}>{score.name}</span>
                <span className="font-semibold text-white w-32 text-right">{score.score.toLocaleString()}</span>
                <span className="text-slate-400 text-sm w-24 text-right">{new Date(score.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full">
             <p className="text-slate-400 text-xl">No high scores yet. Be the first!</p>
          </div>
        )}
      </div>

      <button
        onClick={onGoToMenu}
        className="px-8 py-3 bg-slate-600 text-white font-bold text-lg rounded-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 shadow-lg flex-shrink-0"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default HighScoresScreen;

import { HighScore } from '../types.ts';

const HIGH_SCORES_KEY = 'brickWallHighScores';
const MAX_SCORES = 10;

export const getHighScores = async (): Promise<HighScore[]> => {
  try {
    const scoresJSON = localStorage.getItem(HIGH_SCORES_KEY);
    if (scoresJSON) {
      const scores = (JSON.parse(scoresJSON) as any[]).map(s => ({
        name: s.name || 'Anonymous',
        score: s.score,
        date: s.date
      }));
      return Array.isArray(scores) ? scores : [];
    }

    const response = await fetch('/highscores.json');
    if (!response.ok) {
      if (response.status !== 404) {
        console.error("Error fetching highscores.json:", response.statusText);
      }
      return [];
    }
    const fileScores: HighScore[] = await response.json();

    if (Array.isArray(fileScores)) {
      const validatedScores = fileScores.map(s => ({
        name: s.name || 'Anonymous',
        score: s.score,
        date: s.date
      })).sort((a, b) => b.score - a.score).slice(0, MAX_SCORES);

      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(validatedScores));
      return validatedScores;
    }
    
    return [];
  } catch (error) {
    console.error("Error reading high scores", error);
    return [];
  }
};

export const isHighScore = async (score: number): Promise<boolean> => {
    if (score <= 0) return false;
    const highScores = await getHighScores();
    if (highScores.length < MAX_SCORES) {
        return true;
    }
    const lowestScore = highScores[highScores.length - 1]?.score ?? 0;
    return score > lowestScore;
};

export const addHighScore = async (newScore: HighScore): Promise<void> => {
  if (newScore.score <= 0) return;
  if (!newScore.name) {
      console.warn("Attempted to add high score with no name.");
      return;
  }

  try {
    const highScores = await getHighScores();

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);

    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updatedScores));
  } catch (error) {
    console.error("Error saving high score to localStorage", error);
  }
};

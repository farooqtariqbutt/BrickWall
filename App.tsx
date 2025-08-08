import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameStatus, Controls, HighScore } from './types.ts';
import { DEFAULT_CONTROLS, BOARD_WIDTH, BOARD_HEIGHT } from './constants.ts';
import GameBoard from './components/GameBoard.tsx';
import StartScreen from './components/StartScreen.tsx';
import EndScreen from './components/EndScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import HighScoresScreen from './components/HighScoresScreen.tsx';
import EnterHighScoreScreen from './components/EnterHighScoreScreen.tsx';
import { addHighScore, isHighScore } from './lib/scoreManager.ts';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START);
  const [finalScore, setFinalScore] = useState(0);
  const [didWin, setDidWin] = useState(false);
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const parentEl = mainEl.parentElement;
    if (!parentEl) return;

    const resizeObserver = new ResizeObserver(entries => {
      // The "ResizeObserver loop completed with undelivered notifications" error
      // happens when an observer's callback triggers another resize event.
      // Wrapping the DOM modification in requestAnimationFrame defers the update
      // to the next paint cycle, breaking the loop and preventing the error.
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        // Use the more performant contentRect from the observer entry
        const { width } = entries[0].contentRect;
        
        // Check for element existence again inside the async callback
        if (width > 0 && mainEl && parentEl) {
          const scale = width / BOARD_WIDTH;
          mainEl.style.transform = `scale(${scale})`;
          parentEl.style.height = `${BOARD_HEIGHT * scale}px`;
        }
      });
    });

    resizeObserver.observe(parentEl);
    
    return () => resizeObserver.disconnect();
  }, []);

  const startGame = useCallback(() => {
    setGameStatus(GameStatus.PLAYING);
  }, []);

  const endGame = useCallback(async (score: number, won: boolean) => {
    setFinalScore(score);
    setDidWin(won);
    if (await isHighScore(score)) {
      setGameStatus(GameStatus.ENTER_HIGH_SCORE);
    } else {
      setGameStatus(won ? GameStatus.WIN : GameStatus.GAME_OVER);
    }
  }, []);

  const saveHighScoreAndProceed = useCallback(async (name: string) => {
    const newScore: HighScore = { name, score: finalScore, date: Date.now() };
    await addHighScore(newScore);
    setGameStatus(didWin ? GameStatus.WIN : GameStatus.GAME_OVER);
  }, [finalScore, didWin]);

  const goToMenu = useCallback(() => {
    setGameStatus(GameStatus.START);
  }, []);
  
  const goToSettings = useCallback(() => {
    setGameStatus(GameStatus.SETTINGS);
  }, []);

  const goToHighScores = useCallback(() => {
    setGameStatus(GameStatus.HIGH_SCORES);
  }, []);

  const saveSettings = useCallback((newControls: Controls) => {
    setControls(newControls);
    setGameStatus(GameStatus.START);
  }, []);

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.START:
        return <StartScreen onStart={startGame} onGoToSettings={goToSettings} onGoToHighScores={goToHighScores} />;
      case GameStatus.PLAYING:
        return <GameBoard onEndGame={endGame} controls={controls} />;
      case GameStatus.ENTER_HIGH_SCORE:
        return <EnterHighScoreScreen score={finalScore} onSave={saveHighScoreAndProceed} />;
      case GameStatus.GAME_OVER:
        return <EndScreen score={finalScore} didWin={false} onRestart={startGame} onGoToMenu={goToMenu}/>;
      case GameStatus.WIN:
        return <EndScreen score={finalScore} didWin={true} onRestart={startGame} onGoToMenu={goToMenu}/>;
      case GameStatus.SETTINGS:
        return <SettingsScreen currentControls={controls} onSave={saveSettings} onCancel={goToMenu} />;
      case GameStatus.HIGH_SCORES:
        return <HighScoresScreen onGoToMenu={goToMenu} />;
      default:
        return <StartScreen onStart={startGame} onGoToSettings={goToSettings} onGoToHighScores={goToHighScores} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">
            Brick Wall
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">A classic arcade challenge</p>
        </header>
        <div style={{ position: 'relative' }}>
          <main ref={mainRef} style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, transformOrigin: 'top left' }}>
              {renderContent()}
          </main>
        </div>
        <footer className="mt-8 text-sm text-slate-500 text-center">
          <p>Developed by MFTB.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
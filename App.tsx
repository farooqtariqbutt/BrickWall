

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameStatus, Controls, HighScore } from './types.ts';
import { DEFAULT_CONTROLS, BOARD_WIDTH, BOARD_HEIGHT } from './constants.ts';
import GameBoard, { GameBoardHandles } from './components/GameBoard.tsx';
import StartScreen from './components/StartScreen.tsx';
import EndScreen from './components/EndScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import HighScoresScreen from './components/HighScoresScreen.tsx';
import EnterHighScoreScreen from './components/EnterHighScoreScreen.tsx';
import OnScreenControls from './components/OnScreenControls.tsx';
import PauseButton from './components/PauseButton.tsx';
import PauseScreen from './components/PauseScreen.tsx';
import { addHighScore, isHighScore } from './lib/scoreManager.ts';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START);
  const [finalScore, setFinalScore] = useState(0);
  const [didWin, setDidWin] = useState(false);
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);
  const [showOnScreenControls, setShowOnScreenControls] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const gameBoardRef = useRef<GameBoardHandles>(null);

  const pauseGame = useCallback(() => {
    if (gameStatus === GameStatus.PLAYING) {
        setGameStatus(GameStatus.PAUSED);
    }
  }, [gameStatus]);

  const resumeGame = useCallback(() => {
    if (gameStatus === GameStatus.PAUSED) {
        setGameStatus(GameStatus.PLAYING);
    }
  }, [gameStatus]);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const parentEl = mainEl.parentElement;
    if (!parentEl) return;

    const resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        const { width } = entries[0].contentRect;
        
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
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (gameStatus === GameStatus.PLAYING && (e.key.toLowerCase() === 'p' || e.key === 'Escape')) {
            e.preventDefault();
            pauseGame();
        } else if (gameStatus === GameStatus.PAUSED && (e.key.toLowerCase() === 'p' || e.key === 'Escape')) {
            e.preventDefault();
            resumeGame();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, pauseGame, resumeGame]);

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

  const toggleOnScreenControls = useCallback(() => {
    setShowOnScreenControls(prev => !prev);
  }, []);

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.START:
        return <StartScreen onStart={startGame} onGoToSettings={goToSettings} onGoToHighScores={goToHighScores} onToggleOnScreenControls={toggleOnScreenControls} onScreenControlsEnabled={showOnScreenControls} />;
      case GameStatus.PLAYING:
      case GameStatus.PAUSED:
        return <GameBoard ref={gameBoardRef} onEndGame={endGame} controls={controls} isPaused={gameStatus === GameStatus.PAUSED} />;
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
        return <StartScreen onStart={startGame} onGoToSettings={goToSettings} onGoToHighScores={goToHighScores} onToggleOnScreenControls={toggleOnScreenControls} onScreenControlsEnabled={showOnScreenControls} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <div className="w-16" />
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">
              Brick Wall
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">A classic arcade challenge</p>
          </div>
          <div className="w-16 flex items-center justify-center">
            {gameStatus === GameStatus.PLAYING && <PauseButton onPause={pauseGame} />}
          </div>
        </header>
        <div style={{ position: 'relative' }}>
          <main ref={mainRef} style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, transformOrigin: 'top left' }}>
              {renderContent()}
              {gameStatus === GameStatus.PAUSED && <PauseScreen onResume={resumeGame} onExit={goToMenu} />}
          </main>
        </div>
        
        <div className="w-full h-28 relative mt-4 px-2">
            {(gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.PAUSED) && showOnScreenControls && (
                <OnScreenControls
                    onLeftPress={() => gameBoardRef.current?.setPaddleDirection('left')}
                    onRightPress={() => gameBoardRef.current?.setPaddleDirection('right')}
                    onRelease={() => gameBoardRef.current?.setPaddleDirection(null)}
                    onFire={() => gameBoardRef.current?.fire()}
                />
            )}
        </div>

        <footer className="mt-2 text-sm text-slate-500 text-center">
          <p>Developed by MFTB.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
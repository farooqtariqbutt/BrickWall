import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y_OFFSET,
  PADDLE_SPEED,
  BALL_RADIUS,
  INITIAL_BALL_SPEED,
  BRICK_HEIGHT,
  BRICK_WIDTH,
  BRICK_GAP,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  INITIAL_LIVES,
  POWERUP_CHANCE,
  POWERUP_SPEED,
  POWERUP_SIZE,
  POWERUP_DURATION,
  powerUpColors,
  powerUpDescriptions,
} from '../constants.ts';
import { Brick, Vector, Controls, PowerUp, PowerUpType, ActivePowerUp, Ball } from '../types.ts';
import { levels, levelColors } from '../levels.ts';

interface GameBoardProps {
  onEndGame: (score: number, didWin: boolean) => void;
  controls: Controls;
}

const STUCK_THRESHOLD = 5;
const WALL_HIT_RESET_THRESHOLD = 250;

const createBricks = (levelIndex: number): Brick[] => {
    const bricks: Brick[] = [];
    // Use modulo to prevent out-of-bounds if levelIndex > levels.length
    const layout = levels[levelIndex % levels.length];
    // Cycle through colors if there are more levels than color palettes
    const colors = levelColors[levelIndex % levelColors.length];
    
    if (!layout) {
      console.error(`Level layout for index ${levelIndex} not found.`);
      return [];
    }

    layout.forEach((row, r) => {
      row.forEach((brickType, c) => {
        if (brickType > 0) {
            bricks.push({
                x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_GAP),
                y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_GAP),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                active: true,
                color: colors[r % colors.length],
                health: brickType,
                cracked: false,
            });
        }
      });
    });
    return bricks;
};

const GameBoard: React.FC<GameBoardProps> = ({ onEndGame, controls }) => {
  const [level, setLevel] = useState(0);
  const [isRoundStarted, setIsRoundStarted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  const paddleX = useRef((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const paddleWidth = useRef(PADDLE_WIDTH);
  const paddleY = BOARD_HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT;
  
  const balls = useRef<Ball[]>([]);
  const nextBallId = useRef(0);
  
  const bricks = useRef<Brick[]>(createBricks(level));
  const lives = useRef(INITIAL_LIVES);
  const score = useRef(0);
  const comboCount = useRef(0);
  const powerUps = useRef<PowerUp[]>([]);
  const activePowerUps = useRef<ActivePowerUp[]>([]);

  const animationFrameId = useRef<number | null>(null);
  const paddleDirectionRef = useRef<string | null>(null);
  const levelInputRef = useRef<HTMLInputElement>(null);
  const [, forceRender] = useReducer((s) => s + 1, 0);

  const resetBallAndPaddle = useCallback(() => {
    setIsRoundStarted(false);
    powerUps.current = [];
    activePowerUps.current = [];
    comboCount.current = 0;
    paddleX.current = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
    const startBall: Ball = {
        id: nextBallId.current++,
        pos: { x: paddleX.current + PADDLE_WIDTH / 2, y: paddleY - BALL_RADIUS },
        vel: { x: 0, y: 0 },
        verticalHitStreak: 0,
        wallHitCount: 0,
    };
    balls.current = [startBall];
  }, [paddleY]);


  const handlePowerUpCollection = useCallback((type: PowerUpType) => {
    const now = Date.now();
    const expiresAt = now + POWERUP_DURATION;
    const speedTypes: PowerUpType[] = ['D', 'S'];
    const paddleTypes: PowerUpType[] = ['B', 'T'];
    const gunTypes: PowerUpType[] = ['F'];

    if (type === 'N') {
        activePowerUps.current = [];
        return;
    }

    let category: PowerUpType[] = [];
    if (speedTypes.includes(type)) category = speedTypes;
    if (paddleTypes.includes(type)) category = paddleTypes;
    if (gunTypes.includes(type)) category = gunTypes;

    // Remove existing power-ups in the same category
    if (category.length > 0) {
      activePowerUps.current = activePowerUps.current.filter(p => !category.includes(p.type));
    }
    const newPowerUp: ActivePowerUp = { type, expiresAt };
    if (type === 'F') {
      newPowerUp.shotsRemaining = 10;
    }
    activePowerUps.current.push(newPowerUp);
  }, []);

  const goToLevel = useCallback((targetLevelInput: number) => {
    const targetLevel = parseInt(String(targetLevelInput), 10);
    if (isNaN(targetLevel)) {
        return;
    }

    const targetLevelIndex = targetLevel - 1; // User inputs 1-based, code uses 0-based
    if (targetLevelIndex >= 0 && targetLevelIndex < levels.length) {
        setLevel(targetLevelIndex);
        bricks.current = createBricks(targetLevelIndex);
        resetBallAndPaddle();
        setMessage(`Jump to Level ${targetLevel}`);
        setTimeout(() => setMessage(null), 1500);
        setShowLevelSelector(false);
    } else {
        alert(`Invalid level. Please enter a number between 1 and ${levels.length}.`);
        if (levelInputRef.current) {
            levelInputRef.current.focus();
            levelInputRef.current.select();
        }
    }
  }, [resetBallAndPaddle]);

  const gameLoop = useCallback(() => {
    if (showLevelSelector) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
    }
      
    const now = Date.now();
    
    activePowerUps.current = activePowerUps.current.filter(p => p.expiresAt > now);

    const activePaddlePowerUp = activePowerUps.current.find(p => p.type === 'B' || p.type === 'T');
    const activeSpeedPowerUp = activePowerUps.current.find(p => p.type === 'D' || p.type === 'S');
    
    paddleWidth.current = activePaddlePowerUp
        ? (activePaddlePowerUp.type === 'B' ? PADDLE_WIDTH * 1.5 : PADDLE_WIDTH * 0.5)
        : PADDLE_WIDTH;
    
    const speedMultiplier = activeSpeedPowerUp ? (activeSpeedPowerUp.type === 'D' ? 2.0 : 0.5) : 1.0;
        
    if (paddleDirectionRef.current === 'left') paddleX.current -= PADDLE_SPEED;
    if (paddleDirectionRef.current === 'right') paddleX.current += PADDLE_SPEED;
    paddleX.current = Math.max(0, Math.min(paddleX.current, BOARD_WIDTH - paddleWidth.current));

    if (isRoundStarted) {
        for (let i = balls.current.length - 1; i >= 0; i--) {
            const ball = balls.current[i];
            
            const currentSpeed = Math.sqrt(ball.vel.x ** 2 + ball.vel.y ** 2);
            const targetSpeed = INITIAL_BALL_SPEED * speedMultiplier;
            if (currentSpeed > 0 && Math.abs(currentSpeed - targetSpeed) > 0.1) {
                const factor = targetSpeed / currentSpeed;
                ball.vel.x *= factor;
                ball.vel.y *= factor;
            }

            ball.pos.x += ball.vel.x;
            ball.pos.y += ball.vel.y;
            
            let hitWall = false;

            if (ball.pos.x - BALL_RADIUS < 0 || ball.pos.x + BALL_RADIUS > BOARD_WIDTH) {
              ball.vel.x *= -1;
              ball.verticalHitStreak = (ball.verticalHitStreak || 0) + 1;
              if (ball.verticalHitStreak >= STUCK_THRESHOLD) {
                  ball.vel.y += (Math.random() > 0.5 ? 1 : -1) * 0.5;
                  ball.verticalHitStreak = 0;
              }
              hitWall = true;
            }
            if (ball.pos.y - BALL_RADIUS < 0) {
              ball.vel.y *= -1;
              ball.verticalHitStreak = 0;
              hitWall = true;
            }

            if (hitWall) {
                ball.wallHitCount = (ball.wallHitCount || 0) + 1;

                if (ball.wallHitCount > WALL_HIT_RESET_THRESHOLD) {
                    ball.pos = { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 };
                    
                    const angle = Math.random() * (Math.PI / 2) + Math.PI / 4;
                    ball.vel = {
                        x: INITIAL_BALL_SPEED * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1),
                        y: INITIAL_BALL_SPEED * Math.sin(angle)
                    };

                    ball.wallHitCount = 0;
                    
                    const slowDuration = 2000;
                    const slowExpiresAt = Date.now() + slowDuration;
                    activePowerUps.current = activePowerUps.current.filter(p => p.type !== 'D' && p.type !== 'S');
                    activePowerUps.current.push({ type: 'S', expiresAt: slowExpiresAt });
                }
            }
            
            if (ball.vel.y > 0 && ball.pos.y + BALL_RADIUS >= paddleY && ball.pos.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT && ball.pos.x + BALL_RADIUS > paddleX.current && ball.pos.x - BALL_RADIUS < paddleX.current + paddleWidth.current) {
                ball.vel.y *= -1;
                const hitPos = (ball.pos.x - (paddleX.current + paddleWidth.current / 2)) / (paddleWidth.current / 2);
                ball.vel.x = hitPos * (Math.sqrt(ball.vel.x**2 + ball.vel.y**2) || INITIAL_BALL_SPEED);
                ball.pos.y = paddleY - BALL_RADIUS;
                comboCount.current = 0;
                ball.verticalHitStreak = 0;
            }

            for (const brick of bricks.current) {
                if (!brick.active) continue;

                const closestX = Math.max(brick.x, Math.min(ball.pos.x, brick.x + brick.width));
                const closestY = Math.max(brick.y, Math.min(ball.pos.y, brick.y + brick.height));
                const dx = ball.pos.x - closestX;
                const dy = ball.pos.y - closestY;

                if ((dx * dx + dy * dy) < (BALL_RADIUS * BALL_RADIUS)) {
                    brick.health -= 1;

                    if (brick.health === 1) { // Brick was hit but not destroyed, now show crack
                        brick.cracked = true;
                    }

                    if (brick.health <= 0) {
                        brick.active = false;
                        comboCount.current += 1;
                        score.current += comboCount.current > 1 ? 20 : 10;

                        if (Math.random() < POWERUP_CHANCE) {
                            const types: PowerUpType[] = ['D', 'S', 'B', 'T', 'N', 'F'];
                            const type = types[Math.floor(Math.random() * types.length)];
                            powerUps.current.push({ x: brick.x + brick.width / 2, y: brick.y, type, width: POWERUP_SIZE, height: POWERUP_SIZE, active: true });
                        }
                    }
                    
                    const ballPrevX = ball.pos.x - ball.vel.x;
                    const ballPrevY = ball.pos.y - ball.vel.y;

                    const prevFrameBallLeft = ballPrevX - BALL_RADIUS;
                    const prevFrameBallRight = ballPrevX + BALL_RADIUS;
                    const prevFrameBallTop = ballPrevY - BALL_RADIUS;
                    const prevFrameBallBottom = ballPrevY + BALL_RADIUS;
                    
                    const brickLeft = brick.x;
                    const brickRight = brick.x + brick.width;
                    const brickTop = brick.y;
                    const brickBottom = brick.y + brick.height;
                    
                    const wasClearX = prevFrameBallRight <= brickLeft || prevFrameBallLeft >= brickRight;
                    const wasClearY = prevFrameBallBottom <= brickTop || prevFrameBallTop >= brickBottom;
                    
                    if (wasClearX && !wasClearY) { // Vertical hit
                        ball.vel.x *= -1;
                        ball.verticalHitStreak = (ball.verticalHitStreak || 0) + 1;
                        if (ball.verticalHitStreak >= STUCK_THRESHOLD) {
                            ball.vel.y += (Math.random() > 0.5 ? 1 : -1) * 0.5;
                            ball.verticalHitStreak = 0;
                        }
                    } else if (!wasClearX && wasClearY) { // Horizontal hit
                        ball.vel.y *= -1;
                        ball.verticalHitStreak = 0;
                    } else { // Corner hit
                        ball.vel.x *= -1;
                        ball.vel.y *= -1;
                        ball.verticalHitStreak = 0;
                    }

                    break; 
                }
            }
            if (ball.pos.y > BOARD_HEIGHT) balls.current.splice(i, 1);
        }
    } else if (balls.current[0]) {
        balls.current[0].pos.x = paddleX.current + paddleWidth.current / 2;
    }

    powerUps.current = powerUps.current.map(p => ({ ...p, y: p.y + POWERUP_SPEED })).filter(p => {
        if (p.active && p.y + p.height > paddleY && p.x + p.width > paddleX.current && p.x < paddleX.current + paddleWidth.current) {
            handlePowerUpCollection(p.type);
            return false;
        }
        return p.active && p.y < BOARD_HEIGHT;
    });

    if (isRoundStarted && balls.current.length === 0) {
        lives.current -= 1;
        if (lives.current > 0) resetBallAndPaddle();
        else { onEndGame(score.current, false); return; }
    }
    
    if (bricks.current.filter(b => b.active).length === 0) {
        const nextLevel = level + 1; 
        
        let nextBrickLayoutIndex: number;

        if (nextLevel < 6) { 
            nextBrickLayoutIndex = nextLevel;
            if (nextBrickLayoutIndex >= levels.length) {
                console.warn("Not enough levels defined for sequential play. Ending game.");
                onEndGame(score.current, true);
                return;
            }
        } else { 
            const minIndex = 5; 
            const maxIndex = Math.min(24, levels.length - 1);

            if (minIndex > maxIndex) {
                 console.warn("Random level pool is empty. Ending game.");
                 onEndGame(score.current, true);
                 return;
            }

            nextBrickLayoutIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
        }

        setLevel(nextLevel);
        bricks.current = createBricks(nextBrickLayoutIndex);
        resetBallAndPaddle();
        setMessage(`Level ${nextLevel + 1}`);
        setTimeout(() => setMessage(null), 1500);
    }
    
    forceRender();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [level, isRoundStarted, paddleY, onEndGame, handlePowerUpCollection, resetBallAndPaddle, showLevelSelector]);

  useEffect(() => {
    resetBallAndPaddle();
    forceRender();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'F5') {
            e.preventDefault();
            setShowLevelSelector(prev => !prev);
            return;
        }

        if (showLevelSelector) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowLevelSelector(false);
            }
            return; // Block game controls while selector is open
        }

        if (e.key === controls.left) paddleDirectionRef.current = 'left';
        else if (e.key === controls.right) paddleDirectionRef.current = 'right';
        else if (e.key === controls.launch) {
            e.preventDefault();
            if (!isRoundStarted) {
                setIsRoundStarted(true);
                const angle = (Math.random() * Math.PI) / 2 + Math.PI / 4;
                if(balls.current[0]) {
                    balls.current[0].vel = { x: INITIAL_BALL_SPEED * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1), y: -INITIAL_BALL_SPEED * Math.sin(angle) };
                }
            } else {
                const firePowerUp = activePowerUps.current.find(p => p.type === 'F');
                if (firePowerUp && typeof firePowerUp.shotsRemaining === 'number' && firePowerUp.shotsRemaining > 0) {
                    const newBall: Ball = {
                        id: nextBallId.current++,
                        pos: { x: paddleX.current + paddleWidth.current / 2, y: paddleY - BALL_RADIUS },
                        vel: { x: 0, y: -INITIAL_BALL_SPEED },
                        verticalHitStreak: 0,
                        wallHitCount: 0,
                    };
                    balls.current.push(newBall);
                    firePowerUp.shotsRemaining -= 1;
                }
            }
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if ((e.key === controls.left && paddleDirectionRef.current === 'left') || (e.key === controls.right && paddleDirectionRef.current === 'right')) {
            paddleDirectionRef.current = null;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRoundStarted, controls, paddleY, showLevelSelector]);
  
  const nowForRender = Date.now();
  const firePowerUpForRender = activePowerUps.current.find(p => p.type === 'F');
  const isGunActiveForRender = !!firePowerUpForRender;

  return (
    <div className="relative bg-slate-900 border-4 border-cyan-700/50 shadow-2xl shadow-cyan-500/10 rounded-lg overflow-hidden"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      aria-label="Game Board"
    >
      <div className="absolute top-2 left-4 text-lg font-bold text-slate-300" aria-live="polite">Score: <span className="text-white">{score.current}</span></div>
      <div className="absolute top-2 right-4 text-lg font-bold text-slate-300" aria-live="polite">Lives: <span className="text-white">{lives.current}</span></div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl font-bold text-cyan-400" aria-live="polite">
        Level {level + 1}
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 left-4 w-48 space-y-2">
        {activePowerUps.current.map(p => {
            const remaining = p.expiresAt - nowForRender;
            const progress = (remaining / (p.type === 'S' && p.expiresAt - nowForRender < 2100 ? 2000 : POWERUP_DURATION)) * 100;
            return (
                <div key={`${p.type}-${p.expiresAt}`} className="text-sm">
                    <div className="flex justify-between items-center text-slate-300 font-semibold">
                        <span>
                          {powerUpDescriptions[p.type]}
                          {p.type === 'F' && typeof p.shotsRemaining === 'number' && ` (${p.shotsRemaining})`}
                        </span>
                        <span>{Math.ceil(remaining / 1000)}s</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1"><div className="bg-cyan-400 h-1.5 rounded-full" style={{width: `${progress}%`}}></div></div>
                </div>
            );
        })}
      </div>
      
      {bricks.current.map((brick, index) => brick.active ? (
        <div 
          key={index} 
          className="absolute" 
          style={{ 
            left: brick.x, 
            top: brick.y, 
            width: brick.width, 
            height: brick.height, 
            background: brick.color, 
            boxShadow: brick.health > 1 ? `0 0 10px ${brick.color}, inset 0 0 4px rgba(255,255,255,0.7)` : `0 0 5px ${brick.color}`, 
            borderRadius: '4px', 
            transition: 'box-shadow 0.2s linear, background-color 0.2s linear' 
          }}
        >
          {brick.cracked && (
              <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M 10 5 L 40 35 L 50 10 L 70 30 L 90 8" stroke="rgba(0, 0, 0, 0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 45 33 L 55 12 L 65 28" stroke="rgba(0, 0, 0, 0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
              </div>
          )}
        </div>
      ) : null)}

      {powerUps.current.map((p, i) => (<div key={i} className={`absolute flex items-center justify-center font-bold text-white rounded-md border-2 ${powerUpColors[p.type]}`} style={{ left: p.x - p.width / 2, top: p.y, width: p.width, height: p.height, boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>{p.type}</div>))}

      <div className="absolute bg-cyan-400 rounded-md" role="presentation" style={{ left: paddleX.current, top: paddleY, width: paddleWidth.current, height: PADDLE_HEIGHT, boxShadow: '0 0 15px #06b6d4', transition: 'width 150ms ease-in-out' }}>
        {isGunActiveForRender && (
            <>
                <div className="absolute top-[-8px] left-[10px] w-4 h-4 bg-slate-600 rounded-sm border-2 border-slate-400" />
                <div className="absolute top-[-8px] right-[10px] w-4 h-4 bg-slate-600 rounded-sm border-2 border-slate-400" />
            </>
        )}
      </div>
      
      {balls.current.map(ball => (
        <div key={ball.id} className="absolute bg-white rounded-full" role="presentation" style={{ left: ball.pos.x - BALL_RADIUS, top: ball.pos.y - BALL_RADIUS, width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, boxShadow: '0 0 10px #ffffff' }} />
      ))}

      {message && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-slate-900/70 backdrop-blur-sm p-8 rounded-lg shadow-lg"><p className="text-4xl font-bold text-white/90 animate-pulse tracking-wide">{message}</p></div></div>
      )}

      {!isRoundStarted && !showLevelSelector && !message && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-lg shadow-lg"><p className="text-2xl font-bold text-white/90 animate-pulse tracking-wide">Press {controls.launch === ' ' ? 'Space' : `'${controls.launch}'`} to start</p></div></div>
      )}
      
      {isGunActiveForRender && firePowerUpForRender && isRoundStarted && balls.current.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/60 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              {(typeof firePowerUpForRender.shotsRemaining === 'number' && firePowerUpForRender.shotsRemaining > 0) ? (
                <p className="text-lg font-bold text-purple-400 animate-pulse tracking-wide">
                  Fire Power! ({firePowerUpForRender.shotsRemaining} left) Press {controls.launch === ' ' ? 'Space' : `'${controls.launch}'`} to shoot!
                </p>
              ) : (
                <p className="text-lg font-bold text-slate-500 tracking-wide">
                  Fire Power! (Out of ammo)
                </p>
              )}
            </div>
          </div>
      )}

      {showLevelSelector && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={(e) => { e.preventDefault(); if (levelInputRef.current) goToLevel(parseInt(levelInputRef.current.value, 10)); }}>
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700 text-center">
              <label htmlFor="level-input" className="block text-2xl font-bold text-slate-200 mb-4">
                Jump to Level
              </label>
              <p className="text-slate-400 mb-4">Enter a level from 1 to {levels.length}.</p>
              <div className="flex space-x-2">
                <input
                  ref={levelInputRef}
                  id="level-input"
                  type="number"
                  min="1"
                  max={levels.length}
                  defaultValue={level + 1}
                  className="bg-slate-900 text-white p-2 rounded-md w-32 text-center text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setShowLevelSelector(false); } }}
                />
                <button type="submit" className="px-6 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                  Go
                </button>
              </div>
               <p className="text-slate-500 text-sm mt-4">Press F5 or Escape to close</p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
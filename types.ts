
export interface Vector {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  pos: Vector;
  vel: Vector;
  verticalHitStreak: number;
  wallHitCount: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  color: string;
  health: number;
  cracked: boolean;
}

export enum GameStatus {
  START,
  PLAYING,
  GAME_OVER,
  WIN,
  SETTINGS,
  HIGH_SCORES,
  ENTER_HIGH_SCORE,
}

export interface Controls {
  left: string;
  right: string;
  launch: string;
}

export type PowerUpType = 'D' | 'S' | 'B' | 'T' | 'N' | 'F';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  width: number;
  height: number;
  active: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
  shotsRemaining?: number;
}

export interface HighScore {
  name: string;
  score: number;
  date: number;
}

import { Controls, PowerUpType } from './types.ts';

export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 600;

export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y_OFFSET = 30;
export const PADDLE_SPEED = 8;

export const BALL_RADIUS = 10;
export const INITIAL_BALL_SPEED = 6;

export const BRICK_ROWS = 6;
export const BRICK_COLS = 10;
export const BRICK_HEIGHT = 25;
export const BRICK_GAP = 4;
export const BRICK_OFFSET_TOP = 50;
export const BRICK_OFFSET_LEFT = 30;

const totalBrickSpaceX = BOARD_WIDTH - 2 * BRICK_OFFSET_LEFT;
const totalGapX = (BRICK_COLS - 1) * BRICK_GAP;
export const BRICK_WIDTH = (totalBrickSpaceX - totalGapX) / BRICK_COLS;


export const INITIAL_LIVES = 3;

export const DEFAULT_CONTROLS: Controls = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  launch: ' ',
};

export const POWERUP_CHANCE = 0.25; // 25% chance
export const POWERUP_SPEED = 2.5;
export const POWERUP_SIZE = 28;
export const POWERUP_DURATION = 10000; // 10 seconds

export const powerUpColors: Record<PowerUpType, string> = {
  D: 'bg-red-500 border-red-300',
  S: 'bg-sky-500 border-sky-300',
  B: 'bg-green-500 border-green-300',
  T: 'bg-orange-500 border-orange-300',
  N: 'bg-slate-500 border-slate-300',
  F: 'bg-purple-500 border-purple-300',
  L: 'bg-yellow-400 border-yellow-200',
};

export const powerUpDescriptions: Record<PowerUpType, string> = {
  D: 'Double Speed',
  S: 'Slow Speed',
  B: 'Big Paddle',
  T: 'Tiny Paddle',
  N: 'Normal',
  F: 'Fire Power',
  L: 'Laser Ball',
};
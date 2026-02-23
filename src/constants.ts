export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const WIN_SCORE = 1000;
export const ROCKET_SPAWN_RATE = 0.01; // Reduced from 0.015
export const ROCKET_SPEED_BASE = 0.9; // Reduced from 1.2
export const MISSILE_SPEED = 9; // Increased from 7

export const EXPLOSION_MAX_RADIUS = 60; // Increased from 50
export const EXPLOSION_GROWTH_RATE = 2.5; // Increased from 2.0

export const BATTERY_AMMO_SIDE = 50; // Increased from 40
export const BATTERY_AMMO_MIDDLE = 80; // Increased from 60

export const COLORS = {
  BACKGROUND: '#0a0a0a',
  CITY: '#3b82f6',
  BATTERY: '#10b981',
  ROCKET: '#ef4444',
  MISSILE: '#ffffff',
  EXPLOSION: 'rgba(249, 115, 22, 0.7)',
  TARGET_X: '#ffffff',
};

export const TEXT = {
  zh: {
    title: '天佑新星防御',
    start: '开始游戏',
    win: '防御成功！',
    lose: '防御失败...',
    restart: '再玩一次',
    score: '得分',
    ammo: '弹药',
    mission: '保护城市，击落火箭',
    goal: '目标分数: 1000',
  },
  en: {
    title: 'Nova Defense',
    start: 'Start Game',
    win: 'Mission Success!',
    lose: 'Mission Failed...',
    restart: 'Play Again',
    score: 'Score',
    ammo: 'Ammo',
    mission: 'Protect cities, intercept rockets',
    goal: 'Target Score: 1000',
  }
};

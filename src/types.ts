export interface Point {
  x: number;
  y: number;
}

export interface Rocket {
  id: string;
  start: Point;
  end: Point;
  current: Point;
  speed: number;
  angle: number;
}

export interface Missile {
  id: string;
  start: Point;
  target: Point;
  current: Point;
  speed: number;
  batteryIndex: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  growthRate: number;
  isExpanding: boolean;
}

export interface City {
  id: number;
  x: number;
  y: number;
  isDestroyed: boolean;
}

export interface Battery {
  id: number;
  x: number;
  y: number;
  ammo: number;
  maxAmmo: number;
  isDestroyed: boolean;
}

export type GameStatus = 'START' | 'PLAYING' | 'WON' | 'LOST';

export interface GameState {
  score: number;
  status: GameStatus;
  rockets: Rocket[];
  missiles: Missile[];
  explosions: Explosion[];
  cities: City[];
  batteries: Battery[];
  level: number;
}

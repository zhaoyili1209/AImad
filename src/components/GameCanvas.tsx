import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Point, Rocket, Missile, Explosion, City, Battery, GameState, GameStatus 
} from '../types';
import { 
  GAME_WIDTH, GAME_HEIGHT, ROCKET_SPAWN_RATE, ROCKET_SPEED_BASE, 
  MISSILE_SPEED, EXPLOSION_MAX_RADIUS, EXPLOSION_GROWTH_RATE,
  BATTERY_AMMO_SIDE, BATTERY_AMMO_MIDDLE, COLORS, WIN_SCORE
} from '../constants';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onGameStatusChange: (status: GameStatus) => void;
  status: GameStatus;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate, onGameStatusChange, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const stateRef = useRef<GameState>({
    score: 0,
    status: 'START',
    rockets: [],
    missiles: [],
    explosions: [],
    cities: [],
    batteries: [],
    level: 1,
  });

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize game objects
  const initGame = useCallback(() => {
    const cities: City[] = [];
    const batteries: Battery[] = [];
    const totalSlots = 15;
    const slotWidth = GAME_WIDTH / totalSlots;
    
    // Layout: B C B C B C B B B C B C B C B
    // Indices for batteries: 0, 2, 4, 6, 7, 8, 10, 12, 14
    // Indices for cities: 1, 3, 5, 9, 11, 13
    
    const batteryIndices = [0, 2, 4, 6, 7, 8, 10, 12, 14];
    const cityIndices = [1, 3, 5, 9, 11, 13];

    cityIndices.forEach((idx, i) => {
      cities.push({
        id: i,
        x: (idx + 0.5) * slotWidth,
        y: GAME_HEIGHT - 30,
        isDestroyed: false,
      });
    });

    batteryIndices.forEach((idx, i) => {
      const isMiddle = idx >= 6 && idx <= 8;
      const ammo = isMiddle ? BATTERY_AMMO_MIDDLE : BATTERY_AMMO_SIDE;
      batteries.push({
        id: i,
        x: (idx + 0.5) * slotWidth,
        y: GAME_HEIGHT - 40,
        ammo,
        maxAmmo: ammo,
        isDestroyed: false,
      });
    });

    stateRef.current = {
      score: 0,
      status: 'PLAYING',
      rockets: [],
      missiles: [],
      explosions: [],
      cities,
      batteries,
      level: 1,
    };
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (status === 'PLAYING' && stateRef.current.status !== 'PLAYING') {
      initGame();
    }
  }, [status, initGame]);

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      const parent = canvasRef.current.parentElement;
      if (parent) {
        const { clientWidth, clientHeight } = parent;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const spawnRocket = () => {
    if (Math.random() < ROCKET_SPAWN_RATE + (stateRef.current.level * 0.002)) {
      const startX = Math.random() * GAME_WIDTH;
      const targets = [...stateRef.current.cities, ...stateRef.current.batteries].filter(t => !t.isDestroyed);
      if (targets.length === 0) return;
      
      const target = targets[Math.floor(Math.random() * targets.length)];
      const id = Math.random().toString(36).substr(2, 9);
      
      const angle = Math.atan2(target.y - 0, target.x - startX);
      
      stateRef.current.rockets.push({
        id,
        start: { x: startX, y: 0 },
        end: { x: target.x, y: target.y },
        current: { x: startX, y: 0 },
        speed: ROCKET_SPEED_BASE + Math.random() * 0.3 + (stateRef.current.level * 0.1),
        angle,
      });
    }
  };

  const update = () => {
    if (stateRef.current.status !== 'PLAYING') return;

    spawnRocket();

    // Update Rockets
    stateRef.current.rockets.forEach((rocket, index) => {
      rocket.current.x += Math.cos(rocket.angle) * rocket.speed;
      rocket.current.y += Math.sin(rocket.angle) * rocket.speed;

      // Check if hit target
      const dist = Math.hypot(rocket.current.x - rocket.end.x, rocket.current.y - rocket.end.y);
      if (dist < 5) {
        // Create impact explosion
        stateRef.current.explosions.push({
          id: Math.random().toString(36).substr(2, 9),
          x: rocket.end.x,
          y: rocket.end.y,
          radius: 0,
          maxRadius: EXPLOSION_MAX_RADIUS,
          growthRate: EXPLOSION_GROWTH_RATE,
          isExpanding: true,
        });

        // Destroy target
        const city = stateRef.current.cities.find(c => c.x === rocket.end.x && c.y === rocket.end.y);
        if (city) city.isDestroyed = true;
        const battery = stateRef.current.batteries.find(b => b.x === rocket.end.x && b.y === rocket.end.y);
        if (battery) battery.isDestroyed = true;

        stateRef.current.rockets.splice(index, 1);
      }
    });

    // Update Missiles
    stateRef.current.missiles.forEach((missile, index) => {
      const angle = Math.atan2(missile.target.y - missile.current.y, missile.target.x - missile.current.x);
      missile.current.x += Math.cos(angle) * missile.speed;
      missile.current.y += Math.sin(angle) * missile.speed;

      const dist = Math.hypot(missile.current.x - missile.target.x, missile.current.y - missile.target.y);
      if (dist < 5) {
        stateRef.current.explosions.push({
          id: Math.random().toString(36).substr(2, 9),
          x: missile.target.x,
          y: missile.target.y,
          radius: 0,
          maxRadius: EXPLOSION_MAX_RADIUS,
          growthRate: EXPLOSION_GROWTH_RATE,
          isExpanding: true,
        });
        stateRef.current.missiles.splice(index, 1);
      }
    });

    // Update Explosions
    stateRef.current.explosions.forEach((exp, index) => {
      if (exp.isExpanding) {
        exp.radius += exp.growthRate;
        if (exp.radius >= exp.maxRadius) {
          exp.isExpanding = false;
        }
      } else {
        exp.radius -= exp.growthRate * 0.5;
        if (exp.radius <= 0) {
          stateRef.current.explosions.splice(index, 1);
        }
      }

      // Check collision with rockets
      stateRef.current.rockets.forEach((rocket, rIndex) => {
        const dist = Math.hypot(rocket.current.x - exp.x, rocket.current.y - exp.y);
        if (dist < exp.radius) {
          stateRef.current.rockets.splice(rIndex, 1);
          stateRef.current.score += 20;
          onScoreUpdate(stateRef.current.score);
        }
      });
    });

    // Check Win/Loss
    if (stateRef.current.score >= WIN_SCORE) {
      stateRef.current.status = 'WON';
      onGameStatusChange('WON');
    }

    const allBatteriesDestroyed = stateRef.current.batteries.every(b => b.isDestroyed);
    if (allBatteriesDestroyed) {
      stateRef.current.status = 'LOST';
      onGameStatusChange('LOST');
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Rockets
    ctx.lineWidth = 2; // Increased from 1
    stateRef.current.rockets.forEach(rocket => {
      ctx.strokeStyle = COLORS.ROCKET;
      ctx.beginPath();
      ctx.moveTo(rocket.start.x, rocket.start.y);
      ctx.lineTo(rocket.current.x, rocket.current.y);
      ctx.stroke();
      
      ctx.fillStyle = COLORS.ROCKET;
      ctx.fillRect(rocket.current.x - 3, rocket.current.y - 3, 6, 6); // Increased from 4x4
    });

    // Draw Missiles
    stateRef.current.missiles.forEach(missile => {
      ctx.strokeStyle = COLORS.MISSILE;
      ctx.lineWidth = 4; // Increased from 2
      ctx.beginPath();
      ctx.moveTo(missile.start.x, missile.start.y);
      ctx.lineTo(missile.current.x, missile.current.y);
      ctx.stroke();

      // Target X
      ctx.strokeStyle = COLORS.TARGET_X;
      ctx.lineWidth = 3; // Increased from 2
      const size = 12; // Increased from 8
      ctx.beginPath();
      ctx.moveTo(missile.target.x - size, missile.target.y - size);
      ctx.lineTo(missile.target.x + size, missile.target.y + size);
      ctx.moveTo(missile.target.x + size, missile.target.y - size);
      ctx.lineTo(missile.target.x - size, missile.target.y + size);
      ctx.stroke();
      ctx.lineWidth = 1;
    });

    // Draw Explosions
    stateRef.current.explosions.forEach(exp => {
      ctx.fillStyle = COLORS.EXPLOSION;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Cities
    stateRef.current.cities.forEach(city => {
      if (!city.isDestroyed) {
        ctx.fillStyle = COLORS.CITY;
        ctx.fillRect(city.x - 15, city.y - 10, 30, 20);
        // Add some detail
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(city.x - 10, city.y - 5, 5, 5);
        ctx.fillRect(city.x + 5, city.y - 5, 5, 5);
      }
    });

    // Draw Batteries
    stateRef.current.batteries.forEach((battery, i) => {
      if (!battery.isDestroyed) {
        // Base structure
        ctx.fillStyle = COLORS.BATTERY;
        ctx.beginPath();
        ctx.arc(battery.x, battery.y, 25, Math.PI, 0);
        ctx.fill();
        
        // Cannon barrel
        ctx.save();
        ctx.translate(battery.x, battery.y);
        ctx.fillStyle = '#059669'; // Darker green for barrel
        ctx.fillRect(-6, -30, 12, 20);
        ctx.restore();

        // Ammo count bubble
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(battery.x - 20, battery.y + 5, 40, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(battery.ammo.toString(), battery.x, battery.y + 18);

        // Battery Label
        const labels = ['A1', 'A2', 'A3', 'M1', 'M2', 'M3', 'B1', 'B2', 'B3'];
        ctx.fillStyle = COLORS.BATTERY;
        ctx.font = '900 10px "Inter"';
        ctx.globalAlpha = 0.8;
        ctx.fillText(labels[i] || `B${i+1}`, battery.x, battery.y - 40);
        ctx.globalAlpha = 1.0;
      } else {
        // Draw ruins
        ctx.fillStyle = '#444444';
        ctx.fillRect(battery.x - 20, battery.y - 5, 40, 10);
        ctx.font = 'bold 10px "Inter"';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('OFFLINE', battery.x, battery.y + 15);
      }
    });
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (stateRef.current.status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale coordinates to internal GAME_WIDTH/GAME_HEIGHT
    const x = (clientX - rect.left) * (GAME_WIDTH / rect.width);
    const y = (clientY - rect.top) * (GAME_HEIGHT / rect.height);

    // Find best battery
    const availableBatteries = stateRef.current.batteries
      .filter(b => !b.isDestroyed && b.ammo > 0)
      .sort((a, b) => {
        const distA = Math.hypot(a.x - x, a.y - y);
        const distB = Math.hypot(b.x - x, b.y - y);
        return distA - distB;
      });

    if (availableBatteries.length > 0) {
      const battery = availableBatteries[0];
      battery.ammo--;
      
      stateRef.current.missiles.push({
        id: Math.random().toString(36).substr(2, 9),
        start: { x: battery.x, y: battery.y },
        target: { x, y },
        current: { x: battery.x, y: battery.y },
        speed: MISSILE_SPEED,
        batteryIndex: battery.id,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="max-w-full max-h-full object-contain cursor-crosshair"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
    </div>
  );
};

export default GameCanvas;

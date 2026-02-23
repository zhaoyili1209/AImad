import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Trophy, RotateCcw, Globe2 } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameStatus } from './types';
import { TEXT, WIN_SCORE } from './constants';

export default function App() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>('START');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const t = TEXT[lang];

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleStatusChange = useCallback((newStatus: GameStatus) => {
    setStatus(newStatus);
  }, []);

  const startGame = () => {
    setStatus('PLAYING');
    setScore(0);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2">
              <Shield className="text-emerald-500 w-6 h-6" />
              {t.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <Target className="w-3 h-3" />
              {t.goal}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">{t.score}</span>
            <span className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
          
          <button 
            onClick={toggleLang}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Switch Language"
          >
            <Globe2 className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <main className="flex-1 relative">
        <GameCanvas 
          onScoreUpdate={handleScoreUpdate} 
          onGameStatusChange={handleStatusChange}
          status={status}
        />

        {/* Overlays */}
        <AnimatePresence>
          {status === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="text-center p-8 max-w-md">
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="mb-8"
                >
                  <Shield className="w-24 h-24 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-4xl font-black mb-2 tracking-tighter">{t.title}</h2>
                  <p className="text-neutral-400 italic">{t.mission}</p>
                </motion.div>
                
                <button
                  onClick={startGame}
                  className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.start}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>
              </div>
            </motion.div>
          )}

          {status === 'WON' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-emerald-950/40 backdrop-blur-md"
            >
              <div className="text-center p-8">
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="mb-6"
                >
                  <Trophy className="w-32 h-32 text-yellow-400 mx-auto drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                </motion.div>
                <h2 className="text-5xl font-black mb-4 text-white tracking-tighter">{t.win}</h2>
                <p className="text-2xl font-mono text-emerald-300 mb-8">{t.score}: {score}</p>
                
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 mx-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.restart}
                </button>
              </div>
            </motion.div>
          )}

          {status === 'LOST' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-red-950/40 backdrop-blur-md"
            >
              <div className="text-center p-8">
                <div className="mb-6">
                  <div className="w-24 h-24 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl font-bold text-red-500">!</span>
                  </div>
                </div>
                <h2 className="text-5xl font-black mb-4 text-white tracking-tighter">{t.lose}</h2>
                <p className="text-2xl font-mono text-red-300 mb-8">{t.score}: {score}</p>
                
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 mx-auto px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.restart}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Progress */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center gap-2 pointer-events-none">
        {/* Battery Status Indicators */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2 max-w-2xl">
          {['A1', 'A2', 'A3', 'M1', 'M2', 'M3', 'B1', 'B2', 'B3'].map((name, i) => (
            <div key={name} className="flex flex-col items-center">
              <div className="text-[8px] font-black text-neutral-500 mb-0.5 tracking-widest">{name}</div>
              <div className="w-8 h-1 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: "100%" }}
                  animate={{ 
                    width: status === 'PLAYING' ? "100%" : "0%",
                    backgroundColor: status === 'LOST' ? "#ef4444" : "#10b981"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/10 flex items-center gap-4">
          <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (score / WIN_SCORE) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
            Progress to Victory
          </span>
        </div>
      </div>
    </div>
  );
}

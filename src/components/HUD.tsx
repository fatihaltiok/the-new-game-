import { Heart, Coins, Gem, Trophy } from 'lucide-react';
import { GameState } from '../types';

interface HUDProps {
  state: GameState;
}

export default function HUD({ state }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex flex-col gap-2 z-10 font-pixel pointer-events-none">
      {/* Top Bar Wrapper */}
      <div className="flex items-center justify-between bg-[#1a1410]/80 border-b-4 border-[#3d2b1f] p-3 rounded-md shadow-2xl">
        
        {/* Profile and Lives */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 border-4 border-[#5c4033] bg-[#2a1e17] flex items-center justify-center overflow-hidden">
            {/* Minimal Pixel Hero Silhouette */}
            <div className="text-4xl">🧔</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-2xl text-[#d4af37]">
              <span>x</span>
              <span className="text-3xl">{state.lives.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart 
                  key={i} 
                  size={20} 
                  fill={i < state.health ? "#ff4d4d" : "transparent"} 
                  color={i < state.health ? "#ff4d4d" : "#5c4033"} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Coins className="text-[#ffd700]" size={24} />
            <span className="text-3xl text-[#ffd700]">x {state.coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="text-[#40e0d0]" size={24} />
            <span className="text-3xl text-[#40e0d0]">x {state.gems}</span>
          </div>
        </div>

        {/* Score and Stage */}
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <span className="text-sm opacity-60 uppercase">Score</span>
            <span className="text-4xl text-[#fff] tracking-widest">
              {state.score.toString().padStart(7, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm opacity-60 uppercase">Stage</span>
            <span className="text-4xl text-[#fff]">{state.stage}</span>
          </div>
          <div className="p-2 border-2 border-[#d4af37] bg-[#3d2b1f]/50">
            <Trophy className="text-[#d4af37]" />
          </div>
        </div>

      </div>

      <div className="text-center mt-4">
         <h1 className="text-2xl text-[#d4af37] tracking-[0.2em] font-bold uppercase drop-shadow-md">
           PONYTAIL QUEST: BEARD OF VICTORY
         </h1>
      </div>
    </div>
  );
}

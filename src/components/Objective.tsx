import { CheckSquare, Square } from 'lucide-react';
import { GameState } from '../types';

interface ObjectiveProps {
  state: GameState;
}

export default function Objective({ state }: ObjectiveProps) {
  return (
    <div className="absolute bottom-4 left-4 p-4 bg-[#1a1410]/90 border-4 border-[#3d2b1f] rounded-sm min-w-[280px] font-pixel z-10 pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
         <span className="text-xl text-[#d4af37]">★</span>
         <span className="text-sm text-[#d4af37] uppercase tracking-wider font-bold">Objective</span>
      </div>
      <div className="flex items-start gap-3">
         {state.objectiveCompleted ? (
           <CheckSquare className="text-green-500 mt-1" size={24} />
         ) : (
           <Square className="text-[#5c4033] mt-1" size={24} />
         )}
         <div className="flex flex-col">
            <span className={`text-xl ${state.objectiveCompleted ? 'text-green-500/80 line-through' : 'text-[#d8c8b8]'}`}>
              {state.objective}
            </span>
            {state.objectiveCompleted && (
              <span className="text-xs text-green-400 mt-1 uppercase animate-pulse">
                Region Restored! +1000 Beard Points
              </span>
            )}
         </div>
      </div>
    </div>
  );
}

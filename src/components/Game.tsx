import React, { useEffect, useRef, useState } from 'react';
import HUD from './HUD';
import Objective from './Objective';
import { GameState, INITIAL_STATE } from '../types';

// Constants
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const SPEED = 5;

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'gem' | 'beacon';
  collected: boolean;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  // Game state refs (to avoid stale closures in the loop)
  const playerRef = useRef({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    width: 24,
    height: 48,
    grounded: false
  });

  const entitiesRef = useRef<Entity[]>([
    { x: 300, y: 400, width: 20, height: 20, type: 'coin', collected: false },
    { x: 340, y: 400, width: 20, height: 20, type: 'coin', collected: false },
    { x: 380, y: 400, width: 20, height: 20, type: 'coin', collected: false },
    { x: 100, y: 150, width: 20, height: 20, type: 'coin', collected: false },
    { x: 140, y: 150, width: 20, height: 20, type: 'coin', collected: false },
    { x: 600, y: 300, width: 30, height: 30, type: 'gem', collected: false },
    { x: 1800, y: 200, width: 40, height: 60, type: 'beacon', collected: false },
  ]);

  const platformsRef = useRef([
    { x: 0, y: 550, width: 2000, height: 50 }, // Ground
    { x: 250, y: 450, width: 200, height: 20 },
    { x: 500, y: 350, width: 200, height: 20 },
    { x: 100, y: 200, width: 100, height: 20 }, // High platform
    { x: 800, y: 450, width: 300, height: 20 },
    { x: 1200, y: 350, width: 200, height: 20 },
    { x: 1500, y: 250, width: 400, height: 20 }, // Goal platform
    { x: 1100, y: 500, width: 500, height: 50 }, // More ground
  ]);

  const parallaxRef = useRef([
     { x: 100, y: 100, scale: 0.2, color: '#2a3a54' }, // Distant tower
     { x: 500, y: 150, scale: 0.2, color: '#2a3a54' },
     { x: 300, y: 200, scale: 0.5, color: '#3a4a64' }, // Mid mountain
     { x: 800, y: 250, scale: 0.5, color: '#3a4a64' },
  ]);

  const npcRef = useRef({
    x: 400,
    y: 518,
    width: 32,
    height: 32,
    text: "WELL DONE, HAIRY HERO!",
    active: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.code]: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationGroupId = 0;
    const update = () => {
      const player = playerRef.current;

      // Input
      if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -SPEED;
      else if (keys['ArrowRight'] || keys['KeyD']) player.vx = SPEED;
      else player.vx = 0;

      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
      }

      // Physics
      player.vy += GRAVITY;
      player.x += player.vx;
      player.y += player.vy;

      // Platform Collisions
      player.grounded = false;
      for (const plat of platformsRef.current) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y < plat.y + plat.height &&
          player.y + player.height > plat.y
        ) {
          // Resolve vertical collision
          if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.grounded = true;
          } else if (player.vy < 0 && player.y - player.vy >= plat.y + plat.height) {
            player.y = plat.y + plat.height;
            player.vy = 0;
          } else {
            // Resolve horizontal collision
            if (player.vx > 0) player.x = plat.x - player.width;
            if (player.vx < 0) player.x = plat.x + plat.width;
          }
        }
      }

      // Boundary
      if (player.x < 0) player.x = 0;

      // Entity Collection
      entitiesRef.current.forEach(entity => {
        if (!entity.collected &&
            player.x < entity.x + entity.width &&
            player.x + player.width > entity.x &&
            player.y < entity.y + entity.height &&
            player.y + player.height > entity.y) {
          
          entity.collected = true;
          setGameState(prev => {
            let next = { ...prev };
            if (entity.type === 'coin') {
              next.coins += 1;
              next.score += 100;
            } else if (entity.type === 'gem') {
              next.gems += 1;
              next.score += 500;
            } else if (entity.type === 'beacon') {
              next.objectiveCompleted = true;
              next.score += 1000;
            }
            return next;
          });
        }
      });

      draw();
      animationGroupId = requestAnimationFrame(update);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Fixed Background (Sky Gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0a0a1a');
      skyGrad.addColorStop(0.5, '#2a2a4a');
      skyGrad.addColorStop(1, '#4a3a2a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera Follow
      const player = playerRef.current;
      const camX = Math.max(0, player.x - canvas.width / 2);
      ctx.save();
      
      // 2. Parallax (Moving relative to cam but slower)
      parallaxRef.current.forEach(p => {
         const px = p.x - (camX * p.scale);
         ctx.fillStyle = p.color;
         ctx.globalAlpha = 0.5;
         ctx.fillRect(px, p.y + (canvas.height * 0.4), 120 * p.scale, 500 * p.scale);
         ctx.globalAlpha = 1.0;
      });

      ctx.translate(-camX, 0);

      // 3. Game World (Platforms, Entities, NPC, Player)
      const npc = npcRef.current;
      ctx.fillStyle = '#7a7a7a'; // Stone color
      ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
      ctx.strokeStyle = '#3d3d3d';
      ctx.strokeRect(npc.x, npc.y, npc.width, npc.height);
      // Face
      ctx.fillStyle = '#000';
      ctx.fillRect(npc.x + 8, npc.y + 8, 4, 4);
      ctx.fillRect(npc.x + 20, npc.y + 8, 4, 4);
      ctx.fillRect(npc.x + 10, npc.y + 20, 12, 4); // Mouth

      // Speech bubble if close
      const dist = Math.abs(player.x - npc.x);
      if (dist < 100) {
         ctx.fillStyle = '#fff';
         ctx.font = '16px "VT323"';
         const textWidth = ctx.measureText(npc.text).width;
         ctx.fillRect(npc.x - textWidth/2 + 16, npc.y - 40, textWidth + 10, 24);
         ctx.fillStyle = '#000';
         ctx.fillText(npc.text, npc.x - textWidth/2 + 21, npc.y - 23);
      }

      // Draw Platforms
      platformsRef.current.forEach(plat => {
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        // Mossy top
        ctx.fillStyle = '#4a5d23';
        ctx.fillRect(plat.x, plat.y, plat.width, 4);

        // Brick patterns (minimalist)
        ctx.strokeStyle = '#2a1e17';
        ctx.lineWidth = 1;
        for (let x = plat.x; x < plat.x + plat.width; x += 16) {
           ctx.strokeRect(x, plat.y, 16, plat.height);
        }
      });

      // Draw Entities
      entitiesRef.current.forEach(entity => {
        if (entity.collected) return;
        if (entity.type === 'coin') {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(entity.x + 10, entity.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#b8860b';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (entity.type === 'gem') {
          ctx.fillStyle = '#40e0d0';
          ctx.beginPath();
          ctx.moveTo(entity.x + 15, entity.y);
          ctx.lineTo(entity.x + 30, entity.y + 15);
          ctx.lineTo(entity.x + 15, entity.y + 30);
          ctx.lineTo(entity.x, entity.y + 15);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (entity.type === 'beacon') {
           // Draw large crystal
           const gradient = ctx.createLinearGradient(entity.x, entity.y, entity.x + 40, entity.y + 60);
           gradient.addColorStop(0, '#ff00ff');
           gradient.addColorStop(0.5, '#00ffff');
           gradient.addColorStop(1, '#ffffff');
           ctx.fillStyle = gradient;
           ctx.beginPath();
           ctx.moveTo(entity.x + 20, entity.y);
           ctx.lineTo(entity.x + 40, entity.y + 30);
           ctx.lineTo(entity.x + 20, entity.y + 60);
           ctx.lineTo(entity.x, entity.y + 30);
           ctx.closePath();
           ctx.fill();
           
           // Glow effect
           ctx.shadowBlur = 20;
           ctx.shadowColor = '#00ffff';
           ctx.stroke();
           ctx.shadowBlur = 0;
        }
      });

      // Draw Player
      ctx.fillStyle = '#8b4513'; // Trousers
      ctx.fillRect(player.x, player.y + 24, 24, 24);
      ctx.fillStyle = '#f5f5dc'; // Shirt
      ctx.fillRect(player.x, player.y + 8, 24, 16);
      ctx.fillStyle = '#d2b48c'; // Face
      ctx.fillRect(player.x + 4, player.y, 16, 16);
      ctx.fillStyle = '#4b3621'; // Beard & Hair
      ctx.fillRect(player.x + 4, player.y + 12, 16, 6); // Beard
      ctx.fillRect(player.x + 16, player.y, 10, 10); // Ponytail
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(player.x + 8, player.y + 6, 2, 2);
      ctx.fillRect(player.x + 14, player.y + 6, 2, 2);

      ctx.restore();
    };

    update();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationGroupId);
    };
  }, [keys]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      <HUD state={gameState} />
      <Objective state={gameState} />
      
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}
        className="w-full h-full block pixel-corners"
      />

      {/* Intro Overlay */}
      {gameState.score === 0 && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 font-pixel">
            <div className="text-center bg-[#1a1410] p-8 border-4 border-[#d4af37] text-white">
               <h2 className="text-4xl mb-4 text-[#d4af37]">PRESS ARROWS TO START</h2>
               <p className="text-xl opacity-80">Find the Beacon of Brightness to restore hope!</p>
            </div>
         </div>
      )}
      {/* Victory Overlay */}
      {gameState.objectiveCompleted && (
         <div className="absolute inset-0 flex items-center justify-center bg-[#d4af37]/20 backdrop-blur-sm z-30 font-pixel">
            <div className="text-center bg-[#1a1410] p-12 border-8 border-[#d4af37] text-white animate-bounce-in">
               <h2 className="text-6xl mb-4 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">YOU RESTORED HOPE!</h2>
               <div className="text-4xl text-green-400 mb-8">+1000 BEARD POINTS 🧔</div>
               <p className="text-2xl opacity-80">Final Score: {gameState.score}</p>
               <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-4 bg-[#d4af37] text-[#1a1410] text-3xl hover:bg-[#fff] transition-colors cursor-pointer"
               >
                 PLAY AGAIN
               </button>
            </div>
         </div>
      )}
    </div>
  );
}

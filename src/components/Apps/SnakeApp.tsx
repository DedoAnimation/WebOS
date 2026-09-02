import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Gamepad2 } from 'lucide-react';

export const SnakeApp: React.FC = () => {
  const [snake, setSnake] = useState<Array<{ x: number; y: number }>>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('winweb_snake_high') || 0);
  });
  const [gameOver, setGameOver] = useState<boolean>(false);

  const dirRef = useRef(direction);
  dirRef.current = direction;

  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  };

  const startGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    setDirection('UP');
    setFood(generateFood());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };

        switch (dirRef.current) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check Wall Collision
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check Food
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setScore(s => {
            const next = s + 10;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem('winweb_snake_high', String(next));
            }
            return next;
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, food, highScore]);

  // Handle arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && dirRef.current !== 'DOWN') setDirection('UP');
      else if (['ArrowDown', 'KeyS'].includes(e.code) && dirRef.current !== 'UP') setDirection('DOWN');
      else if (['ArrowLeft', 'KeyA'].includes(e.code) && dirRef.current !== 'RIGHT') setDirection('LEFT');
      else if (['ArrowRight', 'KeyD'].includes(e.code) && dirRef.current !== 'LEFT') setDirection('RIGHT');
      else if (e.code === 'Space' && !isPlaying) startGame();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-4 text-zinc-100 select-none">
      {/* Score Header */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-3 py-2 bg-zinc-900 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-1.5">
          <Gamepad2 size={16} className="text-emerald-400" />
          <span className="font-semibold text-zinc-300">Score:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm">{score}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-400" />
          <span className="text-zinc-400">High:</span>
          <span className="font-mono text-amber-400 font-bold">{highScore}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-[300px] h-[300px] bg-black border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl">
        {/* Snake & Food */}
        {Array.from({ length: 20 }).map((_, y) =>
          Array.from({ length: 20 }).map((_, x) => {
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isBody = snake.some((seg, idx) => idx > 0 && seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: `${x * 15}px`,
                  top: `${y * 15}px`,
                  width: '14px',
                  height: '14px',
                }}
                className={`rounded-xs ${
                  isHead
                    ? 'bg-emerald-400 ring-1 ring-white'
                    : isBody
                    ? 'bg-emerald-600'
                    : isFood
                    ? 'bg-red-500 rounded-full animate-pulse'
                    : ''
                }`}
              />
            );
          })
        )}

        {/* Overlay when game over / not playing */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
            <h3 className="text-base font-bold text-white mb-1">
              {gameOver ? 'Game Over!' : 'Retro Arcade Snake'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Use Arrow keys or WASD to control the snake.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/30"
            >
              {gameOver ? <RotateCcw size={14} /> : <Play size={14} />}
              <span>{gameOver ? 'Play Again' : 'Start Game (Space)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

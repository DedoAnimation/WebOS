import React, { useState, useEffect } from 'react';
import { Flag, Bomb, Smile, Frown, Award, RotateCcw } from 'lucide-react';

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export const MinesweeperApp: React.FC = () => {
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [totalMines, setTotalMines] = useState(10);

  const [grid, setGrid] = useState<CellState[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(10);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize Board
  const initBoard = (r = rows, c = cols, mines = totalMines) => {
    let newGrid: CellState[][] = Array(r)
      .fill(null)
      .map(() =>
        Array(c).fill(null).map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }))
      );

    // Place mines randomly
    let placed = 0;
    while (placed < mines) {
      const randR = Math.floor(Math.random() * r);
      const randC = Math.floor(Math.random() * c);
      if (!newGrid[randR][randC].isMine) {
        newGrid[randR][randC].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor counts
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        if (!newGrid[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < r && nj >= 0 && nj < c && newGrid[ni][nj].isMine) {
                count++;
              }
            }
          }
          newGrid[i][j].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setFlagsLeft(mines);
    setTimer(0);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    initBoard();
  }, [rows, cols, totalMines]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning && !gameOver && !gameWon) {
      interval = window.setInterval(() => setTimer(t => Math.min(999, t + 1)), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameOver, gameWon]);

  // Reveal Flood Fill
  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    if (!isTimerRunning) setIsTimerRunning(true);

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    if (newGrid[r][c].isMine) {
      // Game Over! Reveal all mines
      newGrid.forEach(row =>
        row.forEach(cell => {
          if (cell.isMine) cell.isRevealed = true;
        })
      );
      setGrid(newGrid);
      setGameOver(true);
      setIsTimerRunning(false);
      return;
    }

    const flood = (cr: number, cc: number) => {
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) return;
      if (newGrid[cr][cc].isRevealed || newGrid[cr][cc].isFlagged || newGrid[cr][cc].isMine) return;

      newGrid[cr][cc].isRevealed = true;

      if (newGrid[cr][cc].neighborMines === 0) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            flood(cr + di, cc + dj);
          }
        }
      }
    };

    flood(r, c);
    setGrid(newGrid);

    // Check Win Condition
    let unrevealedSafe = 0;
    newGrid.forEach(row =>
      row.forEach(cell => {
        if (!cell.isMine && !cell.isRevealed) unrevealedSafe++;
      })
    );

    if (unrevealedSafe === 0) {
      setGameWon(true);
      setIsTimerRunning(false);
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[r][c].isRevealed) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const current = newGrid[r][c];

    if (!current.isFlagged && flagsLeft > 0) {
      current.isFlagged = true;
      setFlagsLeft(flagsLeft - 1);
    } else if (current.isFlagged) {
      current.isFlagged = false;
      setFlagsLeft(flagsLeft + 1);
    }

    setGrid(newGrid);
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '',
      'text-blue-400 font-bold',
      'text-emerald-400 font-bold',
      'text-red-400 font-bold',
      'text-indigo-400 font-bold',
      'text-amber-500 font-bold',
      'text-cyan-400 font-bold',
      'text-purple-400 font-bold',
      'text-pink-400 font-bold',
    ];
    return colors[num] || 'text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-4 select-none">
      {/* Game Difficulty Bar */}
      <div className="flex gap-2 mb-3 text-xs">
        <button
          onClick={() => { setRows(9); setCols(9); setTotalMines(10); }}
          className={`px-2.5 py-1 rounded-md transition-colors ${rows === 9 ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Beginner (9x9)
        </button>
        <button
          onClick={() => { setRows(12); setCols(12); setTotalMines(20); }}
          className={`px-2.5 py-1 rounded-md transition-colors ${rows === 12 ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Intermediate (12x12)
        </button>
      </div>

      {/* Classic LED Header */}
      <div className="bg-zinc-900 border-2 border-white/10 rounded-xl p-3 mb-3 flex items-center justify-between w-full max-w-[340px]">
        {/* Mines Remaining Digital Counter */}
        <div className="bg-black px-2.5 py-1 rounded border border-red-900 font-mono text-red-500 text-lg font-bold tracking-widest">
          {String(Math.max(0, flagsLeft)).padStart(3, '0')}
        </div>

        {/* Smiley Reset Button */}
        <button
          onClick={() => initBoard()}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 border border-white/20 rounded-xl flex items-center justify-center text-amber-400 shadow-md active:scale-95 transition-transform"
        >
          {gameOver ? <Frown size={24} className="text-red-400" /> : gameWon ? <Award size={24} className="text-yellow-400 animate-bounce" /> : <Smile size={24} />}
        </button>

        {/* Timer Digital Counter */}
        <div className="bg-black px-2.5 py-1 rounded border border-red-900 font-mono text-red-500 text-lg font-bold tracking-widest">
          {String(timer).padStart(3, '0')}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="bg-zinc-900 p-2.5 rounded-xl border border-white/10 shadow-2xl overflow-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={e => toggleFlag(e, r, c)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-mono transition-colors ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800/90 text-zinc-100 border border-white/5'
                    : 'bg-zinc-700 hover:bg-zinc-600 border-t border-l border-white/20 border-b-2 border-r-2 border-black/40 shadow'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag size={13} className="text-red-400 fill-red-400" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

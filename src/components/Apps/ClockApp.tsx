import React, { useState, useEffect } from 'react';
import { Clock, Timer, Hourglass, Play, Pause, RotateCcw, Flag } from 'lucide-react';

export const ClockApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clock' | 'stopwatch' | 'timer'>('clock');
  const [time, setTime] = useState<Date>(new Date());

  // Stopwatch state
  const [swTime, setSwTime] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerDuration, setTimerDuration] = useState<number>(300); // 5 mins
  const [timerRemaining, setTimerRemaining] = useState<number>(300);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: number;
    if (swRunning) {
      interval = window.setInterval(() => setSwTime(t => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: number;
    if (timerRunning && timerRemaining > 0) {
      interval = window.setInterval(() => setTimerRemaining(t => t - 1), 1000);
    } else if (timerRemaining === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${centi < 10 ? '0' : ''}${centi}`;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Tab Header */}
      <div className="flex gap-2 p-2 bg-zinc-900 border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('clock')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'clock' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock size={14} />
          <span>World Clock</span>
        </button>
        <button
          onClick={() => setActiveTab('stopwatch')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'stopwatch' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Timer size={14} />
          <span>Stopwatch</span>
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'timer' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Hourglass size={14} />
          <span>Timer</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {activeTab === 'clock' && (
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold font-mono text-white tracking-tight">
              {time.toLocaleTimeString()}
            </div>
            <div className="text-sm text-zinc-400 font-medium">
              {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mt-6 text-left">
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="text-xs text-zinc-400">London (GMT)</div>
                <div className="text-base font-mono text-sky-400">
                  {new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })}
                </div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="text-xs text-zinc-400">Tokyo (JST)</div>
                <div className="text-base font-mono text-sky-400">
                  {new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stopwatch' && (
          <div className="flex flex-col items-center max-w-sm w-full">
            <div className="text-5xl font-mono font-bold text-white mb-6 tracking-wider">
              {formatStopwatch(swTime)}
            </div>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSwRunning(!swRunning)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  swRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                {swRunning ? <Pause size={15} /> : <Play size={15} />}
                <span>{swRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={() => setLaps([swTime, ...laps])}
                disabled={!swRunning}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl"
              >
                <Flag size={14} />
                <span>Lap</span>
              </button>
              <button
                onClick={() => { setSwRunning(false); setSwTime(0); setLaps([]); }}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Laps List */}
            {laps.length > 0 && (
              <div className="w-full max-h-36 overflow-y-auto space-y-1 bg-zinc-900/60 p-2 rounded-xl border border-white/5 text-xs font-mono">
                {laps.map((lap, i) => (
                  <div key={i} className="flex justify-between py-1 px-2 border-b border-white/5">
                    <span className="text-zinc-500">Lap {laps.length - i}</span>
                    <span className="text-zinc-200">{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="flex flex-col items-center">
            <div className="text-6xl font-mono font-bold text-white mb-6 tracking-wider">
              {formatTimer(timerRemaining)}
            </div>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  timerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
              </button>
              <button
                onClick={() => { setTimerRunning(false); setTimerRemaining(timerDuration); }}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="flex gap-2 text-xs">
              {[60, 180, 300, 600].map(s => (
                <button
                  key={s}
                  onClick={() => { setTimerDuration(s); setTimerRemaining(s); setTimerRunning(false); }}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-white/5"
                >
                  {s / 60}m
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

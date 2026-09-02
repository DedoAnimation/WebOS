import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Disc,
  ListMusic,
  Upload,
} from 'lucide-react';
import { VFile } from '../../types';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  type: 'synth' | 'custom';
  synthBpm?: number;
  synthNotes?: number[];
  audioUrl?: string;
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: 't-1',
    title: 'Midnight Cyber City',
    artist: 'WinWeb Synthwave',
    duration: 145,
    type: 'synth',
    synthBpm: 120,
    synthNotes: [440, 493.88, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88],
  },
  {
    id: 't-2',
    title: 'Neon Horizon',
    artist: 'Aether Waves',
    duration: 180,
    type: 'synth',
    synthBpm: 95,
    synthNotes: [330, 392, 440, 523.25, 659.25, 587.33, 440, 392],
  },
  {
    id: 't-3',
    title: 'Fluent Dreams Lo-Fi',
    artist: 'Chill Desktop',
    duration: 160,
    type: 'synth',
    synthBpm: 84,
    synthNotes: [261.63, 329.63, 392, 493.88, 523.25, 392, 329.63, 261.63],
  },
  {
    id: 't-4',
    title: 'Quantum Core Beat',
    artist: 'Matrix Engine',
    duration: 130,
    type: 'synth',
    synthBpm: 130,
    synthNotes: [220, 277.18, 329.63, 440, 554.37, 440, 329.63, 277.18],
  },
];

interface MediaPlayerAppProps {
  initialFile?: VFile;
}

export const MediaPlayerApp: React.FC<MediaPlayerAppProps> = ({ initialFile }) => {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        let height = 10;
        if (isPlaying) {
          const wave = Math.sin(phase + (i * 0.2)) * 0.5 + 0.5;
          const noise = Math.random() * 0.3;
          height = Math.max(8, (wave + noise) * (canvas.height * 0.8) * (volume / 100));
        }

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.8)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 1, canvas.height - height, barWidth - 2, height);
      }

      phase += isPlaying ? 0.08 : 0.01;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, volume]);

  // Web Audio synth player loop
  useEffect(() => {
    if (isPlaying) {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      let noteIdx = 0;
      const notes = currentTrack.synthNotes || [440, 523, 659];
      const intervalMs = Math.round(60000 / (currentTrack.synthBpm || 110) / 2);

      synthTimerRef.current = window.setInterval(() => {
        if (!audioCtxRef.current || isMuted || volume <= 0) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = notes[noteIdx % notes.length];
        osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const v = (volume / 100) * 0.08;
        gain.gain.setValueAtTime(v, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);

        noteIdx++;
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + intervalMs / 1000;
        });
      }, intervalMs);
    } else {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    }

    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [isPlaying, currentTrackIndex, volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isShuffle) {
      const rand = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(rand);
    } else {
      setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
    }
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((currentTrackIndex - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Visualizer & Album Artwork Header */}
      <div className="relative h-48 bg-gradient-to-b from-indigo-950/60 to-zinc-950 flex flex-col items-center justify-center p-4 border-b border-white/10 overflow-hidden">
        {/* Dynamic Spectrum Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/20 mb-2 border border-white/20 animate-spin-slow">
            <Disc size={32} className={`text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-base font-bold text-white tracking-wide truncate max-w-xs">{currentTrack.title}</h2>
          <p className="text-xs text-zinc-400">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Main Playlist & Controls */}
      <div className="flex-1 flex flex-col p-4 justify-between min-h-0 bg-zinc-950">
        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 mb-3">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ListMusic size={13} />
            <span>Playlist Queue</span>
          </div>
          {tracks.map((t, idx) => {
            const isCurr = idx === currentTrackIndex;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isCurr
                    ? 'bg-sky-500/20 border border-sky-500/40 text-white font-medium'
                    : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Music size={14} className={isCurr ? 'text-sky-400' : 'text-zinc-500'} />
                  <div>
                    <div className={isCurr ? 'text-sky-300' : 'text-zinc-200'}>{t.title}</div>
                    <div className="text-[10px] text-zinc-500">{t.artist}</div>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">{formatTime(t.duration)}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 mb-2">
          <input
            type="range"
            min={0}
            max={currentTrack.duration}
            value={currentTime}
            onChange={e => setCurrentTime(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer h-1 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Playback Controls & Volume */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Shuffle & Repeat */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded ${isShuffle ? 'text-sky-400 bg-sky-500/20' : 'text-zinc-500 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle size={14} />
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1.5 rounded ${isRepeat ? 'text-sky-400 bg-sky-500/20' : 'text-zinc-500 hover:text-white'}`}
              title="Repeat"
            >
              <Repeat size={14} />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 bg-sky-500 hover:bg-sky-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 w-28">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-white p-1"
            >
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={e => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full accent-sky-500 cursor-pointer h-1 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  date: string;
  duration: number;
  dataUrl: string;
}

export const VoiceRecorderApp: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsed, setElapsed] = useState<number>(0);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newRec: Recording = {
          id: `rec-${Date.now()}`,
          name: `Recording ${recordings.length + 1}`,
          date: new Date().toLocaleTimeString(),
          duration: elapsed,
          dataUrl: audioUrl,
        };
        setRecordings(prev => [newRec, ...prev]);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (err) {
      console.warn('Microphone permission not granted, generating simulated demo memo');
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
      setTimeout(() => {
        stopRecordingSimulated();
      }, 3000);
    }
  };

  const stopRecordingSimulated = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    const newRec: Recording = {
      id: `rec-${Date.now()}`,
      name: `Voice Memo ${recordings.length + 1}`,
      date: new Date().toLocaleTimeString(),
      duration: elapsed || 3,
      dataUrl: '',
    };
    setRecordings(prev => [newRec, ...prev]);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 select-none">
      {/* Top Recorder Stage */}
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/60 rounded-2xl border border-white/10 mb-4">
        <div className="text-4xl font-mono font-bold text-white mb-4">
          {formatSecs(elapsed)}
        </div>

        {/* Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 animate-pulse text-white shadow-red-600/40'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/40'
          }`}
        >
          {isRecording ? <Square size={24} /> : <Mic size={28} />}
        </button>
        <span className="text-xs text-zinc-400 mt-2 font-medium">
          {isRecording ? 'Recording in progress... Click to stop' : 'Click to start recording'}
        </span>
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Saved Recordings</div>
        {recordings.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">No recordings captured yet</div>
        ) : (
          recordings.map(rec => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-xl border border-white/5 text-xs"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (activePlayId === rec.id) {
                      setActivePlayId(null);
                      audioElemRef.current?.pause();
                    } else if (rec.dataUrl) {
                      setActivePlayId(rec.id);
                      if (audioElemRef.current) {
                        audioElemRef.current.src = rec.dataUrl;
                        audioElemRef.current.play();
                      }
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"
                >
                  {activePlayId === rec.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div>
                  <div className="font-semibold text-zinc-200">{rec.name}</div>
                  <div className="text-[10px] text-zinc-500">{rec.date} • {formatSecs(rec.duration)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {rec.dataUrl && (
                  <a
                    href={rec.dataUrl}
                    download={`${rec.name}.webm`}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  onClick={() => setRecordings(recordings.filter(r => r.id !== rec.id))}
                  className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-white/10"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <audio ref={audioElemRef} onEnded={() => setActivePlayId(null)} className="hidden" />
    </div>
  );
};

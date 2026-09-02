import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, HardDrive, Network, XSquare, CheckCircle, RefreshCw } from 'lucide-react';
import { WindowState, ProcessMetric, AppId } from '../../types';
import { AppIcon } from '../Common/AppIcon';

interface TaskManagerAppProps {
  windows: WindowState[];
  onCloseWindow: (id: string) => void;
}

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
  windows,
  onCloseWindow,
}) => {
  const [activeTab, setActiveTab] = useState<'processes' | 'performance'>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(40).fill(15));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(40).fill(38));

  const cpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const ramCanvasRef = useRef<HTMLCanvasElement>(null);

  // Background System Services + Active Windows
  const processes = [
    ...windows.map(w => ({
      id: w.id,
      name: w.title,
      appId: w.appId,
      cpu: Math.floor(Math.random() * 8) + 1,
      memory: Math.floor(w.width * 0.12) + 45,
      disk: +(Math.random() * 0.4).toFixed(1),
      isWindow: true,
    })),
    { id: 'sys-dwm', name: 'Desktop Window Manager (dwm.exe)', appId: 'system' as AppId, cpu: 2, memory: 124, disk: 0.1, isWindow: false },
    { id: 'sys-explorer', name: 'Windows Explorer Shell', appId: 'explorer' as AppId, cpu: 1, memory: 86, disk: 0.0, isWindow: false },
    { id: 'sys-audio', name: 'Windows Audio Core Isolation', appId: 'system' as AppId, cpu: 1, memory: 34, disk: 0.0, isWindow: false },
    { id: 'sys-copilot', name: 'Copilot AI Subsystem Worker', appId: 'copilot' as AppId, cpu: 3, memory: 210, disk: 0.2, isWindow: false },
  ];

  // Draw real-time performance line chart
  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 25) + 12;
      const newRam = Math.floor(Math.random() * 6) + 38;

      setCpuHistory(prev => [...prev.slice(1), newCpu]);
      setRamHistory(prev => [...prev.slice(1), newRam]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const drawChart = (canvas: HTMLCanvasElement | null, data: number[], strokeColor: string, fillColor: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Line & Area
    ctx.beginPath();
    const step = canvas.width / (data.length - 1);
    data.forEach((val, idx) => {
      const x = idx * step;
      const y = canvas.height - (val / 100) * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = fillColor;
    ctx.fill();
  };

  useEffect(() => {
    if (activeTab === 'performance') {
      drawChart(cpuCanvasRef.current, cpuHistory, '#0284c7', 'rgba(2, 132, 199, 0.15)');
      drawChart(ramCanvasRef.current, ramHistory, '#a855f7', 'rgba(168, 85, 247, 0.15)');
    }
  }, [activeTab, cpuHistory, ramHistory]);

  const handleEndTask = () => {
    if (!selectedProcessId) return;
    const target = processes.find(p => p.id === selectedProcessId);
    if (target && target.isWindow) {
      onCloseWindow(target.id);
      setSelectedProcessId(null);
    }
  };

  const currentCpu = cpuHistory[cpuHistory.length - 1] || 15;
  const currentRam = ramHistory[ramHistory.length - 1] || 38;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-white/10 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('processes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'processes' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity size={14} />
            <span>Processes ({processes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'performance' ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu size={14} />
            <span>Performance</span>
          </button>
        </div>

        {activeTab === 'processes' && selectedProcessId && (
          <button
            onClick={handleEndTask}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded-md text-xs font-medium transition-colors"
          >
            <XSquare size={13} />
            <span>End Task</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'processes' ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 text-[11px]">
                <th className="py-2 px-3 font-medium">Name</th>
                <th className="py-2 px-3 font-medium text-right">CPU</th>
                <th className="py-2 px-3 font-medium text-right">Memory</th>
                <th className="py-2 px-3 font-medium text-right">Disk</th>
                <th className="py-2 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => {
                const isSelected = selectedProcessId === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProcessId(p.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-500/20 text-white font-medium' : 'hover:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <td className="py-2 px-3 flex items-center gap-2.5">
                      <AppIcon iconName="Activity" size={15} />
                      <span className="truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-400">{p.cpu}%</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-400">{p.memory} MB</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-400">{p.disk} MB/s</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Running
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Performance Charts Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CPU Chart Card */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-zinc-400">CPU Usage</div>
                  <div className="text-xl font-bold font-mono text-sky-400">{currentCpu}%</div>
                </div>
                <div className="text-right text-[11px] text-zinc-500">
                  <div>Virtual Intel Core i9-14900K</div>
                  <div>Base Speed: 5.80 GHz</div>
                </div>
              </div>
              <canvas
                ref={cpuCanvasRef}
                width={380}
                height={140}
                className="w-full h-32 bg-zinc-950 rounded-lg border border-white/5"
              />
              <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1">
                <div>Utilization: <span className="text-white font-mono">{currentCpu}%</span></div>
                <div>Processes: <span className="text-white font-mono">{processes.length}</span></div>
                <div>Threads: <span className="text-white font-mono">1,842</span></div>
              </div>
            </div>

            {/* Memory Chart Card */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-zinc-400">Memory (RAM)</div>
                  <div className="text-xl font-bold font-mono text-purple-400">{(32 * (currentRam / 100)).toFixed(1)} / 32.0 GB ({currentRam}%)</div>
                </div>
                <div className="text-right text-[11px] text-zinc-500">
                  <div>Speed: 6400 MHz</div>
                  <div>Slots: 2 of 4</div>
                </div>
              </div>
              <canvas
                ref={ramCanvasRef}
                width={380}
                height={140}
                className="w-full h-32 bg-zinc-950 rounded-lg border border-white/5"
              />
              <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1">
                <div>In Use: <span className="text-white font-mono">{(32 * (currentRam / 100)).toFixed(1)} GB</span></div>
                <div>Available: <span className="text-white font-mono">{(32 * (1 - currentRam / 100)).toFixed(1)} GB</span></div>
                <div>Committed: <span className="text-white font-mono">14.2 GB</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="h-6 px-3 border-t border-white/10 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span>Processes: {processes.length}</span>
        <span>CPU: {currentCpu}% | Memory: {currentRam}%</span>
      </div>
    </div>
  );
};

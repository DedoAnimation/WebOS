import React, { useState, useRef, useEffect } from 'react';
import {
  Pencil,
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Slash,
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  Download,
  Pipette,
  Check,
} from 'lucide-react';
import { VFile } from '../../types';

interface PaintAppProps {
  files?: VFile[];
  onUpdateFiles?: (files: VFile[]) => void;
  initialFile?: VFile;
}

type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'fill';

const COLOR_SWATCHES = [
  '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
  '#880015', '#b97a57', '#ed1c24', '#ffaec9',
  '#ff7f27', '#ffc90e', '#fff200', '#efe4b0',
  '#22b14c', '#b5e61d', '#00a2e8', '#99d9ea',
  '#3f48cc', '#7092be', '#a349a4', '#c8bfe7',
];

export const PaintApp: React.FC<PaintAppProps> = ({
  files,
  onUpdateFiles,
  initialFile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState<string>('#00a2e8');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If initial image provided
    if (initialFile?.dataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
      img.src = initialFile.dataUrl;
    } else {
      saveState();
    }
  }, [initialFile]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const targetState = history[historyIndex - 1];
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const targetState = history[historyIndex + 1];
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    startPosRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = color;

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'fill') {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineWidth = tool === 'pencil' ? 2 : strokeWidth;
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      // Restore previous state for live preview
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();

      if (tool === 'line') {
        ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        const w = coords.x - startPosRef.current.x;
        const h = coords.y - startPosRef.current.y;
        ctx.strokeRect(startPosRef.current.x, startPosRef.current.y, w, h);
      } else if (tool === 'circle') {
        const rx = Math.abs(coords.x - startPosRef.current.x) / 2;
        const ry = Math.abs(coords.y - startPosRef.current.y) / 2;
        const cx = Math.min(startPosRef.current.x, coords.x) + rx;
        const cy = Math.min(startPosRef.current.y, coords.y) + ry;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSaveToPictures = () => {
    const canvas = canvasRef.current;
    if (!canvas || !files || !onUpdateFiles) return;

    const dataUrl = canvas.toDataURL('image/png');
    const newFile: VFile = {
      id: `paint-${Date.now()}`,
      name: `Drawing-${Date.now().toString().slice(-4)}.png`,
      path: `C:/Users/User/Pictures/Drawing-${Date.now().toString().slice(-4)}.png`,
      type: 'file',
      extension: 'png',
      dataUrl,
      size: Math.round(dataUrl.length * 0.75),
      updatedAt: new Date().toLocaleDateString(),
    };

    onUpdateFiles([...files, newFile]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'winweb-drawing.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 select-none">
      {/* Paint Ribbon Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-white/10 gap-2 text-xs">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setTool('brush')}
            className={`p-1.5 rounded ${tool === 'brush' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Brush"
          >
            <Paintbrush size={15} />
          </button>
          <button
            onClick={() => setTool('pencil')}
            className={`p-1.5 rounded ${tool === 'pencil' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Pencil"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Eraser"
          >
            <Eraser size={15} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-1.5 rounded ${tool === 'line' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Line"
          >
            <Slash size={15} />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-1.5 rounded ${tool === 'rect' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Rectangle"
          >
            <Square size={15} />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-1.5 rounded ${tool === 'circle' ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Ellipse / Circle"
          >
            <Circle size={15} />
          </button>
        </div>

        {/* Stroke Size Slider */}
        <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-[11px] text-zinc-400">Size:</span>
          <input
            type="range"
            min={1}
            max={36}
            value={strokeWidth}
            onChange={e => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-sky-500 cursor-pointer"
          />
          <span className="font-mono text-[11px] w-5 text-right">{strokeWidth}px</span>
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1.5 rounded-lg border border-white/10">
          <div className="grid grid-cols-10 gap-1">
            {COLOR_SWATCHES.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-sm border ${
                  color === c ? 'border-sky-400 ring-2 ring-sky-400/50 scale-110' : 'border-zinc-700 hover:scale-105'
                } transition-transform`}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
            title="Custom Color"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Redo"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
            title="Clear Canvas"
          >
            <Trash2 size={15} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={handleSaveToPictures}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
            title="Save to Virtual Pictures Folder"
          >
            {saveSuccess ? <Check size={13} className="text-white" /> : <Save size={13} />}
            <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Export PNG to PC"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-auto bg-zinc-900/60 p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white rounded shadow-2xl cursor-crosshair max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

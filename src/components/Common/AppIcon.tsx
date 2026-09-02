import React from 'react';
import {
  Folder,
  Globe,
  FileText,
  Terminal,
  Palette,
  Calculator,
  PlaySquare,
  Image as ImageIcon,
  Activity,
  Settings,
  Bomb,
  Gamepad2,
  Clock,
  Mic,
  Sparkles,
  HardDrive,
  Trash2,
  Download,
  Music,
  Monitor,
  Search,
  Grid,
  FileCode,
  File,
  AppWindow,
  Play,
} from 'lucide-react';

interface AppIconProps {
  iconName?: string;
  className?: string;
  size?: number;
  extension?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  iconName,
  className = '',
  size = 24,
  extension,
}) => {
  // If extension is specified and matches certain types
  if (extension) {
    const ext = extension.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      return (
        <div className={`flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ${className}`}>
          <ImageIcon size={size} />
        </div>
      );
    }
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
      return (
        <div className={`flex items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 ${className}`}>
          <Music size={size} />
        </div>
      );
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'cpp'].includes(ext)) {
      return (
        <div className={`flex items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ${className}`}>
          <FileCode size={size} />
        </div>
      );
    }
    if (['txt', 'md', 'doc', 'docx', 'pdf', 'csv'].includes(ext)) {
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ${className}`}>
          <FileText size={size} />
        </div>
      );
    }
  }

  // Check iconName
  switch (iconName) {
    case 'Folder':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 ${className}`}>
          <Folder size={size} className="fill-amber-400/50" />
        </div>
      );
    case 'Globe':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ${className}`}>
          <Globe size={size} />
        </div>
      );
    case 'FileText':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ${className}`}>
          <FileText size={size} />
        </div>
      );
    case 'Terminal':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700/50 ${className}`}>
          <Terminal size={size} />
        </div>
      );
    case 'Palette':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 ${className}`}>
          <Palette size={size} />
        </div>
      );
    case 'Calculator':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 ${className}`}>
          <Calculator size={size} />
        </div>
      );
    case 'PlaySquare':
    case 'Music':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 ${className}`}>
          <PlaySquare size={size} />
        </div>
      );
    case 'Image':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ${className}`}>
          <ImageIcon size={size} />
        </div>
      );
    case 'Activity':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 ${className}`}>
          <Activity size={size} />
        </div>
      );
    case 'Settings':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-slate-500/20 text-slate-300 ${className}`}>
          <Settings size={size} />
        </div>
      );
    case 'Bomb':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 ${className}`}>
          <Bomb size={size} />
        </div>
      );
    case 'Gamepad2':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 ${className}`}>
          <Gamepad2 size={size} />
        </div>
      );
    case 'Clock':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 ${className}`}>
          <Clock size={size} />
        </div>
      );
    case 'Mic':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 ${className}`}>
          <Mic size={size} />
        </div>
      );
    case 'Sparkles':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500/30 to-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/30 ${className}`}>
          <Sparkles size={size} />
        </div>
      );
    case 'HardDrive':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ${className}`}>
          <HardDrive size={size} />
        </div>
      );
    case 'Trash2':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-zinc-600/20 text-zinc-400 ${className}`}>
          <Trash2 size={size} />
        </div>
      );
    case 'Download':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ${className}`}>
          <Download size={size} />
        </div>
      );
    case 'Monitor':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ${className}`}>
          <Monitor size={size} />
        </div>
      );
    case 'Search':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-slate-600/20 text-slate-300 ${className}`}>
          <Search size={size} />
        </div>
      );
    case 'Play':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ${className}`}>
          <Play size={size} />
        </div>
      );
    default:
      return (
        <div className={`flex items-center justify-center rounded-lg bg-zinc-700/40 text-zinc-300 ${className}`}>
          <File size={size} />
        </div>
      );
  }
};

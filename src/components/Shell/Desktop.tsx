import React, { useState, useRef, useEffect } from 'react';
import {
  FolderPlus,
  FileText,
  Terminal,
  Palette,
  RefreshCw,
  Sparkles,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { AppId, VFile, SystemSettings } from '../../types';
import { AppIcon } from '../Common/AppIcon';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

interface DesktopProps {
  files: VFile[];
  onUpdateFiles: (files: VFile[]) => void;
  onOpenApp: (appId: AppId, initialFile?: VFile) => void;
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => void;
}

export const Desktop: React.FC<DesktopProps> = ({
  files,
  onUpdateFiles,
  onOpenApp,
  settings,
  onUpdateSettings,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);

  // Desktop shortcuts from VFS root/desktop
  const desktopFiles = files.filter(f => f.path.startsWith('C:/Users/User/Desktop/'));

  // Pre-configured primary desktop apps
  const desktopAppShortcuts: Array<{ id: string; name: string; appId: AppId; icon: string }> = [
    { id: 'sc-this-pc', name: 'This PC', appId: 'explorer', icon: 'HardDrive' },
    { id: 'sc-recycle-bin', name: 'Recycle Bin', appId: 'explorer', icon: 'Trash2' },
    { id: 'sc-copilot', name: 'Copilot AI', appId: 'copilot', icon: 'Sparkles' },
    { id: 'sc-browser', name: 'Edge Browser', appId: 'browser', icon: 'Globe' },
    { id: 'sc-terminal', name: 'PowerShell', appId: 'terminal', icon: 'Terminal' },
    { id: 'sc-paint', name: 'Paint Studio', appId: 'paint', icon: 'Paintbrush' },
    { id: 'sc-minesweeper', name: 'Minesweeper', appId: 'minesweeper', icon: 'Bomb' },
    { id: 'sc-snake', name: 'Retro Snake', appId: 'snake', icon: 'Gamepad2' },
  ];

  // Dynamic canvas wallpaper animation if selected
  useEffect(() => {
    if (settings.wallpaper !== 'dynamic-matrix') return;
    const canvas = dynamicCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        50,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8
      );
      grad.addColorStop(0, '#061727');
      grad.addColorStop(0.6, '#030a13');
      grad.addColorStop(1, '#000205');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
          const y = canvas.height * 0.5 + Math.sin(x * 0.003 + t + i * 0.5) * 80 + Math.cos(x * 0.002 - t) * 40;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      t += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [settings.wallpaper]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFileId(null);

    const items: ContextMenuItem[] = [
      {
        id: 'view',
        label: 'View',
        icon: Palette,
        onClick: () => onOpenApp('settings'),
      },
      {
        id: 'refresh',
        label: 'Refresh',
        icon: RefreshCw,
        shortcut: 'F5',
        onClick: () => {
          setSelectedFileId(null);
        },
      },
      { id: 'd1', label: '', divider: true },
      {
        id: 'new-folder',
        label: 'New folder',
        icon: FolderPlus,
        onClick: () => {
          const newFolder: VFile = {
            id: `folder-${Date.now()}`,
            name: 'New Folder',
            path: `C:/Users/User/Desktop/New Folder`,
            type: 'folder',
            size: 0,
            updatedAt: new Date().toLocaleDateString(),
          };
          onUpdateFiles([...files, newFolder]);
        },
      },
      {
        id: 'new-doc',
        label: 'New Text Document',
        icon: FileText,
        onClick: () => {
          const newDoc: VFile = {
            id: `file-${Date.now()}`,
            name: 'New Text Document.txt',
            path: `C:/Users/User/Desktop/New Text Document.txt`,
            type: 'file',
            extension: 'txt',
            content: '',
            size: 0,
            updatedAt: new Date().toLocaleDateString(),
          };
          onUpdateFiles([...files, newDoc]);
        },
      },
      { id: 'd2', label: '', divider: true },
      {
        id: 'terminal',
        label: 'Open in Terminal',
        icon: Terminal,
        onClick: () => onOpenApp('terminal'),
      },
      {
        id: 'personalize',
        label: 'Personalize',
        icon: Palette,
        onClick: () => onOpenApp('settings'),
      },
    ];

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  };

  const handleFileContextMenu = (e: React.MouseEvent, file: VFile) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedFileId(file.id);

    const items: ContextMenuItem[] = [
      {
        id: 'open',
        label: 'Open',
        icon: ExternalLink,
        onClick: () => {
          if (file.extension === 'txt' || file.extension === 'md') onOpenApp('notepad', file);
          else if (['png', 'jpg', 'jpeg'].includes(file.extension || '')) onOpenApp('photos', file);
          else onOpenApp('explorer', file);
        },
      },
      { id: 'd1', label: '', divider: true },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        danger: true,
        onClick: () => {
          onUpdateFiles(files.filter(f => f.id !== file.id));
        },
      },
    ];

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  };

  return (
    <div
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        setSelectedFileId(null);
        setContextMenu(null);
      }}
      className="absolute inset-0 select-none overflow-hidden"
    >
      {/* Wallpaper Background */}
      {settings.wallpaper === 'dynamic-matrix' ? (
        <canvas ref={dynamicCanvasRef} className="absolute inset-0 w-full h-full object-cover" />
      ) : settings.wallpaper.startsWith('radial-gradient') || settings.wallpaper.startsWith('linear-gradient') ? (
        <div
          style={{ background: settings.wallpaper }}
          className="absolute inset-0 bg-[#1e293b] transition-all duration-700"
        />
      ) : (
        <div
          style={{ backgroundImage: `url(${settings.wallpaper})` }}
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter"
        />
      )}

      {/* Night Light Warm Overlay Filter */}
      {settings.nightLight && (
        <div
          style={{
            backgroundColor: 'rgba(255, 140, 0, 0.12)',
            mixBlendMode: 'multiply',
          }}
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}

      {/* Desktop Icons Grid */}
      <div className="absolute top-4 left-4 grid grid-flow-col grid-rows-6 gap-3 z-20">
        {/* System & Pinned Shortcuts */}
        {desktopAppShortcuts.map(sc => (
          <div
            key={sc.id}
            onDoubleClick={() => onOpenApp(sc.appId)}
            className="w-20 h-24 flex flex-col items-center justify-center p-1.5 rounded-xl cursor-default text-center group transition-all"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/20 group-hover:scale-105 transition-all">
              <AppIcon iconName={sc.icon} size={28} />
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow-md text-center truncate max-w-full mt-1.5">
              {sc.name}
            </span>
          </div>
        ))}

        {/* User Desktop Files */}
        {desktopFiles.map(file => {
          const isSelected = selectedFileId === file.id;
          return (
            <div
              key={file.id}
              onClick={e => {
                e.stopPropagation();
                setSelectedFileId(file.id);
              }}
              onDoubleClick={() => {
                if (file.extension === 'txt' || file.extension === 'md') onOpenApp('notepad', file);
                else if (['png', 'jpg', 'jpeg'].includes(file.extension || '')) onOpenApp('photos', file);
                else onOpenApp('explorer', file);
              }}
              onContextMenu={e => handleFileContextMenu(e, file)}
              className="w-20 h-24 flex flex-col items-center justify-center p-1.5 rounded-xl cursor-pointer text-center group transition-all"
            >
              <div
                className={`w-14 h-14 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-500/30 border-2 border-blue-400'
                    : 'bg-white/10 border border-white/20 group-hover:bg-white/20'
                }`}
              >
                <AppIcon
                  iconName={
                    file.type === 'folder'
                      ? 'Folder'
                      : file.extension === 'txt'
                      ? 'FileText'
                      : file.extension === 'png'
                      ? 'Image'
                      : 'File'
                  }
                  size={28}
                />
              </div>
              <span className="text-white text-[11px] font-medium drop-shadow-md text-center truncate max-w-full mt-1.5">
                {file.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

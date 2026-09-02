import React, { useState, useEffect, useCallback } from 'react';
import { AppId, WindowState, VFile, SystemSettings, SnapPosition } from './types';
import { APPS } from './data/apps';
import { loadFileSystem, saveFileSystem } from './utils/fileSystem';
import { playSystemSound } from './utils/audio';

// Shell Components
import { Desktop } from './components/Shell/Desktop';
import { Taskbar } from './components/Shell/Taskbar';
import { StartMenu } from './components/Shell/StartMenu';
import { ActionCenter } from './components/Shell/ActionCenter';
import { WindowFrame } from './components/WindowManager/WindowFrame';

// Application Components
import { FileExplorerApp } from './components/Apps/FileExplorerApp';
import { NotepadApp } from './components/Apps/NotepadApp';
import { TerminalApp } from './components/Apps/TerminalApp';
import { BrowserApp } from './components/Apps/BrowserApp';
import { PaintApp } from './components/Apps/PaintApp';
import { CalculatorApp } from './components/Apps/CalculatorApp';
import { MediaPlayerApp } from './components/Apps/MediaPlayerApp';
import { PhotoGalleryApp } from './components/Apps/PhotoGalleryApp';
import { SettingsApp } from './components/Apps/SettingsApp';
import { TaskManagerApp } from './components/Apps/TaskManagerApp';
import { MinesweeperApp } from './components/Apps/MinesweeperApp';
import { SnakeApp } from './components/Apps/SnakeApp';
import { ClockApp } from './components/Apps/ClockApp';
import { VoiceRecorderApp } from './components/Apps/VoiceRecorderApp';
import { CopilotApp } from './components/Apps/CopilotApp';
import { RunDialog } from './components/Apps/RunDialog';

const DEFAULT_SETTINGS: SystemSettings = {
  wallpaper: 'radial-gradient(circle at top left, #3b82f6 0%, #1e3a8a 50%, #0f172a 100%)',
  accentColor: '#2563eb',
  theme: 'light',
  volume: 80,
  brightness: 100,
  soundEnabled: true,
  taskbarAlignment: 'center',
  nightLight: false,
  nightLightIntensity: 45,
  transparency: true,
};

export default function App() {
  const [files, setFiles] = useState<VFile[]>(() => loadFileSystem());
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('winweb_system_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState<number>(100);

  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState<boolean>(false);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState<boolean>(false);

  // Sync virtual files to LocalStorage
  const handleUpdateFiles = (newFiles: VFile[]) => {
    setFiles(newFiles);
    saveFileSystem(newFiles);
  };

  // Sync settings to LocalStorage
  const handleUpdateSettings = (partial: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('winweb_system_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Focus Window
  const handleFocusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextZ = highestZIndex + 1;
          setHighestZIndex(nextZ);
          return { ...w, zIndex: nextZ, isMinimized: false };
        }
        return w;
      })
    );
  }, [highestZIndex]);

  // Open App Window
  const handleOpenApp = useCallback((appId: AppId, initialFile?: VFile) => {
    if (settings.soundEnabled) playSystemSound('open');

    const appMeta = APPS.find(a => a.id === appId);
    const winTitle = initialFile ? `${initialFile.name} - ${appMeta?.name || 'App'}` : appMeta?.name || 'Application';

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const winW = Math.min(appMeta?.defaultWidth || 800, screenW - 40);
    const winH = Math.min(appMeta?.defaultHeight || 550, screenH - 100);

    // Cascading offset calculation
    const offset = (windows.length % 6) * 28;
    const xPos = Math.max(30, Math.min(screenW - winW - 30, (screenW - winW) / 2 + offset));
    const yPos = Math.max(20, Math.min(screenH - winH - 60, (screenH - winH) / 2 + offset));

    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);

    const newWin: WindowState = {
      id: `win-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      appId,
      title: winTitle,
      iconName: appMeta?.iconName || 'AppWindow',
      icon: appMeta?.iconName || 'AppWindow',
      x: xPos,
      y: yPos,
      width: winW,
      height: winH,
      minWidth: appMeta?.minWidth || 400,
      minHeight: appMeta?.minHeight || 300,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      snapState: 'none',
      initialFile,
    };

    setWindows(prev => [...prev, newWin]);
    setActiveWindowId(newWin.id);
  }, [windows, highestZIndex, settings.soundEnabled]);

  // Close Window
  const handleCloseWindow = useCallback((id: string) => {
    if (settings.soundEnabled) playSystemSound('close');
    setWindows(prev => {
      const remaining = prev.filter(w => w.id !== id);
      if (activeWindowId === id) {
        const nextActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        setActiveWindowId(nextActive);
      }
      return remaining;
    });
  }, [activeWindowId, settings.soundEnabled]);

  // Toggle Minimize
  const handleToggleMinimize = useCallback((id: string) => {
    if (settings.soundEnabled) playSystemSound('minimize');
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const min = !w.isMinimized;
          return { ...w, isMinimized: min };
        }
        return w;
      })
    );
  }, [settings.soundEnabled]);

  // Toggle Maximize
  const handleToggleMaximize = useCallback((id: string) => {
    if (settings.soundEnabled) playSystemSound('maximize');
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, isMaximized: !w.isMaximized, snapState: 'none' };
        }
        return w;
      })
    );
  }, [settings.soundEnabled]);

  // Snap Window
  const handleSnapWindow = useCallback((id: string, position: SnapPosition) => {
    if (settings.soundEnabled) playSystemSound('snap');
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, snapState: position, isMaximized: false };
        }
        return w;
      })
    );
  }, [settings.soundEnabled]);

  // Move Window
  const handleMoveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, x, y, snapState: 'none', isMaximized: false };
        }
        return w;
      })
    );
  }, []);

  // Resize Window
  const handleResizeWindow = useCallback((id: string, width: number, height: number, x?: number, y?: number) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return {
            ...w,
            width,
            height,
            x: x !== undefined ? x : w.x,
            y: y !== undefined ? y : w.y,
            snapState: 'none',
            isMaximized: false,
          };
        }
        return w;
      })
    );
  }, []);

  // Show Desktop
  const handleShowDesktop = () => {
    const allMinimized = windows.every(w => w.isMinimized);
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: !allMinimized })));
  };

  // Keyboard Shortcuts (Win+R / Alt+R, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.altKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRunDialogOpen(true);
      } else if (e.key === 'Escape') {
        setIsStartMenuOpen(false);
        setIsActionCenterOpen(false);
        setIsRunDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial greeting sound
  useEffect(() => {
    // Open a default welcome File Explorer or Notepad on first load
    handleOpenApp('explorer');
  }, []);

  // App Content Component Resolver
  const renderAppContent = (win: WindowState) => {
    switch (win.appId) {
      case 'explorer':
        return (
          <FileExplorerApp
            files={files}
            onUpdateFiles={handleUpdateFiles}
            onOpenFile={(file) => {
              if (file.extension === 'txt' || file.extension === 'md') {
                handleOpenApp('notepad', file);
              } else if (['png', 'jpg', 'jpeg'].includes(file.extension || '')) {
                handleOpenApp('photos', file);
              } else if (file.extension === 'mp3' || file.extension === 'wav') {
                handleOpenApp('media', file);
              }
            }}
          />
        );
      case 'notepad':
        return (
          <NotepadApp
            files={files}
            onUpdateFiles={handleUpdateFiles}
            initialFile={win.initialFile}
          />
        );
      case 'terminal':
        return (
          <TerminalApp
            files={files}
            onUpdateFiles={handleUpdateFiles}
            onOpenApp={handleOpenApp}
          />
        );
      case 'browser':
        return <BrowserApp />;
      case 'paint':
        return (
          <PaintApp
            files={files}
            onUpdateFiles={handleUpdateFiles}
            initialFile={win.initialFile}
          />
        );
      case 'calculator':
        return <CalculatorApp />;
      case 'media':
        return <MediaPlayerApp initialFile={win.initialFile} />;
      case 'photos':
        return (
          <PhotoGalleryApp
            files={files}
            initialFile={win.initialFile}
            onSetWallpaper={(url) => handleUpdateSettings({ wallpaper: url })}
          />
        );
      case 'settings':
        return (
          <SettingsApp
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'taskmanager':
        return (
          <TaskManagerApp
            windows={windows}
            onCloseWindow={handleCloseWindow}
          />
        );
      case 'minesweeper':
        return <MinesweeperApp />;
      case 'snake':
        return <SnakeApp />;
      case 'clock':
        return <ClockApp />;
      case 'recorder':
        return <VoiceRecorderApp />;
      case 'copilot':
        return (
          <CopilotApp
            onOpenApp={handleOpenApp}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default:
        return (
          <div className="p-6 text-zinc-400 text-xs">
            Application ({win.appId}) is running.
          </div>
        );
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {/* Desktop Canvas & Icons */}
      <Desktop
        files={files}
        onUpdateFiles={handleUpdateFiles}
        onOpenApp={handleOpenApp}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Windows Manager Layer */}
      <div className="absolute inset-0 pb-12 pointer-events-none z-30 overflow-hidden">
        {windows.map(win => (
          <div key={win.id} className="pointer-events-auto">
            <WindowFrame
              window={win}
              isActive={win.id === activeWindowId}
              onFocus={() => handleFocusWindow(win.id)}
              onClose={() => handleCloseWindow(win.id)}
              onMinimize={() => handleToggleMinimize(win.id)}
              onMaximize={() => handleToggleMaximize(win.id)}
              onSnap={(pos) => handleSnapWindow(win.id, pos)}
              onMove={(x, y) => handleMoveWindow(win.id, x, y)}
              onResize={(w, h, x, y) => handleResizeWindow(win.id, w, h, x, y)}
            >
              {renderAppContent(win)}
            </WindowFrame>
          </div>
        ))}
      </div>

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenApp={handleOpenApp}
        recentFiles={files.filter(f => f.type === 'file')}
      />

      {/* Action Center / Quick Settings */}
      <ActionCenter
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Run Dialog (Win+R) */}
      {isRunDialogOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-[420px] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="bg-zinc-800 px-4 py-2 text-xs font-semibold text-white border-b border-white/10 flex justify-between items-center">
              <span>Run</span>
              <button
                onClick={() => setIsRunDialogOpen(false)}
                className="text-zinc-400 hover:text-white px-1"
              >
                ✕
              </button>
            </div>
            <RunDialog
              onOpenApp={handleOpenApp}
              onClose={() => setIsRunDialogOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Taskbar Shell */}
      <div className="absolute inset-x-0 bottom-0 z-40">
        <Taskbar
          windows={windows}
          activeWindowId={activeWindowId}
          settings={settings}
          isStartMenuOpen={isStartMenuOpen}
          isActionCenterOpen={isActionCenterOpen}
          onToggleStartMenu={() => {
            setIsStartMenuOpen(!isStartMenuOpen);
            setIsActionCenterOpen(false);
          }}
          onToggleActionCenter={() => {
            setIsActionCenterOpen(!isActionCenterOpen);
            setIsStartMenuOpen(false);
          }}
          onOpenApp={handleOpenApp}
          onFocusWindow={handleFocusWindow}
          onToggleMinimize={handleToggleMinimize}
          onShowDesktop={handleShowDesktop}
        />
      </div>
    </div>
  );
}

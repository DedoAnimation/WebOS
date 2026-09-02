import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  Sparkles,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  ChevronUp,
} from 'lucide-react';
import { AppId, WindowState, SystemSettings } from '../../types';
import { APPS } from '../../data/apps';
import { AppIcon } from '../Common/AppIcon';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  settings: SystemSettings;
  isStartMenuOpen: boolean;
  isActionCenterOpen: boolean;
  onToggleStartMenu: () => void;
  onToggleActionCenter: () => void;
  onOpenApp: (appId: AppId) => void;
  onFocusWindow: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onShowDesktop: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  settings,
  isStartMenuOpen,
  isActionCenterOpen,
  onToggleStartMenu,
  onToggleActionCenter,
  onOpenApp,
  onFocusWindow,
  onToggleMinimize,
  onShowDesktop,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pinned apps from catalog
  const pinnedAppIds: AppId[] = ['explorer', 'browser', 'terminal', 'notepad', 'paint', 'calculator', 'copilot'];

  // Combine pinned apps with any other running apps
  const allAppIds = Array.from(new Set([...pinnedAppIds, ...windows.map(w => w.appId)]));

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-12 w-full bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 shadow-md z-[9980] flex items-center justify-between px-2 select-none">
      {/* Left side when alignment is 'center', or icons when alignment is 'left' */}
      <div className={`flex items-center gap-1 ${settings.taskbarAlignment === 'center' ? 'w-44' : ''}`}>
        {/* Weather / Widgets (Windows 11 style) */}
        {settings.taskbarAlignment === 'center' && (
          <div
            onClick={() => onOpenApp('browser')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-200/50 cursor-pointer text-xs text-gray-700 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold text-gray-800">72°F</span>
            <span className="text-[11px] text-gray-500">Sunny</span>
          </div>
        )}
      </div>

      {/* Main App Icons Container */}
      <div
        className={`flex items-center gap-1 transition-all ${
          settings.taskbarAlignment === 'center' ? 'mx-auto' : 'flex-1'
        }`}
      >
        {/* Windows Start Button */}
        <button
          onClick={onToggleStartMenu}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            isStartMenuOpen ? 'bg-gray-200/80 shadow-inner' : 'hover:bg-gray-200/50 active:scale-95'
          }`}
          title="Start"
        >
          {/* Windows 4-Square Blue Logo */}
          <div className="grid grid-cols-2 gap-0.5 group-hover:scale-105 transition-transform">
            <div className="w-3 h-3 bg-blue-600 rounded-[1px]" />
            <div className="w-3 h-3 bg-blue-500 rounded-[1px]" />
            <div className="w-3 h-3 bg-blue-500 rounded-[1px]" />
            <div className="w-3 h-3 bg-blue-400 rounded-[1px]" />
          </div>
        </button>

        {/* Windows Search */}
        <button
          onClick={onToggleStartMenu}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-200/50 text-gray-600 hover:text-gray-900 transition-all active:scale-95"
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Task View */}
        <button
          onClick={onShowDesktop}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-200/50 text-gray-600 hover:text-gray-900 transition-all active:scale-95"
          title="Show Desktop / Task View"
        >
          <LayoutGrid size={18} />
        </button>

        {/* Windows Copilot */}
        <button
          onClick={() => onOpenApp('copilot')}
          className="w-10 h-10 rounded flex items-center justify-center hover:bg-gray-200/50 text-blue-600 hover:text-blue-700 transition-all active:scale-95"
          title="Windows Copilot (AI Companion)"
        >
          <Sparkles size={18} />
        </button>

        <div className="h-6 w-[1px] bg-gray-300 mx-1" />

        {/* Application Icons */}
        {allAppIds.map(appId => {
          const appMeta = APPS.find(a => a.id === appId);
          if (!appMeta) return null;

          const openWindows = windows.filter(w => w.appId === appId);
          const isRunning = openWindows.length > 0;
          const isActive = openWindows.some(w => w.id === activeWindowId && !w.isMinimized);

          return (
            <button
              key={appId}
              onClick={() => {
                if (!isRunning) {
                  onOpenApp(appId);
                } else {
                  // Toggle active or bring to top
                  const lastWin = openWindows[openWindows.length - 1];
                  if (lastWin.id === activeWindowId && !lastWin.isMinimized) {
                    onToggleMinimize(lastWin.id);
                  } else {
                    onFocusWindow(lastWin.id);
                  }
                }
              }}
              className={`relative w-10 h-10 rounded flex items-center justify-center transition-all group ${
                isActive
                  ? 'bg-gray-200/80 border-b-2 border-blue-600 shadow-sm'
                  : isRunning
                  ? 'bg-gray-100/70 hover:bg-gray-200/50'
                  : 'hover:bg-gray-200/50'
              } active:scale-95`}
              title={appMeta.name}
            >
              <div className="group-hover:scale-110 transition-transform">
                <AppIcon iconName={appMeta.iconName || appMeta.icon || 'AppWindow'} size={20} />
              </div>

              {/* Running Pill Indicator */}
              {isRunning && !isActive && (
                <div className="absolute bottom-0.5 w-1.5 h-0.5 rounded-full bg-gray-400 group-hover:w-3 transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* System Tray (Right) */}
      <div className="flex items-center gap-2 px-2 h-full">
        {/* System Tray Flyout Icons */}
        <div
          onClick={onToggleActionCenter}
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
            isActionCenterOpen
              ? 'bg-gray-200/80 text-blue-600'
              : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Wifi size={15} />
          {settings.volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <Battery size={16} className="text-gray-700" />
        </div>

        {/* Date & Time */}
        <div
          onClick={onToggleActionCenter}
          className={`flex flex-col items-end px-2 py-1 rounded cursor-pointer transition-colors ${
            isActionCenterOpen
              ? 'bg-gray-200/80 text-blue-600'
              : 'hover:bg-gray-200/50 text-gray-700 hover:text-gray-900'
          }`}
        >
          <span className="text-[11px] font-bold text-gray-800 leading-none">{formatTime(time)}</span>
          <span className="text-[10px] text-gray-500 leading-none mt-0.5">{formatDate(time)}</span>
        </div>

        <div className="h-8 w-[1px] bg-gray-300" />

        {/* Far Right Peek Sliver */}
        <div
          onClick={onShowDesktop}
          className="w-1.5 h-8 rounded-xs hover:bg-gray-300 cursor-pointer ml-0.5 transition-colors"
          title="Show desktop"
        />
      </div>
    </div>
  );
};

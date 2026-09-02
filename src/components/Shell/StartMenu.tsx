import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Power,
  User,
  Settings,
  Lock,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Clock,
  Folder,
} from 'lucide-react';
import { AppId, VFile } from '../../types';
import { APPS } from '../../data/apps';
import { AppIcon } from '../Common/AppIcon';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId, initialFile?: VFile) => void;
  recentFiles: VFile[];
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  recentFiles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = searchQuery
    ? APPS.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : APPS;

  const filteredRecent = searchQuery
    ? recentFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentFiles.slice(0, 6);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[9990] w-[580px] max-w-[94vw] h-[580px] max-h-[82vh] bg-white/95 backdrop-blur-2xl border border-gray-200/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-150 select-none"
    >
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type here to search apps, settings, and documents..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-xs text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Pinned Applications Section */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-3 px-1">
            <span>{searchQuery ? 'Search Results' : 'Pinned Apps'}</span>
            {!searchQuery && (
              <button
                onClick={() => onOpenApp('settings')}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium px-2 py-0.5 rounded hover:bg-gray-100"
              >
                All apps &gt;
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => {
                  onOpenApp(app.id);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-gray-100/80 transition-all group active:scale-95 text-center"
              >
                <div className="w-10 h-10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <AppIcon iconName={app.iconName || app.icon || 'AppWindow'} size={28} />
                </div>
                <span className="text-[11px] text-gray-700 group-hover:text-gray-900 truncate max-w-full font-medium">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Recent Files */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2.5 px-1 flex items-center gap-1.5">
            <Clock size={13} />
            <span>Recommended</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredRecent.map(file => (
              <div
                key={file.id}
                onClick={() => {
                  if (file.extension === 'txt' || file.extension === 'md') onOpenApp('notepad', file);
                  else if (['png', 'jpg', 'jpeg'].includes(file.extension || '')) onOpenApp('photos', file);
                  else onOpenApp('explorer', file);
                  onClose();
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/60 hover:bg-gray-100/90 border border-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Folder size={16} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium text-gray-800 truncate">{file.name}</div>
                  <div className="text-[10px] text-gray-500">{file.updatedAt || 'Recently modified'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User & Power Footer */}
      <div className="h-14 px-5 bg-gray-50/90 border-t border-gray-200 flex items-center justify-between relative">
        {/* User Account */}
        <div
          onClick={() => { onOpenApp('settings'); onClose(); }}
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-200/50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
            U
          </div>
          <span className="text-xs font-semibold text-gray-800">Administrator</span>
        </div>

        {/* Power Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="p-2 rounded-xl hover:bg-gray-200/50 text-gray-600 hover:text-gray-900 transition-colors"
            title="Power"
          >
            <Power size={17} />
          </button>

          {/* Power Options Dropdown */}
          {showPowerMenu && (
            <div className="absolute right-0 bottom-12 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl p-1.5 space-y-1 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100 z-50">
              <button
                onClick={() => { window.location.reload(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-left text-gray-700 hover:text-gray-900"
              >
                <RotateCcw size={14} className="text-blue-600" />
                <span>Restart</span>
              </button>
              <button
                onClick={() => {
                  document.body.innerHTML = '<div style="background:#000;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;"><h3>Shutting down... Click anywhere to turn on.</h3></div>';
                  document.body.onclick = () => window.location.reload();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-left text-red-600 hover:text-red-700"
              >
                <Power size={14} />
                <span>Shut down</span>
              </button>
              <button
                onClick={() => setShowPowerMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-left text-gray-700 hover:text-gray-900"
              >
                <Lock size={14} className="text-amber-500" />
                <span>Lock screen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

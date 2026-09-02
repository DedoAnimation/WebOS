import React, { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  Bluetooth,
  Plane,
  Moon,
  BatteryCharging,
  Sun,
  Volume2,
  Sliders,
  Bell,
  Trash2,
  ChevronRight,
  Music,
  Play,
  Pause,
  SkipForward,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { SystemSettings } from '../../types';

interface ActionCenterProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'Windows Defender',
      message: 'No security threats found during background scan.',
      time: '10m ago',
    },
    {
      id: 'n-2',
      title: 'Copilot Assistant',
      message: 'Tips for multitasking with Snap layouts are available.',
      time: '1h ago',
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-14 right-3 z-[9990] w-96 max-w-[94vw] bg-white/95 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-150 select-none"
    >
      {/* Quick Setting Toggle Tiles */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* WiFi */}
        <button
          onClick={() => setWifiEnabled(!wifiEnabled)}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
            wifiEnabled
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Wifi size={18} className="mb-2 text-blue-600" />
          <span className="font-semibold text-gray-800">Wi-Fi</span>
          <span className="text-[10px] text-gray-500">{wifiEnabled ? 'Connected' : 'Off'}</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
            bluetoothEnabled
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bluetooth size={18} className="mb-2 text-blue-600" />
          <span className="font-semibold text-gray-800">Bluetooth</span>
          <span className="text-[10px] text-gray-500">{bluetoothEnabled ? 'On' : 'Off'}</span>
        </button>

        {/* Airplane Mode */}
        <button
          onClick={() => setAirplaneMode(!airplaneMode)}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
            airplaneMode
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Plane size={18} className="mb-2 text-blue-600" />
          <span className="font-semibold text-gray-800">Airplane</span>
          <span className="text-[10px] text-gray-500">{airplaneMode ? 'On' : 'Off'}</span>
        </button>

        {/* Night Light */}
        <button
          onClick={() => onUpdateSettings({ nightLight: !settings.nightLight })}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
            settings.nightLight
              ? 'bg-amber-50 border-amber-400 text-amber-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Moon size={18} className="mb-2 text-amber-600" />
          <span className="font-semibold text-gray-800">Night Light</span>
          <span className="text-[10px] text-gray-500">{settings.nightLight ? 'Active' : 'Off'}</span>
        </button>

        {/* Battery Saver */}
        <button
          className="flex flex-col items-start p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
        >
          <BatteryCharging size={18} className="mb-2 text-green-600" />
          <span className="font-semibold text-gray-800">Battery</span>
          <span className="text-[10px] text-green-600 font-medium">100% Plugged</span>
        </button>

        {/* Transparency */}
        <button
          onClick={() => onUpdateSettings({ transparency: !settings.transparency })}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all ${
            settings.transparency
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sliders size={18} className="mb-2 text-blue-600" />
          <span className="font-semibold text-gray-800">Mica Glass</span>
          <span className="text-[10px] text-gray-500">{settings.transparency ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Sliders: Brightness & Volume */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        {/* Brightness */}
        <div className="flex items-center gap-3">
          <Sun size={16} className="text-gray-500" />
          <input
            type="range"
            min={20}
            max={100}
            value={settings.brightness}
            onChange={e => onUpdateSettings({ brightness: Number(e.target.value) })}
            className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
          <span className="text-[11px] font-mono text-gray-600 w-8 text-right">{settings.brightness}%</span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 size={16} className="text-gray-500" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={e => onUpdateSettings({ volume: Number(e.target.value) })}
            className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
          <span className="text-[11px] font-mono text-gray-600 w-8 text-right">{settings.volume}%</span>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Notification Center</span>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 size={11} />
              <span>Clear all</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400">No new notifications</div>
          ) : (
            notifications.map((n, idx) => (
              <div
                key={n.id}
                className={`p-2.5 bg-white border border-gray-200 rounded-lg shadow-xs text-xs space-y-0.5 border-l-3 ${
                  idx === 0 ? 'border-l-blue-500' : 'border-l-gray-300'
                }`}
              >
                <div className="flex justify-between font-bold text-gray-800">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                </div>
                <div className="text-[11px] text-gray-500">{n.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Palette,
  Laptop,
  Sun,
  Volume2,
  HardDrive,
  Sparkles,
  Check,
  ShieldCheck,
  Cpu,
  Sliders,
  Moon,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Layout,
} from 'lucide-react';
import { SystemSettings, WallpaperOption } from '../../types';
import { WALLPAPERS } from '../../data/wallpapers';

interface SettingsAppProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

const ACCENT_COLORS = [
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Royal Indigo', hex: '#4f46e5' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Amber Glow', hex: '#d97706' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Teal', hex: '#0d9488' },
];

export const SettingsApp: React.FC<SettingsAppProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [activeNav, setActiveNav] = useState<'personalization' | 'system' | 'display' | 'sound' | 'storage'>('personalization');

  const navItems = [
    { id: 'personalization', name: 'Personalization', icon: Palette, desc: 'Background, theme colors, taskbar' },
    { id: 'system', name: 'System & About', icon: Laptop, desc: 'Specs, version, device info' },
    { id: 'display', name: 'Display & Brightness', icon: Sun, desc: 'Night light, screen brightness' },
    { id: 'sound', name: 'Sound & Audio', icon: Volume2, desc: 'Volume levels, audio effects' },
    { id: 'storage', name: 'Storage & Memory', icon: HardDrive, desc: 'Local virtual disk, temp files' },
  ];

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Sidebar Navigation */}
      <div className="w-56 bg-zinc-900/60 border-r border-white/5 p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 bg-zinc-900/90 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
            U
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">Administrator</div>
            <div className="text-[10px] text-zinc-500">Local Account</div>
          </div>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isSelected = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-400 font-medium shadow-sm'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <Icon size={16} className={isSelected ? 'text-sky-400' : 'text-zinc-400'} />
              <div className="truncate">
                <div className="text-xs">{item.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-950">
        {activeNav === 'personalization' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Personalization</h2>
              <p className="text-xs text-zinc-400">Select your background wallpaper, accent colors, and taskbar layout.</p>
            </div>

            {/* Wallpaper Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Desktop Background</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {WALLPAPERS.map(wp => {
                  const isSelected = settings.wallpaper === wp.url;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => onUpdateSettings({ wallpaper: wp.url })}
                      className={`group relative h-28 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected ? 'border-sky-500 ring-2 ring-sky-500/50 shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {wp.isDynamic ? (
                        <div className="w-full h-full bg-gradient-to-tr from-emerald-950 via-zinc-950 to-sky-950 flex flex-col items-center justify-center p-2 text-center">
                          <Sparkles size={18} className="text-emerald-400 mb-1" />
                          <span className="text-[11px] font-semibold text-emerald-300">Dynamic Cyber Waves</span>
                        </div>
                      ) : (
                        <img src={wp.thumbnail} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-zinc-950/80 backdrop-blur-xs text-[10px] text-zinc-300 truncate">
                        {wp.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Chooser */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">Accent Color</label>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateSettings({ accentColor: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                      settings.accentColor === c.hex ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {settings.accentColor === c.hex && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Taskbar Alignment */}
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-zinc-300 block">Taskbar Alignment</label>
              <div className="flex gap-3">
                <button
                  onClick={() => onUpdateSettings({ taskbarAlignment: 'center' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    settings.taskbarAlignment === 'center'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  Center (Windows 11 Default)
                </button>
                <button
                  onClick={() => onUpdateSettings({ taskbarAlignment: 'left' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    settings.taskbarAlignment === 'left'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  Left (Classic Windows)
                </button>
              </div>
            </div>

            {/* Acrylic Transparency Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Transparency & Mica Blur Effects</div>
                <div className="text-[11px] text-zinc-400">Enable modern translucent frosted glass on windows and taskbar.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.transparency}
                onChange={e => onUpdateSettings({ transparency: e.target.checked })}
                className="w-5 h-5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeNav === 'system' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">System & About</h2>
              <p className="text-xs text-zinc-400">Specifications and device diagnostics.</p>
            </div>

            {/* Device Specs Card */}
            <div className="p-5 bg-zinc-900/70 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                  <Laptop size={28} />
                </div>
                <div>
                  <div className="text-base font-bold text-white">WinWeb Desktop Workstation</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Genuine Activated License</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-zinc-500">Edition:</div>
                  <div className="font-medium text-zinc-200">Windows 11 Web Edition (24H2)</div>
                </div>
                <div>
                  <div className="text-zinc-500">OS Build:</div>
                  <div className="font-mono text-zinc-200">26100.1742</div>
                </div>
                <div>
                  <div className="text-zinc-500">Processor:</div>
                  <div className="font-medium text-zinc-200">Virtual Core i9-14900K @ 5.8 GHz</div>
                </div>
                <div>
                  <div className="text-zinc-500">Installed RAM:</div>
                  <div className="font-medium text-zinc-200">32.0 GB High Speed LPDDR5</div>
                </div>
                <div>
                  <div className="text-zinc-500">System Architecture:</div>
                  <div className="font-medium text-zinc-200">64-bit Browser WASM Engine</div>
                </div>
                <div>
                  <div className="text-zinc-500">Display:</div>
                  <div className="font-medium text-zinc-200">{window.innerWidth} x {window.innerHeight} @ 120Hz</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'display' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Display & Night Light</h2>
              <p className="text-xs text-zinc-400">Control visual brightness, eye comfort, and night light.</p>
            </div>

            {/* Brightness Slider */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">Screen Brightness</span>
                <span className="font-mono text-sky-400">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={settings.brightness}
                onChange={e => onUpdateSettings({ brightness: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Night Light Toggle */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Night Light (Warm Eye Protection)</div>
                  <div className="text-[11px] text-zinc-400">Filters blue light for comfortable nighttime viewing.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.nightLight}
                  onChange={e => onUpdateSettings({ nightLight: e.target.checked })}
                  className="w-5 h-5 accent-sky-500 cursor-pointer"
                />
              </div>

              {settings.nightLight && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Warmth Strength:</span>
                    <span className="font-mono text-amber-400">{settings.nightLightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={settings.nightLightIntensity}
                    onChange={e => onUpdateSettings({ nightLightIntensity: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeNav === 'sound' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Sound & System Audio</h2>
              <p className="text-xs text-zinc-400">Manage audio output and synthesized system effects.</p>
            </div>

            {/* Master Volume */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">Master Volume</span>
                <span className="font-mono text-sky-400">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.volume}
                onChange={e => onUpdateSettings({ volume: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* System Sound Effects */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Windows System Sound FX</div>
                <div className="text-[11px] text-zinc-400">Play audio cues on window minimize, maximize, click, and notifications.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeNav === 'storage' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Storage & Virtual Disk</h2>
              <p className="text-xs text-zinc-400">Virtual disk space usage breakdown.</p>
            </div>

            <div className="p-5 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-white">Local NVMe Disk (C:)</div>
                  <div className="text-xs text-zinc-400">842 GB free of 1.0 TB</div>
                </div>
                <div className="text-xs font-bold text-sky-400">15.8% Used</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-sky-500 w-[10%]" title="System Files (102 GB)" />
                <div className="bg-emerald-500 w-[4%]" title="Apps & Features (41 GB)" />
                <div className="bg-amber-500 w-[1.8%]" title="User Documents (18 GB)" />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-zinc-300">System Files: 102 GB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-300">Apps & Tools: 41 GB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">User Files: 18 GB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400">Free Space: 842 GB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

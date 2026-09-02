import { VFile } from '../types';

export const INITIAL_FILES: VFile[] = [
  // System root folders
  {
    id: 'root-c',
    name: 'C:',
    path: 'C:',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    id: 'users',
    name: 'Users',
    path: 'C:/Users',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    id: 'user-home',
    name: 'User',
    path: 'C:/Users/User',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
  },
  {
    id: 'desktop-dir',
    name: 'Desktop',
    path: 'C:/Users/User/Desktop',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Monitor',
  },
  {
    id: 'docs-dir',
    name: 'Documents',
    path: 'C:/Users/User/Documents',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'FileText',
  },
  {
    id: 'pics-dir',
    name: 'Pictures',
    path: 'C:/Users/User/Pictures',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Image',
  },
  {
    id: 'music-dir',
    name: 'Music',
    path: 'C:/Users/User/Music',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Music',
  },
  {
    id: 'downloads-dir',
    name: 'Downloads',
    path: 'C:/Users/User/Downloads',
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Download',
  },
  {
    id: 'recycle-bin-dir',
    name: 'Recycle Bin',
    path: 'C:/Recycle Bin',
    type: 'folder',
    size: 0,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Trash2',
  },

  // Desktop App Shortcuts
  {
    id: 'sc-explorer',
    name: 'This PC',
    path: 'C:/Users/User/Desktop/This PC',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'explorer',
    iconName: 'HardDrive',
  },
  {
    id: 'sc-edge',
    name: 'Microsoft Edge',
    path: 'C:/Users/User/Desktop/Microsoft Edge',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'browser',
    iconName: 'Globe',
  },
  {
    id: 'sc-notepad',
    name: 'Notepad',
    path: 'C:/Users/User/Desktop/Notepad',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'notepad',
    iconName: 'FileText',
  },
  {
    id: 'sc-terminal',
    name: 'Terminal',
    path: 'C:/Users/User/Desktop/Terminal',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'terminal',
    iconName: 'Terminal',
  },
  {
    id: 'sc-paint',
    name: 'Paint Studio',
    path: 'C:/Users/User/Desktop/Paint Studio',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'paint',
    iconName: 'Palette',
  },
  {
    id: 'sc-copilot',
    name: 'Copilot AI',
    path: 'C:/Users/User/Desktop/Copilot AI',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'copilot',
    iconName: 'Sparkles',
  },
  {
    id: 'sc-minesweeper',
    name: 'Minesweeper',
    path: 'C:/Users/User/Desktop/Minesweeper',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'minesweeper',
    iconName: 'Bomb',
  },
  {
    id: 'sc-arcade',
    name: 'Retro Arcade',
    path: 'C:/Users/User/Desktop/Retro Arcade',
    type: 'shortcut',
    size: 1024,
    updatedAt: new Date().toLocaleDateString(),
    targetApp: 'snake',
    iconName: 'Gamepad2',
  },
  {
    id: 'sc-recycle',
    name: 'Recycle Bin',
    path: 'C:/Users/User/Desktop/Recycle Bin',
    type: 'shortcut',
    size: 0,
    updatedAt: new Date().toLocaleDateString(),
    iconName: 'Trash2',
  },

  // Desktop Files
  {
    id: 'file-welcome',
    name: 'Welcome to WinWeb OS.txt',
    path: 'C:/Users/User/Desktop/Welcome to WinWeb OS.txt',
    type: 'file',
    extension: 'txt',
    size: 1420,
    updatedAt: new Date().toLocaleDateString(),
    content: `=====================================================
         WELCOME TO WINWEB OPERATING SYSTEM
=====================================================

WinWeb OS is a full-featured, responsive, browser-native operating system designed to replicate the complete Windows experience with modern Fluent design!

KEY FEATURES & CAPABILITIES:
-----------------------------------------------------
1. Multi-Tasking Window Manager:
   - Drag, resize from all 8 edges and corners.
   - Maximize, minimize, and close.
   - Snap Layouts: Hover over the maximize button or drag to screen edges to snap left, right, or fullscreen.
   - Task Switcher: Press Alt+Tab to cycle active windows.
   - Virtual Desktop & Task View.

2. Full Built-In System Suite:
   - File Explorer: Full virtual file system, copy/paste, upload real files, download files, rename & delete.
   - Microsoft Edge: Multi-tab web browser with search, bookmarks, and web apps.
   - Terminal / PowerShell: Complete interactive CLI with help, dir, cd, mkdir, ping, matrix mode, neofetch, and AI assistant.
   - Paint Studio: Rich canvas art studio with brushes, shapes, color pickers, and export.
   - Notepad: Tabbed text editor with syntax highlighting, word count, and file saving.
   - Calculator: Standard and scientific modes with calculation history.
   - Media Player: Synthesized music player with live animated audio spectrum visualizer.
   - Photos: Image gallery with filters (sepia, grayscale, invert).
   - Task Manager: Real-time CPU & RAM live charts with process management.
   - Settings: Personalization, dark/light themes, 4K wallpapers, taskbar alignment, sound & display.
   - Classic Games: Minesweeper & Retro Arcade Snake.
   - Sound Recorder, Clock & Stopwatch.
   - Copilot AI Companion: Interactive assistant to chat and control your OS.

3. Fluent Action Center & System Tray:
   - Quick settings for Wi-Fi, Bluetooth, Night Light, Dark Mode, Volume, and Brightness.
   - Live interactive calendar with clock.
   - Dynamic Widgets board for live Weather, Stock Market, and System Telemetry.

Enjoy exploring WinWeb OS!`,
  },
  {
    id: 'file-specs',
    name: 'System Specs.txt',
    path: 'C:/Users/User/Desktop/System Specs.txt',
    type: 'file',
    extension: 'txt',
    size: 680,
    updatedAt: new Date().toLocaleDateString(),
    content: `OS Name: WinWeb Operating System
Version: 24H2 (Build 26100.1742)
System Type: 64-bit Browser Engine Architecture
Processor: Virtual Intel Core i9-14900K @ 5.80 GHz (24 Cores)
Installed RAM: 32.0 GB (31.8 GB usable)
Display: 4K Ultra HD Fluent Canvas (120 Hz)
Storage: Virtual NVMe SSD 1.0 TB (842 GB free)
Audio Engine: Web Audio Synthesizer Matrix
Network: High-Speed WebSockets & Fetch Interface`,
  },

  // Documents
  {
    id: 'file-project',
    name: 'Roadmap 2026.md',
    path: 'C:/Users/User/Documents/Roadmap 2026.md',
    type: 'file',
    extension: 'md',
    size: 890,
    updatedAt: new Date().toLocaleDateString(),
    content: `# WinWeb OS Evolution Roadmap

## Q1 Milestones
- [x] Full-fledged multi-window management with edge snapping
- [x] Fluent Glass Acrylic backdrop blur UI
- [x] File Explorer with local storage persistence
- [x] Interactive Terminal with 20+ commands
- [x] Paint Studio with layer tools & export

## Q2 Goals
- [x] Dynamic animated wallpapers
- [x] Copilot AI Assistant integration
- [x] Audio spectrum visualizer for Media Player
- [x] Live weather & market widgets`,
  },
  {
    id: 'file-script',
    name: 'matrix_simulation.js',
    path: 'C:/Users/User/Documents/matrix_simulation.js',
    type: 'file',
    extension: 'js',
    size: 512,
    updatedAt: new Date().toLocaleDateString(),
    content: `// WinWeb Matrix Terminal Effect
function startMatrixStream() {
  const characters = '0123456789ABCDEF@#$%&*';
  console.log("Initializing Matrix Cyber Stream...");
  setInterval(() => {
    let row = '';
    for (let i = 0; i < 40; i++) {
      row += characters[Math.floor(Math.random() * characters.length)];
    }
    console.log(row);
  }, 100);
}
startMatrixStream();`,
  },

  // Pictures
  {
    id: 'pic-aurora',
    name: 'Nordic Aurora.jpg',
    path: 'C:/Users/User/Pictures/Nordic Aurora.jpg',
    type: 'file',
    extension: 'jpg',
    size: 2450000,
    updatedAt: new Date().toLocaleDateString(),
    dataUrl: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-cyber',
    name: 'Cyber Metropolis.jpg',
    path: 'C:/Users/User/Pictures/Cyber Metropolis.jpg',
    type: 'file',
    extension: 'jpg',
    size: 3100000,
    updatedAt: new Date().toLocaleDateString(),
    dataUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-alpine',
    name: 'Alpine Sunrise.jpg',
    path: 'C:/Users/User/Pictures/Alpine Sunrise.jpg',
    type: 'file',
    extension: 'jpg',
    size: 1980000,
    updatedAt: new Date().toLocaleDateString(),
    dataUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },

  // Downloads
  {
    id: 'dl-package',
    name: 'setup_bundle.zip',
    path: 'C:/Users/User/Downloads/setup_bundle.zip',
    type: 'file',
    extension: 'zip',
    size: 14500000,
    updatedAt: new Date().toLocaleDateString(),
    content: '[Binary Zip Archive Data]',
  },
];

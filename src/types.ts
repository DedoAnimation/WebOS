export type AppId =
  | 'explorer'
  | 'notepad'
  | 'terminal'
  | 'calculator'
  | 'paint'
  | 'browser'
  | 'mediaplayer'
  | 'media'
  | 'photos'
  | 'settings'
  | 'taskmanager'
  | 'minesweeper'
  | 'snake'
  | 'clock'
  | 'recorder'
  | 'copilot'
  | 'run'
  | 'system';

export interface AppMetadata {
  id: AppId;
  name: string;
  iconName: string;
  icon?: string;
  category: 'system' | 'productivity' | 'utilities' | 'entertainment' | 'media';
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  pinnedToTaskbar?: boolean;
  pinnedToStart?: boolean;
  description: string;
}

export type SnapPosition = 'none' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'maximize';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  iconName?: string;
  icon?: string;
  isMinimized: boolean;
  isMaximized: boolean;
  snapPosition?: SnapPosition;
  snapState?: SnapPosition;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  initialFile?: VFile;
  customProps?: Record<string, any>;
}

export interface VFile {
  id: string;
  name: string;
  path: string; // e.g., 'C:/Users/User/Desktop/Notes.txt'
  type: 'file' | 'folder' | 'shortcut';
  extension?: string;
  content?: string;
  dataUrl?: string;
  size: number; // in bytes
  updatedAt: string;
  iconName?: string;
  targetApp?: AppId;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  appId?: AppId;
  iconName?: string;
  read: boolean;
}

export interface WallpaperOption {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  isDynamic?: boolean;
}

export interface SystemSettings {
  theme: 'dark' | 'light';
  wallpaper: string;
  accentColor: string;
  taskbarAlignment: 'center' | 'left';
  soundEnabled: boolean;
  nightLight: boolean;
  nightLightIntensity: number;
  transparency: boolean;
  volume: number; // 0 - 100
  brightness: number; // 20 - 100
  wifi?: boolean;
  bluetooth?: boolean;
  airplaneMode?: boolean;
  batterySaver?: boolean;
  focusAssist?: boolean;
  desktopIconSize?: 'small' | 'medium' | 'large';
  autoHideTaskbar?: boolean;
}

export interface ProcessMetric {
  id: string;
  name: string;
  appId: AppId;
  cpu: number;
  memory: number; // MB
  disk: number; // MB/s
  status: 'Running' | 'Suspended';
}

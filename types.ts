import React, { ReactNode } from 'react';

export enum AppId {
  TERMINAL = 'terminal',
  FILE_MANAGER = 'thunar',
  AI_ASSISTANT = 'gemini',
  SETTINGS = 'settings',
  SYSTEM_MONITOR = 'system_monitor',
  ABOUT = 'about',
  NOTEPAD = 'notepad',
  AUDIO_PLAYER = 'audio_player',
  VIDEO_PLAYER = 'video_player',
  IMAGE_VIEWER = 'image_viewer',
  DOCUMENT_READER = 'document_reader',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  CALCULATOR = 'calculator',
  DEV_TOOLS = 'dev_tools',
  CALENDAR = 'calendar',
  PAINT = 'paint',
  TICTACTOE = 'tictactoe',
  TODO_LIST = 'todo_list'
}

export type PowerState = 'off' | 'booting' | 'login' | 'running' | 'shutdown' | 'suspend' | 'lock' | 'screensaver';

export interface UserAuth {
  id?: string;
  username: string;
  email?: string;
  isLoggedIn: boolean;
  avatar?: string;
  type: 'admin' | 'guest';
}

export interface Theme {
  id: string;
  name: string;
  accentColor: string;
  windowRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mode: 'dark' | 'light';
}

export interface SystemSettings {
  volume: number;
  brightness: number;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  nightLight: boolean;
  screenTimeout: number;
  
  displayResolution: '1920x1080' | '1366x768' | '3840x2160';
  keyboardLayout: 'US' | 'UK' | 'DE' | 'ES';
  soundOutput: 'default' | 'headphones' | 'hdmi';

  panelPosition: 'top' | 'bottom';
  panelAlignment: 'left' | 'center';
  panelOpacity: number;
  menuOpacity: number;
  windowOpacity: number;
  inactiveWindowOpacity: number;
  enableBlur: boolean;
  panelSize: number;
  panelLocked: boolean;
  panelAutoHide: boolean;

  menuWidth: number;
  menuHeight: number;
  showMenuAvatar: boolean;
  menuFontSize: number;

  focusFollowsMouse: boolean;
  enableSnap: boolean;
  workspaceNames: string[];
  numWorkspaces: number;
  titleBarLayout: 'left' | 'right';
  showLoadMonitor: boolean;
}

export interface DesktopIconState {
  id: string;
  appId: AppId | 'trash' | 'launcher';
  label: string;
  x: number;
  y: number;
  action?: () => void;
  iconOverride?: any;
}

export interface Process {
  pid: number;
  name: string;
  status: 'running' | 'sleeping' | 'stopped';
  memoryUsage: number;
  cpuUsage: number;
  windowId?: string;
  owner: string;
}

export interface SystemLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon?: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isShaded: boolean;
  isSticky: boolean;
  zIndex: number;
  desktopId: number;
  processId: number;
  content: ReactNode;
  context?: string;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: React.FC<{ size?: number; className?: string }>;
  component: React.FC<{ windowId: string; fileId?: string }>;
  defaultWidth: number;
  defaultHeight: number;
  singleton?: boolean;
  category?: 'Accessories' | 'Development' | 'Internet' | 'Multimedia' | 'System' | 'Office' | 'Games';
}

export type FileType = 'file' | 'dir';

export interface FSNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  content?: string;
  children?: string[];
  createdAt: number;
  permissions?: string;
  owner?: string;
}

export interface FileSystemState {
  nodes: Record<string, FSNode>;
  rootId: string;
  clipboard: {
    nodeId: string;
    operation: 'copy' | 'cut';
  } | null;
}

export type WidgetType = 'clock' | 'calendar' | 'weather' | 'notes';
export interface DesktopWidget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  data?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}
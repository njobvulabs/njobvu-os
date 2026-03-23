import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef, useMemo } from 'react';
import { WindowState, AppId, FileSystemState, FSNode, Notification, PowerState, UserAuth, Theme, Process, SystemLog, DesktopWidget, WidgetType, SystemSettings, DesktopIconState } from '../types';
import { APPS, WALLPAPER_URL, DEFAULT_THEME } from '../constants';
import { createInitialFileSystem, copyNode } from '../services/fileSystem';
import { supabase } from '../services/supabaseClient';

interface OSContextType {
  // Power & Session
  powerState: PowerState;
  currentUser: UserAuth;
  bootSystem: () => void;
  loginUser: (username: string, password?: string) => boolean;
  logoutUser: () => void;
  shutdownSystem: () => void;
  rebootSystem: () => void;
  suspendSystem: () => void;
  lockScreen: () => void;
  exitScreensaver: () => void;

  // Window Manager
  windows: WindowState[];
  activeWindowId: string | null;
  currentDesktop: number;
  openApp: (appId: AppId, params?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  shadeWindow: (id: string) => void;
  toggleStickyWindow: (id: string) => void;
  minimizeAll: () => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  updateWindowContext: (id: string, context: string) => void;
  switchDesktop: (desktopId: number) => void;
  moveWindowToDesktop: (windowId: string, desktopId: number) => void;

  // Kernel / Processes
  processes: Process[];
  killProcess: (pid: number) => void;
  systemLogs: SystemLog[];
  addSystemLog: (level: 'info' | 'warn' | 'error', source: string, message: string) => void;

  // Appearance & Hardware
  theme: Theme;
  setTheme: (theme: Theme) => void;
  wallpaper: string;
  setWallpaper: (url: string) => void;
  refreshSystem: () => void;
  refreshKey: number;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  // File System
  fs: FileSystemState;
  createFile: (parentId: string, name: string, content?: string) => void;
  createDir: (parentId: string, name: string) => void;
  deleteNode: (id: string, permanent?: boolean) => void;
  emptyTrash: () => void;
  updateFileContent: (id: string, content: string) => void;
  renameNode: (id: string, newName: string) => void;
  setFsClipboard: (nodeId: string, operation: 'copy' | 'cut') => void;
  pasteFsClipboard: (destParentId: string) => void;
  moveNode: (nodeId: string, destParentId: string) => void;
  copyFsNode: (nodeId: string, destParentId: string) => void;

  // Desktop Objects (Widgets/Icons)
  widgets: DesktopWidget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  desktopIcons: DesktopIconState[];
  addDesktopIcon: (icon: DesktopIconState) => void;
  updateDesktopIconPosition: (id: string, x: number, y: number) => void;
  arrangeDesktopIcons: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissNotification: (id: string) => void;

  // Global Search
  isSearchOpen: boolean;
  toggleSearch: (open?: boolean) => void;

  // System Copilot
  isCopilotOpen: boolean;
  toggleCopilot: (open?: boolean) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: ReactNode; initialUser?: UserAuth; onShutdown?: () => void }> = ({ children, initialUser, onShutdown }) => {
  const [powerState, setPowerState] = useState<PowerState>('booting');
  const [currentUser, setCurrentUser] = useState<UserAuth>(initialUser || { username: 'guest', isLoggedIn: false, type: 'guest' });

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [currentDesktop, setCurrentDesktop] = useState(0);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  const [wallpaper, setWallpaperState] = useState(WALLPAPER_URL);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [refreshKey, setRefreshKey] = useState(0);
  const [widgets, setWidgets] = useState<DesktopWidget[]>([]);
  
  const [desktopIcons, setDesktopIcons] = useState<DesktopIconState[]>(() => {
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 768;
      const maxX = winW - 100;
      const maxY = winH - 120;

      return [
        { id: 'term', appId: AppId.TERMINAL, label: 'Terminal', x: 20, y: 20 },
        { id: 'files', appId: AppId.FILE_MANAGER, label: 'File Manager', x: 20, y: 110 },
        { id: 'notes', appId: AppId.NOTEPAD, label: 'Text Editor', x: 20, y: 200 },
        { id: 'trash', appId: 'trash', label: 'Trash', x: Math.max(20, maxX), y: Math.max(20, maxY) },
      ];
  });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('njobvu_system_settings');
    const defaults: SystemSettings = {
      volume: 80, brightness: 100, wifiEnabled: true, bluetoothEnabled: true, nightLight: false, screenTimeout: 5,
      displayResolution: '1920x1080', keyboardLayout: 'US', soundOutput: 'default',
      panelPosition: 'bottom', panelAlignment: 'left', panelOpacity: 90, menuOpacity: 95, windowOpacity: 100, inactiveWindowOpacity: 90,
      enableBlur: true, panelSize: 48, panelLocked: true, panelAutoHide: false,
      menuWidth: 500, menuHeight: 420, showMenuAvatar: true, menuFontSize: 18,
      focusFollowsMouse: false, enableSnap: true, workspaceNames: ['1', '2', '3', '4'],
      numWorkspaces: 4, titleBarLayout: 'right', showLoadMonitor: true
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  const [fs, setFs] = useState<FileSystemState>(() => createInitialFileSystem(initialUser?.username || 'guest'));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addSystemLog = useCallback((level: 'info' | 'warn' | 'error', source: string, message: string) => {
    setSystemLogs(prev => [...prev.slice(-99), { timestamp: Date.now(), level, source, message }]);
  }, []);

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    addSystemLog('info', 'Notification', `${title}: ${message}`);
  }, [addSystemLog]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateSystemSettings = useCallback((updates: Partial<SystemSettings>) => {
      setSystemSettings(prev => {
          const newState = { ...prev, ...updates };
          if (updates.numWorkspaces) {
            newState.numWorkspaces = Math.max(1, Math.min(8, updates.numWorkspaces));
            while (newState.workspaceNames.length < newState.numWorkspaces) {
              newState.workspaceNames.push(`${newState.workspaceNames.length + 1}`);
            }
          }
          localStorage.setItem('njobvu_system_settings', JSON.stringify(newState));
          return newState;
      });
  }, []);

  const toggleSearch = useCallback((open?: boolean) => setIsSearchOpen(prev => open ?? !prev), []);
  const toggleCopilot = useCallback((open?: boolean) => setIsCopilotOpen(prev => open ?? !prev), []);
  const refreshSystem = useCallback(() => setRefreshKey(prev => prev + 1), []);
  
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('njobvu_theme', JSON.stringify(newTheme));
  }, []);

  const setWallpaper = useCallback((url: string) => {
    setWallpaperState(url);
    localStorage.setItem('njobvu_wallpaper', url);
  }, []);

  const createFile = useCallback((parentId: string, name: string, content: string = '') => {
    setFs(prev => {
      const parent = prev.nodes[parentId];
      if (!parent || parent.type !== 'dir') return prev;
      if (parent.children?.some(id => prev.nodes[id].name === name)) return prev;
      const id = Math.random().toString(36).substr(2, 9);
      const now = Date.now();
      const newNode: FSNode = { id, parentId, name, type: 'file', content, createdAt: now, permissions: 'rw-r--r--', owner: currentUser.username };
      return { ...prev, nodes: { ...prev.nodes, [id]: newNode, [parentId]: { ...parent, children: [...(parent.children || []), id] } } };
    });
  }, [currentUser.username]);

  const createDir = useCallback((parentId: string, name: string) => {
    setFs(prev => {
      const parent = prev.nodes[parentId];
      if (!parent || parent.type !== 'dir') return prev;
      const id = Math.random().toString(36).substr(2, 9);
      const now = Date.now();
      const newNode: FSNode = { id, parentId, name, type: 'dir', children: [], createdAt: now, permissions: 'rwxr-xr-x', owner: currentUser.username };
      return { ...prev, nodes: { ...prev.nodes, [id]: newNode, [parentId]: { ...parent, children: [...(parent.children || []), id] } } };
    });
  }, [currentUser.username]);

  const moveNodeLogic = (fsState: FileSystemState, nodeId: string, destParentId: string): FileSystemState => {
      const node = fsState.nodes[nodeId];
      if (!node || !node.parentId || node.parentId === destParentId) return fsState;
      const oldParent = fsState.nodes[node.parentId];
      const newParent = fsState.nodes[destParentId];
      if (!oldParent || !newParent) return fsState;
      return {
          ...fsState,
          nodes: {
              ...fsState.nodes,
              [nodeId]: { ...node, parentId: destParentId },
              [oldParent.id]: { ...oldParent, children: oldParent.children?.filter(c => c !== nodeId) },
              [newParent.id]: { ...newParent, children: [...(newParent.children || []), nodeId] }
          }
      };
  };

  const deleteNode = useCallback((id: string, permanent: boolean = false) => {
    setFs(prev => {
      const node = prev.nodes[id];
      if (!node || !node.parentId || id === 'trash') return prev; 
      
      const isAlreadyInTrash = node.parentId === 'trash';
      
      if (isAlreadyInTrash || permanent) {
          const parent = prev.nodes[node.parentId];
          const newNodes = { ...prev.nodes };
          delete newNodes[id];
          addNotification('System', `Permanently deleted ${node.name}`, 'info');
          return {
            ...prev,
            nodes: {
              ...newNodes,
              [parent.id]: { ...parent, children: parent.children?.filter(cid => cid !== id) }
            }
          };
      } else {
          addNotification('Trash', `Moved ${node.name} to trash`, 'info');
          return moveNodeLogic(prev, id, 'trash');
      }
    });
  }, [addNotification]);

  const emptyTrash = useCallback(() => {
    setFs(prev => {
      const trashNode = prev.nodes['trash'];
      if (!trashNode || !trashNode.children || trashNode.children.length === 0) return prev;
      const newNodes = { ...prev.nodes };
      trashNode.children.forEach(id => { delete newNodes[id]; });
      return { ...prev, nodes: { ...newNodes, 'trash': { ...trashNode, children: [] } } };
    });
    addNotification('Trash', 'Trash emptied', 'success');
  }, [addNotification]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFs(prev => ({ ...prev, nodes: { ...prev.nodes, [id]: { ...prev.nodes[id], content } } }));
  }, []);

  const renameNode = useCallback((id: string, newName: string) => {
    setFs(prev => ({ ...prev, nodes: { ...prev.nodes, [id]: { ...prev.nodes[id], name: newName } } }));
  }, []);

  const setFsClipboard = useCallback((nodeId: string, operation: 'copy' | 'cut') => {
    setFs(prev => ({ ...prev, clipboard: { nodeId, operation } }));
    addNotification('Clipboard', `${operation === 'copy' ? 'Copied' : 'Cut'} to clipboard`, 'info');
  }, [addNotification]);

  const copyFsNode = useCallback((nodeId: string, destParentId: string) => {
      setFs(prev => copyNode(prev, nodeId, destParentId));
  }, []);

  const moveNode = useCallback((nodeId: string, destParentId: string) => {
      setFs(prev => moveNodeLogic(prev, nodeId, destParentId));
  }, []);

  const pasteFsClipboard = useCallback((destParentId: string) => {
    setFs(prev => {
      if (!prev.clipboard) return prev;
      const { nodeId, operation } = prev.clipboard;
      if (operation === 'copy') {
         return copyNode(prev, nodeId, destParentId);
      } else {
         return { ...moveNodeLogic(prev, nodeId, destParentId), clipboard: null };
      }
    });
  }, []);

  const addWidget = useCallback((type: WidgetType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setWidgets(prev => [...prev, { id, type, x: 100, y: 100 }]);
  }, []);
  const removeWidget = useCallback((id: string) => setWidgets(prev => prev.filter(w => w.id !== id)), []);
  const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);
  const addDesktopIcon = useCallback((icon: DesktopIconState) => setDesktopIcons(prev => [...prev, icon]), []);
  const updateDesktopIconPosition = useCallback((id: string, x: number, y: number) => {
      setDesktopIcons(prev => prev.map(icon => icon.id === id ? { ...icon, x, y } : icon));
  }, []);
  const arrangeDesktopIcons = useCallback(() => {
      const startX = 20;
      const startY = systemSettings.panelPosition === 'top' ? systemSettings.panelSize + 20 : 20;
      const gridY = 90;
      setDesktopIcons(prev => prev.map((icon, index) => {
          if (icon.appId === 'trash') {
              const winW = window.innerWidth;
              const winH = window.innerHeight;
              const btmMargin = systemSettings.panelPosition === 'bottom' ? systemSettings.panelSize + 80 : 80;
              return { ...icon, x: winW - 100, y: winH - btmMargin };
          }
          return { ...icon, x: startX, y: startY + (index * gridY) };
      }));
  }, [systemSettings]);

  const openApp = useCallback((appId: AppId, params?: any) => {
    const appDef = APPS[appId];
    if (!appDef) return;
    if (appDef.singleton) {
       const existing = windows.find(w => w.appId === appId);
       if (existing) { focusWindow(existing.id); return; }
    }
    const pid = Date.now();
    const newWindowId = `win-${pid}`;
    setProcesses(prev => [...prev, { pid, name: appDef.name, status: 'running', memoryUsage: Math.floor(Math.random() * 50) + 20, cpuUsage: Math.floor(Math.random() * 10) + 1, windowId: newWindowId, owner: currentUser.username }]);
    addSystemLog('info', 'Kernel', `Started process ${appDef.name} (PID: ${pid})`);
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const isMobile = viewportW < 640;
    const maxW = viewportW - (isMobile ? 10 : 40);
    const maxH = viewportH - (isMobile ? 60 : 80);
    let width = Math.min(appDef.defaultWidth, maxW);
    let height = Math.min(appDef.defaultHeight, maxH);
    if (isMobile) { width = maxW; height = maxH; }
    const offset = windows.length * 25;
    const x = isMobile ? 5 : 50 + (offset % 200);
    const y = isMobile ? 40 + systemSettings.panelSize : 50 + (offset % 200);
    const newWindow: WindowState = {
      id: newWindowId, appId, title: appDef.name, x: Math.max(0, x), y: Math.max(systemSettings.panelPosition === 'top' ? systemSettings.panelSize : 0, y),
      width, height, isMinimized: false, isMaximized: false, isShaded: false, isSticky: false, zIndex: nextZIndex, desktopId: currentDesktop, processId: pid,
      content: <appDef.component windowId={newWindowId} {...params} />,
    };
    setWindows((prev) => [...prev, newWindow]);
    setNextZIndex((z) => z + 1);
    setActiveWindowId(newWindowId);
  }, [windows, nextZIndex, currentDesktop, currentUser, addSystemLog, systemSettings]);

  const killProcess = useCallback((pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setWindows(prev => prev.filter(w => w.processId !== pid));
    addSystemLog('warn', 'Kernel', `Process ${pid} killed`);
  }, [addSystemLog]);

  const closeWindow = useCallback((id: string) => {
    const win = windows.find(w => w.id === id);
    if (win) killProcess(win.processId);
  }, [windows, killProcess]);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId((prevId) => {
        if (prevId === id) return prevId;
        setWindows(prev => prev.map(win => win.id === id ? { ...win, zIndex: nextZIndex, isMinimized: false } : win));
        setNextZIndex(z => z + 1);
        return id;
    });
  }, [nextZIndex]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isMinimized: true } : win));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isMaximized: !win.isMaximized, isShaded: false } : win));
    focusWindow(id);
  }, [focusWindow]);

  const shadeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isShaded: !win.isShaded, isMaximized: false } : win));
    focusWindow(id);
  }, [focusWindow]);

  const toggleStickyWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isSticky: !win.isSticky } : win));
  }, []);

  const minimizeAll = useCallback(() => {
     setWindows(prev => prev.map(win => ({ ...win, isMinimized: true })));
     setActiveWindowId(null);
  }, []);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, x, y } : win));
  }, []);
  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, width, height } : win));
  }, []);
  const updateWindowContext = useCallback((id: string, context: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, context } : win));
  }, []);
  const switchDesktop = useCallback((id: number) => setCurrentDesktop(id), []);
  const moveWindowToDesktop = useCallback((windowId: string, desktopId: number) => {
      setWindows(prev => prev.map(win => win.id === windowId ? { ...win, desktopId } : win));
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (powerState !== 'running') return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (systemSettings.screenTimeout > 0) {
        idleTimerRef.current = setTimeout(() => {
            if (powerState === 'running') {
                setPowerState('screensaver');
                addSystemLog('info', 'Power', 'System idle: Screensaver started');
            }
        }, systemSettings.screenTimeout * 60 * 1000);
    }
  }, [powerState, systemSettings.screenTimeout, addSystemLog]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart'];
    const handler = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, handler));
    resetIdleTimer();
    return () => {
        events.forEach(e => window.removeEventListener(e, handler));
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const exitScreensaver = useCallback(() => { if (powerState === 'screensaver') setPowerState('running'); }, [powerState]);
  const bootSystem = useCallback(() => {
    setPowerState('booting'); setWindows([]); setProcesses([]);
    addSystemLog('info', 'Kernel', 'System boot sequence initiated');
  }, [addSystemLog]);
  const loginUser = useCallback((username: string, _password?: string) => {
    setCurrentUser({ username, isLoggedIn: true, type: username === 'root' ? 'admin' : 'guest', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` });
    setPowerState('running');
    addSystemLog('info', 'Auth', `User ${username} logged in`);
    return true;
  }, [addSystemLog]);
  const logoutUser = useCallback(() => {
    setPowerState('login'); setCurrentUser(prev => ({ ...prev, isLoggedIn: false }));
    setWindows([]); setProcesses([]);
    addSystemLog('info', 'Auth', 'User logged out');
  }, [addSystemLog]);
  const shutdownSystem = useCallback(() => {
    setPowerState('shutdown');
    addSystemLog('warn', 'Kernel', 'System shutdown initiated');
    if (onShutdown) setTimeout(onShutdown, 3000);
  }, [addSystemLog, onShutdown]);
  const rebootSystem = useCallback(() => {
    setPowerState('shutdown');
    setTimeout(() => { setPowerState('booting'); setWindows([]); setProcesses([]); }, 2000);
  }, []);
  const suspendSystem = useCallback(() => { setPowerState('suspend'); addSystemLog('info', 'Power', 'System suspended'); }, [addSystemLog]);
  const lockScreen = useCallback(() => { setPowerState('lock'); addSystemLog('info', 'Auth', 'Screen locked'); }, [addSystemLog]);

  const contextValue = useMemo(() => ({
    powerState, currentUser, bootSystem, loginUser, logoutUser, shutdownSystem, rebootSystem, suspendSystem, lockScreen, exitScreensaver,
    windows, activeWindowId, openApp, closeWindow, minimizeWindow, maximizeWindow, shadeWindow, toggleStickyWindow, minimizeAll, focusWindow, updateWindowPosition, updateWindowSize, updateWindowContext,
    processes, killProcess, systemLogs, addSystemLog,
    theme, setTheme, wallpaper, setWallpaper, refreshSystem, refreshKey, systemSettings, updateSystemSettings,
    fs, createFile, createDir, deleteNode, emptyTrash, updateFileContent, renameNode, setFsClipboard, pasteFsClipboard, moveNode, copyFsNode,
    widgets, addWidget, removeWidget, updateWidgetPosition,
    desktopIcons, addDesktopIcon, updateDesktopIconPosition, arrangeDesktopIcons,
    notifications, addNotification, dismissNotification,
    currentDesktop, switchDesktop, moveWindowToDesktop,
    isSearchOpen, toggleSearch,
    isCopilotOpen, toggleCopilot
  }), [
    powerState, currentUser, bootSystem, loginUser, logoutUser, shutdownSystem, rebootSystem, suspendSystem, lockScreen, exitScreensaver,
    windows, activeWindowId, openApp, closeWindow, minimizeWindow, maximizeWindow, shadeWindow, toggleStickyWindow, minimizeAll, focusWindow, updateWindowPosition, updateWindowSize, updateWindowContext,
    processes, killProcess, systemLogs, addSystemLog,
    theme, setTheme, wallpaper, setWallpaper, refreshSystem, refreshKey, systemSettings, updateSystemSettings,
    fs, createFile, createDir, deleteNode, emptyTrash, updateFileContent, renameNode, setFsClipboard, pasteFsClipboard, moveNode, copyFsNode,
    widgets, addWidget, removeWidget, updateWidgetPosition,
    desktopIcons, addDesktopIcon, updateDesktopIconPosition, arrangeDesktopIcons,
    notifications, addNotification, dismissNotification,
    currentDesktop, switchDesktop, moveWindowToDesktop,
    isSearchOpen, toggleSearch,
    isCopilotOpen, toggleCopilot
  ]);

  return (
    <OSContext.Provider value={contextValue}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (undefined === context) throw new Error('useOS must be used within an OSProvider');
  return context;
};
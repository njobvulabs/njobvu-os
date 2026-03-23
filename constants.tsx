import { Monitor, Terminal, Bot, FolderOpen, Settings, Info, Activity, FileText, Music, Video, Calculator, Code, Globe, Calendar as CalendarIcon, Brush, Gamepad2, Image, BookOpen, ListTodo, Table, Presentation } from 'lucide-react';
import { AppDefinition, AppId, Theme } from './types';
import { TerminalApp } from './components/apps/TerminalApp';
import { FileManagerApp } from './components/apps/FileManagerApp';
import { AiAssistantApp } from './components/apps/AiAssistantApp';
import { SystemMonitorApp } from './components/apps/SystemMonitorApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { NotepadApp } from './components/apps/NotepadApp';
import { AudioPlayerApp } from './components/apps/AudioPlayerApp';
import { VideoPlayerApp } from './components/apps/VideoPlayerApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { DevToolsApp } from './components/apps/DevToolsApp';
import { CalendarApp } from './components/apps/CalendarApp';
import { PaintApp } from './components/apps/PaintApp';
import { TicTacToeApp } from './components/apps/TicTacToeApp';
import { ImageViewerApp } from './components/apps/ImageViewerApp';
import { DocumentReaderApp } from './components/apps/DocumentReaderApp';
import { TodoListApp } from './components/apps/TodoListApp';
import { SpreadsheetApp } from './components/apps/SpreadsheetApp';
import { PresentationApp } from './components/apps/PresentationApp';

// Wallpaper
export const WALLPAPER_URL = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop";

export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Njobvu Dark',
  accentColor: 'blue',
  windowRadius: 'md',
  mode: 'dark'
};

export const APPS: Record<AppId, AppDefinition> = {
  [AppId.TERMINAL]: {
    id: AppId.TERMINAL,
    name: 'Terminal',
    icon: Terminal,
    component: TerminalApp,
    defaultWidth: 600,
    defaultHeight: 400,
    category: 'System'
  },
  [AppId.FILE_MANAGER]: {
    id: AppId.FILE_MANAGER,
    name: 'File Manager',
    icon: FolderOpen,
    component: FileManagerApp,
    defaultWidth: 750,
    defaultHeight: 500,
    category: 'System'
  },
  [AppId.NOTEPAD]: {
    id: AppId.NOTEPAD,
    name: 'Text Editor',
    icon: FileText,
    component: NotepadApp,
    defaultWidth: 600,
    defaultHeight: 450,
    category: 'Accessories'
  },
  [AppId.PAINT]: {
    id: AppId.PAINT,
    name: 'Paint',
    icon: Brush,
    component: PaintApp,
    defaultWidth: 800,
    defaultHeight: 600,
    category: 'Accessories'
  },
  [AppId.AI_ASSISTANT]: {
    id: AppId.AI_ASSISTANT,
    name: 'Njobvu AI',
    icon: Bot,
    component: AiAssistantApp,
    defaultWidth: 450,
    defaultHeight: 650,
    category: 'Accessories'
  },
  [AppId.TODO_LIST]: {
    id: AppId.TODO_LIST,
    name: 'To-Do List',
    icon: ListTodo,
    component: TodoListApp,
    defaultWidth: 400,
    defaultHeight: 600,
    category: 'Office'
  },
  [AppId.SYSTEM_MONITOR]: {
    id: AppId.SYSTEM_MONITOR,
    name: 'Task Manager',
    icon: Activity,
    component: SystemMonitorApp,
    defaultWidth: 600,
    defaultHeight: 450,
    category: 'System'
  },
  [AppId.AUDIO_PLAYER]: {
    id: AppId.AUDIO_PLAYER,
    name: 'Music Player',
    icon: Music,
    component: AudioPlayerApp,
    defaultWidth: 400,
    defaultHeight: 500,
    category: 'Multimedia'
  },
  [AppId.VIDEO_PLAYER]: {
    id: AppId.VIDEO_PLAYER,
    name: 'Video Player',
    icon: Video,
    component: VideoPlayerApp,
    defaultWidth: 800,
    defaultHeight: 500,
    category: 'Multimedia'
  },
  [AppId.IMAGE_VIEWER]: {
    id: AppId.IMAGE_VIEWER,
    name: 'Image Viewer',
    icon: Image,
    component: ImageViewerApp,
    defaultWidth: 700,
    defaultHeight: 500,
    category: 'Multimedia'
  },
  [AppId.DOCUMENT_READER]: {
    id: AppId.DOCUMENT_READER,
    name: 'Njobvu Writer',
    icon: BookOpen,
    component: DocumentReaderApp,
    defaultWidth: 900,
    defaultHeight: 650,
    category: 'Office'
  },
  [AppId.SPREADSHEET]: {
    id: AppId.SPREADSHEET,
    name: 'Njobvu Sheets',
    icon: Table,
    component: SpreadsheetApp,
    defaultWidth: 900,
    defaultHeight: 650,
    category: 'Office'
  },
  [AppId.PRESENTATION]: {
    id: AppId.PRESENTATION,
    name: 'Njobvu Slides',
    icon: Presentation,
    component: PresentationApp,
    defaultWidth: 900,
    defaultHeight: 650,
    category: 'Office'
  },
  [AppId.CALCULATOR]: {
    id: AppId.CALCULATOR,
    name: 'Calculator',
    icon: Calculator,
    component: CalculatorApp,
    defaultWidth: 320,
    defaultHeight: 450,
    category: 'Accessories'
  },
  [AppId.CALENDAR]: {
    id: AppId.CALENDAR,
    name: 'Calendar',
    icon: CalendarIcon,
    component: CalendarApp,
    defaultWidth: 600,
    defaultHeight: 500,
    category: 'Office'
  },
  [AppId.DEV_TOOLS]: {
    id: AppId.DEV_TOOLS,
    name: 'Dev Tools',
    icon: Code,
    component: DevToolsApp,
    defaultWidth: 700,
    defaultHeight: 500,
    category: 'Development'
  },
  [AppId.TICTACTOE]: {
    id: AppId.TICTACTOE,
    name: 'Tic Tac Toe',
    icon: Gamepad2,
    component: TicTacToeApp,
    defaultWidth: 300,
    defaultHeight: 380,
    category: 'Games'
  },
  [AppId.SETTINGS]: {
    id: AppId.SETTINGS,
    name: 'Settings',
    icon: Settings,
    component: SettingsApp,
    defaultWidth: 750,
    defaultHeight: 550,
    singleton: true,
    category: 'System'
  },
  [AppId.ABOUT]: {
    id: AppId.ABOUT,
    name: 'About',
    icon: Info,
    component: () => (
      <div className="p-6 text-gray-200 flex flex-col items-center justify-center h-full text-center bg-gray-900">
        <h1 className="text-2xl font-bold mb-2">Njobvu OS</h1>
        <p className="mb-4 text-gray-400">Version 3.7.0 (Ultimate)</p>
        <p className="text-sm">A robust web-based operating system environment.</p>
        <p className="text-xs text-gray-500 mt-4">© 2025 Njobvu Systems</p>
      </div>
    ),
    defaultWidth: 350,
    defaultHeight: 250,
    category: 'System'
  },
};
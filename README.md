
# Njobvu OS

**Njobvu OS** is a cutting-edge, web-based operating system simulation built with **React 19**, **TypeScript**, and **Tailwind CSS**. It delivers a highly immersive desktop experience inspired by Linux (XFCE) and Windows, featuring a persistent virtual file system, robust window management, and integrated AI capabilities.

## 🚀 Key Features

### 🖥️ Desktop Environment
- **Responsive Design**: Fully responsive interface adapting to **Mobile**, **Tablet**, and **Desktop** screens.
- **Window Management**: Advanced windowing system with **Windows 11-style Snap Layouts**, dragging, resizing, minimizing, and maximizing.
- **Taskbar**: Functional taskbar with a **Whisker-style Start Menu**, task switcher, interactive system tray, and **Show Desktop** button.
- **Global Search**: "Spotlight" style quick launcher (`Alt + Space`) for apps, files, and math calculations.
- **Widgets**: Desktop widgets for Clock, Calendar, and Sticky Notes.
- **Theming**: Dark/Light mode, accent colors, and **Custom Wallpaper Support**.
- **Context Menus**: Custom right-click menus for Desktop, File Manager, Text Editor, and Document Reader.
- **Screensaver**: Bouncing logo screensaver active after configurable idle time.

### 📂 Virtual File System (VFS)
- **Persistence**: File system state is saved locally and synced to the cloud (Supabase) for authenticated users.
- **Operations**: Create, read, update, delete, rename, move, and copy files/folders.
- **Drag & Drop**: Intuitive drag-and-drop support for moving files between directories.
- **Clipboard**: Copy/Cut/Paste files and folders.

### 🛠️ Built-in Applications
- **Terminal**: ZSH-like shell with command history, file ops (`cp`, `mv`, `rm`), `nano` text editor, `grep`, `ping` simulation, `uptime`, and `matrix` effect.
- **File Manager**: Explorer with Grid/List views, breadcrumb navigation, search, file previews, and context actions.
- **Web Browser**: Tabbed browsing simulation with an address bar and **KVM (Fullscreen) Mode** for immersive web usage.
- **Text Editor (Notepad)**: Rich text editing with Find/Replace, Undo/Redo, font customization, and line numbers.
- **To-Do List**: Task management application with categories (All/Active/Completed), persistence, and progress tracking.
- **Document Reader**: Viewer and editor for documents and slides, featuring rich text formatting and presentation mode.
- **Njobvu AI**: Integrated AI assistant powered by Google Gemini 2.5 Flash.
- **Media Suite**: Audio and Video players with support for local file playback and playlists.
- **Paint**: Fully functional drawing application with brushes, colors, and save-to-VFS capability.
- **System Monitor**: Real-time visualization of simulated CPU, RAM, and Network resources.
- **Settings**: Comprehensive control panel for users, privacy, display (resolution, timeout), and appearance.
- **Games**: Tic-Tac-Toe.
- **Developer Tools**: JavaScript code scratchpad and console.

### ☁️ Cloud Dashboard
- **Identity Management**: User authentication and profile management via Supabase.
- **Virtual Machines**: Dashboard interface to manage "virtual instances".
- **Storage Analytics**: Visual breakdown of storage usage.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google GenAI SDK (Gemini 2.5 Flash)
- **Backend/Storage**: Supabase (Auth & Database), Cloudflare Functions (API Proxy)

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/njobvu-os.git
    cd njobvu-os
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file or configure your deployment environment with:
    - `GOOGLE_API_KEY`: For AI features.
    - Supabase URL & Key (configured in `services/supabaseClient.ts`).

4.  **Database Setup**
    Run the SQL commands found in `sql.txt` in your Supabase SQL Editor to set up tables and policies.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📝 License

This project is licensed under the MIT License.

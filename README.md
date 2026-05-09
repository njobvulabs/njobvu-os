
# Njobvu OS

**Njobvu OS** is a cutting-edge, web-based operating system simulation built with **React 19**, **TypeScript**, and **Tailwind CSS**. It delivers a highly immersive, privacy-focused desktop experience with a persistent virtual file system and robust window management.

[**🌐 Live Demo**](https://njobvu-os.pages.dev/)

## 🚀 Key Features

### 🖥️ Desktop Environment
- **Guest-First Experience**: No login required. Boots directly into a fully functional workspace.
- **Responsive Design**: Fully responsive interface transition between **Mobile**, **Tablet**, and **Desktop**.
- **Window Management**: Advanced windowing system with dragging, resizing, minimizing, and maximizing.
- **Taskbar**: Functional taskbar with a **Start Menu**, task switcher, interactive system tray, and **Show Desktop** button.
- **Global Search**: "Spotlight" style launcher (`Alt + Space` or `Alt + F2`) for apps, files, and math calculations.
- **Widgets**: Desktop shortcuts and information widgets.
- **Theming**: Dark/Light mode and **Custom Wallpaper Support**.
- **Context Menus**: Custom right-click menus for Desktop, File Manager, and more.

### 📂 Virtual File System (VFS)
- **Local Persistence**: File system state is saved locally in your browser.
- **Operations**: Create, read, update, delete, rename, move, and copy files/folders.
- **Drag & Drop**: Intuitive support for moving files between directories in the File Manager.
- **Guest Permissions**: Pre-configured folder structure with protected system paths.

### 🛠️ Built-in Applications
- **File Manager**: Explorer with **Breadcrumb Navigation**, sidebar for quick places (**Home, Documents, Pictures**), grid/list views, and file previews.
- **Terminal**: ZSH-like shell with command history, file ops (`cp`, `mv`, `rm`), `nano` text editor, `grep`, and system utilities.
- **Web Browser**: Tabbed browsing simulation with **KVM Mode** for immersive usage.
- **Notepad**: Text editing with Find/Replace, font customization, and auto-save.
- **To-Do List**: Task management with categories and progress tracking.
- **Document Reader**: Viewer for documents and slides with presentation mode.
- **Media Suite**: Audio and Video players with local file support.
- **Paint**: Drawing application with brushes, colors, and direct save to VFS.
- **System Monitor**: Real-time visualization of simulated CPU and RAM resources.
- **Settings**: Control panel for display, timeout, and appearance.
- **Games**: Classic Tic-Tac-Toe.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Motion

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

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📝 License

This project is licensed under the MIT License.

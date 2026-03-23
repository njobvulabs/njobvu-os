
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, X, Filter, Save, ListTodo, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { FSNode } from '../../types';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export const TodoListApp: React.FC = () => {
  const { fs, createFile, updateFileContent, addNotification, theme } = useOS();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');
  const [newTask, setNewTask] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const FILENAME = 'todo.json';

  // Load Tasks from FS
  useEffect(() => {
    let targetFileId: string | null = null;
    
    // Find guest home
    const nodes = Object.values(fs.nodes) as FSNode[];
    const guestHome = nodes.find(n => n.name === 'guest' && n.type === 'dir');
    
    if (guestHome && guestHome.children) {
        const found = guestHome.children.map(id => fs.nodes[id]).find(n => n.name === FILENAME);
        if (found) {
            targetFileId = found.id;
        } else {
            // Create if not exists
            createFile(guestHome.id, FILENAME, JSON.stringify([]));
        }
    }

    if (targetFileId) {
        setFileId(targetFileId);
        const content = fs.nodes[targetFileId].content;
        try {
            if (content) {
                setTasks(JSON.parse(content));
            }
        } catch (e) {
            console.error("Failed to parse todo.json", e);
            setTasks([]);
        }
    }
  }, [fs.nodes]); 

  // Save Tasks to FS
  const saveTasks = (newTasks: Todo[]) => {
      setTasks(newTasks);
      if (fileId) {
          updateFileContent(fileId, JSON.stringify(newTasks));
      }
  };

  const addTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTask.trim()) return;
      
      const task: Todo = {
          id: Math.random().toString(36).substr(2, 9),
          text: newTask,
          completed: false,
          createdAt: Date.now()
      };
      
      const updated = [task, ...tasks]; // Add to top
      saveTasks(updated);
      setNewTask('');
      // Auto select the new task
      setSelectedTaskId(task.id);
  };

  const toggleTask = (id: string) => {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveTasks(updated);
  };

  const deleteTask = (id: string) => {
      const updated = tasks.filter(t => t.id !== id);
      saveTasks(updated);
      if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const clearCompleted = () => {
      const updated = tasks.filter(t => !t.completed);
      saveTasks(updated);
      addNotification('To-Do List', 'Cleared completed tasks', 'info');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      const isInputFocused = (e.target as HTMLElement).tagName === 'INPUT';

      if (e.key === 'Delete' && selectedTaskId && !isInputFocused) {
          deleteTask(selectedTaskId);
      }

      if (e.key === 'Enter' && e.ctrlKey && selectedTaskId) {
          toggleTask(selectedTaskId);
      }
  };

  const getProcessedTasks = () => {
      let result = tasks.filter(t => {
          if (filter === 'active') return !t.completed;
          if (filter === 'completed') return t.completed;
          return true;
      });

      result.sort((a, b) => {
          if (sortBy === 'alpha') return a.text.localeCompare(b.text);
          return b.createdAt - a.createdAt; // Date Descending (Newest first)
      });

      return result;
  };

  const filteredTasks = getProcessedTasks();
  const activeCount = tasks.filter(t => !t.completed).length;
  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  const isDark = theme.mode === 'dark';
  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-[#f5f5f5]';
  const textMain = isDark ? 'text-gray-200' : 'text-gray-800';
  const bgInput = isDark ? 'bg-[#2b2b2b]' : 'bg-white';
  const borderCol = isDark ? 'border-[#3c3c3c]' : 'border-[#e0e0e0]';
  const itemSelected = isDark ? 'ring-1 ring-blue-500 bg-[#2b2b2b]' : 'ring-1 ring-blue-500 bg-blue-50';

  return (
    <div 
        className={`flex flex-col h-full ${bgMain} ${textMain} font-sans outline-none`} 
        tabIndex={0} 
        onKeyDown={handleKeyDown}
        onClick={() => setIsSortMenuOpen(false)}
    >
        {/* Header */}
        <div className={`p-6 pb-2 ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-transparent' : 'bg-gradient-to-br from-blue-50 to-transparent'}`}>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <ListTodo className="text-blue-500" /> My Tasks
            </h1>
            <p className="text-sm opacity-60 mb-4">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs mb-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="font-bold w-8 text-right">{progress}%</span>
            </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-2">
            <form onSubmit={addTask} className="relative group">
                <input 
                    type="text" 
                    placeholder="Add a new task..." 
                    className={`w-full ${bgInput} border ${borderCol} rounded-xl py-3 pl-4 pr-12 outline-none focus:border-blue-500 transition-all shadow-sm`}
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={!newTask.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </form>
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center justify-between px-6 py-2 text-sm border-b border-transparent">
            <div className="flex gap-2">
                {(['all', 'active', 'completed'] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsSortMenuOpen(!isSortMenuOpen); }}
                        className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <ArrowUpDown size={12} /> {sortBy === 'date' ? 'Date' : 'Name'} <ChevronDown size={10} />
                    </button>
                    
                    {isSortMenuOpen && (
                        <div className={`absolute top-full right-0 mt-1 w-32 py-1 rounded-lg shadow-xl border z-20 ${isDark ? 'bg-[#252525] border-[#3c3c3c]' : 'bg-white border-gray-200'}`}>
                            <button 
                                onClick={() => setSortBy('date')} 
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-500 hover:text-white ${sortBy === 'date' ? 'font-bold text-blue-500' : ''}`}
                            >
                                Date (Newest)
                            </button>
                            <button 
                                onClick={() => setSortBy('alpha')} 
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-500 hover:text-white ${sortBy === 'alpha' ? 'font-bold text-blue-500' : ''}`}
                            >
                                Name (A-Z)
                            </button>
                        </div>
                    )}
                </div>

                {tasks.some(t => t.completed) && (
                    <button onClick={clearCompleted} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1">
                        Clear Done
                    </button>
                )}
            </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
            {filteredTasks.length === 0 ? (
                <div className="text-center opacity-40 mt-10 flex flex-col items-center">
                    <CheckCircle size={48} className="mb-2" />
                    <p>No tasks found</p>
                </div>
            ) : (
                filteredTasks.map(task => (
                    <div 
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${selectedTaskId === task.id ? itemSelected : `${borderCol} ${isDark ? 'bg-[#2b2b2b] hover:bg-[#333]' : 'bg-white hover:bg-gray-50 shadow-sm'}`}`}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                            className={`shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}
                        >
                            {task.completed ? <CheckCircle size={20} fill="currentColor" className="text-white dark:text-[#2b2b2b]" /> : <Circle size={20} />}
                        </button>
                        
                        <span className={`flex-1 truncate select-none ${task.completed ? 'line-through opacity-50' : ''}`}>
                            {task.text}
                        </span>

                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            )}
        </div>

        {/* Footer Stats */}
        <div className={`px-6 py-3 text-xs opacity-50 border-t ${borderCol} flex justify-between`}>
            <span>{activeCount} active task{activeCount !== 1 ? 's' : ''}</span>
            <div className="flex gap-4">
                <span>Enter: Add</span>
                <span>Ctrl+Enter: Toggle</span>
                <span>Del: Delete</span>
            </div>
        </div>
    </div>
  );
};

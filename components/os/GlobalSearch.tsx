
import React, { useState, useEffect, useRef } from 'react';
import { Search, Calculator, AppWindow, FileText, ArrowRight, X } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { APPS } from '../../constants';
import { AppId } from '../../types';

type SearchResult = {
  id: string;
  type: 'app' | 'file' | 'math' | 'action';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action: () => void;
};

export const GlobalSearch: React.FC = () => {
  const { openApp, fs, openApp: launchApp, activeWindowId, closeWindow, logoutUser, shutdownSystem, rebootSystem, isSearchOpen, toggleSearch } = useOS();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle with Alt + Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        toggleSearch();
        setQuery('');
        setSelectedIndex(0);
      }
      if (isSearchOpen && e.key === 'Escape') {
        toggleSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, toggleSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        toggleSearch(false);
      }
    };
    if (isSearchOpen) window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, toggleSearch]);

  // Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Math Calculation
    if (/^[0-9+\-*/().\s]+$/.test(query)) {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(query);
        if (!isNaN(result)) {
           searchResults.push({
             id: 'math',
             type: 'math',
             title: String(result),
             subtitle: `Expression: ${query}`,
             icon: <Calculator size={20} className="text-orange-500" />,
             action: () => { navigator.clipboard.writeText(String(result)); toggleSearch(false); }
           });
        }
      } catch (e) { /* ignore invalid math */ }
    }

    // 2. Apps
    Object.values(APPS).forEach(app => {
      if (app.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: `app-${app.id}`,
          type: 'app',
          title: app.name,
          subtitle: 'Application',
          icon: <AppWindow size={20} className="text-blue-500" />,
          action: () => { openApp(app.id); toggleSearch(false); }
        });
      }
    });

    // 3. System Commands
    if ('logout'.includes(lowerQuery)) searchResults.push({ id: 'cmd-logout', type: 'action', title: 'Log Out', icon: <ArrowRight size={20}/>, action: logoutUser });
    if ('shutdown'.includes(lowerQuery)) searchResults.push({ id: 'cmd-shutdown', type: 'action', title: 'Shut Down', icon: <X size={20}/>, action: shutdownSystem });
    if ('restart'.includes(lowerQuery)) searchResults.push({ id: 'cmd-restart', type: 'action', title: 'Restart', icon: <ArrowRight size={20}/>, action: rebootSystem });

    // 4. Files
    const searchFiles = (nodeId: string) => {
      const node = fs.nodes[nodeId];
      if (node.name.toLowerCase().includes(lowerQuery) && node.type === 'file') {
        searchResults.push({
          id: `file-${node.id}`,
          type: 'file',
          title: node.name,
          subtitle: 'File',
          icon: <FileText size={20} className="text-gray-400" />,
          action: () => { 
             // Open Notepad for text files by default logic simulation
             if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
                 openApp(AppId.NOTEPAD, { fileId: node.id });
             } else {
                 openApp(AppId.FILE_MANAGER); // Fallback
             }
             toggleSearch(false); 
          }
        });
      }
      if (node.children) {
        node.children.forEach(childId => searchFiles(childId));
      }
    };
    searchFiles(fs.rootId);

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);

  }, [query, fs, openApp, logoutUser, shutdownSystem, rebootSystem, toggleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[20vh] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        ref={containerRef}
        className="w-[600px] max-w-[90vw] bg-[#2b2b2b] border border-[#444] rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-200"
      >
        <div className="flex items-center p-4 border-b border-[#3c3c3c]">
           <Search size={24} className="text-gray-400 mr-3" />
           <input 
             ref={inputRef}
             className="flex-1 bg-transparent border-none outline-none text-xl placeholder-gray-500 text-white h-8"
             placeholder="Search apps, files, or do math..."
             value={query}
             onChange={e => setQuery(e.target.value)}
             onKeyDown={handleKeyDown}
             autoFocus
           />
           <div className="text-xs text-gray-500 border border-[#444] px-2 py-1 rounded">Esc to close</div>
        </div>

        {results.length > 0 && (
          <div className="py-2">
            {results.map((result, index) => (
              <div 
                key={result.id}
                className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors ${index === selectedIndex ? 'bg-[#4a90d9] text-white' : 'hover:bg-[#3c3c3c] text-gray-300'}`}
                onClick={() => result.action()}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-[#1a1a1a]'}`}>
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.title}</div>
                  {result.subtitle && <div className={`text-xs truncate ${index === selectedIndex ? 'text-blue-100' : 'text-gray-500'}`}>{result.subtitle}</div>}
                </div>
                {index === selectedIndex && <ArrowRight size={16} className="opacity-50" />}
              </div>
            ))}
          </div>
        )}
        
        {query && results.length === 0 && (
           <div className="p-8 text-center text-gray-500 italic">
              No results found for "{query}"
           </div>
        )}
        
        {!query && (
           <div className="p-2 bg-[#252525] text-xs text-gray-500 flex justify-between px-4">
              <span>ProTip: Type "= 50 * 24" to calculate</span>
              <span>Alt + Space to toggle</span>
           </div>
        )}
      </div>
    </div>
  );
};

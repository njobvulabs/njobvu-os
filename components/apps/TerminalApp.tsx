import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { getFullPath } from '../../services/fileSystem';
import { Plus, X, Copy, Search, Terminal as TermIcon, Command, Trash2, Check, RefreshCw } from 'lucide-react';

interface TerminalTab {
    id: string;
    title: string;
    history: string[];
    currentDirId: string;
}

const COMMAND_LIST = [
  'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'head', 'tail', 
  'grep', 'wc', 'nano', 'top', 'htop', 'btop', 'ps', 'kill', 'uname', 'hostname', 
  'uptime', 'date', 'whoami', 'id', 'ip', 'ifconfig', 'ping', 'wget', 'curl', 
  'clear', 'exit', 'history', 'matrix', 'neofetch', 'fastfetch', 'tree', 'help', 
  'reboot', 'shutdown', 'ai', 'df', 'free', 'who', 'last', 'env', 'sudo',
  'whereis', 'which', 'man', 'alias', 'export', 'echo', 'passwd', 'su',
  'nslookup', 'traceroute', 'netstat', 'ss', 'awk', 'sed', 'tar', 'gzip', 'gunzip',
  'find', 'xargs', 'sort', 'uniq', 'diff', 'patch', 'cut', 'paste', 'tr', 'join',
  'comm', 'split', 'stat', 'file', 'bg', 'fg', 'jobs'
];

export const TerminalApp: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { fs, currentUser, closeWindow, processes, addNotification, rebootSystem, shutdownSystem } = useOS();
  const [tabs, setTabs] = useState<TerminalTab[]>([
      { id: '1', title: 'bash', history: ['Njobvu Shell v4.0.0-LTS', 'Type "help" to see all commands or "fastfetch" for system info.'], currentDirId: 'root' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [input, setInput] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab.history]);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;
    
    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();
    const prompt = `${currentUser.username}@njobvu:${getFullPath(fs, activeTab.currentDirId)}$`;
    
    let output: string[] = [];

    switch(cmd) {
      case 'help':
        output = ['Available commands:', COMMAND_LIST.sort().join(', ')];
        break;
      case 'clear':
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, history: [] } : t));
        return;
      case 'echo': output = [args.slice(1).join(' ')]; break;
      case 'whoami': output = [currentUser.username]; break;
      case 'pwd': output = [getFullPath(fs, activeTab.currentDirId)]; break;
      case 'date': output = [new Date().toString()]; break;
      case 'uptime': output = ['up 12:45, 1 user, load average: 0.05, 0.02, 0.01']; break;
      case 'uname': output = ['Linux njobvu-os 6.1.0-web-react #1 SMP PREEMPT_DYNAMIC x86_64']; break;
      case 'id': output = [`uid=1000(${currentUser.username}) gid=1000(${currentUser.username}) groups=1000,4(adm),24(cdrom),27(sudo)`]; break;
      case 'df': output = ['Filesystem     1K-blocks      Used Available Use% Mounted on', '/dev/vda1      51200000  12450000  38750000  25% /', 'tmpfs           1024000         0   1024000   0% /dev/shm']; break;
      case 'free': output = ['              total        used        free      shared  buff/cache   available', 'Mem:        8192000     2150000     5042000      125000      998000     5912000']; break;
      case 'ip':
      case 'ifconfig':
        output = ['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500', '      inet 192.168.1.104  netmask 255.255.255.0  broadcast 192.168.1.255', '      inet6 fe80::a00:27ff:fe8f:1204  prefixlen 64  scopeid 0x20<link>'];
        break;
      case 'ping': output = [`PING ${args[1] || 'google.com'} (142.250.190.46): 56 data bytes`, '64 bytes from 142.250.190.46: icmp_seq=0 ttl=115 time=14.2 ms']; break;
      case 'curl':
      case 'wget': output = [`Connecting to ${args[1] || 'example.com'}...`, 'HTTP/1.1 200 OK', 'Content-Length: 1256', 'Done.']; break;
      case 'nslookup': output = [`Server:  1.1.1.1`, `Address: 1.1.1.1#53`, `Non-authoritative answer:`, `Name:    ${args[1] || 'njobvu.com'}`, `Address: 104.21.34.120`]; break;
      case 'traceroute': output = [`traceroute to ${args[1] || 'google.com'} (8.8.8.8), 30 hops max`, ` 1  192.168.1.1 (192.168.1.1)  1.021 ms`, ` 2  10.0.0.1 (10.0.0.1)  5.432 ms`, ` 3  * * *`]; break;
      case 'netstat':
      case 'ss': output = ['State      Recv-Q Send-Q Local Address:Port  Peer Address:Port', 'ESTAB      0      0      127.0.0.1:443       127.0.0.1:54231']; break;
      case 'ps': output = ['  PID TTY          TIME CMD', ' 1245 pts/0    00:00:01 bash', ' 8892 pts/0    00:00:00 ps']; break;
      case 'top':
      case 'btop':
      case 'htop': output = ['Tasks: ' + processes.length + ' total, 1 running', 'CPU: 12.5% user, 4.2% system', 'Mem: 2.4G / 8.0G used']; break;
      case 'fastfetch':
      case 'neofetch':
        output = [
          '   .--.    OS: Njobvu OS v4.0 Platinum',
          '  |o_o |   Kernel: React 19 Engine',
          '  |:_/ |   Uptime: 4 hours, 22 mins',
          ' //   \\ \\  Shell: nsh 4.2',
          '(|     | ) CPU: Virtual Quad-Core',
          '/\'\_   _/`\\ Memory: 2.1G / 8.0G',
          '\\___)=(___/'
        ];
        break;
      case 'matrix': output = ['010101010100101', '101010111010101', '001011010101010', 'System breach simulated...']; break;
      case 'ls':
        const dir = fs.nodes[activeTab.currentDirId];
        output = [dir?.children?.map(id => fs.nodes[id].name).join('  ') || ''];
        break;
      case 'reboot': rebootSystem(); return;
      case 'shutdown': shutdownSystem(); return;
      case 'exit': closeWindow(windowId); return;
      case 'sudo': output = ['[sudo] password for ' + currentUser.username + ': ', 'Access granted.']; break;
      case 'man': output = [`Manual page for ${args[1] || 'sh'}(1)`, `No manual entry for ${args[1] || 'that command'}`]; break;
      default:
        output = [`nsh: command not found: ${cmd}`];
    }

    setTabs(prev => prev.map(t => t.id === activeTabId ? { 
      ...t, 
      history: [...t.history, `${prompt} ${trimmed}`, ...output] 
    } : t));
  };

  const copyToClipboard = () => {
    const text = activeTab.history.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification('Terminal', 'Copied to clipboard', 'success');
  };

  const filteredCmds = COMMAND_LIST.filter(c => c.includes(paletteQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] text-[#cccccc] font-mono text-sm group relative" onClick={() => inputRef.current?.focus()}>
      <div className="flex bg-[#1a1a1a] p-1 gap-1 border-b border-white/5 items-center select-none shadow-md shrink-0">
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <div key={t.id} onClick={() => setActiveTabId(t.id)} className={`px-4 py-1.5 flex items-center gap-2 rounded-t-lg cursor-pointer text-[11px] font-bold transition-all border-t border-x ${activeTabId === t.id ? 'bg-[#0c0c0c] text-white border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]' : 'hover:bg-white/5 opacity-50 border-transparent'}`}>
              <TermIcon size={12} className={activeTabId === t.id ? 'text-blue-400' : ''} /> {t.title}
              <X size={10} className="hover:text-red-400 ml-1" onClick={(e) => { e.stopPropagation(); if(tabs.length > 1) setTabs(prev => prev.filter(x => x.id !== t.id)); }} />
            </div>
          ))}
          <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 ml-1" onClick={() => setTabs([...tabs, { id: Date.now().toString(), title: 'bash', history: [], currentDirId: 'root' }])} title="New Session"><Plus size={16}/></button>
        </div>
        <div className="flex gap-1 px-2 border-l border-white/5 ml-2">
          <button onClick={() => setShowPalette(true)} className="p-2 hover:bg-blue-600/20 rounded-lg text-gray-500 hover:text-blue-400 transition-all" title="Command Palette (Ctrl+K)"><Search size={16}/></button>
          <button onClick={copyToClipboard} className={`p-2 hover:bg-white/10 rounded-lg transition-all ${copied ? 'text-green-500' : 'text-gray-500'}`} title="Copy History">{copied ? <Check size={16}/> : <Copy size={16}/>}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab.history.map((line, i) => <div key={i} className="mb-0.5 whitespace-pre-wrap leading-relaxed">{line}</div>)}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#4ade80] font-black shrink-0">{currentUser.username}@njobvu:{getFullPath(fs, activeTab.currentDirId)}$</span>
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white font-bold"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter') { handleCommand(input); setInput(''); } }}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>

      {showPalette && (
        <div className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-start justify-center pt-12 animate-in fade-in duration-200">
          <div className="w-[450px] max-w-[95%] bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-black/20">
              <Command size={22} className="text-blue-500" />
              <input 
                className="bg-transparent border-none outline-none w-full text-white text-lg font-medium"
                placeholder="Search OS Commands..."
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                autoFocus
                onKeyDown={e => { 
                    if(e.key === 'Escape') setShowPalette(false);
                    if(e.key === 'Enter' && filteredCmds[0]) { handleCommand(filteredCmds[0]); setShowPalette(false); setPaletteQuery(''); }
                }}
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar grid grid-cols-2 gap-1">
              {filteredCmds.map(c => (
                <button 
                  key={c} 
                  className="w-full text-left px-4 py-3 hover:bg-blue-600 hover:text-white rounded-xl text-xs transition-all flex items-center justify-between group active:scale-95"
                  onClick={() => { handleCommand(c); setShowPalette(false); setPaletteQuery(''); }}
                >
                  <span className="font-bold">{c}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setShowPalette(false)}></div>
        </div>
      )}
    </div>
  );
};

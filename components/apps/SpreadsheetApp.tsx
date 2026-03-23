import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Table, Plus, Trash2, Save, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  X, Activity, BarChart, Undo, Redo, PaintBucket, Type, Grid3X3, 
  AreaChart, PieChart, BarChart3, Percent, DollarSign, Binary,
  Filter, List, ChevronDown, Wand2, Sigma, Download, HelpCircle, Monitor,
  Copy, Clipboard, ZoomIn, ZoomOut, Database, Layout as LayoutIcon,
  MoveHorizontal, Maximize, SortAsc, SortDesc, CheckSquare, Zap, Image as ImageIcon
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface CellStyle {
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
    bg?: string;
    color?: string;
    border?: boolean;
}

interface CellData {
  value: string;
  formula?: string;
  style?: CellStyle;
}

type TabId = 'File' | 'Home' | 'Insert' | 'Layout' | 'Formula' | 'Data' | 'View' | 'AI';

export const SpreadsheetApp: React.FC<{ windowId: string; fileId?: string }> = ({ windowId, fileId }) => {
  const { addNotification, theme, fs, updateFileContent, createFile } = useOS();
  const [data, setData] = useState<Record<string, CellData>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('Home');
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  
  const rowCount = 100;
  const colCount = 26;
  const colsArray = useMemo(() => Array.from({ length: colCount }, (_, i) => String.fromCharCode(65 + i)), []);
  const rowsArray = useMemo(() => Array.from({ length: rowCount }, (_, i) => i + 1), []);

  const evaluateFormula = (formula: string, currentData: Record<string, CellData>): string => {
    if (!formula.startsWith('=')) return formula;
    try {
      let expression = formula.substring(1).toUpperCase();
      const resolved = expression.replace(/[A-Z]+[0-9]+/g, (match) => {
        const val = parseFloat(currentData[match]?.value || '0');
        return isNaN(val) ? '0' : val.toString();
      });
      return String(new Function(`return ${resolved}`)());
    } catch { return "#VALUE!"; }
  };

  const updateCell = (id: string, val: string) => {
    setData(prev => {
      const isFormula = val.startsWith('=');
      const newData = { ...prev, [id]: { ...prev[id], value: isFormula ? evaluateFormula(val, prev) : val, formula: isFormula ? val : undefined } };
      Object.keys(newData).forEach(key => { if (newData[key].formula) newData[key].value = evaluateFormula(newData[key].formula!, newData); });
      return newData;
    });
  };

  const applyStyle = (style: Partial<CellStyle>) => {
    if (!selectedCell) return;
    setData(prev => ({ ...prev, [selectedCell]: { ...prev[selectedCell], style: { ...(prev[selectedCell]?.style || {}), ...style } } }));
  };

  const handleSave = () => {
    const content = JSON.stringify(data);
    if (fileId) { updateFileContent(fileId, content); addNotification('Sheets', 'Workbook Saved', 'success'); }
    else { const n = prompt("Workbook Name:"); if(n) createFile('root', n.endsWith('.nsht') ? n : n + '.nsht', content); }
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#1a1a1a] text-gray-200' : 'bg-white text-gray-800'} font-sans text-xs overflow-hidden`}>
      <div className="shrink-0 flex flex-col border-b border-gray-300 z-30 bg-white">
        <div className="h-10 border-b border-gray-200 flex items-center px-4 justify-between">
            <div className="flex items-center gap-3"><div className="bg-green-600 p-1.5 rounded text-white"><Table size={16}/></div><span className="font-bold text-xs uppercase tracking-widest text-gray-600">Njobvu Sheets Pro</span></div>
            <div className="flex gap-1"><ToolBtn icon={<Undo size={14}/>}/><ToolBtn icon={<Redo size={14}/>}/><ToolBtn icon={<Save size={14} className="text-green-600"/>} onClick={handleSave} /></div>
        </div>
        <div className="flex px-4 pt-1 gap-1">
            {(['File', 'Home', 'Insert', 'Layout', 'Formula', 'Data', 'View', 'AI'] as TabId[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-400 hover:bg-gray-50'}`}>{tab}</button>
            ))}
        </div>
        <div className="h-28 bg-[#F9F9F9] border-t border-gray-200 flex items-center px-6 gap-6 overflow-x-auto no-scrollbar">
            {activeTab === 'File' && <><RibbonGroup label="Project"><RibbonBtn icon={<Sigma size={24}/>} label="New" onClick={() => setData({})} /><RibbonBtn icon={<Save size={24}/>} label="Save" onClick={handleSave} /></RibbonGroup><RibbonGroup label="Export"><RibbonBtn icon={<Download size={24}/>} label="CSV" onClick={() => {}} /></RibbonGroup></>}
            {activeTab === 'Home' && <><RibbonGroup label="Clipboard"><RibbonBtn icon={<Copy size={20}/>} label="Copy"/><RibbonBtn icon={<Clipboard size={20}/>} label="Paste"/></RibbonGroup><RibbonGroup label="Font"><div className="flex flex-col gap-2"><div className="flex gap-1"><ToolBtn icon={<Bold size={14}/>} active={data[selectedCell!]?.style?.bold} onClick={() => applyStyle({bold:!data[selectedCell!]?.style?.bold})} /><ToolBtn icon={<Italic size={14}/>} active={data[selectedCell!]?.style?.italic} onClick={() => applyStyle({italic:!data[selectedCell!]?.style?.italic})} /><ToolBtn icon={<Grid3X3 size={14}/>} active={data[selectedCell!]?.style?.border} onClick={() => applyStyle({border:!data[selectedCell!]?.style?.border})} /></div><div className="flex gap-1.5"><div className="relative p-1.5 rounded hover:bg-black/10 border border-gray-300"><PaintBucket size={14}/><input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>applyStyle({bg:e.target.value})} /></div><div className="relative p-1.5 rounded hover:bg-black/10 border border-gray-300"><Type size={14}/><input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>applyStyle({color:e.target.value})} /></div></div></div></RibbonGroup><RibbonGroup label="Alignment"><div className="flex gap-1.5"><ToolBtn icon={<AlignLeft size={16}/>} onClick={()=>applyStyle({align:'left'})}/><ToolBtn icon={<AlignCenter size={16}/>} onClick={()=>applyStyle({align:'center'})}/><ToolBtn icon={<AlignRight size={16}/>} onClick={()=>applyStyle({align:'right'})}/></div></RibbonGroup></>}
            {activeTab === 'Insert' && <><RibbonGroup label="Visuals"><RibbonBtn icon={<BarChart3 size={24}/>} label="Charts" onClick={()=>{setChartType('bar');setShowChart(true);}} /></RibbonGroup><RibbonGroup label="Graphics"><RibbonBtn icon={<ImageIcon size={24}/>} label="Image" onClick={() => {}} /></RibbonGroup></>}
            {activeTab === 'Layout' && <><RibbonGroup label="Page Layout"><RibbonBtn icon={<LayoutIcon size={24}/>} label="Margins" onClick={() => {}} /><RibbonBtn icon={<MoveHorizontal size={24}/>} label="Orientation" onClick={() => {}} /><RibbonBtn icon={<Maximize size={24}/>} label="Size" onClick={() => {}} /></RibbonGroup></>}
            {activeTab === 'Formula' && <><RibbonGroup label="Library"><RibbonBtn icon={<Sigma size={24}/>} label="Sum" onClick={()=>setFormulaBar('=SUM(')}/><RibbonBtn icon={<Zap size={24}/>} label="Logic" onClick={() => {}} /></RibbonGroup></>}
            {activeTab === 'Data' && <><RibbonGroup label="Sort & Filter"><RibbonBtn icon={<SortAsc size={24}/>} label="Sort A-Z" onClick={() => {}} /><RibbonBtn icon={<Filter size={24}/>} label="Filter" onClick={() => {}} /></RibbonGroup><RibbonGroup label="Data Tools"><RibbonBtn icon={<CheckSquare size={24}/>} label="Validation" onClick={() => {}} /><RibbonBtn icon={<Table size={24}/>} label="Pivot Table" onClick={() => {}} /></RibbonGroup><RibbonGroup label="External"><RibbonBtn icon={<Database size={24}/>} label="Get Data" onClick={() => {}} /></RibbonGroup></>}
            {activeTab === 'AI' && <><RibbonGroup label="Analysis"><button onClick={()=>addNotification('AI','Analyzing trends...','info')} className="bg-green-600 text-white flex flex-col items-center justify-center gap-1 p-3 rounded-xl w-32 shadow hover:bg-green-700 transition-all"><Wand2 size={24}/><span className="text-[9px] font-bold">SMART ANALYZE</span></button></RibbonGroup></>}
            {activeTab === 'View' && <><RibbonGroup label="Zoom"><div className="flex items-center gap-4"><button className="p-1 border rounded bg-white" onClick={() => {}}><ZoomOut size={16}/></button><span className="text-xs font-bold">100%</span><button className="p-1 border rounded bg-white" onClick={() => {}}><ZoomIn size={16}/></button></div></RibbonGroup></>}
        </div>
        <div className={`flex items-center px-4 py-1.5 gap-4 border-t border-gray-200`}>
          <div className="w-16 text-center font-black text-green-600 bg-green-50 rounded border border-green-200 py-1 uppercase">{selectedCell || ' '}</div>
          <div className="text-gray-400 font-black italic select-none">fx</div>
          <input className="flex-1 px-4 py-1.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-green-500/30 font-mono text-xs shadow-inner" placeholder="Enter formula (e.g. =A1+B1) or data..." value={formulaBar} onChange={e => { setFormulaBar(e.target.value); if(selectedCell) updateCell(selectedCell, e.target.value); }} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-gray-100 custom-scrollbar relative">
          <div className="inline-block relative">
            <div className="flex sticky top-0 z-20 shadow-sm"><div className="w-12 h-8 border-r border-b shrink-0 bg-gray-200 border-gray-300"></div>{colsArray.map(col => <div key={col} className="w-32 h-8 border-r border-b flex items-center justify-center font-black text-[10px] text-gray-500 uppercase tracking-widest shrink-0 bg-gray-100 border-gray-300">{col}</div>)}</div>
            {rowsArray.map(row => (<div key={row} className="flex"><div className="w-12 h-8 border-r border-b flex items-center justify-center font-black text-[10px] text-gray-400 sticky left-0 z-10 shrink-0 bg-gray-100 border-gray-300">{row}</div>{colsArray.map(col => {const id = `${col}${row}`;const cell = data[id];const isSelected = selectedCell === id;return (<div key={id} onClick={() => { setSelectedCell(id); setFormulaBar(cell?.formula || cell?.value || ''); }} className={`w-32 h-8 border-r border-b px-2 flex items-center cursor-cell overflow-hidden transition-all ${isSelected ? 'ring-2 ring-green-500 z-10 bg-green-50 shadow-inner' : 'bg-white hover:bg-gray-50'} ${cell?.style?.border ? 'border-2 border-black' : ''}`} style={{ fontWeight: cell?.style?.bold ? 'bold' : 'normal', fontStyle: cell?.style?.italic ? 'italic' : 'normal', textAlign: cell?.style?.align || 'left', backgroundColor: cell?.style?.bg, color: cell?.style?.color }}>{cell?.value || ''}</div>);})}</div>))}
          </div>
        </div>
        {showChart && (
          <div className={`w-96 border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-40 bg-white border-gray-200`}>
            <div className="p-4 bg-green-700 text-white font-black uppercase text-[10px] tracking-widest flex justify-between items-center shadow-lg"><div className="flex items-center gap-2"><BarChart size={16}/> Business Analytics</div><button onClick={() => setShowChart(false)}><X size={18}/></button></div>
            <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setChartType('bar')} className={`p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all ${chartType==='bar'?'bg-green-600 text-white border-green-600 shadow-xl scale-105':'hover:bg-black/5 text-gray-400 border-transparent'}`}><BarChart3 size={24}/><span className="text-[9px] font-black">BAR</span></button>
                <button onClick={() => setChartType('pie')} className={`p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all ${chartType==='pie'?'bg-green-600 text-white border-green-600 shadow-xl scale-105':'hover:bg-black/5 text-gray-400 border-transparent'}`}><PieChart size={24}/><span className="text-[9px] font-black">PIE</span></button>
                <button onClick={() => setChartType('line')} className={`p-4 border rounded-2xl flex flex-col items-center gap-3 transition-all ${chartType==='line'?'bg-green-600 text-white border-green-600 shadow-xl scale-105':'hover:bg-black/5 text-gray-400 border-transparent'}`}><AreaChart size={24}/><span className="text-[9px] font-black">LINE</span></button>
              </div>
              <div className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center gap-6 bg-gray-50 border-gray-200 shadow-inner`}>
                 <Activity size={56} className="text-green-600 animate-pulse" />
                 <div><div className="font-black text-xs uppercase tracking-widest text-gray-600">Calculated Visualization</div><p className="text-[10px] text-gray-400 leading-relaxed uppercase mt-3">Visualization data synchronizes instantly from cell ranges A1:D20.</p></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50"><button className="w-full py-4 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-800 transition-all shadow-xl">GENERATE FULL REPORT</button></div>
          </div>
        )}
      </div>
      <div className="h-8 border-t border-gray-300 px-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest opacity-60 bg-white"><div className="flex gap-6 items-center"><span>{Object.keys(data).length} Computed Cells</span><span className="flex items-center gap-1.5"><Filter size={10}/> Data Protocol Valid</span></div><div className="flex gap-4 items-center"><span>SHEETS v4.0</span><span className="text-green-600 font-bold">Workspace Ready</span></div></div>
    </div>
  );
};

const ToolBtn = ({ icon, onClick, active, title, className }: any) => (<button onClick={onClick} title={title} className={`p-1.5 rounded transition-all flex items-center justify-center border border-transparent ${active ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:border-gray-200'} ${className}`}>{icon}</button>);
const RibbonGroup = ({ label, children }: any) => (<div className="flex flex-col items-center px-4 h-full justify-between py-2 border-r border-gray-200 min-w-max last:border-r-0"><div className="flex items-center gap-4 flex-1">{children}</div><span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1 select-none opacity-80">{label}</span></div>);
const RibbonBtn = ({ icon, label, onClick, className }: any) => (<button onClick={onClick} className={`flex flex-col items-center justify-center p-1 rounded-xl hover:bg-green-50 transition-all group active:scale-95 min-w-[70px] ${className}`}><div className="group-hover:scale-110 transition-transform text-gray-600 group-hover:text-green-600">{icon}</div><span className="text-[9px] font-bold uppercase tracking-tighter text-gray-500 group-hover:text-gray-800 mt-1">{label}</span></button>);

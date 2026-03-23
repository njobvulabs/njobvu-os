import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isScientific, setIsScientific] = useState(false);

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (val === '=') {
      try {
        // Safe evaluation simulation
        // eslint-disable-next-line no-eval
        let expr = equation + display;
        expr = expr.replace('π', 'Math.PI').replace('e', 'Math.E');
        // eslint-disable-next-line no-eval
        const res = eval(expr);
        setDisplay(String(Number(res.toFixed(8)))); // Limit decimals
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
      return;
    }
    if (['+', '-', '*', '/'].includes(val)) {
      setEquation(display + val);
      setDisplay('0');
      return;
    }
    
    // Scientific functions
    if (['sin', 'cos', 'tan', 'log', 'sqrt'].includes(val)) {
        try {
            const num = parseFloat(display);
            let res = 0;
            switch(val) {
                case 'sin': res = Math.sin(num); break;
                case 'cos': res = Math.cos(num); break;
                case 'tan': res = Math.tan(num); break;
                case 'log': res = Math.log10(num); break;
                case 'sqrt': res = Math.sqrt(num); break;
            }
            setDisplay(String(Number(res.toFixed(8))));
        } catch(e) {
            setDisplay('Error');
        }
        return;
    }

    if (val === 'π') {
        setDisplay(prev => prev === '0' ? '3.14159' : prev);
        return;
    }

    setDisplay(prev => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const standardButtons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=', ''
  ];

  const scientificButtons = [
      'sin', 'cos', 'tan', 'log',
      'sqrt', 'π', '^', 'e'
  ];

  return (
    <div className="flex flex-col h-full bg-[#202020] p-4 text-white">
       <div className="bg-[#333] h-20 mb-4 rounded flex flex-col items-end justify-center px-4 relative">
          <button 
            onClick={() => setIsScientific(!isScientific)} 
            className={`absolute top-2 left-2 p-1 rounded hover:bg-white/10 ${isScientific ? 'text-blue-400' : 'text-gray-500'}`}
            title="Toggle Scientific Mode"
          >
             <Settings2 size={14} />
          </button>
          <span className="text-xs text-gray-400 h-4">{equation}</span>
          <span className="text-3xl font-mono truncate w-full text-right">{display}</span>
       </div>
       
       <div className="flex gap-2 flex-1">
           {isScientific && (
               <div className="grid grid-cols-2 gap-2 w-1/3">
                   {scientificButtons.map(btn => (
                       <button
                        key={btn}
                        onClick={() => handlePress(btn)}
                        className="rounded bg-[#2a2a2a] text-xs font-bold hover:bg-[#3a3a3a] active:scale-95 transition-all text-blue-300"
                       >
                           {btn}
                       </button>
                   ))}
               </div>
           )}

           <div className={`grid grid-cols-4 gap-2 flex-1 ${isScientific ? 'w-2/3' : 'w-full'}`}>
              {standardButtons.map((btn, i) => (
                 btn === '' ? <div key={i} /> :
                 <button
                   key={i}
                   onClick={() => handlePress(btn)}
                   className={`rounded font-bold text-lg hover:brightness-110 active:scale-95 transition-all
                      ${['C'].includes(btn) ? 'bg-red-500' : ''}
                      ${['='].includes(btn) ? 'bg-blue-600 col-span-2' : ''}
                      ${['+', '-', '*', '/'].includes(btn) ? 'bg-orange-500' : ''}
                      ${!['C', '=', '+', '-', '*', '/'].includes(btn) ? 'bg-[#444]' : ''}
                   `}
                 >
                   {btn}
                 </button>
              ))}
           </div>
       </div>
    </div>
  );
};
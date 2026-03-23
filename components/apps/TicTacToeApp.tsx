
import React, { useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';

type SquareValue = 'X' | 'O' | null;

export const TicTacToeApp: React.FC = () => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: SquareValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);

  const handleClick = (i: number) => {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const status = winner 
    ? `Winner: ${winner}` 
    : isDraw 
    ? "It's a Draw!" 
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="h-full bg-[#1e1e1e] text-white flex flex-col items-center justify-center p-4">
      <div className={`mb-6 text-xl font-bold flex items-center gap-2 ${winner ? 'text-yellow-400 scale-110' : 'text-gray-300'} transition-all`}>
         {winner && <Trophy size={24} />} {status}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-[#333] p-2 rounded-lg mb-6 shadow-xl">
        {squares.map((val, i) => (
           <button 
             key={i}
             className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#2b2b2b] rounded flex items-center justify-center text-4xl font-bold transition-all hover:bg-[#383838] ${val === 'X' ? 'text-blue-500' : 'text-red-500'}`}
             onClick={() => handleClick(i)}
           >
             {val}
           </button>
        ))}
      </div>

      <button 
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg transition-transform active:scale-95"
      >
        <RefreshCw size={18} /> New Game
      </button>
    </div>
  );
};

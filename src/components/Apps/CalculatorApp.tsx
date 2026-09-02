import React, { useState, useEffect } from 'react';
import { History, Trash2, Delete } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);

  const handleDigit = (digit: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    setExpression(`${display} ${op} `);
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      const fullExpr = `${expression}${display}`.replace(/×/g, '*').replace(/÷/g, '/');
      const sanitized = fullExpr.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      const resStr = String(Number(result.toFixed(8)));

      setHistory(prev => [{ expr: fullExpr, result: resStr }, ...prev.slice(0, 19)]);
      setDisplay(resStr);
      setExpression('');
    } catch {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display.length > 1 && display !== 'Error') {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    if (display !== '0' && display !== 'Error') {
      setDisplay(String(-Number(display)));
    }
  };

  const handlePercent = () => {
    const val = Number(display) / 100;
    setDisplay(String(val));
  };

  const handleScientific = (op: string) => {
    const num = Number(display);
    let res = 0;
    switch (op) {
      case 'sqrt': res = Math.sqrt(num); break;
      case 'sqr': res = num * num; break;
      case 'inv': res = 1 / num; break;
      case 'sin': res = Math.sin(num); break;
      case 'cos': res = Math.cos(num); break;
      case 'tan': res = Math.tan(num); break;
      case 'log': res = Math.log10(num); break;
      case 'ln': res = Math.log(num); break;
      case 'pi': res = Math.PI; break;
      case 'e': res = Math.E; break;
    }
    setDisplay(String(Number(res.toFixed(8))));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
      else if (e.key === '.') handleDecimal();
      else if (e.key === '+') handleOperator('+');
      else if (e.key === '-') handleOperator('-');
      else if (e.key === '*') handleOperator('×');
      else if (e.key === '/') handleOperator('÷');
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') handleClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, expression]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-3 select-none">
      {/* Header with Mode & History Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('standard')}
            className={`font-semibold transition-colors ${mode === 'standard' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`font-semibold transition-colors ${mode === 'scientific' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Scientific
          </button>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1 rounded ${showHistory ? 'bg-sky-500/20 text-sky-400' : 'text-zinc-400 hover:text-white'}`}
          title="History Tape"
        >
          <History size={14} />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex min-h-0 pt-2 gap-2">
        {/* Calc Board */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Display */}
          <div className="text-right py-2 px-3 bg-zinc-900/60 rounded-xl border border-white/5 mb-3 flex flex-col justify-center min-h-[70px]">
            <div className="text-xs text-zinc-400 font-mono h-4">{expression}</div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white truncate">{display}</div>
          </div>

          {/* Memory Bar */}
          <div className="grid grid-cols-5 gap-1 mb-2 text-[11px] font-semibold text-zinc-400 text-center">
            <button onClick={() => setMemory(0)} className="py-1 hover:bg-white/5 rounded">MC</button>
            <button onClick={() => setDisplay(String(memory))} className="py-1 hover:bg-white/5 rounded">MR</button>
            <button onClick={() => setMemory(memory + Number(display))} className="py-1 hover:bg-white/5 rounded">M+</button>
            <button onClick={() => setMemory(memory - Number(display))} className="py-1 hover:bg-white/5 rounded">M-</button>
            <button onClick={() => setMemory(Number(display))} className="py-1 hover:bg-white/5 rounded">MS</button>
          </div>

          {/* Scientific Keypad Rows */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-1.5 mb-1.5 text-xs">
              <button onClick={() => handleScientific('sin')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">sin</button>
              <button onClick={() => handleScientific('cos')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">cos</button>
              <button onClick={() => handleScientific('tan')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">tan</button>
              <button onClick={() => handleScientific('log')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">log</button>
              <button onClick={() => handleScientific('ln')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">ln</button>
              <button onClick={() => handleScientific('pi')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">π</button>
              <button onClick={() => handleScientific('e')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">e</button>
              <button onClick={() => handleScientific('sqr')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">x²</button>
              <button onClick={() => handleScientific('sqrt')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">√x</button>
              <button onClick={() => handleScientific('inv')} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300">1/x</button>
            </div>
          )}

          {/* Standard Keypad */}
          <div className="grid grid-cols-4 gap-1.5 text-sm font-medium">
            <button onClick={handlePercent} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl text-zinc-300">%</button>
            <button onClick={() => setDisplay('0')} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl text-zinc-300">CE</button>
            <button onClick={handleClear} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl text-zinc-300">C</button>
            <button onClick={handleBackspace} className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl text-zinc-300 flex items-center justify-center">
              <Delete size={15} />
            </button>

            <button onClick={() => handleDigit('7')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">7</button>
            <button onClick={() => handleDigit('8')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">8</button>
            <button onClick={() => handleDigit('9')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">9</button>
            <button onClick={() => handleOperator('÷')} className="p-2.5 bg-zinc-800 hover:bg-sky-600 rounded-xl text-sky-400 hover:text-white transition-colors">÷</button>

            <button onClick={() => handleDigit('4')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">4</button>
            <button onClick={() => handleDigit('5')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">5</button>
            <button onClick={() => handleDigit('6')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">6</button>
            <button onClick={() => handleOperator('×')} className="p-2.5 bg-zinc-800 hover:bg-sky-600 rounded-xl text-sky-400 hover:text-white transition-colors">×</button>

            <button onClick={() => handleDigit('1')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">1</button>
            <button onClick={() => handleDigit('2')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">2</button>
            <button onClick={() => handleDigit('3')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">3</button>
            <button onClick={() => handleOperator('-')} className="p-2.5 bg-zinc-800 hover:bg-sky-600 rounded-xl text-sky-400 hover:text-white transition-colors">-</button>

            <button onClick={handleToggleSign} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-300">+/-</button>
            <button onClick={() => handleDigit('0')} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">0</button>
            <button onClick={handleDecimal} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white">.</button>
            <button onClick={() => handleOperator('+')} className="p-2.5 bg-zinc-800 hover:bg-sky-600 rounded-xl text-sky-400 hover:text-white transition-colors">+</button>

            <button
              onClick={handleEquals}
              className="col-span-4 p-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold transition-colors shadow-lg shadow-sky-600/30"
            >
              =
            </button>
          </div>
        </div>

        {/* History Tape Sidebar */}
        {showHistory && (
          <div className="w-44 border-l border-white/10 pl-2 flex flex-col text-xs">
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-white/10">
              <span className="text-zinc-400 font-semibold">History</span>
              <button
                onClick={() => setHistory([])}
                className="text-zinc-500 hover:text-red-400 p-0.5"
                title="Clear History"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-zinc-500 text-[11px] text-center mt-4">There's no history yet</div>
              ) : (
                history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setDisplay(h.result);
                      setExpression(h.expr);
                    }}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 cursor-pointer text-right"
                  >
                    <div className="text-[10px] text-zinc-500 font-mono">{h.expr} =</div>
                    <div className="text-sm font-bold text-sky-400 font-mono">{h.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

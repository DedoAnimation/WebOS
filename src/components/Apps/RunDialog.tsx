import React, { useState } from 'react';
import { Play, HelpCircle } from 'lucide-react';
import { AppId } from '../../types';

interface RunDialogProps {
  onOpenApp: (appId: AppId) => void;
  onClose: () => void;
}

export const RunDialog: React.FC<RunDialogProps> = ({ onOpenApp, onClose }) => {
  const [command, setCommand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'notepad' || cmd === 'notepad.exe') onOpenApp('notepad');
    else if (cmd === 'calc' || cmd === 'calculator') onOpenApp('calculator');
    else if (cmd === 'cmd' || cmd === 'powershell' || cmd === 'terminal') onOpenApp('terminal');
    else if (cmd === 'mspaint' || cmd === 'paint') onOpenApp('paint');
    else if (cmd === 'explorer' || cmd === 'explorer.exe') onOpenApp('explorer');
    else if (cmd === 'taskmgr' || cmd === 'taskmanager') onOpenApp('taskmanager');
    else if (cmd === 'msedge' || cmd === 'edge' || cmd === 'browser') onOpenApp('browser');
    else if (cmd === 'settings' || cmd === 'control') onOpenApp('settings');
    else if (cmd === 'winmine' || cmd === 'minesweeper') onOpenApp('minesweeper');
    else if (cmd === 'snake') onOpenApp('snake');
    else if (cmd === 'copilot') onOpenApp('copilot');
    else {
      // Default fallback: open explorer or terminal
      onOpenApp('terminal');
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-200 p-4 select-none justify-between text-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <Play size={18} />
        </div>
        <p className="text-zinc-300 leading-relaxed">
          Type the name of a program, folder, document, or Internet resource, and WinWeb will open it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 my-2">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-zinc-400 w-12">Open:</label>
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="e.g. notepad, calc, cmd, paint, explorer"
            autoFocus
            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-white/20 rounded-md text-white outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="submit"
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

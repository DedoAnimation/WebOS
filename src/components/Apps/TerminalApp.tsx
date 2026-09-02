import React, { useState, useRef, useEffect } from 'react';
import { VFile, AppId } from '../../types';
import {
  getFilesByDirectory,
  createNewFolder,
  createNewFile,
  deleteFileOrFolder,
  getFileByPath,
} from '../../utils/fileSystem';

interface TerminalAppProps {
  files: VFile[];
  onUpdateFiles: (files: VFile[]) => void;
  onOpenApp?: (appId: AppId) => void;
}

interface CommandOutput {
  id: string;
  command?: string;
  cwd: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  files,
  onUpdateFiles,
  onOpenApp,
}) => {
  const [cwd, setCwd] = useState<string>('C:/Users/User');
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      cwd: 'C:/Users/User',
      output: (
        <div className="text-zinc-300 mb-2 font-mono">
          <div className="text-sky-400 font-semibold">Windows PowerShell [Version 10.0.26100.1742]</div>
          <div className="text-zinc-500">(c) Microsoft Corporation. All rights reserved.</div>
          <div className="text-emerald-400 mt-1">Type <span className="text-white font-bold">help</span> to view available system commands.</div>
        </div>
      ),
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [terminalTheme, setTerminalTheme] = useState<'powershell' | 'matrix' | 'dark' | 'retro'>('powershell');
  const [isMatrixRunning, setIsMatrixRunning] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isMatrixRunning]);

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      setHistory(prev => [
        ...prev,
        { id: `cmd-${Date.now()}`, command: '', cwd, output: '' },
      ]);
      return;
    }

    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryPointer(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const argStr = args.join(' ');

    let output: React.ReactNode = '';
    let isErr = false;

    switch (cmd) {
      case 'help':
      case '?':
        output = (
          <div className="space-y-1 my-1 text-zinc-300 font-mono text-xs">
            <div className="text-sky-400 font-bold mb-1">Available WinWeb Shell Commands:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-amber-400 font-semibold">dir / ls</span> - List folder contents</div>
              <div><span className="text-amber-400 font-semibold">cd &lt;path&gt;</span> - Change directory</div>
              <div><span className="text-amber-400 font-semibold">mkdir &lt;name&gt;</span> - Create new folder</div>
              <div><span className="text-amber-400 font-semibold">touch &lt;file&gt;</span> - Create empty file</div>
              <div><span className="text-amber-400 font-semibold">cat / type &lt;file&gt;</span> - Read file text</div>
              <div><span className="text-amber-400 font-semibold">echo &lt;txt&gt; &gt; &lt;f&gt;</span> - Write text to file</div>
              <div><span className="text-amber-400 font-semibold">del / rm &lt;file&gt;</span> - Delete file</div>
              <div><span className="text-amber-400 font-semibold">cls / clear</span> - Clear terminal</div>
              <div><span className="text-amber-400 font-semibold">neofetch / winver</span> - Show system badge & specs</div>
              <div><span className="text-amber-400 font-semibold">sysinfo</span> - Hardware diagnostic</div>
              <div><span className="text-amber-400 font-semibold">calc &lt;math&gt;</span> - Instant calculation</div>
              <div><span className="text-amber-400 font-semibold">ping &lt;host&gt;</span> - Ping simulated host</div>
              <div><span className="text-amber-400 font-semibold">matrix</span> - Matrix digital stream</div>
              <div><span className="text-amber-400 font-semibold">theme &lt;name&gt;</span> - powershell/matrix/dark/retro</div>
              <div><span className="text-amber-400 font-semibold">date / time</span> - Print current timestamp</div>
              <div><span className="text-amber-400 font-semibold">ai &lt;question&gt;</span> - Query system intelligence</div>
            </div>
          </div>
        );
        break;

      case 'cls':
      case 'clear':
        setHistory([]);
        return;

      case 'dir':
      case 'ls': {
        const dirFiles = getFilesByDirectory(files, cwd);
        output = (
          <div className="my-1 space-y-1">
            <div className="text-zinc-500">Directory of {cwd}</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {dirFiles.map(f => (
                <div key={f.id} className="flex items-center gap-4">
                  <span className="text-zinc-500 w-24">{f.updatedAt}</span>
                  <span className={`w-16 ${f.type === 'folder' ? 'text-amber-400 font-bold' : 'text-blue-400'}`}>
                    {f.type === 'folder' ? '<DIR>' : `${f.size} B`}
                  </span>
                  <span className={f.type === 'folder' ? 'text-amber-300 font-semibold' : 'text-zinc-200'}>
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-zinc-500 mt-2">{dirFiles.length} File(s) / Dir(s)</div>
          </div>
        );
        break;
      }

      case 'cd': {
        if (!argStr || argStr === '~') {
          setCwd('C:/Users/User');
        } else if (argStr === '..') {
          if (cwd !== 'C:') {
            const parent = cwd.substring(0, cwd.lastIndexOf('/')) || 'C:';
            setCwd(parent);
          }
        } else if (argStr === '/') {
          setCwd('C:');
        } else {
          let targetPath = argStr.startsWith('C:') ? argStr : `${cwd}/${argStr}`.replace(/\/+/g, '/');
          const exists = files.some(f => f.path === targetPath && f.type === 'folder') || targetPath === 'C:';
          if (exists) {
            setCwd(targetPath);
          } else {
            output = `The system cannot find the path specified: '${argStr}'`;
            isErr = true;
          }
        }
        break;
      }

      case 'mkdir': {
        if (!argStr) {
          output = 'Usage: mkdir <folder_name>';
          isErr = true;
        } else {
          const { updatedFiles } = createNewFolder(files, cwd, argStr);
          onUpdateFiles(updatedFiles);
          output = `Directory created: ${cwd}/${argStr}`;
        }
        break;
      }

      case 'touch': {
        if (!argStr) {
          output = 'Usage: touch <filename>';
          isErr = true;
        } else {
          const { updatedFiles } = createNewFile(files, cwd, argStr, '', 'txt');
          onUpdateFiles(updatedFiles);
          output = `File created: ${cwd}/${argStr}`;
        }
        break;
      }

      case 'cat':
      case 'type': {
        if (!argStr) {
          output = 'Usage: cat <filename>';
          isErr = true;
        } else {
          const targetPath = argStr.startsWith('C:') ? argStr : `${cwd}/${argStr}`;
          const target = getFileByPath(files, targetPath);
          if (target) {
            output = <pre className="whitespace-pre-wrap font-mono text-zinc-300">{target.content || '[Empty or Binary file]'}</pre>;
          } else {
            output = `File not found: '${argStr}'`;
            isErr = true;
          }
        }
        break;
      }

      case 'echo': {
        if (argStr.includes('>')) {
          const [textPart, filePart] = argStr.split('>');
          const fileName = filePart.trim();
          const content = textPart.trim();
          const { updatedFiles } = createNewFile(files, cwd, fileName, content, 'txt');
          onUpdateFiles(updatedFiles);
          output = `Written to ${fileName}`;
        } else {
          output = argStr;
        }
        break;
      }

      case 'del':
      case 'rm': {
        if (!argStr) {
          output = 'Usage: del <filename>';
          isErr = true;
        } else {
          const targetPath = argStr.startsWith('C:') ? argStr : `${cwd}/${argStr}`;
          const updated = deleteFileOrFolder(files, targetPath, false);
          onUpdateFiles(updated);
          output = `Deleted '${argStr}' (moved to Recycle Bin)`;
        }
        break;
      }

      case 'neofetch':
      case 'winver':
        output = (
          <div className="flex flex-col sm:flex-row gap-6 my-2 font-mono text-xs">
            <pre className="text-sky-400 font-bold leading-none select-none">
{`
  ██████   ██████
  ██████   ██████
  ██████   ██████
  
  ██████   ██████
  ██████   ██████
  ██████   ██████
`}
            </pre>
            <div className="space-y-0.5">
              <div className="text-sky-400 font-bold text-sm">User@WinWeb-PC</div>
              <div className="text-zinc-600">--------------------------</div>
              <div><span className="text-amber-400 font-semibold">OS:</span> WinWeb OS x86_64 Fluent Edition</div>
              <div><span className="text-amber-400 font-semibold">Kernel:</span> React 19 / TypeScript 5.8 / Vite 6</div>
              <div><span className="text-amber-400 font-semibold">Uptime:</span> {Math.floor(performance.now() / 60000)} mins</div>
              <div><span className="text-amber-400 font-semibold">Shell:</span> PowerShell Web v10.0</div>
              <div><span className="text-amber-400 font-semibold">Resolution:</span> {window.innerWidth}x{window.innerHeight}</div>
              <div><span className="text-amber-400 font-semibold">WM:</span> WinWeb Acrylic Window Manager</div>
              <div><span className="text-amber-400 font-semibold">CPU:</span> Virtual Intel Core i9-14900K (24) @ 5.80GHz</div>
              <div><span className="text-amber-400 font-semibold">GPU:</span> WebGL Hardware Acceleration Engine</div>
              <div><span className="text-amber-400 font-semibold">Memory:</span> 1.42 GB / 32.00 GB (4%)</div>
            </div>
          </div>
        );
        break;

      case 'sysinfo':
        output = (
          <div className="space-y-1 font-mono text-xs my-1">
            <div className="text-sky-400 font-bold">System Diagnostics Summary:</div>
            <div>Browser Agent: {navigator.userAgent}</div>
            <div>Logical CPU Cores: {navigator.hardwareConcurrency || 8}</div>
            <div>Max Touch Points: {navigator.maxTouchPoints || 0}</div>
            <div>Online Status: {navigator.onLine ? 'Connected (Gigabit Ethernet)' : 'Offline'}</div>
            <div>Color Depth: {window.screen.colorDepth}-bit High Dynamic Range</div>
          </div>
        );
        break;

      case 'calc': {
        try {
          // Safe arithmetic evaluator
          const sanitized = argStr.replace(/[^0-9+\-*/().\s]/g, '');
          const res = Function(`"use strict"; return (${sanitized})`)();
          output = `${argStr} = ${res}`;
        } catch {
          output = `Invalid arithmetic expression: '${argStr}'`;
          isErr = true;
        }
        break;
      }

      case 'ping': {
        const host = argStr || 'google.com';
        output = (
          <div className="space-y-1 font-mono text-xs my-1">
            <div>Pinging {host} [142.250.180.206] with 32 bytes of data:</div>
            <div>Reply from 142.250.180.206: bytes=32 time=12ms TTL=118</div>
            <div>Reply from 142.250.180.206: bytes=32 time=11ms TTL=118</div>
            <div>Reply from 142.250.180.206: bytes=32 time=14ms TTL=118</div>
            <div>Reply from 142.250.180.206: bytes=32 time=10ms TTL=118</div>
            <div className="text-emerald-400 mt-1">Ping statistics for {host}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)</div>
          </div>
        );
        break;
      }

      case 'matrix':
        setIsMatrixRunning(true);
        setTimeout(() => setIsMatrixRunning(false), 5000);
        output = 'Entering the Matrix simulation for 5 seconds...';
        break;

      case 'theme': {
        const t = argStr.toLowerCase();
        if (['powershell', 'matrix', 'dark', 'retro'].includes(t)) {
          setTerminalTheme(t as any);
          output = `Terminal theme set to: ${t}`;
        } else {
          output = 'Available themes: powershell, matrix, dark, retro';
        }
        break;
      }

      case 'date':
      case 'time':
        output = new Date().toLocaleString();
        break;

      case 'ai': {
        if (!argStr) {
          output = 'Usage: ai <your question>';
        } else {
          output = (
            <div className="p-2.5 my-1 bg-sky-950/40 border border-sky-500/30 rounded-lg text-xs font-sans">
              <div className="text-sky-400 font-semibold mb-1 flex items-center gap-1.5">
                <span>WinWeb AI Copilot</span>
              </div>
              <div className="text-zinc-200">
                {argStr.toLowerCase().includes('hello')
                  ? 'Hello! I am your WinWeb operating system assistant. You can ask me questions, or use commands like notepad, explorer, paint, or calc!'
                  : `Analyzed query: "${argStr}". WinWeb OS is operating smoothly with all virtual subsystems active.`}
              </div>
            </div>
          );
        }
        break;
      }

      default:
        output = `'${cmd}' is not recognized as an internal or external command, operable program or batch file. Type 'help' for a list of commands.`;
        isErr = true;
    }

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: trimmed,
        cwd,
        output,
        isError: isErr,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextPtr = historyPointer === -1 ? cmdHistory.length - 1 : Math.max(0, historyPointer - 1);
        setHistoryPointer(nextPtr);
        setInputVal(cmdHistory[nextPtr]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer !== -1) {
        const nextPtr = historyPointer + 1;
        if (nextPtr < cmdHistory.length) {
          setHistoryPointer(nextPtr);
          setInputVal(cmdHistory[nextPtr]);
        } else {
          setHistoryPointer(-1);
          setInputVal('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const cmds = ['help', 'dir', 'cd', 'mkdir', 'touch', 'cat', 'del', 'cls', 'neofetch', 'sysinfo', 'calc', 'ping', 'matrix', 'theme', 'date', 'ai'];
      const match = cmds.find(c => c.startsWith(inputVal.toLowerCase()));
      if (match) setInputVal(match);
    }
  };

  // Themes
  const themeClasses = {
    powershell: 'bg-[#012456] text-slate-100',
    matrix: 'bg-black text-emerald-400 font-mono',
    dark: 'bg-zinc-950 text-zinc-100',
    retro: 'bg-zinc-900 text-amber-400 font-mono',
  }[terminalTheme];

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex flex-col h-full p-3 font-mono text-xs overflow-y-auto ${themeClasses} transition-colors select-text`}
    >
      {/* Terminal History */}
      <div className="space-y-2">
        {history.map(item => (
          <div key={item.id} className="space-y-1">
            {item.command !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-semibold">{item.cwd}&gt;</span>
                <span className="text-white font-medium">{item.command}</span>
              </div>
            )}
            {item.output && (
              <div className={item.isError ? 'text-rose-400' : ''}>
                {item.output}
              </div>
            )}
          </div>
        ))}

        {/* Matrix animated stream simulation */}
        {isMatrixRunning && (
          <div className="text-emerald-400 font-mono text-xs animate-pulse">
            01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100<br/>
            [SYS_STREAM] OVERRIDE MATRIX PROTOCOL ACTIVE...<br/>
            0xFA4B29 0x00FF88 0x992211 0x7733AA<br/>
          </div>
        )}

        {/* Active Input Line */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sky-400 font-semibold flex-shrink-0">{cwd}&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-mono text-white"
          />
        </div>
      </div>

      <div ref={bottomRef} />
    </div>
  );
};

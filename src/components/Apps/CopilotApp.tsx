import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, CornerDownLeft, Laptop, Lightbulb, Code } from 'lucide-react';
import { AppId, SystemSettings } from '../../types';

interface CopilotAppProps {
  onOpenApp?: (appId: AppId) => void;
  onUpdateSettings?: (settings: Partial<SystemSettings>) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTaken?: string;
}

export const CopilotApp: React.FC<CopilotAppProps> = ({
  onOpenApp,
  onUpdateSettings,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Hi, I am Windows Copilot! I can help you answer questions, brainstorm, write code, or control your operating system. Try asking me to open an app or change your settings!',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';
      let action = '';

      // OS Intent parser
      if (lower.includes('paint')) {
        if (onOpenApp) onOpenApp('paint');
        reply = 'Opening Paint Studio for you!';
        action = 'Launched Paint Studio';
      } else if (lower.includes('notepad') || lower.includes('note')) {
        if (onOpenApp) onOpenApp('notepad');
        reply = 'Launching Notepad!';
        action = 'Launched Notepad';
      } else if (lower.includes('terminal') || lower.includes('command')) {
        if (onOpenApp) onOpenApp('terminal');
        reply = 'Opening Windows PowerShell Terminal!';
        action = 'Launched Terminal';
      } else if (lower.includes('calc') || lower.includes('calculator')) {
        if (onOpenApp) onOpenApp('calculator');
        reply = 'Opening Calculator!';
        action = 'Launched Calculator';
      } else if (lower.includes('file') || lower.includes('explorer')) {
        if (onOpenApp) onOpenApp('explorer');
        reply = 'Opening File Explorer!';
        action = 'Launched File Explorer';
      } else if (lower.includes('night light')) {
        if (onUpdateSettings) {
          const enable = !lower.includes('off') && !lower.includes('disable');
          onUpdateSettings({ nightLight: enable });
          reply = enable ? 'Turned on Night Light eye protection mode.' : 'Turned off Night Light.';
          action = enable ? 'Enabled Night Light' : 'Disabled Night Light';
        }
      } else if (lower.includes('wallpaper') || lower.includes('background')) {
        if (onUpdateSettings) {
          if (lower.includes('aurora')) {
            onUpdateSettings({ wallpaper: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=2560&q=85' });
            reply = 'Changed desktop wallpaper to Nordic Aurora!';
          } else if (lower.includes('cyber') || lower.includes('neon')) {
            onUpdateSettings({ wallpaper: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85' });
            reply = 'Changed desktop wallpaper to Cyberpunk Metropolis!';
          } else if (lower.includes('dynamic') || lower.includes('matrix')) {
            onUpdateSettings({ wallpaper: 'dynamic-matrix' });
            reply = 'Changed desktop wallpaper to Dynamic Cyber Waves!';
          } else {
            onUpdateSettings({ wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85' });
            reply = 'Changed desktop wallpaper to Windows 11 Bloom Dark!';
          }
          action = 'Updated Wallpaper';
        }
      } else if (lower.includes('code') || lower.includes('javascript') || lower.includes('react')) {
        reply = 'Here is a quick TypeScript utility for Windows desktop notifications:\n\n```ts\nfunction sendWinNotification(title: string, msg: string) {\n  console.log(`[WIN_NOTIFY] ${title}: ${msg}`);\n}\n```';
      } else {
        reply = `I can help you with that! WinWeb OS is running with full multitasking, virtual file system, synthetic audio engine, and fluent UI. You can ask me to launch tools, write documents, or customize your theme.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          actionTaken: action,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-950/60 to-zinc-900 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 text-white">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="text-xs font-bold text-white">Copilot Companion</div>
          <div className="text-[10px] text-fuchsia-300">Intelligent OS Assistant</div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 p-2 bg-zinc-900/40 border-b border-white/5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSend('Open Paint Studio')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full border border-white/10 whitespace-nowrap"
        >
          <Laptop size={11} className="text-sky-400" />
          <span>Open Paint</span>
        </button>
        <button
          onClick={() => handleSend('Set wallpaper to Cyberpunk')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full border border-white/10 whitespace-nowrap"
        >
          <Sparkles size={11} className="text-fuchsia-400" />
          <span>Cyberpunk Wallpaper</span>
        </button>
        <button
          onClick={() => handleSend('Toggle Night Light')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full border border-white/10 whitespace-nowrap"
        >
          <Lightbulb size={11} className="text-amber-400" />
          <span>Night Light</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isBot
                    ? 'bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white shadow'
                    : 'bg-zinc-800 text-sky-400'
                }`}
              >
                {isBot ? <Sparkles size={13} /> : <User size={13} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isBot
                    ? 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-tl-sm'
                    : 'bg-sky-600 text-white rounded-tr-sm shadow-md'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans select-text">{msg.text}</pre>
                {msg.actionTaken && (
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                    <span>✓ {msg.actionTaken}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 italic pl-10">
            <Sparkles size={12} className="animate-spin text-fuchsia-400" />
            <span>Copilot is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-900/90 border-t border-white/10">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-zinc-950 border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-fuchsia-500 focus-within:ring-1 focus-within:ring-fuchsia-500/50"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Copilot or control Windows..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-100 placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-7 h-7 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-30 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

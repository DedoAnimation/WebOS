import React, { useState } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  X,
  Star,
  ShieldCheck,
  Search,
  ExternalLink,
  Lock,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  inputUrl: string;
  isLoading: boolean;
  favIcon?: string;
  contentMode: 'portal' | 'wikipedia' | 'hackernews' | 'search' | 'iframe';
}

const DEFAULT_BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', mode: 'wikipedia' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', mode: 'hackernews' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', mode: 'search' },
  { name: 'Google AI', url: 'https://ai.google.dev', mode: 'portal' },
];

export const BrowserApp: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Microsoft Edge Start',
      url: 'win://start',
      inputUrl: 'https://www.bing.com',
      isLoading: false,
      contentMode: 'portal',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleNewTab = () => {
    const id = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id,
      title: 'New Tab',
      url: 'win://start',
      inputUrl: 'https://',
      isLoading: false,
      contentMode: 'portal',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(id);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      handleNewTab();
      return;
    }
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const navigateTo = (urlStr: string, mode: BrowserTab['contentMode'] = 'portal') => {
    let cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('win://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setTabs(prev =>
      prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            url: cleanUrl,
            inputUrl: cleanUrl,
            title: cleanUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Web Page',
            contentMode: mode,
          };
        }
        return t;
      })
    );
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab.inputUrl.trim()) return;

    if (activeTab.inputUrl.includes('.') && !activeTab.inputUrl.includes(' ')) {
      navigateTo(activeTab.inputUrl, 'iframe');
    } else {
      setSearchQuery(activeTab.inputUrl);
      navigateTo(`https://duckduckgo.com/?q=${encodeURIComponent(activeTab.inputUrl)}`, 'search');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Edge Tab Strip */}
      <div className="flex items-center bg-zinc-900 border-b border-white/10 px-2 pt-1.5 gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer border-t border-x transition-all ${
                isActive
                  ? 'bg-zinc-950 border-white/15 text-white font-medium shadow'
                  : 'bg-zinc-800/40 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Globe size={13} className="text-sky-400 flex-shrink-0" />
              <span className="truncate max-w-[130px]">{tab.title}</span>
              <button
                onClick={e => handleCloseTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 p-0.5 rounded text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        <button
          onClick={handleNewTab}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
          title="New Tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Navigation Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/70 border-b border-white/5 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateTo('win://start', 'portal')}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Back"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white opacity-40"
            title="Forward"
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigateTo(activeTab.url, activeTab.contentMode)}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Reload"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => navigateTo('win://start', 'portal')}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Home"
          >
            <Home size={14} />
          </button>
        </div>

        {/* Omnibox URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-white/10 rounded-full focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50">
          <Lock size={12} className="text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            value={activeTab.inputUrl}
            onChange={e =>
              setTabs(prev =>
                prev.map(t => (t.id === activeTabId ? { ...t, inputUrl: e.target.value } : t))
              )
            }
            placeholder="Search or enter web address"
            className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-200 placeholder-zinc-500"
          />
          <button type="submit" className="text-zinc-400 hover:text-sky-400">
            <Search size={13} />
          </button>
        </form>

        <button className="p-1.5 rounded hover:bg-white/10 text-amber-400" title="Bookmark">
          <Star size={14} />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-3 px-4 py-1 bg-zinc-900/40 border-b border-white/5 text-[11px] text-zinc-400 overflow-x-auto">
        <div className="flex items-center gap-1 text-zinc-500 font-medium">
          <Bookmark size={11} />
          <span>Favorites:</span>
        </div>
        {DEFAULT_BOOKMARKS.map(bm => (
          <button
            key={bm.name}
            onClick={() => navigateTo(bm.url, bm.mode as any)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 hover:text-zinc-200 transition-colors"
          >
            <Globe size={11} className="text-sky-400" />
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 p-4">
        {activeTab.contentMode === 'portal' || activeTab.url === 'win://start' ? (
          <div className="max-w-4xl mx-auto py-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-sky-500/20 mb-4">
              <Globe size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Microsoft Edge Web Hub</h1>
            <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
              Fast, secure web browsing with tab isolation, search shortcuts, and built-in interactive portals.
            </p>

            {/* Quick Portals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div
                onClick={() => navigateTo('https://en.wikipedia.org/wiki/Operating_system', 'wikipedia')}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-3">
                  <Globe size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Wikipedia Portal</h3>
                <p className="text-xs text-zinc-400">Explore encyclopedia articles on operating systems & computing history.</p>
              </div>

              <div
                onClick={() => navigateTo('https://news.ycombinator.com', 'hackernews')}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center mb-3">
                  <ExternalLink size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Hacker News</h3>
                <p className="text-xs text-zinc-400">Read the latest trending technology, AI, and developer discussions.</p>
              </div>

              <div
                onClick={() => navigateTo('https://duckduckgo.com', 'search')}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Web Search</h3>
                <p className="text-xs text-zinc-400">Search the global internet with privacy protection.</p>
              </div>

              <div
                onClick={() => navigateTo('https://ai.google.dev', 'portal')}
                className="p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Google AI Docs</h3>
                <p className="text-xs text-zinc-400">Explore Gemini, machine learning models, and API tools.</p>
              </div>
            </div>
          </div>
        ) : activeTab.contentMode === 'wikipedia' ? (
          <div className="max-w-3xl mx-auto bg-zinc-900/80 p-6 rounded-xl border border-white/10 text-zinc-200 space-y-4">
            <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Operating System</h1>
            <p className="text-sm leading-relaxed text-zinc-300">
              An <strong>operating system (OS)</strong> is system software that manages computer hardware, software resources, and provides common services for computer programs.
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              Time-sharing operating systems schedule tasks for efficient use of the system and may also include accounting software for cost allocation of processor time, mass storage, printing, and other resources.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 text-xs">
              <span className="text-sky-400 font-semibold">Related Topics:</span> Process Scheduling, Virtual Memory, File Systems, Graphical User Interfaces (GUI), Fluent Design Systems.
            </div>
          </div>
        ) : activeTab.contentMode === 'hackernews' ? (
          <div className="max-w-3xl mx-auto bg-zinc-900/80 p-5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="w-6 h-6 bg-[#ff6600] text-black font-bold flex items-center justify-center text-xs rounded">Y</div>
              <h2 className="text-sm font-bold text-white">Hacker News Top Stories</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                <div className="font-medium text-sky-400 hover:underline">1. WinWeb OS: Building a complete desktop environment in React & TypeScript</div>
                <div className="text-[11px] text-zinc-500 mt-1">428 points by techgeek 3 hours ago | 184 comments</div>
              </div>
              <div className="p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                <div className="font-medium text-sky-400 hover:underline">2. Why modern web platforms are rivaling native desktop applications</div>
                <div className="text-[11px] text-zinc-500 mt-1">315 points by arch_fan 5 hours ago | 92 comments</div>
              </div>
              <div className="p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                <div className="font-medium text-sky-400 hover:underline">3. Next-generation window managers and fluent acrylic aesthetics</div>
                <div className="text-[11px] text-zinc-500 mt-1">198 points by ui_crafter 7 hours ago | 64 comments</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-900/40 rounded-xl border border-white/10 p-6 text-center">
            <ShieldCheck size={36} className="text-emerald-400 mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Viewing: {activeTab.url}</h3>
            <p className="text-xs text-zinc-400 max-w-md mb-4">
              Browsing secure sandbox stream. Click below to open in an external preview tab if restricted by site iframe headers.
            </p>
            <a
              href={activeTab.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-lg font-medium transition-colors"
            >
              <span>Open in New Browser Window</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

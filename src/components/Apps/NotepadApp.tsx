import React, { useState, useEffect } from 'react';
import {
  Save,
  Download,
  Plus,
  X,
  Search,
  Type,
  FileText,
  Eye,
  Check,
  AlignLeft,
} from 'lucide-react';
import { VFile } from '../../types';
import { updateFileContent, createNewFile } from '../../utils/fileSystem';

interface TabItem {
  id: string;
  title: string;
  path?: string;
  content: string;
  isDirty: boolean;
}

interface NotepadAppProps {
  files: VFile[];
  onUpdateFiles: (files: VFile[]) => void;
  initialFile?: VFile;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({
  files,
  onUpdateFiles,
  initialFile,
}) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: initialFile?.id || 'tab-1',
      title: initialFile?.name || 'Untitled-1.txt',
      path: initialFile?.path,
      content: initialFile?.content || 'Welcome to Windows Notepad!\n\nYou can write notes, markdown docs, or code here.\nChanges can be saved directly to the WinWeb file system or exported to your computer.',
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(initialFile?.id || 'tab-1');
  const [fontSize, setFontSize] = useState<number>(14);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // If a new initialFile is passed in
  useEffect(() => {
    if (initialFile) {
      const existing = tabs.find(t => t.path === initialFile.path);
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        const newTab: TabItem = {
          id: initialFile.id,
          title: initialFile.name,
          path: initialFile.path,
          content: initialFile.content || '',
          isDirty: false,
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    }
  }, [initialFile]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleContentChange = (val: string) => {
    setTabs(prev =>
      prev.map(t => (t.id === activeTabId ? { ...t, content: val, isDirty: true } : t))
    );
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: `Untitled-${tabs.length + 1}.txt`,
      content: '',
      isDirty: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Keep at least one empty tab
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: 'Untitled-1.txt',
          content: '',
          isDirty: false,
        },
      ]);
      return;
    }
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleSave = () => {
    if (!activeTab) return;
    if (activeTab.path) {
      // Save existing file in VFS
      const updated = updateFileContent(files, activeTab.path, activeTab.content);
      onUpdateFiles(updated);
      setTabs(prev =>
        prev.map(t => (t.id === activeTabId ? { ...t, isDirty: false } : t))
      );
    } else {
      // Create new file on Desktop
      const { updatedFiles, newFile } = createNewFile(
        files,
        'C:/Users/User/Desktop',
        activeTab.title,
        activeTab.content,
        'txt'
      );
      onUpdateFiles(updatedFiles);
      setTabs(prev =>
        prev.map(t =>
          t.id === activeTabId
            ? { ...t, path: newFile.path, title: newFile.name, isDirty: false }
            : t
        )
      );
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReplaceAll = () => {
    if (!searchQuery || !activeTab) return;
    const newContent = activeTab.content.replaceAll(searchQuery, replaceQuery);
    handleContentChange(newContent);
  };

  const lineCount = activeTab.content.split('\n').length;
  const charCount = activeTab.content.length;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      {/* Tab Strip */}
      <div className="flex items-center bg-zinc-900/90 border-b border-white/10 px-2 pt-1 gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer border-t border-x transition-colors ${
                isActive
                  ? 'bg-zinc-950 border-white/15 text-white font-medium shadow-sm'
                  : 'bg-zinc-800/40 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <FileText size={13} className="text-blue-400" />
              <span className="truncate max-w-[120px]">
                {tab.title}
                {tab.isDirty ? ' •' : ''}
              </span>
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

      {/* Menu & Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50 border-b border-white/5 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Save to Virtual Disk (Ctrl+S)"
          >
            {saveSuccess ? <Check size={13} className="text-emerald-400" /> : <Save size={13} />}
            <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Export & Download file to local computer"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showSearch ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-zinc-300'
            }`}
            title="Find & Replace"
          >
            <Search size={13} />
            <span>Find</span>
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              wordWrap ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-zinc-300'
            }`}
            title="Toggle Word Wrap"
          >
            <AlignLeft size={13} />
            <span>Wrap</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showPreview ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-zinc-300'
            }`}
            title="Toggle Markdown Preview"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        {/* Font Zoom Controls */}
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Type size={13} />
          <button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white"
          >
            -
          </button>
          <span className="font-mono text-[11px]">{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(28, fontSize + 1))}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-white/10 text-xs animate-in slide-in-from-top duration-100">
          <input
            type="text"
            placeholder="Find text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-2.5 py-1 bg-zinc-950 border border-white/15 rounded text-white placeholder-zinc-500 outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            className="px-2.5 py-1 bg-zinc-950 border border-white/15 rounded text-white placeholder-zinc-500 outline-none focus:border-sky-500"
          />
          <button
            onClick={handleReplaceAll}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium transition-colors"
          >
            Replace All
          </button>
          <button
            onClick={() => setShowSearch(false)}
            className="p-1 text-zinc-400 hover:text-white ml-auto"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Text Area & Preview Split */}
      <div className="flex-1 flex min-h-0 relative">
        <textarea
          value={activeTab.content}
          onChange={e => handleContentChange(e.target.value)}
          style={{
            fontSize: `${fontSize}px`,
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          }}
          placeholder="Type here..."
          className="flex-1 h-full p-3.5 bg-zinc-950 text-zinc-100 font-mono resize-none outline-none leading-relaxed overflow-auto"
        />

        {showPreview && (
          <div className="w-1/2 border-l border-white/10 bg-zinc-900/60 p-4 overflow-y-auto text-xs leading-relaxed font-sans text-zinc-200 prose prose-invert max-w-none">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Live Preview</div>
            <pre className="whitespace-pre-wrap font-sans">{activeTab.content}</pre>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 border-t border-white/10 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-4">
          <span>Ln {lineCount}, Col {charCount}</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{wordWrap ? 'Word Wrap' : 'No Wrap'}</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

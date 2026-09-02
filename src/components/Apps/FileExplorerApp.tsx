import React, { useState, useMemo, useRef } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Music,
  Download,
  Trash2,
  HardDrive,
  Monitor,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  RotateCw,
  Search,
  Plus,
  Trash,
  Upload,
  FileCode,
  Grid,
  List,
  FilePlus,
  FolderPlus,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react';
import { VFile, AppId } from '../../types';
import {
  getFilesByDirectory,
  createNewFolder,
  createNewFile,
  deleteFileOrFolder,
  renameFileOrFolder,
  emptyRecycleBin,
  restoreFromRecycleBin,
} from '../../utils/fileSystem';
import { AppIcon } from '../Common/AppIcon';

interface FileExplorerAppProps {
  files: VFile[];
  onUpdateFiles: (files: VFile[]) => void;
  onOpenFile: (file: VFile) => void;
  onOpenApp: (appId: AppId, customProps?: Record<string, any>) => void;
  initialPath?: string;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({
  files,
  onUpdateFiles,
  onOpenFile,
  onOpenApp,
  initialPath = 'C:/Users/User/Desktop',
}) => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (path: string) => {
    if (path === currentPath) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedId(null);
    setSearchQuery('');
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedId(null);
    }
  };

  const handleUp = () => {
    if (currentPath === 'C:' || currentPath === 'C:/Recycle Bin') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || 'C:';
    navigateTo(parent);
  };

  // Get current folder items
  const currentItems = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return files.filter(f => f.name.toLowerCase().includes(q));
    }
    return getFilesByDirectory(files, currentPath);
  }, [files, currentPath, searchQuery]);

  const handleItemDoubleClick = (item: VFile) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else if (item.type === 'shortcut' && item.targetApp) {
      onOpenApp(item.targetApp);
    } else {
      onOpenFile(item);
    }
  };

  const handleNewFolder = () => {
    const { updatedFiles } = createNewFolder(files, currentPath, 'New Folder');
    onUpdateFiles(updatedFiles);
  };

  const handleNewTextDoc = () => {
    const { updatedFiles, newFile } = createNewFile(files, currentPath, 'New Document', '', 'txt');
    onUpdateFiles(updatedFiles);
    setEditingId(newFile.id);
    setEditingName(newFile.name);
  };

  const handleDelete = (targetPath?: string) => {
    const pathToDelete = targetPath || (selectedId ? files.find(f => f.id === selectedId)?.path : null);
    if (!pathToDelete) return;
    const updated = deleteFileOrFolder(files, pathToDelete, currentPath.startsWith('C:/Recycle Bin'));
    onUpdateFiles(updated);
    setSelectedId(null);
  };

  const handleStartRename = (item: VFile) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleFinishRename = () => {
    if (editingId && editingName.trim()) {
      const target = files.find(f => f.id === editingId);
      if (target) {
        const updated = renameFileOrFolder(files, target.path, editingName.trim());
        onUpdateFiles(updated);
      }
    }
    setEditingId(null);
  };

  // Upload real file from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    const isImage = uploaded.type.startsWith('image/');
    const isAudio = uploaded.type.startsWith('audio/');

    if (isImage || isAudio) {
      reader.onload = event => {
        const dataUrl = event.target?.result as string;
        const newFile: VFile = {
          id: `upload-${Date.now()}`,
          name: uploaded.name,
          path: `${currentPath}/${uploaded.name}`,
          type: 'file',
          extension: uploaded.name.split('.').pop() || '',
          dataUrl,
          size: uploaded.size,
          updatedAt: new Date().toLocaleDateString(),
        };
        onUpdateFiles([...files, newFile]);
      };
      reader.readAsDataURL(uploaded);
    } else {
      reader.onload = event => {
        const content = event.target?.result as string;
        const newFile: VFile = {
          id: `upload-${Date.now()}`,
          name: uploaded.name,
          path: `${currentPath}/${uploaded.name}`,
          type: 'file',
          extension: uploaded.name.split('.').pop() || '',
          content,
          size: uploaded.size,
          updatedAt: new Date().toLocaleDateString(),
        };
        onUpdateFiles([...files, newFile]);
      };
      reader.readAsText(uploaded);
    }
  };

  // Export / Download to user computer
  const handleExportFile = (item: VFile) => {
    if (item.type === 'folder') return;
    let url = item.dataUrl;
    if (!url && item.content) {
      const blob = new Blob([item.content], { type: 'text/plain' });
      url = URL.createObjectURL(blob);
    }
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const navLinks = [
    { name: 'Desktop', path: 'C:/Users/User/Desktop', icon: Monitor },
    { name: 'Documents', path: 'C:/Users/User/Documents', icon: FileText },
    { name: 'Downloads', path: 'C:/Users/User/Downloads', icon: Download },
    { name: 'Pictures', path: 'C:/Users/User/Pictures', icon: ImageIcon },
    { name: 'Music', path: 'C:/Users/User/Music', icon: Music },
    { name: 'This PC (C:)', path: 'C:', icon: HardDrive },
    { name: 'Recycle Bin', path: 'C:/Recycle Bin', icon: Trash2 },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 select-none">
      {/* Command Bar Ribbon */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-zinc-900/90 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFolder}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
            title="Create a new folder"
          >
            <FolderPlus size={14} className="text-amber-400" />
            <span>New Folder</span>
          </button>
          <button
            onClick={handleNewTextDoc}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
            title="Create a new text document"
          >
            <FilePlus size={14} className="text-blue-400" />
            <span>New Document</span>
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
            title="Upload file from your local machine into virtual OS"
          >
            <Upload size={14} className="text-emerald-400" />
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {selectedId && (
            <>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <button
                onClick={() => {
                  const sel = files.find(f => f.id === selectedId);
                  if (sel) handleStartRename(sel);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
                title="Rename selected item"
              >
                <Edit2 size={13} />
                <span>Rename</span>
              </button>
              <button
                onClick={() => handleDelete()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete selected item"
              >
                <Trash size={13} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => {
                  const sel = files.find(f => f.id === selectedId);
                  if (sel) handleExportFile(sel);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
                title="Download selected file to your computer"
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </>
          )}

          {currentPath === 'C:/Recycle Bin' && (
            <button
              onClick={() => onUpdateFiles(emptyRecycleBin(files))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors ml-2"
            >
              <Trash2 size={13} />
              <span>Empty Recycle Bin</span>
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded-md border border-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Grid View"
          >
            <Grid size={13} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'}`}
            title="Details List View"
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {/* Address & Search Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleUp}
            disabled={currentPath === 'C:' || currentPath === 'C:/Recycle Bin'}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white"
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* Breadcrumbs Path */}
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1 bg-zinc-950/80 border border-white/10 rounded-md text-xs text-zinc-300 overflow-x-auto">
          <HardDrive size={13} className="text-sky-400 flex-shrink-0" />
          <span className="font-mono">{currentPath}</span>
        </div>

        {/* Search */}
        <div className="w-56 relative">
          <Search size={13} className="absolute left-2.5 top-2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1 bg-zinc-950/80 border border-white/10 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left Quick Navigation Tree */}
        <div className="w-48 bg-zinc-900/40 border-r border-white/5 p-2 space-y-0.5 overflow-y-auto hidden sm:block">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase px-2 py-1 tracking-wider">Quick Access</div>
          {navLinks.map(link => {
            const Icon = link.icon;
            const isSelected = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigateTo(link.path)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  isSelected ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-sky-400' : 'text-zinc-400'} />
                <span className="truncate">{link.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Files Area */}
        <div
          className="flex-1 p-3 overflow-y-auto bg-zinc-950/40"
          onClick={() => setSelectedId(null)}
        >
          {currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
              <Folder size={40} className="mb-2 opacity-30 stroke-1" />
              <span>This folder is empty</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {currentItems.map(item => {
                const isSelected = selectedId === item.id;
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedId(item.id);
                    }}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500/40 text-white shadow-sm'
                        : 'border-transparent hover:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="relative mb-1">
                      {item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md shadow"
                        />
                      ) : (
                        <AppIcon
                          iconName={item.iconName || (item.type === 'folder' ? 'Folder' : undefined)}
                          extension={item.extension}
                          size={32}
                          className="w-12 h-12"
                        />
                      )}
                      {item.type === 'shortcut' && (
                        <span className="absolute bottom-0 right-0 p-0.5 bg-zinc-900 rounded-sm shadow">
                          <ExternalLink size={9} className="text-sky-400" />
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleFinishRename();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full text-center text-xs bg-zinc-900 border border-sky-500 rounded px-1 py-0.5 text-white outline-none"
                        />
                        <button onClick={handleFinishRename} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-normal truncate w-full px-1">{item.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Details View */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 text-[11px]">
                  <th className="py-1.5 px-3 font-medium">Name</th>
                  <th className="py-1.5 px-3 font-medium">Date Modified</th>
                  <th className="py-1.5 px-3 font-medium">Type</th>
                  <th className="py-1.5 px-3 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => {
                  const isSelected = selectedId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedId(item.id);
                      }}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-500/20 text-white' : 'hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <td className="py-1.5 px-3 flex items-center gap-2">
                        <AppIcon
                          iconName={item.iconName || (item.type === 'folder' ? 'Folder' : undefined)}
                          extension={item.extension}
                          size={16}
                        />
                        <span className="truncate max-w-xs">{item.name}</span>
                      </td>
                      <td className="py-1.5 px-3 text-zinc-400">{item.updatedAt}</td>
                      <td className="py-1.5 px-3 text-zinc-400 capitalize">{item.type === 'folder' ? 'File folder' : `${item.extension?.toUpperCase() || 'Binary'} File`}</td>
                      <td className="py-1.5 px-3 text-zinc-400 text-right">
                        {item.type === 'folder' ? '' : `${(item.size / 1024).toFixed(1)} KB`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{currentItems.length} items</span>
        <span>{selectedId ? '1 item selected' : 'Local NVMe Storage: 842 GB free of 1.0 TB'}</span>
      </div>
    </div>
  );
};

import { VFile, AppId } from '../types';
import { INITIAL_FILES } from '../data/initialFileSystem';

const FS_STORAGE_KEY = 'winweb_vfs_v1';

export function loadFileSystem(): VFile[] {
  try {
    const data = localStorage.getItem(FS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to load virtual file system from localStorage', err);
  }
  return INITIAL_FILES;
}

export function saveFileSystem(files: VFile[]): void {
  try {
    localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.warn('Failed to save virtual file system to localStorage', err);
  }
}

export function getFilesByDirectory(files: VFile[], dirPath: string): VFile[] {
  const normalizedDir = dirPath.replace(/\/+$/, '');
  return files.filter(file => {
    if (file.path === normalizedDir) return false;
    const parent = file.path.substring(0, file.path.lastIndexOf('/')) || 'C:';
    return parent === normalizedDir;
  });
}

export function getFileByPath(files: VFile[], path: string): VFile | undefined {
  return files.find(f => f.path === path);
}

export function createNewFile(
  files: VFile[],
  parentPath: string,
  name: string,
  content: string = '',
  extension: string = 'txt'
): { updatedFiles: VFile[]; newFile: VFile } {
  const cleanParent = parentPath.replace(/\/+$/, '');
  const fullName = name.includes('.') ? name : `${name}.${extension}`;
  const filePath = `${cleanParent}/${fullName}`;

  // Check if exists, append increment if needed
  let finalPath = filePath;
  let finalName = fullName;
  let counter = 1;
  while (files.some(f => f.path === finalPath)) {
    const extIndex = fullName.lastIndexOf('.');
    const baseName = extIndex !== -1 ? fullName.substring(0, extIndex) : fullName;
    const ext = extIndex !== -1 ? fullName.substring(extIndex) : '';
    finalName = `${baseName} (${counter})${ext}`;
    finalPath = `${cleanParent}/${finalName}`;
    counter++;
  }

  const newFile: VFile = {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: finalName,
    path: finalPath,
    type: 'file',
    extension: finalName.split('.').pop() || extension,
    content,
    size: new Blob([content]).size,
    updatedAt: new Date().toLocaleDateString(),
  };

  const updatedFiles = [...files, newFile];
  saveFileSystem(updatedFiles);
  return { updatedFiles, newFile };
}

export function createNewFolder(
  files: VFile[],
  parentPath: string,
  name: string = 'New Folder'
): { updatedFiles: VFile[]; newFolder: VFile } {
  const cleanParent = parentPath.replace(/\/+$/, '');
  let folderName = name;
  let folderPath = `${cleanParent}/${folderName}`;
  let counter = 1;

  while (files.some(f => f.path === folderPath)) {
    folderName = `${name} (${counter})`;
    folderPath = `${cleanParent}/${folderName}`;
    counter++;
  }

  const newFolder: VFile = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: folderName,
    path: folderPath,
    type: 'folder',
    size: 4096,
    updatedAt: new Date().toLocaleDateString(),
  };

  const updatedFiles = [...files, newFolder];
  saveFileSystem(updatedFiles);
  return { updatedFiles, newFolder };
}

export function deleteFileOrFolder(files: VFile[], targetPath: string, permanent: boolean = false): VFile[] {
  if (permanent || targetPath.startsWith('C:/Recycle Bin')) {
    // Permanently remove target and its children
    const updated = files.filter(f => f.path !== targetPath && !f.path.startsWith(`${targetPath}/`));
    saveFileSystem(updated);
    return updated;
  }

  // Move to Recycle Bin
  const target = files.find(f => f.path === targetPath);
  if (!target) return files;

  const fileName = target.name;
  const newPath = `C:/Recycle Bin/${fileName}`;

  const updated = files.map(f => {
    if (f.path === targetPath) {
      return { ...f, path: newPath };
    }
    if (f.path.startsWith(`${targetPath}/`)) {
      const rel = f.path.substring(targetPath.length);
      return { ...f, path: `${newPath}${rel}` };
    }
    return f;
  });

  saveFileSystem(updated);
  return updated;
}

export function renameFileOrFolder(files: VFile[], oldPath: string, newName: string): VFile[] {
  const target = files.find(f => f.path === oldPath);
  if (!target) return files;

  const parent = oldPath.substring(0, oldPath.lastIndexOf('/')) || 'C:';
  const newPath = `${parent}/${newName}`;

  const updated = files.map(f => {
    if (f.path === oldPath) {
      return { ...f, name: newName, path: newPath, updatedAt: new Date().toLocaleDateString() };
    }
    if (f.path.startsWith(`${oldPath}/`)) {
      const rel = f.path.substring(oldPath.length);
      return { ...f, path: `${newPath}${rel}` };
    }
    return f;
  });

  saveFileSystem(updated);
  return updated;
}

export function updateFileContent(files: VFile[], filePath: string, content: string): VFile[] {
  const updated = files.map(f => {
    if (f.path === filePath) {
      return {
        ...f,
        content,
        size: new Blob([content]).size,
        updatedAt: new Date().toLocaleDateString(),
      };
    }
    return f;
  });
  saveFileSystem(updated);
  return updated;
}

export function restoreFromRecycleBin(files: VFile[], binPath: string): VFile[] {
  const target = files.find(f => f.path === binPath);
  if (!target) return files;

  // Restore to Desktop by default
  const newPath = `C:/Users/User/Desktop/${target.name}`;
  const updated = files.map(f => {
    if (f.path === binPath) {
      return { ...f, path: newPath };
    }
    return f;
  });
  saveFileSystem(updated);
  return updated;
}

export function emptyRecycleBin(files: VFile[]): VFile[] {
  const updated = files.filter(f => !f.path.startsWith('C:/Recycle Bin/') && f.path !== 'C:/Recycle Bin/This PC');
  saveFileSystem(updated);
  return updated;
}

export function searchFileSystem(files: VFile[], query: string): VFile[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];
  return files.filter(f => f.name.toLowerCase().includes(lower) || (f.content && f.content.toLowerCase().includes(lower)));
}

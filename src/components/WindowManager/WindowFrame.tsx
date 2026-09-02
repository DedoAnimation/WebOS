import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { WindowState, SnapPosition } from '../../types';
import { AppIcon } from '../Common/AppIcon';
import { SnapLayoutMenu } from './SnapLayoutMenu';

interface WindowFrameProps {
  window: WindowState;
  isActive: boolean;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onClose: (id: string) => void;
  onUpdateBounds: (id: string, updates: Partial<WindowState>) => void;
  onSnap: (id: string, position: SnapPosition) => void;
  onDragSnapPreview: (position: SnapPosition) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  isActive,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  onUpdateBounds,
  onSnap,
  onDragSnapPreview,
  children,
}) => {
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef<string | null>(null);
  const initialPosRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0, winW: 0, winH: 0 });

  // Calculate coordinates & size based on snap/maximized state
  let computedStyle: React.CSSProperties = {
    zIndex: win.zIndex,
  };

  if (win.isMinimized) {
    computedStyle.display = 'none';
  } else if (win.isMaximized) {
    computedStyle.top = 0;
    computedStyle.left = 0;
    computedStyle.width = '100vw';
    computedStyle.height = 'calc(100vh - 48px)';
    computedStyle.borderRadius = '0px';
  } else if (win.snapPosition !== 'none') {
    switch (win.snapPosition) {
      case 'left':
        computedStyle.top = 8;
        computedStyle.left = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(100vh - 64px)';
        break;
      case 'right':
        computedStyle.top = 8;
        computedStyle.right = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(100vh - 64px)';
        break;
      case 'top-left':
        computedStyle.top = 8;
        computedStyle.left = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(50vh - 36px)';
        break;
      case 'top-right':
        computedStyle.top = 8;
        computedStyle.right = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(50vh - 36px)';
        break;
      case 'bottom-left':
        computedStyle.top = 'calc(50vh - 20px)';
        computedStyle.left = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(50vh - 36px)';
        break;
      case 'bottom-right':
        computedStyle.top = 'calc(50vh - 20px)';
        computedStyle.right = 8;
        computedStyle.width = 'calc(50vw - 12px)';
        computedStyle.height = 'calc(50vh - 36px)';
        break;
      default:
        computedStyle.top = win.y;
        computedStyle.left = win.x;
        computedStyle.width = win.width;
        computedStyle.height = win.height;
    }
  } else {
    computedStyle.top = win.y;
    computedStyle.left = win.x;
    computedStyle.width = win.width;
    computedStyle.height = win.height;
  }

  // Handle Dragging
  const handleTitlebarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onFocus(win.id);

    // If maximized or snapped, clicking and dragging restores window first
    let startX = win.x;
    let startY = win.y;
    if (win.isMaximized || win.snapPosition !== 'none') {
      const restoredX = Math.max(10, e.clientX - win.width / 2);
      const restoredY = Math.max(10, e.clientY - 20);
      onUpdateBounds(win.id, { isMaximized: false, snapPosition: 'none', x: restoredX, y: restoredY });
      startX = restoredX;
      startY = restoredY;
    }

    isDraggingRef.current = true;
    initialPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: startX,
      winY: startY,
      winW: win.width,
      winH: win.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - initialPosRef.current.mouseX;
      const dy = moveEvent.clientY - initialPosRef.current.mouseY;

      const newX = initialPosRef.current.winX + dx;
      const newY = Math.max(0, initialPosRef.current.winY + dy);

      // Edge snapping detection for live preview
      if (moveEvent.clientY <= 5) {
        onDragSnapPreview('maximize');
      } else if (moveEvent.clientX <= 10) {
        onDragSnapPreview('left');
      } else if (moveEvent.clientX >= window.innerWidth - 10) {
        onDragSnapPreview('right');
      } else {
        onDragSnapPreview('none');
      }

      onUpdateBounds(win.id, { x: newX, y: newY, isMaximized: false, snapPosition: 'none' });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      onDragSnapPreview('none');

      // Check drop snap triggers
      if (upEvent.clientY <= 5) {
        onMaximize(win.id);
      } else if (upEvent.clientX <= 10) {
        onSnap(win.id, 'left');
      } else if (upEvent.clientX >= window.innerWidth - 10) {
        onSnap(win.id, 'right');
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Resizing
  const handleResizeStart = (dir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus(win.id);

    if (win.isMaximized || win.snapPosition !== 'none') return;

    isResizingRef.current = true;
    resizeDirRef.current = dir;
    initialPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.x,
      winY: win.y,
      winW: win.width,
      winH: win.height,
    };

    const handleResizeMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current || !resizeDirRef.current) return;
      const dx = moveEvent.clientX - initialPosRef.current.mouseX;
      const dy = moveEvent.clientY - initialPosRef.current.mouseY;

      let newX = initialPosRef.current.winX;
      let newY = initialPosRef.current.winY;
      let newW = initialPosRef.current.winW;
      let newH = initialPosRef.current.winH;

      const minW = win.minWidth || 320;
      const minH = win.minHeight || 240;

      if (resizeDirRef.current.includes('e')) {
        newW = Math.max(minW, initialPosRef.current.winW + dx);
      }
      if (resizeDirRef.current.includes('s')) {
        newH = Math.max(minH, initialPosRef.current.winH + dy);
      }
      if (resizeDirRef.current.includes('w')) {
        const potentialW = initialPosRef.current.winW - dx;
        if (potentialW >= minW) {
          newW = potentialW;
          newX = initialPosRef.current.winX + dx;
        }
      }
      if (resizeDirRef.current.includes('n')) {
        const potentialH = initialPosRef.current.winH - dy;
        if (potentialH >= minH) {
          newH = potentialH;
          newY = initialPosRef.current.winY + dy;
        }
      }

      onUpdateBounds(win.id, { x: newX, y: newY, width: newW, height: newH });
    };

    const handleResizeEnd = () => {
      isResizingRef.current = false;
      resizeDirRef.current = null;
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      id={`window-${win.id}`}
      style={computedStyle}
      onClick={() => onFocus(win.id)}
      className={`fixed flex flex-col rounded-lg shadow-2xl border transition-all duration-75 select-none overflow-hidden ${
        isActive
          ? 'bg-white border-gray-300 ring-1 ring-blue-500/20'
          : 'bg-white/95 border-gray-200/90 shadow-xl opacity-95'
      } ${win.isMaximized ? '!rounded-none !ring-0 !border-0' : ''}`}
    >
      {/* Titlebar */}
      <div
        onMouseDown={handleTitlebarMouseDown}
        onDoubleClick={() => onMaximize(win.id)}
        className={`h-10 px-4 flex items-center justify-between border-b transition-colors cursor-default ${
          isActive
            ? 'bg-gray-50 border-gray-200 text-gray-800'
            : 'bg-gray-100/70 border-gray-200 text-gray-500'
        }`}
      >
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2.5 overflow-hidden pr-2">
          <AppIcon iconName={win.iconName} size={16} />
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[220px] sm:max-w-xs">{win.title}</span>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center -mr-4 relative" onMouseDown={e => e.stopPropagation()}>
          {/* Minimize Button */}
          <button
            onClick={() => onMinimize(win.id)}
            className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>

          {/* Maximize / Restore Button with Hover Snap Layouts */}
          <div
            className="relative"
            onMouseEnter={() => setShowSnapMenu(true)}
            onMouseLeave={() => setShowSnapMenu(false)}
          >
            <button
              onClick={() => onMaximize(win.id)}
              className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
              title={win.isMaximized ? 'Restore' : 'Maximize'}
            >
              {win.isMaximized || win.snapPosition !== 'none' ? <Copy size={12} /> : <Square size={12} />}
            </button>

            {showSnapMenu && (
              <SnapLayoutMenu
                onSelectSnap={pos => onSnap(win.id, pos)}
                onClose={() => setShowSnapMenu(false)}
              />
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => onClose(win.id)}
            className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-white text-gray-800">
        {children}
      </div>

      {/* 8 Resize Handles (only active when not maximized or snapped) */}
      {!win.isMaximized && win.snapPosition === 'none' && (
        <>
          <div
            onMouseDown={e => handleResizeStart('n', e)}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('s', e)}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('w', e)}
            className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('e', e)}
            className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('nw', e)}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('ne', e)}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('sw', e)}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-30"
          />
          <div
            onMouseDown={e => handleResizeStart('se', e)}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-30"
          />
        </>
      )}
    </div>
  );
};

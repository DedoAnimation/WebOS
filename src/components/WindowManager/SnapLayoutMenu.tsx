import React from 'react';
import { SnapPosition } from '../../types';

interface SnapLayoutMenuProps {
  onSelectSnap: (position: SnapPosition) => void;
  onClose: () => void;
}

export const SnapLayoutMenu: React.FC<SnapLayoutMenuProps> = ({ onSelectSnap, onClose }) => {
  return (
    <div
      className="absolute top-10 right-8 z-50 p-3 bg-zinc-900/95 border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl grid grid-cols-2 gap-3 w-64 animate-in fade-in zoom-in-95 duration-100"
      onMouseLeave={onClose}
    >
      {/* 50 / 50 Split */}
      <div className="flex gap-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group border border-white/10">
        <button
          onClick={() => { onSelectSnap('left'); onClose(); }}
          className="flex-1 h-16 bg-zinc-800 rounded group-hover:bg-sky-500/40 hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Snap Left (50%)"
        />
        <button
          onClick={() => { onSelectSnap('right'); onClose(); }}
          className="flex-1 h-16 bg-zinc-800 rounded group-hover:bg-sky-500/40 hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Snap Right (50%)"
        />
      </div>

      {/* 4 Corners Split */}
      <div className="grid grid-cols-2 gap-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group border border-white/10">
        <button
          onClick={() => { onSelectSnap('top-left'); onClose(); }}
          className="h-7 bg-zinc-800 rounded hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Top Left (25%)"
        />
        <button
          onClick={() => { onSelectSnap('top-right'); onClose(); }}
          className="h-7 bg-zinc-800 rounded hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Top Right (25%)"
        />
        <button
          onClick={() => { onSelectSnap('bottom-left'); onClose(); }}
          className="h-7 bg-zinc-800 rounded hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Bottom Left (25%)"
        />
        <button
          onClick={() => { onSelectSnap('bottom-right'); onClose(); }}
          className="h-7 bg-zinc-800 rounded hover:!bg-sky-500 border border-white/10 transition-colors"
          title="Bottom Right (25%)"
        />
      </div>
    </div>
  );
};

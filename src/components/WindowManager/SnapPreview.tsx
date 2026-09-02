import React from 'react';
import { SnapPosition } from '../../types';

interface SnapPreviewProps {
  position: SnapPosition;
}

export const SnapPreview: React.FC<SnapPreviewProps> = ({ position }) => {
  if (position === 'none') return null;

  let style: React.CSSProperties = {};

  switch (position) {
    case 'left':
      style = { top: 8, left: 8, bottom: 56, width: 'calc(50% - 12px)' };
      break;
    case 'right':
      style = { top: 8, right: 8, bottom: 56, width: 'calc(50% - 12px)' };
      break;
    case 'maximize':
      style = { top: 8, left: 8, right: 8, bottom: 56 };
      break;
    case 'top-left':
      style = { top: 8, left: 8, height: 'calc(50% - 32px)', width: 'calc(50% - 12px)' };
      break;
    case 'top-right':
      style = { top: 8, right: 8, height: 'calc(50% - 32px)', width: 'calc(50% - 12px)' };
      break;
    case 'bottom-left':
      style = { top: 'calc(50% - 20px)', left: 8, bottom: 56, width: 'calc(50% - 12px)' };
      break;
    case 'bottom-right':
      style = { top: 'calc(50% - 20px)', right: 8, bottom: 56, width: 'calc(50% - 12px)' };
      break;
  }

  return (
    <div
      style={style}
      className="fixed z-40 bg-sky-500/20 border-2 border-sky-400/60 rounded-xl backdrop-blur-xs pointer-events-none transition-all duration-150 animate-in fade-in"
    />
  );
};

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Sliders,
  Wallpaper,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
} from 'lucide-react';
import { VFile } from '../../types';

interface PhotoGalleryAppProps {
  files: VFile[];
  initialFile?: VFile;
  onSetWallpaper?: (url: string) => void;
}

const DEFAULT_PHOTOS = [
  {
    name: 'Windows 11 Bloom Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Nordic Aurora',
    url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Cyberpunk Metropolis',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Alpine Sunrise',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
  },
];

export const PhotoGalleryApp: React.FC<PhotoGalleryAppProps> = ({
  files,
  initialFile,
  onSetWallpaper,
}) => {
  // Combine files with image dataUrl / extensions and default photos
  const pictureFiles = files
    .filter(f => f.dataUrl || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(f.extension || ''))
    .map(f => ({ name: f.name, url: f.dataUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80' }));

  const allPhotos = pictureFiles.length > 0 ? pictureFiles : DEFAULT_PHOTOS;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'grayscale' | 'sepia' | 'invert' | 'contrast' | 'warm'>('normal');
  const [isSlideshow, setIsSlideshow] = useState<boolean>(false);
  const [wallpaperSetSuccess, setWallpaperSetSuccess] = useState<boolean>(false);

  const currentPhoto = allPhotos[currentIndex] || allPhotos[0];

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % allPhotos.length);
    setZoom(1);
    setRotation(0);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + allPhotos.length) % allPhotos.length);
    setZoom(1);
    setRotation(0);
  };

  const filterStyles = {
    normal: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(90%)',
    invert: 'invert(100%)',
    contrast: 'contrast(180%) saturate(140%)',
    warm: 'sepia(30%) saturate(150%) hue-rotate(-15deg)',
  }[activeFilter];

  const handleApplyWallpaper = () => {
    if (onSetWallpaper && currentPhoto?.url) {
      onSetWallpaper(currentPhoto.url);
      setWallpaperSetSuccess(true);
      setTimeout(() => setWallpaperSetSuccess(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-white/10 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="font-mono text-[11px] text-zinc-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => setRotation((rotation + 90) % 360)}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Rotate 90°"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={() => setIsSlideshow(!isSlideshow)}
            className={`p-1.5 rounded ${isSlideshow ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}
            title="Slideshow"
          >
            {isSlideshow ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>

        {/* Filter Presets */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-white/10">
          {(['normal', 'grayscale', 'sepia', 'invert', 'contrast', 'warm'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                activeFilter === f ? 'bg-sky-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Set as Wallpaper Button */}
        <button
          onClick={handleApplyWallpaper}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-md transition-colors"
          title="Set this image as OS wallpaper"
        >
          {wallpaperSetSuccess ? <Check size={13} className="text-emerald-400" /> : <Wallpaper size={13} />}
          <span>{wallpaperSetSuccess ? 'Applied!' : 'Set Wallpaper'}</span>
        </button>
      </div>

      {/* Main Picture Stage */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-zinc-950/80">
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-zinc-900/80 hover:bg-zinc-800 rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg z-10 transition-transform active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        <img
          src={currentPhoto.url}
          alt={currentPhoto.name}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            filter: filterStyles,
          }}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-zinc-900/80 hover:bg-zinc-800 rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg z-10 transition-transform active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Footer Thumbnail Strip */}
      <div className="h-16 px-4 bg-zinc-900/90 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
        {allPhotos.map((p, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <img
              key={idx}
              src={p.url}
              alt={p.name}
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
                setRotation(0);
              }}
              className={`h-11 w-16 object-cover rounded-md cursor-pointer border-2 transition-all ${
                isSelected ? 'border-sky-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

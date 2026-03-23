import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  viewMode?: 'slider' | 'side-by-side';
  onViewModeChange?: (mode: 'slider' | 'side-by-side') => void;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'ORIGINAL',
  afterLabel = 'PROCESSED',
  viewMode = 'slider',
  onViewModeChange,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  if (viewMode === 'side-by-side') {
    return (
      <div className="w-full space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange?.('slider')}
            className="btn-arcade-cyan text-xs md:text-sm px-3 md:px-4 py-2"
          >
            SLIDER VIEW
          </button>
          <button
            onClick={() => onViewModeChange?.('side-by-side')}
            className="btn-arcade text-xs md:text-sm px-3 md:px-4 py-2"
          >
            SIDE-BY-SIDE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Image */}
          <div className="pixel-border-cyan p-2">
            <div className="relative bg-slate-900 aspect-square overflow-hidden">
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 scanlines pointer-events-none" />
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-cyan-500 text-slate-900 font-bold text-xs arcade-glow-cyan">
                {beforeLabel}
              </div>
            </div>
          </div>

          {/* After Image */}
          <div className="pixel-border p-2">
            <div className="relative bg-slate-900 aspect-square overflow-hidden">
              <img
                src={afterImage}
                alt={afterLabel}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 scanlines pointer-events-none" />
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-lime-400 text-slate-900 font-bold text-xs arcade-glow">
                {afterLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slider view (default)
  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => onViewModeChange?.('slider')}
          className="btn-arcade text-xs md:text-sm px-3 md:px-4 py-2"
        >
          SLIDER VIEW
        </button>
        <button
          onClick={() => onViewModeChange?.('side-by-side')}
          className="btn-arcade-cyan text-xs md:text-sm px-3 md:px-4 py-2"
        >
          SIDE-BY-SIDE
        </button>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="pixel-border relative bg-slate-900 aspect-square overflow-hidden cursor-col-resize select-none"
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-contain"
            draggable={false}
          />
          <div className="absolute inset-0 scanlines pointer-events-none" />
        </div>

        {/* After Image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-contain"
            style={{ width: `${containerWidth}px` }}
            draggable={false}
          />
          <div className="absolute inset-0 scanlines pointer-events-none" />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-col-resize"
          style={{
            left: `${sliderPosition}%`,
            boxShadow: '0 0 20px rgb(0 255 255 / 0.8)',
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 p-2">
            <Eye size={16} className="text-slate-900" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 px-3 py-1 bg-cyan-500 text-slate-900 font-bold text-xs arcade-glow-cyan pointer-events-none">
          {beforeLabel}
        </div>
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-lime-400 text-slate-900 font-bold text-xs arcade-glow pointer-events-none">
          {afterLabel}
        </div>

        {/* Position indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border-2 border-cyan-400 text-cyan-400 font-bold text-xs arcade-glow-cyan pointer-events-none">
          {Math.round(sliderPosition)}%
        </div>
      </div>
    </div>
  );
};

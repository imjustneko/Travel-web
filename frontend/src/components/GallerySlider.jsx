import { useState, useEffect, useRef, useCallback } from 'react';

const AUTOPLAY_DELAY = 4000;

function GallerySlider({ images }) {
  const [current, setCurrent] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef(null);
  const total = images.length;

  const goTo = useCallback((index) => {
    setCurrent(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, AUTOPLAY_DELAY);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  // ── Drag / swipe ──
  const startDrag = (clientX) => {
    setDragStartX(clientX);
    setDragDelta(0);
    setIsDragging(true);
    clearInterval(timerRef.current);
  };

  const moveDrag = (clientX) => {
    if (dragStartX === null) return;
    setDragDelta(clientX - dragStartX);
  };

  const endDrag = (clientX) => {
    if (dragStartX === null) return;
    const delta = clientX - dragStartX;
    if (delta < -50) next();
    else if (delta > 50) prev();
    setDragStartX(null);
    setDragDelta(0);
    setIsDragging(false);
    resetTimer();
  };

  const cancelDrag = () => {
    setDragStartX(null);
    setDragDelta(0);
    setIsDragging(false);
    resetTimer();
  };

  if (!images || total === 0) return null;

  // Clamp live drag offset for visual feedback (max ±120px)
  const liveOffset = isDragging ? Math.max(-120, Math.min(120, dragDelta)) : 0;

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      // Mouse
      onMouseDown={e => startDrag(e.clientX)}
      onMouseMove={e => isDragging && moveDrag(e.clientX)}
      onMouseUp={e => endDrag(e.clientX)}
      onMouseLeave={cancelDrag}
      // Touch
      onTouchStart={e => startDrag(e.touches[0].clientX)}
      onTouchMove={e => moveDrag(e.touches[0].clientX)}
      onTouchEnd={e => endDrag(e.changedTouches[0].clientX)}
    >
      {/* Slides */}
      <div
        className="flex"
        style={{
          transform: `translateX(calc(-${current * 100}% + ${liveOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="min-w-full h-[55vh] md:h-[70vh] flex-shrink-0">
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

      {/* Counter — top right */}
      <div className="absolute top-5 right-6 text-white/70 text-xs font-medium tracking-widest pointer-events-none">
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Arrow buttons */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); resetTimer(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); resetTimer(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 pointer-events-none">
        <div
          key={current}
          className="h-full bg-white/40"
          style={{
            animation: `progressBar ${AUTOPLAY_DELAY}ms linear`,
          }}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}

export default GallerySlider;

"use client";

import { useState, useRef, useCallback } from "react";

type Image = {
  id: string;
  url: string;
  alt_text: string | null;
};

export default function ImageGallery({ images }: { images: Image[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = images[active];
  if (!current) return null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActive((i) => Math.min(i + 1, images.length - 1));
      else setActive((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-3">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActive(i)}
                className={`w-14 h-16 rounded-md overflow-hidden border-2 shrink-0 transition-colors ${
                  i === active ? "border-neutral-900" : "border-transparent hover:border-neutral-300"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden rounded-lg bg-neutral-100 cursor-crosshair"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setLightbox(true)}
        >
          <div className="aspect-[3/4]">
            <img
              src={current.url}
              alt={current.alt_text || "Product image"}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>
          {zoom && (
            <div
              className="absolute inset-0 pointer-events-none hidden md:block"
              style={{
                backgroundImage: `url(${current.url})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: "200%",
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === active ? "bg-neutral-900" : "bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => Math.max(i - 1, 0)); }}
                className="absolute left-4 text-white/60 hover:text-white"
                disabled={active === 0}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => Math.min(i + 1, images.length - 1)); }}
                className="absolute right-4 text-white/60 hover:text-white"
                disabled={active === images.length - 1}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
          <img
            src={current.url}
            alt={current.alt_text || ""}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

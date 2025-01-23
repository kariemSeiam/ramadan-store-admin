import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, imageUrl }) => {
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  const viewerRef = useRef(null);
  const imageRef = useRef(null);
  const touchesRef = useRef([]);
  const initialPinchDistanceRef = useRef(null);
  const lastTransformRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef(null);
  const boundariesRef = useRef({ x: 0, y: 0 });

  // Calculate boundaries for panning
  const calculateBoundaries = useCallback(() => {
    if (!imageRef.current || !viewerRef.current) return;

    const viewerRect = viewerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    const scaledWidth = imageRect.width * transform.scale;
    const scaledHeight = imageRect.height * transform.scale;

    boundariesRef.current = {
      x: Math.max(0, (scaledWidth - viewerRect.width) / 2),
      y: Math.max(0, (scaledHeight - viewerRect.height) / 2)
    };
  }, [transform.scale]);

  // Utility functions
  const getDistance = useCallback((touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getMidpoint = useCallback((touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  const constrainTranslation = useCallback((x, y) => {
    const { x: maxX, y: maxY } = boundariesRef.current;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, []);

  // Animation handlers
  const applyInertia = useCallback(() => {
    if (Math.abs(velocityRef.current.x) < 0.01 && Math.abs(velocityRef.current.y) < 0.01) {
      cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    setTransform(prev => {
      const newTranslateX = prev.translateX + velocityRef.current.x;
      const newTranslateY = prev.translateY + velocityRef.current.y;
      
      const constrained = constrainTranslation(newTranslateX, newTranslateY);

      velocityRef.current.x *= 0.95;
      velocityRef.current.y *= 0.95;

      return {
        ...prev,
        translateX: constrained.x,
        translateY: constrained.y
      };
    });

    animationFrameRef.current = requestAnimationFrame(applyInertia);
  }, [constrainTranslation]);

  // Touch event handlers
  const handleDoubleTap = useCallback((x, y) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (now - lastTap.time < 300 && 
        Math.abs(x - lastTap.x) < 30 && 
        Math.abs(y - lastTap.y) < 30) {
      
      setTransform(prev => ({
        scale: prev.scale === 1 ? 2.5 : 1,
        translateX: 0,
        translateY: 0
      }));
      
      lastTapRef.current = { time: 0, x: 0, y: 0 };
    } else {
      lastTapRef.current = { time: now, x, y };
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    cancelAnimationFrame(animationFrameRef.current);
    velocityRef.current = { x: 0, y: 0 };
    touchesRef.current = [...e.touches];
    lastTimeRef.current = Date.now();
    
    if (e.touches.length === 1) {
      handleDoubleTap(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    if (e.touches.length === 2) {
      initialPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      lastTransformRef.current = transform;
    }
  }, [getDistance, handleDoubleTap, transform]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    
    if (e.touches.length === 1 && transform.scale > 1) {
      const touch = e.touches[0];
      const prevTouch = touchesRef.current[0];
      
      if (prevTouch) {
        const deltaX = touch.clientX - prevTouch.clientX;
        const deltaY = touch.clientY - prevTouch.clientY;
        
        velocityRef.current = {
          x: deltaX / timeDelta * 16,
          y: deltaY / timeDelta * 16
        };

        setTransform(prev => {
          const newTranslateX = prev.translateX + deltaX;
          const newTranslateY = prev.translateY + deltaY;
          const constrained = constrainTranslation(newTranslateX, newTranslateY);
          
          return {
            ...prev,
            translateX: constrained.x,
            translateY: constrained.y
          };
        });
      }
    }
    
    if (e.touches.length === 2) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const initialDistance = initialPinchDistanceRef.current;
      const midpoint = getMidpoint(e.touches[0], e.touches[1]);
      
      if (initialDistance) {
        const scale = Math.min(
          Math.max(
            lastTransformRef.current.scale * (currentDistance / initialDistance),
            1
          ),
          5
        );
        
        const viewerRect = viewerRef.current?.getBoundingClientRect();
        if (viewerRect) {
          const offsetX = (midpoint.x - viewerRect.left) - viewerRect.width / 2;
          const offsetY = (midpoint.y - viewerRect.top) - viewerRect.height / 2;
          
          setTransform(prev => ({
            scale,
            translateX: scale === 1 ? 0 : (offsetX * (scale / prev.scale - 1) + prev.translateX),
            translateY: scale === 1 ? 0 : (offsetY * (scale / prev.scale - 1) + prev.translateY)
          }));
        }
      }
    }
    
    touchesRef.current = [...e.touches];
    lastTimeRef.current = now;
  }, [constrainTranslation, getDistance, getMidpoint, transform.scale]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0 && transform.scale > 1) {
      applyInertia();
    }
    
    if (e.touches.length === 0) {
      initialPinchDistanceRef.current = null;
    }
    
    touchesRef.current = [...e.touches];
  }, [applyInertia, transform.scale]);

  // Effect for event listeners
  useEffect(() => {
    if (isOpen && viewerRef.current) {
      const element = viewerRef.current;
      
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Effect for boundaries calculation
  useEffect(() => {
    calculateBoundaries();
  }, [calculateBoundaries, transform.scale]);

  // Effect for cleanup
  useEffect(() => {
    if (!isOpen) {
      setTransform({ scale: 1, translateX: 0, translateY: 0 });
      lastTransformRef.current = { scale: 1, translateX: 0, translateY: 0 };
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isOpen]);

  // Button handlers
  const handleZoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale + 0.5, 5)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform(prev => ({
      scale: Math.max(prev.scale - 0.5, 1),
      translateX: prev.scale <= 1.5 ? 0 : prev.translateX,
      translateY: prev.scale <= 1.5 ? 0 : prev.translateY
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 text-white
                 hover:bg-gray-700/50 transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        <button
          onClick={handleZoomOut}
          disabled={transform.scale === 1}
          className="p-3 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        <button
          onClick={handleZoomIn}
          disabled={transform.scale === 5}
          className="p-3 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
      </div>

      <div
        ref={viewerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
      >
        {transform.scale === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 text-white/80">
              Double tap or pinch to zoom
            </div>
          </div>
        )}
        
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Product view"
          className="max-w-full max-h-full object-contain select-none will-change-transform"
          style={{
            transform: `scale(${transform.scale}) translate(${transform.translateX / transform.scale}px, ${transform.translateY / transform.scale}px)`,
            transition: transform.scale === 1 ? 'transform 0.3s ease-out' : 'none'
          }}
          draggable="false"
        />
      </div>
    </div>
  );
};

export default ImageViewer;
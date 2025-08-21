import React, { useEffect, useRef } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
  const trailRef = useRef([]);
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create trail elements
    for (let i = 0; i < 20; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: linear-gradient(45deg, #0d9488, #f97316);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(13, 148, 136, 0.6);
      `;
      container.appendChild(trail);
      trailRef.current.push(trail);
    }

    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;

    const updateTrail = () => {
      trailRef.current.forEach((trail, index) => {
        const delay = index * 0.02;
        const opacity = (20 - index) / 20;
        const scale = (20 - index) / 25;
        
        setTimeout(() => {
          if (trail) {
            trail.style.left = `${mouseX - 4}px`;
            trail.style.top = `${mouseY - 4}px`;
            trail.style.opacity = isMoving ? opacity : 0;
            trail.style.transform = `scale(${scale})`;
          }
        }, delay * 100);
      });
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      updateTrail();
    };

    const handleMouseStop = () => {
      isMoving = false;
      setTimeout(() => {
        trailRef.current.forEach(trail => {
          if (trail) trail.style.opacity = 0;
        });
      }, 100);
    };

    let timeout;
    const handleMouseMoveWithStop = (e) => {
      handleMouseMove(e);
      clearTimeout(timeout);
      timeout = setTimeout(handleMouseStop, 150);
    };

    document.addEventListener('mousemove', handleMouseMoveWithStop);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveWithStop);
      trailRef.current.forEach(trail => {
        if (trail && trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
      trailRef.current = [];
    };
  }, []);

  return <div ref={containerRef} className="cursor-trail-container" />;
};

export default CursorTrail;

import React, { useEffect, useRef, useState } from 'react';
import './EnhancedCursor.css';

const EnhancedCursor = () => {
  const cursorRef = useRef();
  const cursorDotRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    const updateCursor = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      setPosition({ x, y });
      
      if (cursor) {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      }
      
      if (cursorDot) {
        cursorDot.style.left = `${x}px`;
        cursorDot.style.top = `${y}px`;
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e) => {
      const target = e.target;
      if (target.matches('a, button, .clickable, [role="button"], input, select, textarea')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e) => {
      const target = e.target;
      if (target.matches('a, button, .clickable, [role="button"], input, select, textarea')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`enhanced-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
      />
      
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className={`enhanced-cursor-dot ${isClicking ? 'clicking' : ''}`}
      />
    </>
  );
};

export default EnhancedCursor;

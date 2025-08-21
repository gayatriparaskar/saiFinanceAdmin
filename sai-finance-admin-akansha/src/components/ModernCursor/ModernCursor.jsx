import React, { useEffect, useRef, useState } from 'react';
import './ModernCursor.css';

const ModernCursor = () => {
  const cursorRef = useRef();
  const cursorDotRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
      if (target.matches('a, button, .clickable, [role="button"]')) {
        setIsHovering(true);
      }
      if (target.matches('input, select, textarea')) {
        setIsTyping(true);
      }
    };

    const handleMouseLeave = (e) => {
      const target = e.target;
      if (target.matches('a, button, .clickable, [role="button"]')) {
        setIsHovering(false);
      }
      if (target.matches('input, select, textarea')) {
        setIsTyping(false);
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
      {/* Main cursor outer ring */}
      <div
        ref={cursorRef}
        className={`modern-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''} ${isTyping ? 'typing' : ''}`}
      >
        <div className="cursor-inner-ring"></div>
      </div>
      
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className={`modern-cursor-dot ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''} ${isTyping ? 'typing' : ''}`}
      />
      
      {/* Trailing particles */}
      <div className="cursor-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>
    </>
  );
};

export default ModernCursor;

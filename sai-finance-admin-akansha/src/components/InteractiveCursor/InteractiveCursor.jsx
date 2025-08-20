import React, { useEffect, useState, useRef } from 'react';
import './InteractiveCursor.css';

const InteractiveCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef();

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e) => {
      const target = e.target;
      if (target.matches('a, button, .clickable, [role="button"]')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e) => {
      const target = e.target;
      if (target.matches('a, button, .clickable, [role="button"]')) {
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
    <div
      ref={cursorRef}
      className={`interactive-cursor ${isClicking ? 'clicking' : ''} ${isHovering ? 'hovering' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default InteractiveCursor;

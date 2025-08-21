import React, { useEffect, useRef, useState } from 'react';
import './ColoredCursor.css';

const ColoredCursor = () => {
  const cursorRef = useRef();
  const [isHovering, setIsHovering] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
    let isMoving = false;

    const updateCursorPosition = () => {
      if (cursorRef.current && isMoving) {
        cursorRef.current.style.transform = `translate(${mousePosition.current.x}px, ${mousePosition.current.y}px)`;
        isMoving = false;
      }
      requestRef.current = requestAnimationFrame(updateCursorPosition);
    };

    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      isMoving = true;
    };

    const handleMouseOver = (e) => {
      const isInteractive = e.target.matches('button, a, input, select, textarea, [role="button"], .hover-trigger');
      setIsHovering(isInteractive);
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    // Start the animation loop
    requestRef.current = requestAnimationFrame(updateCursorPosition);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`colored-cursor ${isHovering ? 'hover' : ''}`}
    >
      <div className="cursor-dot"></div>
    </div>
  );
};

export default ColoredCursor;

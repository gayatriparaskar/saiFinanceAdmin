import React, { useEffect, useRef, useState } from 'react';
import './ColoredCursor.css';

const ColoredCursor = () => {
  const cursorRef = useRef();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e) => {
      const isInteractive = e.target.matches('button, a, input, select, textarea, [role="button"]');
      setIsHovering(isInteractive);
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
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

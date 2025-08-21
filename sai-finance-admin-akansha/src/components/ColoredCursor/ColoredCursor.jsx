import React, { useEffect, useRef } from 'react';
import './ColoredCursor.css';

const ColoredCursor = () => {
  const cursorRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="colored-cursor"
    >
      <div className="cursor-dot"></div>
    </div>
  );
};

export default ColoredCursor;

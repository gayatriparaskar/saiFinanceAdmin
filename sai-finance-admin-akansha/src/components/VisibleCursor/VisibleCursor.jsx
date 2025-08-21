import React, { useEffect, useRef } from 'react';
import './VisibleCursor.css';

const VisibleCursor = () => {
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
      className="visible-cursor"
    >
      <div className="cursor-circle"></div>
    </div>
  );
};

export default VisibleCursor;

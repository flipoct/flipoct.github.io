import React from 'react';
import './YearMarker.css';

const YearMarker = ({ year, position }) => {
  const style = {
    left: `${position}px`,
  };

  return (
    <div className="year-marker" style={style}>
      <span className="year-label">{year}</span>
    </div>
  );
};

export default YearMarker;

import React from 'react';
import './MonthMarker.css';

const MonthMarker = ({ label, position }) => {
  const style = {
    left: `${position}px`,
  };
  return (
    <div className="month-marker" style={style}>
      <span className="month-label">{label}</span>
    </div>
  );
};

export default MonthMarker;

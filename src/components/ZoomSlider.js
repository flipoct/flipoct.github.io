import React from 'react';
import './ZoomSlider.css';

const ZoomSlider = ({ zoom, onZoomChange }) => {
  return (
    <div className="zoom-slider-container">
      <input
        type="range"
        min="1"
        max="100"
        value={zoom}
        onChange={onZoomChange}
        className="zoom-slider"
      />
    </div>
  );
};

export default ZoomSlider;

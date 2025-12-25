import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import PostDot from './PostDot';
import YearMarker from './YearMarker';
import MonthMarker from './MonthMarker';
import ZoomSlider from './ZoomSlider';
import './Timeline.css';

const Timeline = ({ posts }) => {
  const [zoom, setZoom] = useState(10);
  const viewportRef = useRef(null);
  const centerDateRef = useRef(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [viewportScroll, setViewportScroll] = useState(0);

  // --- Scaling Logic ---
  const minPxPerYear = 20;
  const maxPxPerYear = 4000;
  const pxPerYear = minPxPerYear + ((maxPxPerYear - minPxPerYear) / 99) * (zoom - 1);
  const totalYears = 4000;
  const totalWidth = totalYears * pxPerYear;

  // --- Position Calculation ---
  const dateToPx = (date) => {
    const yearAsFloat = date.getFullYear() + (date.getMonth() / 12) + (date.getDate() / 365.25);
    return yearAsFloat * pxPerYear;
  };
  const pxToDate = (px) => {
    const yearAsFloat = px / pxPerYear;
    const year = Math.floor(yearAsFloat);
    const dayOfYear = Math.floor((yearAsFloat - year) * 365.25);
    return new Date(year, 0, dayOfYear);
  };

  // --- Event Handlers & Effects ---
  const handleZoomChange = (e) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const centerPx = viewport.scrollLeft + viewport.clientWidth / 2;
    centerDateRef.current = pxToDate(centerPx);
    setZoom(e.target.value);
  };

  const handleScroll = (e) => {
    setViewportScroll(e.target.scrollLeft);
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const centerPx = dateToPx(centerDateRef.current);
    const newScrollLeft = centerPx - viewport.clientWidth / 2;
    viewport.scrollLeft = newScrollLeft;
    setViewportScroll(newScrollLeft);
  }, [zoom]);

  useEffect(() => {
    const avgDate = posts.length > 0
      ? new Date(posts.map(p => new Date(p.date).getTime()).reduce((a, b) => a + b, 0) / posts.length)
      : new Date();
    centerDateRef.current = avgDate;

    const viewport = viewportRef.current;
    if (!viewport) return;
    const centerPx = dateToPx(centerDateRef.current);
    const initialScrollLeft = centerPx - viewport.clientWidth / 2;
    viewport.scrollLeft = initialScrollLeft;
    setViewportScroll(initialScrollLeft);
  }, [posts]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      const walk = (x - startX);
      viewport.scrollLeft = dragScrollLeft - walk;
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, dragScrollLeft]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.pageX - (viewportRef.current?.offsetLeft || 0));
    setDragScrollLeft(viewportRef.current?.scrollLeft || 0);
  };

  // --- Virtualization Logic ---
  const viewportWidth = viewportRef.current?.clientWidth || 0;
  const renderBuffer = viewportWidth * 1.5; // Render extra buffer on each side
  const renderStartPx = Math.max(0, viewportScroll - renderBuffer);
  const renderEndPx = viewportScroll + viewportWidth + renderBuffer;

  const sortedPosts = posts.map(post => ({ ...post, date: new Date(post.date) }));
  const visiblePosts = sortedPosts.filter(post => {
    const postPx = dateToPx(post.date);
    return postPx >= renderStartPx && postPx <= renderEndPx;
  });

  const yearStep = pxPerYear < 5 ? 100 : pxPerYear < 20 ? 50 : pxPerYear < 50 ? 25 : pxPerYear < 150 ? 10 : pxPerYear < 400 ? 5 : 1;
  const firstVisibleYear = Math.max(1, Math.floor(pxToDate(renderStartPx).getFullYear() / yearStep) * yearStep);
  const lastVisibleYear = Math.min(totalYears, pxToDate(renderEndPx).getFullYear());
  
  const yearsToRender = [];
  for (let y = firstVisibleYear; y <= lastVisibleYear; y += yearStep) {
    if (y > 0) yearsToRender.push(y);
  }

  const monthsToRender = [];
  if (pxPerYear > 1200) {
    const firstMonthBearingYear = Math.max(1, pxToDate(renderStartPx).getFullYear());
    const lastMonthBearingYear = Math.min(totalYears, pxToDate(renderEndPx).getFullYear());
    for (let year = firstMonthBearingYear; year <= lastMonthBearingYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);
        const monthPx = dateToPx(monthDate);
        if (monthPx >= renderStartPx && monthPx <= renderEndPx) {
          monthsToRender.push({ year, month });
        }
      }
    }
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <div className="timeline-viewport" ref={viewportRef} onMouseDown={handleMouseDown} onScroll={handleScroll}>
        <div className="timeline-ruler" style={{ width: `${totalWidth}px` }}>
          <div className="timeline-axis" />
          {visiblePosts.map((post) => (
            <PostDot key={post.id} post={post} position={dateToPx(post.date)} />
          ))}
          {yearsToRender.map(year => (
            <YearMarker key={year} year={year} position={dateToPx(new Date(year, 0, 1))} />
          ))}
          {monthsToRender.map(({ year, month }) => (
            <MonthMarker
              key={`${year}-${month}`}
              label={monthLabels[month]}
              position={dateToPx(new Date(year, month, 1))}
            />
          ))}
        </div>
      </div>
      <ZoomSlider zoom={zoom} onZoomChange={handleZoomChange} />
    </>
  );
};

export default Timeline;



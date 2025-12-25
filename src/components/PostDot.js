import React, { useState } from 'react';
import './PostDot.css';

const PostDot = ({ post, position }) => {
  const [isHovered, setIsHovered] = useState(false);

  const positionStyle = {
    left: `${position}px`,
  };

  return (
    <div
      className="post-dot-container"
      style={positionStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="post-dot"></div>
      {isHovered && (
        <div className="post-preview">
          <img src={post.imageUrl} alt={post.title} className="post-image" />
          <p className="post-title">{post.title}</p>
        </div>
      )}
    </div>
  );
};

export default PostDot;

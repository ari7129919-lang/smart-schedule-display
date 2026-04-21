import React from 'react';

export default function LeafIcon({ 
  size = 64, 
  color = '#7A86A8',
  className = '',
  single = false
}) {
  if (single) {
    return (
      <svg 
        width={size} 
        height={size * 1.3} 
        viewBox="0 0 60 78" 
        className={className}
        fill={color}
      >
        <path d="M30 4 C14 14 8 38 18 60 C24 72 36 72 42 60 C52 38 46 14 30 4Z" />
      </svg>
    );
  }

  // Triple leaf with stem — matching the uploaded image exactly
  // Three leaves: center pointing up, two angled sides
  return (
    <svg 
      width={size} 
      height={size * 1.6} 
      viewBox="0 0 80 128" 
      className={className}
      fill={color}
    >
      {/* Center leaf — pointing upward */}
      <path d="M40 4 C24 14 18 40 28 62 C34 74 46 74 52 62 C62 40 56 14 40 4Z" />
      {/* Left leaf — angled to bottom-left */}
      <path d="M38 58 C22 52 6 62 4 82 C2 98 14 106 28 100 C44 92 48 72 38 58Z" />
      {/* Right leaf — angled to bottom-right */}
      <path d="M42 58 C58 52 74 62 76 82 C78 98 66 106 52 100 C36 92 32 72 42 58Z" />
      {/* Stem */}
      <line 
        x1="40" y1="62" x2="40" y2="124" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinecap="round"
      />
    </svg>
  );
}
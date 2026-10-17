import React from 'react';

interface LogoMarkProps {
  className?: string;
  size?: number;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {/* Soft Rounded Brand Emblem Base */}
      <rect width="28" height="28" fill="#2563EB" rx="6" />

      {/* Clean Tree / Graph Traces */}
      <line x1="14" y1="8" x2="8" y2="20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="14" y1="8" x2="20" y2="20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="8" y1="20" x2="20" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.6" />

      {/* 3 Clean Schematic Vertex Nodes */}
      <circle cx="14" cy="8" r="3" fill="#FFFFFF" />
      <circle cx="8" cy="20" r="3" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
    </svg>
  );
};

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
      {/* Precision Hardware Square Base */}
      <rect width="28" height="28" fill="#FF4F00" rx="2" />

      {/* Directed Tree / Graph Logic Traces (Root to Children) */}
      <line x1="14" y1="7" x2="8" y2="20" stroke="#090908" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="14" y1="7" x2="20" y2="20" stroke="#090908" strokeWidth="2.2" strokeLinecap="round" />

      {/* Horizontal Dashed Connection Between Sibling Nodes */}
      <line x1="8" y1="20" x2="20" y2="20" stroke="#090908" strokeWidth="1.8" strokeDasharray="2 2" />

      {/* 3 Crisp Schematic Vertex Nodes (r=3 at (14,7), (8,20), (20,20)) */}
      <circle cx="14" cy="7" r="3" fill="#090908" />
      <circle cx="8" cy="20" r="3" fill="#090908" />
      <circle cx="20" cy="20" r="3" fill="#090908" />
    </svg>
  );
};

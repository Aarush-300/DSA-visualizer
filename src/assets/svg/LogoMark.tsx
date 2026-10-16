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

      {/* 3-Vertex Directed Graph / Tree Circuit Traces */}
      <line x1="14" y1="7" x2="7" y2="20" stroke="#090908" strokeWidth="2" strokeLinecap="square" />
      <line x1="14" y1="7" x2="21" y2="20" stroke="#090908" strokeWidth="2" strokeLinecap="square" />
      <line x1="9.5" y1="15" x2="18.5" y2="15" stroke="#090908" strokeWidth="1.5" />

      {/* Geometric Nodes */}
      <circle cx="14" cy="7" r="2.75" fill="#090908" />
      <circle cx="7" cy="20" r="2.5" fill="#090908" />
      <circle cx="21" cy="20" r="2.5" fill="#090908" />

      {/* Central Logic Junction */}
      <rect x="12.5" y="13.5" width="3" height="3" fill="#090908" />
    </svg>
  );
};

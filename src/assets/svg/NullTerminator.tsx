import React from 'react';

interface NullTerminatorProps {
  className?: string;
}

export const NullTerminator: React.FC<NullTerminatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="w-12 h-13 border border-dashed border-[#3B3935] bg-[#111110] flex flex-col items-center justify-center p-1 shadow-inner">
        {/* Schematic Ground Symbol */}
        <svg width="22" height="18" viewBox="0 0 24 20" fill="none" className="text-[#9E9B93]">
          <line x1="12" y1="0" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <line x1="10" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
        <span className="text-[8px] font-mono text-[#9E9B93] font-bold mt-0.5">GND/NULL</span>
      </div>
      <span className="text-[8px] font-mono text-[#5C5952] mt-1">0x0000</span>
    </div>
  );
};

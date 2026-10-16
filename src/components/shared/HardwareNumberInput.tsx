import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface HardwareNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export const HardwareNumberInput: React.FC<HardwareNumberInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  label,
  className = '',
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-[10px] font-mono text-[#9E9B93] uppercase font-bold shrink-0">
          {label}:
        </span>
      )}
      <div className="flex items-center bg-[#090908] border border-[#33312D]">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-6 h-6 flex items-center justify-center bg-[#181816] hover:bg-[#252421] text-[#F3F2EE] border-r border-[#33312D] disabled:opacity-30 disabled:pointer-events-none active:translate-y-[1px]"
          title="Decrement"
        >
          <Minus size={11} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const num = Number(e.target.value);
            if (!Number.isNaN(num)) onChange(num);
          }}
          className="w-14 px-1.5 py-0.5 text-xs font-mono text-[#F3F2EE] bg-transparent text-center focus:outline-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-6 h-6 flex items-center justify-center bg-[#181816] hover:bg-[#252421] text-[#F3F2EE] border-l border-[#33312D] disabled:opacity-30 disabled:pointer-events-none active:translate-y-[1px]"
          title="Increment"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
};


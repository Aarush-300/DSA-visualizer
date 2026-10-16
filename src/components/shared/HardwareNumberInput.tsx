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
        <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase font-bold shrink-0">
          {label}:
        </span>
      )}
      <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-strong)]">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-6 h-6 flex items-center justify-center bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border-r border-[var(--border-strong)] disabled:opacity-30 disabled:pointer-events-none active:translate-y-[1px] transition-colors"
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
          className="w-14 px-1.5 py-0.5 text-xs font-mono text-[var(--text-primary)] bg-transparent text-center focus:outline-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-6 h-6 flex items-center justify-center bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border-l border-[var(--border-strong)] disabled:opacity-30 disabled:pointer-events-none active:translate-y-[1px] transition-colors"
          title="Increment"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
};

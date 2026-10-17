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
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-sans text-[var(--text-secondary)] font-medium shrink-0">
          {label}
        </span>
      )}
      <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] focus-within:border-[var(--accent-primary)] rounded-md overflow-hidden transition-colors">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-7 h-7 flex items-center justify-center bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-r border-[var(--border-hairline)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Decrease"
          aria-label="Decrease value"
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
          className="w-14 px-1 py-1 text-xs font-mono text-[var(--text-primary)] bg-transparent text-center focus:outline-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-7 h-7 flex items-center justify-center bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-l border-[var(--border-hairline)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Increase"
          aria-label="Increase value"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
};

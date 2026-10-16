import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MetricCounterCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const MetricCounterCard: React.FC<MetricCounterCardProps> = ({
  label,
  value,
  subtext,
  color = 'var(--accent-primary)',
  icon,
}) => {
  const displayVal = typeof value === 'number' ? String(value).padStart(4, '0') : value;

  return (
    <div className="flex flex-col p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] relative overflow-hidden group select-none">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-display uppercase text-[10px] font-bold tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2 h-7 overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={String(value)}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="font-mono text-xl font-bold tracking-tight text-[var(--text-primary)]"
          >
            {displayVal}
          </motion.span>
        </AnimatePresence>
      </div>

      {subtext && (
        <span className="font-mono text-[9px] text-[var(--text-muted)] mt-1 truncate">
          {subtext}
        </span>
      )}

      {/* Subtle bottom indicator line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

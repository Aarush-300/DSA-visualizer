import React from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

export const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = usePlaygroundStore();
  const isLight = theme === 'light';

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If browser supports View Transitions API, execute circular wipe
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as any).startViewTransition(() => {
        toggleTheme();
      });

      transition.ready?.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 320,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      toggleTheme();
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={`Switch to ${isLight ? 'Carbon Dark' : 'Drafting Light'} Mode`}
      aria-label="Toggle theme between dark and light mode"
      className="relative flex items-center h-7 px-1 bg-[var(--bg-elevated)] border border-[var(--border-strong)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors select-none group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
      style={{ width: '84px' }}
    >
      {/* Background Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[8px] font-mono font-bold tracking-widest text-[var(--text-muted)] pointer-events-none">
        <span className={!isLight ? 'text-[var(--accent-primary)]' : ''}>DRK</span>
        <span className={isLight ? 'text-[var(--accent-primary)]' : ''}>LGT</span>
      </div>

      {/* Sliding Physical Thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 30 }}
        className="relative z-10 w-7 h-5 bg-[var(--bg-panel)] border border-[var(--border-strong)] flex items-center justify-center shadow-md"
        style={{
          marginLeft: isLight ? 'auto' : '0px',
        }}
      >
        {/* Animated Geometric Icon */}
        <motion.div
          animate={{ rotate: isLight ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex items-center justify-center text-[var(--text-primary)]"
        >
          {isLight ? (
            /* Geometric Aperture Sun */
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="square">
              <circle cx="12" cy="12" r="4" fill="var(--accent-primary)" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            /* Phosphor Crescent / Grid */
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="square">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="var(--text-muted)" />
            </svg>
          )}
        </motion.div>

        {/* Precision LED Indicator Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_4px_var(--accent-primary)]" />
      </motion.div>
    </button>
  );
};

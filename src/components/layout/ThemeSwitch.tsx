import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

export const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = usePlaygroundStore();
  const isLight = theme === 'light';

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
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
            duration: 280,
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
      title="Switch theme"
      aria-label="Switch theme"
      className="p-1.5 rounded-md bg-[var(--bg-panel)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2 flex items-center justify-center cursor-pointer"
    >
      {isLight ? (
        <Sun size={15} className="text-amber-500 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon size={15} className="text-blue-400 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};

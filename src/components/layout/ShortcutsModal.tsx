import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { X, Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = usePlaygroundStore();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'SPACE', desc: 'Toggle Play / Pause simulation' },
    { key: '→ (RIGHT)', desc: 'Step Forward 1 frame snapshot' },
    { key: '← (LEFT)', desc: 'Step Backward 1 frame snapshot' },
    { key: 'HOME', desc: 'Jump to Frame 0 (initial state)' },
    { key: 'END', desc: 'Jump to Final Frame (verified state)' },
    { key: 'R', desc: 'Randomize input dataset' },
    { key: '?', desc: 'Toggle keyboard shortcuts dialog' },
    { key: 'ESC', desc: 'Close dialog' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl p-5 relative text-[var(--text-primary)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[var(--accent-primary)] text-[var(--text-on-accent)]">
                <Keyboard size={14} />
              </div>
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
                HARDWARE KEYMAP // SHORTCUTS
              </h3>
            </div>

            <button
              onClick={() => setShortcutsOpen(false)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Shortcuts Grid */}
          <div className="divide-y divide-[var(--border-hairline)] py-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2 text-xs">
                <span className="font-sans text-[var(--text-secondary)]">{s.desc}</span>
                <kbd className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] font-mono text-[10px] text-[var(--accent-primary)] font-bold">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] flex justify-end">
            <button
              onClick={() => setShortcutsOpen(false)}
              className="btn-hardware-secondary px-4 py-1.5 font-mono text-xs"
            >
              [ESC] CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

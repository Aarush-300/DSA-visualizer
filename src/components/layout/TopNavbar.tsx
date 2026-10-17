import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ActiveModuleId } from '../../types/engine';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { LogoMark } from '../../assets/svg/LogoMark';
import { ThemeSwitch } from './ThemeSwitch';

export const TopNavbar: React.FC = () => {
  const {
    activeModule,
    activeAlgo,
    setActiveModule,
    setActiveAlgo,
    applyPreset,
  } = usePlaygroundStore();

  const [isAlgoOpen, setIsAlgoOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const algoRef = useRef<HTMLDivElement>(null);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (algoRef.current && !algoRef.current.contains(e.target as Node)) {
        setIsAlgoOpen(false);
      }
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const modules: { id: ActiveModuleId; label: string }[] = [
    { id: 'sorting', label: 'Sorting & Search' },
    { id: 'stacksQueues', label: 'Stacks & Queues' },
    { id: 'linkedList', label: 'Linked Lists' },
    { id: 'trees', label: 'Trees' },
    { id: 'graphs', label: 'Graphs' },
  ];

  const currentAlgoMeta = ALGORITHM_CATALOG[activeAlgo];
  const moduleAlgos = Object.values(ALGORITHM_CATALOG).filter(
    (algo) => algo.module === activeModule
  );

  const presets = currentAlgoMeta?.presets ?? [
    { label: 'Standard Dataset', values: '64, 34, 25, 12, 22, 11, 90' },
    { label: 'Nearly Sorted', values: '10, 20, 25, 40, 35, 50, 60' },
    { label: 'Reverse Sorted', values: '90, 80, 70, 60, 50, 40, 30' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] backdrop-blur-md max-h-[44px] select-none pointer-events-auto">
      {/* Brand Identity */}
      <div className="flex items-center gap-2 pr-2.5 border-r border-[var(--border-subtle)]">
        <LogoMark className="w-5 h-5 shrink-0" size={20} />
        <span className="font-serif italic font-medium text-[15px] tracking-tight text-[var(--text-primary)] hidden sm:inline">
          StructView
        </span>
      </div>

      {/* 5 Core Module Switchers */}
      <nav className="flex items-center gap-0.5 bg-[var(--bg-elevated)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveModule(m.id);
                setIsAlgoOpen(false);
              }}
              className={`relative px-2.5 py-1 text-xs font-sans font-medium transition-colors rounded-md ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="top-active-module"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-[var(--bg-island)] rounded-md border border-[var(--border-island)] shadow-xs"
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <span className="text-[var(--border-strong)] text-xs">|</span>

      {/* Algorithm Selector Dropdown */}
      <div className="relative" ref={algoRef}>
        <button
          onClick={() => setIsAlgoOpen(!isAlgoOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-lg text-xs font-sans text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
        >
          <span className="truncate max-w-[140px] text-xs font-medium">
            {currentAlgoMeta?.name ?? activeAlgo}
          </span>
          <ChevronDown size={13} className="text-[var(--text-secondary)] shrink-0" />
        </button>

        <AnimatePresence>
          {isAlgoOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 mt-2 w-56 bg-[var(--bg-island)] border border-[var(--border-island)] rounded-xl shadow-[var(--shadow-island)] py-1 z-50 backdrop-blur-md max-h-72 overflow-y-auto"
            >
              <div className="px-3 py-1 text-[10px] font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                Algorithms ({moduleAlgos.length})
              </div>
              {moduleAlgos.map((algo) => {
                const isSelected = activeAlgo === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => {
                      setActiveAlgo(algo.id);
                      setIsAlgoOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-sans flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent-brand)] font-semibold'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <span className="truncate">{algo.name}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0 pl-2">
                      {algo.complexity.averageTime}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Dropdown */}
      <div className="relative" ref={presetRef}>
        <button
          onClick={() => setIsPresetsOpen(!isPresetsOpen)}
          title="Load Preset Dataset"
          className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-lg text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Sparkles size={12} className="text-[var(--accent-brand)]" />
          <span className="hidden md:inline text-xs font-medium">Presets</span>
          <ChevronDown size={11} className="text-[var(--text-secondary)]" />
        </button>

        <AnimatePresence>
          {isPresetsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-2 w-64 bg-[var(--bg-island)] border border-[var(--border-island)] rounded-xl shadow-[var(--shadow-island)] py-1 z-50 backdrop-blur-md"
            >
              <div className="px-3 py-1 text-[10px] font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                Sample Presets
              </div>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    applyPreset(p.values);
                    setIsPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex flex-col transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[var(--text-primary)] font-medium">{p.label}</span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">{p.values}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Switcher Icon */}
      <ThemeSwitch />
    </header>
  );
};

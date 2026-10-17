import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ActiveModuleId } from '../../types/engine';
import { ChevronDown, RotateCcw, Keyboard } from 'lucide-react';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { LogoMark } from '../../assets/svg/LogoMark';
import { ThemeSwitch } from './ThemeSwitch';

export const TopNavbar: React.FC = () => {
  const {
    activeModule,
    activeAlgo,
    setActiveModule,
    applyPreset,
    resetWorkspace,
    setShortcutsOpen,
  } = usePlaygroundStore();

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const modules: { id: ActiveModuleId; label: string }[] = [
    { id: 'sorting', label: 'Sorting & Search' },
    { id: 'stacksQueues', label: 'Stacks & Queues' },
    { id: 'linkedList', label: 'Linked Lists' },
    { id: 'trees', label: 'Trees' },
    { id: 'graphs', label: 'Graphs' },
  ];

  const currentAlgoMeta = ALGORITHM_CATALOG[activeAlgo];
  const presets = currentAlgoMeta?.presets ?? [
    { label: 'Standard Dataset', values: '64, 34, 25, 12, 22, 11, 90' },
    { label: 'Nearly Sorted', values: '10, 20, 25, 40, 35, 50, 60' },
    { label: 'Reverse Sorted', values: '90, 80, 70, 60, 50, 40, 30' },
    { label: 'Balanced Key Set', values: '50, 30, 70, 20, 40, 60, 80' },
  ];

  return (
    <header className="h-13 border-b border-[var(--border-hairline)] bg-[var(--bg-panel)] text-[var(--text-primary)] flex items-center justify-between px-4 select-none z-30 shrink-0">
      {/* Left: Brand Identity (StructView) */}
      <div className="flex items-center gap-2.5">
        <LogoMark className="w-6 h-6" size={24} />
        <span className="font-sans font-semibold text-[15px] tracking-tight text-[var(--text-primary)]">
          StructView
        </span>
      </div>

      {/* Center: Clean 5 Core Module Switchers */}
      <nav className="hidden lg:flex items-center bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg p-0.5">
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`relative px-3 py-1.5 text-xs font-sans font-medium transition-colors duration-150 rounded-md ${
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-module-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-[var(--bg-panel)] rounded-md border border-[var(--border-hairline)] shadow-xs"
                />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Utilities: Theme, Presets, Shortcuts, Reset */}
      <div className="flex items-center gap-2">
        {/* Clean Theme Switch */}
        <ThemeSwitch />

        {/* Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPresetsOpen(!isPresetsOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-panel)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] rounded-md text-xs font-sans text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Preset:</span>
            <span className="truncate max-w-[120px] text-xs font-medium">{presets[0]?.label ?? 'Standard'}</span>
            <ChevronDown size={13} className="text-[var(--text-secondary)]" />
          </button>

          {isPresetsOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-[var(--bg-panel)] border border-[var(--border-hairline)] rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-hairline)]">
                Sample Datasets
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    applyPreset(preset.values);
                    setIsPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex flex-col transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[var(--text-primary)] font-medium">{preset.label}</span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">{preset.values}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          className="p-1.5 rounded-md bg-[var(--bg-panel)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Keyboard size={15} />
        </button>

        {/* Reset Environment Button */}
        <button
          onClick={resetWorkspace}
          title="Reset environment (Ctrl+R)"
          aria-label="Reset environment"
          className="p-1.5 rounded-md bg-[var(--bg-panel)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};

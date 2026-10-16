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

  const modules: { id: ActiveModuleId; code: string; label: string }[] = [
    { id: 'sorting', code: '01', label: 'SORTING & SEARCH' },
    { id: 'stacksQueues', code: '02', label: 'STACKS & QUEUES' },
    { id: 'linkedList', code: '03', label: 'LINKED LISTS' },
    { id: 'trees', code: '04', label: 'TREES' },
    { id: 'graphs', code: '05', label: 'GRAPHS' },
  ];

  const currentAlgoMeta = ALGORITHM_CATALOG[activeAlgo];
  const presets = currentAlgoMeta?.presets ?? [
    { label: 'Standard Dataset', values: '64, 34, 25, 12, 22, 11, 90' },
    { label: 'Nearly Sorted', values: '10, 20, 25, 40, 35, 50, 60' },
    { label: 'Reverse Sorted', values: '90, 80, 70, 60, 50, 40, 30' },
    { label: 'Balanced Key Set', values: '50, 30, 70, 20, 40, 60, 80' },
  ];

  return (
    <header className="h-13 border-b border-[#262522] bg-[#111110] flex items-center justify-between px-4 select-none z-30 shrink-0">
      {/* Left: Brand Identity with Circuit Emblem & Chakra Petch */}
      <div className="flex items-center gap-3">
        <LogoMark className="w-7 h-7" />

        <div className="flex items-baseline gap-2.5">
          <span className="font-display font-bold text-[17px] tracking-[0.04em] text-[#F3F2EE] uppercase">
            ALGOFORGE
          </span>
          <span className="font-mono font-medium text-[10px] text-[#FF4F00] px-1.5 py-0.2 bg-[#FF4F00]/10 border border-[#FF4F00]/30 tracking-widest uppercase">
            HARDWARE DSA LAB
          </span>
        </div>
      </div>

      {/* Center: 5 Core Module Switchers with Sliding Active Indicator */}
      <nav className="hidden lg:flex items-center bg-[#090908] border border-[#262522] p-0.5">
        {modules.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`relative px-3.5 py-1.5 text-xs font-display tracking-wider font-semibold transition-colors duration-150 flex items-center gap-2 ${
                isActive ? 'text-[#F3F2EE]' : 'text-[#9E9B93] hover:text-[#F3F2EE]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-module-tab"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-[#181816] border border-[#3B3935] border-t-2 border-t-[#FF4F00]"
                />
              )}
              <span className="relative z-10 font-mono text-[10px] text-[#FF4F00]">
                {m.code}
              </span>
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Utilities: Theme, Presets, Shortcuts, Reset */}
      <div className="flex items-center gap-1.5">
        {/* Animated Light/Dark Theme Switch */}
        <ThemeSwitch />

        {/* Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPresetsOpen(!isPresetsOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181816] border border-[#262522] hover:border-[#3B3935] text-xs font-sans text-[#F3F2EE] transition-colors"
          >
            <span className="font-display uppercase text-[11px] tracking-wider text-[#9E9B93]">PRESET:</span>
            <span className="truncate max-w-[110px] text-[11px] font-mono">{presets[0]?.label ?? 'Standard'}</span>
            <ChevronDown size={13} className="text-[#9E9B93]" />
          </button>

          {isPresetsOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-[#111110] border border-[#3B3935] shadow-2xl py-1 z-50">
              <div className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-[#5C5952] border-b border-[#262522]">
                STANDARDIZED DATASETS
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    applyPreset(preset.values);
                    setIsPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#181816] flex flex-col transition-colors border-b border-[#262522]/50 last:border-b-0"
                >
                  <span className="font-sans text-xs text-[#F3F2EE] font-medium">{preset.label}</span>
                  <span className="font-mono text-[10px] text-[#9E9B93] truncate">{preset.values}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hotkeys Button */}
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="p-1.5 bg-[#181816] border border-[#262522] hover:border-[#3B3935] text-[#9E9B93] hover:text-[#F3F2EE] transition-colors"
        >
          <Keyboard size={15} />
        </button>

        {/* Reset State Button */}
        <button
          onClick={resetWorkspace}
          title="Reset Environment (Ctrl+R)"
          className="p-1.5 bg-[#181816] border border-[#262522] hover:border-[#3B3935] text-[#9E9B93] hover:text-[#FF4F00] transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};

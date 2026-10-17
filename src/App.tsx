import React, { useEffect } from 'react';
import { usePlaygroundStore } from './store/usePlaygroundStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { LeftControlDock } from './components/layout/LeftControlDock';
import { StageContainer } from './components/canvas/StageContainer';
import { RightInspectorDrawer } from './components/layout/RightInspectorDrawer';
import { BottomTimelineBar } from './components/layout/BottomTimelineBar';
import { ShortcutsModal } from './components/layout/ShortcutsModal';
import { generateRandomDataset } from './utils/inputValidator';

export const App: React.FC = () => {
  const {
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    setShortcutsOpen,
    isShortcutsOpen,
    recompileCurrent,
    theme,
  } = usePlaygroundStore();

  // Synchronize documentElement theme attribute and class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'Home') {
        e.preventDefault();
        jumpToStart();
      } else if (e.code === 'End') {
        e.preventDefault();
        jumpToEnd();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const rand = generateRandomDataset(12, 10, 95);
        recompileCurrent(undefined, rand.join(', '));
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShortcutsOpen(!isShortcutsOpen);
      } else if (e.key === 'Escape') {
        if (isShortcutsOpen) setShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    isShortcutsOpen,
    setShortcutsOpen,
    recompileCurrent,
  ]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans select-none">
      {/* 1. Full-Bleed Interactive Canvas (100vw × 100vh) */}
      <StageContainer />

      {/* 2. Top-Center Floating Module & Algorithm Toolbar */}
      <TopNavbar />

      {/* 3. Left Floating Compact Workbench Card */}
      <LeftControlDock />

      {/* 4. Right Floating Code & Telemetry Drawer */}
      <RightInspectorDrawer />

      {/* 5. Bottom-Center Floating Playback & Narration Dock */}
      <BottomTimelineBar />

      {/* 6. Keyboard Shortcuts Modal */}
      <ShortcutsModal />
    </div>
  );
};

export default App;

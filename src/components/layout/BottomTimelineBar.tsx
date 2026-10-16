import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore, PlaybackSpeed } from '../../store/usePlaygroundStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const BottomTimelineBar: React.FC = () => {
  const {
    frames,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    setStepIndex,
    setPlaybackSpeed,
  } = usePlaygroundStore();

  const totalFrames = frames.length;
  const isCompleted = totalFrames > 0 && currentStepIndex >= totalFrames - 1;

  // Auto-advancing playback loop scaled inversely by playbackSpeed
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(35, 600 / playbackSpeed);

    const timer = setInterval(() => {
      const { currentStepIndex: curr, frames: f, pause: stop } = usePlaygroundStore.getState();
      if (curr < f.length - 1) {
        usePlaygroundStore.setState({ currentStepIndex: curr + 1 });
      } else {
        stop();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const speedOptions: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4, 8];

  return (
    <footer className="h-14 border-t border-[var(--border-hairline)] bg-[var(--bg-panel)] text-[var(--text-primary)] flex items-center justify-between px-4 z-30 shrink-0 select-none">
      {/* Left: Status Indicator LED */}
      <div className="flex items-center gap-2.5 min-w-[170px]">
        <span
          className={`w-2 h-2 ${
            isPlaying
              ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] animate-pulse'
              : isCompleted
              ? 'bg-[#00E676] shadow-[0_0_8px_#00E676]'
              : 'bg-[#FFB800] shadow-[0_0_8px_#FFB800]'
          }`}
        />
        <span className="font-mono text-xs font-semibold tracking-wider text-[var(--text-primary)]">
          {isPlaying
            ? 'STATUS: EXECUTING'
            : isCompleted
            ? 'STATUS: VERIFIED'
            : 'STATUS: PAUSED'}
        </span>
      </div>

      {/* Center: Transport Controls & Scrubber Slider */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl px-4">
        {/* Buttons Row */}
        <div className="flex items-center gap-1">
          <button
            onClick={jumpToStart}
            disabled={totalFrames === 0 || currentStepIndex === 0}
            title="Jump to Start (Home)"
            aria-label="Jump to start frame (Home)"
            className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[var(--border-strong)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={stepBackward}
            disabled={totalFrames === 0 || currentStepIndex === 0}
            title="Step Backward (ArrowLeft)"
            aria-label="Step backward one frame (ArrowLeft)"
            className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[var(--border-strong)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Play / Pause Hardware Button */}
          <button
            onClick={togglePlay}
            disabled={totalFrames === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause algorithm playback (Space)' : 'Play algorithm playback (Space)'}
            className="w-8 h-8 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] flex items-center justify-center font-bold shadow-md active:translate-y-[1px] disabled:opacity-20 disabled:pointer-events-none mx-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={stepForward}
            disabled={totalFrames === 0 || isCompleted}
            title="Step Forward (ArrowRight)"
            aria-label="Step forward one frame (ArrowRight)"
            className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[var(--border-strong)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={jumpToEnd}
            disabled={totalFrames === 0 || isCompleted}
            title="Jump to End (End)"
            aria-label="Jump to end frame (End)"
            className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[var(--border-strong)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Tabular Scrubber Slider */}
        <div className="flex items-center gap-3 flex-1">
          <span className="font-mono text-[11px] text-[var(--accent-primary)] font-bold w-16 text-right tabular-nums">
            STEP {String(currentStepIndex + 1).padStart(3, '0')}
          </span>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalFrames - 1)}
              value={currentStepIndex}
              onChange={(e) => setStepIndex(Number(e.target.value))}
              disabled={totalFrames === 0}
              aria-label="Playback frame scrubber"
              className="w-full h-1 bg-[var(--border-strong)] appearance-none cursor-pointer accent-[var(--accent-primary)] disabled:opacity-20 border border-[var(--border-hairline)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
            />
          </div>

          <span className="font-mono text-[11px] text-[var(--text-muted)] w-12 tabular-nums">
            / {String(Math.max(1, totalFrames)).padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Right: Hardware Playback Speed Selector with layoutId Indicator */}
      <div className="flex items-center bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-secondary)] p-0.5">
        {speedOptions.map((speed) => {
          const isActive = playbackSpeed === speed;
          return (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              aria-label={`Set playback speed to ${speed}x`}
              className={`relative px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2 ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-speed-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-[var(--bg-panel)] border border-[var(--border-strong)]"
                />
              )}
              <span className="relative z-10">{speed}x</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

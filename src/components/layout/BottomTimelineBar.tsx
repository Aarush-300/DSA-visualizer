import React, { useEffect } from 'react';
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
  const currentFrame = frames[currentStepIndex];
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

  const speedOptions: PlaybackSpeed[] = [0.5, 1, 2, 4, 8];

  const handleCycleSpeed = () => {
    const currentIdx = speedOptions.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % speedOptions.length;
    setPlaybackSpeed(speedOptions[nextIdx]);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-[min(680px,92vw)] pointer-events-none select-none">
      {/* Upper Floating Pill: Live Step Explanation (Untruncated) */}
      <div className="px-4 py-1.5 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] text-xs text-[var(--text-primary)] font-sans max-w-full text-center leading-normal backdrop-blur-md pointer-events-auto flex items-center justify-center gap-2">
        <span className="font-mono text-[11px] font-semibold text-[var(--accent-brand)] shrink-0">
          Step {currentStepIndex + 1}/{Math.max(1, totalFrames)}
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span className="font-sans font-normal text-[12px] text-[var(--text-primary)]">
          {currentFrame?.narration || 'Algorithm initialized. Ready for execution.'}
        </span>
      </div>

      {/* Lower Playback Island: Media Transport Controls */}
      <footer className="h-12 px-4 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] flex items-center gap-3 w-full backdrop-blur-md pointer-events-auto">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={jumpToStart}
            disabled={totalFrames === 0 || currentStepIndex === 0}
            title="Jump to Start (Home)"
            aria-label="Jump to start frame (Home)"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={stepBackward}
            disabled={totalFrames === 0 || currentStepIndex === 0}
            title="Step Backward (ArrowLeft)"
            aria-label="Step backward one frame (ArrowLeft)"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Round Ink / Alabaster Play Button */}
          <button
            onClick={togglePlay}
            disabled={totalFrames === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
            className="w-8 h-8 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-brand)] text-[var(--text-on-accent)] flex items-center justify-center shadow-xs active:scale-95 disabled:opacity-25 disabled:pointer-events-none mx-1 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={stepForward}
            disabled={totalFrames === 0 || isCompleted}
            title="Step Forward (ArrowRight)"
            aria-label="Step forward one frame (ArrowRight)"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={jumpToEnd}
            disabled={totalFrames === 0 || isCompleted}
            title="Jump to End (End)"
            aria-label="Jump to end frame (End)"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex items-center gap-2.5 flex-1 px-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={currentStepIndex}
            onChange={(e) => setStepIndex(Number(e.target.value))}
            disabled={totalFrames === 0}
            aria-label="Playback frame scrubber"
            className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer accent-[var(--accent-brand)] disabled:opacity-20 border border-[var(--border-subtle)] focus:outline-none"
          />
        </div>

        {/* Speed Badge Pill (Click to cycle 0.5x -> 1x -> 2x -> 4x -> 8x) */}
        <button
          onClick={handleCycleSpeed}
          title="Click to cycle speed"
          aria-label={`Current speed ${playbackSpeed}x. Click to change.`}
          className="px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[11px] font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
        >
          {playbackSpeed}x ▾
        </button>
      </footer>
    </div>
  );
};

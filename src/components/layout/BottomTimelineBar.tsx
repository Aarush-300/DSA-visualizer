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
    <footer className="h-14 border-t border-[#262522] bg-[#111110] flex items-center justify-between px-4 z-30 shrink-0 select-none">
      {/* Left: Status Indicator LED */}
      <div className="flex items-center gap-2.5 min-w-[170px]">
        <span
          className={`w-2 h-2 ${
            isPlaying
              ? 'bg-[#FF4F00] shadow-[0_0_8px_#FF4F00] animate-pulse'
              : isCompleted
              ? 'bg-[#00E676] shadow-[0_0_8px_#00E676]'
              : 'bg-[#FFB800] shadow-[0_0_8px_#FFB800]'
          }`}
        />
        <span className="font-mono text-xs font-semibold tracking-wider text-[#F3F2EE]">
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
            className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[#3B3935]"
          >
            <SkipBack size={13} />
          </button>

          <button
            onClick={stepBackward}
            disabled={totalFrames === 0 || currentStepIndex === 0}
            title="Step Backward (ArrowLeft)"
            className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[#3B3935]"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Play / Pause Hardware Button */}
          <button
            onClick={togglePlay}
            disabled={totalFrames === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-8 h-8 bg-[#FF4F00] hover:bg-[#FF6622] text-[#090908] flex items-center justify-center font-bold shadow-md active:translate-y-[1px] disabled:opacity-20 disabled:pointer-events-none mx-1"
          >
            {isPlaying ? <Pause size={14} fill="#090908" /> : <Play size={14} fill="#090908" className="ml-0.5" />}
          </button>

          <button
            onClick={stepForward}
            disabled={totalFrames === 0 || isCompleted}
            title="Step Forward (ArrowRight)"
            className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[#3B3935]"
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={jumpToEnd}
            disabled={totalFrames === 0 || isCompleted}
            title="Jump to End (End)"
            className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] disabled:opacity-20 disabled:pointer-events-none border border-transparent hover:border-[#3B3935]"
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Tabular Scrubber Slider */}
        <div className="flex items-center gap-3 flex-1">
          <span className="font-mono text-[11px] text-[#FF4F00] font-bold w-16 text-right tabular-nums">
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
              className="w-full h-1 bg-[#1C1B19] appearance-none cursor-pointer accent-[#FF4F00] disabled:opacity-20 border border-[#262522]"
            />
          </div>

          <span className="font-mono text-[11px] text-[#5C5952] w-12 tabular-nums">
            / {String(Math.max(1, totalFrames)).padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Right: Hardware Playback Speed Selector with layoutId Indicator */}
      <div className="flex items-center bg-[#090908] border border-[#262522] p-0.5">
        {speedOptions.map((speed) => {
          const isActive = playbackSpeed === speed;
          return (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`relative px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold transition-colors ${
                isActive ? 'text-[#FF4F00]' : 'text-[#9E9B93] hover:text-[#F3F2EE]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-speed-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-[#181816] border border-[#3B3935]"
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

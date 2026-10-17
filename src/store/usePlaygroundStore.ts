import { create } from 'zustand';
import { ActiveModuleId, CodeLanguage, StepFrame } from '../types/engine';
import { compileEngineFrames, getDefaultInputForModule } from '../engines/compileEngine';
import { validateModuleInput } from '../utils/inputValidator';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4 | 8;

interface PlaygroundState {
  // Navigation & Algorithm Selection
  activeModule: ActiveModuleId;
  activeAlgo: string;
  codeLanguage: CodeLanguage;
  activeInspectorTab: 'code' | 'telemetry' | 'stack';

  // Input Data & Options
  customInput: string;
  inputError: string | null;
  targetValue: number;
  treeOrder: 3 | 4;
  theme: 'dark' | 'light';
  runId: number;

  // Frame Execution State
  frames: StepFrame<any>[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;

  // UI Panels & Modals
  isLeftDockCollapsed: boolean;
  isRightDrawerCollapsed: boolean;
  isShortcutsOpen: boolean;

  // Actions
  setActiveModule: (module: ActiveModuleId) => void;
  setActiveAlgo: (algo: string) => void;
  setCodeLanguage: (lang: CodeLanguage) => void;
  setActiveInspectorTab: (tab: 'code' | 'telemetry' | 'stack') => void;
  setCustomInput: (input: string) => void;
  setInputError: (error: string | null) => void;
  setTargetValue: (val: number) => void;
  setTreeOrder: (order: 3 | 4) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  recompileCurrent: (forcedAlgo?: string, forcedInput?: string, operation?: any) => void;
  executeOperation: (operation: any) => void;
  applyPreset: (presetValues: string) => void;
  setFrames: (frames: StepFrame<any>[]) => void;
  setStepIndex: (index: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;

  toggleLeftDock: () => void;
  toggleRightDrawer: () => void;
  setShortcutsOpen: (open: boolean) => void;
  resetWorkspace: () => void;
}

const initialModule: ActiveModuleId = 'sorting';
const initialAlgo = 'quick';
const initialInput = '64, 34, 25, 12, 22, 11, 90';
const initialFrames = compileEngineFrames(initialModule, initialAlgo, initialInput, 42);

// Extract initial theme safely
const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('algoforge-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  activeModule: initialModule,
  activeAlgo: initialAlgo,
  codeLanguage: 'cpp',
  activeInspectorTab: 'code',

  customInput: initialInput,
  inputError: null,
  targetValue: 42,
  treeOrder: 3,
  theme: getInitialTheme(),
  runId: 1,

  frames: initialFrames,
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  isLeftDockCollapsed: false,
  isRightDrawerCollapsed: false,
  isShortcutsOpen: false,

  setTheme: (theme) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('algoforge-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setTreeOrder: (treeOrder) => {
    const { activeModule, activeAlgo, customInput, targetValue } = get();
    const newFrames = compileEngineFrames(activeModule, activeAlgo, customInput, targetValue, { order: treeOrder });
    set({
      treeOrder,
      frames: newFrames,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  setActiveModule: (module) => {
    let defaultAlgo = 'quick';
    if (module === 'stacksQueues') defaultAlgo = 'stack';
    if (module === 'linkedList') defaultAlgo = 'singly';
    if (module === 'trees') defaultAlgo = 'bst';
    if (module === 'graphs') defaultAlgo = 'dijkstraGrid';

    const defaultInput = getDefaultInputForModule(module);
    const newFrames = compileEngineFrames(module, defaultAlgo, defaultInput, get().targetValue, { order: get().treeOrder });

    set((state) => ({
      activeModule: module,
      activeAlgo: defaultAlgo,
      customInput: defaultInput,
      inputError: null,
      isPlaying: false,
      currentStepIndex: 0,
      frames: newFrames,
      runId: state.runId + 1,
    }));
  },

  setActiveAlgo: (algo) => {
    const { activeModule, customInput, targetValue, treeOrder } = get();
    const newFrames = compileEngineFrames(activeModule, algo, customInput, targetValue, { order: treeOrder });

    set((state) => ({
      activeAlgo: algo,
      isPlaying: false,
      currentStepIndex: 0,
      frames: newFrames,
      inputError: null,
      runId: state.runId + 1,
    }));
  },

  recompileCurrent: (forcedAlgo?: string, forcedInput?: string, operation?: any) => {
    const { activeModule, activeAlgo, customInput, targetValue, treeOrder } = get();
    const algoToUse = forcedAlgo ?? activeAlgo;
    const inputToUse = forcedInput ?? customInput;

    if (activeModule !== 'graphs') {
      const valResult = validateModuleInput(activeModule, inputToUse);
      if (!valResult.isValid) {
        set({ inputError: valResult.error ?? 'Invalid input sequence' });
        return; // Halt compilation! Keep existing canvas state intact!
      }
    }

    const opWithOrder = { ...operation, order: operation?.order ?? treeOrder };
    const newFrames = compileEngineFrames(activeModule, algoToUse, inputToUse, targetValue, opWithOrder);

    set((state) => ({
      activeAlgo: algoToUse,
      customInput: inputToUse,
      isPlaying: false,
      currentStepIndex: 0,
      frames: newFrames,
      inputError: null,
      runId: state.runId + 1,
    }));
  },

  executeOperation: (operation: any) => {
    const { activeModule, activeAlgo, frames, customInput, targetValue, treeOrder } = get();
    
    // 1. Recover current live state from the final frame of prior execution
    let baseInput = customInput;
    if (frames.length > 0) {
      const finalFrame = frames[frames.length - 1];
      const snap = finalFrame.snapshot as any;
      if (activeModule === 'sorting' && snap?.bars && Array.isArray(snap.bars)) {
        baseInput = snap.bars.map((b: any) => b.value).join(', ');
      } else if (activeModule === 'stacksQueues' && snap?.items && Array.isArray(snap.items)) {
        baseInput = snap.items.map((it: any) => it.value).join(', ');
      } else if (activeModule === 'linkedList' && snap?.nodes && Array.isArray(snap.nodes)) {
        baseInput = snap.nodes.map((n: any) => n.value).join(', ');
      } else if (activeModule === 'trees') {
        if (snap?.multiKeyNodes && Object.keys(snap.multiKeyNodes).length > 0) {
          const keys: number[] = [];
          Object.values(snap.multiKeyNodes).forEach((node: any) => {
            if (Array.isArray(node.keys)) keys.push(...node.keys);
          });
          if (keys.length > 0) baseInput = keys.join(', ');
        } else if (snap?.nodes && Object.keys(snap.nodes).length > 0) {
          const vals = Object.values(snap.nodes).map((n: any) => n.value);
          if (vals.length > 0) baseInput = vals.join(', ');
        }
      }
    }

    // 2. Compile new animation frames on top of this live state
    const opWithOrder = { ...operation, order: operation?.order ?? treeOrder };
    const newFrames = compileEngineFrames(activeModule, activeAlgo, baseInput, targetValue, opWithOrder);

    // 3. Keep customInput synchronized with the resulting data structure state
    let updatedInput = baseInput;
    if (newFrames.length > 0) {
      const newFinalSnap = newFrames[newFrames.length - 1].snapshot as any;
      if (activeModule === 'sorting' && newFinalSnap?.bars && Array.isArray(newFinalSnap.bars)) {
        updatedInput = newFinalSnap.bars.map((b: any) => b.value).join(', ');
      } else if (activeModule === 'stacksQueues' && newFinalSnap?.items && Array.isArray(newFinalSnap.items)) {
        updatedInput = newFinalSnap.items.map((it: any) => it.value).join(', ');
      } else if (activeModule === 'linkedList' && newFinalSnap?.nodes && Array.isArray(newFinalSnap.nodes)) {
        updatedInput = newFinalSnap.nodes.map((n: any) => n.value).join(', ');
      } else if (activeModule === 'trees') {
        if (newFinalSnap?.multiKeyNodes && Object.keys(newFinalSnap.multiKeyNodes).length > 0) {
          const keys: number[] = [];
          Object.values(newFinalSnap.multiKeyNodes).forEach((node: any) => {
            if (Array.isArray(node.keys)) keys.push(...node.keys);
          });
          if (keys.length > 0) updatedInput = keys.join(', ');
        } else if (newFinalSnap?.nodes && Object.keys(newFinalSnap.nodes).length > 0) {
          const vals = Object.values(newFinalSnap.nodes).map((n: any) => n.value);
          if (vals.length > 0) updatedInput = vals.join(', ');
        }
      }
    }

    // 4. Automatically play immediately on every interactive mutation!
    set((state) => ({
      customInput: updatedInput.length > 0 ? updatedInput : baseInput,
      frames: newFrames,
      currentStepIndex: 0,
      isPlaying: true, // AUTO-PLAY IMMEDIATELY!
      runId: state.runId + 1,
      inputError: null,
    }));
  },

  applyPreset: (presetValues: string) => {
    const { activeModule, activeAlgo, targetValue, treeOrder } = get();
    const newFrames = compileEngineFrames(activeModule, activeAlgo, presetValues, targetValue, { order: treeOrder });

    set((state) => ({
      customInput: presetValues,
      isPlaying: false,
      currentStepIndex: 0,
      frames: newFrames,
      inputError: null,
      runId: state.runId + 1,
    }));
  },

  setCodeLanguage: (lang) => set({ codeLanguage: lang }),
  setActiveInspectorTab: (tab) => set({ activeInspectorTab: tab }),
  setCustomInput: (customInput) => set({ customInput, inputError: null }),
  setInputError: (inputError) => set({ inputError }),
  setTargetValue: (targetValue) => set({ targetValue }),

  setFrames: (frames) => {
    set({
      frames,
      currentStepIndex: 0,
      isPlaying: false,
    });
  },

  setStepIndex: (index) => {
    const { frames } = get();
    if (frames.length === 0) return;
    const clamped = Math.max(0, Math.min(frames.length - 1, index));
    set({
      currentStepIndex: clamped,
      isPlaying: clamped >= frames.length - 1 ? false : get().isPlaying,
    });
  },

  stepForward: () => {
    const { currentStepIndex, frames } = get();
    if (currentStepIndex < frames.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  jumpToStart: () => set({ currentStepIndex: 0, isPlaying: false }),

  jumpToEnd: () => {
    const { frames } = get();
    if (frames.length > 0) {
      set({ currentStepIndex: frames.length - 1, isPlaying: false });
    }
  },

  play: () => {
    const { currentStepIndex, frames } = get();
    if (frames.length === 0) return;
    if (currentStepIndex >= frames.length - 1) {
      set({ currentStepIndex: 0, isPlaying: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  toggleLeftDock: () => set((state) => ({ isLeftDockCollapsed: !state.isLeftDockCollapsed })),
  toggleRightDrawer: () => set((state) => ({ isRightDrawerCollapsed: !state.isRightDrawerCollapsed })),
  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),

  resetWorkspace: () => {
    const { activeModule, activeAlgo, customInput, targetValue, treeOrder } = get();
    const freshFrames = compileEngineFrames(activeModule, activeAlgo, customInput, targetValue, { order: treeOrder });
    set((state) => ({
      currentStepIndex: 0,
      isPlaying: false,
      frames: freshFrames,
      runId: state.runId + 1,
    }));
  },
}));

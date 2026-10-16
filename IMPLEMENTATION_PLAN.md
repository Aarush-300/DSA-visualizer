# MASTER IMPLEMENTATION PLAN: "ALGOFORGE" — VISUAL DATA STRUCTURE & ALGORITHM PLAYGROUND
**Target Agent:** Google Antigravity (`gemini-3.8-flash-high`)
**Verification Harness:** `udaysharmadev/Gravitas` (Mandatory Hook & Evidence Ledger Enforcement)
**Architecture:** Zero-Backend Client-Side Web Application (React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Zustand)

---

## PHASE 0: MANDATORY GRAVITAS SKILL INSTALLATION & CONTRACT INITIALIZATION

Before creating any application files, you MUST install, initialize, and bind the **Gravitas** verification skill (`https://github.com/udaysharmadev/Gravitas`) so that every phase of execution is governed by `pre_tool.py`, `post_tool.py`, and `stop_gate.py` hooks, and recorded in the `.gravitas/` evidence ledger.

### Step 0.1 — Install the Gravitas Skill in Antigravity
Execute the following commands in the terminal to install Gravitas and verify its diagnostic health:

1. Run the native Antigravity skill installer:
   `agy skill install https://github.com/udaysharmadev/Gravitas`
2. *(Fallback if `agy` CLI skill registry is offline)* Clone directly into the Antigravity workspace skill directory and link hooks:
   `git clone https://github.com/udaysharmadev/Gravitas.git .agent/skills/gravitas`
   `python3 .agent/skills/gravitas/scripts/install_hooks.py --cwd .`
3. Run the Gravitas diagnostic check:
   `gravitas doctor`

### Step 0.2 — Enforce Gravitas Security & Gitignore Rules
Per Gravitas security policy:
1. Create or update `.gitignore` immediately and add `.gravitas/` on its own line. **NEVER commit `.gravitas/` runtime session state to the repository.**
2. Initialize the Gravitas task contract in `.gravitas/contract.json` with the following mandatory verification gates (`REQ-01` through `REQ-08`):
   - `REQ-01`: Project scaffolding builds cleanly (`npm run typecheck` exits 0).
   - `REQ-02`: Deterministic Algorithm Generator Engine produces valid frame snapshots for all 4 modules (`npm run test:engine` exits 0).
   - `REQ-03`: All SVG/Canvas visualizers, custom pointers, and Framer Motion layout transitions render without console errors.
   - `REQ-04`: Live Code Inspector highlights exact C++, Python, and Pseudocode lines synchronized with each step frame.
   - `REQ-05`: Production bundle compiles cleanly (`npm run build` exits 0 with zero TypeScript or Vite warnings).
   - `REQ-06`: Final ledger verification (`gravitas verify` exits 0) before triggering `stop_gate.py`.

---

## 1. DESIGN SYSTEM, TYPOGRAPHY, COLOR TOKENS & VISUAL AESTHETIC

**Aesthetic Persona:** *"Obsidian Kinetic Laboratory"* — Inspired by Linear, Raycast, and Vercelgeist. Deep obsidian surfaces, subtle 1px translucent borders, glowing state-driven data nodes, tabular monospace telemetry, and physics-backed spring animations.

### 1.1 Typography & Font Stack
Import from Google Fonts in `index.html`:
`https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap`

| Role | Font Family | Weights | Tracking / Letter-Spacing | Line Height | CSS Utility / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display & Brand Headers** | `'Space Grotesk', sans-serif` | `600`, `700` | `-0.03em` | `1.15` | Top navbar title, modal headers, category titles |
| **UI Controls & Prose** | `'Plus Jakarta Sans', sans-serif` | `400`, `500`, `600` | `-0.01em` | `1.5` | Buttons, dropdowns, tooltips, algorithm explanations |
| **Code, Indices & Telemetry** | `'JetBrains Mono', monospace` | `400`, `500`, `700` | `0em` (`tabular-nums`) | `1.6` | Array values, memory addresses (`0x7F4A`), pointers (`i`, `j`, `mid`), Big-O badges, live code viewer |

### 1.2 Exact Color Tokens (CSS Variables in `src/styles/tokens.css`)
- **Background Surfaces:**
  - `--bg-canvas`: `#07090E` (Deepest obsidian backdrop for the main interactive stage)
  - `--bg-panel`: `rgba(15, 19, 28, 0.78)` with `backdrop-filter: blur(16px)` (Floating docks & sidebars)
  - `--bg-elevated`: `#161B26` (Buttons, input fields, code blocks, dropdown menus)
  - `--border-subtle`: `rgba(255, 255, 255, 0.08)` (1px structural hairlines)
  - `--border-focus`: `rgba(56, 189, 248, 0.45)` (Active control ring)
- **Typography Colors:**
  - `--text-primary`: `#F8FAFC` (Crisp alabaster white)
  - `--text-secondary`: `#94A3B8` (Muted slate for labels)
  - `--text-muted`: `#475569` (Disabled controls, memory hex addresses, background grid labels)
- **Algorithmic Semantic State Colors (CRITICAL FOR VISUALIZATION):**
  - `--state-idle`: Fill `#1E293B`, Border `#334155`, Text `#E2E8F0` (Default unvisited element)
  - `--state-active-compare`: Fill `rgba(245, 158, 11, 0.20)`, Border `#F59E0B`, Glow `0 0 18px rgba(245, 158, 11, 0.45)`, Text `#FDE68A` (Amber — two elements currently being compared)
  - `--state-mutate-swap`: Fill `rgba(244, 63, 94, 0.22)`, Border `#F43F5E`, Glow `0 0 22px rgba(244, 63, 94, 0.55)`, Text `#FECDD3` (Crimson Rose — elements actively swapping, inserting, or rotating)
  - `--state-visited`: Fill `rgba(56, 189, 248, 0.16)`, Border `#38BDF8`, Glow `0 0 14px rgba(56, 189, 248, 0.30)`, Text `#BAE6FD` (Electric Cyan — explored graph node or current sub-array partition)
  - `--state-pivot-target`: Fill `rgba(168, 85, 247, 0.22)`, Border `#A855F7`, Glow `0 0 20px rgba(168, 85, 247, 0.50)`, Text `#E9D5FF` (Neon Violet — QuickSort pivot, Binary Search `mid`, or Dijkstra start/target node)
  - `--state-sorted-verified`: Fill `rgba(16, 185, 129, 0.20)`, Border `#10B981`, Glow `0 0 18px rgba(16, 185, 129, 0.45)`, Text `#A7F3D0` (Emerald Mint — finalized sorted element or shortest path found)

---

## 2. COMPLETE DIRECTORY & FILE STRUCTURE

Create the exact directory tree below. Every file listed must be implemented with zero placeholder stubs:

```text
algoforge-playground/
├── .gitignore                                  # Includes node_modules/, dist/, and .gravitas/
├── index.html                                  # Google Fonts, title, meta tags, root mount
├── package.json                                # Dependencies & validation scripts
├── tsconfig.json                               # Strict TypeScript configuration
├── vite.config.ts                              # Vite bundler config with '@' path alias
├── public/
│   ├── favicon.svg                             # Glowing isometric node-graph emblem SVG
│   └── og-banner.svg                           # High-contrast OpenGraph preview SVG
├── src/
│   ├── main.tsx                                # React 19 entry point
│   ├── App.tsx                                 # Main 4-zone IDE grid layout & keyboard shortcuts listener
│   ├── styles/
│   │   ├── tokens.css                          # All CSS custom properties, glassmorphism utilities, custom scrollbars
│   │   └── globals.css                         # Tailwind imports, keyframe definitions, dot-matrix canvas background
│   ├── assets/
│   │   └── svg/
│   │       ├── LogoMark.tsx                    # Animated SVG brand emblem with pulsing central vertex
│   │       ├── PointerArrow.tsx                # Crisp SVG directional arrow for index pointers (i, j, low, high, mid)
│   │       ├── NullTerminator.tsx              # Electrical ground / NULL symbol SVG for Linked List tail
│   │       ├── EmptyCanvasIllustration.tsx     # Isometric wireframe blueprint SVG when custom input is empty
│   │       └── GraphEdgeDefs.tsx               # SVG <defs> for glowing arrowheads, gradients, and drop-shadows
│   ├── types/
│   │   ├── engine.ts                           # StepFrame, PointerMap, TelemetryMetrics, HighlightState, ExecutionStatus
│   │   ├── sorting.ts                          # SortingAlgorithmId, ArrayBarItem, PartitionRange
│   │   ├── trees.ts                            # TreeNodeData, TreeEdgeData, RotationType, TraversalOrder
│   │   ├── graphs.ts                           # GraphVertex, GraphDirectedEdge, GridCell, HeuristicType
│   │   └── linkedList.ts                       # MemoryNode, PointerLink, MemoryOperation
│   ├── store/
│   │   └── usePlaygroundStore.ts               # Zustand store: activeModule, activeAlgo, frames[], currentStepIndex, playbackSpeed, isPlaying, codeLanguage
│   ├── engines/                                # Pure TypeScript Generator functions (`function*`) yielding `StepFrame` objects
│   │   ├── sorting/
│   │   │   ├── bubbleSort.ts                   # Bubble Sort with early-exit optimization
│   │   │   ├── mergeSort.ts                    # Auxiliary sub-array split & merge tree frames
│   │   │   ├── quickSort.ts                    # Lomuto & Hoare partition frames with pivot tracking
│   │   │   └── heapSort.ts                     # Dual synchronized Array + Binary Max-Heap tree frames
│   │   ├── searching/
│   │   │   └── binarySearch.ts                 # Low/Mid/High window elimination frames
│   │   ├── linkedList/
│   │   │   └── singlyLinkedList.ts             # Head/Tail/Index insert, delete, & in-place 3-pointer reversal (`prev`, `curr`, `next`)
│   │   ├── trees/
│   │   │   ├── bstOperations.ts                # BST insert, search, delete (leaf, 1-child, inorder successor), DFS/BFS traversals
│   │   │   └── avlRotations.ts                 # Balance factor calculation (-2 to +2) + LL, RR, LR, RL animated rotations
│   │   └── graphs/
│   │       ├── pathfindingGrid.ts              # 2D Interactive Grid: Dijkstra, A* (Manhattan/Euclidean), BFS, Bidirectional Swarm + Recursive Division Maze Generator
│   │       └── networkGraph.ts                 # Force/Draggable Node-Edge Graph: Bellman-Ford, Prim's MST, Topological Sort
│   ├── data/
│   │   ├── algorithmCatalog.ts                 # Metadata, descriptions, Big-O table, and presets for all algorithms
│   │   └── codeSnippets.ts                     # Line-by-line C++, Python, and Pseudocode strings mapped to StepFrame `codeLine` IDs
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNavbar.tsx                   # Brand identity, Module Pill Switcher, Preset Selector, GitHub/Shortcuts buttons
│   │   │   ├── LeftControlDock.tsx             # Collapsible Input Generator, Custom Array/Tree Parser, Maze Controls, Node Inspector
│   │   │   ├── BottomTimelineBar.tsx           # Scrubber slider, Play/Pause/Step Forward/Step Back/Reset, Speed pill (0.25x - 8x)
│   │   │   ├── RightInspectorDrawer.tsx        # Tabbed panel: Live Code Highlighting (C++/Python/Pseudo), Call Stack, Telemetry
│   │   │   └── ShortcutsModal.tsx              # Keyboard shortcuts cheat sheet modal (`?` or `Cmd+K`)
│   │   ├── canvas/
│   │   │   ├── StageContainer.tsx              # Pan & zoom viewport wrapper with dot-grid background, floating legend, and step banner
│   │   │   ├── SortingStage.tsx                # Animated array bars, value pills, index rulers, and floating SVG pointer arrows
│   │   │   ├── LinkedListStage.tsx             # Memory node cards (`[data | *next]`), hex addresses (`0x4A10`), animated cubic-bezier arrows
│   │   │   ├── TreeStage.tsx                   # Reingold-Tilford hierarchical SVG layout, balance factor badges, rotation arc arrows
│   │   │   └── GraphStage.tsx                  # Dual-mode stage: 2D Interactive Wall/Weight Grid OR Draggable SVG Node-Edge Network
│   │   └── shared/
│   │       ├── StateLegendPill.tsx             # Floating color-coded legend bar in top-left of canvas
│   │       ├── StepNarrationBanner.tsx         # Glassmorphic toast banner explaining the exact operation in plain English
│   │       └── MetricCounterCard.tsx           # Tabular-nums animated counter for Comparisons, Swaps, Recursion Depth, Memory Ops
│   └── utils/
│       ├── treeLayout.ts                       # Calculates (x, y) coordinates for binary trees with zero node overlap
│       ├── bezierPath.ts                       # Computes smooth SVG cubic-bezier path strings (`M x1 y1 C cx1 cy1, cx2 cy2, x2 y2`)
│       └── inputValidator.ts                   # Parses user comma-separated inputs (`"42, 15, 8, 99, 23"`) safely with error feedback
└── tests/
    └── engine.test.ts                          # Vitest suite verifying every algorithm generator produces deterministic valid end states

3. EVERY TEXT, LABEL, MICROCOPY & FORMULA ON THE WEBPAGE

Use the exact strings and hierarchy below so the interface reads like a polished engineering tool:
3.1 Top Navigation Bar (TopNavbar.tsx)

    Brand Title: ALGOFORGE (Font: Space Grotesk, 700, 18px, tracking -0.03em)

    Brand Subtitle Badge: v2.4 // VISUAL DSA ENGINE (Font: JetBrains Mono, 500, 11px, cyan pill badge rgba(56, 189, 248, 0.12))

    4 Core Module Switcher Tabs (Center Segmented Control):

        01. Sorting & Searching

        02. Linked Lists & Pointers

        03. Trees & AVL Balancing

        04. Graphs & Pathfinding

    Right Utility Buttons:

        Presets ▾ (Dropdown offering: "Random Unsorted", "Nearly Sorted", "Reverse Sorted (Worst Case)", "Balanced BST", "Skewed AVL Trigger", "Weighted Labyrinth")

        Shortcuts [?] (Opens keyboard shortcut modal)

        Reset Workspace

3.2 Left Control Dock (LeftControlDock.tsx)

    Section Header 1: ALGORITHM CONFIGURATION (11px uppercase, tracking 0.08em, --text-secondary)

    Input Field Label: Custom Dataset (Comma-Separated Integers, 1–999)

    Input Placeholder: e.g., 64, 34, 25, 12, 22, 11, 90

    Validation Error Text (if invalid): ⚠ Enter between 3 and 32 integers ranging from 1 to 999.

    Action Buttons:

        Primary CTA: Generate & Compile Steps

        Secondary Buttons: Randomize (N=16) | Clear Wall Nodes (in Graph mode) | Generate Recursive Maze (in Graph mode)

    Interactive Target Controls (Context-Sensitive):

        In Linked List / Tree Mode: Input box [ Value: 42 ] + Buttons: + Insert Head, + Insert Tail, Insert at Index, - Delete Value, ⚡ Reverse In-Place

3.3 Center Canvas Overlays (StageContainer.tsx)

    Top-Left Floating State Legend (StateLegendPill.tsx):

        ● Unvisited | ● Comparing | ● Swapping / Mutating | ● Active Partition / Queue | ● Pivot / Target | ● Verified / Sorted

    Top-Center Dynamic Step Narration Banner (StepNarrationBanner.tsx):

        Displays human-readable narration of the current frame. Examples:

            QuickSort: "Frame 14/58 — Comparing array[3] (25) with Pivot array[7] (42). Since 25 <= 42, incrementing partition pointer i to index 3 and swapping."

            AVL Tree: "Frame 09/22 — Node 30 has Balance Factor +2 (Left-Heavy) and Left Child 20 has Balance Factor -1. Executing Left-Right (LR) Double Rotation."

            Linked List: "Frame 06/15 — Reversing link: Redirecting curr.next (0x4F20) to point backward to prev (0x4F10)."

3.4 Right Live Code & Telemetry Inspector (RightInspectorDrawer.tsx)

    Tab 1: Live Code Trace

        Language Switcher Pills: C++20 | Python 3.12 | Pseudocode

        Header Subtext: Active Execution Line synchronized with Frame State

    Tab 2: Runtime Telemetry & Complexity

        Live Counters (4-Card Grid):

            COMPARISONS: 0024

            MUTATIONS / SWAPS: 0011

            AUXILIARY MEMORY: O(log n) — 4 Stack Frames

            CURRENT FRAME: 14 / 58

        Complexity Reference Card:

            Best Case Time: Ω(n log n)

            Average Case Time: Θ(n log n)

            Worst Case Time: O(n²)

            Space Complexity: O(log n)

    Tab 3: Call Stack & Queue State

        Displays live LIFO Recursion Call Stack frames (e.g., quickSort(arr, low=0, high=7)) or FIFO BFS/Dijkstra Priority Queue tuples ([(dist: 0, node: 'A'), (dist: 4, node: 'C')]).

3.5 Bottom Timeline Transport Bar (BottomTimelineBar.tsx)

    Left Status Indicator: STATUS: PAUSED / STATUS: EXECUTING / STATUS: COMPLETED (with pulsing emerald/amber LED dot)

    Center Transport Controls:

        |<< Jump to Start (Home)

        < Step Backward (←)

        ▶ Play / ⏸ Pause (Space)

        Step Forward (→) >

        Jump to End (End) >>|

    Interactive Scrubber: Full-width range timeline showing step tick marks; hovering any tick displays a mini tooltip "Step #14: Swap(25, 64)".

    Right Speed Selector Pills: 0.25x | 0.5x | 1x | 2x | 4x | 8x

4. EVERY ANIMATION, TRANSITION, KEYFRAME & SPRING SPECIFICATION

Every visual state change MUST be driven by deterministic physics or cubic-bezier curves—never abrupt instant jumps.
4.1 Framer Motion Spring Configurations

Define reusable spring presets in src/utils/motionPresets.ts:

    Array Bar / Node Position Swap (SPRING_SWAP):

        { type: "spring", stiffness: 320, damping: 28, mass: 0.9 }

        Used with Framer Motion layout and layoutId={item.uniqueId} so bars physically glide past one another horizontally when swapped.

    Pointer Arrow Tracking (SPRING_POINTER):

        { type: "spring", stiffness: 450, damping: 32, mass: 0.6 }

        Keeps index arrows (i, j, mid, low, high) snappy and tightly locked under their target elements.

    Tree Rotation & Node Insertion (SPRING_TREE):

        { type: "spring", stiffness: 240, damping: 24, mass: 1.1 }

        Smoothly animates (x, y) coordinates of binary tree nodes and re-routes parent-child SVG edges during AVL LL/RR/LR/RL rotations.

    Drawer & Modal Transitions (EASE_UI):

        { duration: 0.22, ease: [0.16, 1, 0.3, 1] } (Custom exponential out curve).

4.2 Custom CSS Keyframes & SVG Transitions (src/styles/globals.css)

    @keyframes pulse-compare (Active Comparison Halo):

        0%, 100%: box-shadow: 0 0 12px rgba(245, 158, 11, 0.35); transform: scale(1);

        50%: box-shadow: 0 0 24px rgba(245, 158, 11, 0.70); transform: scale(1.035);

        Duration: 900ms infinite ease-in-out.

    @keyframes graph-wavefront (Pathfinding Grid Visited Node Expansion):

        0%: transform: scale(0.3); border-radius: 100%; background-color: rgba(168, 85, 247, 0.85);

        60%: transform: scale(1.12); background-color: rgba(56, 189, 248, 0.45);

        100%: transform: scale(1.0); border-radius: 4px; background-color: rgba(56, 189, 248, 0.20);

        Duration: 380ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards.

    @keyframes shortest-path-beacon (Final Path Found):

        Sequentially staggered by 35ms per cell along the reconstructed shortest path, lighting up cells in --state-sorted-verified (#10B981) with a 1.08 scale pop.

    SVG Edge Pointer Redirection (Linked List & Trees):

        All SVG <path> links use stroke-dasharray: 6 4 with @keyframes march-ants (stroke-dashoffset from 20 to 0 over 0.8s linear infinite) when actively traversed.

5. EVERY SVG, ICON & VISUAL ASSET SPECIFICATION

No external raster .png or .jpg files may be used (zero broken image links, instant load times). All visuals must be crisp inline SVGs and Lucide icons:

    src/assets/svg/LogoMark.tsx:

        28x28 SVG featuring an isometric hexagon with 3 interconnected vertices (#38BDF8, #A855F7, #10B981) and a subtle glowing <feGaussianBlur> filter.

    src/assets/svg/PointerArrow.tsx:

        Custom 24x32 upward-pointing vector arrow positioned beneath active array bars or above linked list nodes, paired with a monospace pill badge (i = 2, mid = 5, curr, prev).

    src/assets/svg/NullTerminator.tsx:

        Rendered at the tail of Singly Linked Lists (next -> NULL): displays a crisp schematic ground symbol with label 0x0000 (NULL).

    src/assets/svg/GraphEdgeDefs.tsx:

        Reusable <defs> block containing <marker id="arrow-idle">, <marker id="arrow-active">, <marker id="arrow-path">, and <filter id="neon-glow"> used across Linked Lists, Trees, and Directed Graphs.

    Canvas Background (StageContainer.tsx):

        Infinite radial dot-matrix SVG pattern (radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px) spaced at 24px × 24px).

6. STEP-BY-STEP EXECUTION ROADMAP FOR ANTIGRAVITY

Execute these steps sequentially. After each step, record verification evidence in the Gravitas ledger.
Step 1: Initialize Vite + React + TypeScript + Tailwind v4 Project

    Scaffold project files (package.json, tsconfig.json, vite.config.ts, index.html).

    Install exact packages: react, react-dom, framer-motion, zustand, lucide-react, clsx, tailwind-merge, and devDependencies typescript, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, vitest.

    Create src/styles/tokens.css and src/styles/globals.css with all color variables, font families, and keyframe animations.

Step 2: Build Core Type Definitions & Deterministic Step Engine Architecture

    Implement src/types/engine.ts defining StepFrame<TState>:

        frameIndex: number

        snapshot: TState (deep-cloned state of bars, nodes, edges, or grid cells at that exact step)

        pointers: Record<string, number | string> (e.g., { i: 2, j: 5, pivot: 7 })

        codeLine: { cpp: number; python: number; pseudo: number }

        narration: string

        metrics: { comparisons: number; swaps: number; memoryOps: number; recursionDepth: number }

        callStack: string[]

    Implement src/store/usePlaygroundStore.ts with Zustand supporting:

        Instant scrubbing to any frameIndex in O(1) time by indexing into the precomputed frames[] array.

        Auto-advancing requestAnimationFrame / setInterval playback loop scaled by playbackSpeed (0.25x to 8x).

Step 3: Implement All 4 Algorithm Generator Modules (src/engines/)

    Sorting & Searching (src/engines/sorting/ & searching/):

        Implement Bubble Sort, Merge Sort, Quick Sort, Heap Sort, and Binary Search generators. Ensure every comparison, swap, and sorted lock yields a distinct StepFrame.

    Linked List Engine (src/engines/linkedList/singlyLinkedList.ts):

        Assign realistic simulated hex memory addresses (0x4F10, 0x4F28, etc.) to each node.

        Yield step-by-step frames for Head/Tail/Index insertion, value search, node deletion, and In-Place 3-Pointer Reversal (prev, curr, next pointer reassignment).

    Trees & AVL Engine (src/engines/trees/):

        Implement bstOperations.ts and avlRotations.ts coupled with src/utils/treeLayout.ts to compute exact (x, y) coordinates and node balance factors (height(left) - height(right)).

        Animate LL, RR, LR, and RL imbalances with explicit intermediate rotation frames.

    Graphs & Pathfinding Engine (src/engines/graphs/):

        Implement pathfindingGrid.ts (20×42 interactive grid supporting mouse click-and-drag wall drawing, draggable Start/Target nodes, Recursive Division Maze generation, Dijkstra, A*, and BFS).

        Implement networkGraph.ts (weighted node-edge graph with draggable vertices and Prim's MST / Dijkstra relaxation steps).

Step 4: Write Unit Tests for All Algorithm Generators (tests/engine.test.ts)

    Create tests/engine.test.ts using Vitest.

    Assert that Sorting generators yield sorted final snapshots, Linked List reversal reverses node order and updates head, AVL insertions maintain |balanceFactor| <= 1 on all nodes, and A*/Dijkstra find optimal shortest paths.

    Run npm run test:engine so Gravitas post_tool.py records passing test evidence.

Step 5: Build the 4 Interactive Visual Stages (src/components/canvas/)

    Build SortingStage.tsx with Framer Motion layoutId bars, dynamic height scaling, value labels inside/above bars, and PointerArrow components underneath active indices.

    Build LinkedListStage.tsx with horizontal node cards divided into [ DATA | NEXT* ], memory hex headers, curved SVG cubic-bezier arrows (src/utils/bezierPath.ts), and NullTerminator.tsx.

    Build TreeStage.tsx with smooth SVG parent-child connectors, circular nodes showing value inside and a color-coded Balance Factor pill (BF: +1) on the top-right rim.

    Build GraphStage.tsx with a mode toggle between 2D Grid Labyrinth and Weighted Network Graph.

Step 6: Build the IDE Shell, Live Code Inspector & Keyboard Navigation

    Build TopNavbar.tsx, LeftControlDock.tsx, RightInspectorDrawer.tsx, BottomTimelineBar.tsx, and ShortcutsModal.tsx.

    Populate src/data/codeSnippets.ts with complete, accurate C++20, Python 3.12, and Pseudocode implementations for every algorithm, ensuring codeLine numbers match the highlighted row in RightInspectorDrawer.tsx.

    Bind global keyboard listeners in App.tsx:

        Space: Play / Pause

        ArrowRight: Step Forward 1 Frame

        ArrowLeft: Step Backward 1 Frame

        Home / End: Jump to Frame 0 / Final Frame

        R: Randomize Dataset

        ?: Toggle Shortcuts Modal

Step 7: Final Build, Gravitas Verification & Deployment Readiness

    Run npm run typecheck (tsc --noEmit) and fix any strict TypeScript issues.

    Run npm run test:engine (vitest run) and confirm 100% pass rate.

    Run npm run build (vite build) and verify dist/ bundle generation.

    Run gravitas verify and gravitas doctor to validate the hash-chained evidence ledger in .gravitas/ against all contract requirements before completing the task.
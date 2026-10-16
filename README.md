# ALGOFORGE // INDUSTRIAL HARDWARE DSA LAB

[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-FCC72B.svg?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare_Pages-F38020.svg?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **ALGOFORGE** is a precision-engineered, cycle-accurate Data Structures and Algorithms visual laboratory. Built with an industrial hardware aesthetic inspired by **Teenage Engineering**, **Linear**, and **Vercel Geist**, ALGOFORGE delivers frame-exact algorithm execution, deterministic register telemetry, polyglot code synchronization across 6 languages, and interactive in-memory structural mutations.

---

## ⚡ Flagship Highlights

- **Industrial Hardware Workbench**: Custom obsidian and high-contrast drafting themes, technical typography, hairline borders, and hardware register telemetry.
- **Cycle-Accurate Visual Telemetry**: Live metrics recording comparisons, swaps, memory allocations, auxiliary space, and recursion call stack depth.
- **Universal In-Memory Mutations**: Dynamic insertion and deletion across arrays, stacks, queues, linked lists, trees, and network graph topologies.
- **6-Language Polyglot Synchronizer**: Real-time code tracking in **C (C99)**, **C++ (C++20)**, **Java (Java 21)**, **Python (3.12)**, **Pseudocode**, and **Formal Algorithm Specification**.
- **Zero External Component Libraries**: 100% custom-crafted UI components using React 19, Tailwind CSS, Lucide icons, and Framer Motion hardware physics.
- **Production-Ready Cloudflare Pages Configuration**: Preconfigured SPA redirects, security headers, immutable asset caching, and Node.js 22 LTS runtime.

---

## 🎛️ Complete 5-Module Feature Suite

### 01 · SORTING & SEARCHING
Frame-exact comparison sorting and logarithmic search visualizers with persistent element identities and partition tracking.
- **Quick Sort (Lomuto Partition)**: In-place pivot selection, scanning boundary markers, and recursive call stack frames.
- **Merge Sort**: Stable divide-and-conquer sub-array division with visual auxiliary memory merge buffers.
- **Heap Sort**: In-place Max-Heap construction phase followed by root extractions and sift-down boundary reduction.
- **Bubble Sort**: Adjacent element comparisons with early-exit flag detection on sorted passes.
- **Insertion Sort**: Key elevation animation, sorted boundary shifting, and slot insertion.
- **Selection Sort**: Global minimum candidate tracking with front-boundary swapping.
- **Binary Search**: Logarithmic window elimination with midpoint calculation (`low`, `mid`, `high`).
- **Linear Search**: Sequential scan with visited candidate states and target match confirmation.

### 02 · STACKS & QUEUES
Linear and radial hardware memory chambers with explicit pointer registers.
- **Stack (LIFO)**: Vertical memory chamber with live `SP` (Stack Pointer) register, capacity limits, and top-of-stack push/pop animations.
- **Linear Queue (FIFO)**: Horizontal conveyor buffer with sliding `FRONT` and `REAR` pointers and vacated ghost slot indicators.
- **Circular Queue (Ring Buffer)**: Radial SVG ring visualizer with live modulo arithmetic telemetry (`(rear + 1) % CAPACITY`).
- **Priority Queue (Heap)**: Synchronized split-screen view pairing a priority-ranked array with an interactive binary heap tree.
- **Double-Ended Queue (Deque)**: Bidirectional chamber featuring independent Front and Rear push/pop gate operations.

### 03 · LINKED LISTS
Hardware pointer chains with explicit memory addresses (`0x4F10`), pointer dereferencing, and SVG bus routing.
- **Singly Linked List**: 2-cell node cards `[ DATA | *NEXT ]` terminating at a grounded `NULL` bus.
- **Doubly Linked List**: 3-cell node cards `[ *PREV | DATA | *NEXT ]` with parallel bidirectional pointer arrows.
- **Circular Singly Linked List**: Tail node connected back to Head via an SVG under-bus feedback loop.
- **Circular Doubly Linked List**: Fully closed bidirectional ring with top and bottom wrap-around buses.
- **Universal Pointer Operations**: In-place reversals, head/tail/index insertions, and deallocations.

### 04 · HIERARCHICAL TREES
Self-balancing binary trees and multi-way database index structures.
- **Binary Search Tree (BST)**: Dynamic key insertion, search path highlighting, and predecessor/successor deletion.
- **AVL Self-Balancing Tree**: Continuous height calculation, balance factor telemetry (`-1`, `0`, `+1`), and automated LL, RR, LR, RL rotations.
- **M-Way Search Tree (M=3)**: Multi-compartment horizontal blocks `[ *P0 | K1 | *P1 | K2 | *P2 ]` routing subtrees.
- **B-Tree (Order M=3/4)**: Balanced multi-way tree featuring node overflow splits, median key promotions, and leaf balancing.
- **B+ Tree (Database Index)**: Internal router nodes paired with horizontal leaf node scan pointers for range query indexing.

### 05 · GRAPH ALGORITHMS & NETWORKS
2D grid pathfinding and weighted network topology graphs.
- **Dijkstra Grid Pathfinding**: Uniform cost wavefront expansion exploring 2D terrain with obstacle walls and weighted nodes (`+5 cost`).
- **A* Heuristic Search**: Directed exploration biased by admissible Manhattan distance heuristic (`f(n) = g(n) + h(n)`).
- **Breadth-First Search (BFS)**: Unweighted hop-distance level exploration.
- **Depth-First Search (DFS)**: Branch-first path exploration with backtracking stack telemetry.
- **Prim's Minimum Spanning Tree**: Interactive network topology graph with edge weight inspection and cut-set evaluations.

---

## 💻 Polyglot Code Synchronization

Every algorithm includes cycle-accurate line mappings across 6 standard implementations:

| Language | Standard / Dialect | Highlights |
| :--- | :--- | :--- |
| **C** | C99 Strict | Raw pointer arithmetic, memory addresses, zero-cost abstractions |
| **C++** | C++20 Standard | STL iterators, templates, `std::swap`, modern memory models |
| **Java** | Java 21 LTS | Object references, zero-based array indexing, class wrappers |
| **Python** | Python 3.12 | Idiomatic list slicing, type hints, concise expressions |
| **Pseudocode** | CLRS Style | Structured algorithmic pseudocode with 1-indexed invariants |
| **Algorithm** | Formal Spec | Mathematical step specifications with pre/post-conditions |

---

## 🎨 Design System & Theming

ALGOFORGE features two calibrated themes powered entirely by CSS custom property tokens:

- **Dark Mode (Default)**: Deep obsidian canvas (`#090908`), tactile matte panels (`#111110`), hairline borders (`#262522`), and high-energy safety amber accents (`#FF4F00`).
- **Light Mode**: Technical drafting linen canvas (`#F4F3EF`), crisp engineering panels (`#FFFFFF`), graphite borders (`#D5D3CC`), and vibrant precision accents (`#E04500`).

Switch themes dynamically using the navbar switch or the `T` keyboard shortcut.

---

## ⌨️ Hardware Control Shortcuts

| Key | Action | Description |
| :---: | :--- | :--- |
| `Space` | **Play / Pause** | Toggle continuous algorithm playback |
| `→` | **Step Forward** | Advance exactly one execution frame |
| `←` | **Step Backward** | Rewind to previous frame snapshot |
| `Home` | **Jump to Start** | Reset execution to Frame 0 |
| `End` | **Jump to End** | Fast-forward to completed state |
| `[` / `]` | **Speed Adjust** | Decrease / Increase playback speed (0.25x – 8x) |
| `R` | **Randomize** | Generate fresh randomized input dataset |
| `T` | **Toggle Theme** | Switch between Dark and Light mode |
| `?` | **Help / Shortcuts** | Open technical shortcuts overlay |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20+` or `v22 LTS` (matching `.nvmrc`)
- **npm**: `v10+`

### Installation
```bash
# Clone the repository
git clone https://github.com/Aarush-300/DSA-visualizer.git
cd DSA-visualizer

# Install dependencies
npm install
```

### Local Development
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Verification & Testing
```bash
# Run typechecking
npm run typecheck

# Run Vitest algorithm engine test suite
npm run test:engine

# Build production bundle
npm run build
```

---

## ☁️ Cloudflare Pages Deployment

ALGOFORGE is optimized for zero-configuration deployment on **Cloudflare Pages**:

1. Connect your GitHub repository to Cloudflare Pages.
2. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Environment Variable**: `NODE_VERSION = 22`
3. Preconfigured deployment assets:
   - `public/_redirects`: Provides SPA routing rewrite rules (`/* /index.html 200`).
   - `public/_headers`: Enforces strict security headers (`X-Frame-Options`, `nosniff`, `strict-origin`) and sets 1-year immutable caching on `/assets/*`.
   - `.nvmrc`: Locks deployment runtime to Node.js 22 LTS.

---

## 🏛️ Project Architecture

```
DSA-visualizer/
├── .gravitas/                     # Verification ledger and specifications
├── public/
│   ├── _headers                   # Cloudflare security & caching rules
│   ├── _redirects                 # Cloudflare SPA rewrite rules
│   ├── favicon.svg                # 3-vertex schematic tree logo
│   └── og-banner.svg              # Social preview card
├── src/
│   ├── assets/                    # Circuit node schematic emblems
│   ├── components/
│   │   ├── canvas/                # Visualizers (Sorting, StackQueue, LinkedList, Tree, Graph)
│   │   ├── layout/                # TopNavbar, LeftControlDock, RightInspectorDrawer, BottomTimeline
│   │   └── modals/                # KeyboardShortcutsModal
│   ├── data/
│   │   ├── algorithmCatalog.ts    # Big-O complexity metadata & presets
│   │   └── codeSnippets.ts        # 6-language code snippet database
│   ├── engines/
│   │   ├── sorting/               # Quick, Merge, Heap, Bubble, Insertion, Selection
│   │   ├── searching/             # Binary Search, Linear Search
│   │   ├── stacksQueues/          # Stack, Queue, Circular, Deque, Priority Queue
│   │   ├── linkedList/            # Singly, Doubly, Circular Singly, Circular Doubly
│   │   ├── trees/                 # BST, AVL, M-Way, B-Tree, B+ Tree
│   │   ├── graphs/                # Dijkstra, A*, BFS, DFS, Prim's MST
│   │   └── compileEngine.ts       # Unified multi-module compiler bus
│   ├── store/
│   │   └── usePlaygroundStore.ts  # Zustand reactive playback state machine
│   ├── styles/
│   │   ├── tokens.css             # Semantic light/dark theme variables
│   │   └── index.css              # Global layout styles & font declarations
│   └── types/                     # Strict TypeScript interfaces & unions
├── tests/
│   └── engine.test.ts             # 36-test Vitest regression suite
├── .nvmrc                         # Node.js 22 LTS declaration
├── package.json                   # Dependencies and npm scripts
└── vite.config.ts                 # Vite bundler configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).


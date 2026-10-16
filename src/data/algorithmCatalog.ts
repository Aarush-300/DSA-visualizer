import { ActiveModuleId, AlgorithmId } from '../types/engine';

export interface BigOComplexity {
  bestTime: string;
  averageTime: string;
  worstTime: string;
  space: string;
}

export interface AlgorithmMetadata {
  id: AlgorithmId;
  name: string;
  module: ActiveModuleId;
  category: string;
  shortDescription: string;
  description: string;
  complexity: BigOComplexity;
  defaultInput: string;
  presets: { label: string; values: string }[];
}

export const ALGORITHM_CATALOG: Record<AlgorithmId | string, AlgorithmMetadata> = {
  // ================= 01 SORTING & SEARCH =================
  quick: {
    id: 'quick',
    name: 'Quick Sort (Lomuto)',
    module: 'sorting',
    category: 'Divide & Conquer',
    shortDescription: 'In-place partitioning around a selected pivot element.',
    description: 'QuickSort recursively partitions the array such that all elements smaller than the pivot precede it, and larger elements follow it. Features Lomuto partition with explicit pivot tracking.',
    complexity: {
      bestTime: 'Ω(n log n)',
      averageTime: 'Θ(n log n)',
      worstTime: 'O(n²)',
      space: 'O(log n)',
    },
    defaultInput: '64, 34, 25, 12, 22, 11, 90',
    presets: [
      { label: 'Random Unsorted', values: '64, 34, 25, 12, 22, 11, 90' },
      { label: 'Nearly Sorted', values: '10, 20, 25, 40, 35, 50, 60' },
      { label: 'Reverse Sorted', values: '90, 80, 70, 60, 50, 40, 30' },
    ],
  },
  merge: {
    id: 'merge',
    name: 'Merge Sort',
    module: 'sorting',
    category: 'Divide & Conquer',
    shortDescription: 'Stable recursive divide-and-conquer sub-array merging.',
    description: 'Divides array into halves until singletons remain, then merges sorted sub-arrays using temporary buffers with strict linear merge stability.',
    complexity: {
      bestTime: 'Ω(n log n)',
      averageTime: 'Θ(n log n)',
      worstTime: 'O(n log n)',
      space: 'O(n)',
    },
    defaultInput: '38, 27, 43, 3, 9, 82, 10',
    presets: [
      { label: 'Random Unsorted', values: '38, 27, 43, 3, 9, 82, 10' },
      { label: 'Already Sorted', values: '5, 12, 23, 34, 45, 67, 89' },
    ],
  },
  heap: {
    id: 'heap',
    name: 'Heap Sort',
    module: 'sorting',
    category: 'Selection / Binary Heap',
    shortDescription: 'In-place sorting using Max-Heap tree invariants.',
    description: 'Builds a binary max-heap in O(n) time, then repeatedly extracts the maximum root to the end of the array, shrinking the active heap boundary.',
    complexity: {
      bestTime: 'Ω(n log n)',
      averageTime: 'Θ(n log n)',
      worstTime: 'O(n log n)',
      space: 'O(1)',
    },
    defaultInput: '40, 10, 30, 50, 60, 15, 75',
    presets: [
      { label: 'Random Unsorted', values: '40, 10, 30, 50, 60, 15, 75' },
    ],
  },
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    module: 'sorting',
    category: 'Exchange',
    shortDescription: 'Repeatedly steps through list, swapping adjacent out-of-order elements.',
    description: 'Simple comparison sort that bubbles largest values to the end with an early-exit flag when no swaps occur in a full pass.',
    complexity: {
      bestTime: 'Ω(n)',
      averageTime: 'Θ(n²)',
      worstTime: 'O(n²)',
      space: 'O(1)',
    },
    defaultInput: '64, 34, 25, 12, 22, 11, 90',
    presets: [
      { label: 'Random Unsorted', values: '64, 34, 25, 12, 22, 11, 90' },
    ],
  },
  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    module: 'sorting',
    category: 'Incremental Insertion',
    shortDescription: 'Builds the sorted array one item at a time by elevating and shifting elements.',
    description: 'Maintains a sorted sub-array on the left. The current key is elevated, larger elements are shifted right, and the key drops into its exact position.',
    complexity: {
      bestTime: 'Ω(n)',
      averageTime: 'Θ(n²)',
      worstTime: 'O(n²)',
      space: 'O(1)',
    },
    defaultInput: '52, 38, 14, 89, 23, 67, 45',
    presets: [
      { label: 'Random Unsorted', values: '52, 38, 14, 89, 23, 67, 45' },
      { label: 'Nearly Sorted', values: '10, 12, 15, 25, 18, 30, 35' },
    ],
  },
  selection: {
    id: 'selection',
    name: 'Selection Sort',
    module: 'sorting',
    category: 'Selection',
    shortDescription: 'Finds the minimum element from the unsorted part and swaps it to the front.',
    description: 'Divides the list into sorted and unsorted parts. Repeatedly finds the minimum element in the unsorted section and swaps it into the sorted boundary.',
    complexity: {
      bestTime: 'Ω(n²)',
      averageTime: 'Θ(n²)',
      worstTime: 'O(n²)',
      space: 'O(1)',
    },
    defaultInput: '64, 25, 12, 22, 11, 90',
    presets: [
      { label: 'Random Unsorted', values: '64, 25, 12, 22, 11, 90' },
    ],
  },
  binarySearch: {
    id: 'binarySearch',
    name: 'Binary Search',
    module: 'sorting',
    category: 'Search',
    shortDescription: 'Logarithmic search on a sorted dataset eliminating half the search space.',
    description: 'Computes mid = (low + high) / 2 and eliminates either the left or right partition until target is identified or bounds cross.',
    complexity: {
      bestTime: 'Ω(1)',
      averageTime: 'Θ(log n)',
      worstTime: 'O(log n)',
      space: 'O(1)',
    },
    defaultInput: '11, 22, 25, 34, 45, 64, 78, 90',
    presets: [
      { label: 'Sorted Array (Target: 34)', values: '11, 22, 25, 34, 45, 64, 78, 90' },
    ],
  },
  linearSearch: {
    id: 'linearSearch',
    name: 'Linear Search',
    module: 'sorting',
    category: 'Sequential Search',
    shortDescription: 'Sequential scan checking every element in order until match is found.',
    description: 'Inspects array elements from index 0 to n-1. Rejected elements turn grey while matched element pulses emerald.',
    complexity: {
      bestTime: 'Ω(1)',
      averageTime: 'Θ(n)',
      worstTime: 'O(n)',
      space: 'O(1)',
    },
    defaultInput: '42, 17, 89, 33, 56, 78, 21',
    presets: [
      { label: 'Unsorted (Target: 33)', values: '42, 17, 89, 33, 56, 78, 21' },
    ],
  },

  // ================= 02 STACKS & QUEUES =================
  stack: {
    id: 'stack',
    name: 'Stack (LIFO)',
    module: 'stacksQueues',
    category: 'Linear Memory / LIFO',
    shortDescription: 'Last-In, First-Out vertical memory chamber with Top pointer.',
    description: 'Elements are pushed and popped exclusively from the top of the stack. Displays live TOP pointer, capacity limits, and hex addresses.',
    complexity: {
      bestTime: 'Ω(1) Push/Pop',
      averageTime: 'Θ(1) Push/Pop',
      worstTime: 'O(1) Push/Pop',
      space: 'O(n)',
    },
    defaultInput: '15, 30, 45, 60',
    presets: [
      { label: 'Initial Stack', values: '15, 30, 45, 60' },
      { label: 'Empty Stack', values: '' },
    ],
  },
  linearQueue: {
    id: 'linearQueue',
    name: 'Linear Queue (FIFO)',
    module: 'stacksQueues',
    category: 'Sequential FIFO',
    shortDescription: 'First-In, First-Out conveyor array with sliding Front and Rear pointers.',
    description: 'Elements are enqueued at the rear and dequeued at the front. Dequeued positions become vacated ghost cells until memory is reallocated.',
    complexity: {
      bestTime: 'Ω(1) Enqueue/Dequeue',
      averageTime: 'Θ(1)',
      worstTime: 'O(1)',
      space: 'O(n)',
    },
    defaultInput: '10, 20, 30, 40',
    presets: [
      { label: 'Conveyor Queue', values: '10, 20, 30, 40' },
    ],
  },
  circularQueue: {
    id: 'circularQueue',
    name: 'Circular Queue (Ring Buffer)',
    module: 'stacksQueues',
    category: 'Ring Buffer / Modulo Math',
    shortDescription: 'Geometric radial SVG ring buffer with modulo wrap-around (rear + 1) % N.',
    description: 'Eliminates ghost cell memory waste by wrapping pointers around a radial track using modular arithmetic. Center hub displays live modulo formula.',
    complexity: {
      bestTime: 'Ω(1)',
      averageTime: 'Θ(1)',
      worstTime: 'O(1)',
      space: 'O(N) Fixed',
    },
    defaultInput: '12, 24, 36, 48, 60',
    presets: [
      { label: 'Ring Buffer 5/8', values: '12, 24, 36, 48, 60' },
    ],
  },
  priorityQueue: {
    id: 'priorityQueue',
    name: 'Priority Queue (Heap)',
    module: 'stacksQueues',
    category: 'Binary Heap Priority',
    shortDescription: 'Synchronized split view: ordered priority array + binary heap tree.',
    description: 'Items are ordered by priority tag (1-99). Top view shows array cells with priority badges, while bottom view animates heap sift-up and sift-down.',
    complexity: {
      bestTime: 'Ω(1) Peek Top',
      averageTime: 'Θ(log n) Insert/Extract',
      worstTime: 'O(log n)',
      space: 'O(n)',
    },
    defaultInput: '45, 12, 78, 23, 89',
    presets: [
      { label: 'Heap Queue', values: '45, 12, 78, 23, 89' },
    ],
  },
  deque: {
    id: 'deque',
    name: 'Double-Ended Queue (Deque)',
    module: 'stacksQueues',
    category: 'Bidirectional FIFO/LIFO',
    shortDescription: 'Horizontal memory chamber open at both ends with dual entry/exit gates.',
    description: 'Supports insertion and deletion at both the front and rear gates in O(1) time. Features dual gate telemetry and bidirectional expansion.',
    complexity: {
      bestTime: 'Ω(1) Front/Rear Ops',
      averageTime: 'Θ(1)',
      worstTime: 'O(1)',
      space: 'O(n)',
    },
    defaultInput: '20, 40, 60, 80',
    presets: [
      { label: 'Balanced Deque', values: '20, 40, 60, 80' },
    ],
  },

  // ================= 03 LINKED LISTS =================
  singlyLinkedList: {
    id: 'singlyLinkedList',
    name: 'Singly Linked List',
    module: 'linkedList',
    category: 'Forward Pointer Chain',
    shortDescription: '2-cell node card [ DATA | *NEXT ] forward pointer chain terminating at NULL.',
    description: 'Visualizes memory addresses (0x4F10), next-pointer dereferencing, insertion, deletion, and in-place 3-pointer reversal.',
    complexity: {
      bestTime: 'Ω(1) Head Insert',
      averageTime: 'Θ(n) Traverse/Search',
      worstTime: 'O(n) Reversal',
      space: 'O(1) Auxiliary',
    },
    defaultInput: '15, 28, 42, 67, 89',
    presets: [
      { label: 'Standard Chain', values: '15, 28, 42, 67, 89' },
    ],
  },
  doublyLinkedList: {
    id: 'doublyLinkedList',
    name: 'Doubly Linked List',
    module: 'linkedList',
    category: 'Bidirectional Pointer Chain',
    shortDescription: '3-cell node card [ *PREV | DATA | *NEXT ] with parallel forward and backward arrows.',
    description: 'Each node maintains both next and previous pointers, allowing bidirectional traversal with null terminators at both ends.',
    complexity: {
      bestTime: 'Ω(1) Head/Tail Ops',
      averageTime: 'Θ(n) Search',
      worstTime: 'O(n)',
      space: 'O(1) Auxiliary',
    },
    defaultInput: '10, 20, 30, 40, 50',
    presets: [
      { label: '5-Node Doubly Chain', values: '10, 20, 30, 40, 50' },
    ],
  },
  circularSinglyLinkedList: {
    id: 'circularSinglyLinkedList',
    name: 'Circular Singly Linked List',
    module: 'linkedList',
    category: 'Ring Pointer Chain',
    shortDescription: 'Tail node routes via smooth feedback bus under the chain back to Head.',
    description: 'Tail node next pointer connects back to Head, forming a continuous ring without NULL terminators.',
    complexity: {
      bestTime: 'Ω(1) Head Insert',
      averageTime: 'Θ(n) Traverse',
      worstTime: 'O(n)',
      space: 'O(1)',
    },
    defaultInput: '12, 24, 36, 48',
    presets: [
      { label: 'Circular Ring', values: '12, 24, 36, 48' },
    ],
  },
  circularDoublyLinkedList: {
    id: 'circularDoublyLinkedList',
    name: 'Circular Doubly Linked List',
    module: 'linkedList',
    category: 'Bidirectional Ring Chain',
    shortDescription: 'Bidirectional adjacent links with upper and lower wrap-around feedback buses.',
    description: 'Both head.prev connects to tail and tail.next connects to head, forming a fully closed bidirectional ring buffer.',
    complexity: {
      bestTime: 'Ω(1) Head/Tail Ops',
      averageTime: 'Θ(n)',
      worstTime: 'O(n)',
      space: 'O(1)',
    },
    defaultInput: '10, 25, 50, 75',
    presets: [
      { label: 'Full Ring', values: '10, 25, 50, 75' },
    ],
  },

  // ================= 04 TREES =================
  bst: {
    id: 'bst',
    name: 'Binary Search Tree',
    module: 'trees',
    category: 'Hierarchical Search',
    shortDescription: 'Left-child smaller, right-child greater ordered tree operations.',
    description: 'Supports dynamic key insertion, search, and deletion with in-order predecessor/successor replacement.',
    complexity: {
      bestTime: 'Ω(log n)',
      averageTime: 'Θ(log n)',
      worstTime: 'O(n)',
      space: 'O(n)',
    },
    defaultInput: '45, 22, 78, 14, 33, 62, 95',
    presets: [
      { label: 'Balanced Tree', values: '50, 25, 75, 12, 37, 63, 87' },
    ],
  },
  avl: {
    id: 'avl',
    name: 'AVL Self-Balancing Tree',
    module: 'trees',
    category: 'Height-Balanced BST',
    shortDescription: 'Strict height balance factor calculation with LL, RR, LR, RL rotations.',
    description: 'Self-balancing BST where height differences between left and right subtrees never exceed 1. Imbalance triggers single or double rotations.',
    complexity: {
      bestTime: 'Ω(log n)',
      averageTime: 'Θ(log n)',
      worstTime: 'O(log n)',
      space: 'O(n)',
    },
    defaultInput: '30, 20, 10, 25, 40, 50',
    presets: [
      { label: 'Skewed AVL Trigger', values: '10, 20, 30, 40, 50, 60' },
      { label: 'Double Rotation Trigger', values: '30, 10, 20, 40, 35' },
    ],
  },
  mWay: {
    id: 'mWay',
    name: 'M-Way Search Tree (M=3)',
    module: 'trees',
    category: 'Multi-Way Search',
    shortDescription: 'Multi-compartment horizontal blocks [ *P0 | K1 | *P1 | K2 | *P2 ] with M-1 keys.',
    description: 'Generalization of BST where each internal node holds up to M-1 sorted keys and routes to M subtrees.',
    complexity: {
      bestTime: 'Ω(log_M n)',
      averageTime: 'Θ(log_M n)',
      worstTime: 'O(n)',
      space: 'O(n)',
    },
    defaultInput: '25, 50, 15, 35, 70, 85',
    presets: [
      { label: 'Order M=3 Tree', values: '25, 50, 15, 35, 70, 85' },
    ],
  },
  bTree: {
    id: 'bTree',
    name: 'B-Tree (Order M=3/4)',
    module: 'trees',
    category: 'Balanced Multi-Way',
    shortDescription: 'Self-balancing multi-way tree with node split, key promotion, and underflow recovery.',
    description: 'All leaf nodes reside at equal depth. When a node overflows M keys, the median key promotes to parent and nodes split cleanly.',
    complexity: {
      bestTime: 'Ω(log n)',
      averageTime: 'Θ(log n)',
      worstTime: 'O(log n)',
      space: 'O(n)',
    },
    defaultInput: '10, 20, 30, 40, 50, 60, 70',
    presets: [
      { label: 'B-Tree Split Trigger', values: '10, 20, 30, 40, 50, 60, 70' },
    ],
  },
  bPlusTree: {
    id: 'bPlusTree',
    name: 'B+ Tree (Database Index)',
    module: 'trees',
    category: 'Database File Index',
    shortDescription: 'Internal router nodes + linked leaf data nodes with sequential range scan pointers.',
    description: 'All records sit in leaf nodes linked horizontally with emerald pointers. Middle keys are copied up to index routing nodes during splits.',
    complexity: {
      bestTime: 'Ω(log_B n)',
      averageTime: 'Θ(log_B n)',
      worstTime: 'O(log_B n)',
      space: 'O(n)',
    },
    defaultInput: '5, 15, 25, 35, 45, 55, 65',
    presets: [
      { label: 'Database Index', values: '5, 15, 25, 35, 45, 55, 65' },
    ],
  },

  // ================= 05 GRAPHS =================
  dijkstraGrid: {
    id: 'dijkstraGrid',
    name: 'Dijkstra Grid Pathfinding',
    module: 'graphs',
    category: 'Shortest Path / Priority Queue',
    shortDescription: 'Guaranteed shortest path exploring uniform cost wavefront on 2D grid.',
    description: 'Greedy algorithm exploring radial ripples from Start to Target on 2D grid with obstacle walls and weighted nodes.',
    complexity: {
      bestTime: 'Ω(V log V + E)',
      averageTime: 'Θ(V log V + E)',
      worstTime: 'O(V²)',
      space: 'O(V)',
    },
    defaultInput: 'grid-16x36',
    presets: [
      { label: 'Standard Arena', values: 'open' },
      { label: 'Weighted Labyrinth', values: 'labyrinth' },
    ],
  },
  aStarGrid: {
    id: 'aStarGrid',
    name: 'A* Heuristic Search',
    module: 'graphs',
    category: 'Informed Pathfinding',
    shortDescription: 'Directed exploration using f(n) = g(n) + h(n) Manhattan distance.',
    description: 'Uses an admissible Manhattan heuristic to bias wavefront expansion directly toward the target node.',
    complexity: {
      bestTime: 'Ω(d)',
      averageTime: 'Θ(E)',
      worstTime: 'O(b^d)',
      space: 'O(V)',
    },
    defaultInput: 'grid-16x36',
    presets: [
      { label: 'Standard Arena', values: 'open' },
    ],
  },
  bfsGrid: {
    id: 'bfsGrid',
    name: 'Breadth-First Search (BFS)',
    module: 'graphs',
    category: 'Unweighted Exploration',
    shortDescription: 'FIFO queue exploring nearest neighbours level-by-level.',
    description: 'Topological hop-distance exploration optimal for unweighted uniform grid maps.',
    complexity: {
      bestTime: 'Ω(V + E)',
      averageTime: 'Θ(V + E)',
      worstTime: 'O(V + E)',
      space: 'O(V)',
    },
    defaultInput: 'grid-16x36',
    presets: [
      { label: 'Standard Arena', values: 'open' },
    ],
  },
  networkPrim: {
    id: 'networkPrim',
    name: "Prim's Minimum Spanning Tree",
    module: 'graphs',
    category: 'Greedy Spanning Tree',
    shortDescription: 'Grows a minimum spanning tree by selecting lowest-weight connecting edges.',
    description: 'Greedily incorporates the minimum-weight incident edge connecting an unvisited vertex until all vertices are spanned.',
    complexity: {
      bestTime: 'Ω(E log V)',
      averageTime: 'Θ(E log V)',
      worstTime: 'O(V²)',
      space: 'O(V + E)',
    },
    defaultInput: 'network-default',
    presets: [
      { label: '7-Vertex Network', values: 'network-default' },
    ],
  },
};

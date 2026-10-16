import { Transition } from 'framer-motion';

export const SPRING_SWAP: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

export const SPRING_POINTER: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 32,
  mass: 0.6,
};

export const SPRING_TREE: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 24,
  mass: 1.1,
};

export const EASE_UI: Transition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
};


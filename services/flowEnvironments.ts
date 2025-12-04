import type { FlowEnvironment } from '../types';

export const FLOW_ENVIRONMENTS: FlowEnvironment[] = [
  {
    id: 'night-studio',
    name: 'Night Studio',
    description: 'Dim, cool, minimal grid for deep focus.',
    backgroundClass:
      'bg-gradient-to-b from-[#050816] via-[#020617] to-[#020617]',
    gridClass:
      'bg-[radial-gradient(circle_at_1px_1px,#111827_1px,transparent_0)] [background-size:32px_32px]',
    accentColorClass: 'text-emerald-300',
    dimNonFocusedPins: true,
    showToolbarLabels: false,
  },
  {
    id: 'warm-loft',
    name: 'Warm Loft',
    description: 'Softer contrast and warmer vignette for concepting.',
    backgroundClass:
      'bg-gradient-to-b from-[#020617] via-[#111827] to-[#1f2937]',
    gridClass:
      'bg-[radial-gradient(circle_at_1px_1px,#1f2937_1px,transparent_0)] [background-size:32px_32px]',
    accentColorClass: 'text-amber-300',
    dimNonFocusedPins: true,
    showToolbarLabels: false,
  },
  {
    id: 'studio-light',
    name: 'Studio Light',
    description: 'Higher contrast studio feel for organizing boards.',
    backgroundClass:
      'bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617]',
    gridClass:
      'bg-[radial-gradient(circle_at_1px_1px,#374151_1px,transparent_0)] [background-size:32px_32px]',
    accentColorClass: 'text-sky-300',
    dimNonFocusedPins: false,
    showToolbarLabels: true,
  },
];

# Architecture

This document describes the technical architecture of React Tip Magic.

## Overview

React Tip Magic follows a global singleton pattern where a single tooltip and helper instance is rendered at the root level, and individual elements opt-in via data attributes. This approach minimizes DOM nodes and enables smooth transitions between targets.

```
┌─────────────────────────────────────────────────────────────┐
│ TipMagicProvider                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ TipMagicContext                                       │  │
│  │  • Tooltip state                                      │  │
│  │  • Helper state                                       │  │
│  │  • Configuration                                      │  │
│  │  • Event handlers                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ TooltipPortal   │  │ HelperPortal    │                   │
│  │ (Single instance)│  │ (Single instance)│                  │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Children (Your App)                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │ data-tip     │  │ data-tip     │  │ data-tip-id  │ │  │
│  │  │ elements     │  │ elements     │  │ elements     │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Global Event Delegation

Instead of attaching event listeners to each element with `data-tip`, we use event delegation at the document level:

```typescript
// Pseudo-code for event delegation
document.addEventListener('mouseover', (e) => {
  const target = e.target.closest('[data-tip]');
  if (target) {
    showTooltip(target);
  }
});

document.addEventListener('mouseout', (e) => {
  const target = e.target.closest('[data-tip]');
  if (target && !isMovingToRelatedElement(e)) {
    hideTooltip();
  }
});
```

**Benefits:**

- No need to wrap elements or use special components
- Works with dynamically added elements
- Single event listener regardless of tooltip count
- Minimal memory footprint

### 2. Tooltip Positioning

We use [Floating UI](https://floating-ui.com/) for positioning, which handles:

- Automatic placement (flip when near edges)
- Overflow detection and shifting
- Arrow positioning
- Virtual element support (for the helper)

```typescript
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

async function updatePosition(reference: Element, tooltip: HTMLElement) {
  const { x, y, placement, middlewareData } = await computePosition(reference, tooltip, {
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowElement })],
  });
  // Apply position...
}
```

### 3. Smooth Transitions

When moving between tooltip targets, we animate the tooltip instead of hiding/showing:

```
[Element A] ────hover────> [Element B]
     │                          │
     ▼                          ▼
┌─────────┐              ┌─────────┐
│ Tooltip │ ──animate──> │ Tooltip │
│ @ A pos │              │ @ B pos │
└─────────┘              └─────────┘
```

**Implementation Strategy:**

1. On mouseenter new target, don't hide tooltip
2. Calculate new position
3. Animate tooltip position and content
4. Update internal state

```typescript
interface TooltipState {
  visible: boolean;
  content: string;
  target: Element | null;
  position: { x: number; y: number };
  isTransitioning: boolean;
}
```

### 4. Helper System

The Helper is a floating element that can:

- Attach to specific elements via `data-tip-id`
- Display different states (thinking, working, idle, etc.)
- Show actions that users can interact with
- Run automated flows (onboarding, tutorials)

```typescript
interface HelperState {
  visible: boolean;
  state: 'idle' | 'thinking' | 'working' | 'informative' | 'cta' | 'error';
  message?: string;
  actions?: HelperAction[];
  targetId?: string;
  position: HelperPosition;
}

interface HelperAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

type HelperPosition =
  | 'auto' // Automatically position in viewport
  | 'near-target' // Position near current tooltip target
  | 'bottom-right' // Fixed corner positions
  | 'bottom-left'
  | 'top-right'
  | 'top-left';
```

### 5. Hover Zone Management

Critical for UX: when the helper shows actions, moving the mouse to those actions should NOT dismiss the tooltip.

```
     ┌─────────────────┐
     │    Tooltip      │
     └────────┬────────┘
              │ hover zone
     ┌────────┴────────┐
     │    Element      │
     └────────┬────────┘
              │ hover zone (extended)
     ┌────────┴────────┐
     │     Helper      │
     │  ┌──────────┐   │
     │  │ Actions  │   │
     │  └──────────┘   │
     └─────────────────┘
```

**Implementation:**

- Create virtual hover zones between elements
- Use `pointer-events` carefully
- Track mouse position to determine intent
- Delay hide with debounce/timeout

## Component Structure

```
src/
├── components/
│   ├── TipMagicProvider.tsx    # Root provider with context
│   ├── Tooltip/
│   │   ├── Tooltip.tsx         # Main tooltip component
│   │   ├── TooltipContent.tsx  # Content renderer
│   │   ├── TooltipArrow.tsx    # Arrow element
│   │   └── index.ts
│   └── Helper/
│       ├── Helper.tsx          # Main helper component
│       ├── HelperStates.tsx    # State-specific renders
│       ├── HelperActions.tsx   # Action buttons
│       └── index.ts
├── hooks/
│   ├── useTipMagic.ts          # Main public hook
│   ├── useTooltip.ts           # Tooltip-specific logic
│   ├── useHelper.ts            # Helper-specific logic
│   ├── usePosition.ts          # Floating UI wrapper
│   ├── useHoverZone.ts         # Hover zone management
│   └── useEventDelegation.ts   # Global event handling
├── context/
│   └── TipMagicContext.tsx     # React context definition
├── utils/
│   ├── parseDataAttributes.ts  # Parse data-tip-* attributes
│   ├── animation.ts            # Animation utilities
│   ├── position.ts             # Position calculations
│   └── dom.ts                  # DOM utilities
├── types/
│   └── index.ts                # TypeScript definitions
├── constants/
│   └── index.ts                # Default values, timing, etc.
└── styles/
    ├── tooltip.css             # Tooltip styles
    ├── helper.css              # Helper styles
    ├── animations.css          # Animation keyframes
    └── index.css               # Main entry point
```

## State Management

We use React Context with useReducer for predictable state updates:

```typescript
type TipMagicAction =
  | { type: 'SHOW_TOOLTIP'; payload: { target: Element; content: string } }
  | { type: 'HIDE_TOOLTIP' }
  | { type: 'MOVE_TOOLTIP'; payload: { target: Element; content: string } }
  | { type: 'SHOW_HELPER'; payload: Partial<HelperState> }
  | { type: 'HIDE_HELPER' }
  | { type: 'SET_HELPER_STATE'; payload: HelperState['state'] }
  | { type: 'START_FLOW'; payload: FlowStep[] }
  | { type: 'NEXT_FLOW_STEP' }
  | { type: 'END_FLOW' };

function tipMagicReducer(state: TipMagicState, action: TipMagicAction): TipMagicState {
  switch (
    action.type
    // ... handle actions
  ) {
  }
}
```

## Performance Considerations

### 1. Minimal Re-renders

- Tooltip/Helper components are portaled and don't affect app tree
- Context is split to prevent unnecessary updates
- Use `useMemo` and `useCallback` appropriately

### 2. CSS-based Animations

- Prefer CSS transitions over JS animations
- Use `transform` and `opacity` for smooth 60fps animations
- Avoid layout thrashing

### 3. Event Handling

- Throttle/debounce mouse events
- Use passive event listeners where possible
- Clean up listeners on unmount

### 4. Bundle Size

- Tree-shakeable exports
- Lazy load helper if not used
- Minimal dependencies

## Accessibility

### Keyboard Navigation

- Tooltips show on focus (not just hover)
- Helper actions are keyboard navigable
- Escape key dismisses tooltip/helper

### Screen Readers

- Tooltip content linked via `aria-describedby`
- Live regions for helper state changes
- Proper role attributes

### Reduced Motion

- Respect `prefers-reduced-motion`
- Provide instant show/hide option

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- No IE11 support

## Dependencies

| Package              | Purpose            | Size  |
| -------------------- | ------------------ | ----- |
| `@floating-ui/react` | Positioning engine | ~10kb |
| `react` (peer)       | UI library         | -     |
| `react-dom` (peer)   | DOM rendering      | -     |

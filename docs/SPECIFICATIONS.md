# Technical Specifications

This document provides detailed technical specifications for implementing React Tip Magic. It serves as a reference for developers working on the library.

---

## 1. Tooltip System Specifications

### 1.1 Event Delegation

The tooltip system uses a single event listener at the document level to handle all tooltip interactions.

#### Event Flow

```
User hovers element
        │
        ▼
Document 'mouseover' listener
        │
        ▼
Find closest [data-tip] element
        │
        ├── Found: Schedule tooltip show
        │           │
        │           ▼
        │     Wait for showDelay
        │           │
        │           ▼
        │     Show tooltip at target
        │
        └── Not found: Check if leaving tooltip zone
                       │
                       ▼
                  Schedule tooltip hide
```

#### Implementation Details

```typescript
interface EventDelegationConfig {
  showDelay: number; // ms before showing tooltip
  hideDelay: number; // ms before hiding tooltip
  selector: string; // default: '[data-tip]'
}

function setupEventDelegation(config: EventDelegationConfig) {
  let showTimeout: number | null = null;
  let hideTimeout: number | null = null;
  let currentTarget: Element | null = null;

  function handleMouseOver(event: MouseEvent) {
    const target = (event.target as Element).closest(config.selector);

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    if (target && target !== currentTarget) {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }

      showTimeout = window.setTimeout(() => {
        currentTarget = target;
        showTooltip(target);
      }, config.showDelay);
    }
  }

  function handleMouseOut(event: MouseEvent) {
    const target = (event.target as Element).closest(config.selector);
    const relatedTarget = event.relatedTarget as Element | null;

    // Don't hide if moving to tooltip or helper
    if (isTooltipOrHelper(relatedTarget)) {
      return;
    }

    // Don't hide if moving to another tooltip target
    if (relatedTarget?.closest(config.selector)) {
      return;
    }

    hideTimeout = window.setTimeout(() => {
      hideTooltip();
      currentTarget = null;
    }, config.hideDelay);
  }

  document.addEventListener('mouseover', handleMouseOver, { passive: true });
  document.addEventListener('mouseout', handleMouseOut, { passive: true });
}
```

### 1.2 Data Attribute Parsing

#### Attribute Schema

| Attribute              | Type      | Default        | Description                        |
| ---------------------- | --------- | -------------- | ---------------------------------- |
| `data-tip`             | string    | required       | Tooltip content                    |
| `data-tip-id`          | string    | auto-generated | Unique identifier                  |
| `data-tip-placement`   | Placement | 'top'          | Position relative to target        |
| `data-tip-delay`       | number    | 200            | Show delay in ms                   |
| `data-tip-disabled`    | boolean   | false          | Disable tooltip                    |
| `data-tip-ellipsis`    | boolean   | false          | Enable text truncation             |
| `data-tip-max-lines`   | number    | 1              | Max lines before truncation        |
| `data-tip-word-wrap`   | boolean   | false          | Enable word wrapping               |
| `data-tip-max-width`   | number    | 300            | Max width in pixels                |
| `data-tip-html`        | boolean   | false          | Parse content as HTML              |
| `data-tip-interactive` | boolean   | false          | Keep visible when hovering tooltip |

#### Parser Implementation

```typescript
interface ParsedTooltipData {
  content: string;
  id?: string;
  placement: Placement;
  delay: number;
  disabled: boolean;
  ellipsis: boolean;
  maxLines: number;
  wordWrap: boolean;
  maxWidth: number;
  html: boolean;
  interactive: boolean;
}

function parseDataAttributes(element: Element): ParsedTooltipData {
  const dataset = (element as HTMLElement).dataset;

  return {
    content: dataset.tip ?? '',
    id: dataset.tipId,
    placement: (dataset.tipPlacement as Placement) ?? 'top',
    delay: dataset.tipDelay ? parseInt(dataset.tipDelay, 10) : 200,
    disabled: dataset.tipDisabled !== undefined,
    ellipsis: dataset.tipEllipsis !== undefined,
    maxLines: dataset.tipMaxLines ? parseInt(dataset.tipMaxLines, 10) : 1,
    wordWrap: dataset.tipWordWrap !== undefined,
    maxWidth: dataset.tipMaxWidth ? parseInt(dataset.tipMaxWidth, 10) : 300,
    html: dataset.tipHtml !== undefined,
    interactive: dataset.tipInteractive !== undefined,
  };
}
```

### 1.3 Content Parsing

The tooltip content supports a special format for keyboard shortcuts:

```
"Main text; keyboard shortcut"
```

#### Implementation

```typescript
interface ParsedContent {
  main: string;
  shortcut?: string;
}

function parseContent(content: string, separator = ';'): ParsedContent {
  const parts = content.split(separator).map((s) => s.trim());

  if (parts.length >= 2) {
    return {
      main: parts[0],
      shortcut: parts.slice(1).join(separator), // Allow multiple semicolons
    };
  }

  return { main: content };
}

// Examples:
// "Copy; ⌘+C" → { main: "Copy", shortcut: "⌘+C" }
// "Save file; Ctrl+S" → { main: "Save file", shortcut: "Ctrl+S" }
// "No shortcut here" → { main: "No shortcut here" }
```

### 1.4 Position Calculation

Using Floating UI for positioning:

```typescript
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  type Placement,
} from '@floating-ui/dom';

interface PositionConfig {
  placement: Placement;
  offset: number;
  padding: number;
  arrowElement?: HTMLElement;
}

async function calculatePosition(
  reference: Element,
  floating: HTMLElement,
  config: PositionConfig
) {
  const middleware = [
    offset(config.offset),
    flip({
      fallbackAxisSideDirection: 'start',
      padding: config.padding,
    }),
    shift({
      padding: config.padding,
    }),
  ];

  if (config.arrowElement) {
    middleware.push(arrow({ element: config.arrowElement }));
  }

  const { x, y, placement, middlewareData } = await computePosition(reference, floating, {
    placement: config.placement,
    middleware,
  });

  return {
    x,
    y,
    placement,
    arrowX: middlewareData.arrow?.x,
    arrowY: middlewareData.arrow?.y,
  };
}
```

### 1.5 Smooth Transitions

When moving between tooltip targets, we animate the position and content:

```typescript
interface TransitionState {
  isTransitioning: boolean;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  fromContent: string;
  toContent: string;
}

function transitionToNewTarget(newTarget: Element, newContent: string, tooltip: HTMLElement) {
  const currentPosition = getCurrentPosition(tooltip);
  const newPosition = await calculatePosition(newTarget, tooltip, config);

  // Apply CSS transition
  tooltip.style.transition = `transform ${ANIMATION_DURATION}ms ease-out`;
  tooltip.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px)`;

  // Animate content if different
  if (currentContent !== newContent) {
    animateContentChange(tooltip, newContent);
  }
}

function animateContentChange(tooltip: HTMLElement, newContent: string) {
  const contentEl = tooltip.querySelector('.tip-magic-content');

  // Fade out old content
  contentEl.style.opacity = '0';

  setTimeout(() => {
    contentEl.innerHTML = renderContent(newContent);
    contentEl.style.opacity = '1';
  }, ANIMATION_DURATION / 2);
}
```

---

## 2. Helper System Specifications

### 2.1 State Machine

The Helper uses a state machine for managing its states:

```typescript
type HelperState =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'informative'
  | 'cta'
  | 'success'
  | 'error'
  | 'warning';

interface HelperConfig {
  state: HelperState;
  message?: string;
  actions?: HelperAction[];
  targetId?: string;
  position: HelperPosition;
  autoHide?: number;
}

// State transitions
const VALID_TRANSITIONS: Record<HelperState, HelperState[]> = {
  idle: ['thinking', 'working', 'informative', 'cta'],
  thinking: ['working', 'informative', 'error', 'idle'],
  working: ['success', 'error', 'informative', 'idle'],
  informative: ['cta', 'idle', 'thinking'],
  cta: ['working', 'success', 'idle'],
  success: ['idle', 'informative'],
  error: ['idle', 'informative', 'cta'],
  warning: ['idle', 'informative', 'cta'],
};
```

### 2.2 Visual States

Each state has distinct visual characteristics:

| State       | Icon    | Color  | Animation     |
| ----------- | ------- | ------ | ------------- |
| idle        | Dot     | Gray   | Subtle pulse  |
| thinking    | Dots    | Purple | Bouncing dots |
| working     | Spinner | Amber  | Rotation      |
| informative | Info    | Blue   | None          |
| cta         | Sparkle | Purple | Gentle glow   |
| success     | Check   | Green  | Pop-in        |
| error       | X       | Red    | Shake         |
| warning     | Alert   | Orange | None          |

### 2.3 Helper Positioning

```typescript
type HelperPosition =
  | 'auto'
  | 'near-target'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';

interface ViewportBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function calculateHelperPosition(
  position: HelperPosition,
  targetElement?: Element,
  viewport: ViewportBounds = getViewportBounds()
): { x: number; y: number } {
  const PADDING = 16;
  const HELPER_SIZE = { width: 280, height: 120 };

  switch (position) {
    case 'bottom-right':
      return {
        x: viewport.right - HELPER_SIZE.width - PADDING,
        y: viewport.bottom - HELPER_SIZE.height - PADDING,
      };

    case 'near-target':
      if (!targetElement) {
        return calculateHelperPosition('auto', undefined, viewport);
      }
      return positionNearElement(targetElement, HELPER_SIZE, viewport);

    case 'auto':
      // Find best position avoiding tooltip and target
      return findOptimalPosition(HELPER_SIZE, viewport);

    // ... other positions
  }
}
```

### 2.4 Hover Zone Management

Critical for keeping tooltip visible when interacting with helper:

```typescript
interface HoverZone {
  elements: Element[];
  isActive: boolean;
}

function createHoverZone(tooltip: HTMLElement, helper: HTMLElement, target: Element): HoverZone {
  const zone: HoverZone = {
    elements: [tooltip, helper, target],
    isActive: true,
  };

  function isInsideZone(event: MouseEvent): boolean {
    const point = { x: event.clientX, y: event.clientY };

    // Check if point is inside any element
    for (const el of zone.elements) {
      const rect = el.getBoundingClientRect();
      if (isPointInRect(point, rect)) {
        return true;
      }
    }

    // Check if point is in connection path between elements
    return isInConnectionPath(point, zone.elements);
  }

  return zone;
}

function isInConnectionPath(point: { x: number; y: number }, elements: Element[]): boolean {
  // Create virtual paths between elements
  // Return true if point falls within threshold of any path
  const THRESHOLD = 50; // pixels

  for (let i = 0; i < elements.length - 1; i++) {
    const from = getCenterPoint(elements[i]);
    const to = getCenterPoint(elements[i + 1]);

    if (distanceToLine(point, from, to) < THRESHOLD) {
      return true;
    }
  }

  return false;
}
```

---

## 3. Flow System Specifications

### 3.1 Flow Definition

```typescript
interface FlowStep {
  id: string; // Unique step identifier
  targetId: string; // Element's data-tip-id
  title?: string; // Optional step title
  message: string; // Main message content
  actions: FlowAction[]; // Action buttons
  state?: HelperState; // Helper state for this step
  delay?: number; // Delay before showing (ms)
  highlight?: boolean; // Highlight target element
  scrollIntoView?: boolean; // Scroll target into view
  onEnter?: () => void; // Callback when step shown
  onExit?: () => void; // Callback when leaving step
  condition?: () => boolean; // Conditional display
}

interface FlowAction {
  label: string;
  action: 'next' | 'prev' | 'complete' | 'skip' | 'custom';
  onClick?: () => void; // Required for 'custom' action
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface FlowConfig {
  steps: FlowStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  persist?: boolean; // Persist progress to localStorage
  persistKey?: string; // localStorage key
}
```

### 3.2 Flow Controller

```typescript
class FlowController {
  private steps: FlowStep[];
  private currentIndex: number = -1;
  private config: FlowConfig;

  constructor(config: FlowConfig) {
    this.config = config;
    this.steps = config.steps;
  }

  start(): void {
    this.currentIndex = 0;
    this.showCurrentStep();
  }

  next(): void {
    if (this.currentIndex < this.steps.length - 1) {
      this.leaveCurrentStep();
      this.currentIndex++;
      this.showCurrentStep();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.leaveCurrentStep();
      this.currentIndex--;
      this.showCurrentStep();
    }
  }

  skip(): void {
    this.leaveCurrentStep();
    this.config.onSkip?.();
    this.cleanup();
  }

  complete(): void {
    this.leaveCurrentStep();
    this.config.onComplete?.();
    this.cleanup();
  }

  private showCurrentStep(): void {
    const step = this.steps[this.currentIndex];

    // Check condition
    if (step.condition && !step.condition()) {
      this.next(); // Skip this step
      return;
    }

    // Apply delay
    setTimeout(() => {
      step.onEnter?.();

      // Scroll into view if needed
      if (step.scrollIntoView) {
        this.scrollToTarget(step.targetId);
      }

      // Show helper at target
      helper.show({
        targetId: step.targetId,
        title: step.title,
        message: step.message,
        actions: this.mapActions(step.actions),
        state: step.state ?? 'informative',
      });

      // Apply highlight
      if (step.highlight) {
        this.highlightTarget(step.targetId);
      }
    }, step.delay ?? 0);
  }

  private leaveCurrentStep(): void {
    const step = this.steps[this.currentIndex];
    step.onExit?.();
    this.removeHighlight();
  }

  private mapActions(actions: FlowAction[]): HelperAction[] {
    return actions.map((action) => ({
      label: action.label,
      variant: action.variant,
      onClick: () => {
        switch (action.action) {
          case 'next':
            this.next();
            break;
          case 'prev':
            this.prev();
            break;
          case 'complete':
            this.complete();
            break;
          case 'skip':
            this.skip();
            break;
          case 'custom':
            action.onClick?.();
            break;
        }
      },
    }));
  }
}
```

### 3.3 Target Highlighting

```typescript
interface HighlightOptions {
  overlay?: boolean; // Show semi-transparent overlay
  padding?: number; // Padding around highlighted element
  borderRadius?: number; // Border radius of highlight
  animation?: boolean; // Animate the highlight
}

function highlightElement(element: Element, options: HighlightOptions = {}): () => void {
  const { overlay = true, padding = 8, borderRadius = 4, animation = true } = options;

  const rect = element.getBoundingClientRect();

  // Create highlight elements
  const highlightEl = document.createElement('div');
  highlightEl.className = 'tip-magic-highlight';
  highlightEl.style.cssText = `
    position: fixed;
    top: ${rect.top - padding}px;
    left: ${rect.left - padding}px;
    width: ${rect.width + padding * 2}px;
    height: ${rect.height + padding * 2}px;
    border-radius: ${borderRadius}px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    z-index: 9998;
  `;

  if (animation) {
    highlightEl.style.animation = 'tip-magic-pulse 2s ease-in-out infinite';
  }

  document.body.appendChild(highlightEl);

  // Return cleanup function
  return () => {
    highlightEl.remove();
  };
}
```

---

## 4. Animation Specifications

### 4.1 CSS Animations

```css
/* Tooltip show/hide */
@keyframes tip-magic-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tip-magic-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Helper states */
@keyframes tip-magic-thinking {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@keyframes tip-magic-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

@keyframes tip-magic-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

@keyframes tip-magic-pop {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tip-magic-tooltip,
  .tip-magic-helper {
    animation: none;
    transition: opacity 0.1s ease;
  }
}
```

### 4.2 Animation Timing

| Animation       | Duration | Easing                       | Use Case               |
| --------------- | -------- | ---------------------------- | ---------------------- |
| Tooltip show    | 150ms    | ease-out                     | Initial appearance     |
| Tooltip hide    | 100ms    | ease-in                      | Dismissal              |
| Position move   | 200ms    | ease-out                     | Moving between targets |
| Content change  | 150ms    | ease                         | Updating content       |
| Helper state    | 300ms    | cubic-bezier(0.4, 0, 0.2, 1) | State transitions      |
| Highlight pulse | 2000ms   | ease-in-out                  | Continuous attention   |

---

## 5. Accessibility Specifications

### 5.1 ARIA Attributes

```html
<!-- Tooltip target -->
<button data-tip="Save changes" aria-describedby="tooltip-123">Save</button>

<!-- Tooltip -->
<div id="tooltip-123" role="tooltip" aria-hidden="false">Save changes</div>

<!-- Helper -->
<div role="dialog" aria-label="Assistant" aria-describedby="helper-message" aria-live="polite">
  <p id="helper-message">Welcome to the dashboard!</p>
  <div role="group" aria-label="Actions">
    <button>Next</button>
  </div>
</div>
```

### 5.2 Keyboard Navigation

| Key         | Action                                   |
| ----------- | ---------------------------------------- |
| Tab         | Move focus to next focusable element     |
| Shift+Tab   | Move focus to previous focusable element |
| Escape      | Close tooltip/helper                     |
| Enter/Space | Activate focused action                  |
| Arrow keys  | Navigate between actions in helper       |

### 5.3 Focus Management

```typescript
function manageFocus(helper: HTMLElement, previousFocus: Element | null) {
  // Store current focus
  const previouslyFocused = document.activeElement;

  // Move focus to helper
  const firstFocusable = helper.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();

  // Trap focus within helper
  helper.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      trapFocus(e, helper);
    }
  });

  // Return focus on close
  return () => {
    (previouslyFocused as HTMLElement)?.focus();
  };
}
```

---

## 6. Performance Specifications

### 6.1 Bundle Size Budget

| Module              | Target Size (minified + gzip) |
| ------------------- | ----------------------------- |
| Core (tooltip only) | < 5 KB                        |
| With helper         | < 10 KB                       |
| Full library        | < 15 KB                       |
| CSS                 | < 3 KB                        |

### 6.2 Runtime Performance

| Metric                    | Target           |
| ------------------------- | ---------------- |
| Time to first tooltip     | < 50ms           |
| Tooltip show latency      | < 16ms (1 frame) |
| Position calculation      | < 5ms            |
| Animation frame rate      | 60fps            |
| Memory per tooltip target | < 100 bytes      |

### 6.3 Optimization Strategies

```typescript
// 1. Debounce rapid hover events
const debouncedShow = debounce(showTooltip, 50);

// 2. Use RAF for position updates
function updatePosition() {
  requestAnimationFrame(() => {
    const position = calculatePosition();
    applyPosition(position);
  });
}

// 3. Lazy load helper
const Helper = lazy(() => import('./Helper'));

// 4. Use CSS containment
.tip-magic-tooltip {
  contain: layout style paint;
}

// 5. Avoid layout thrashing
function batchDOMReads() {
  const rect = element.getBoundingClientRect();
  const scroll = window.scrollY;
  // All reads done, now write
  applyStyles({ rect, scroll });
}
```

---

## 7. Browser Compatibility

### 7.1 Required Features

| Feature               | Fallback                    |
| --------------------- | --------------------------- |
| CSS Custom Properties | Static values               |
| ResizeObserver        | Polling (optional)          |
| IntersectionObserver  | Scroll listener             |
| CSS Containment       | None (graceful degradation) |
| Pointer Events        | Mouse events                |

### 7.2 Polyfills

No polyfills are bundled. Users requiring older browser support should include their own polyfills for:

- `ResizeObserver`
- `IntersectionObserver`
- `Element.closest()`

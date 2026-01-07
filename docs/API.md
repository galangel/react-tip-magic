# API Reference

Complete API documentation for React Tip Magic.

## Table of Contents

- [Components](#components)
  - [TipMagicProvider](#tipmagicprovider)
- [Hooks](#hooks)
  - [useTipMagic](#usetipmagic)
- [Data Attributes](#data-attributes)
- [Types](#types)

---

## Components

### TipMagicProvider

The root provider component that enables tooltip functionality throughout your app.

```tsx
import { TipMagicProvider } from 'react-tip-magic';

function App() {
  return (
    <TipMagicProvider options={options}>
      <YourApp />
    </TipMagicProvider>
  );
}
```

#### Props

| Prop       | Type              | Default  | Description           |
| ---------- | ----------------- | -------- | --------------------- |
| `children` | `ReactNode`       | required | Your application      |
| `options`  | `TipMagicOptions` | `{}`     | Configuration options |

#### TipMagicOptions

```typescript
interface TipMagicOptions {
  /** Delay before showing tooltip (ms) */
  showDelay?: number; // default: 200

  /** Delay before hiding tooltip (ms) */
  hideDelay?: number; // default: 100

  /** Duration of tooltip animation (ms) */
  animationDuration?: number; // default: 150

  /** Default tooltip placement */
  placement?: Placement; // default: 'top'

  /** Offset from target element (px) */
  offset?: number; // default: 8

  /** Enable/disable helper system */
  enableHelper?: boolean; // default: true

  /** Default helper position */
  helperPosition?: HelperPosition; // default: 'auto'

  /** Custom theme */
  theme?: 'light' | 'dark' | 'auto'; // default: 'auto'

  /** Z-index for tooltip layer */
  zIndex?: number; // default: 9999

  /** Disable all tooltips globally */
  disabled?: boolean; // default: false

  /** Portal container element */
  portalContainer?: HTMLElement; // default: document.body

  /** Separator for tooltip content parsing (e.g., "Copy; ⌘+C") */
  contentSeparator?: string; // default: ';'

  /** Enable keyboard shortcut styling */
  enableShortcutStyle?: boolean; // default: true

  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean; // default: true
}
```

---

## Hooks

### useTipMagic

The main hook for programmatic control of tooltips and helper.

```tsx
import { useTipMagic } from 'react-tip-magic';

function MyComponent() {
  const { tooltip, helper, config } = useTipMagic();

  // Use tooltip and helper APIs...
}
```

#### Return Value

```typescript
interface UseTipMagicReturn {
  tooltip: TooltipAPI;
  helper: HelperAPI;
  config: TipMagicConfig;
}
```

### TooltipAPI

```typescript
interface TooltipAPI {
  /** Show tooltip for a specific element */
  show: (target: Element | string, content?: string) => void;

  /** Hide the current tooltip */
  hide: () => void;

  /** Check if tooltip is visible */
  isVisible: boolean;

  /** Current tooltip content */
  content: string | null;

  /** Current target element */
  target: Element | null;

  /** Update tooltip content dynamically */
  updateContent: (content: string) => void;
}
```

#### tooltip.show()

```tsx
const { tooltip } = useTipMagic();

// Show tooltip on element with data-tip-id
tooltip.show('my-element-id');

// Show tooltip on element with custom content
tooltip.show('my-element-id', 'Custom tooltip content');

// Show tooltip on DOM element directly
tooltip.show(document.querySelector('.my-button'));
```

### HelperAPI

```typescript
interface HelperAPI {
  /** Show the helper with options */
  show: (options: HelperShowOptions) => void;

  /** Hide the helper */
  hide: () => void;

  /** Set helper state */
  setState: (state: HelperStateType) => void;

  /** Move helper to a target */
  moveTo: (targetId: string) => void;

  /** Start an automated flow */
  startFlow: (steps: FlowStep[]) => void;

  /** Move to next flow step */
  nextStep: () => void;

  /** End current flow */
  endFlow: () => void;

  /** Current flow step index */
  currentStep: number;

  /** Check if helper is visible */
  isVisible: boolean;

  /** Current helper state */
  state: HelperStateType;
}
```

#### HelperShowOptions

```typescript
interface HelperShowOptions {
  /** The state to display */
  state?: HelperStateType;

  /** Message to show */
  message?: string;

  /** Actions to display */
  actions?: HelperAction[];

  /** Target element ID to attach to */
  targetId?: string;

  /** Position override */
  position?: HelperPosition;

  /** Auto-hide after duration (ms) */
  autoHide?: number;
}
```

#### HelperAction

```typescript
interface HelperAction {
  /** Button label */
  label: string;

  /** Click handler */
  onClick: () => void;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';

  /** Icon (component or string) */
  icon?: ReactNode;

  /** Disable the action */
  disabled?: boolean;
}
```

#### FlowStep

```typescript
interface FlowStep {
  /** Target element ID */
  targetId: string;

  /** Message to display */
  message: string;

  /** Optional title */
  title?: string;

  /** Actions for this step */
  actions?: FlowStepAction[];

  /** Helper state for this step */
  state?: HelperStateType;

  /** Delay before showing this step (ms) */
  delay?: number;

  /** Callback when step is shown */
  onEnter?: () => void;

  /** Callback when leaving step */
  onExit?: () => void;
}

interface FlowStepAction {
  /** Button label */
  label: string;

  /** Action type */
  action: 'next' | 'prev' | 'complete' | 'skip' | 'custom';

  /** Custom handler (for action: 'custom') */
  onClick?: () => void;

  /** Button variant */
  variant?: 'primary' | 'secondary';
}
```

#### Helper Examples

```tsx
const { helper } = useTipMagic();

// Simple informative message
helper.show({
  state: 'informative',
  message: 'Did you know you can drag and drop items?',
});

// Thinking state (e.g., while AI is processing)
helper.setState('thinking');

// Working state with progress
helper.show({
  state: 'working',
  message: 'Saving your changes...',
});

// Call to action with buttons
helper.show({
  state: 'cta',
  message: 'Would you like to enable notifications?',
  actions: [
    { label: 'Enable', onClick: enableNotifications, variant: 'primary' },
    { label: 'Not now', onClick: () => helper.hide(), variant: 'ghost' },
  ],
});

// Attach to specific element
helper.show({
  state: 'informative',
  message: 'Click here to get started',
  targetId: 'start-button',
});

// Onboarding flow
helper.startFlow([
  {
    targetId: 'nav-home',
    title: 'Welcome!',
    message: 'This is your home dashboard.',
    actions: [{ label: 'Next', action: 'next' }],
  },
  {
    targetId: 'nav-projects',
    message: 'View all your projects here.',
    actions: [
      { label: 'Back', action: 'prev', variant: 'secondary' },
      { label: 'Next', action: 'next' },
    ],
  },
  {
    targetId: 'btn-create',
    message: 'Create your first project!',
    actions: [{ label: 'Got it!', action: 'complete' }],
  },
]);
```

---

## Data Attributes

### data-tip

The main attribute to enable tooltips on any element.

```tsx
<button data-tip="Save your changes">Save</button>
```

#### Content Formatting

Use a semicolon (`;`) to separate main text from keyboard shortcuts:

```tsx
<button data-tip="Copy; ⌘+C">Copy</button>
// Renders: "Copy" with "⌘+C" styled as a keyboard shortcut
```

### data-tip-id

Unique identifier for programmatic control.

```tsx
<button data-tip="Click to save" data-tip-id="save-button">
  Save
</button>;

// Later, programmatically:
tooltip.show('save-button');
helper.moveTo('save-button');
```

### data-tip-placement

Override default tooltip placement.

```tsx
<button data-tip="Info" data-tip-placement="bottom">
  Hover me
</button>
```

**Values:** `top`, `bottom`, `left`, `right`, `top-start`, `top-end`, `bottom-start`, `bottom-end`, `left-start`, `left-end`, `right-start`, `right-end`

### data-tip-ellipsis

Enable text truncation with ellipsis for long content.

```tsx
<span data-tip="This is a very long tooltip that will be truncated..." data-tip-ellipsis>
  Hover for details
</span>
```

### data-tip-max-lines

Maximum number of lines before truncation (requires `data-tip-ellipsis`).

```tsx
<span
  data-tip="Line 1. Line 2. Line 3. Line 4. This will be cut off."
  data-tip-ellipsis
  data-tip-max-lines="2"
>
  Hover me
</span>
```

### data-tip-word-wrap

Enable word wrapping for long content.

```tsx
<span
  data-tip="This content will wrap to multiple lines instead of extending horizontally"
  data-tip-word-wrap
>
  Hover me
</span>
```

### data-tip-max-width

Maximum width of the tooltip (in pixels).

```tsx
<span data-tip="This tooltip has a max width" data-tip-max-width="200">
  Hover me
</span>
```

### data-tip-delay

Override show delay for this specific tooltip (in milliseconds).

```tsx
<button data-tip="Instant tooltip" data-tip-delay="0">
  Hover me
</button>

<button data-tip="Slow tooltip" data-tip-delay="500">
  Wait for it...
</button>
```

### data-tip-disabled

Disable tooltip for this element.

```tsx
<button data-tip="This won't show" data-tip-disabled>
  Tooltip disabled
</button>

<button data-tip="Conditional" data-tip-disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Ready'}
</button>
```

### data-tip-html

Enable HTML content in tooltip (use with caution).

```tsx
<span data-tip="<strong>Bold</strong> and <em>italic</em>" data-tip-html>
  Rich content
</span>
```

### data-tip-interactive

Keep tooltip visible when hovering over it.

```tsx
<span data-tip="This tooltip contains a <a href='#'>link</a>" data-tip-html data-tip-interactive>
  Interactive tooltip
</span>
```

---

## Types

### HelperStateType

```typescript
type HelperStateType =
  | 'idle' // Default state, subtle presence
  | 'thinking' // Processing, animated indicator
  | 'working' // Active task, progress indication
  | 'informative' // Showing information
  | 'cta' // Call to action, prominent
  | 'success' // Task completed successfully
  | 'error' // Error occurred
  | 'warning'; // Warning message
```

### HelperPosition

```typescript
type HelperPosition =
  | 'auto' // Automatically find best position
  | 'near-target' // Near the current tooltip target
  | 'bottom-right' // Fixed at bottom-right corner
  | 'bottom-left' // Fixed at bottom-left corner
  | 'top-right' // Fixed at top-right corner
  | 'top-left' // Fixed at top-left corner
  | 'center'; // Centered in viewport
```

### Placement

```typescript
type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
```

---

## CSS Custom Properties

Customize appearance using CSS variables:

```css
:root {
  /* Tooltip */
  --tip-magic-bg: #1a1a1a;
  --tip-magic-text: #ffffff;
  --tip-magic-border-radius: 6px;
  --tip-magic-padding: 8px 12px;
  --tip-magic-font-size: 14px;
  --tip-magic-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --tip-magic-max-width: 300px;

  /* Keyboard shortcuts */
  --tip-magic-kbd-bg: rgba(255, 255, 255, 0.1);
  --tip-magic-kbd-border: rgba(255, 255, 255, 0.2);
  --tip-magic-kbd-text: rgba(255, 255, 255, 0.8);

  /* Helper */
  --tip-magic-helper-bg: #ffffff;
  --tip-magic-helper-text: #1a1a1a;
  --tip-magic-helper-border-radius: 12px;
  --tip-magic-helper-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* Helper states */
  --tip-magic-helper-thinking: #6366f1;
  --tip-magic-helper-working: #f59e0b;
  --tip-magic-helper-success: #10b981;
  --tip-magic-helper-error: #ef4444;
  --tip-magic-helper-cta: #8b5cf6;

  /* Animations */
  --tip-magic-transition-duration: 150ms;
  --tip-magic-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Events

The provider emits events you can listen to:

```tsx
<TipMagicProvider
  onTooltipShow={(target, content) => {
    console.log('Tooltip shown:', content);
  }}
  onTooltipHide={() => {
    console.log('Tooltip hidden');
  }}
  onHelperStateChange={(state) => {
    console.log('Helper state:', state);
  }}
  onFlowStart={(steps) => {
    console.log('Flow started with', steps.length, 'steps');
  }}
  onFlowComplete={() => {
    console.log('Flow completed');
  }}
  onFlowStepChange={(step, index) => {
    console.log('Flow step:', index, step.targetId);
  }}
>
  <App />
</TipMagicProvider>
```

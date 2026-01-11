# React Tip Magic ✨

A sophisticated, elegant, and performant tooltip library for React with an intelligent floating helper system.

![npm version](https://img.shields.io/npm/v/react-tip-magic)
![bundle size](https://img.shields.io/bundlephobia/minzip/react-tip-magic)
![license](https://img.shields.io/npm/l/react-tip-magic)

## Features

- 🎯 **Zero-config tooltips** - Just add `data-tip="Hello"` to any element
- 🚀 **High performance** - Single global instance, minimal re-renders
- 🎨 **Smooth transitions** - Tooltips gracefully move between elements
- 🤖 **Intelligent Helper** - Floating assistant with multiple states and actions
- 📱 **Accessible** - Full keyboard navigation and screen reader support
- 🎭 **Customizable** - Extensive theming and configuration options
- 📦 **Lightweight** - Tree-shakeable, minimal dependencies

## Quick Start

### Installation

```bash
npm install react-tip-magic
```

### Basic Setup

```tsx
import { TipMagicProvider } from 'react-tip-magic';
import 'react-tip-magic/styles.css';

function App() {
  return (
    <TipMagicProvider>
      <YourApp />
    </TipMagicProvider>
  );
}
```

### Simple Tooltip

```tsx
<button data-tip="Click to save your changes">Save</button>
```

### Tooltip with Keyboard Shortcut

```tsx
<button data-tip="Copy; ⌘+C">Copy</button>
```

### Advanced Options

```tsx
<p
  data-tip="This is a long description that will be truncated..."
  data-tip-ellipsis
  data-tip-max-lines="2"
  data-tip-word-wrap
>
  Hover me
</p>
```

### Transition Behavior

Control how tooltips transition when moving between elements:

```tsx
{/* Smooth move transition (default) */}
<button data-tip="Moves smoothly" data-tip-move>Button 1</button>
<button data-tip="Moves smoothly" data-tip-move>Button 2</button>

{/* Jump transition (fade out/in) */}
<button data-tip="Jumps" data-tip-jump>Button 3</button>
```

### Tooltip Groups

Use `data-tip-group` to control move transitions between grouped elements. Tooltips will only smoothly move between elements in the **same group**:

```tsx
{/* Group A - tooltips move smoothly within this group */}
<button data-tip="Group A" data-tip-move data-tip-group="A">A1</button>
<button data-tip="Group A" data-tip-move data-tip-group="A">A2</button>

{/* Group B - tooltips move smoothly within this group */}
<button data-tip="Group B" data-tip-move data-tip-group="B">B1</button>
<button data-tip="Group B" data-tip-move data-tip-group="B">B2</button>

{/* Moving from Group A to Group B will jump, not move */}
```

**Group transition rules:**

- **Same group** → Smooth move transition
- **Different groups** → Jump transition (tooltip appears at new position)
- **Grouped to ungrouped** (or vice versa) → Smooth move transition

## Helper System

The Helper is an optional floating element that provides contextual information and actions.

### Onboarding Flow Example

```tsx
import { useTipMagic } from 'react-tip-magic';

function OnboardingFlow() {
  const { helper } = useTipMagic();

  useEffect(() => {
    helper.startFlow([
      {
        targetId: 'welcome-1',
        message: 'Welcome! This is your dashboard.',
        actions: [{ label: 'Next', action: 'next' }],
      },
      {
        targetId: 'welcome-2',
        message: 'Click here to create your first project.',
        actions: [{ label: 'Got it!', action: 'complete' }],
      },
    ]);
  }, []);

  return (
    <div>
      <nav data-tip-id="welcome-1">Dashboard</nav>
      <button data-tip-id="welcome-2">New Project</button>
    </div>
  );
}
```

### Helper States

```tsx
// Show thinking state
helper.setState('thinking');

// Show working state with message
helper.show({
  state: 'working',
  message: 'Processing your request...',
});

// Show call to action
helper.show({
  state: 'cta',
  message: 'Ready to continue?',
  actions: [
    { label: 'Yes', onClick: () => {} },
    { label: 'No', onClick: () => {} },
  ],
});
```

## Programmatic API

Use the `useTipMagic` hook for full programmatic control:

```tsx
import { useTipMagic } from 'react-tip-magic';

function MyComponent() {
  const { tooltip, helper, config } = useTipMagic();

  // Show tooltip programmatically
  tooltip.show('#my-element', 'Custom content');

  // Hide tooltip
  tooltip.hide();

  // Update content dynamically
  tooltip.updateContent('New content');

  return <div id="my-element">Hover me</div>;
}
```

## Data Attributes

| Attribute              | Description                               | Example                       |
| ---------------------- | ----------------------------------------- | ----------------------------- |
| `data-tip`             | Tooltip content                           | `data-tip="Hello"`            |
| `data-tip-id`          | Element identifier for flows              | `data-tip-id="welcome"`       |
| `data-tip-placement`   | Position (top, bottom, left, right, etc.) | `data-tip-placement="bottom"` |
| `data-tip-delay`       | Show delay in ms                          | `data-tip-delay="500"`        |
| `data-tip-hide-delay`  | Hide delay in ms                          | `data-tip-hide-delay="100"`   |
| `data-tip-disabled`    | Disable tooltip                           | `data-tip-disabled`           |
| `data-tip-ellipsis`    | Enable text truncation                    | `data-tip-ellipsis`           |
| `data-tip-max-lines`   | Max lines before truncation               | `data-tip-max-lines="2"`      |
| `data-tip-word-wrap`   | Enable word wrapping                      | `data-tip-word-wrap`          |
| `data-tip-max-width`   | Maximum width in pixels                   | `data-tip-max-width="300"`    |
| `data-tip-html`        | Parse content as HTML                     | `data-tip-html`               |
| `data-tip-interactive` | Keep tooltip on hover                     | `data-tip-interactive`        |
| `data-tip-move`        | Smooth move transition                    | `data-tip-move`               |
| `data-tip-jump`        | Jump transition                           | `data-tip-jump`               |
| `data-tip-group`       | Group identifier for transitions          | `data-tip-group="nav"`        |
| `data-tip-no-arrow`    | Hide tooltip arrow                        | `data-tip-no-arrow`           |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Technical design and decisions
- [API Reference](./docs/API.md) - Complete API documentation
- [Roadmap](./docs/ROADMAP.md) - Planned features and milestones

## Tech Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Full type safety
- **Floating UI** - Robust positioning engine
- **Vite** - Fast development and building
- **Vitest** - Unit and integration testing
- **Storybook** - Component documentation and showcase

## License

Apache-2.0

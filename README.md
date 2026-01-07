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

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Technical design and decisions
- [API Reference](./docs/API.md) - Complete API documentation
- [Development](./docs/DEVELOPMENT.md) - Setup and contribution guide
- [Roadmap](./docs/ROADMAP.md) - Planned features and milestones

## Tech Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Full type safety
- **Floating UI** - Robust positioning engine
- **Vite** - Fast development and building
- **Vitest** - Unit and integration testing
- **Storybook** - Component documentation and showcase

## License

MIT © [Your Name]

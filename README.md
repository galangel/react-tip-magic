# React Tip Magic ✨

A thoughtfully crafted tooltip library for React—simple to use, delightful to experience.

![npm version](https://img.shields.io/npm/v/@galangel/react-tip-magic)
![bundle size](https://img.shields.io/bundlephobia/minzip/@galangel/react-tip-magic)
![license](https://img.shields.io/npm/l/@galangel/react-tip-magic)

## Why React Tip Magic?

Tooltips seem simple, but getting them right takes care. They should appear when needed, stay out of the way when not, and feel natural as users navigate your interface.

React Tip Magic handles the details so you don't have to—positioning, transitions, accessibility, keyboard support—all with a clean, declarative API.

## Quick Start

```bash
npm install @galangel/react-tip-magic
```

```tsx
import { TipMagicProvider } from '@galangel/react-tip-magic';
import '@galangel/react-tip-magic/styles.css';

function App() {
  return (
    <TipMagicProvider>
      <YourApp />
    </TipMagicProvider>
  );
}
```

That's it. Now add `data-tip` to any element:

```tsx
<button data-tip="Save your changes">Save</button>
```

---

## Tooltips

The core of React Tip Magic. One tooltip instance that gracefully moves between elements, providing a smooth, cohesive experience.

### Basic Usage

```tsx
<button data-tip="Click to save">Save</button>
<button data-tip="Undo last action">Undo</button>
```

### With Keyboard Shortcuts

Display shortcuts alongside your tooltips using the `data-tip-shortcut` attribute:

```tsx
<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
<button data-tip="Paste" data-tip-shortcut="⌘V">Paste</button>
<button data-tip="Save" data-tip-shortcut="⌘S">Save</button>
```

### Positioning & Behavior

```tsx
{
  /* Position control */
}
<button data-tip="Below the button" data-tip-placement="bottom">
  Hover me
</button>;

{
  /* Smooth transitions between grouped elements */
}
<nav>
  <a data-tip="Home" data-tip-move data-tip-group="nav">
    Home
  </a>
  <a data-tip="About" data-tip-move data-tip-group="nav">
    About
  </a>
  <a data-tip="Contact" data-tip-move data-tip-group="nav">
    Contact
  </a>
</nav>;

{
  /* Interactive tooltips that stay visible on hover */
}
<span data-tip="Click <a href='#'>here</a> to learn more" data-tip-html data-tip-interactive>
  More info
</span>;
```

---

## Guided Tours

Walk users through your interface with step-by-step tours. Helpful for onboarding, feature introductions, or contextual guidance.

```tsx
import { useTour } from '@galangel/react-tip-magic';

function App() {
  const tour = useTour({
    steps: [
      { target: 'dashboard', title: 'Welcome', message: 'This is your dashboard.' },
      { target: 'create-btn', title: 'Create', message: 'Click here to get started.' },
    ],
  });

  return (
    <div>
      <nav data-tip-id="dashboard">Dashboard</nav>
      <button data-tip-id="create-btn" onClick={tour.start}>
        New Project
      </button>
    </div>
  );
}
```

Tours include navigation controls, progress indicators, keyboard support, and backdrop highlighting—all configurable to fit your needs.

---

## Tip Advisor

A keyboard shortcut discovery menu. Press a key (F1 by default) to reveal all available shortcuts in your interface, with fuzzy search to quickly find what you need.

```tsx
import { TipAdvisor } from '@galangel/react-tip-magic';

function App() {
  return (
    <TipMagicProvider>
      <div className="toolbar">
        <button data-tip="Copy" data-tip-shortcut="⌘C">
          Copy
        </button>
        <button data-tip="Paste" data-tip-shortcut="⌘V">
          Paste
        </button>
        <button data-tip="Save" data-tip-shortcut="⌘S">
          Save
        </button>
      </div>

      {/* Press F1 to open the advisor */}
      <TipAdvisor />
    </TipMagicProvider>
  );
}
```

Features:

- Fuzzy search with highlighted matches
- Keyboard navigation (arrow keys + Enter)
- Hover to preview tooltip locations
- Click to trigger the associated element

---

## Data Attributes

| Attribute              | Description                         | Example                       |
| ---------------------- | ----------------------------------- | ----------------------------- |
| `data-tip`             | Tooltip content                     | `data-tip="Hello"`            |
| `data-tip-shortcut`    | Keyboard shortcut badge             | `data-tip-shortcut="⌘S"`      |
| `data-tip-id`          | Element identifier for tours        | `data-tip-id="welcome"`       |
| `data-tip-placement`   | Position (top, bottom, left, right) | `data-tip-placement="bottom"` |
| `data-tip-delay`       | Show delay in ms                    | `data-tip-delay="500"`        |
| `data-tip-hide-delay`  | Hide delay in ms                    | `data-tip-hide-delay="100"`   |
| `data-tip-disabled`    | Disable tooltip                     | `data-tip-disabled`           |
| `data-tip-html`        | Parse content as HTML               | `data-tip-html`               |
| `data-tip-interactive` | Keep tooltip on hover               | `data-tip-interactive`        |
| `data-tip-move`        | Smooth move transition              | `data-tip-move`               |
| `data-tip-group`       | Group for transitions               | `data-tip-group="nav"`        |
| `data-tip-no-arrow`    | Hide tooltip arrow                  | `data-tip-no-arrow`           |

---

## Programmatic API

For more control, use the `useTipMagic` hook:

```tsx
import { useTipMagic } from '@galangel/react-tip-magic';

function MyComponent() {
  const { tooltip } = useTipMagic();

  const handleClick = () => {
    tooltip.show('#my-element', 'Dynamic content');
  };

  return (
    <button id="my-element" onClick={handleClick}>
      Click me
    </button>
  );
}
```

---

## Built With

- **React 18+** with modern hooks
- **TypeScript** for type safety
- **Floating UI** for positioning
- **Storybook** for documentation

---

## License

Apache-2.0

---

<p align="center">
  Made with care for the React community
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/galangel"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" /></a>
</p>

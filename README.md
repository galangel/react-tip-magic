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
      { target: 'dashboard', title: 'Welcome', content: 'This is your dashboard.' },
      { target: 'create-btn', title: 'Create', content: 'Click here to get started.' },
    ],
    // Built-in Back/Next controls are off by default—turn them on for multi-step tours
    navigation: { showControls: true },
    progress: { show: true },
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

`useTour` is headless by default: leave `navigation.showControls` unset and render your own controls from the returned `next`, `prev`, `end` and `progress`.

```tsx
const tour = useTour({ steps });

{
  tour.isActive && (
    <div>
      <span>
        {tour.progress.current} of {tour.progress.total}
      </span>
      <button onClick={tour.prev} disabled={tour.currentStep?.isFirst}>
        Back
      </button>
      <button onClick={tour.next}>{tour.currentStep?.isLast ? 'Finish' : 'Next'}</button>
    </div>
  );
}
```

### Step content: `text`, `body` or `content`

Each step takes exactly one of them — a step with none, or with two, won't compile.

```tsx
// Plain text, rendered as text
{ target: 'profile', text: `Signed in as ${user.name}` }

// Any React node (or a function of the current step returning one)
{ target: 'whats-new', title: "What's new", body: <Markdown source={releaseNotes} /> }

// Raw HTML, injected as-is - escape interpolations
import { escapeHtml } from '@galangel/react-tip-magic';
{ target: 'profile', content: `Signed in as <b>${escapeHtml(user.name)}</b>` }
```

The panel itself is rendered by React, so titles, button labels and `text` are escaped for you. Only `content` is injected as HTML: escape any interpolated value with the exported `escapeHtml`.

A `body` renders inside `TipMagicProvider`, not inside the component that called `useTour`, so it sees only the context providers above `TipMagicProvider`. Re-render with new `steps` while the tour runs — data that arrived after `start()` — and the panel on screen updates in place. The step on screen is found again by its `id`, or by its `target` when no other step shares it — so give steps an `id` (or unique targets) if `steps` can change while the tour runs. If it is removed, or cannot be told apart, the tour moves on to the step now at its place, or ends. A long body scrolls once it reaches `--tip-magic-tour-body-max-height` (`60vh` by default), and the panel keeps itself within the viewport.

### When a target isn't there

`start()` returns `false` and changes nothing—no `onStart`, no `onStepChange`—if no step's target is in the DOM, so a tour that can't render never reports itself as shown. Supply `onTargetMissing` to handle it yourself (and to keep the library off `console.warn`):

```tsx
const tour = useTour({
  steps,
  onTargetMissing: (step) => {
    logger.warn('tour target missing', { target: step.target });
    return 'skip'; // or end the tour, which is the default
  },
});

if (tour.start()) {
  markTourAsSeen();
}
```

Recovery depends on the direction of travel: `next()` skips or ends the tour, while `prev()` and `goTo()` leave it where it is — the step on screen is still fine. `goTo()` never skips, so it lands on the step you asked for or returns `false`.

### Where focus lands

A tour panel is a dialog, so focus moves into it when a step opens. `autoFocus` picks which element inside it:

```tsx
const tour = useTour({
  steps,
  // 'panel' (default) | 'primary' — Next/Finish, so Enter advances | false — leave focus alone
  navigation: { showControls: true, autoFocus: 'primary' },
});
```

`'primary'` falls back to the panel when a step renders no Next/Finish button — never to the close button. Overridable per step via `step.navigation.autoFocus`.

Tours also support progress indicators, keyboard support, and backdrop highlighting (`focus: true`, or `focus: { dismissOnClick: true }` to let a click on the backdrop end the tour)—all configurable to fit your needs.

### Upgrading to 1.4

The tour panel is now rendered by React instead of injected as an HTML string. Things you can observe:

- `useTipMagic().tooltip.content` is `null` while a tour panel is showing. It used to hold the panel's HTML; it still returns string content for plain tooltips.
- A custom `progress.render` is wrapped in a `<div style="display: contents">` inside `.tip-magic-tour-footer`, so a `.tip-magic-tour-footer > .your-class` selector no longer matches. Layout is unchanged.
- A step whose only feature is a `title` now renders the panel (a `role="dialog"`) instead of dropping the title.
- A `content` step with no panel features is injected as HTML, as documented, without `tooltipOptions.html: true`. An explicit `html: false` (tour or step) still shows it as text.
- `text` is rendered once-escaped everywhere, and button labels as text rather than markup.
- Unmounting the component that called `useTour` takes a running tour down without calling `onEnd`.

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

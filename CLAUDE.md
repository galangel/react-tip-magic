# react-tip-magic

A React tooltip library with a guided-tour hook (`useTour`) and a keyboard-shortcut
discovery menu (`TipAdvisor`). One tooltip element is rendered at a time and moved
between targets; tours reuse that same element as their panel.

## Commands

```bash
npm run validate   # typecheck + lint + format:check + test - run before every commit
npm test           # vitest, jsdom
npm run dev        # Storybook on :6006
npm run build      # library (dist/index.mjs, .cjs, styles.css)
```

## Layout

| Path                       | Holds                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/components/`          | React components. `Tooltip` renders the single tooltip; the rest are internals mounted by `TipMagicProvider`. |
| `src/hooks/`               | Public hooks and the API objects behind `useTipMagic()`.                                                      |
| `src/hooks/useTour/`       | `useTour`, and `TourPanel`, the React component it passes to the tooltip as content.                          |
| `src/hooks/useTour/utils/` | Tour helpers: DOM managers (classes) and pure functions.                                                      |
| `src/utils/`               | Pure helpers shared across components. Tests in `__tests__/` beside them.                                     |
| `src/types/`               | All public types. `tour.ts` re-exports through `index.ts`.                                                    |
| `src/styles/`              | One stylesheet per concern, all imported by `index.css`.                                                      |
| `src/*.mdx`                | The docs published to GitHub Pages. Updating the README does not reach them.                                  |

## Conventions

- **Class names and data attributes live in constants**, never inline strings:
  `CSS_CLASSES` and `PRIMARY_ACTION_ATTRIBUTE` in `src/constants/`, `TOUR_CSS_CLASSES`
  and `TOUR_DATA_ATTRIBUTES` in `src/hooks/useTour/constants.ts`. One name per value -
  don't re-export a constant under a second name.
- **Pure logic goes in a `utils` module with its own test**, not inline in a component.
  `tooltipStyles`, `groupCompatibility` and `autoFocusTarget` are the pattern.
- Options flow `TooltipShowOptions` → `ParsedTooltipData` → `Tooltip`, merged in
  `useTooltipAPI` with the `...(options.x !== undefined && { x: options.x })` idiom.
- `DATA_ATTRIBUTES` in `src/constants/index.ts` is dead - it is documented as unused and
  nothing reads it. Don't add live values to it.
- Comments are for things the code cannot say. Gotchas belong in this file.

## Releasing

No changesets. Bump `package.json` (`npm version <v> --no-git-tag-version`) and merge:
`publish.yml` asks the registry whether that version exists, so a failed publish retries
on the next push rather than stranding the bump.

## Gotchas

**`dangerouslySetInnerHTML` is re-applied on every render.** React rewrites the subtree
even when the html string is byte-identical. Anything focused inside it is dropped to
`<body>`, an `<img>` or autoplaying `<video>` is recreated and restarts, and the markup
is re-parsed for nothing on every position or visibility update. This is why `Tooltip`
renders html through a memoised `HtmlContent`, and `TourPanel` its HTML message and
custom progress through a memoised `RawHtml`. Don't inline either back.

**`Node.contains` includes the node itself.** `panel.contains(document.activeElement)` is
true when the panel holds focus, so a containment check can never decide whether to focus
something _inside_ the panel. `resolveAutoFocusTarget` guards on identity for `'primary'`
and on containment only for `'panel'`, which is what keeps the default from stealing focus
back off a control the user tabbed to.

**`DOMTokenList.add` re-sets the `class` attribute even for a token already present.**
With a `MutationObserver` watching `class`, an unguarded re-apply notifies the observer
that called it - an unbroken microtask loop that starves the event loop, so even test
timeouts never fire. `BackdropManager` and `HighlightManager` only write when something
is actually missing.

**React rewrites `class` wholesale, so library state cannot live in a class.** A CSS-in-JS
theme switch produces a new generated hash and drops any class the library added. Tour
elevation therefore rides on `data-tip-magic-focus` / `data-tip-magic-elevated`; the
matching classes are kept only as styling hooks. A consumer's `highlightClass` has to stay
a class, so `TargetWatcher` re-applies it - and only registers that observer when such a
class exists.

**The tour panel is a non-modal dialog.** `role="dialog"` with no `aria-modal` and no
focus trap, deliberately: the app behind stays interactive and Escape exits. Don't add a
trap without revisiting that decision.

**The tour panel's primary action is `data-tip-magic-primary`.** Never mark the close
button - `autoFocus: 'primary'` would put Enter on "end the tour". With `showControls`
off, Close is the panel's only button, which is why the fallback is _marked primary →
panel_ and never "first focusable".

**Tour step `content` is injected as HTML; `text` and `body` never are.** The panel is a
React element (`TourPanel`), so its title, labels and `text` are escaped by React. A
`content` string is the one thing it injects, scoped to the message element. A `text` or
`content` step with no panel features passes its body to the tooltip as-is, so `useTour`
sets `html` from the body's kind there: `false` for `text`, whatever the consumer's
`tooltipOptions.html` says, and `true` for `content` unless the step or tour explicitly set
`html: false` - which 1.3 consumers use to show untrusted strings as text. A `body` step
always renders the panel: a plain tooltip ignores the pointer and cannot scroll.

**Each tour step mounts a new panel.** `useTour` keys `LiveTourPanel` by step index. Focus
inside the old panel drops to `<body>` and `autoFocus` resolves afresh - without the key,
React reuses the Next button as the next step's Finish, focus stays on it, and `'panel'`
never moves focus to the new step's dialog. It also stops a `body` component's state
leaking from one step into the next.

**The tour panel reads its props from a store, not from the tooltip's state.** The
element `useTour` hands the tooltip is a `LiveTourPanel` that subscribes to a
`TourPanelStore`, so a running step can follow new `steps` (a body whose data arrived
after `start()`) in place. Routing that update through `tooltip.show` instead would
re-render every `useTipMagic` consumer - the component that called `useTour` among them,
whose inline `steps` would then update again, forever - and would re-run the tooltip's
`autoFocus` effect, which keys on its content.

Each shown step gets a store of its own. A store update re-renders synchronously while the
tooltip's dispatch may not (a navigation inside `startTransition`), so with one shared
store the outgoing panel rendered the next step's `body` before it was replaced.

**A `body` renders in the provider's tree, not the caller's.** The element is created in
the component that called `useTour` but rendered by `Tooltip`, under `TipMagicProvider`,
so it sees only the context providers above the provider.

**Unmounting the component that called `useTour` ends a running tour silently, a
microtask later.** The unmount cleanup tears it down - panel, backdrop, highlight, helper
flow - without `onExit` or `onEnd`. It is deferred and skipped if the hook has mounted
again, because `StrictMode`'s simulated unmount remounts within the same task: tearing
down there closed a tour started from a guarded mount effect, for good. A test has to
`await act(async () => ...)` the unmount to see the teardown.

Two consequences of the deferral. The cleanup is a layout effect that clears `mountedRef`
during the unmount commit, and `handleTargetLost` ignores a lost target once it is clear:
a target rendered inside the unmounting component detaches in the same commit, and the
`MutationObserver` would otherwise end the tour with `onTargetMissing`, `onExit` and
`onEnd` before the teardown ran. And the teardown releases the tooltip and helper flow only
while this tour still owns them (`HIDE_TOOLTIP` / `END_FLOW` with `onlyIfContent` /
`onlyIfSteps`): by the time it runs, the component that replaced this one may have started
its own tour.

**`onStepChange` fires before the panel exists on the first step.** It is called from
inside `start()`, so a consumer cannot use it to reach into the rendered panel.

**jsdom cannot answer three things**, so don't claim them from a passing test: it runs no
transitions (`transitionBehavior: 'move'` timing), has no `:focus-visible` heuristic
(whether a programmatic focus draws a ring), and has no layout, so the size()
middleware's `--tip-magic-available-height` is meaningless and whether a tall tour panel
fits the viewport with a scrolling body is unknowable. All three need a browser.

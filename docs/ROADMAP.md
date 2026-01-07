# Roadmap

This document outlines the development phases and milestones for React Tip Magic.

## Version Overview

| Version | Status            | Focus                      |
| ------- | ----------------- | -------------------------- |
| 0.1.0   | 🔨 In Development | Core tooltip functionality |
| 0.2.0   | 📋 Planned        | Helper system              |
| 0.3.0   | 📋 Planned        | Flows & onboarding         |
| 0.4.0   | 📋 Planned        | Advanced features          |
| 1.0.0   | 📋 Planned        | Stable release             |

---

## Phase 1: Foundation (v0.1.0)

**Goal:** Establish core tooltip functionality with solid architecture.

### Milestone 1.1: Project Setup ✅

- [x] Initialize project with Vite
- [x] Configure TypeScript
- [x] Set up ESLint and Prettier
- [x] Configure Vitest
- [x] Set up Storybook
- [x] Configure pre-commit hooks (Husky + lint-staged)
- [x] Create GitHub Actions workflows
- [x] Create documentation structure

### Milestone 1.2: Core Tooltip

- [ ] Implement `TipMagicProvider` component
- [ ] Create tooltip context and state management
- [ ] Implement event delegation for `data-tip` attributes
- [ ] Integrate Floating UI for positioning
- [ ] Add show/hide animations
- [ ] Handle placement options (top, bottom, left, right, etc.)
- [ ] Implement arrow pointing to target

### Milestone 1.3: Data Attributes

- [ ] Parse `data-tip` content
- [ ] Implement `data-tip-placement`
- [ ] Implement `data-tip-delay`
- [ ] Implement `data-tip-disabled`
- [ ] Implement `data-tip-id`

### Milestone 1.4: Content Features

- [ ] Keyboard shortcut parsing and styling (`Copy; ⌘+C`)
- [ ] Implement `data-tip-ellipsis`
- [ ] Implement `data-tip-max-lines`
- [ ] Implement `data-tip-word-wrap`
- [ ] Implement `data-tip-max-width`

### Milestone 1.5: Smooth Transitions

- [ ] Detect hover between tooltip elements
- [ ] Animate tooltip position change
- [ ] Animate content change
- [ ] Handle rapid hover changes (debouncing)

### Milestone 1.6: Testing & Documentation

- [ ] Unit tests for all utilities
- [ ] Component tests for tooltip
- [ ] Integration tests for hover behavior
- [ ] Storybook stories for all features
- [ ] API documentation complete

**Target:** v0.1.0 release

---

## Phase 2: Helper System (v0.2.0)

**Goal:** Introduce the intelligent floating helper.

### Milestone 2.1: Basic Helper

- [ ] Implement `Helper` component
- [ ] Add helper to provider
- [ ] Position helper in viewport
- [ ] Basic show/hide functionality

### Milestone 2.2: Helper States

- [ ] Implement `idle` state
- [ ] Implement `thinking` state (animated)
- [ ] Implement `working` state (progress)
- [ ] Implement `informative` state
- [ ] Implement `cta` state
- [ ] Implement `success` state
- [ ] Implement `error` state
- [ ] Implement `warning` state

### Milestone 2.3: Helper Positioning

- [ ] Auto-position in viewport
- [ ] Position near target element
- [ ] Fixed corner positions
- [ ] Smooth position transitions

### Milestone 2.4: Helper Actions

- [ ] Render action buttons
- [ ] Handle action clicks
- [ ] Keyboard navigation for actions
- [ ] Action button variants (primary, secondary, ghost)

### Milestone 2.5: Hover Zone Integration

- [ ] Create hover zone between tooltip and helper
- [ ] Keep tooltip visible when hovering helper
- [ ] Keep tooltip visible when hovering actions
- [ ] Handle mouse leaving hover zone

### Milestone 2.6: Programmatic API

- [ ] `helper.show()` API
- [ ] `helper.hide()` API
- [ ] `helper.setState()` API
- [ ] `helper.moveTo()` API

**Target:** v0.2.0 release

---

## Phase 3: Flows & Onboarding (v0.3.0)

**Goal:** Enable guided experiences and onboarding flows.

### Milestone 3.1: Flow System

- [ ] Define flow step structure
- [ ] Implement `helper.startFlow()` API
- [ ] Implement step navigation (next, prev)
- [ ] Handle flow completion
- [ ] Handle flow skip/cancel

### Milestone 3.2: Flow UI

- [ ] Step indicator (1 of 5)
- [ ] Navigation buttons
- [ ] Custom actions per step
- [ ] Smooth transitions between steps

### Milestone 3.3: Target Highlighting

- [ ] Highlight current target element
- [ ] Dim/overlay rest of page (optional)
- [ ] Scroll target into view
- [ ] Handle hidden/unmounted targets

### Milestone 3.4: Flow Persistence

- [ ] Save flow progress to localStorage
- [ ] Resume interrupted flows
- [ ] Mark flows as completed
- [ ] Flow analytics events

### Milestone 3.5: Advanced Flow Features

- [ ] Conditional steps
- [ ] Branching flows
- [ ] Delayed step triggers
- [ ] Wait for user action before proceeding

**Target:** v0.3.0 release

---

## Phase 4: Advanced Features (v0.4.0)

**Goal:** Polish and advanced use cases.

### Milestone 4.1: Rich Content

- [ ] Implement `data-tip-html`
- [ ] Implement `data-tip-interactive`
- [ ] Support React components as content
- [ ] Image support in tooltips

### Milestone 4.2: Theming

- [ ] Light theme
- [ ] Dark theme
- [ ] Auto theme (system preference)
- [ ] Custom theme support
- [ ] CSS custom properties documentation

### Milestone 4.3: Accessibility

- [ ] Full keyboard navigation
- [ ] Screen reader support
- [ ] ARIA attributes
- [ ] Focus management
- [ ] Reduced motion support

### Milestone 4.4: Performance

- [ ] Bundle size optimization
- [ ] Lazy loading helper
- [ ] Animation performance audit
- [ ] Memory leak testing
- [ ] Performance benchmarks

### Milestone 4.5: Developer Experience

- [ ] TypeScript strict mode
- [ ] Detailed error messages
- [ ] DevTools integration
- [ ] Debug mode

**Target:** v0.4.0 release

---

## Phase 5: Stable Release (v1.0.0)

**Goal:** Production-ready stable release.

### Milestone 5.1: Stability

- [ ] Comprehensive test coverage (>90%)
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browser testing
- [ ] Production usage testing

### Milestone 5.2: Documentation

- [ ] Complete API documentation
- [ ] Migration guide (if needed)
- [ ] Examples for all use cases
- [ ] Video tutorials
- [ ] Storybook showcase site

### Milestone 5.3: Community

- [ ] Contribution guidelines
- [ ] Code of conduct
- [ ] Issue templates
- [ ] PR templates
- [ ] Changelog

### Milestone 5.4: Ecosystem

- [ ] React Native considerations
- [ ] Next.js compatibility
- [ ] Remix compatibility
- [ ] SSR support documentation

**Target:** v1.0.0 release

---

## Future Considerations (Post 1.0)

### Potential Features

- **AI Integration**: Helper that can answer questions about the UI
- **Analytics Dashboard**: Track tooltip engagement
- **A/B Testing**: Test different tooltip content
- **Collaborative Flows**: Multi-user onboarding
- **Voice Commands**: Voice-activated tooltips
- **Gesture Support**: Touch and swipe gestures

### Integration Packages

- `@react-tip-magic/analytics` - Analytics integration
- `@react-tip-magic/ai` - AI-powered helper
- `@react-tip-magic/motion` - Advanced animations with Framer Motion

---

## Contributing to Roadmap

We welcome community input on the roadmap!

- **Feature Requests**: Open a GitHub issue with the `enhancement` label
- **Priority Feedback**: Comment on roadmap issues to influence priority
- **Implementation Help**: Pick up any milestone task and submit a PR

## Release Schedule

We aim for monthly minor releases and patch releases as needed:

- **Minor releases**: First week of each month
- **Patch releases**: As needed for bug fixes
- **Major releases**: When breaking changes are necessary

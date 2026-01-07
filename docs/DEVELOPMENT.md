# Development Guide

This guide covers setting up the development environment, project structure, and contribution workflow.

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/react-tip-magic.git
cd react-tip-magic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
# Start Storybook for component development
npm run dev

# Or run both Storybook and watch mode
npm run dev:all
```

## Project Structure

```
react-tip-magic/
├── .github/
│   └── workflows/
│       ├── ci.yml              # PR checks (test, lint, format)
│       ├── deploy-storybook.yml # Deploy Storybook to Pages
│       └── publish.yml          # Publish to npm
├── .husky/
│   └── pre-commit              # Pre-commit hook
├── src/
│   ├── components/
│   │   ├── TipMagicProvider.tsx
│   │   ├── Tooltip/
│   │   │   ├── Tooltip.tsx
│   │   │   ├── TooltipContent.tsx
│   │   │   ├── TooltipArrow.tsx
│   │   │   ├── Tooltip.test.tsx
│   │   │   └── index.ts
│   │   └── Helper/
│   │       ├── Helper.tsx
│   │       ├── HelperStates.tsx
│   │       ├── HelperActions.tsx
│   │       ├── Helper.test.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useTipMagic.ts
│   │   ├── useTooltip.ts
│   │   ├── useHelper.ts
│   │   ├── usePosition.ts
│   │   ├── useHoverZone.ts
│   │   ├── useEventDelegation.ts
│   │   └── __tests__/
│   │       └── *.test.ts
│   ├── context/
│   │   └── TipMagicContext.tsx
│   ├── utils/
│   │   ├── parseDataAttributes.ts
│   │   ├── animation.ts
│   │   ├── position.ts
│   │   ├── dom.ts
│   │   └── __tests__/
│   │       └── *.test.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── styles/
│   │   ├── tooltip.css
│   │   ├── helper.css
│   │   ├── animations.css
│   │   └── index.css
│   └── index.ts                # Main entry point
├── stories/
│   ├── Introduction.mdx
│   ├── Tooltip.stories.tsx
│   ├── Helper.stories.tsx
│   ├── Flows.stories.tsx
│   └── Examples/
│       ├── Dashboard.stories.tsx
│       ├── Onboarding.stories.tsx
│       └── AIAssistant.stories.tsx
├── tests/
│   ├── setup.ts
│   └── integration/
│       └── *.test.tsx
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── theme.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Available Scripts

| Script                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start Storybook development server             |
| `npm run build`           | Build the library for production               |
| `npm run build:storybook` | Build Storybook static site                    |
| `npm run test`            | Run tests with Vitest                          |
| `npm run test:watch`      | Run tests in watch mode                        |
| `npm run test:coverage`   | Run tests with coverage report                 |
| `npm run lint`            | Run ESLint                                     |
| `npm run lint:fix`        | Run ESLint with auto-fix                       |
| `npm run format`          | Format code with Prettier                      |
| `npm run format:check`    | Check code formatting                          |
| `npm run typecheck`       | Run TypeScript type checking                   |
| `npm run validate`        | Run all checks (lint, format, typecheck, test) |
| `npm run prepublishOnly`  | Pre-publish validation and build               |

## Development Workflow

### 1. Creating a New Feature

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Implement your feature following the project structure

3. Add tests for your feature

4. Add Storybook stories to document and showcase the feature

5. Run validation:

   ```bash
   npm run validate
   ```

6. Commit your changes (pre-commit hook will run linting)

7. Push and create a Pull Request

### 2. Writing Tests

We use Vitest for testing. Tests are co-located with components or in `__tests__` directories.

```tsx
// src/components/Tooltip/Tooltip.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TipMagicProvider } from '../TipMagicProvider';

describe('Tooltip', () => {
  it('shows tooltip on hover', async () => {
    render(
      <TipMagicProvider>
        <button data-tip="Hello World">Hover me</button>
      </TipMagicProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });
});
```

### 3. Writing Storybook Stories

```tsx
// stories/Tooltip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TipMagicProvider } from '../src';

const meta: Meta = {
  title: 'Components/Tooltip',
  decorators: [
    (Story) => (
      <TipMagicProvider>
        <Story />
      </TipMagicProvider>
    ),
  ],
};

export default meta;

export const Basic: StoryObj = {
  render: () => <button data-tip="This is a tooltip">Hover me</button>,
};

export const WithKeyboardShortcut: StoryObj = {
  render: () => <button data-tip="Copy; ⌘+C">Copy</button>,
};
```

### 4. Code Style

We use ESLint and Prettier for code quality:

```javascript
// eslint.config.js
export default [
  // ... ESLint flat config
];
```

```javascript
// prettier.config.js
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
};
```

## Build Configuration

### Vite Library Build

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactTipMagic',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
```

### Package Configuration

```json
{
  "name": "react-tip-magic",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

## CI/CD

### Pull Request Checks

The CI workflow runs on every pull request:

1. Install dependencies
2. Type checking
3. Linting
4. Formatting check
5. Unit tests
6. Build verification

### Storybook Deployment

On merge to `main`:

1. Build Storybook
2. Deploy to GitHub Pages

### npm Publishing

On merge to `main` with version change:

1. Detect version change in `package.json`
2. Build library
3. Run tests
4. Publish to npm
5. Create GitHub release

## Pre-commit Hook

We use Husky for git hooks:

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

## Debugging Tips

### Storybook Actions

Use Storybook's actions addon to debug events:

```tsx
import { action } from '@storybook/addon-actions';

<TipMagicProvider
  onTooltipShow={action('tooltip-show')}
  onHelperStateChange={action('helper-state')}
>
```

### React DevTools

The context and state are inspectable via React DevTools.

### Floating UI DevTools

Install the Floating UI DevTools browser extension for positioning debugging.

## Troubleshooting

### Common Issues

**Tooltip not showing:**

- Check if `TipMagicProvider` is at root level
- Verify `data-tip` attribute is set correctly
- Check if tooltip is disabled globally or on element

**Position issues:**

- Ensure parent containers don't have `overflow: hidden`
- Check z-index conflicts
- Verify Floating UI middleware configuration

**Animation glitches:**

- Check for CSS conflicts with `transform` or `opacity`
- Verify `prefers-reduced-motion` handling
- Test animation duration values

## Resources

- [React Documentation](https://react.dev)
- [Floating UI Documentation](https://floating-ui.com)
- [Vitest Documentation](https://vitest.dev)
- [Storybook Documentation](https://storybook.js.org)

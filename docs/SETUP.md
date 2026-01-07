# Project Setup Guide

This guide walks through the initial project setup from scratch.

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Step 1: Initialize the Project

```bash
# Create project directory (already done)
mkdir react-tip-magic
cd react-tip-magic

# Initialize npm project
npm init -y

# Initialize git
git init
```

## Step 2: Install Dependencies

### Core Dependencies

```bash
# Floating UI for positioning
npm install @floating-ui/react @floating-ui/dom
```

### Development Dependencies

```bash
# React (peer dependency, but needed for dev)
npm install -D react react-dom @types/react @types/react-dom

# TypeScript
npm install -D typescript

# Vite for building
npm install -D vite @vitejs/plugin-react vite-plugin-dts

# Testing with Vitest
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Storybook
npx storybook@latest init --type react --builder vite

# Linting and formatting
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Git hooks
npm install -D husky lint-staged
```

## Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "storybook-static"]
}
```

Create `tsconfig.build.json` for library build:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.tsx"]
}
```

## Step 4: Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.tsx'],
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles.css';
          return assetInfo.name || '';
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: false,
  },
});
```

## Step 5: Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.tsx', 'src/index.ts', 'src/**/*.d.ts'],
    },
  },
});
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Step 6: Configure ESLint

Create `eslint.config.js`:

```javascript
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'storybook-static/', 'coverage/'],
  },
  prettier,
];
```

## Step 7: Configure Prettier

Create `prettier.config.js`:

```javascript
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

Create `.prettierignore`:

```
dist/
node_modules/
storybook-static/
coverage/
*.md
```

## Step 8: Configure Husky and lint-staged

```bash
# Initialize Husky
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json}": ["prettier --write"]
  }
}
```

## Step 9: Configure Storybook

After running `npx storybook@latest init`, update `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    return config;
  },
};

export default config;
```

Update `.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/react';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
```

## Step 10: Configure package.json

```json
{
  "name": "react-tip-magic",
  "version": "0.0.1",
  "description": "A sophisticated, elegant, and performant tooltip library for React",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.cjs"
      }
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "vite build",
    "build:storybook": "storybook build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit",
    "validate": "npm run typecheck && npm run lint && npm run format:check && npm run test",
    "prepublishOnly": "npm run validate && npm run build",
    "prepare": "husky"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@floating-ui/react": "^0.26.0"
  },
  "devDependencies": {
    // ... (installed in steps above)
  },
  "keywords": [
    "react",
    "tooltip",
    "popover",
    "helper",
    "onboarding",
    "floating-ui",
    "accessible",
    "typescript"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/react-tip-magic.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/react-tip-magic/issues"
  },
  "homepage": "https://github.com/your-username/react-tip-magic#readme"
}
```

## Step 11: Create .gitignore

```
# Dependencies
node_modules/

# Build outputs
dist/
storybook-static/

# Coverage
coverage/

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# TypeScript
*.tsbuildinfo
```

## Step 12: Create Source Structure

```bash
mkdir -p src/{components,hooks,utils,context,types,constants,styles}
mkdir -p src/components/{Tooltip,Helper}
mkdir -p stories/Examples
mkdir -p tests/integration
```

Create `src/index.ts`:

```typescript
// Components
export { TipMagicProvider } from './components/TipMagicProvider';

// Hooks
export { useTipMagic } from './hooks/useTipMagic';

// Types
export type {
  TipMagicOptions,
  TooltipAPI,
  HelperAPI,
  HelperState,
  HelperAction,
  FlowStep,
  Placement,
} from './types';

// Styles are imported separately:
// import 'react-tip-magic/styles.css';
```

## Next Steps

1. Implement core components following the architecture
2. Write tests for each component
3. Create Storybook stories
4. Document API usage
5. Set up GitHub repository
6. Configure npm publishing

Refer to:

- [Architecture](./ARCHITECTURE.md) for implementation details
- [API](./API.md) for API reference
- [Development](./DEVELOPMENT.md) for development workflow
- [Roadmap](./ROADMAP.md) for feature planning

# Contributing to React Tip Magic

Thank you for your interest in contributing to React Tip Magic! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [email@example.com].

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

1. Fork the repository on GitHub

2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/react-tip-magic.git
   cd react-tip-magic
   ```

3. Add the upstream remote:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/react-tip-magic.git
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

---

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](https://github.com/your-repo/react-tip-magic/issues) to avoid duplicates
2. Ensure the bug is reproducible with the latest version

When submitting a bug report, include:

- **Title**: Clear, concise description of the bug
- **Environment**: Browser, OS, React version, library version
- **Steps to Reproduce**: Numbered list of steps
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Code Sample**: Minimal reproduction code or link to CodeSandbox
- **Screenshots**: If applicable

### Suggesting Features

We welcome feature suggestions! Before submitting:

1. Check the [roadmap](./ROADMAP.md) to see if it's already planned
2. Search existing issues for similar suggestions

When suggesting a feature:

- **Title**: Clear, concise description
- **Problem**: What problem does this solve?
- **Proposed Solution**: How do you envision this working?
- **Alternatives**: Any alternative solutions you've considered
- **Use Cases**: Real-world examples of when this would be useful

### Contributing Code

1. Find an issue to work on, or create one for your feature/fix
2. Comment on the issue to let others know you're working on it
3. Fork and create a branch
4. Write your code and tests
5. Submit a pull request

---

## Development Process

### Branch Naming

Use descriptive branch names:

- `feature/add-tooltip-animation`
- `fix/tooltip-position-overflow`
- `docs/update-api-reference`
- `refactor/simplify-event-delegation`
- `test/add-helper-integration-tests`

### Development Workflow

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our coding standards

4. **Test your changes**:

   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

5. **Commit your changes** using conventional commits

6. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] Tests added for new functionality
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Commits are clean and well-described

### PR Template

When opening a PR, include:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Related Issues

Fixes #(issue number)

## Testing

Describe the tests you ran

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated the documentation accordingly
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

---

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface TooltipProps {
  content: string;
  placement?: Placement;
  disabled?: boolean;
}

function showTooltip(target: Element, options: TooltipProps): void {
  // ...
}

// Avoid
function showTooltip(target: any, options: any) {
  // ...
}
```

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use `memo()` only when profiling shows it's needed

```tsx
// Good
function TooltipContent({ content, hasShortcut }: TooltipContentProps) {
  const parsedContent = useMemo(() => parseContent(content), [content]);

  return (
    <div className="tooltip-content">
      {parsedContent.main}
      {hasShortcut && <kbd>{parsedContent.shortcut}</kbd>}
    </div>
  );
}

// Avoid - too complex, should be split
function Tooltip(
  {
    /* 15 props */
  }
) {
  // 200 lines of logic
}
```

### CSS

- Use CSS custom properties for theming
- Follow BEM-like naming: `tip-magic__element--modifier`
- Avoid `!important`
- Use logical properties when appropriate

```css
/* Good */
.tip-magic-tooltip {
  background: var(--tip-magic-bg);
  border-radius: var(--tip-magic-border-radius);
}

.tip-magic-tooltip--visible {
  opacity: 1;
}

/* Avoid */
.tooltip {
  background: #000 !important;
}
```

### File Organization

- One component per file
- Co-locate tests with components (`Component.test.tsx`)
- Group related utilities in the same file
- Export from index files

```
components/
└── Tooltip/
    ├── Tooltip.tsx
    ├── Tooltip.test.tsx
    ├── TooltipContent.tsx
    ├── TooltipArrow.tsx
    └── index.ts
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(tooltip): add support for custom placement

Add data-tip-placement attribute to override default positioning.
Supports all Floating UI placement options.

Closes #42
```

```bash
fix(helper): prevent tooltip hiding when hovering actions

The tooltip was incorrectly hiding when the user moved their mouse
from the tooltip target to the helper action buttons.

Fixes #38
```

```bash
docs(api): update helper state documentation

Add missing description for 'warning' state and examples
for each state type.
```

---

## Testing Guidelines

### Test Philosophy

- Test behavior, not implementation
- Write tests that give confidence
- Cover edge cases and error states
- Keep tests maintainable

### Test Structure

```typescript
describe('Tooltip', () => {
  describe('visibility', () => {
    it('shows on mouseenter after delay', async () => {
      // ...
    });

    it('hides on mouseleave', async () => {
      // ...
    });

    it('stays visible when moving between tooltip and helper', async () => {
      // ...
    });
  });

  describe('positioning', () => {
    it('positions above element by default', () => {
      // ...
    });

    it('flips to bottom when near top edge', () => {
      // ...
    });
  });
});
```

### Testing Library Best Practices

```typescript
// Good - test user behavior
const button = screen.getByRole('button', { name: /save/i });
await userEvent.hover(button);
await waitFor(() => {
  expect(screen.getByText('Click to save')).toBeInTheDocument();
});

// Avoid - testing implementation
const tooltip = container.querySelector('.tip-magic-tooltip');
expect(tooltip.style.opacity).toBe('1');
```

### What to Test

- ✅ User interactions
- ✅ Accessibility features
- ✅ Error handling
- ✅ Edge cases
- ❌ Internal state (usually)
- ❌ Styling (use visual regression if needed)
- ❌ Third-party library behavior

---

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new discussion on GitHub
3. Reach out to maintainers

Thank you for contributing to React Tip Magic! 🎉

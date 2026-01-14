import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS } from '../../../constants';
import { TipMagicContext, type TipMagicContextValue } from '../../../context/TipMagicContext';
import type { ParsedTooltipData, TipMagicState } from '../../../types';
import { Tooltip } from '../Tooltip';

// Clean up DOM after each test to prevent pollution
afterEach(() => {
  cleanup();
});

/**
 * Create a mock state for testing
 */
function createMockState(overrides: Partial<TipMagicState['tooltip']> = {}): TipMagicState {
  return {
    tooltip: {
      visible: true,
      content: 'Test content',
      target: document.createElement('div'),
      position: { x: 0, y: 0 },
      placement: 'top',
      isTransitioning: false,
      parsedData: {
        content: 'Test content',
        placement: 'top',
        delay: 200,
        disabled: false,
        ellipsis: false,
        maxLines: 1,
        wordWrap: false,
        textBreak: 'normal',
        maxWidth: 300,
        html: false,
        interactive: false,
        showArrow: true,
      },
      previousGroup: undefined,
      ...overrides,
    },
    helper: {
      visible: false,
      state: 'idle',
      message: undefined,
      actions: undefined,
      targetId: undefined,
      position: 'bottom-right',
      autoHide: undefined,
    },
    flow: {
      active: false,
      steps: [],
      currentIndex: -1,
    },
    config: {
      ...DEFAULT_OPTIONS,
    },
  };
}

/**
 * Render Tooltip with mock context
 */
function renderTooltip(state: TipMagicState) {
  const mockDispatch = () => {};
  const contextValue: TipMagicContextValue = {
    state,
    dispatch: mockDispatch,
  };

  return render(
    <TipMagicContext.Provider value={contextValue}>
      <Tooltip />
    </TipMagicContext.Provider>
  );
}

describe('Tooltip', () => {
  describe('HTML content with semicolons', () => {
    it('should NOT split HTML content on semicolons', () => {
      // This is the critical test case - tour content often contains semicolons
      // in titles, messages, and button labels which should NOT be parsed as separators
      const htmlWithSemicolons =
        '<div class="tour-content"><h3>Welcome; Get Started</h3><p>Click here; then continue</p></div>';

      const state = createMockState({
        content: htmlWithSemicolons,
        parsedData: {
          content: htmlWithSemicolons,
          placement: 'top',
          delay: 200,
          disabled: false,
          ellipsis: false,
          maxLines: 1,
          wordWrap: false,
          textBreak: 'normal',
          maxWidth: 300,
          html: true, // HTML mode enabled
          interactive: true,
          showArrow: true,
        } as ParsedTooltipData,
      });

      renderTooltip(state);

      // The full HTML content should be rendered, not split on semicolons
      const textElement = document.querySelector('.tip-magic-text');
      expect(textElement).not.toBeNull();
      expect(textElement?.innerHTML).toBe(htmlWithSemicolons);
    });

    it('should NOT show keyboard shortcut styling for HTML content', () => {
      // Even if HTML content contains semicolons, it should not create a <kbd> element
      const htmlWithSemicolons = '<div>Title; Subtitle</div>';

      const state = createMockState({
        content: htmlWithSemicolons,
        parsedData: {
          content: htmlWithSemicolons,
          placement: 'top',
          delay: 200,
          disabled: false,
          ellipsis: false,
          maxLines: 1,
          wordWrap: false,
          textBreak: 'normal',
          maxWidth: 300,
          html: true,
          interactive: false,
          showArrow: true,
        } as ParsedTooltipData,
      });

      // Enable shortcut styling in config
      state.config.enableShortcutStyle = true;

      renderTooltip(state);

      // Should NOT have a kbd element for shortcuts
      const kbdElement = document.querySelector('kbd');
      expect(kbdElement).toBeNull();
    });

    it('should display keyboard shortcut from data-tip-shortcut attribute', () => {
      // Shortcuts are now specified via data-tip-shortcut attribute
      const state = createMockState({
        content: 'Copy',
        parsedData: {
          content: 'Copy',
          placement: 'top',
          delay: 200,
          disabled: false,
          ellipsis: false,
          maxLines: 1,
          wordWrap: false,
          textBreak: 'normal',
          maxWidth: 300,
          html: false,
          interactive: false,
          showArrow: true,
          shortcut: '⌘C', // Shortcut from data-tip-shortcut attribute
        } as ParsedTooltipData,
      });

      // Enable shortcut styling in config
      state.config.enableShortcutStyle = true;

      renderTooltip(state);

      // Should have the main text
      const textElement = document.querySelector('.tip-magic-text');
      expect(textElement).not.toBeNull();
      expect(textElement?.textContent).toBe('Copy');

      // Should have a kbd element for the shortcut
      const kbdElement = document.querySelector('kbd');
      expect(kbdElement).not.toBeNull();
      expect(kbdElement?.textContent).toBe('⌘C');
    });

    it('should render tour-like HTML content with navigation buttons containing semicolons in labels', () => {
      // Simulates real tour content where button labels might contain semicolons
      const tourContent = `
        <div class="tip-magic-tour-content">
          <div class="tip-magic-tour-header">
            <div class="tip-magic-tour-title">Step 1; Introduction</div>
          </div>
          <div class="tip-magic-tour-body">
            <div class="tip-magic-tour-message">Welcome to the tour; let's get started!</div>
          </div>
          <div class="tip-magic-tour-nav">
            <button>Back; Previous</button>
            <button>Next; Continue</button>
          </div>
        </div>
      `;

      const state = createMockState({
        content: tourContent,
        parsedData: {
          content: tourContent,
          placement: 'bottom',
          delay: 0,
          disabled: false,
          ellipsis: false,
          maxLines: 1,
          wordWrap: false,
          textBreak: 'normal',
          maxWidth: 400,
          html: true,
          interactive: true,
          showArrow: true,
        } as ParsedTooltipData,
      });

      renderTooltip(state);

      // The title with semicolon should be preserved
      const title = document.querySelector('.tip-magic-tour-title');
      expect(title?.textContent).toBe('Step 1; Introduction');

      // The message with semicolon should be preserved
      const message = document.querySelector('.tip-magic-tour-message');
      expect(message?.textContent).toBe("Welcome to the tour; let's get started!");

      // Navigation buttons with semicolons should be preserved
      const buttons = document.querySelectorAll('button');
      expect(buttons[0]?.textContent).toBe('Back; Previous');
      expect(buttons[1]?.textContent).toBe('Next; Continue');
    });
  });
});

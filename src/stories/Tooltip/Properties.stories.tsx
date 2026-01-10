import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useRef } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipMagic } from '../../hooks/useTipMagic';
import '../../styles/index.css';
import './tooltip-stories.css';

/**
 * The Tooltip component from React Tip Magic provides elegant, performant tooltips
 * that smoothly transition between elements instead of creating new instances.
 *
 * ## Features
 * - **Single instance**: One tooltip moves between targets for smooth transitions
 * - **Data attribute based**: Just add `data-tip` to any element
 * - **Keyboard shortcut support**: Use `; ` to separate content from shortcuts
 * - **Floating UI powered**: Smart positioning with flip/shift
 * - **Accessible**: Keyboard and screen reader support
 * - **TypeScript support**: Use `getTipProps()` for typed tooltip configuration
 */
const meta: Meta = {
  title: 'Tooltip/Properties',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type SimpleStory = StoryObj;

/**
 * Control tooltip placement with the `data-tip-placement` attribute.
 * Supports: top, top-start, top-end, bottom, bottom-start, bottom-end,
 * left, left-start, left-end, right, right-start, right-end
 */
export const AllPlacements: SimpleStory = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <div className="story-placement-grid">
          <button className="story-button" data-tip="Top start" data-tip-placement="top-start">
            Top Start
          </button>
          <button className="story-button" data-tip="Top center" data-tip-placement="top">
            Top
          </button>
          <button className="story-button" data-tip="Top end" data-tip-placement="top-end">
            Top End
          </button>

          <button className="story-button" data-tip="Left" data-tip-placement="left">
            Left
          </button>
          <div className="story-placeholder" />
          <button className="story-button" data-tip="Right" data-tip-placement="right">
            Right
          </button>

          <button
            className="story-button"
            data-tip="Bottom start"
            data-tip-placement="bottom-start"
          >
            Bottom Start
          </button>
          <button className="story-button" data-tip="Bottom center" data-tip-placement="bottom">
            Bottom
          </button>
          <button className="story-button" data-tip="Bottom end" data-tip-placement="bottom-end">
            Bottom End
          </button>
        </div>
      </div>
    </TipMagicProvider>
  ),
};

/**
 * Demonstrates custom show delays using the `data-tip-delay` attribute.
 *
 * **Delay Behavior When Transitioning:**
 * - When moving between buttons, the new button's show delay is respected
 * - If the show delay is longer than the hide delay (default: 700ms), the tooltip
 *   will first disappear, then reappear on the new target after its show delay
 * - Example: Moving from 500ms → 1000ms button: tooltip hides at 700ms, shows at 1000ms
 * - If show delay is shorter than hide delay, tooltip moves smoothly to the new target
 */
export const ShowDelay: SimpleStory = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          Try moving between buttons to see how delays interact.
          <br />
          <strong>Tip:</strong> When moving to a button with a show delay longer than the hide delay
          (700ms), the tooltip will disappear first, then reappear.
        </p>
        <div className="story-button-group">
          <button className="story-button" data-tip="Instant!" data-tip-delay="0">
            No delay
          </button>
          <button className="story-button" data-tip="Default delay (200ms)" data-tip-delay="200">
            200ms
          </button>
          <button className="story-button" data-tip="Slow reveal (500ms)" data-tip-delay="500">
            500ms
          </button>
          <button className="story-button" data-tip="Very slow (1s)" data-tip-delay="1000">
            1 second
          </button>
        </div>
      </div>
    </TipMagicProvider>
  ),
};

/**
 * Programmatic control of tooltips using the `useTipMagic` hook.
 */
const ProgrammaticDemo = () => {
  const { tooltip } = useTipMagic();

  return (
    <div className="story-container">
      <p className="story-description">
        The tooltip will stay visible until you click "Hide Tooltip" (no auto-hide).
      </p>
      <div className="story-button-group">
        <button
          className="story-button"
          id="programmatic-target"
          data-tip="I can be controlled programmatically!"
        >
          Target Element
        </button>
      </div>
      <div className="story-button-group" style={{ marginTop: '20px' }}>
        <button
          className="story-button story-button-secondary"
          onClick={() => tooltip.show('#programmatic-target', { hideDelay: 999999999 })}
        >
          Show Tooltip
        </button>
        <button
          className="story-button story-button-secondary"
          onClick={() =>
            tooltip.show('#programmatic-target', {
              content: 'Custom content!',
              hideDelay: 999999999,
            })
          }
        >
          Show Custom Content
        </button>
        <button className="story-button story-button-secondary" onClick={() => tooltip.hide()}>
          Hide Tooltip
        </button>
      </div>
      <p className="story-info">
        Visible: {tooltip.isVisible ? 'Yes' : 'No'}
        {tooltip.content && ` | Content: "${tooltip.content}"`}
      </p>
    </div>
  );
};

export const ProgrammaticControl: SimpleStory = {
  render: () => (
    <TipMagicProvider>
      <ProgrammaticDemo />
    </TipMagicProvider>
  ),
};

/**
 * Demonstrates keyboard navigation triggering tooltips.
 *
 * Press **Tab** to move focus between elements. When an element receives focus,
 * its tooltip appears automatically. Focus is trapped within this demo area.
 *
 * This is important for accessibility - users who navigate with keyboard
 * should still be able to discover tooltip content.
 */
const KeyboardNavigationDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);

    if (focusableArray.length === 0) return;

    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, go to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, go to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="story-container"
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      <p className="story-description">
        Press{' '}
        <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px' }}>Tab</kbd> to
        navigate between buttons. Tooltips appear on focus.
        <br />
        Focus is trapped within this demo area.
      </p>
      <div className="story-button-group">
        <button className="story-button" data-tip="First action - Save your work">
          Save
        </button>
        <button className="story-button" data-tip="Second action - Edit content">
          Edit
        </button>
        <button className="story-button" data-tip="Third action - Delete item">
          Delete
        </button>
        <button className="story-button" data-tip="Fourth action - Share with others">
          Share
        </button>
      </div>
      <p className="story-info" style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        💡 Try pressing Tab repeatedly - focus will loop through the buttons
      </p>
    </div>
  );
};

export const KeyboardNavigation: SimpleStory = {
  render: () => (
    <TipMagicProvider>
      <KeyboardNavigationDemo />
    </TipMagicProvider>
  ),
};

/**
 * Demonstrates text handling properties: word wrap, ellipsis, max lines, text break, and max width.
 *
 * **Key Points:**
 * - `data-tip-word-wrap` enables text wrapping for long content
 * - `data-tip-ellipsis` enables truncation with "..." - **required for maxLines to work**
 * - `data-tip-max-lines` sets the number of lines before truncation (only works with ellipsis)
 * - `data-tip-text-break` controls how words break: 'normal', 'break-all', 'keep-all'
 * - `data-tip-max-width` sets the maximum tooltip width in pixels
 */
export const TextHandling: SimpleStory = {
  render: () => {
    const longText =
      'This is a very long tooltip message that demonstrates how text wrapping and truncation work in React Tip Magic tooltips. It contains enough content to show multiple lines.';
    const urlText =
      'Visit https://example.com/very/long/path/to/some/resource/that/needs/to/break for more info';

    return (
      <TipMagicProvider>
        <div className="story-container">
          <p className="story-description">
            Compare different text handling behaviors. Hover over each button to see the effect.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '14px' }}>
              Word Wrap & Max Width
            </h4>
            <div className="story-button-group">
              <button className="story-button" data-tip={longText}>
                No wrap (default)
              </button>
              <button className="story-button" data-tip={longText} data-tip-word-wrap>
                Word wrap enabled
              </button>
              <button
                className="story-button"
                data-tip={longText}
                data-tip-word-wrap
                data-tip-max-width="200"
              >
                Max width: 200px
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '14px' }}>
              Ellipsis & Max Lines
            </h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
              ⚠️ <code>data-tip-max-lines</code> only works when <code>data-tip-ellipsis</code> is
              also set
            </p>
            <div className="story-button-group">
              <button
                className="story-button"
                data-tip={longText}
                data-tip-word-wrap
                data-tip-max-width="250"
              >
                No ellipsis
              </button>
              <button
                className="story-button"
                data-tip={longText}
                data-tip-ellipsis
                data-tip-max-width="250"
              >
                Ellipsis (1 line)
              </button>
              <button
                className="story-button"
                data-tip={longText}
                data-tip-ellipsis
                data-tip-max-lines="2"
                data-tip-max-width="250"
              >
                Ellipsis (2 lines)
              </button>
              <button
                className="story-button"
                data-tip={longText}
                data-tip-ellipsis
                data-tip-max-lines="3"
                data-tip-max-width="250"
              >
                Ellipsis (3 lines)
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '14px' }}>Text Break</h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
              Controls how long words/URLs break within the tooltip
            </p>
            <div className="story-button-group">
              <button
                className="story-button"
                data-tip={urlText}
                data-tip-word-wrap
                data-tip-max-width="200"
              >
                Normal (default)
              </button>
              <button
                className="story-button"
                data-tip={urlText}
                data-tip-word-wrap
                data-tip-max-width="200"
                data-tip-text-break="break-all"
              >
                Break-all (URLs)
              </button>
              <button
                className="story-button"
                data-tip="这是一个中文示例文本，用于测试keep-all断词模式"
                data-tip-word-wrap
                data-tip-max-width="200"
                data-tip-text-break="keep-all"
              >
                Keep-all (CJK)
              </button>
            </div>
          </div>
        </div>
      </TipMagicProvider>
    );
  },
};

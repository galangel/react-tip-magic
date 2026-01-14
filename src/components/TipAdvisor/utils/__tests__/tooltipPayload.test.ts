import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TipAdvisorItem } from '../../../../types/tipAdvisor';
import { buildTooltipPayload } from '../tooltipPayload';

describe('buildTooltipPayload', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function createItem(element: Element, content: string, shortcut: string): TipAdvisorItem {
    return {
      id: 'test-item',
      element,
      content,
      shortcut,
    };
  }

  it('should return payload with target element', () => {
    container.innerHTML = '<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '⌘C');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.target).toBe(element);
  });

  it('should use shortcut as content', () => {
    container.innerHTML = '<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '⌘C');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.content).toBe('⌘C');
  });

  it('should set parsedData content to shortcut', () => {
    container.innerHTML = '<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '⌘C');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.parsedData.content).toBe('⌘C');
  });

  it('should set parsedData shortcut to undefined', () => {
    container.innerHTML = '<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '⌘C');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.parsedData.shortcut).toBeUndefined();
  });

  it('should preserve other parsedData properties', () => {
    container.innerHTML =
      '<button data-tip="Copy" data-tip-shortcut="⌘C" data-tip-placement="bottom">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '⌘C');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.parsedData.placement).toBe('bottom');
  });

  it('should handle empty shortcut', () => {
    container.innerHTML = '<button data-tip="Copy" data-tip-shortcut="">Copy</button>';
    const element = container.querySelector('button')!;
    const item = createItem(element, 'Copy', '');

    const payload = buildTooltipPayload(item);

    expect(payload).not.toBeNull();
    expect(payload!.content).toBe('');
    expect(payload!.parsedData.content).toBe('');
  });

  it('should return null for items without element', () => {
    const item: TipAdvisorItem = {
      id: 'preset-item',
      content: 'Preset Action',
      shortcut: '⌘A',
      onSelect: () => {},
    };

    const payload = buildTooltipPayload(item);

    expect(payload).toBeNull();
  });
});

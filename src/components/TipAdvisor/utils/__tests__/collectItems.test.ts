import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collectElementItems, collectTipAdvisorItems, convertPresetItems } from '../collectItems';

describe('collectTipAdvisorItems', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should return empty array when no elements match selector', () => {
    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');
    expect(result).toEqual([]);
  });

  it('should collect elements with both data-tip and data-tip-shortcut', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
      <button data-tip="Paste" data-tip-shortcut="⌘V">Paste</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('Copy');
    expect(result[0].shortcut).toBe('⌘C');
    expect(result[1].content).toBe('Paste');
    expect(result[1].shortcut).toBe('⌘V');
  });

  it('should skip elements without data-tip-shortcut', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
      <button data-tip="No shortcut">Skip me</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Copy');
  });

  it('should use data-tip-id as id when provided', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C" data-tip-id="copy-btn">Copy</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('copy-btn');
  });

  it('should generate fallback id when data-tip-id not provided', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(1);
    expect(result[0].id).toMatch(/^tip-advisor-element-\d+$/);
  });

  it('should store reference to the element', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result[0].element).toBeInstanceOf(Element);
    expect(result[0].element?.textContent).toBe('Copy');
  });

  it('should work with custom selector', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C" class="toolbar-btn">Copy</button>
      <button data-tip="Paste" data-tip-shortcut="⌘V">Paste</button>
    `;

    const result = collectTipAdvisorItems('.toolbar-btn[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Copy');
  });

  it('should handle elements with empty content', () => {
    container.innerHTML = `
      <button data-tip="" data-tip-shortcut="⌘C">Copy</button>
    `;

    // Empty content should be skipped
    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');
    expect(result).toHaveLength(0);
  });

  it('should handle multiple elements in order', () => {
    container.innerHTML = `
      <button data-tip="Cut" data-tip-shortcut="⌘X">Cut</button>
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
      <button data-tip="Paste" data-tip-shortcut="⌘V">Paste</button>
    `;

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]');

    expect(result).toHaveLength(3);
    expect(result[0].content).toBe('Cut');
    expect(result[1].content).toBe('Copy');
    expect(result[2].content).toBe('Paste');
  });

  it('should return empty array when selector is null', () => {
    const result = collectTipAdvisorItems(null);
    expect(result).toEqual([]);
  });

  it('should return empty array when selector is empty string', () => {
    const result = collectTipAdvisorItems('');
    expect(result).toEqual([]);
  });

  it('should merge element items with preset items', () => {
    container.innerHTML = `
      <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
    `;

    const presetItems = [
      { id: 'preset-1', label: 'Preset Action', shortcut: '⌘P', onSelect: vi.fn() },
    ];

    const result = collectTipAdvisorItems('[data-tip][data-tip-shortcut]', presetItems);

    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('Copy');
    expect(result[1].content).toBe('Preset Action');
  });
});

describe('collectElementItems', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should return empty array when selector is null', () => {
    expect(collectElementItems(null)).toEqual([]);
  });

  it('should return empty array when selector is undefined', () => {
    expect(collectElementItems(undefined)).toEqual([]);
  });

  it('should return empty array when selector is empty string', () => {
    expect(collectElementItems('')).toEqual([]);
  });
});

describe('convertPresetItems', () => {
  it('should return empty array when presetItems is undefined', () => {
    expect(convertPresetItems(undefined)).toEqual([]);
  });

  it('should return empty array when presetItems is empty', () => {
    expect(convertPresetItems([])).toEqual([]);
  });

  it('should convert preset items to TipAdvisorItem format', () => {
    const onSelect = vi.fn();
    const presetItems = [
      { id: 'action-1', label: 'Action One', shortcut: '⌘1', onSelect },
      { id: 'action-2', label: 'Action Two', onSelect },
    ];

    const result = convertPresetItems(presetItems);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'action-1',
      content: 'Action One',
      shortcut: '⌘1',
      onSelect,
    });
    expect(result[1]).toEqual({
      id: 'action-2',
      content: 'Action Two',
      shortcut: undefined,
      onSelect,
    });
  });

  it('should preserve onSelect callback', () => {
    const onSelect = vi.fn();
    const presetItems = [{ id: 'test', label: 'Test', onSelect }];

    const result = convertPresetItems(presetItems);

    result[0].onSelect?.();
    expect(onSelect).toHaveBeenCalled();
  });
});

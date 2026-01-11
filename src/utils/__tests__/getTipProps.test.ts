import { describe, it, expect } from 'vitest';
import { getTipProps } from '../getTipProps';

describe('getTipProps', () => {
  describe('required properties', () => {
    it('should always include data-tip with content', () => {
      const result = getTipProps({ tip: 'Hello' });
      expect(result['data-tip']).toBe('Hello');
    });
  });

  describe('optional properties', () => {
    it('should include id when provided', () => {
      const result = getTipProps({ tip: 'Hello', id: 'my-tooltip' });
      expect(result['data-tip-id']).toBe('my-tooltip');
    });

    it('should not include id when not provided', () => {
      const result = getTipProps({ tip: 'Hello' });
      expect(result['data-tip-id']).toBeUndefined();
    });

    it('should include placement when provided', () => {
      const result = getTipProps({ tip: 'Hello', placement: 'bottom-start' });
      expect(result['data-tip-placement']).toBe('bottom-start');
    });

    it('should include showDelay as string', () => {
      const result = getTipProps({ tip: 'Hello', showDelay: 500 });
      expect(result['data-tip-delay']).toBe('500');
    });

    it('should include hideDelay as string', () => {
      const result = getTipProps({ tip: 'Hello', hideDelay: 1000 });
      expect(result['data-tip-hide-delay']).toBe('1000');
    });
  });

  describe('boolean properties', () => {
    it('should include disabled as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', disabled: true });
      expect(result['data-tip-disabled']).toBe('');
    });

    it('should not include disabled when false', () => {
      const result = getTipProps({ tip: 'Hello', disabled: false });
      expect(result['data-tip-disabled']).toBeUndefined();
    });

    it('should include ellipsis as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', ellipsis: true });
      expect(result['data-tip-ellipsis']).toBe('');
    });

    it('should include wordWrap as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', wordWrap: true });
      expect(result['data-tip-word-wrap']).toBe('');
    });

    it('should include html as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', html: true });
      expect(result['data-tip-html']).toBe('');
    });

    it('should include interactive as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', interactive: true });
      expect(result['data-tip-interactive']).toBe('');
    });

    it('should include showOnFocus as empty string when true', () => {
      const result = getTipProps({ tip: 'Hello', showOnFocus: true });
      expect(result['data-tip-show-on-focus']).toBe('');
    });
  });

  describe('textBreak property', () => {
    it('should not include textBreak when normal (default)', () => {
      const result = getTipProps({ tip: 'Hello', textBreak: 'normal' });
      expect(result['data-tip-text-break']).toBeUndefined();
    });

    it('should include textBreak when break-all', () => {
      const result = getTipProps({ tip: 'Hello', textBreak: 'break-all' });
      expect(result['data-tip-text-break']).toBe('break-all');
    });

    it('should include textBreak when keep-all', () => {
      const result = getTipProps({ tip: 'Hello', textBreak: 'keep-all' });
      expect(result['data-tip-text-break']).toBe('keep-all');
    });
  });

  describe('transitionBehavior property', () => {
    it('should include data-tip-move when behavior is move', () => {
      const result = getTipProps({ tip: 'Hello', transitionBehavior: 'move' });
      expect(result['data-tip-move']).toBe('');
      expect(result['data-tip-jump']).toBeUndefined();
    });

    it('should include data-tip-jump when behavior is jump', () => {
      const result = getTipProps({ tip: 'Hello', transitionBehavior: 'jump' });
      expect(result['data-tip-jump']).toBe('');
      expect(result['data-tip-move']).toBeUndefined();
    });
  });

  describe('showArrow property', () => {
    it('should include data-tip-no-arrow when showArrow is false', () => {
      const result = getTipProps({ tip: 'Hello', showArrow: false });
      expect(result['data-tip-no-arrow']).toBe('');
    });

    it('should not include data-tip-no-arrow when showArrow is true', () => {
      const result = getTipProps({ tip: 'Hello', showArrow: true });
      expect(result['data-tip-no-arrow']).toBeUndefined();
    });
  });

  describe('numeric properties as strings', () => {
    it('should convert maxLines to string', () => {
      const result = getTipProps({ tip: 'Hello', maxLines: 3 });
      expect(result['data-tip-max-lines']).toBe('3');
    });

    it('should convert maxWidth to string', () => {
      const result = getTipProps({ tip: 'Hello', maxWidth: 400 });
      expect(result['data-tip-max-width']).toBe('400');
    });

    it('should convert moveTransitionDuration to string', () => {
      const result = getTipProps({ tip: 'Hello', moveTransitionDuration: 200 });
      expect(result['data-tip-move-duration']).toBe('200');
    });
  });

  describe('contentSeparator property', () => {
    it('should include separator when provided', () => {
      const result = getTipProps({ tip: 'Hello', contentSeparator: '|' });
      expect(result['data-tip-separator']).toBe('|');
    });
  });

  describe('complex scenarios', () => {
    it('should handle all properties together', () => {
      const result = getTipProps({
        tip: 'Save; ⌘S',
        id: 'save-btn',
        placement: 'bottom',
        showDelay: 100,
        hideDelay: 500,
        ellipsis: true,
        maxLines: 2,
        wordWrap: true,
        maxWidth: 250,
        interactive: true,
        transitionBehavior: 'move',
        moveTransitionDuration: 150,
      });

      expect(result['data-tip']).toBe('Save; ⌘S');
      expect(result['data-tip-id']).toBe('save-btn');
      expect(result['data-tip-placement']).toBe('bottom');
      expect(result['data-tip-delay']).toBe('100');
      expect(result['data-tip-hide-delay']).toBe('500');
      expect(result['data-tip-ellipsis']).toBe('');
      expect(result['data-tip-max-lines']).toBe('2');
      expect(result['data-tip-word-wrap']).toBe('');
      expect(result['data-tip-max-width']).toBe('250');
      expect(result['data-tip-interactive']).toBe('');
      expect(result['data-tip-move']).toBe('');
      expect(result['data-tip-move-duration']).toBe('150');
    });
  });
});

import { describe, expect, it } from 'vitest';
import { haveSameTooltipOptions } from '../tooltipOptions';

describe('haveSameTooltipOptions', () => {
  it('should ignore content and owner', () => {
    expect(
      haveSameTooltipOptions(
        { placement: 'top', content: 'a', owner: {} },
        { placement: 'top', content: 'b', owner: {} }
      )
    ).toBe(true);
  });

  it('should notice a changed option', () => {
    expect(haveSameTooltipOptions({ placement: 'top' }, { placement: 'right' })).toBe(false);
    expect(haveSameTooltipOptions({ maxWidth: 300 }, { maxWidth: 480 })).toBe(false);
  });

  it('should notice an option set on one side only', () => {
    expect(haveSameTooltipOptions({}, { showArrow: false })).toBe(false);
    expect(haveSameTooltipOptions({ ariaLabelledBy: 'x' }, {})).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { generateTooltipId } from '../parseDataAttributes';

describe('generateTooltipId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateTooltipId();
    const id2 = generateTooltipId();
    const id3 = generateTooltipId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate IDs with tip-magic prefix', () => {
    const id = generateTooltipId();
    expect(id).toMatch(/^tip-magic-\d+$/);
  });
});

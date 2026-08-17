import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../escapeHtml';

describe('escapeHtml', () => {
  it('should escape all HTML-significant characters', () => {
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('>')).toBe('&gt;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#39;');
  });

  it('should leave plain text untouched', () => {
    expect(escapeHtml('Signed in as Ada Lovelace')).toBe('Signed in as Ada Lovelace');
  });

  it('should neutralize a script tag', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('should neutralize an attribute break-out', () => {
    expect(escapeHtml('x" onerror="alert(1)')).toBe('x&quot; onerror=&quot;alert(1)');
  });

  it('should escape ampersands before the entities they introduce', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('should handle an empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

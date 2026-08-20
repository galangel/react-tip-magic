import { afterEach, describe, expect, it } from 'vitest';
import { resolveAutoFocusTarget } from '../autoFocusTarget';

describe('resolveAutoFocusTarget', () => {
  let panel: HTMLElement;
  let primary: HTMLElement;
  let secondary: HTMLElement;

  const build = (withPrimary = true) => {
    document.body.innerHTML = `
      <button id="outside">Outside</button>
      <div id="panel" tabindex="-1">
        <button id="secondary" data-tour-action="prev">Back</button>
        ${withPrimary ? '<button id="primary" data-tip-magic-primary>Next</button>' : ''}
      </div>
    `;
    panel = document.getElementById('panel') as HTMLElement;
    primary = document.getElementById('primary') as HTMLElement;
    secondary = document.getElementById('secondary') as HTMLElement;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('false', () => {
    it('never returns a target', () => {
      build();
      expect(resolveAutoFocusTarget(panel, false, null)).toBeNull();
      expect(resolveAutoFocusTarget(panel, false, primary)).toBeNull();
    });
  });

  describe("'panel'", () => {
    it('returns the panel when focus is elsewhere', () => {
      build();
      const outside = document.getElementById('outside');
      expect(resolveAutoFocusTarget(panel, 'panel', outside)).toBe(panel);
      expect(resolveAutoFocusTarget(panel, 'panel', null)).toBe(panel);
    });

    it('leaves focus alone when it is already inside the panel', () => {
      build();
      expect(resolveAutoFocusTarget(panel, 'panel', panel)).toBeNull();
      expect(resolveAutoFocusTarget(panel, 'panel', secondary)).toBeNull();
      expect(resolveAutoFocusTarget(panel, 'panel', primary)).toBeNull();
    });
  });

  describe("'primary'", () => {
    it('returns the marked element', () => {
      build();
      expect(resolveAutoFocusTarget(panel, 'primary', null)).toBe(primary);
    });

    it('returns the marked element even when focus is on the panel', () => {
      build();
      expect(resolveAutoFocusTarget(panel, 'primary', panel)).toBe(primary);
    });

    it('takes focus from another control inside the panel', () => {
      build();
      expect(resolveAutoFocusTarget(panel, 'primary', secondary)).toBe(primary);
    });

    it('returns null when the marked element already has focus', () => {
      build();
      expect(resolveAutoFocusTarget(panel, 'primary', primary)).toBeNull();
    });

    it('falls back to the panel when nothing is marked', () => {
      build(false);
      expect(resolveAutoFocusTarget(panel, 'primary', null)).toBe(panel);
    });

    it('falls back to leaving focus alone when nothing is marked and focus is inside', () => {
      build(false);
      expect(resolveAutoFocusTarget(panel, 'primary', secondary)).toBeNull();
    });

    it('never picks the close button', () => {
      document.body.innerHTML =
        '<div id="panel" tabindex="-1"><button id="close" data-tour-action="close">x</button></div>';
      const onlyClose = document.getElementById('panel') as HTMLElement;

      expect(resolveAutoFocusTarget(onlyClose, 'primary', null)).toBe(onlyClose);
    });

    it('uses the first marked element when content marks several', () => {
      document.body.innerHTML =
        '<div id="panel" tabindex="-1">' +
        '<button id="first" data-tip-magic-primary>A</button>' +
        '<button id="second" data-tip-magic-primary>B</button>' +
        '</div>';
      const multi = document.getElementById('panel') as HTMLElement;

      expect(resolveAutoFocusTarget(multi, 'primary', null)).toBe(document.getElementById('first'));
    });
  });
});

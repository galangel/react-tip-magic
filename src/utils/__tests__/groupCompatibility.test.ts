import { describe, it, expect } from 'vitest';
import { areGroupsCompatible, shouldAnimatePosition } from '../groupCompatibility';

describe('areGroupsCompatible', () => {
  describe('same group', () => {
    it('should return true when both groups are the same', () => {
      expect(areGroupsCompatible('nav', 'nav')).toBe(true);
      expect(areGroupsCompatible('sidebar', 'sidebar')).toBe(true);
    });
  });

  describe('both undefined', () => {
    it('should return true when both groups are undefined', () => {
      expect(areGroupsCompatible(undefined, undefined)).toBe(true);
    });
  });

  describe('one has group, one does not', () => {
    it('should return true when current has group, previous does not', () => {
      expect(areGroupsCompatible('nav', undefined)).toBe(true);
    });

    it('should return true when previous has group, current does not', () => {
      expect(areGroupsCompatible(undefined, 'nav')).toBe(true);
    });
  });

  describe('different groups', () => {
    it('should return false when groups are different', () => {
      expect(areGroupsCompatible('nav', 'sidebar')).toBe(false);
      expect(areGroupsCompatible('header', 'footer')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as a valid group', () => {
      expect(areGroupsCompatible('', '')).toBe(true);
      expect(areGroupsCompatible('', 'nav')).toBe(false);
    });
  });
});

describe('shouldAnimatePosition', () => {
  describe('all conditions met', () => {
    it('should return true when all conditions are met', () => {
      expect(shouldAnimatePosition(true, true, 'move', true)).toBe(true);
    });
  });

  describe('hasBeenPositioned is false', () => {
    it('should return false when not yet positioned', () => {
      expect(shouldAnimatePosition(false, true, 'move', true)).toBe(false);
    });
  });

  describe('isTransitioning is false', () => {
    it('should return false when not transitioning', () => {
      expect(shouldAnimatePosition(true, false, 'move', true)).toBe(false);
    });
  });

  describe('transitionBehavior is jump', () => {
    it('should return false when behavior is jump', () => {
      expect(shouldAnimatePosition(true, true, 'jump', true)).toBe(false);
    });
  });

  describe('groups are incompatible', () => {
    it('should return false when groups are incompatible', () => {
      expect(shouldAnimatePosition(true, true, 'move', false)).toBe(false);
    });
  });

  describe('multiple conditions not met', () => {
    it('should return false when multiple conditions fail', () => {
      expect(shouldAnimatePosition(false, false, 'jump', false)).toBe(false);
      expect(shouldAnimatePosition(true, false, 'jump', true)).toBe(false);
    });
  });
});

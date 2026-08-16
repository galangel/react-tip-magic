import { describe, it, expect } from 'vitest';
import type { ProgressOptions, TourNavigation, TourStep } from '../../../types/tour';
import { DEFAULT_NAVIGATION } from '../constants';
import {
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveFocus,
} from '../utils/tourNavigation';

describe('tourNavigation utilities', () => {
  describe('getMergedNavigation', () => {
    it('should return defaults when no overrides provided', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const result = getMergedNavigation(undefined, step);
      expect(result).toEqual(DEFAULT_NAVIGATION);
    });

    it('should merge tour-level config with defaults', () => {
      const tourNav: TourNavigation = {
        showControls: true,
        nextLabel: 'Continue',
      };
      const step: TourStep = { target: 'step1', content: 'Content' };

      const result = getMergedNavigation(tourNav, step);
      expect(result).toEqual({
        ...DEFAULT_NAVIGATION,
        showControls: true,
        nextLabel: 'Continue',
      });
    });

    it('should override tour-level with step-level config', () => {
      const tourNav: TourNavigation = {
        showControls: true,
        nextLabel: 'Continue',
        backLabel: 'Go Back',
      };
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        navigation: {
          nextLabel: 'Step-specific Next',
          finishLabel: 'Done!',
        },
      };

      const result = getMergedNavigation(tourNav, step);
      expect(result.showControls).toBe(true); // from tour
      expect(result.nextLabel).toBe('Step-specific Next'); // overridden by step
      expect(result.backLabel).toBe('Go Back'); // from tour
      expect(result.finishLabel).toBe('Done!'); // from step
      expect(result.showClose).toBe(true); // from defaults
    });

    it('should handle step-level only overrides', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        navigation: {
          showControls: true,
          showClose: false,
        },
      };

      const result = getMergedNavigation(undefined, step);
      expect(result.showControls).toBe(true);
      expect(result.showClose).toBe(false);
      expect(result.nextLabel).toBe('Next'); // default
    });
  });

  describe('getMergedProgress', () => {
    it('should return defaults when no options provided', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const result = getMergedProgress(undefined, step);

      expect(result.show).toBe(false);
      expect(result.type).toBe('steps');
      expect(result.render).toBeUndefined();
    });

    it('should use tour-level progress options', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const tourProgress: ProgressOptions = { show: true, type: 'ring' };
      const result = getMergedProgress(tourProgress, step);

      expect(result.show).toBe(true);
      expect(result.type).toBe('ring');
    });

    it('should override with step-level progress options', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        progress: { show: false, type: 'steps' },
      };
      const tourProgress: ProgressOptions = { show: true, type: 'ring' };
      const result = getMergedProgress(tourProgress, step);

      expect(result.show).toBe(false);
      expect(result.type).toBe('steps');
    });

    it('should support custom render function', () => {
      const customRender = ({
        currentStep,
        totalSteps,
      }: {
        currentStep: number;
        totalSteps: number;
      }) => `${currentStep}/${totalSteps}`;
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        progress: { render: customRender },
      };
      const result = getMergedProgress({ show: true }, step);

      expect(result.show).toBe(true);
      expect(result.render).toBe(customRender);
    });

    it('should partially override step options', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        progress: { show: false }, // Only override show, keep type from tour
      };
      const tourProgress: ProgressOptions = { show: true, type: 'ring' };
      const result = getMergedProgress(tourProgress, step);

      expect(result.show).toBe(false);
      expect(result.type).toBe('ring'); // Kept from tour level
    });
  });

  describe('hasNavigationFeatures', () => {
    it('should return false when no features enabled', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: false, showClose: false };
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(hasNavigationFeatures(nav, step)).toBe(false);
    });

    it('should return true when showControls is true', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: true };
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(hasNavigationFeatures(nav, step)).toBe(true);
    });

    it('should return true when showClose is true', () => {
      const nav = { ...DEFAULT_NAVIGATION, showClose: true };
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(hasNavigationFeatures(nav, step)).toBe(true);
    });

    it('should return true when step has image', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: false, showClose: false };
      const step: TourStep = { target: 'step1', content: 'Content', image: 'image.png' };

      expect(hasNavigationFeatures(nav, step)).toBe(true);
    });

    it('should return true when step has video', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: false, showClose: false };
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'video.mp4' },
      };

      expect(hasNavigationFeatures(nav, step)).toBe(true);
    });

    it('should return true when showProgress is true', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: false, showClose: false };
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(hasNavigationFeatures(nav, step, true)).toBe(true);
    });

    it('should return false when showProgress is false and no other features', () => {
      const nav = { ...DEFAULT_NAVIGATION, showControls: false, showClose: false };
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(hasNavigationFeatures(nav, step, false)).toBe(false);
    });
  });

  describe('resolveFocus', () => {
    const step: TourStep = { target: 'step1', content: 'Content' };

    it('should resolve a disabled backdrop', () => {
      expect(resolveFocus(false, step)).toEqual({
        enabled: false,
        block: false,
        dismissOnClick: false,
      });
    });

    it('should resolve a purely visual backdrop for `true`', () => {
      expect(resolveFocus(true, step)).toEqual({
        enabled: true,
        block: false,
        dismissOnClick: false,
      });
    });

    it('should enable the backdrop when given an options object', () => {
      expect(resolveFocus({ block: true }, step)).toEqual({
        enabled: true,
        block: true,
        dismissOnClick: false,
      });
    });

    it('should resolve dismissOnClick', () => {
      expect(resolveFocus({ dismissOnClick: true }, step)).toEqual({
        enabled: true,
        block: false,
        dismissOnClick: true,
      });
    });

    it('should treat an empty options object as enabled with defaults', () => {
      expect(resolveFocus({}, step)).toEqual({
        enabled: true,
        block: false,
        dismissOnClick: false,
      });
    });

    it('should let a step override the tour-level setting', () => {
      const overriding: TourStep = { ...step, focus: { block: true } };

      expect(resolveFocus(false, overriding)).toEqual({
        enabled: true,
        block: true,
        dismissOnClick: false,
      });
    });

    it('should let a step opt out of a tour-level backdrop', () => {
      const overriding: TourStep = { ...step, focus: false };

      expect(resolveFocus(true, overriding).enabled).toBe(false);
    });
  });
});

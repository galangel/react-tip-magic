import { describe, it, expect } from 'vitest';
import type { ProgressOptions, TourNavigation, TourStep } from '../../../types/tour';
import { DEFAULT_NAVIGATION } from '../constants';
import {
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  shouldShowFocus,
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

  describe('shouldShowFocus', () => {
    it('should return tour focus when step focus is undefined', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };

      expect(shouldShowFocus(true, step)).toBe(true);
      expect(shouldShowFocus(false, step)).toBe(false);
    });

    it('should override with step focus when defined', () => {
      const stepWithFocus: TourStep = { target: 'step1', content: 'Content', focus: true };
      const stepWithoutFocus: TourStep = { target: 'step1', content: 'Content', focus: false };

      // Step focus overrides tour focus
      expect(shouldShowFocus(false, stepWithFocus)).toBe(true);
      expect(shouldShowFocus(true, stepWithoutFocus)).toBe(false);
    });

    it('should handle explicit false step focus', () => {
      const step: TourStep = { target: 'step1', content: 'Content', focus: false };
      expect(shouldShowFocus(true, step)).toBe(false);
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
});

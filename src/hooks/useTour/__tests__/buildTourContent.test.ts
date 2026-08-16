import { describe, it, expect } from 'vitest';
import type { CurrentTourStep, TourNavigation, TourStep } from '../../../types/tour';
import { DEFAULT_NAVIGATION, TOUR_CSS_CLASSES, TOUR_ELEMENT_IDS } from '../constants';
import {
  buildFooterHtml,
  buildHeaderHtml,
  buildMediaHtml,
  buildNavHtml,
  buildProgressHtml,
  buildRingProgressHtml,
  buildStepsProgressHtml,
  buildTourContent,
} from '../utils/buildTourContent';
import type { ResolvedProgressOptions } from '../utils/tourNavigation';

describe('buildTourContent utilities', () => {
  describe('buildMediaHtml', () => {
    it('should return empty string when no media', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      expect(buildMediaHtml(step)).toBe('');
    });

    it('should build image HTML', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        image: 'https://example.com/image.png',
      };

      const result = buildMediaHtml(step);
      expect(result).toContain(TOUR_CSS_CLASSES.IMAGE);
      expect(result).toContain('src="https://example.com/image.png"');
      expect(result).toContain('<img');
    });

    it('should build native video HTML with defaults', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'video.mp4' },
      };

      const result = buildMediaHtml(step);
      expect(result).toContain(TOUR_CSS_CLASSES.VIDEO);
      expect(result).not.toContain(TOUR_CSS_CLASSES.VIDEO_EMBED);
      expect(result).toContain('<video');
      expect(result).toContain('autoplay');
      expect(result).toContain('loop');
      expect(result).toContain('muted');
      expect(result).toContain('playsinline');
    });

    it('should build native video HTML without autoplay', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'video.mp4', autoplay: false },
      };

      const result = buildMediaHtml(step);
      expect(result).not.toContain('autoplay');
      expect(result).toContain('loop');
      expect(result).toContain('muted');
    });

    it('should build embed video HTML', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'https://youtube.com/embed/abc', type: 'embed' },
      };

      const result = buildMediaHtml(step);
      expect(result).toContain(TOUR_CSS_CLASSES.VIDEO);
      expect(result).toContain(TOUR_CSS_CLASSES.VIDEO_EMBED);
      expect(result).toContain('<iframe');
      expect(result).toContain('src="https://youtube.com/embed/abc"');
    });

    it('should prefer video over image when both provided', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        image: 'image.png',
        video: { src: 'video.mp4' },
      };

      const result = buildMediaHtml(step);
      expect(result).toContain('<video');
      expect(result).not.toContain('<img');
    });
  });

  describe('buildHeaderHtml', () => {
    it('should return empty string when no title and showClose is false', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showClose: false };

      expect(buildHeaderHtml(step, nav)).toBe('');
    });

    it('should build header with title only', () => {
      const step: TourStep = { target: 'step1', content: 'Content', title: 'My Title' };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showClose: false };

      const result = buildHeaderHtml(step, nav);
      expect(result).toContain(TOUR_CSS_CLASSES.HEADER);
      expect(result).toContain(TOUR_CSS_CLASSES.TITLE);
      expect(result).toContain('My Title');
      expect(result).not.toContain(TOUR_CSS_CLASSES.CLOSE);
    });

    it('should build header with close button only', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showClose: true };

      const result = buildHeaderHtml(step, nav);
      expect(result).toContain(TOUR_CSS_CLASSES.HEADER);
      expect(result).toContain(TOUR_CSS_CLASSES.CLOSE);
      expect(result).toContain('data-tour-action="close"');
    });

    it('should build header with both title and close button', () => {
      const step: TourStep = { target: 'step1', content: 'Content', title: 'Title' };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showClose: true };

      const result = buildHeaderHtml(step, nav);
      expect(result).toContain(TOUR_CSS_CLASSES.TITLE);
      expect(result).toContain('Title');
      expect(result).toContain(TOUR_CSS_CLASSES.CLOSE);
    });
  });

  describe('buildNavHtml', () => {
    it('should return empty string when showControls is false', () => {
      const stepInfo: CurrentTourStep = {
        index: 0,
        target: 'step1',
        content: 'Content',
        isFirst: true,
        isLast: false,
        total: 3,
      };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showControls: false };

      expect(buildNavHtml(stepInfo, nav)).toBe('');
    });

    it('should hide back button on first step', () => {
      const stepInfo: CurrentTourStep = {
        index: 0,
        target: 'step1',
        content: 'Content',
        isFirst: true,
        isLast: false,
        total: 3,
      };
      const nav: Required<TourNavigation> = { ...DEFAULT_NAVIGATION, showControls: true };

      const result = buildNavHtml(stepInfo, nav);
      expect(result).toContain(TOUR_CSS_CLASSES.NAV);
      expect(result).not.toContain(TOUR_CSS_CLASSES.BTN_BACK);
      expect(result).toContain(TOUR_CSS_CLASSES.BTN_NEXT);
      expect(result).toContain('data-tour-action="next"');
    });

    it('should show both buttons on middle step', () => {
      const stepInfo: CurrentTourStep = {
        index: 1,
        target: 'step2',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 3,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
        backLabel: 'Back',
        nextLabel: 'Next',
      };

      const result = buildNavHtml(stepInfo, nav);
      expect(result).toContain(TOUR_CSS_CLASSES.BTN_BACK);
      expect(result).toContain(TOUR_CSS_CLASSES.BTN_NEXT);
      expect(result).toContain('data-tour-action="prev"');
      expect(result).toContain('data-tour-action="next"');
      expect(result).toContain('Back');
      expect(result).toContain('Next');
    });

    it('should show finish button on last step', () => {
      const stepInfo: CurrentTourStep = {
        index: 2,
        target: 'step3',
        content: 'Content',
        isFirst: false,
        isLast: true,
        total: 3,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
        finishLabel: 'Done!',
      };

      const result = buildNavHtml(stepInfo, nav);
      expect(result).toContain('data-tour-action="finish"');
      expect(result).toContain('Done!');
    });
  });

  describe('buildTourContent', () => {
    it('should return simple content when no features enabled', () => {
      const step: TourStep = { target: 'step1', content: 'Simple content' };
      const stepInfo: CurrentTourStep = {
        index: 0,
        target: 'step1',
        content: 'Simple content',
        isFirst: true,
        isLast: true,
        total: 1,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
        showClose: false,
      };

      const result = buildTourContent(step, stepInfo, nav, 'Simple content');
      expect(result).toBe('Simple content');
    });

    it('should build full content with all features', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        title: 'Title',
        image: 'image.png',
      };
      const stepInfo: CurrentTourStep = {
        index: 1,
        target: 'step1',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 3,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
        showClose: true,
      };

      const result = buildTourContent(step, stepInfo, nav, 'Content');
      expect(result).toContain(TOUR_CSS_CLASSES.CONTENT);
      expect(result).toContain(TOUR_CSS_CLASSES.HEADER);
      expect(result).toContain(TOUR_CSS_CLASSES.TITLE);
      expect(result).toContain(TOUR_CSS_CLASSES.CLOSE);
      expect(result).toContain(TOUR_CSS_CLASSES.IMAGE);
      expect(result).toContain(TOUR_CSS_CLASSES.BODY);
      expect(result).toContain(TOUR_CSS_CLASSES.MESSAGE);
      expect(result).toContain(TOUR_CSS_CLASSES.NAV);
    });

    it('should include progress when progress options show is true', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const stepInfo: CurrentTourStep = {
        index: 1,
        target: 'step1',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 5,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
        showClose: false,
      };
      const progressOptions: ResolvedProgressOptions = { show: true, type: 'steps' };

      const result = buildTourContent(step, stepInfo, nav, 'Content', progressOptions);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).toContain('Step 2 of 5');
    });

    it('should include both progress and nav in footer', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const stepInfo: CurrentTourStep = {
        index: 2,
        target: 'step1',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 6,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
      };
      const progressOptions: ResolvedProgressOptions = { show: true, type: 'steps' };

      const result = buildTourContent(step, stepInfo, nav, 'Content', progressOptions);
      expect(result).toContain(TOUR_CSS_CLASSES.FOOTER);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).toContain(TOUR_CSS_CLASSES.NAV);
      expect(result).toContain('Step 3 of 6');
    });

    it('should use ring progress type', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const stepInfo: CurrentTourStep = {
        index: 1,
        target: 'step1',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 4,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
        showClose: false,
      };
      const progressOptions: ResolvedProgressOptions = { show: true, type: 'ring' };

      const result = buildTourContent(step, stepInfo, nav, 'Content', progressOptions);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS_RING);
      expect(result).toContain('2/4');
    });

    it('should use custom render function', () => {
      const step: TourStep = { target: 'step1', content: 'Content' };
      const stepInfo: CurrentTourStep = {
        index: 2,
        target: 'step1',
        content: 'Content',
        isFirst: false,
        isLast: false,
        total: 5,
      };
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
        showClose: false,
      };
      const progressOptions: ResolvedProgressOptions = {
        show: true,
        type: 'steps',
        render: ({ currentStep, totalSteps }) =>
          `<span>Custom: ${currentStep}/${totalSteps}</span>`,
      };

      const result = buildTourContent(step, stepInfo, nav, 'Content', progressOptions);
      expect(result).toContain('Custom: 3/5');
    });
  });

  describe('buildStepsProgressHtml', () => {
    it('should build text progress indicator', () => {
      const result = buildStepsProgressHtml(1, 5);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).toContain('Step 1 of 5');
    });

    it('should show correct progress for middle step', () => {
      const result = buildStepsProgressHtml(3, 5);
      expect(result).toContain('Step 3 of 5');
    });
  });

  describe('buildRingProgressHtml', () => {
    it('should build ring progress indicator with SVG', () => {
      const result = buildRingProgressHtml(2, 4);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS_RING);
      expect(result).toContain('<svg');
      expect(result).toContain('2/4');
    });

    it('should calculate correct dash offset for progress', () => {
      const result = buildRingProgressHtml(1, 4);
      expect(result).toContain('stroke-dashoffset');
    });
  });

  describe('buildProgressHtml', () => {
    const stepInfo: CurrentTourStep = {
      index: 1,
      target: 'step1',
      content: 'Content',
      isFirst: false,
      isLast: false,
      total: 5,
    };

    it('should use steps type by default', () => {
      const options: ResolvedProgressOptions = { show: true, type: 'steps' };
      const result = buildProgressHtml(stepInfo, options);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).toContain('Step 2 of 5');
    });

    it('should use ring type when specified', () => {
      const options: ResolvedProgressOptions = { show: true, type: 'ring' };
      const result = buildProgressHtml(stepInfo, options);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS_RING);
      expect(result).toContain('2/5');
    });

    it('should use custom render function when provided', () => {
      const options: ResolvedProgressOptions = {
        show: true,
        type: 'steps',
        render: ({ currentStep, totalSteps }) => `<span>${currentStep}/${totalSteps}</span>`,
      };
      const result = buildProgressHtml(stepInfo, options);
      expect(result).toContain('2/5');
    });
  });

  describe('buildFooterHtml', () => {
    const stepInfo: CurrentTourStep = {
      index: 1,
      target: 'step1',
      content: 'Content',
      isFirst: false,
      isLast: false,
      total: 3,
    };

    it('should return empty string when no progress and no navigation', () => {
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
      };

      const result = buildFooterHtml(stepInfo, nav, null);
      expect(result).toBe('');
    });

    it('should return just nav when no progress', () => {
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
      };

      const result = buildFooterHtml(stepInfo, nav, null);
      expect(result).toContain(TOUR_CSS_CLASSES.NAV);
      expect(result).not.toContain(TOUR_CSS_CLASSES.FOOTER);
      expect(result).not.toContain(TOUR_CSS_CLASSES.PROGRESS);
    });

    it('should return footer with just progress when no navigation', () => {
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: false,
      };
      const progressOptions: ResolvedProgressOptions = { show: true, type: 'steps' };

      const result = buildFooterHtml(stepInfo, nav, progressOptions);
      expect(result).toContain(TOUR_CSS_CLASSES.FOOTER);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).not.toContain(TOUR_CSS_CLASSES.NAV);
    });

    it('should return footer with both progress and navigation', () => {
      const nav: Required<TourNavigation> = {
        ...DEFAULT_NAVIGATION,
        showControls: true,
      };
      const progressOptions: ResolvedProgressOptions = { show: true, type: 'steps' };

      const result = buildFooterHtml(stepInfo, nav, progressOptions);
      expect(result).toContain(TOUR_CSS_CLASSES.FOOTER);
      expect(result).toContain(TOUR_CSS_CLASSES.PROGRESS);
      expect(result).toContain(TOUR_CSS_CLASSES.NAV);
    });
  });

  describe('escaping', () => {
    it('should escape the step title', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        title: '<img src=x onerror="alert(1)">',
      };

      const result = buildHeaderHtml(step, DEFAULT_NAVIGATION);
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('should give the title an id for aria-labelledby', () => {
      const step: TourStep = { target: 'step1', content: 'Content', title: 'Welcome' };

      expect(buildHeaderHtml(step, DEFAULT_NAVIGATION)).toContain(`id="${TOUR_ELEMENT_IDS.TITLE}"`);
    });

    it('should escape an image src so it cannot break out of the attribute', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        image: 'x.png" onerror="alert(1)',
      };

      const result = buildMediaHtml(step);
      expect(result).not.toContain('onerror="alert(1)"');
      expect(result).toContain('&quot;');
    });

    it('should escape a native video src', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'clip.mp4" onerror="alert(1)' },
      };

      expect(buildMediaHtml(step)).not.toContain('onerror="alert(1)"');
    });

    it('should escape an embed video src', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'https://example.com/v"><script>', type: 'embed' },
      };

      expect(buildMediaHtml(step)).not.toContain('<script>');
    });

    it('should use a spec-compliant semicolon-separated allow list on embeds', () => {
      const step: TourStep = {
        target: 'step1',
        content: 'Content',
        video: { src: 'https://example.com/v', type: 'embed' },
      };

      expect(buildMediaHtml(step)).toContain('allow="accelerometer; autoplay;');
    });
  });
});

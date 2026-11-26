import { memo, useSyncExternalStore, type CSSProperties } from 'react';
import { PRIMARY_ACTION_ATTRIBUTE } from '../../constants';
import type { CurrentTourStep, TourNavigation, TourStep } from '../../types/tour';
import { TOUR_ACTIONS, TOUR_CSS_CLASSES, TOUR_DATA_ATTRIBUTES } from './constants';
import { getProgressRingGeometry, type TourPanelStore } from './utils';
import type { ResolvedProgressOptions, ResolvedStepBody } from './utils';

/**
 * Props for {@link TourPanel}
 */
export interface TourPanelProps {
  /** The step being shown - its title and media */
  step: TourStep;
  /** Where the step sits in the tour */
  stepInfo: CurrentTourStep;
  /** Navigation config, merged for this step */
  navigation: Required<TourNavigation>;
  /** The step's body, resolved */
  body: ResolvedStepBody;
  /** Progress config, merged for this step */
  progress: ResolvedProgressOptions;
  /** id for the title, which the panel's `aria-labelledby` points at */
  titleId?: string;
  /** id for the message, which labels the panel when the step has no title */
  messageId?: string;
}

type TourAction = (typeof TOUR_ACTIONS)[keyof typeof TOUR_ACTIONS];

const EMBED_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

const DEFAULT_EMBED_TITLE = 'Tour video';

/** Leaves custom progress markup laid out as direct children of the footer */
const CUSTOM_PROGRESS_STYLE: CSSProperties = { display: 'contents' };

/**
 * Keep the `muted` attribute in step with the prop. React only sets the property, and iOS
 * Safari's autoplay policy reads the attribute, which `defaultMuted` reflects.
 */
const markMuted = (video: HTMLVideoElement | null) => {
  if (video) video.defaultMuted = true;
};

const markUnmuted = (video: HTMLVideoElement | null) => {
  if (video) video.defaultMuted = false;
};

const actionAttribute = (action: TourAction) => ({ [TOUR_DATA_ATTRIBUTES.ACTION]: action });

/**
 * Markup from an HTML string.
 *
 * Memoised on its props so the subtree survives re-renders - see CLAUDE.md,
 * "dangerouslySetInnerHTML is re-applied on every render".
 */
const RawHtml = memo(function RawHtml({
  html,
  id,
  className,
  style,
}: {
  html: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div id={id} className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />
  );
});

function TourMedia({ image, video }: Pick<TourStep, 'image' | 'video'>) {
  if (video) {
    const {
      src,
      type = 'native',
      autoplay = true,
      loop = true,
      muted = true,
      title = DEFAULT_EMBED_TITLE,
    } = video;

    if (type === 'embed') {
      return (
        <div className={`${TOUR_CSS_CLASSES.VIDEO} ${TOUR_CSS_CLASSES.VIDEO_EMBED}`}>
          <iframe src={src} title={title} frameBorder="0" allow={EMBED_ALLOW} allowFullScreen />
        </div>
      );
    }

    return (
      <div className={TOUR_CSS_CLASSES.VIDEO}>
        {/* Keyed on src: React does not reload a <video> whose <source> changes */}
        <video
          key={src}
          ref={muted ? markMuted : markUnmuted}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (image) {
    return (
      <div className={TOUR_CSS_CLASSES.IMAGE}>
        <img src={image} alt="" />
      </div>
    );
  }

  return null;
}

function RingProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const { size, center, radius, circumference, dashOffset } = getProgressRingGeometry(
    currentStep,
    totalSteps
  );

  return (
    <div className={TOUR_CSS_CLASSES.PROGRESS_RING}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className={TOUR_CSS_CLASSES.PROGRESS_RING_BG} cx={center} cy={center} r={radius} />
        <circle
          className={TOUR_CSS_CLASSES.PROGRESS_RING_FILL}
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className={TOUR_CSS_CLASSES.PROGRESS_RING_TEXT}>{`${currentStep}/${totalSteps}`}</span>
    </div>
  );
}

function TourProgressIndicator({
  stepInfo,
  progress,
}: {
  stepInfo: CurrentTourStep;
  progress: ResolvedProgressOptions;
}) {
  const currentStep = stepInfo.index + 1;
  const totalSteps = stepInfo.total;

  if (progress.render) {
    return (
      <RawHtml html={progress.render({ currentStep, totalSteps })} style={CUSTOM_PROGRESS_STYLE} />
    );
  }

  if (progress.type === 'ring') {
    return <RingProgress currentStep={currentStep} totalSteps={totalSteps} />;
  }

  return <div className={TOUR_CSS_CLASSES.PROGRESS}>{`Step ${currentStep} of ${totalSteps}`}</div>;
}

function TourNav({
  stepInfo,
  navigation,
}: {
  stepInfo: CurrentTourStep;
  navigation: Required<TourNavigation>;
}) {
  return (
    <div className={TOUR_CSS_CLASSES.NAV}>
      {!stepInfo.isFirst && (
        <button
          type="button"
          className={`${TOUR_CSS_CLASSES.BTN} ${TOUR_CSS_CLASSES.BTN_BACK}`}
          {...actionAttribute(TOUR_ACTIONS.PREV)}
        >
          {navigation.backLabel}
        </button>
      )}
      <button
        type="button"
        className={`${TOUR_CSS_CLASSES.BTN} ${TOUR_CSS_CLASSES.BTN_NEXT}`}
        {...actionAttribute(stepInfo.isLast ? TOUR_ACTIONS.FINISH : TOUR_ACTIONS.NEXT)}
        {...{ [PRIMARY_ACTION_ATTRIBUTE]: '' }}
      >
        {stepInfo.isLast ? navigation.finishLabel : navigation.nextLabel}
      </button>
    </div>
  );
}

function TourMessage({ body, id }: { body: ResolvedStepBody; id?: string }) {
  if (body.kind === 'html') {
    return <RawHtml html={body.value} id={id} className={TOUR_CSS_CLASSES.MESSAGE} />;
  }

  return (
    <div id={id} className={TOUR_CSS_CLASSES.MESSAGE}>
      {body.value}
    </div>
  );
}

/**
 * The tour panel: header (title and close), media, the step's body, and a footer with
 * progress and Back/Next/Finish.
 *
 * Its buttons carry `data-tour-action` rather than click handlers - `useTour` handles
 * them by delegation on the document.
 */
export function TourPanel({
  step,
  stepInfo,
  navigation,
  body,
  progress,
  titleId,
  messageId,
}: TourPanelProps) {
  const hasHeader = !!step.title || navigation.showClose;
  const showControls = navigation.showControls;
  const showProgress = progress.show;

  return (
    <div className={TOUR_CSS_CLASSES.CONTENT}>
      {hasHeader && (
        <div className={TOUR_CSS_CLASSES.HEADER}>
          {step.title ? (
            <div className={TOUR_CSS_CLASSES.TITLE} id={titleId}>
              {step.title}
            </div>
          ) : (
            <div />
          )}
          {navigation.showClose && (
            <button
              type="button"
              className={TOUR_CSS_CLASSES.CLOSE}
              {...actionAttribute(TOUR_ACTIONS.CLOSE)}
              aria-label={navigation.closeLabel}
            >
              ×
            </button>
          )}
        </div>
      )}
      <TourMedia image={step.image} video={step.video} />
      <div className={TOUR_CSS_CLASSES.BODY}>
        <TourMessage body={body} id={messageId} />
      </div>
      {showProgress ? (
        <div className={TOUR_CSS_CLASSES.FOOTER}>
          <TourProgressIndicator stepInfo={stepInfo} progress={progress} />
          {showControls && <TourNav stepInfo={stepInfo} navigation={navigation} />}
        </div>
      ) : (
        showControls && <TourNav stepInfo={stepInfo} navigation={navigation} />
      )}
    </div>
  );
}

/**
 * The tour panel, rendering whatever props the store currently holds
 *
 * This is the element `useTour` hands the tooltip, so a running step can be updated in
 * place - see `TourPanelStore`.
 */
export function LiveTourPanel({ store }: { store: TourPanelStore }) {
  const props = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return props && <TourPanel {...props} />;
}

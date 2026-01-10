import { DEFAULT_OPTIONS } from '../constants';
import type { ParsedTooltipData } from '../context/TipMagicContext';
import type { Placement, TextBreak, TooltipTransitionBehavior } from '../types';

/**
 * Valid placement values
 */
const VALID_PLACEMENTS: Placement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

/**
 * Parse a placement string to a valid Placement type
 */
function parsePlacement(value: string | undefined): Placement {
  if (value && VALID_PLACEMENTS.includes(value as Placement)) {
    return value as Placement;
  }
  return DEFAULT_OPTIONS.placement;
}

/**
 * Parse an integer from a string with a default fallback
 */
function parseIntWithDefault(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Check if a boolean data attribute is present
 * Boolean data attributes are considered true if they exist (even if empty)
 */
function parseBooleanAttribute(value: string | undefined): boolean {
  return value !== undefined;
}

/**
 * Parse transition behavior from data attributes
 * data-tip-move takes precedence over data-tip-jump
 */
function parseTransitionBehavior(dataset: DOMStringMap): TooltipTransitionBehavior | undefined {
  if (dataset.tipMove !== undefined) {
    return 'move';
  }
  if (dataset.tipJump !== undefined) {
    return 'jump';
  }
  return undefined; // Use provider default
}

/**
 * Parse optional integer (returns undefined if not present)
 */
function parseOptionalInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Valid text break values
 */
const VALID_TEXT_BREAKS: TextBreak[] = ['normal', 'break-all', 'keep-all'];

/**
 * Parse text break value
 */
function parseTextBreak(value: string | undefined): TextBreak {
  if (value && VALID_TEXT_BREAKS.includes(value as TextBreak)) {
    return value as TextBreak;
  }
  return 'normal';
}

/**
 * Parse all tooltip-related data attributes from an element
 */
export function parseDataAttributes(element: Element): ParsedTooltipData {
  const dataset = (element as HTMLElement).dataset;

  return {
    content: dataset.tip ?? '',
    id: dataset.tipId,
    placement: parsePlacement(dataset.tipPlacement),
    delay: parseIntWithDefault(dataset.tipDelay, DEFAULT_OPTIONS.showDelay),
    hideDelay: parseOptionalInt(dataset.tipHideDelay),
    disabled: parseBooleanAttribute(dataset.tipDisabled),
    ellipsis: parseBooleanAttribute(dataset.tipEllipsis),
    maxLines: parseIntWithDefault(dataset.tipMaxLines, 1),
    wordWrap: parseBooleanAttribute(dataset.tipWordWrap),
    textBreak: parseTextBreak(dataset.tipTextBreak),
    maxWidth: parseIntWithDefault(dataset.tipMaxWidth, 300),
    html: parseBooleanAttribute(dataset.tipHtml),
    interactive: parseBooleanAttribute(dataset.tipInteractive),
    transitionBehavior: parseTransitionBehavior(dataset),
    moveTransitionDuration: parseOptionalInt(dataset.tipMoveDuration),
    showArrow: !parseBooleanAttribute(dataset.tipNoArrow),
  };
}

/**
 * Parsed content with optional keyboard shortcut
 */
export interface ParsedContent {
  main: string;
  shortcut?: string;
}

/**
 * Parse tooltip content to extract keyboard shortcut
 * Format: "Main text; keyboard shortcut"
 */
export function parseContent(
  content: string,
  separator: string = DEFAULT_OPTIONS.contentSeparator
): ParsedContent {
  const parts = content.split(separator).map((s) => s.trim());

  if (parts.length >= 2) {
    return {
      main: parts[0],
      shortcut: parts.slice(1).join(separator),
    };
  }

  return { main: content };
}

/**
 * Generate a unique ID for a tooltip target if not provided
 */
let tooltipIdCounter = 0;
export function generateTooltipId(): string {
  return `tip-magic-${++tooltipIdCounter}`;
}

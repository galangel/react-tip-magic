/**
 * Characters that have to be encoded to be safe in both element text and
 * double-quoted attribute values.
 */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value for interpolation into an HTML string
 *
 * Tour content is assembled as HTML and injected with `dangerouslySetInnerHTML`, so
 * anything the library interpolates on the consumer's behalf - titles, media URLs -
 * has to be encoded first.
 *
 * @param value - The raw value to escape
 * @returns The value with HTML-significant characters encoded
 *
 * @example
 * ```ts
 * escapeHtml('Tom & "Jerry"'); // 'Tom &amp; &quot;Jerry&quot;'
 * ```
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

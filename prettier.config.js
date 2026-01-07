/** @type {import('prettier').Config} */
export default {
  // Use single quotes instead of double quotes
  singleQuote: true,

  // Add semicolons at the end of statements
  semi: true,

  // Use 2 spaces for indentation
  tabWidth: 2,

  // Use spaces instead of tabs
  useTabs: false,

  // Add trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: 'es5',

  // Print width - line length before wrapping
  printWidth: 100,

  // Add spaces inside object braces { foo: bar }
  bracketSpacing: true,

  // Put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,

  // Always include parens around arrow function parameters
  arrowParens: 'always',

  // Use LF line endings
  endOfLine: 'lf',

  // Format embedded code in template literals
  embeddedLanguageFormatting: 'auto',

  // Enforce single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,

  // JSX quotes - use double quotes in JSX
  jsxSingleQuote: false,

  // Prose wrap for markdown
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
};

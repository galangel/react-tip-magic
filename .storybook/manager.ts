import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

/**
 * Custom Storybook theme matching React Tip Magic branding
 * Colors extracted from storybook.css and Welcome.mdx hero gradient
 */
const tipMagicTheme = create({
  base: 'light',

  // Brand
  brandTitle: '✨ React Tip Magic',
  brandUrl: 'https://github.com/example/react-tip-magic',
  brandTarget: '_self',

  // Colors - matching the purple gradient from Welcome.mdx
  colorPrimary: '#6366f1',
  colorSecondary: '#8b5cf6',

  // UI
  appBg: '#f9fafb',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,

  // Text colors
  textColor: '#1f2937',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b7280',

  // Toolbar
  barTextColor: '#6b7280',
  barSelectedColor: '#6366f1',
  barHoverColor: '#8b5cf6',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputTextColor: '#1f2937',
  inputBorderRadius: 6,
});

addons.setConfig({
  theme: tipMagicTheme,

  // Hide unused panels and features
  enableShortcuts: true,
  showToolbar: true,

  // Sidebar configuration
  sidebar: {
    showRoots: true,
    collapsedRoots: ['examples'],
  },

  // Set initial page to Welcome
  initialActive: 'sidebar',
});

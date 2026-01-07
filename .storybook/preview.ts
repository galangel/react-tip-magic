import type { Preview } from '@storybook/react-vite';
import './storybook.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },
    layout: 'centered',
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['Introduction', 'Getting Started', 'Components', 'Hooks', 'Examples', '*'],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;

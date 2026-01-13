import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Plugin to copy and concatenate CSS files to dist
 */
function cssPlugin() {
  return {
    name: 'css-plugin',
    writeBundle() {
      const stylesDir = resolve(__dirname, 'src/styles');
      const distDir = resolve(__dirname, 'dist');

      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      // Read all CSS files in order
      const cssFiles = ['variables.css', 'tooltip.css', 'tour.css', 'index.css'];
      let combinedCss = '/* React Tip Magic Styles */\n\n';

      for (const file of cssFiles) {
        const filePath = join(stylesDir, file);
        if (existsSync(filePath)) {
          combinedCss += `/* ${file} */\n`;
          combinedCss += readFileSync(filePath, 'utf-8');
          combinedCss += '\n\n';
        }
      }

      writeFileSync(join(distDir, 'styles.css'), combinedCss);
    },
  };
}

/**
 * Vite configuration for building the React Tip Magic library
 * Outputs ESM and CJS formats for modern React applications
 */
export default defineConfig({
  plugins: [cssPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactTipMagic',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize React dependencies - they should be provided by the consumer
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Global variable names for UMD build (if needed)
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        // Preserve module structure for better tree-shaking
        preserveModules: false,
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Minify for production
    minify: 'esbuild',
    // Target modern browsers
    target: 'es2020',
    // Output directory
    outDir: 'dist',
    // Clean output directory before build
    emptyOutDir: true,
    // CSS handling - don't extract CSS from JS (we handle it manually)
    cssCodeSplit: false,
  },
  // Resolve TypeScript paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

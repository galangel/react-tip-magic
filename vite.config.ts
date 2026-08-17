import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Plugin to concatenate the stylesheets imported by src/styles/index.css into dist/styles.css
 *
 * The file list is derived from index.css rather than hardcoded, so a new stylesheet
 * only has to be imported there to be published.
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

      // Read the imports out of index.css, in order
      const entryCss = readFileSync(join(stylesDir, 'index.css'), 'utf-8');
      const cssFiles = [...entryCss.matchAll(/@import\s+['"]\.\/([^'"]+)['"]/g)].map(
        (match) => match[1]
      );

      let combinedCss = '/* React Tip Magic Styles */\n\n';

      for (const file of cssFiles) {
        const filePath = join(stylesDir, file);
        if (!existsSync(filePath)) {
          throw new Error(`css-plugin: index.css imports "${file}", which does not exist`);
        }
        combinedCss += `/* ${file} */\n`;
        combinedCss += readFileSync(filePath, 'utf-8');
        combinedCss += '\n\n';
      }

      // An unresolved @import would silently ship a broken stylesheet - browsers ignore
      // @import rules that follow other rules, so this never surfaces at runtime.
      if (combinedCss.includes('@import')) {
        throw new Error('css-plugin: bundled stylesheet still contains unresolved @import rules');
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

import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './index.js',
            name: 'ConversionTracking',
            fileName: (format) => `conversion-tracking.${format}.js`,
            formats: ['es', 'umd', 'iife'],
        },
    },
});

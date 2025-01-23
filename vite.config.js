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
    define: {
        __SESSION_ID_PARAM__: JSON.stringify("naugladur"),
        __END_POINT__: JSON.stringify("http://127.0.0.1/track"), // TODO: Update this to live server
        __DEBUG__: true,
    },
});

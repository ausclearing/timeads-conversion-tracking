import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './index.js',
            name: 'ConversionTracking',
            fileName: (format) => `conversion-tracking.${format}.js`,
            formats: ['es', 'umd', 'iife'],
        },
        outDir: 'build',
    },
    define: {
        __SESSION_ID_PARAM__: JSON.stringify("naugladur"),
        __USER_DATA_KEY__: JSON.stringify("siegfried"),
        __END_POINT__: JSON.stringify("http://127.0.0.1/api/track"), // TODO: Update this to live server
        __DEBUG__: false,
    },
});

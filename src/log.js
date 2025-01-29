export const Log = (() => {
    // Log: Debug logger
    const debug = (...messages) => {
        if (__DEBUG__) {
            console.log("[ConversionTracking DEBUG]:", ...messages);
        }
    };

    const warn = (...messages) => {
        if (__DEBUG__) {
            console.warn("[ConversionTracking WARNING]:", ...messages);
        }
    };

    const error = (...messages) => {
        console.error("[ConversionTracking ERROR]:", ...messages);
    };

    return {
        debug,
        warn,
        error,
    };
})();
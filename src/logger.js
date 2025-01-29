export const Logger = (() => {

    let debugMode = __DEBUG__;

    // Set debug mode dynamically
    const setDebug = (mode) => {
        debugMode = !!mode;
    };

    // Log: Debug logger (logs only if debugMode is enabled)
    const debug = (...messages) => {
        if (debugMode) {
            console.log("[ConversionTracking DEBUG]:", ...messages);
        }
    };

    const warn = (...messages) => {
        if (debugMode) {
            console.warn("[ConversionTracking WARNING]:", ...messages);
        }
    };

    // Errors always log regardless of debug mode
    const error = (...messages) => {
        console.error("[ConversionTracking ERROR]:", ...messages);
    };

    return {
        debug,
        warn,
        error,
        setDebug,
    };
})();

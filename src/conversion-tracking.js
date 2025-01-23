const ConversionTracking = (() => {
    // Private variables and methods (not exposed to users)
    let userData = {};

    // Utility: Debug logger
    const logDebug = (...messages) => {
        if (__DEBUG__) {
            console.log("[ConversionTracking DEBUG]:", ...messages);
        }
    };

    // Utility: Parse session id from URL query parameters
    const getSessionIdFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(__SESSION_ID_PARAM__) || null;
    };

    // Initialize the module (e.g., capture sessionid)
    const initialize = () => {
        const sessionId = getSessionIdFromURL();
        if (sessionId) {
            userData.sessionId = sessionId;
            logDebug("Session ID captured:", sessionId);
        } else {
            logDebug("No session ID found in the URL.");
        }
    };

    // Public function to track landing
    const land = () => {
        userData.landedAt = new Date().toISOString();
        logDebug("Landing recorded at:", userData.landedAt, "Session ID:", userData.sessionId);

        // Example: Send this data to your server
        // postToServer(_endPoint, userData);
    };

    // Public function to track custom events
    const trackEvent = (eventName, additionalData = {}) => {
        const event = {
            event: eventName,
            timestamp: new Date().toISOString(),
            sessionId: userData.sessionId,
            ...additionalData,
        };
        logDebug("Event tracked:", event);

        // Example: Send event to server
        // postToServer(_endPoint, event);
    };

    // Expose public methods
    return {
        initialize,
        land,
        trackEvent,
    };
})();

export default ConversionTracking;

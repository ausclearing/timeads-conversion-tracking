import {Encryption} from './encryption';
import {Utility} from "./utility";
import {Logger} from './logger';

// Event type constants
const Event = {
    PURCHASE: 'purchase',
    SIGNUP: 'signup',
    VIEW_ITEM: 'view_item'
};

const ConversionTracking = ((config = {
    debug: __DEBUG__,
    sessionIdParam: __SESSION_ID_PARAM__,
    endPoint: __END_POINT__,
}) => {

    // Set debug mode dynamically
    Logger.setDebug(config.debug);

    let userData = {};

    const setConfig = (newConfig) => {
        config = {
            debug: newConfig.debug !== undefined ? newConfig.debug : config.debug,
            sessionIdParam: newConfig.sessionIdParam !== undefined ? newConfig.sessionIdParam : config.sessionIdParam,
            endPoint: newConfig.endPoint !== undefined ? newConfig.endPoint : config.endPoint,
        };

        Utility.setConfig(config);
        Logger.setDebug(config.debug);

        Logger.debug("Configuration updated:", config);
    };

    // Utility: Send data to server
    const postToServer = (data) => {
        fetch(config.endPoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                Logger.debug("Data sent to server:", data);
            })
            .catch((error) => {
                Logger.debug("Error sending data to server:", error);
            });
    };

    // Utility: Parse session id from URL query parameters
    const getSessionIdFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(config.sessionIdParam) || null;
    };

    // Utility: Pre flight checks
    const initialize = () => {
        Logger.debug("Initializing ConversionTracking...");

        Logger.debug("Checking cookies support...");
        if (!Utility.checkCookieSupport()) {
            Logger.error("Cookies are not supported. Conversion tracking may not work as expected.");
            throw new Error("Cookies are not supported.");
        }

        Logger.debug("Checking localStorage support...");
        if (!Utility.checkLocalStorageSupport()) {
            Logger.error("LocalStorage is not supported. Conversion tracking may not work as expected.");
            throw new Error("LocalStorage is not supported.");
        }
    };

    // Utility: Generate a random transaction ID
    const generateTransactionId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    // Utility: Validate additional data
    const validateAdditionalData = (additionalData) => {
        const errors = [];

        // 1) event: required, string, min 5 chars
        if (!('event' in additionalData)) {
            errors.push("event is required.");
        } else if (typeof additionalData.event !== "string") {
            errors.push("event must be a string.");
        } else if (additionalData.event.length < 5) {
            errors.push("event must be at least 5 characters.");
        }

        // 2) value: optional, but if present must be numeric
        if (additionalData.value !== undefined) {
            if (typeof additionalData.value !== "number" || isNaN(additionalData.value)) {
                errors.push("value must be a valid float (number).");
            }
        }

        // 3) tags: optional, array of up to 3 strings, each <= 50 chars
        if (additionalData.tags !== undefined) {
            if (!Array.isArray(additionalData.tags)) {
                errors.push("tags must be an array.");
            } else if (additionalData.tags.length > 3) {
                errors.push("tags can contain at most 3 items.");
            } else {
                additionalData.tags.forEach((tag, index) => {
                    if (typeof tag !== "string") {
                        errors.push(`tags[${index}] must be a string.`);
                    } else if (tag.length > 50) {
                        errors.push(`tags[${index}] cannot exceed 50 characters.`);
                    }
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    // Public function to track landing
    const land = async () => {
        initialize();

        userData.landed_at = new Date().toISOString();

        // Get session id from URL
        const sessionId = getSessionIdFromURL();
        if (!sessionId) { // If session id not found in URL, do nothing
            Logger.warn("Session ID not found in URL query parameters.");
            return;
        }

        // Add session id to user data
        userData.session_id = sessionId;

        Logger.debug("Landing recorded at:", userData.landed_at, "Session ID:", userData.session_id);

        // Generate a transaction ID
        userData.transaction_id = generateTransactionId();
        Logger.debug("Generated transaction ID:", userData.transaction_id);

        // Generate a key
        const key = await Encryption.generateKey();
        Logger.debug("Generated key:", key);

        // Store the key in cookies
        if (!await Utility.storeInCookies(key)) {
            Logger.error("Error storing key in cookies.");
            return;
        }

        // Store data in localStorage
        if (!await Utility.storeInLocalStorage(key, userData)) {
            Logger.error("Error storing data in localStorage.");
            return;
        }

        // Send OK Landed event
        const data = {
            event: "landed",
            ...userData,
        }
        postToServer(data);
    };

    // Public function to track custom events
    const track = async (transactionId, additionalData = {}) => {
        initialize();

        // Validate transaction ID
        if (typeof transactionId !== "string" || transactionId.length === 0 || transactionId.length > 200) {
            Logger.error("Invalid transaction ID");
            return;
        }

        // Get session id from LocalStorage
        const key = await Utility.retrieveFromCookies();
        if (!key) {
            Logger.error("Error retrieving key from cookies.");
            return;
        }

        // Retrieve data from LocalStorage
        const userData = await Utility.retrieveFromLocalStorage(key);
        if (!userData) {
            Logger.error("Error retrieving data from LocalStorage.");
            return;
        }

        const {isValid, errors} = validateAdditionalData(additionalData);
        if (!isValid) {
            Logger.error("Validation errors:", errors);
            return;
        }

        const event = {
            ...additionalData,
            transaction_id: transactionId,
            landed_at: new Date().toISOString(),
            session_id: userData.session_id,
        };

        Logger.debug("Event tracked:", event);
        postToServer(event);
    };

    // Expose public methods
    return {
        land,
        track,
        Event,
        setConfig,
    };
})();

export default ConversionTracking;

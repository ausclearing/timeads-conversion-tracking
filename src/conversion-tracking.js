import {Log} from "./log";
import {Encryption} from './encryption';
import {Utility} from "./utility";

// Event type constants
const Event = {
    PURCHASE: 'purchase',
    SIGNUP: 'signup',
    VIEW_ITEM: 'view_item'
};

const ConversionTracking = (() => {

    let userData = {};

    // Utility: Send data to server
    const postToServer = (data) => {
        fetch(__END_POINT__, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                Log.debug("Data sent to server:", data);
            })
            .catch((error) => {
                Log.debug("Error sending data to server:", error);
            });
    };

    // Utility: Parse session id from URL query parameters
    const getSessionIdFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(__SESSION_ID_PARAM__) || null;
    };

    // Utility: Pre flight checks
    const initialize = () => {
        Log.debug("Initializing ConversionTracking...");

        Log.debug("Checking cookies support...");
        if (!Utility.checkCookieSupport()) {
            Log.error("Cookies are not supported. Conversion tracking may not work as expected.");
            throw new Error("Cookies are not supported.");
        }

        Log.debug("Checking localStorage support...");
        if (!Utility.checkLocalStorageSupport()) {
            Log.error("LocalStorage is not supported. Conversion tracking may not work as expected.");
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

        userData.landedAt = new Date().toISOString();
        Log.debug("Landing recorded at:", userData.landedAt, "Session ID:", userData.sessionId);

        // Get session id from URL
        const sessionId = getSessionIdFromURL();
        if (!sessionId) { // If session id not found in URL, do nothing
            Log.warn("Session ID not found in URL query parameters.");
            return;
        }

        // Add session id to user data
        userData.sessionId = sessionId;

        // Generate a transaction ID
        userData.transactionId = generateTransactionId();
        Log.debug("Generated transaction ID:", userData.transactionId);

        // Generate a key
        const key = await Encryption.generateKey();
        Log.debug("Generated key:", key);

        // Store the key in cookies
        if (!await Utility.storeInCookies(key)) {
            Log.error("Error storing key in cookies.");
            return;
        }

        // Store data in localStorage
        if (!await Utility.storeInLocalStorage(key, userData)) {
            Log.error("Error storing data in localStorage.");
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
    const trackEvent = async (transactionId, additionalData = {}) => {
        initialize();

        // Validate transaction ID
        if (typeof transactionId !== "string" || transactionId.length === 0 || transactionId.length > 200) {
            Log.error("Invalid transaction ID");
            return;
        }

        // Get session id from LocalStorage
        const key = await Utility.retrieveFromCookies();
        if (!key) {
            Log.error("Error retrieving key from cookies.");
            return;
        }

        // Retrieve data from LocalStorage
        const userData = await Utility.retrieveFromLocalStorage(key);
        if (!userData) {
            Log.error("Error retrieving data from LocalStorage.");
            return;
        }

        const {isValid, errors} = validateAdditionalData(additionalData);
        if (!isValid) {
            Log.error("Validation errors:", errors);
            return;
        }

        const event = {
            ...additionalData,
            transaction_id: transactionId,
            timestamp: new Date().toISOString(),
            sessionId: userData.sessionId,
        };

        Log.debug("Event tracked:", event);
        postToServer(event);
    };

    const test = () => {

        Utility.storeInCookies({name: "John Doe"});

        // Get session from local storage
        const key = Utility.retrieveFromCookies();
        console.log(key);

    };

    // Expose public methods
    return {
        land,
        trackEvent,
        test,
        Event,
    };
})();

export default ConversionTracking;

import {Encryption} from "./encryption.js";
import {Logger} from "./logger";

export const Utility = ((config = {
    cookieName: "jdiiwkssl",
    localStorageKey: "lsoqejaiked",
}) => {

    const setConfig = (newConfig) => {
        config = {
            cookieName: newConfig.cookieName !== undefined ? newConfig.cookieName : config.cookieName,
            localStorageKey: newConfig.localStorageKey !== undefined ? newConfig.localStorageKey : config.localStorageKey,
        }
    }

    const storeInLocalStorage = async (key, data) => {
        try {
            // Encrypt the data
            const encryptedData = await Encryption.encrypt(key, data);

            // Save the encrypted data in localStorage
            localStorage.setItem(config.localStorageKey, JSON.stringify(encryptedData));
            Logger.debug("Data stored in localStorage.");

            return true;
        } catch (error) {
            Logger.error("Error storing data in localStorage:", error);

            return false;
        }
    };

    const retrieveFromLocalStorage = async (key) => {
        try {
            // Get the encrypted data from localStorage
            const encryptedData = JSON.parse(localStorage.getItem(config.localStorageKey));
            if (!encryptedData) {
                Logger.debug("No data found in localStorage.");
                return null;
            }

            // Decrypt the data
            const decryptedData = await Encryption.decrypt(key, encryptedData);
            Logger.debug("Data retrieved and decrypted from localStorage.");
            return decryptedData;
        } catch (error) {
            Logger.error("Error retrieving data from localStorage:", error);
            return null;
        }
    };

    const storeInCookies = async (data) => {
        const startsWith = config.cookieName + "=";
        try {
            // Save the encrypted data as a Base64 string in cookies
            document.cookie = `${startsWith}${btoa(JSON.stringify(data))}; ` +
                `Secure; ` +         // Only works over HTTPS
                `SameSite=Strict; ` +
                `path=/;`;          // No 'HttpOnly'

            Logger.debug("Data stored in cookies.");

            return true;
        } catch (error) {
            Logger.error("Error storing data in cookies:", error);

            return false;
        }
    };


    const retrieveFromCookies = async () => {
        try {
            // Get the cookie value
            const startsWith = config.cookieName + "=";
            const cookieString = document.cookie
                .split("; ")
                .find((row) => row.startsWith(startsWith));
            if (!cookieString) {
                Logger.debug("No data found in cookies.");
                return null;
            }

            const data = JSON.parse(atob(cookieString.split("=")[1]));
            Logger.debug("Data retrieved and decrypted from cookies.");
            return data;
        } catch (error) {
            Logger.error("Error retrieving data from cookies:", error);
            return null;
        }
    };

    const checkCookieSupport = () => {
        try {
            // Set a test cookie
            document.cookie = "yourock=1; SameSite=Strict; path=/;";
            const cookieEnabled = document.cookie.indexOf("yourock=") !== -1;
            if (cookieEnabled) {
                document.cookie = "yourock=; SameSite=Strict; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            }
            return cookieEnabled;
        } catch (error) {
            return false;
        }
    };


    const checkLocalStorageSupport = () => {
        try {
            const testKey = "__yourock__";
            localStorage.setItem(testKey, "1");
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            Logger.error("Error checking localStorage support:", error);
            return false;
        }
    };


    return {
        storeInLocalStorage,
        retrieveFromLocalStorage,
        storeInCookies,
        retrieveFromCookies,
        checkCookieSupport,
        checkLocalStorageSupport,
        setConfig,
    };
})();

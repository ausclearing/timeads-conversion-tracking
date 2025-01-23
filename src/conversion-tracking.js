// index.js

const ConversionTracking = (() => {
    // Private variables and methods (not exposed to users)
    let userData = {};

    // Public function to track landing
    const land = () => {
        userData.landedAt = new Date().toISOString();
        console.log("Landing recorded at:", userData.landedAt);
        // You can also send this data to your server
    };

    // Expose public methods
    return {
        land,
    };
})();

// Export the ConversionTracking object for usage
export default ConversionTracking;

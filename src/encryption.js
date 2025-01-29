export const Encryption = (() => {
    // Generate a key and return it as a Base64 string
    const generateKey = async () => {
        try {
            const key = await crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true, // Whether the key is exportable
                ["encrypt", "decrypt"]
            );

            const exportedKey = await crypto.subtle.exportKey("raw", key);
            return bufferToBase64(exportedKey); // Return Base64 encoded key
        } catch (error) {
            console.error("Error generating encryption key:", error);
            throw error;
        }
    };

    // Import an existing key from a Base64 string
    const importKey = async (base64Key) => {
        try {
            const rawKey = base64ToBuffer(base64Key);
            return await crypto.subtle.importKey(
                "raw",
                rawKey,
                {name: "AES-GCM"},
                true,
                ["encrypt", "decrypt"]
            );
        } catch (error) {
            console.error("Error importing encryption key:", error);
            throw error;
        }
    };

    // Encrypt data using a provided Base64 key
    const encrypt = async (base64Key, data) => {
        if (!isValidBase64(base64Key)) {
            throw new Error("Invalid Base64 Key");
        }

        const key = await importKey(base64Key);
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate random IV
        const encodedData = new TextEncoder().encode(JSON.stringify(data));

        const encryptedBuffer = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv},
            key,
            encodedData
        );

        return {
            iv: bufferToBase64(iv), // Base64 encode IV
            cipherText: bufferToBase64(encryptedBuffer), // Base64 encode encrypted data
        };
    };


    // Decrypt data using a provided Base64 key
    const decrypt = async (base64Key, encryptedData) => {
        try {
            const key = await importKey(base64Key);
            const iv = base64ToBuffer(encryptedData.iv); // Decode IV from Base64
            const cipherText = base64ToBuffer(encryptedData.cipherText); // Decode cipherText from Base64

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                key,
                cipherText
            );

            return JSON.parse(new TextDecoder().decode(decryptedBuffer));
        } catch (error) {
            console.error("Error decrypting data:", error);
            throw error;
        }
    };

    const isValidBase64 = (str) => {
        try {
            return btoa(atob(str)) === str;
        } catch (error) {
            return false;
        }
    };

    // Utility: Convert ArrayBuffer to Base64
    const bufferToBase64 = (buffer) => {
        const byteArray = new Uint8Array(buffer);
        const binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
        return btoa(binaryString);
    };

    // Utility: Convert Base64 to ArrayBuffer
    const base64ToBuffer = (base64) => {
        const binaryString = atob(base64);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray.buffer;
    };

    return {
        generateKey,
        encrypt,
        decrypt,
    };
})();

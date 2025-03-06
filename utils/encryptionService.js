const crypto = require('crypto');
require("dotenv").config();

// TODO: Store in .env
const SECRET_KEY = process.env.JWT_SECRET;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size for CBC mode


class EncryptionService {
    // Function to create a token
    createToken(email) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

        const payload = JSON.stringify({ email, createdAt: Date.now() });
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ':' + encrypted;
    }

    // Function to extract data from token
    extractData(token) {
        try {
            const [ivHex, encryptedData] = token.split(':');
            const iv = Buffer.from(ivHex, 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return JSON.parse(decrypted);
        } catch (error) {
            return null;
        }
    }

    // Function to validate token (checks if it can be decrypted)
    validateToken(token) {
        return this.extractData(token) !== null;
    }
}

module.exports = new EncryptionService();

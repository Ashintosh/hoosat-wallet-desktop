const crypto = require('crypto');
//const argon2 = require('argon2');

class Crypto {
    static #IV_SIZE = 16;
    static #SALT_SIZE = 16;
    static #KEY_SIZE = 32;

    /**
     * Generate a random string using the crypto.randomInt method
     * @param {number} [size=16]
     * @returns {string}
     */
    static randomString(size= 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = String();

        while (result.length < size) {
            result += charset[crypto.randomInt(charset.length)];
        }

        return result;
    }

    /**
     * Creates has from provided plaintext
     * @param {string} plainText
     * @param {string} [algorithm='sha256']
     * @param [encoding='hex']
     * @return {string}
     */
    static hash(plainText, algorithm= 'sha256', encoding= 'hex') {
        return crypto.createHash(algorithm)
            .update(plainText)
            .digest(encoding);
    }

    /**
     * Encrypt provided bytes using provided key
     * @param {Buffer} plainBytes
     * @param {string} cipherKey
     * @param {Object} [options]
     * @param {boolean} [options.format=false]
     * @param {string} [options.algorithm='aes-256-gcm']
     * @return {Buffer}
     */
    static encryptBytes(plainBytes, cipherKey, options= {})  {
        const defaultOptions = {
            algorithm: 'aes-256-gcm'
        };

        const {
            algorithm = defaultOptions.algorithm
        } = options;

        const iv = crypto.randomBytes(Crypto.#IV_SIZE);
        const salt = crypto.randomBytes(Crypto.#SALT_SIZE);
        const key = crypto.pbkdf2Sync(cipherKey, salt, 150000, Crypto.#KEY_SIZE, 'sha256');
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let cipherBytes = Buffer.concat([cipher.update(plainBytes), cipher.final()]);
        const tag = cipher.getAuthTag();

        return this.#formatCipher(iv, cipherBytes, salt, tag);
    }

    /**
     * Decrypt provided bytes using provided key
     * @param {Buffer} formattedCipherBytes
     * @param {string} cipherKey
     * @param {Object} [options]
     * @param {string} [options.algorithm='aes-256-gcm']
     * @return {Buffer}
     */
    static decryptBytes(formattedCipherBytes, cipherKey, options= {}) {
        const defaultOptions = {
            algorithm: 'aes-256-gcm'
        };

        const {
            algorithm = defaultOptions.algorithm
        } = options;

        let cipherData, tag;

        if (algorithm === 'aes-256-gcm') {
            cipherData = Crypto.#unformatCipher(formattedCipherBytes, true);
            tag = cipherData.TAG;
        } else {
            cipherData = Crypto.#unformatCipher(formattedCipherBytes);
        }

        const iv = cipherData.IV;
        const salt = cipherData.SALT;

        const cipherBytes = cipherData.CIPHERTEXT;
        const key = crypto.pbkdf2Sync(cipherKey, salt, 150000, Crypto.#KEY_SIZE, 'sha256');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag);

        return Buffer.concat([decipher.update(cipherBytes), decipher.final()]);
    }


    /**
     * Format cipher data bytes
     * @param {Buffer} ivBuffer
     * @param {Buffer} cipherTextBuffer
     * @param {Buffer} saltBuffer
     * @param {false|Buffer} [tagBuffer=false]
     * @return {Buffer}
     */
    static #formatCipher(ivBuffer, cipherTextBuffer, saltBuffer, tagBuffer= false) {
        let cipherBuffers = [
            Buffer.from(ivBuffer),
            Buffer.from(cipherTextBuffer),
            Buffer.from(saltBuffer)
        ];

        if (tagBuffer) {
            cipherBuffers.push(Buffer.from(tagBuffer));
        }

        return Buffer.concat(cipherBuffers);
    }

    /**
     * Unformat cipher data bytes
     * @param {Buffer} cipherFormat
     * @param {boolean} [hasTag=false]
     * @return {{SALT: Buffer, CIPHERTEXT: Buffer, IV: Buffer}}
     */
    static #unformatCipher(cipherFormat, hasTag= false) {
        const cipherBuffers = cipherFormat;
        const tagLength = 16;

        const ivBuffer = cipherBuffers.subarray(0, Crypto.#IV_SIZE);
        const cipherTextBuffer = cipherBuffers.subarray(
            Crypto.#IV_SIZE, cipherBuffers.length - tagLength - Crypto.#SALT_SIZE
        );
        const saltBuffer = cipherBuffers.subarray(
            cipherBuffers.length - tagLength - Crypto.#SALT_SIZE, cipherBuffers.length - tagLength
        );

        let result = {
            CIPHERTEXT: cipherTextBuffer,
            IV: ivBuffer,
            SALT: saltBuffer
        }

        if (hasTag) {
            result.TAG = cipherBuffers.subarray(cipherBuffers.length - tagLength);
        }

        return result;
    }
}

module.exports = Crypto;
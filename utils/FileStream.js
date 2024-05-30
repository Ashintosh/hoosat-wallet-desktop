const fs = require('fs');
const path = require('node:path');

class FileStream {

    static readFileBytes(filePath) {
        const fileSize = this.getFilesize(filePath);
        const fileData = Buffer.alloc(fileSize);

        let bytesRead = 0;
        const chunkSize = this.calculateChunkSize(fileSize);

        return new Promise((resolve, reject) => {
           const readStream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

           readStream.on('data', (chunk) => {
               chunk.copy(fileData, bytesRead);
               bytesRead += chunk.length;
           });

           readStream.on('end', () => {
               resolve(fileData);
           });

           readStream.on('error', (err) => {
               reject(err);
           });
        });
    }

    static async writeFileBytes(filePath, data) {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK, (accessErr) => {
                if (accessErr && accessErr.code !== 'ENOENT') {
                    reject(accessErr);
                }

                const parentDir = path.dirname(filePath);
                if (!fs.existsSync(parentDir)) {
                    fs.mkdirSync(parentDir, { recursive: true });
                }

                fs.writeFile(filePath, '', (writeErr) => {
                   if (writeErr) {
                       reject(writeErr);
                   }

                   const writeStream = fs.createWriteStream(filePath);
                   writeStream.on('finish', resolve);
                   writeStream.on('error', reject);
                   writeStream.write(data);
                   writeStream.end();
                });
            });
        });
    }

    static exists(filePath) {
        return fs.existsSync(filePath);

    }

    static calculateChunkSize(fileSize) {
        return Math.min(16 * 1024, fileSize);
    }

    static getFilesize(filepath) {
        try {
            const stats = fs.statSync(filepath);
            return stats.size;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            return 0;
        }
    }
}

module.exports = FileStream;
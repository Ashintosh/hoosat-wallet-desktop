const fs = require('fs');

class Filesystem {

    static readFile(filepath) {
        let fileData;
        const chunkSize = 16;
        const fileSize = this.getFilesize(filepath);

    }

    static readChunk(filepath, startOffset, endOffset) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(ArrayBuffer.from(reader.result));

            reader.onerror = () => {
                reader.abort();
                reject(new DOMException('Parse error'));
            }

            reader.readAsArrayBuffer(filepath.slice(startOffset, startOffset + endOffset));
        })
    }

    static getFilesize(filepath) {
        const stats = fs.statSync(filepath);
        return stats.size;
    }

}
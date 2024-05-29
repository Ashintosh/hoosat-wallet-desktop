const API = require("./API");
const Worker = require("./Worker");
const filestream = require("./FileStream");
const crypto = require("./Crypto");
const path = require("path");

class Wallet {
    #DEFAULT_ENC_KEY = 'hoosat-wallet_9KjLx';

    constructor() {
        this.api = new API();
        this.worker = new Worker();
    }

    async create(seed= null) {
        this.wallet = this.worker.createWallet(seed);
        return this;
    }

    async send(amount, address, priorityFee= null) {
        const txData = {
            toAddr: address,
            amount: amount,
            priorityFee: priorityFee
        };

        const estimatedFee = this.worker.estimateTransactionFee(txData);

        delete txData.priorityFee;
        txData.fee = estimatedFee;

        const tx = this.worker.buildTransaction(txData);
        return this.api.sendTransaction(tx);
    }

    async importFromFile(filepath, password= this.#DEFAULT_ENC_KEY) {

        let fileData = await filestream.readFileBytes(filepath)
            .catch((err) => {
                console.error(err);
                return undefined;
            });

        if (!fileData) {
            console.error('Empty file buffer');
            return undefined;
        }

        fileData = crypto.decryptBytes(fileData, password).toString('utf8');
        const walletData = JSON.parse(fileData);
        this.network =  walletData['network'];

        return this.create(walletData['mnemonic']);
    }

    async saveToFile(filename, filepath, password= this.#DEFAULT_ENC_KEY) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        const receiveAddresses = wallet.generateAddressData();
        const changeAddresses = wallet.generateAddressData(true);

        let walletData = {
            name: filename,
            mnemonic: wallet.mnemonic,
            network: wallet.network,
            addresses: {
                receive: receiveAddresses,
                change: changeAddresses
            },
            transactions: { }
        };

        let walletBuffer = crypto.encryptBytes(Buffer.from(JSON.stringify(walletData)), password);
        const absolutePath = path.join(filepath.endsWith('/') ? filepath : filepath + '/', filename + '.hoosat');

        await filestream.writeFileBytes(absolutePath, walletBuffer)
            .catch((err) => {
                console.error(err);
                return undefined;
            });

        return filepath;
    }

    atomicToFloat(atomic) {
        return (atomic / 100000000).toFixed(8);
    }

    async rTest() {
        const wallet = new Wallet().create('fame leaf frequent piano mystery shrimp same ahead acoustic oyster crater salute');

        const test2Wallet = new Worker().createWallet();
        const taddress = test2Wallet.createAddress();
        await test2Wallet.refresh()
        const address = taddress[0].address;

        const send = wallet.send(10000000000, address);

        console.log(send);
    }
}


(async () => {
    const wallet = new Wallet();
    await wallet.rTest();
})();

module.exports = Wallet;
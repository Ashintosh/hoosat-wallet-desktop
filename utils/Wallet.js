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
        this.wallet = await this.worker.createWallet(seed);
        return this;
    }

    async send(amount, address, priorityFee= null) {
        const txData = {
            toAddr: address,
            amount: amount,
            priorityFee: priorityFee
        };

        const estimatedFee = await this.worker.estimateTransactionFee(txData);

        delete txData.priorityFee;
        txData.fee = estimatedFee;

        const tx = await this.worker.buildTransaction(txData);
        return this.api.sendTransaction(tx);
    }

    async createAddress(amount= 1, type= 'receive') {
        return this.wallet.createAddress(amount, type);
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

    async saveToFile(filepath, password= this.#DEFAULT_ENC_KEY) {
        if (!this.wallet) { throw new Error("Wallet not loaded into object."); }

        const walletData = await this.prepareWalletData(this.wallet, password);

        let absolutePath = filepath;
        if (!filepath.endsWith(".hoosat")) {
            absolutePath = path.join(filepath.endsWith('/') ? filepath : filepath + '/', 'wallet.hoosat');
        }

        try {
            await filestream.writeFileBytes(absolutePath, walletData);
            return true;
        } catch (Err) {  return false; }
    }

    fileExists(filePath) {
        return filestream.exists(filePath);
    }

    async prepareWalletData(wallet, password) {
        wallet.createAddress(5, 'receive');
        wallet.createAddress(2, 'change');

        const receiveAddresses = await wallet.getAddressData('receive');
        const changeAddresses = await wallet.getAddressData('change');
        const transactions = await this.prepareTransactionData(wallet, receiveAddresses, changeAddresses);

        const walletData = {
            mnemonic: wallet.mnemonic,
            network: wallet.network,
            addresses: {
                receive: receiveAddresses,
                change: changeAddresses
            },
            transactions: transactions
        };

        return crypto.encryptBytes(Buffer.from(JSON.stringify(walletData)), password);
    }

    async prepareTransactionData(wallet, receiveAddresses, changeAddresses) {
        const transactions = {
            receiveAddresses: {},
            changeAddresses: {}
        };

        await Promise.all(receiveAddresses.map(async (addressData) => {
            const address = addressData.address;
            transactions.receiveAddresses[address] = await this.api.getTransactionsByAddress(address);
        }));

        await Promise.all(changeAddresses.map(async (addressData) => {
            const address = addressData.address;
            transactions.changeAddresses[address] = await this.api.getTransactionsByAddress(address);
        }));

        return transactions;
    }

    atomicToFloat(atomic) {
        return (atomic / 100000000).toFixed(8);
    }
}

module.exports = Wallet;
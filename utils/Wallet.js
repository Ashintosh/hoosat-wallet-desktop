const API = require("./API");
const Worker = require("./Worker");
const filestream = require("./FileStream");
const crypto = require("./Crypto");

class Wallet {
    #DEFAULT_ENC_KEY = 'hoosat-wallet_dz#&--U}[=.y;2k';

    constructor() {
        this.api = new API();
        this.worker = new Worker();
    }

    async create() {
        await this.worker.createWallet();
        return {
            status: true,
            data: this.prepareWalletData(this),
            methodChain: this
        };
    }

    async send(amount, address, priorityFee= null) {
        this.checkIsLoaded();

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
        this.checkIsLoaded();
        return this.worker.createAddress(amount, type);
    }

    async importFromSeed(seed) {
        try {
            await this.worker.createWallet(seed);
            return  {
                status: true,
                wallet: await this.prepareWalletData(this),
                methodChain: this
            };
        }
        catch (err) {
            return  {
                status: false,
                error: 'invalid-seed'
            };
        }
    }

    async importFromFile(filePath, password= this.#DEFAULT_ENC_KEY) {
        const absolutePath = filestream.addExtension(filePath, '.hoosat');
        const fileValidation = this.validateFileParams(filePath, password);
        if (fileValidation) {
            return {
                status: false,
                error: fileValidation
            };
        }

        if (!filestream.exists(absolutePath)) {
            return {
                status: false,
                error: 'file-not-found'
            };
        }

        let fileData = await filestream.readFileBytes(absolutePath)
            .catch(() => {
                return {
                    status: false,
                    error: 'read-error'
                };
            });

        if (!fileData) {
            return {
                status: false,
                error: 'no-data'
            };
        }

        let walletData = undefined;
        try {
            fileData = crypto.decryptBytes(fileData, password).toString('utf8');
            walletData = JSON.parse(fileData);
            // await this.worker.createWallet(walletData.mnemonic);
        } catch (_) {
            return {
                status: false,
                error: 'crypt-error'
            };
        }

        return {
            status: true,
            wallet: walletData
        };
    }

    async saveToFile(filePath, password= this.#DEFAULT_ENC_KEY) {
        this.checkIsLoaded();

        const absolutePath = filestream.addExtension(filePath, '.hoosat');
        const fileValidation = this.validateFileParams(filePath, password);
        if (fileValidation) {
            return fileValidation;
        }

        if (filestream.exists(absolutePath)) {
            return 'file-exists';
        }

        const walletData = await this.prepareWalletData(this);
        const encryptedWalletData = crypto.encryptBytes(Buffer.from(JSON.stringify(walletData)), password);

        try { await filestream.writeFileBytes(absolutePath, encryptedWalletData); }
        catch (err) { return 'write-error'; }

        return null;
    }

    async prepareWalletData(walletObj) {
        this.checkIsLoaded();

        walletObj.createAddress(5, 'receive'); // TODO: Manage amount to create
        walletObj.createAddress(2, 'change');

        const receiveAddresses = await walletObj.worker.getAddressData('receive');
        const changeAddresses = await walletObj.worker.getAddressData('change');
        const transactions = await this.prepareTransactionData(walletObj, receiveAddresses, changeAddresses);

        return {
            mnemonic: walletObj.worker.getMnemonic(),
            network: walletObj.worker.getNetwork(),
            addresses: {
                receive: receiveAddresses,
                change: changeAddresses
            },
            transactions: transactions
        };
    }

    async prepareTransactionData(wallet, receiveAddresses, changeAddresses) {
        this.checkIsLoaded();

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

    validateFileParams(filePath, password) {
        if (filePath.length === 0) {
            return 'no-directory-value';
        }

        if (filePath.endsWith('/')) {
            return 'no-file-name';
        }

        if (password.length < 8) {
            return 'short-password';
        }

        return null;
    }

    checkIsLoaded() {
        if (!this.worker.wallet) { throw new Error("Wallet not loaded into object."); }
    }

    atomicToFloat(atomic) {
        return (atomic / 100000000).toFixed(8);
    }
}

module.exports = Wallet;
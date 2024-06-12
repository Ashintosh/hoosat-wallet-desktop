const { Wallet, initKaspaFramework } = require('@kaspa/wallet');

class Worker {
    #DEFAULT_NETWORK = 'hoosat';

    async createWallet(mnemonic= null, network = this.#DEFAULT_NETWORK) {
        await initKaspaFramework();

        this.wallet = (mnemonic) ? Wallet.fromMnemonic(mnemonic, { network })
            : new Wallet(null, null, { network });

        this.network = network;
    }

    async createAddress(amount= 1, type= 'receive') {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        return this.wallet.addressManager.getAddresses(amount, type);
    }

    async getAddressData(type= 'receive') {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        const wallet = this.wallet;
        const addressData = (type === 'receive') ? wallet.addressManager.receiveAddress.keypairs
            : wallet.addressManager.changeAddress.keypairs;

        const addressIndexes = (type === 'receive') ? wallet.addressManager.receiveAddress.atIndex
            : wallet.addressManager.changeAddress.atIndex

        let receiveData = [];
        for (let index= 0; index < Object.keys(addressIndexes).length; index++) {
            receiveData[index] = {
                address: addressIndexes[index],
                publicKey: addressData[addressIndexes[index]].publicKey
            }
        }

        return receiveData;
    }

    async sendTransaction(tx) {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        await this.wallet.submitTransaction(tx);
    }

    async refresh() {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        await this.wallet.sync()
            .catch((Err) => {
                console.error("Refresh Error:", Err);
                return false;
            });

        return true;
    }

    async buildTransaction(txData) {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        return this.wallet.composeTx(txData);
    }

    async estimateTransactionFee(txData) {
        this.checkWalletLoaded(true);
        await initKaspaFramework();

        const txComp = this.buildTransaction(txData);
        let { txSize, mass } = txComp.tx.getMassAndSize();

        const minReqFee = this.wallet.minimumRequiredTransactionRelayFee(mass);
        const txFee = (txData.priorityFee) ? txData.priorityFee + minReqFee
            : minReqFee;

        return {
            fee: txFee,
            size: txSize
        };
    }

    getWallet() {
        this.checkWalletLoaded(true);
        return this.wallet;
    }

    getNetwork() {
        this.checkWalletLoaded(true);
        return this.wallet.network;
    }

    getMnemonic() {
        this.checkWalletLoaded(true);
        return this.wallet.mnemonic;
    }

    getBalance() {
        this.checkWalletLoaded(true);
        return this.wallet.balance;
    }

    checkWalletLoaded(throwError= false) {
        if (this.wallet) {
            return true;
        }

        if (throwError) {
            throw Error("Wallet not loaded into object.");
        }

        return false;
    }
}

module.exports = Worker;
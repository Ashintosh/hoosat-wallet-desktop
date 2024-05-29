const { Wallet, initKaspaFramework } = require('@kaspa/wallet');

class Worker {
    #DEFAULT_NETWORK = 'hoosat';

    async createWallet(mnemonic= null, network = this.#DEFAULT_NETWORK) {
        await initKaspaFramework();

        this.wallet = (mnemonic) ? Wallet.fromMnemonic(mnemonic, { network })
            : new Wallet(null, null, { network });

        this.network = network;

        return this;
    }

    async createAddress(amount= 1, type= 'receive') {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        await initKaspaFramework();
        return wallet.addressManager.getAddresses(amount, type);
    }

    getBalance() {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        return wallet.balance;
    }

    async getAddressData(type= 'receive') {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        await initKaspaFramework();

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
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;

        await initKaspaFramework();
        await wallet.submitTransaction(tx);
    }

    async refresh() {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;

        await initKaspaFramework();
        await wallet.sync()
            .catch((Err) => {
                console.error("Refresh Error:", Err);
                return false;
            });
        return true;
    }

    async buildTransaction(txData) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;

        await initKaspaFramework();
        return wallet.composeTx(txData);
    }

    async estimateTransactionFee(txData) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;

        await initKaspaFramework();

        const txComp = this.buildTransaction(txData);
        let { txSize, mass } = txComp.tx.getMassAndSize();

        const minReqFee = wallet.minimumRequiredTransactionRelayFee(mass);
        const txFee = (txData.priorityFee) ? txData.priorityFee + minReqFee
            : minReqFee;

        return {
            fee: txFee,
            size: txSize
        };
    }
}

module.exports = Worker;
const { Wallet, initKaspaFramework } = require('@kaspa/wallet');
const { RPC } = require('@kaspa/grpc-node');
const path = require('path');
//const zlib = require('zlib');
const crypto = require('./Crypto');
const filestream = require('./FileStream');

class Worker {
    #DEFAULT_NETWORK = 'hoosattest';
    #DEFAULT_HOST    = '127.0.0.1';
    #DEFAULT_PORT    = '42422'; // 16111 testnet



    createWallet(mnemonic= null, { network = this.#DEFAULT_NETWORK, host = this.#DEFAULT_HOST, port = this.#DEFAULT_PORT } = {}) {
        const rpc = new RPC({ clientConfig: { host: `${host}:${port}` } });

        this.wallet = (mnemonic) ? Wallet.fromMnemonic(mnemonic, { network, rpc })
            : new Wallet(null, null, { network, rpc });

        this.network = { host: host, port: port, name: network };

        return this;
    }

    getAddresses(amount= 1, change= false) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        const type = (change) ? 'change' : 'receive';

        return wallet.addressManager.getAddresses(amount, type);
    }



    generateAddressData(change= false) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        const addressData = (change) ? wallet.addressManager.changeAddress.keypairs
            : wallet.addressManager.receiveAddress.keypairs;

        const addressIndexes = (change) ? wallet.addressManager.changeAddress.atIndex
            : wallet.addressManager.receiveAddress.atIndex

        let receiveData = {};
        for (let index= 0; index < Object.keys(addressIndexes).length; index++) {
            receiveData[index] = {
                address: addressIndexes[index],
                publicKey: addressData[addressIndexes[index]].publicKey.toString()
            }
        }

        return receiveData;
    }

    async refresh() {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        await wallet.sync()
            .catch((Err) => {
                console.error("Refresh Error:", Err);
                return false;
            });
        return true;
    }

    estimateTransaction(txData) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;

        const txComp = wallet.composeTx(txData);
        let {txSize, mass} = txComp.tx.getMassAndSize();

        const minReqFee = wallet.minimumRequiredTransactionRelayFee(mass);
        const txFee = (txData.priorityFee) ? txData.priorityFee + minReqFee
            : minReqFee;

        return {
            fee: txFee,
            size: txSize
        };
    }

    async wTest() {
        const testWallet = new Worker().createWallet('')

        console.log("Refresh")
        await testWallet.refresh()

        console.log('Balance:')
        console.log(testWallet.wallet.balance)

        console.log('Generate Addresses:')
        console.log(testWallet.wallet.addressManager.getAddresses(20, "receive"))
    }
}

(async () => {
    await initKaspaFramework();
    const worker = new Worker();
    await worker.wTest();
})();

module.exports = Worker;
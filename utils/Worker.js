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

    createAddress(amount= 1, type= 'receive') {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        return wallet.addressManager.getAddresses(amount, type);
    }

    getAddressData(type= 'receive') {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        const addressData = (type === 'receive') ? wallet.addressManager.changeAddress.keypairs
            : wallet.addressManager.receiveAddress.keypairs;

        const addressIndexes = (type === 'change') ? wallet.addressManager.changeAddress.atIndex
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

    async sendTransaction(tx) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        await wallet.submitTransaction(tx);
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

    buildTransaction(txData) {
        if (!this.wallet) throw Error("Wallet not loaded into object.");
        const wallet = this.wallet;
        return wallet.composeTx(txData);
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
        const test2Wallet = new Worker().createWallet();
        const taddress = test2Wallet.createAddress();
        await test2Wallet.refresh()
        console.log(test2Wallet.wallet.balance);
        const address= taddress[0].address;

        const testWallet = new Worker().createWallet('')

        console.log("Refresh")
        await testWallet.refresh()

        console.log('Balance:')
        console.log(testWallet.wallet.balance)

        console.log('Generate Addresses:')
        console.log(testWallet.wallet.addressManager.getAddresses(20, "receive"))

        const txData = {
            toAddr: address,
            amount: 10000000000
        }

        console.log('Fee:')
        txData.fee = testWallet.estimateTransaction(txData).fee;
        console.log(txData.fee)

        console.log("trans:")
        const tx = testWallet.buildTransaction(txData)
        console.log(tx)


        console.log(testWallet.sendTransaction(tx))

        let stop = false;

        while (!stop) {
            await test2Wallet.refresh()
            console.log(test2Wallet.wallet.balance);

            if (test2Wallet.wallet.balance > 0) {
                stop = true;
            }
        }
    }
}

(async () => {
    await initKaspaFramework();
    const worker = new Worker();
    await worker.wTest();
})();

module.exports = Worker;
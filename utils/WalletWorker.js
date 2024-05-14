const { Wallet, initKaspaFramework, TxSend } = require('@kaspa/wallet');
const { RPC } = require('@kaspa/grpc-node');
const path = require('path');
const zlib = require('zlib');
const crypto = require('./Crypto');
const filestream = require('./FileStream');

class WalletWorker {
    #DEFAULT_NETWORK = 'hoosat';
    #DEFAULT_HOST    = '127.0.0.1';
    #DEFAULT_PORT    = '42420'; // 16111 testnet
    #DEFAULT_ENC_KEY = 'hoosat-wallet_9KjLx';



    createWallet(mnemonic= null, { network = this.#DEFAULT_NETWORK, host = this.#DEFAULT_HOST, port = this.#DEFAULT_PORT } = {}) {
        const rpc = new RPC({ clientConfig: { host: `${host}:${port}` } });

        this.wallet = (mnemonic) ? Wallet.fromMnemonic(mnemonic, { network, rpc })
            : new Wallet(null, null, { network, rpc });

        this.network = { host: host, port: port, name: network };

        return this;
    }

    getAddresses(amount= 1, change= false) {
        const wallet = this.wallet;
        const type = (change) ? 'change' : 'receive';

        return wallet.addressManager.getAddresses(amount, type);
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

        const rpc = new RPC({ clientConfig: { host: `${this.network['host']}:${this.network['port']}` } });
        const network = this.network['name'];

        this.wallet = Wallet.fromMnemonic(walletData['mnemonic'], { network, rpc });

        return this;
    }

    async saveToFile(filename, filepath, password= this.#DEFAULT_ENC_KEY) {
        const wallet = this.wallet;
        const network = this.network;
        const receiveAddresses = this.generateAddressData();
        const changeAddresses = this.generateAddressData(true);

        let walletData = {
            name: filename,
            mnemonic: wallet.mnemonic,
            network: network,
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

    generateAddressData(change= false) {
        const wallet = this.wallet;
        const addressData = (change) ? wallet.addressManager.changeAddress.keypairs
            : wallet.addressManager.receiveAddress.keypairs;

        const addressIndexes = (change) ? wallet.addressManager.changeAddress.atIndex
            : wallet.addressManager.receiveAddress.atIndex

        console.log('=======================================================')
        console.log(wallet.addressManager.receiveAddress.atIndex);

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
        const wallet = this.wallet;
        await wallet.sync()
            .catch((Err) => {
                console.error("Refresh Error:", Err);
                return false;
            });
        return true;
    }

    async wTest() {

        //newWallet1.wallet.setLogLevel('verbose');

        const newWallet = await new WalletWorker()
            .importFromFile('/home/ash/Downloads/loaded-wallet.hoosat');



        await newWallet.refresh();

        console.log(newWallet.wallet.balance);

        console.log(newWallet.wallet.addressManager.receiveAddress.atIndex[1]);


        console.log(newWallet.wallet.balance.available)

        console.log("Balance: " + this.atomicToFloat(newWallet.wallet.balance.available) + " HTN");

        //console.log(await newWallet.wallet.composeTxAndNetworkFeeInfo(txData))
    }

    atomicToFloat(atomic) {
        return (atomic / 100000000).toFixed(8);
    }
}

(async () => {
    await initKaspaFramework();
    const worker = new WalletWorker();
    await worker.wTest();
})();

module.exports = WalletWorker;
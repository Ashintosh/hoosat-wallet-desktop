const { Wallet, initKaspaFramework } = require('@kaspa/wallet');
const { RPC } = require('@kaspa/grpc-node');
const { writeFile, readFile } = require('node:fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('./Crypto');

class WalletWorker {
    #DEFAULT_NETWORK = 'hoosat';
    #DEFAULT_HOST    = '127.0.0.1';
    #DEFAULT_PORT    = '16110'; // 16111 testnet

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

    // TODO: Finish file import
    importFromFile(filepath, password= null) {
        let fileData;
        readFile(filepath, 'binary', function(err, data) {
            console.log('+++++++++++++++++')
           if (err) {
               console.error("Read Error:", err);
               return;
           }
           fileData = data;
        });

        console.log(fileData);

        fileData = (password) ? crypto.decryptBytes(fileData, password) : Buffer.from(fileData);

        const decompressedData = JSON.stringify(zlib.gunzipSync(fileData));

        const walletData = JSON.parse(decompressedData);
        this.network =  walletData['network'];

        const rpc = new RPC({ clientConfig: { host: `${this.network['host']}:${this.network['port']}` } });
        const network = this.network['name'];

        this.wallet = Wallet.fromMnemonic(walletData['mnemonic'], { network, rpc });

        return this;
    }

    saveToFile(filename, filepath, password= null) {
        const receiveAddresses = this.generateAddressData();
        const changeAddresses = this.generateAddressData(true);

        let walletData = {
            name: filename,
            mnemonic: this.wallet.mnemonic,
            network: this.network,
            addresses: {
                receive: receiveAddresses,
                change: changeAddresses
            },
            transactions: { }
        };

        zlib.gzip(JSON.stringify(walletData), (err, compressedData) => {
            if (err) {
                console.error('Compression Error:', err);
                return;
            }
            walletData = compressedData;
        });

        let walletBuffer = (password) ? crypto.encryptBytes(Buffer.from(JSON.stringify(walletData)), password)
            : JSON.stringify(walletData, false, 4);

        const absolutePath = path.join(filepath.endsWith('/') ? filepath : filepath + '/', filename + '.hoosat');
        writeFile(absolutePath, walletBuffer, err => {
            if (err) {
                console.error('Write Error:', err);
                return false;
            }
        });

        return filepath;
    }

    generateAddressData(change= false) {
        const addressData = (change) ? this.wallet.addressManager.changeAddress.keypairs
            : this.wallet.addressManager.receiveAddress.keypairs;

        const addressIndexes = (change) ? this.wallet.addressManager.changeAddress.atIndex
            : this.wallet.addressManager.receiveAddress.atIndex

        let receiveData = {};
        for (let index= 0; index < Object.keys(addressIndexes).length; index++) {
            receiveData[index] = {
                address: addressIndexes[index],
                publicKey: addressData[addressIndexes[index]].publicKey.toString()
            }
        }

        return receiveData;
    }

    async wTest() {

        const newWallet1 = new WalletWorker().createWallet();
        //const newWalletRestore = new WalletWorker().createWallet(newWallet1.wallet.mnemonic);
        //newWallet1.wallet.setLogLevel('verbose');

        newWallet1.getAddresses('receive', 3);
        newWallet1.getAddresses('change', 3);


        console.log(newWallet1.wallet.addressManager.all)
        console.log('=============================================================')

        newWallet1.saveToFile('wallet', '/home/ash/Downloads/')

        //newWalletRestore.getAddresses('receive', 3);
        //newWalletRestore.getAddresses('change', 3);

        const newWallet2 = new WalletWorker().importFromFile('/home/ash/Downloads/wallet.hoosat');
        newWallet2.getAddresses('receive', 3);
        newWallet2.getAddresses('change', 3);

        console.log(newWallet2.wallet.addressManager.all)


    }
}

(async () => {
    await initKaspaFramework();
    const worker = new WalletWorker();
    await worker.wTest();
})();
const { Wallet, initKaspaFramework } = require('@kaspa/wallet');
const { RPC } = require('@kaspa/grpc-node');

class WalletWorker {
    constructor(mnemonic= null, { network = 'hoosat', host = '127.0.0.1', port = '42420' } = {}) {
        const rpc = new RPC({ clientConfig: { host: `${host}:${port}` } });

        this.wallet = (mnemonic) ? Wallet.fromMnemonic(mnemonic, { network, rpc })
            : new Wallet(null, null, { network, rpc })

        this.wallet.setLogLevel('verbose');

        this.mnemonic = (mnemonic) ? mnemonic : this.wallet.mnemonic ;
        this.network = network;
        this.host = host;
        this.port = port;
    }

    createAddresses(type= 'receive', amount= 1) {
        const wallet = this.wallet;
        return wallet.addressManager.getAddresses(amount, type);
    }

    getBalance() {
        const wallet = this.wallet;
        return wallet.balance;
    }

    getAllAddresses() {
        const wallet = this.wallet;
        return wallet.addressManager.all;
    }

    /*
    static async generateMnemonic(encrypted= false, password= null) {
        const { network, host, port } = this;

        const rpc = new RPC({ clientConfig: { host: `${host}:${port}` } });
        const wallet = new Wallet(null, null, { network, rpc });
        return (encrypted) ? await wallet.export(password) : wallet.mnemonic;

    }
     */

    async wTest() {
        const newWallet1 = new WalletWorker();
        console.log("Address: " + newWallet1.createAddresses()[0]['address']);

        console.log("All Addresses: ");
        console.log(Object.keys(newWallet1.getAddresses())[0]);
    }
}

(async () => {
    await initKaspaFramework();
    const worker = new WalletWorker();
    await worker.wTest();
})();
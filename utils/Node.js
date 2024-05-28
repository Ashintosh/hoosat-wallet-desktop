// This file is currently not in use

const { RPC } = require('@kaspa/grpc-node');
const { Client } = require('@kaspa/grpc');

class Node {

    API_BASE = 'https://api.network.hoosat.fi';

    constructor(host= '127.0.0.1', port= '42422', network= 'hoosat') {
        this.host    = host;
        this.port    = port;
        this.network = network;
    }

    async rTest() {
        console.log('start')

        const client = new Client({
            host:"127.0.0.1:42422"
        });

        client.onConnect(async () => {
            try {
                client.verbose = true;

                let response = await client.call('submitTransactionRequest', {address:'hoosattest:qrmlxs6dqxa393z2j5kj6r8st6dsakyfy34vhxewgnaq35lea5gr7sxkajqzc'});
                console.log(response);
            } catch (Err) {
                console.error("Error:", Err);
            }
        });

        client.connect().catch((Err) => {
            console.error("Error:", Err);
        });
    }
}

(async () => {
    const node = new Node();
    await node.rTest();
})();

module.exports = Node;
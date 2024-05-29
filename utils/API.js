const axios = require('axios')

class API {

    API_BASE = 'https://api.network.hoosat.fi';

    constructor(host= '127.0.0.1', port= '42422', network= 'hoosat') {
        this.host    = host;
        this.port    = port;
        this.network = network;
    }

    async getTransactionsByAddress(address) {
        const route = `${this.API_BASE}/addresses/${address}/full-transactions`;
        const params = {
            resolve_previous_outpoints: 'light'
        }
        const addressData = await this.call(route, params);

        let transactions = [ ];

        for (let i = 0; i < addressData.length; i++) {
            let totalInput = 0;
            if (addressData[i].inputs !== null) {
                for (const input of addressData[i].inputs) {
                    if (input.previous_outpoint_address === address) {
                        totalInput += input.previous_outpoint_amount;
                    }
                }
            }

            let totalOutput = 0;
            if (addressData[i].outputs !== null) {
                for (const output of addressData[i].outputs) {
                    if (output.script_public_key_address === address) {
                        totalOutput += output.amount;
                    }
                }
            }

            let type = totalOutput < 1 ? 'send' : 'receive';
            let amount = type === 'send' ? totalInput : totalOutput;

            transactions.push({
                type: type,
                id: addressData[i].transaction_id,
                hash: addressData[i].hash,
                mass: addressData[i].mass,
                blockHash: addressData[i].block_hash,
                time: addressData[i].block_time,
                accepted: addressData[i].is_accepted,
                AcceptingBlockHash: addressData[i].accepting_block_hash,
                amount: amount

            });
        }

        return transactions;
    }

    async getUtxosByAddress(address) {
        const route = `${this.API_BASE}/addresses/${address}/utxos`;
        const utxoData = await this.call(route);

        let utxos = [ ];

        for (const utxo of utxoData) {
            utxos.push({
                id: utxo.outpoint.transactionId,
                address: utxo.address,
                amount: utxo.utxoEntry.amount,
            });
        }

        return utxos;
    }

    async sendTransaction(tx) {
        const route = `${this.API_BASE}/transactions`;
        return await this.call(route, tx);
    }

    async call(route, params) {
        const options = {
            headers: { "Content-Type": "application/json" },
            params: params
        };

        try {
            const response = await axios.get(route, options);
            return response.data;
        } catch (Err) {
            console.error("API Error:", Err);
            throw Err;
        }
    }

    async rTest() {
        console.log(await this.getUtxosByAddress('hoosat:qrhed37kge64z6agkq82l7xce423ugdf308ehtsh72y2nee7x2kvzxv6xqwd4'))
    }
}

(async () => {
    const api = new API();
    await api.rTest();
})();

module.exports = API;
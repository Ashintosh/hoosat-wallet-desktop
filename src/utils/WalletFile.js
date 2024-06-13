

export function validateFileData(payload) {
    return new Promise((resolve) => {
        window.ipc.send('CREATE_WALLET', payload);
        window.ipc.once('WALLET_CREATED', (isValid) => {
            resolve(JSON.parse(isValid));
        });
    });
}

export async function validateSeed(seed) {
    return await new Promise((resolve) => {
        window.ipc.send('VALIDATE_SEED', seed);
        window.ipc.once('SEED_VALIDATED', (isValid) => {
            resolve(JSON.parse(isValid));
        });
    });
}
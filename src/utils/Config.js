

export async function saveConfig(walletPath) {
    const configPath = await getConfigPath();

    return await new Promise((resolve) => {
        const payload = {
            path: configPath,
            data: {
                walletPath: walletPath
            }
        };

        window.ipc.send('WRITE_FILE', payload);
        window.ipc.once('FILE_WRITTEN', (result) => {
            resolve(result);
        });
    });
}

export async function readConfig() {
    const configPath = await getConfigPath();

    return await new Promise((resolve) => {
        window.ipc.send('READ_FILE', configPath);
        window.ipc.once('FILE_READ_DATA', (result) => {
            resolve(result);
        });
    });
}

export async function getConfigPath() {
    return await new Promise((resolve) => {
        window.ipc.send('GET_SPECIAL_PATH', 'userData');
        window.ipc.once('SPECIAL_PATH_RESULT', (path) => {
            resolve(path + '/wallet_config.json');
        });
    });
}
const { app, ipcMain } = require('electron');

// IPC backend requests
// WINDOW_STATE might get used in the future if I ever decide to have a custom title bar
ipcMain.on('WINDOW_STATE', (event, payload) => {
    const remote = require('electron');

    switch (payload) {
        case 'minimized': remote.BrowserWindow.getFocusedWindow().minimize(); break;
        case 'maximized': remote.BrowserWindow.getFocusedWindow().maximize(); break;
        case 'closed'   : remote.BrowserWindow.getFocusedWindow().close();    break;
    }
});

ipcMain.on('GET_SPECIAL_PATH', (event, payload) => {
    const specialPath = app.getPath(payload);
    event.reply('SPECIAL_PATH_RESULT', specialPath);
});

ipcMain.on('OPEN_DIRECTORY_DIALOG', (event) => {
    const { dialog } = require('electron');
    dialog.showOpenDialog({ properties: ['openDirectory'] })
        .then(result => {
            if (!result.canceled) {
                event.reply('DIRECTORY_SELECTED', result.filePaths[0]);
            }
        })
        .catch(err => {
            console.log(err);
        });
});

ipcMain.on('OPEN_FILE_DIALOG', (event) => {
    const { dialog } = require('electron');
    dialog.showOpenDialog({ properties: ['openFile'] })
        .then(result => {
            if (!result.canceled) {
                event.reply('FILE_SELECTED', result.filePaths[0]);
            }
        })
        .catch(err => {
            console.log(err);
        });
});

ipcMain.on('WRITE_FILE', async (event, payload) => {
    const filestream = require('./utils/FileStream');

    try { await filestream.writeFileBytes(payload.path, JSON.stringify(payload.data, null, 2)); }
    catch (err) { event.reply('FILE_WRITTEN', false); }

    event.reply('FILE_WRITTEN', true);
});

ipcMain.on('READ_FILE', async (event, payload) => {
    const filestream = require('./utils/FileStream');

    try {
        const fileData = await filestream.readFileBytes(payload);

        if (!fileData.toString()) {
            event.reply('FILE_READ_DATA', false);
        }

        event.reply('FILE_READ_DATA', fileData.toString());
    }
    catch (err) { event.reply('FILE_READ_DATA', false); }
});

ipcMain.on('CREATE_WALLET', async (event, payload) => {
    const Wallet = require('./utils/Wallet');
    let actionResult;

    if (payload.action === 'create') {
        const walletData = await new Wallet().create()
        const errorResult = await walletData.methodChain.saveToFile(payload.directory, payload.password);
        walletData.methodChain = undefined; // Prevent returning circular structure
        actionResult = walletData;

        if (errorResult) {
            event.reply('WALLET_CREATED', JSON.stringify({
                status: false,
                error: errorResult
            }));
        }
    } else if (payload.action === 'restore') {
        if (!payload.useFile) {
            const walletData = await new Wallet().importFromSeed(payload.seed);
            const errorResult = await walletData.methodChain.saveToFile(payload.directory, payload.password);
            walletData.methodChain = undefined; // Prevent returning circular structure
            actionResult = walletData;

            if (errorResult) {
                event.reply('WALLET_CREATED', JSON.stringify({
                    status: false,
                    error: errorResult
                }));
            }
        } else {
            actionResult = await new Wallet().importFromFile(payload.directory, payload.password);
        }
    }

    event.reply('WALLET_CREATED', JSON.stringify(actionResult));
});

ipcMain.on('VALIDATE_SEED', async (event, payload) => {
    const Wallet = require('./utils/Wallet');

    if (payload.split(' ').length !== 12) {
        event.reply('SEED_VALIDATED', JSON.stringify({
            status: false,
            error: 'not-twelve-words',
            seed: payload
        })); return;
    }

    const validated = await new Wallet().importFromSeed(payload);
    if (!validated.status) {
        event.reply('SEED_VALIDATED', JSON.stringify({
            status: false,
            error: 'invalid-seed',
            seed: payload
        })); return;
    }

    event.reply('SEED_VALIDATED', JSON.stringify({
        status: true,
        seed: payload
    }));
});


// Rout Switches

ipcMain.on('GOTO_ROUTE', (event, payload) => {
    event.reply('CHANGE_ROUTE', JSON.stringify(payload));
});
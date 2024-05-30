const { app, BrowserWindow, ipcMain } = require('electron');

const url = require('url');
const path = require('path');
const Wallet = require("./utils/Wallet");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        resizable: false,
        frame: true,
        title: 'Hoosat Desktop Wallet',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModules: false,
            sandbox: true,
            preload: path.resolve(__dirname, './dist/preload.js')
        }
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `./dist/index.html`),
            protocol: 'file:',
            slashes: true
        })
    );

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.enableSandbox();

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('ready', function () {
    createWindow();

    app.on('activate', function () {
        if (mainWindow === null) createWindow();
    });
});

// IPC backend requests TODO: Move these to their own class

ipcMain.on('WINDOW_STATE', (event, payload) => {
    const remote = require('electron');
    switch (payload) {
        case 'minimized': remote.BrowserWindow.getFocusedWindow().minimize(); break;
        case 'maximized': remote.BrowserWindow.getFocusedWindow().maximize(); break;
        case 'closed'   : remote.BrowserWindow.getFocusedWindow().close();    break;
    }
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

ipcMain.on('CREATE_WALLET', async (event, data) => {
    const Wallet = require('./utils/Wallet');

    const wallet = await new Wallet().create();
    let createdResult = await wallet.saveToFile(data.directory, data.password);

    event.reply('WALLET_CREATED', createdResult);
});

ipcMain.on('CHECK_DIR_EXISTS', async (event, data) => {
    const Wallet = require('./utils/Wallet');

    const existsResult = new Wallet().fileExists(data);
    event.reply('DIR_EXISTS', existsResult);
});

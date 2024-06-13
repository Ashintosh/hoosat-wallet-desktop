const { app, BrowserWindow } = require('electron');

// const { inspect } = require('util')
const url = require('url');
const path = require('path');

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
    require('./ipcListeners');
    createWindow();

    app.on('activate', function () {
        if (mainWindow === null) createWindow();
    });
});
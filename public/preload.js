// IPC solution from reZach on StackOverflow
// https://web.archive.org/web/20240508125056/https://stackoverflow.com/questions/44391448/electron-require-is-not-defined/59888788#59888788

const { contextBridge, ipcRenderer } = require('electron');

const validSendChannels = ['WINDOWS_STATE', 'OPEN_DIRECTORY_DIALOG', 'CREATE_WALLET', 'CHECK_DIR_EXISTS'];
const validOnChannels = ['DIRECTORY_SELECTED', 'WALLET_CREATED', 'DIR_EXISTS'];

const validChannels = [...validSendChannels, ...validOnChannels];
contextBridge.exposeInMainWorld(
    'ipc', {
        send: (channel, data) => {
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            if (validChannels.includes(channel)) {
                // Strip event as it includes `sender` and is a security risk
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        once: (channel, func) => {
            if (validChannels.includes(channel)) {
                const listener = (event, ...args) => {
                    func(...args);
                    ipcRenderer.removeListener(channel, listener);
                };
                ipcRenderer.on(channel, listener);
            }
        }
    },
);
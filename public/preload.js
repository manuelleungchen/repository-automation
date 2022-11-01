const { ipcRenderer, contextBridge } = require('electron');
// import { channels } from '../src/shared/constants';


contextBridge.exposeInMainWorld('api', {
    // Invoke Methods
    // testInvoke: (args) => ipcRenderer.invoke('test-invoke', args),
    // Send Methods
    // testSend: (args) => ipcRenderer.send('test-send', args),
    // Receive Methods
    // testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data) }),
    removeAll: () => ipcRenderer.removeAllListeners(),

    // IPC from Main to Renderer
    updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, dataMain) => { callback(dataMain) }),
    vpnStatus: (callback) => ipcRenderer.on("vpn-status", (event, dataMain) => { callback(dataMain) }),
    updateReposPath: (callback) => ipcRenderer.on("update-repos-path", (event, dataMain) => { callback(dataMain) }),
    getConfigData: (callback) => ipcRenderer.on("get-config-data", (event, dataMain) => { callback(dataMain) }),

    // IPC from Renderer to Main, back to Renderer

    selectFolder: (args) => ipcRenderer.invoke("select-folder", args),
    getRepos: (args) => ipcRenderer.invoke('get-repos', args),
    updateRepos: (repos, tasks) => ipcRenderer.invoke('update-repos', repos, tasks)
});

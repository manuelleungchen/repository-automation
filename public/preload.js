const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    removeAll: () => ipcRenderer.removeAllListeners(),

    // Receive Methods
    // IPC from Main to Renderer
    updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, arg1, arg2) => { callback(arg1, arg2) }),
    vpnStatus: (callback) => ipcRenderer.on("vpn-status", (event, dataMain) => { callback(dataMain) }),
    updateReposPath: (callback) => ipcRenderer.on("update-repos-path", (event, dataMain) => { callback(dataMain) }),
    getConfigData: (callback) => ipcRenderer.on("get-config-data", (event, dataMain) => { callback(dataMain) }),

    // Invoke Methods
    // IPC from Renderer to Main, back to Renderer
    selectFolder: (args) => ipcRenderer.invoke("select-folder", args),
    getRepos: (args) => ipcRenderer.invoke('get-repos', args),
    updateRepos: (repos, tasks) => ipcRenderer.invoke('update-repos', repos, tasks)
});

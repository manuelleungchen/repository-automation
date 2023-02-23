const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    removeAll: () => ipcRenderer.removeAllListeners(),

    // Receive Methods
    // IPC from Main to Renderer
    updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, arg1, arg2) => { callback(arg1, arg2) }),
    gitlabStatus: (callback) => ipcRenderer.on("gitlab-status", (event, dataMain) => { callback(dataMain) }),

    // Invoke Methods
    // IPC from Renderer to Main, back to Renderer
    updateReposPath: (args) => ipcRenderer.invoke("update-repos-path", args),
    selectFolder: (args) => ipcRenderer.invoke("select-folder", args),
    getConfigData: (args) => ipcRenderer.invoke("get-config-data", args),
    getRepos: (args) => ipcRenderer.invoke('get-repos', args),
    updateRepos: (repos, tasks, commitMessage) => ipcRenderer.invoke('update-repos', repos, tasks, commitMessage)
});

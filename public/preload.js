const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    removeAll: () => ipcRenderer.removeAllListeners(),

    // Receive Methods
    // IPC from Main to Renderer
    updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, arg1, arg2) => { callback(arg1, arg2) }),
    gitlabStatus: (callback) => ipcRenderer.on("gitlab-status", (event, dataMain) => { callback(dataMain) }),
    updateAvailable: (callback) => ipcRenderer.on("update-available", (event) => { callback() }),
    updateDownloaded: (callback) => ipcRenderer.on("update-downloaded", (event) => { callback() }),

    // Send Methods
    // IPC from Renderer to Main
    restartApp: (callback) => ipcRenderer.send("restart-app", (event) => { callback() }),
    cancelAutomation: (args) => ipcRenderer.send("cancel-automation", args),
    saveToken: (args) => ipcRenderer.send("save-token", args),


    // Invoke Methods
    // IPC from Renderer to Main, back to Renderer
    getRepos: (args) => ipcRenderer.invoke('get-repos', args),
    updateRepos: (repos, tasks, commitMessage) => ipcRenderer.invoke('update-repos', repos, tasks, commitMessage),
    selectFolder: (args) => ipcRenderer.invoke("select-folder", args),
    getConfigData: (args) => ipcRenderer.invoke("get-config-data", args),
    getUserData: (args) => ipcRenderer.invoke("get-user-data", args),
    getGitlabRepos: (args) => ipcRenderer.invoke("get-gitlab-repos", args),
    cloneRepos: (args) => ipcRenderer.invoke("clone-repos", args)
});

const { ipcRenderer, contextBridge } = require('electron');
// import { channels } from '../src/shared/constants';


contextBridge.exposeInMainWorld('api', {
    // Invoke Methods
    // testInvoke: (args) => ipcRenderer.invoke('test-invoke', args),
    // Send Methods
    // testSend: (args) => ipcRenderer.send('test-send', args),
    // Receive Methods
    // testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data) }),

    // quitApp: () => ipcRenderer.send('quit-app'),

    // onUpdateCounter: (callback) => ipcRenderer.on('ping', (event, ...args) => listener(...args)),

    // sendMessage: (args) => ipcRenderer.send('send-message', args),

    // receiveMessage: (callbackfun) => ipcRenderer.on('receive-message', (event, data) => { callbackfun(data)})

    // testSend: (args) => ipcRenderer.send("test-send", args),

    // testReceive: (callback) => ipcRenderer.on("test-receive", (event, dataMain) => { callback(dataMain) }),

    // testInvoke: (args) => ipcRenderer.invoke('test-invoke', args),

    // updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, dataMain) => { callback(dataMain) }),


    removeAll: () => ipcRenderer.removeAllListeners(),


        // IPC from Main to Renderer
        updateProgressbar: (callback) => ipcRenderer.on("update-progressbar", (event, dataMain) => { callback(dataMain) }),

                // IPC from Renderer to Main, back to Renderer

    selectFolder: (args) => ipcRenderer.invoke("select-folder", args),
    getRepos: (args) => ipcRenderer.invoke('get-repos', args),
    updateRepos: (repos, tasks) => ipcRenderer.invoke('update-repos', repos, tasks)




});

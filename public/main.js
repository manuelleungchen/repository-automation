// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');  // electron
const isDev = require('electron-is-dev'); // To check if electron is in development mode
const path = require('path');
const fs = require("fs");
const { Worker } = require('worker_threads')

const ASSETS_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(app.getAppPath(), `extraResources`);

let mainWindow;

// Read config.json file which contain latest ILOs versions.
const configFile = path.join(ASSETS_PATH, `config.json`);
const configContent = JSON.parse(fs.readFileSync(configFile, { encoding: "utf-8" }));

let connectionInterval = null  // Global variable for setInterval

// Initializing the Electron Window
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000, // width of window
        height: 600, // height of window
        minWidth: 400, // min width of window
        minHeight: 400, // min height of window
        // icon: path.join(ASSETS_PATH, './logo3.png'),
        webPreferences: {
            // The preload file where we will perform our app communication
            preload: isDev
                ? path.join(app.getAppPath(), './public/preload.js') // Loading it from the public folder for dev
                : path.join(app.getAppPath(), './build/preload.js'), // Loading it from the build folder for production
            // worldSafeExecuteJavaScript: true, // If you're using Electron 12+, this should be enabled by default and does not need to be added here.
            contextIsolation: true, // Isolating context so our app is not exposed to random javascript executions making it safer.
            nodeIntegrationInWorker: true  // For Multithreading with Web Workers to run scripts in background threads.
        },
    });

    // and loading a webpage inside the electron window we just created
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000' // Loading localhost if dev mode
            : `file://${path.join(__dirname, '../build/index.html')}` // Loading build file if in production
    )

    // Setting Window Icon - Asset file needs to be in the public/images folder.
    // mainWindow.setIcon(path.join(__dirname, 'images/appicon.ico'));

    // Open the DevTools.
    // In development mode, if the window has loaded, then load the dev tools.
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // When Electron window finish loading,
    mainWindow.webContents.on('did-finish-load', () => {
        console.log("Finished loading")
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Create the mainWindow
app.whenReady().then(createWindow)

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
    app.quit()
})

// When electron app is on focus, set interval to call checkVPNConnection func
app.on('browser-window-focus', (event, win) => {
    console.log('browser-window-focus', win.webContents.id)
    checkVPNConnection()
    connectionInterval = setInterval(checkVPNConnection, 600000) // Check VPN every 10 mins
})

// // When electron app is out focus, stop interval calling checkVPNConnection func
app.on('browser-window-blur', (event, win) => {
    console.log('browser-window-blur', win.webContents.id)
    clearInterval(connectionInterval);
})

// Catch Error: net::ERR_NAME_NOT_RESOLVED from HTTP/HTTPS requests inside checkVPNConnection()
process.on('uncaughtException', (err) => {
    if (err.toString() === "Error: net::ERR_NAME_NOT_RESOLVED") {
        console.log("VPN disconnected")
        mainWindow.webContents.send('vpn-status', false)
    }
})


// This function checks if there is a VPN connection by issuing HTTP/HTTPS requests using Chromium's native networking library
function checkVPNConnection() {
    const { net } = require('electron')  // Import net module (client-side API for issuing HTTP(S) requests).
    const request = net.request('https://gitlab.tvo.org')
    request.on('response', (response) => {
        console.log("VPN connected")
        mainWindow.webContents.send('vpn-status', true)
    })
    request.end()
}

// This function creates Native OS Notification
function showNotification(message) {
    // Options for notifications
    const options = {
        title: 'Repository Automator',
        // subtitle: subtitle,
        body: message,
        silent: false,
        // ASSETS_PATH, `worker.js`
        // icon: path.join(ASSETS_PATH, './logo3.png'),
        // icon: path.join(__dirname, '../assets/logo3.png'),
        timeoutType: 'default'
    }
    new Notification(options).show()
}

// This function gets a list of all Elementary course repos
function getAllElementaryRepos(parentDirPath) {
    // Store all elementary repos
    const dirFolders = fs
        .readdirSync(parentDirPath, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => ({ name: dir.name, path: path.join(parentDirPath, dir.name), selected: false, hidden: false }))
        .filter((dir) => {
            return fs.existsSync(path.join(dir.path, "lessons")) && dir.path.includes("elem");
        });
    return dirFolders;
}

// This function executes git pull command in shell
function gitPull(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "gitPull", repoPath: repoPath } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function updates the ILOs versions in package.json and make sure that installed ILOs are referenced in index.js
function updateILOsVersion(filePath) {
    // This function updated the ILOs versions in package.json

    // Read data from package.json and index.js
    const packageFileData = fs.readFileSync(`${path.join(filePath, "package.json")}`);
    let packageFileContent = JSON.parse(packageFileData);
    const indexFileData = fs.readFileSync(`${path.join(filePath, "src/index.js")}`);
    let indexFileContent = indexFileData.toString();

    // List all ILOs included in the course
    let ILOs = [];

    // Loop through each keys on config.json
    for (const [key] of Object.entries(configContent.ilosVersions)) {
        // Check which dependencies are included in package.json
        if (packageFileContent.dependencies.hasOwnProperty(`${key}`)) {

            // Update package.json dependencies to match most stable version of each ILOs
            packageFileContent.dependencies[key] = configContent.ilosVersions[key];
            // Saved all ILOs installed in each course
            ILOs.push(key);
        }
    }
    // Write new content into package.json
    fs.writeFileSync(`${path.join(filePath, "package.json")}`, JSON.stringify(packageFileContent, null, 2))

    // Loop through each item on ILOs array
    ILOs.forEach(ilo => {
        // Get ILO name
        const ILOname = ilo.split("/")[1];
        // Create new Regex "^\/\/\s*(require\(('|")@digital-learning\/ILO_NAME.*\n)""
        const regex_comment = new RegExp(`^\\/\\/\\s*(require\\(('|")@digital-learning\\/${ILOname}.*\\n)`, "gm");
        // match lines
        // starting with //
        // ignore following whitespaces
        // having text "app" afterwards, capture from app to line-ending as group ($1 reference)
        const replacement = `$1`;

        // Uncomment lines in index.js
        indexFileContent = indexFileContent.replace(regex_comment, replacement);
    })
    // Write new content into index.js
    fs.writeFileSync(`${path.join(filePath, "src/index.js")}`, indexFileContent)
    // return "ILOs included in index.js";
}

// This function executes rm -f and rm -r commands in shell for vendor.min.js, tvo_k8.css, package-lock.json, and node_modules folder
function deleteBuildFiles(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "deleteBuildFiles", repoPath: repoPath } });
        worker.once('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function make sure each json file in widgets folder contains "department": "elem"
function addDepartmentProperty(widgetsPath) {
    const widgetsFiles = fs
        .readdirSync(widgetsPath, { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => path.join(widgetsPath, file.name))
        .filter((file) => {
            // Match only json files containing at least one of the ILOs name in RegEx
            return file.match(/flowchart|flashcards|sorting|fill-in-the-blank|multiple-choice|matching/) && file.includes(".json");
        });

    widgetsFiles.forEach((jsonPath) => {
        const jsonFileData = fs.readFileSync(jsonPath);

        let jsonFileContent = JSON.parse(jsonFileData);

        // If key and value "department" = "elem" is not present, add it.
        if (!(jsonFileContent.hasOwnProperty("department")) || jsonFileContent.department !== "elem") {
            jsonFileContent.department = "elem";
            fs.writeFileSync(jsonPath, JSON.stringify(jsonFileContent, null, 2))
            console.log(`Added 'elem' ${jsonPath}`)
        }
    })
}

// This function executes npm install and npm run build commands in shell
function npmRunBuild(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "npmRunBuild", repoPath: repoPath } });
        worker.once('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// End of all script functions

// Handle request to get repos
ipcMain.handle("get-repos", () => {
    let savedReposLoc;
    checkVPNConnection()

    try {
        // Here we try to update read reposLocation.json file from userdata folder.
        savedReposLoc = fs.readFileSync(path.join(app.getPath("userData"), "reposLocation.json"), { encoding: "utf-8" });
        // Send repos path to renderer
        mainWindow.webContents.send('update-repos-path', JSON.parse(savedReposLoc).reposLocation)
        // Send list of tasks 
        mainWindow.webContents.send('get-config-data', configContent["tasksList"])
    }
    catch (err) {
        // Here we print the error when the file was not found, and return empty array.
        console.log(err)
        return []
    }
    // Return repos location saved on reposLocation.json file
    return getAllElementaryRepos(JSON.parse(savedReposLoc).reposLocation)
})

// Handle request to update repos
ipcMain.handle("update-repos", async (event, reposPath, tasks) => {
    // This will loop through selected repos perfom the following actions:

    // Loop through all selected tasks and merge all the functions needed.
    let functionsList = [];
    tasks.forEach(task => {
        functionsList = [...functionsList, ...configContent["functionsList"][task]];
    })
    functionsList = [...new Set(functionsList)]

    // Create progress bar
    let progressBarValue = 0
    const progressIncrement = 1 / (reposPath.length * functionsList.length)

    mainWindow.setProgressBar(progressBarValue)
    // console.log(`List of functions to run ${functionsList}`)

    for (let index = 0; index < reposPath.length; index++) {
        mainWindow.setProgressBar(progressBarValue)

        for (let i = 0; i < functionsList.length; i++) {
            switch (functionsList[i]) {
                case "gitPull":
                    // This function updates course by doing a git pull command
                    await gitPull(reposPath[index]);
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100))
                    break;
                case "updateILOsVersion":
                    // This function updates the ILOs versions in package.json and index.js
                    updateILOsVersion(reposPath[index]);
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100))
                    break;
                case "deleteBuildFiles":
                    // Delete tvo_k8.css, vendor.min.js, node_modules and package-lock.json
                    await deleteBuildFiles(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100))
                    break;

                case "addDepartmentProperty":
                    // Update widgets .json files
                    addDepartmentProperty(`${path.join(reposPath[index], "widgets")}`)
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100))
                    break;
                case "npmRunBuild":
                    // Run Script for npm install and npm run build (possible git commands)
                    await npmRunBuild(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100))
                    break;
                default:
            }
        }
        console.log(`Finished with ${reposPath[index]} repo`)
        // Show diff notification depending this is the last repo in the loop
        index + 1 < reposPath.length ?
            showNotification(`Finished with ${path.basename(reposPath[index])}`) :
            showNotification("Automation completed");
    }
    // Once done with all repos, hide progressbar
    mainWindow.setProgressBar(-1)
    return "updated";

})

// Handle request to select folder
ipcMain.handle('select-folder', async (event, data) => {
    // Config options for dialog prompt
    let options = {
        title: 'Select location of courses',
        buttonLabel: 'Select',
        properties: ['openDirectory']
    }

    // Open defauult dialog menu to prompt user to pick location of repos
    const result = await dialog.showOpenDialog(options);
    const { filePaths, canceled } = result;
    // Handle prompt cancelation
    if (canceled) {
        return ["canceled", ""];
    }
    else {
        // Create json data
        let jsonData = {
            "reposLocation": `${filePaths[0]}`
        }
        // Write json data into a json file in 
        fs.writeFileSync(`${path.join(app.getPath("userData"), "reposLocation.json")}`, JSON.stringify(jsonData, null, 2))

        // Send repos path to renderer
        return ["saved", filePaths[0]];
    }
})

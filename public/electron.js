// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');  // electron
const path = require('path');
const fs = require("fs");
const { Worker } = require('worker_threads')
const { autoUpdater } = require('electron-updater');  // electron-updater
const { net } = require('electron')  // Import net module (client-side API for issuing HTTP(S) requests).

// Useful for Electron apps as GUI apps on macOS and Linux do not inherit the $PATH defined in your dotfiles (.bashrc/.bash_profile/.zshrc/etc).
// Only Version 3.0 works.
const fixPath = require('fix-path');
const { error } = require('console');

const ASSETS_PATH = app.isPackaged ? path.join(process.resourcesPath, '') : path.join(app.getAppPath(), `extraResources`);

let mainWindow;

// Read appConfig.json file which contain latest ILOs versions.
const configFile = path.join(ASSETS_PATH, `appConfig.json`);
const configContent = JSON.parse(fs.readFileSync(configFile, { encoding: "utf-8" }));

let connectionInterval = null  // Global variable for setInterval

let isUpdateReposCancelled = false;  // Global variable to store if UpdateRepos was cancelled

// Initializing the Electron Window
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000, // width of window
        height: 600, // height of window
        minWidth: 450, // min width of window
        minHeight: 450, // min height of window
        webPreferences: {
            // The preload file where we will perform our app communication
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true, // Isolating context so our app is not exposed to random javascript executions making it safer.
            nodeIntegrationInWorker: true  // For Multithreading with Web Workers to run scripts in background threads.
        },
    });

    // In production, set the initial browser path to the local bundle generated
    // by the Create React App build process.
    // In development, set it to localhost to allow live/hot-reloading.
    const appURL = app.isPackaged ? `file://${__dirname}/../build/index.html` : "http://localhost:3000";
    mainWindow.loadURL(appURL);

    // If app is packaged, fixed the $PATH on macOS and Linux
    if (app.isPackaged) {
        fixPath();
    }

    // Automatically open Chrome's DevTools in development mode.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    // When Electron window finish loading,
    mainWindow.webContents.on('did-finish-load', () => {
        console.log("Finished loading")
    })

    // Check whether there are any available updates once the main window is ready. If there are, they will automatically be downloaded
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
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

// When electron app is on focus, set interval to call checkGitlabConnection func
app.on('browser-window-focus', (event, win) => {
    console.log("App in focus")
    checkGitlabConnection()
    connectionInterval = setInterval(checkGitlabConnection, 600000) // Check Gitlab Online Status every 10 mins
})

// // When electron app is out focus, stop interval calling checkGitlabConnection func
app.on('browser-window-blur', (event, win) => {
    console.log("App not in focus")
    clearInterval(connectionInterval);   // Reset counter of connectionInterval back to 0
})

// This function checks if gitlab.com is online by issuing HTTP/HTTPS requests
async function checkGitlabConnection() {
    try {
        const response = await net.fetch('https://gitlab.com/tvontario/digital-learning-projects');
        console.log("gitlab.com is online")
        mainWindow.webContents.send('gitlab-status', true);
    } catch (error) {
        console.log("gitlab.com is offline")
        console.log(error)
        mainWindow.webContents.send('gitlab-status', false);
    }
}

// This function creates Native OS Notification
function showNotification(message) {
    // Options for notifications
    const options = {
        title: 'Repository Automator',
        body: message,
        silent: false,
        timeoutType: 'default'
    }
    new Notification(options).show()
}

function showErrorBox(message) {
    dialog.showErrorBox('Oops! Something went wrong!', message)
}

// This function takes an url and perform a fetch request
function paginatedFetchRequest(
    url = is_required("url"), // Improvised required argument in JS
    page = 1,
    previousResponse = []
) {
    return net.fetch(`${url}&page=${page}`) // Append the page number to the base URL
        .then(response => response.json())
        .then(newResponse => {

            try {
                const response = [...previousResponse, ...newResponse]; // Combine the two arrays

                if (newResponse.length !== 0) {
                    page++;
                    return paginatedFetchRequest(url, page, response);
                }

                let filteredRes = []  // Repos array with just name and ssh_url_to_repo values of each repo

                for (const [key, value] of Object.entries(response)) {
                    filteredRes.push({ "name": value.name, "path": value.ssh_url_to_repo, "namespace": value.namespace.name });
                }

                return filteredRes;

            } catch (error) {
                showErrorBox(`Problem fetching Gitlab repos. ${error}. Check Gitlab Access token.`)
                return []
            }
        });
}

// This function gets a list of all course repos (Elementary and Secondary)
function getAllRepos(parentDirPath) {
    // Store all elementary repos
    const dirFolders = fs
        .readdirSync(parentDirPath, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => ({ name: dir.name, path: path.join(parentDirPath, dir.name) }))
        .filter((dir) => {
            return fs.existsSync(path.join(dir.path, "lessons")) && (dir.path.includes("elem") || dir.path.includes("html"));
        });
    return dirFolders;
}

// This function executes git pull command in shell
function gitPull(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "gitPull", repoPath: repoPath } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function executes git status --porcelain command in shell
function gitStatus(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "gitStatus", repoPath: repoPath } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function executes git push command in shell
function gitPush(repoPath, commitMessage) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "gitPush", repoPath: repoPath, commitMessage: commitMessage } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function executes rm -f and rm -r commands in shell for vendor.min.js, tvo_k8.css, ilc_core.css, package-lock.json and node_modules folder
function deleteBuildFiles(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "deleteBuildFiles", repoPath: repoPath } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}


// This function make sure each json file in widgets folder contains "department": "elem" and remove skip link key values pairs (iloStartText, iloEndText, iloStartLink, iloEndLink) except for WEIGHTED QUIZ and EBOOK.  
function updateJsonProperties(widgetsPath) {
    try {
        const widgetsFiles = fs
            .readdirSync(widgetsPath, { withFileTypes: true })
            .filter((file) => {
                // Match only json files
                return file.isFile() && file.name.toLowerCase().includes(".json")
            })
            .map((file) => path.join(widgetsPath, file.name));

        // Loop through all ilo_name.json files
        widgetsFiles.forEach((jsonPath) => {
            // Read data from json file
            const jsonFileData = fs.readFileSync(jsonPath);
            let jsonFileContent = JSON.parse(jsonFileData);

            // If key and value "department" = "elem" is not present, add it.
            if (!(jsonFileContent.hasOwnProperty("department")) || jsonFileContent.department !== "elem") {
                jsonFileContent.department = "elem";
            }
            // If json file is not for a WEIGHTED QUIZ and EBOOK ILO, remove skip link key values pairs (iloStartText, iloEndText, iloStartLink, iloEndLink)
            if (!(path.basename(jsonPath).toLowerCase().match(/weighted|weight|quiz|ebook|book|e_book|e-book|ereader|reader|e_reader|e-reader/))) {
                delete jsonFileContent.iloStartText
                delete jsonFileContent.iloEndText
                delete jsonFileContent.iloStartLink
                delete jsonFileContent.iloEndLink
            }
            // Save edits to json file
            fs.writeFileSync(jsonPath, JSON.stringify(jsonFileContent, null, 4))
        })
    } catch (error) {
        console.log(error)
    }
}

// This function executes npm install and npm run build commands in shell
function npmRunBuild(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "npmRunBuild", repoPath: repoPath } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function runs "npm install packageName"
function npmInstallPackage(repoPath, commandString) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "npmInstallPackage", repoPath: repoPath, commandString: commandString } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function updates the .gitlab-ci.yml file
function ymlFileUpdate(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "ymlFileUpdate", repoPath: repoPath, filePath: path.join(ASSETS_PATH, `.gitlab-ci.yml`) } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function updates the webpack.config.js file
function webpackConfigFileUpdate(repoPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(ASSETS_PATH, `worker.js`), { workerData: { commandType: "webpackConfigFileUpdate", repoPath: repoPath, filePath: path.join(ASSETS_PATH, `webpack.config.js`) } });
        worker.on('message', resolve);
        worker.on('error', (error) => {
            reject(error)
            console.log(error)
            showErrorBox(`${error}`)
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

// This function search and replace @digital-learning for @tvontario in src/index.js. 
function updateIndexFileForTvontario(repoPath) {
    try {
        // Read data from index.js
        const indexFileData = fs.readFileSync(`${path.join(repoPath, "src/index.js")}`);
        let indexFileContent = indexFileData.toString();

        const regex = new RegExp(`@digital-learning`, "gm");

        // Replace @digital-learning for @tvontario in index.js
        indexFileContent = indexFileContent.replace(regex, "@tvontario");

        // Write new content into index.js
        fs.writeFileSync(`${path.join(repoPath, "src/index.js")}`, indexFileContent)
    } catch (error) {
        console.log(error)
        showErrorBox(`${error}`)
    }
}

// This function search and replace @digital-learning for @tvontario in package.json. 
// In addition, it will update the dependencies html5-media-controller, k8-bootstrap-css, k8-components and k8-top-nav 
// as well as repository url.
// Also add the course repo name into the packgake.json name property.
function updatePackageFileForTvontario(repoPath) {
    try {
        // Read data from package.json
        const packageFileData = fs.readFileSync(`${path.join(repoPath, "package.json")}`);
        let packageFileContent = JSON.parse(packageFileData);

        const regex = new RegExp(`@digital-learning`, "gm");

        // Loop through all dependencies in package.json
        for (const [key] of Object.entries(packageFileContent.dependencies)) {
            // Check which dependencies include "@digital-learning"
            if (key.includes("@digital-learning")) {
                // Replace @digital-learning for @tvontario in key
                const newKeyName = key.replace(regex, "@tvontario");

                packageFileContent.dependencies[newKeyName] = packageFileContent.dependencies[key]; // Assign new key
                delete packageFileContent.dependencies[key]; // Delete old key
            }
        }

        // Update miscellaneous tvo dependancies and repository url
        packageFileContent.dependencies["html5-media-controller"] = "gitlab:tvontario/digital-learning-projects/course-components/secondary/html5-media-controller.git#1.0.1"
        packageFileContent.dependencies["k8-bootstrap-css"] = "gitlab:tvontario/digital-learning-projects/course-components/elementary/k8-bootstrap-css.git"
        packageFileContent.dependencies["k8-components"] = "gitlab:tvontario/digital-learning-projects/course-components/elementary/k8-components.git"
        packageFileContent.dependencies["k8-top-nav"] = "gitlab:tvontario/digital-learning-projects/course-components/elementary/k8-top-nav.git"

        // If "k8-french-components" is installed, update location to new gitlab @tvontario
        if (packageFileContent.dependencies.hasOwnProperty("k8-french-components")) {
            packageFileContent.dependencies["k8-french-components"] = "gitlab:tvontario/digital-learning-projects/course-components/elementary/k8-french-components.git"
        }
        // If "k8-learning-goals"  is installed, update location to new gitlab @tvontario
        if (packageFileContent.dependencies.hasOwnProperty("k8-learning-goals")) {
            packageFileContent.dependencies["k8-learning-goals"] = "gitlab:tvontario/digital-learning-projects/course-components/elementary/k8-learning-goals.git"
        }

        packageFileContent.repository["url"] = "https://gitlab.com/tvontario/digital-learning-projects/elementary/k8-course-repo.git"

        // Update name with course repo name
        packageFileContent.name = path.basename(repoPath)

        // Write new content into package.json
        fs.writeFileSync(`${path.join(repoPath, "package.json")}`, JSON.stringify(packageFileContent, null, 4))
    } catch (error) {
        console.log(error)
        showErrorBox(`${error}`)
    }
}

// This function updates the ILOs versions in package.json and make sure that installed ILOs are referenced in index.js
async function updateILOsToLatestVersion(repoPath) {
    // This function updated the ILOs versions in package.json
    try {
        // Read data from package.json and index.js
        const packageFileData = fs.readFileSync(`${path.join(repoPath, "package.json")}`);
        let packageFileContent = JSON.parse(packageFileData);

        const indexPath = path.basename(repoPath).includes("_elem") ? "src/index.js" : "index.js";

        const indexFileData = fs.readFileSync(`${path.join(repoPath, indexPath)}`);
        let indexFileContent = indexFileData.toString();

        // List all ILOs included in the course
        let ILOs = [];

        // Loop through all dependencies in package.json
        for (const [key] of Object.entries(packageFileContent.dependencies)) {
            // Check which dependencies include "@tvontario"
            if (key.includes("@tvontario")) {
                // Saved all ILOs installed
                ILOs.push(key);
            }
        }

        // Loop through each item on ILOs array and uncomment ILOs included in package.json
        // return each ilo with "@latest" added
        const ILOsInstallList = ILOs.map(ilo => {
            // Get ILO name
            const ILOname = ilo.split("/")[1];
            // Create new Regex "^\/\/\s*(require\(('|")@tvontario\/ILO_NAME.*\n)""
            const regex_comment = new RegExp(`^\\/\\/\\s*(require\\(('|")@tvontario\\/${ILOname}.*\\n)`, "gm");
            // match lines
            // starting with //
            // ignore following whitespaces
            // having text "app" afterwards, capture from app to line-ending as group ($1 reference)
            const replacement = `$1`;

            // Uncomment lines in index.js
            indexFileContent = indexFileContent.replace(regex_comment, replacement);

            return `${ilo}@latest`

        }).join(" ")

        // Update package.json dependencies to match most stable version of each ILOs
        // Run commands for npm install @tvontario/ilo_name@latest
        await npmInstallPackage(repoPath, `npm install ${ILOsInstallList}`)

        // Write new content into index.js
        fs.writeFileSync(`${path.join(repoPath, indexPath)}`, indexFileContent)
    } catch (error) {
        console.log(error)
        showErrorBox(`${error}`)
    }
}

// End of all script functions

// Invoke Methods
// IPC from Renderer to Main, back to Renderer

// Handle request to get repos
ipcMain.handle("get-repos", () => {
    let userDataFile;

    // Here we try to update read userData.json file from userdata folder.
    userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });

    // Return repos location saved on userData.json file
    return getAllRepos(JSON.parse(userDataFile).reposLocation)
})

// Handle request to update repos
ipcMain.handle("update-repos", async (event, reposPath, tasks, commitMessage) => {
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

    console.log(functionsList)

    for (let index = 0; index < reposPath.length; index++) {
        let repoName = path.basename(reposPath[index])
        mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `Updating ${repoName}`)
        if (isUpdateReposCancelled) { break; }  // Check if isUpdateReposCancelled is true

        for (let i = 0; i < functionsList.length; i++) {
            if (isUpdateReposCancelled) { break; }  // Check if isUpdateReposCancelled is true
            switch (functionsList[i]) {
                case "gitPull":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Pulling repo`)

                    // This function updates course by doing a git pull command
                    await gitPull(reposPath[index]);
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "gitPush":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Pushing repo`)

                    // This function check if there are changes to commit
                    let areThereChangesToCommit = await gitStatus(reposPath[index])

                    // This function updates course by doing a git pull command if there are changes to commit
                    if (areThereChangesToCommit) {
                        await gitPush(reposPath[index], commitMessage);
                    }
                    else {
                        console.log("No changes to commit")
                    }
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "deleteBuildFiles":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Deleting vendor.min.js, tvo_k8.css, ilc_core.css, package-lock.json and node_modules`)

                    // Delete vendor.min.js, tvo_k8.css, ilc_core.css, package-lock.json and node_modules
                    await deleteBuildFiles(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "updateJsonProperties":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Updating ILOs json files`)

                    // Update widgets .json files
                    updateJsonProperties(`${path.join(reposPath[index], "widgets")}`)
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "npmRunBuild":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Running commands 'NPM install' and 'NPM build'`)

                    // Run commands for npm install and npm run build (possible git commands)
                    await npmRunBuild(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "ymlFileUpdate":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Updating .gitlab-ci.yml file`)

                    // Update .gitlab-ci.yml file
                    await ymlFileUpdate(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "webpackConfigFileUpdate":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Updating webpack.config.js file`)

                    // Update webpack.config.js file
                    await webpackConfigFileUpdate(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "updateIndexFileForTvontario":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Replacing @digital-learning for @tvontario in index.js`)

                    // This function replace @digital-learning for @tvontario in index.js
                    updateIndexFileForTvontario(reposPath[index]);
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "updatePackageFileForTvontario":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Replacing @digital-learning for @tvontario in package.json`)

                    // This function replace @digital-learning for @tvontario in package.json
                    updatePackageFileForTvontario(reposPath[index]);
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                case "updateILOsToLatestVersion":
                    // Update progressbars
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), `${repoName} - Updating npm registry dependencies (including in-house ILOs) version to latest`)

                    // Run commands for npm install ilo_name @latest
                    await updateILOsToLatestVersion(reposPath[index])
                    // Update progressbars
                    progressBarValue += progressIncrement
                    mainWindow.setProgressBar(progressBarValue)
                    mainWindow.webContents.send('update-progressbar', Math.round(progressBarValue * 100), repoName)
                    break;
                default:
            }
        }
        console.log(`Finished with ${repoName} repo`)
        // Show diff notification depending this is the last repo in the loop
        index + 1 < reposPath.length ?
            showNotification(`Finished with ${repoName}`) :
            showNotification("Automation completed!");
    }

    isUpdateReposCancelled = false  // Reset isUpdateReposCancelled back to false

    // Update progressbar status
    mainWindow.webContents.send('update-progressbar', 100, "Automation completed!")

    // Once done with all repos, hide progressbar
    mainWindow.setProgressBar(-1)
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
        let jsonData;
        try {
            const userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
            jsonData = JSON.parse(userDataFile);
            jsonData.reposLocation = `${filePaths[0]}`;

        } catch (error) {
            // Create json data
            jsonData = {
                "reposLocation": `${filePaths[0]}`,
                "gitlabToken": ""
            }
        }

        // // Write json data into a json file in userData.json
        fs.writeFileSync(`${path.join(app.getPath("userData"), "userData.json")}`, JSON.stringify(jsonData, null, 4))

        // Send repos path to renderer
        return ["saved", filePaths[0]];
    }
})

// Handle request to get config data 
ipcMain.handle('get-config-data', () => {
    return configContent
})

// Handle request to get user data
ipcMain.handle('get-user-data', () => {
    let userDataFile;

    // Here we try to update read userData.json file from userdata folder.
    userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
    // Send repos path to renderer
    return JSON.parse(userDataFile)
})

// Handle request to get all gitlab repos
ipcMain.handle('get-gitlab-repos', (event, reposType) => {
    let userDataFile;

    // Here we try to update read userData.json file from userdata folder.
    userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
    // Send repos path to renderer
    const token = JSON.parse(userDataFile).gitlabToken

    // var response = paginatedFetchRequest(`https://gitlab.com/api/v4/groups/61699189/projects?private_token=${token}&include_subgroups=true&order_by=name&sort=asc&per_page=100`)

    // return response;

    let groundID;

    switch (reposType) {
        case "all":
            groundID = 61216177;
            break;
        case "elem":
            groundID = 61699189;
            break;
        case "ilcdcc":
            groundID = 61538026;
            break;
        case "interactives":
            groundID = 62115972;
            break;
        default:
            break
    }

    return paginatedFetchRequest(`https://gitlab.com/api/v4/groups/${groundID}/projects?private_token=${token}&include_subgroups=true&order_by=name&sort=asc&per_page=100`)
})

// Handle request to search gitlab repos
ipcMain.handle('search-gitlab-repos', async (event, reposType, search) => {
    let userDataFile;

    // Here we try to update read userData.json file from userdata folder.
    userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
    // Send repos path to renderer
    const token = JSON.parse(userDataFile).gitlabToken

    let groupID;

    // get gitlab group id based on repos type

    switch (reposType) {
        case "elem":
            groupID = 61699189;
            break;
        case "sec":
            groupID = 61538026;
            break;
        case "ilo":
            groupID = 62115972;
            break;
        case "all":
            groupID = 61216177;
            break;
        default:
            break
    }

    // Fetch list of repo
    let response = await paginatedFetchRequest(`https://gitlab.com/api/v4/groups/${groupID}/search?private_token=${token}&scope=projects&search=${search}`)

    // Sorted response by repo name
    response = response.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
    })

    return response;
})

// Handle request to clone repos
ipcMain.handle('clone-repos', (event, reposList) => {

    let userDataFile;

    // Here we try to update read userData.json file from userdata folder.
    userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
    // Send repos path to renderer
    const reposLocation = JSON.parse(userDataFile).reposLocation;

    // Clone repos 
})

// Send Methods
// IPC from Renderer to Main

// When button to cancel automation is pressed, update isUpdateReposCancelled state
ipcMain.on('cancel-automation', (args) => {
    isUpdateReposCancelled = true;
});

// When a restart button is pressed, quit app and install new update.
ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
});

// Handle request to save token
ipcMain.on('save-token', (event, token) => {
    // Here we try to update read userData.json file from userdata folder.
    let jsonData;
    try {
        const userDataFile = fs.readFileSync(path.join(app.getPath("userData"), "userData.json"), { encoding: "utf-8" });
        jsonData = JSON.parse(userDataFile);
        jsonData.gitlabToken = token;

    } catch (error) {
        // Create json data
        jsonData = {
            "reposLocation": "",
            "gitlabToken": token
        }
    }
    // Write json data into a json file in userData.json
    fs.writeFileSync(`${path.join(app.getPath("userData"), "userData.json")}`, JSON.stringify(jsonData, null, 4))
})

// Event listeners to handle update events
// When a new update is available we’ll send a message to the main window, notifying the user of the update. 
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
// Once it downloads, we’ll send another message notifying them that the update will be installed when they quit the app.
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

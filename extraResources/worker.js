const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const { execSync } = require("child_process");   // Import exec method from child_process module

const os = require('os');   
const isMac = os.platform() === "darwin";  

function executeShellCommands(type, repoPath, filePath, commitMessage, commandString) {
    // Variable to store any return value if needed
    let returnValue = "";

    switch (type) {
        case "gitPull":
            execSync(`cd ${repoPath} && git checkout master && git pull`);
            break;
        case "gitDiff":
            // --quiet flag prevents the diff from showing and exits with 1 if there was a diff, 0 if not
            returnValue = parseInt(execSync(`cd ${repoPath} && git diff --quiet; echo $?`).toString())
            break;
        case "gitPush":
            execSync(`cd ${repoPath} && git add . && git commit -m "${commitMessage}" && git push`);
            break;
        case "deleteBuildFiles":
            try {
                fs.rmSync(`${repoPath}/dependencies/vendor.min.js`);
            }
            catch (error) {
                console.log(error.message);
            }
            try {
                fs.rmSync(`${repoPath}/dependencies/tvo_k8.css`);
            }
            catch (error) {
                console.log(error.message);
            }
            try {
                fs.rmSync(`${repoPath}/package-lock.json`);
            }
            catch (error) {
                console.log(error.message);
            }
            // Delete node_modules folder
            try {
                fs.rmSync(`${repoPath}/node_modules`, { recursive: true });
            }
            catch (error) {
                console.log(error.message);
            }
            break;
        case "deleteBuildFilesSec":
            try {
                fs.rmSync(`${repoPath}/dependencies/vendor.min.js`);
            }
            catch (error) {
                console.log(error.message);
            }
            try {
                fs.rmSync(`${repoPath}/dependencies/ilc_core.css`);
            }
            catch (error) {
                console.log(error.message);
            }
            try {
                fs.rmSync(`${repoPath}/package-lock.json`);
            }
            catch (error) {
                console.log(error.message);
            }
            // Delete node_modules folder
            try {
                fs.rmSync(`${repoPath}/node_modules`, { recursive: true });
            }
            catch (error) {
                console.log(error.message);
            }
            break;
        case "npmRunBuild":
            execSync(`cd ${repoPath} && npm install && npm run build`);
            break;
        case "ymlFileUpdate":
            if (isMac) {
                execSync(`cd ${repoPath} && cp -r ${filePath} .gitlab-ci.yml`);
            }
            else {
                execSync(`cd ${repoPath} && copy ${filePath} .gitlab-ci.yml`);
            }
            break;
        case "webpackConfigFileUpdate":
            if (isMac) {
                execSync(`cd ${repoPath} && cp -r ${filePath} webpack.config.js`);
            }
            else {
                execSync(`cd ${repoPath} && copy ${filePath} webpack.config.js`);
            }
            break;
        case "npmInstallPackage":
            execSync(`cd ${repoPath} && ${commandString}`);
            break;
        default:
    }
    return returnValue;
}

parentPort.postMessage(executeShellCommands(workerData.commandType, workerData.repoPath, workerData.filePath, workerData.commitMessage, workerData.commandString))
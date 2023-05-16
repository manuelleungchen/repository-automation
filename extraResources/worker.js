const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const { execSync } = require("child_process");   // Import exec method from child_process module

function executeShellCommands(type, repoPath, filePath, commitMessage, commandString) {
    switch (type) {
        case "gitPull":
            execSync(`cd ${repoPath} && git checkout master && git pull`);
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
            execSync(`cd ${repoPath} && cp -r ${filePath} .gitlab-ci.yml`);
            break;
        case "webpackConfigFileUpdate":
            execSync(`cd ${repoPath} && cp -r ${filePath} webpack.config.js`);
            break;
        case "npmInstallPackage":
            execSync(`cd ${repoPath} && ${commandString}`);
            break;
        default:
    }
    return "Done"
}

parentPort.postMessage(executeShellCommands(workerData.commandType, workerData.repoPath, workerData.filePath, workerData.commitMessage, workerData.commandString))
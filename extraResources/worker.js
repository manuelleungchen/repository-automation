const {parentPort, workerData} = require("worker_threads");
const fs = require("fs");
const { execSync } = require("child_process");   // Import exec method from child_process module

parentPort.postMessage(executeShellCommands(workerData.commandType, workerData.repoPath))

function executeShellCommands(type, repoPath) {
    switch (type) {
        case "gitPull":
            try {
                execSync(`cd ${repoPath} && git pull`);
            }
            catch (error) {
                console.log(error.message);
            }
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
        case "npmRunBuild":
            try {
                execSync(`cd ${repoPath} && npm install && npm run build`);
            }
            catch (error) {
                console.log(error.message);
            }
            break;
        default:
    }
    return "DONE"
}
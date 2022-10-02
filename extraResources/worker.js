//add this script in myWorker.js file
const {parentPort, workerData} = require("worker_threads");
// const path = require('path');
// const fs = require("fs");
const { execSync } = require("child_process");   // Import exec method from child_process module


// parentPort.postMessage(getFibonacciNumber(workerData.commandString))

// function getFibonacciNumber(command) {
//     execSync(command);
//     return "DONE"
// }


parentPort.postMessage(executeShellCommands(workerData.commandType, workerData.commandString))

function executeShellCommands(type, command) {
    switch (type) {
        case "deleteBuildFiles":
            execSync(command);
            break;
        case "npmRunBuild":
            execSync(command);
            break;
            default:
                // code block
    }
    return "DONE"
}
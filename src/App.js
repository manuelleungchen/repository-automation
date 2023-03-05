import { useState, useEffect, useContext } from 'react';
import { DepartContext, SelectedTasksContext, SelectedReposContext } from './context';  // import contexts

// Import images
import logo from './assets/img/logo.png';
import connectedIcon from './assets/img/cloud-check.svg';
import disconnectedIcon from './assets/img/emoji-frown.svg';
import gitlabLogo from './assets/img/gitlab-logo.svg';

import styles from "./App.module.css";  // Import styles

// Import components
import ListGroup from './components/ListGroup.js';
import TaskPrompt from './components/TaskPrompt.js';
import ProgressBar from "./components/ProgressBar.js";
import DepartDropDown from "./components/DepartDropDown.js";
import CommitMessage from './components/CommitMessage.js';
import UpdatePopUp from './components/UpdatePopUp.js';

// This function will delay the mount and unmount of a component
function useDelayUnmount(isMounted, delayTime) {
    const [showDiv, setShowDiv] = useState(false);
    useEffect(() => {
        let timeoutId;
        if (isMounted && !showDiv) {
            setShowDiv(true);
        } else if (!isMounted && showDiv) {
            timeoutId = setTimeout(() => setShowDiv(false), delayTime); //delay our unmount
        }
        return () => clearTimeout(timeoutId); // cleanup mechanism for effects , the use of setTimeout generate a sideEffect
    }, [isMounted, delayTime, showDiv]);
    return showDiv;
}

function App() {
    // Get contexts
    const { selectedDepart } = useContext(DepartContext);
    const { selectedTasks, setSelectedTasks } = useContext(SelectedTasksContext);
    const { selectedRepos, setSelectedRepos } = useContext(SelectedReposContext);

    const [repos, setRepos] = useState([]);  // Store all repos
    const [reposPath, setReposPath] = useState("");  // Store path of where all repos are located
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage
    const [progressbarStatus, setProgressbarStatus] = useState("")  // Store progressbar status
    const showReposList = useDelayUnmount(selectedTasks.length > 0 ? true : false, 1750);  // Delay unmount of component to allow animation 
    const [showProgressbar, setShowProgressbar] = useState(false);   // State to toggle Progress bar component
    const [gitlabConnected, setGitlabConnected] = useState(false);   // State for Gitlab connection
    const [commit, setCommit] = useState('');   // State for commit message
    const [updateStatus, setUpdateStatus] = useState("update_available");   // State for App update status

    // On reload and reposPath change, this will check GitLab connection, update repos path, and get repos list
    useEffect(() => {
        console.log("Rendering App component")
        // Setting event listeners

        // Update gitlab connection status
        window.api.gitlabStatus(arg => {
            setGitlabConnected(arg)
        })
        // Update repos path
        window.api.updateReposPath().then(arg => {
            setReposPath(arg)
        })

        // Get all course repos
        window.api.getRepos().then(results => {
            setRepos(results)
            console.log("Courses", results)
        })

        // Listen for update available
        window.api.updateAvailable(() => {
            setUpdateStatus("update_available")
        })

        // Listen for update downloaded
        window.api.updateDownloaded(() => {
            setUpdateStatus("update_downloaded")
        })

        // Clean the listener after the component is dismounted
        return () => {
            console.log("removing all event")
            window.api.removeAll()
        };
    }, [reposPath]);

    const onSelectFolder = () => {
        window.api.selectFolder('Select folder clicked').then(data => {
            if (data[0] === "saved") {
                setReposPath(data[1])
            }
        })
    }

    // This function update commitMessage state
    const updateCommitMessage = (e) => {
        setCommit(e.target.value)
    }

    // This function handle the Start button
    const handleSubmit = async () => {
        // Listen for progressbar updates from Main
        window.api.updateProgressbar((value, status) => {
            setProgressbarValue(value)
            setProgressbarStatus(status)
        })
        // Change state to show progressbar
        setShowProgressbar(!showProgressbar)

        // Send to Main repos and tasks to execute
        await window.api.updateRepos(selectedRepos, selectedTasks, commit)
    }

    // This function is passed to handle the close button pressed on progressbar
    const handleCloseProgressbar = () => {
        setSelectedTasks([]) // Reset selectedTasks context
        setSelectedRepos([]) // Reset selectedRepos context
        setShowProgressbar(!showProgressbar) // Change state to show progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
        setProgressbarStatus("")   // Reset progressbar status to ""
    }

    // This function handle hiding of updater component
    const closeNotification = () => {
        setUpdateStatus("")
    }

    // This function handle App restart
    const restartApp = () => {
        window.api.restartApp('restart_app');
    }

    return (<>
        {!showProgressbar ?
            (<div className={styles["App"]}>
                <header className={styles["App-header"]}>
                    <img src={logo} width={50} alt="logo" />
                    <h1>Repository Automation</h1>
                </header>
                <main className="container">
                    <div className="row">
                        <div className="col-12">
                            <span id={styles["vpn-status"]}>
                                <img src={gitlabLogo} height={40} alt="GitLab icon" />
                                {gitlabConnected ? (<img src={connectedIcon} width={25} id={styles["vpn-connected-icon"]} alt="Cloud check icon" />
                                ) : (<img src={disconnectedIcon} width={25} id={styles["vpn-disconnected-icon"]} alt="Emoji frown icon" />
                                )}
                            </span>
                        </div>
                        <div className="col-12">
                            <section>
                                <h2>Step #1 - Select location of repositories</h2>
                                <p id={styles["repos-path"]}>{reposPath}</p>
                                <input type="button" className={styles["select-button"]} onClick={onSelectFolder} value="Select folder" />
                            </section>
                        </div>
                        <div className="col-12">
                            <section>
                                <h2>Step #2 - Select department</h2>
                                <DepartDropDown />
                            </section>
                        </div>
                        <div className="col-12">
                            {/* Show tasks list when there are repos for selected department */}
                            {repos.some((obj) => obj.name.includes(selectedDepart === "elem" ? "elem" : "html")) ?
                                <TaskPrompt />
                                :
                                <div id={styles["warning-div"]}>
                                    <p><strong>{selectedDepart === "elem" ? "Elementary" : "Secondary"} course repos are not available in this location. Please select another depart or location.</strong></p>
                                </div>
                            }
                        </div>
                        {/* Show repos list and RUN button when there is 1 or more tasks are selected */}
                        {showReposList &&
                            <div className={styles[selectedTasks.length > 0 ? "mounted-style" : "unmounted-style"]}>
                                <ListGroup repos={repos} />
                                {/* Show commit message input when 'push-to-gitlab' task is selected */}
                                {selectedTasks.includes('push-to-gitlab') && <CommitMessage updateCommitMessage={updateCommitMessage} />}
                                {/* Disable RUN button if selectedTasks are 0, selectedRepos are 0, gitlabConnected is false, or (task 'push-to-gitlab' was selected and commit message is empty) */}
                                <input type="button" id={styles["run-btn"]} value="RUN" onClick={handleSubmit} disabled={(selectedTasks.length === 0 || selectedRepos.length === 0 || gitlabConnected === false || (selectedTasks.includes('push-to-gitlab') && commit === "")) ? true : false} tabIndex={0} />
                            </div>
                        }
                    </div>
                    {(updateStatus === "update_available" || updateStatus === "update_downloaded") && <UpdatePopUp status={updateStatus} closeNotification={closeNotification} restartApp={restartApp} />}
                </main>
            </div>)
            : (
                <ProgressBar completed={progressbarValue} status={progressbarStatus} handleCloseProgressbar={handleCloseProgressbar} />
            )
        }
    </>

    );
}

export default App;
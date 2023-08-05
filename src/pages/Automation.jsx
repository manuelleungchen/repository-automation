import { useState, useEffect, useContext } from 'react';
import { DepartContext, SelectedTasksContext, SelectedReposContext, ReposPathContext, GitlabOnlineContext } from '../context';  // import contexts

// Import styles
import styles from "./Automation.module.css";

// Import components
import ListGroup from '../components/ListGroup';
import TaskPrompt from '../components/TaskPrompt';
import ProgressBar from "../components/ProgressBar";
import DepartDropDown from "../components/DepartDropDown";
import CommitMessage from '../components/CommitMessage';
import UpdatePopUp from '../components/UpdatePopUp';

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

function Automation() {
    // Get contexts
    const { selectedDepart } = useContext(DepartContext);
    const { selectedTasks, setSelectedTasks } = useContext(SelectedTasksContext);
    // const { selectedRepos, setSelectedRepos } = useContext(SelectedReposContext);
    const { reposPath } = useContext(ReposPathContext);
    const { gitlabOnline } = useContext(GitlabOnlineContext);

    // States
    const [repos, setRepos] = useState([]);  // Store all repos
    const [filtedRepos, setFiltedRepos] = useState([]);  // Store filted repos
    const [selectedRepos, setSelectedRepos] = useState([]);    // Store all repos selected

    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage
    const [progressbarStatus, setProgressbarStatus] = useState("")  // Store progressbar status
    const [showProgressbar, setShowProgressbar] = useState(false);   // State to toggle Progress bar component
    const [commit, setCommit] = useState("");   // State for commit message
    const [updateStatus, setUpdateStatus] = useState("");   // State for App update status

    const showReposList = useDelayUnmount(selectedTasks.length > 0 ? true : false, 1750);  // Delay unmount of component to allow animation 

    // On reload and reposPath change, this will check GitLab connection, update repos path, and get repos list
    useEffect(() => {
        console.log("Rendering App component")

        // Setting event listeners

        // Get all course repos
        window.api.getRepos().then(results => {
            setRepos(results)
            // setFiltedRepos(results.filter(repo => repo.name.includes(selectedDepart === "elem" ? "elem" : "html")));        
        })

        // Listen for update available
        window.api.updateAvailable(() => {
            setUpdateStatus("available")
        })

        // Listen for update downloaded
        window.api.updateDownloaded(() => {
            setUpdateStatus("downloaded")
        })
    }, [reposPath]);

    useEffect(() => {
        setFiltedRepos(repos.filter(repo => repo.name.includes(selectedDepart === "elem" ? "elem" : "html")));        
    }, [repos, selectedDepart]);

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

    // This function is passed to handle the cancel button pressed on progressbar
    const handleCancelAutomation = () => {
        window.api.cancelAutomation('Cancel Automation');
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

    // Handle update of selectedRepos state
    const updateSelectedRepos = (reposPath) => {
        setSelectedRepos(reposPath)
    }

    // This function will filte repos checklist
    const filterBySearch = (event) => {
        // Access input value
        const query = event.target.value;

        if (query !== "") {
            // Include all elements which includes the search query
            let updatedList = repos.filter((item) => {
                return item.name.includes(query.toLowerCase())
            });
            // Updated Repos list with updated list
            setFiltedRepos(updatedList);
        } else {
            setFiltedRepos(repos);        
        }
    };

    return (
        <>{!showProgressbar ?
            (<main className="container">
                <div className="row">
                    <div className="col-12">
                        <section>
                            <h2>Step #1 - Select department</h2>
                            <DepartDropDown />
                        </section>
                        {/* Show tasks list when there are repos for selected department */}
                        {repos.some((obj) => obj.name.includes(selectedDepart === "elem" ? "elem" : "html")) ?
                            <TaskPrompt />
                            :
                            <div id={styles["warning-div"]}>
                                <p><strong>{selectedDepart === "elem" ? "Elementary" : "Secondary"} course repos are not available in this location. Please select another depart or location.</strong></p>
                            </div>
                        }
                        {/* Show repos list and RUN button when there is 1 or more tasks are selected */}
                        {showReposList &&
                            <div className={styles[selectedTasks.length > 0 ? "mounted-style" : "unmounted-style"]}>
                                <section>
                                    <h2>Step #3 - Select course repositories</h2>
                                    <input type="search" id={styles["search-box"]} placeholder="Search for a course" onChange={filterBySearch} />
                                    <ListGroup repos={filtedRepos} updateSelectedRepos={updateSelectedRepos} />
                                </section>
                                {/* Show commit message input when 'push-to-gitlab' task is selected */}
                                {selectedTasks.includes('push-to-gitlab') && <CommitMessage updateCommitMessage={updateCommitMessage} />}
                                {/* Disable RUN button if selectedTasks are 0, selectedRepos are 0, gitlabOnline is false, or (task 'push-to-gitlab' was selected and commit message is empty) */}
                                <input type="button" id={styles["run-btn"]} value="RUN" onClick={handleSubmit} disabled={(selectedTasks.length === 0 || selectedRepos.length === 0 || gitlabOnline === false || (selectedTasks.includes('push-to-gitlab') && commit === "")) ? true : false} tabIndex={0} />
                            </div>
                        }
                    </div>
                </div>
                {(updateStatus === "available" || updateStatus === "downloaded") && <UpdatePopUp status={updateStatus} closeNotification={closeNotification} restartApp={restartApp} />}
            </main>)
            : (<ProgressBar completed={progressbarValue} status={progressbarStatus} handleCloseProgressbar={handleCloseProgressbar} handleCancelAutomation={handleCancelAutomation} />)}
        </>
    );
}

export default Automation;
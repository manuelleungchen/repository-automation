import { useState, useEffect, useContext } from 'react'; 
import { SelectedTasksContext, SelectedReposContext } from './context';  // import contexts

// Import images
import logo from './assets/img/logo.png';
import connectedIcon from './assets/img/cloud-check.svg';
import disconnectedIcon from './assets/img/emoji-frown.svg';
import gitlabLogo from './assets/img/gitlab-logo.svg';

import './App.css';  // Import styles

// Import components
import ListGroup from './components/ListGroup.js';
import TaskPrompt from './components/TaskPrompt.js';
import ProgressBar from "./components/ProgressBar.js";
import DepartDropDown from "./components/DepartDropDown.js";

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

// Component mount and unmount animation
const mountedStyle = {
    animation: "inAnimation 450ms ease-in",
    overflowY: "hidden"
};
const unmountedStyle = {
    animation: "outAnimation 700ms ease-out",
    animationFillMode: "forwards",
    overflowY: "hidden"
};

function App() {
    // Get contexts
    const { selectedTasks, setSelectedTasks } = useContext(SelectedTasksContext);
    const { selectedRepos, setSelectedRepos } = useContext(SelectedReposContext);

    const [repos, setRepos] = useState([]);  // Store all repos
    const [reposPath, setReposPath] = useState("");  // Store path of where all repos are located
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage
    const [progressbarStatus, setProgressbarStatus] = useState("")  // Store progressbar status
    const showReposList = useDelayUnmount(selectedTasks.length > 0 ? true : false, 750);  // Delay unmount of component to allow animation 
    const [showProgressbar, setShowProgressbar] = useState(false);   // State to toggle Progress bar component
    const [gitlabConnected, setGitlabConnected] = useState(false);   // State for Gitlab connection

    // On reload and reposPath change, this will check GitLab connection, update repos path, and get repos list
    useEffect(() => {
        console.log("Rendering App component")
        // Setting event listeners
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
        await window.api.updateRepos(selectedRepos, selectedTasks)
    }

    // This function is passed to handle the close button pressed on progressbar
    const handleCloseProgressbar = () => {
        setSelectedTasks([]) // Reset selectedTasks context
        setSelectedRepos([]) // Reset selectedRepos context
        setShowProgressbar(!showProgressbar) // Change state to show progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
        setProgressbarStatus("")   // Reset progressbar status to ""
    }

    return (<>
        {!showProgressbar ?
            (<div className="App">
                <header className="App-header">
                    <img src={logo} width={50} className="App-logo" alt="logo" />
                    <h1>Repository Automation</h1>
                </header>

                <main className="container">
                    <div className="row">
                        <div className="col-12">
                            <DepartDropDown />
                            <span id='vpnStatus'>
                                <img src={gitlabLogo} height={40} alt="GitLab icon" />
                                {gitlabConnected ? (<img src={connectedIcon} width={25} id="vpn-connected-icon" alt="Cloud check icon" />
                                ) : (<img src={disconnectedIcon} width={25} id="vpn-disconnected-icon" alt="Emoji frown icon" />
                                )}
                            </span>
                        </div>
                        <div className="col-12">
                            <div className="step">
                                <h3>Step #1 - Select location of course repos</h3>
                                <p id='repos-path'>{reposPath}</p>
                                <input type="button" className="selectButton" onClick={onSelectFolder} value="Select folder" />
                            </div>
                        </div>
                        <div className="col-12">
                            {repos.length > 0 ?
                                <TaskPrompt />
                                : <div id="warningDiv">
                                    <p><strong>Course repos are not available in this location. Please select another location.</strong></p>
                                </div>
                            }
                        </div>
                        {showReposList &&
                            <div className="col-12" style={selectedTasks.length > 0 ? mountedStyle : unmountedStyle}>
                                <ListGroup repos={repos} />
                                <input type="button" id="run-btn" value="RUN" onClick={handleSubmit} disabled={(selectedTasks.length === 0 || selectedRepos.length === 0 || gitlabConnected === false) ? true : false} tabIndex={0} />
                            </div>
                        }
                    </div>
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
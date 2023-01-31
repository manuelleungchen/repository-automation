import { useState, useEffect } from 'react';
import logo from './assets/img/logo.png';
import connectedIcon from './assets/img/cloud-check.svg';
import disconnectedIcon from './assets/img/emoji-frown.svg';
import gitlabLogo from './assets/img/gitlab-logo.svg';

import './App.css';

import ListGroup from './components/ListGroup.js';
import TaskPrompt from './components/TaskPrompt.js';
import ProgressBar from "./components/ProgressBar.js";
import DepartDropDown from "./components/DepartDropDown.js";

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

const mountedStyle = { animation: "inAnimation 450ms ease-in" };
const unmountedStyle = {
    animation: "outAnimation 250ms ease-out",
    animationFillMode: "forwards"
};

function App() {
    const [repos, setRepos] = useState([]);  // Store all repos
    const [reposPath, setReposPath] = useState("");  // Store path of where all repos are located
    const [selectedRepos, setSelectedRepos] = useState([]);   // Store all selected repos
    const [selectedTasks, setSelectedTasks] = useState([]);   // Store all selected tasks
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage
    const [progressbarStatus, setProgressbarStatus] = useState("")  // Store progressbar status

    const [isMounted, setIsMounted] = useState(false);
    const showReposList = useDelayUnmount(isMounted, 200);

    const [isProgressbarMounted, setIsProgressbarMounted] = useState(false);
    const showProgressbar = useDelayUnmount(isProgressbarMounted, 0);

    // Array that containes all the tasks available to run in the App 
    const [tasksList, setTasksList] = useState([]);

    // State for selected depart
    const [selectedDepart, setSelectedDepart] = useState("elem")

    // Variable that containes all the ILOs versions
    // const [ilosVersions, setIlosVersions] = useState([]);

    // State for Gitlab connection
    const [gitlabConnected, setGitlabConnected] = useState(false);

    useEffect(() => {
        console.log("DOM ready")

        window.api.vpnStatus(arg => {
            setGitlabConnected(arg)
        })

        window.api.updateReposPath(arg => {
            setReposPath(arg)
        })

        window.api.getConfigData(arg => {
            setTasksList(arg.tasksList.filter(task => task.department === selectedDepart || task.department === "all"))
            // setIlosVersions(arg.ilosVersions)
        })

        // Indicate to Main that Renderer is ready and recieve List of repos from Main
        window.api.getRepos(selectedDepart).then(results => setRepos(results))

        // Clean the listener after the component is dismounted
        return () => {
            console.log("removing all event")
            window.api.removeAll()
        };
    }, [selectedDepart]);

    const onSelectFolder = () => {
        window.api.selectFolder('Select folder clicked').then(data => {
            if (data[0] === "saved") {
                setReposPath(data[1])
                window.api.getRepos(selectedDepart).then(results => setRepos(results))
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
        setIsProgressbarMounted(true)

        // Send to Main repos and tasks to execute
        await window.api.updateRepos(selectedRepos, selectedTasks)
    }

    // This function is passed to ListGroup component to update selectedRepos state
    const handleSelectedRepos = data => {
        // 👇️ Take parameter passed from Child component
        setSelectedRepos(data);
    };

    // This function is passed to TaskPrompt component to update selectedTasks state
    const handleSelectedTasks = newTasks => {
        if (newTasks.length === 0 || (newTasks.length > 0 && selectedTasks.length === 0)) {
            setIsMounted(!isMounted)
            // Reset selected repos
            console.log("Resetting selected repos")
            // setSelectedRepos([])
        }
        setSelectedTasks(newTasks);
        console.log(newTasks)
    };

    // This function is passed to handle the close button pressed on progressbar
    const handleCloseProgressbar = () => {
        setIsProgressbarMounted(false)  // Hide progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
        setProgressbarStatus("")   // Reset progressbar status to ""
    }

    // This function is passed to DepartDropDown component to update selectedDepart state
    const handleSelectedDepart = (e) => {
        setSelectedDepart(e.target.value );
        // Reset tasks checkboxes states
        setIsMounted(false)
        setTasksList([])
        setSelectedRepos([])
        setSelectedTasks([])
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} width={50} className="App-logo" alt="logo" />
                <h1>Repository Automation</h1>
            </header>

            <main className="container">
                <div className="row">
                    <div className="col-12 col-xl-10 offset-xl-1">
                        <span id='vpnStatus'>
                            <img src={gitlabLogo} height={40} alt="GitLab icon" />
                            {gitlabConnected ? (<img src={connectedIcon} width={25} id="vpn-connected-icon" alt="Cloud check icon" />
                            ) : (<img src={disconnectedIcon} width={25} id="vpn-disconnected-icon" alt="Emoji frown icon" />
                            )}
                        </span>
                    </div>
                    <div className="col-12 col-xl-10 offset-xl-1">
                        <DepartDropDown value={selectedDepart} handleChange={handleSelectedDepart} />
                    </div>
                    <div className="col-12 col-xl-10 offset-xl-1">
                        <div className="step">
                            <h3>Step #1 - Select location of course repos</h3>
                            <p id='repos-path'>{reposPath}</p>
                            <input type="button" className="selectButton" onClick={onSelectFolder} value="Select folder" />
                        </div>
                    </div>
                    <div className="col-12 col-xl-10 offset-xl-1">
                        {repos.length > 0 ? <TaskPrompt tasks={tasksList} depart={selectedDepart} handleTaskSelection={handleSelectedTasks} /> : <div id="warningDiv" >
                            <p><strong>There aren't course repos available</strong></p>
                        </div>}
                    </div>
                    <div className="col-12 col-xl-10 offset-xl-1">
                        {showReposList &&
                            <div style={isMounted ? mountedStyle : unmountedStyle}>
                                <ListGroup repos={repos} handleSelectedRepos={handleSelectedRepos} />
                                <input type="button" id="start-btn" value="START" onClick={handleSubmit} disabled={(selectedRepos.length === 0 || gitlabConnected === false) ? true : false} tabIndex={0} />
                            </div>
                        }
                    </div>
                </div>

                {showProgressbar &&
                    <div style={isProgressbarMounted ? mountedStyle : unmountedStyle}>
                        <ProgressBar completed={progressbarValue} status={progressbarStatus} handleCloseProgressbar={handleCloseProgressbar} />
                    </div>
                }
            </main>
        </div>
    );
}

export default App;
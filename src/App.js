import { useState, useEffect } from 'react';
import logo from './assets/img/logo.png';
import vpnConnectedIcon from './assets/img/shield-check.svg';
import vpnDisconnectedIcon from './assets/img/shield-exclamation.svg';

import './App.css';

import ListGroup from './components/ListGroup.js';
import TaskPrompt from './components/TaskPrompt.js';
import ProgressBar from "./components/ProgressBar.js";

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
    animation: "outAnimation 470ms ease-out",
    animationFillMode: "forwards"
};

function App() {
    const [repos, setRepos] = useState([]);  // Store all repos
    const [reposPath, setReposPath] = useState("");  // Store path of where all repos are located
    const [selectedRepos, setSelectedRepos] = useState([]);   // Store all selected repos
    const [selectedTasks, setSelectedTasks] = useState([]);   // Store all selected tasks
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage

    const [isMounted, setIsMounted] = useState(false);
    const showDiv = useDelayUnmount(isMounted, 250);

    const [isProgressbarMounted, setIsProgressbarMounted] = useState(false);
    const showProgressbar = useDelayUnmount(isProgressbarMounted, 250);

    // Array that containes all the tasks available to run in the App 
    const [tasksList, setTasksList] = useState([]);

    useEffect(() => {
        console.log("DOM ready")

        window.api.vpnStatus(arg => {
            // console.log(arg)
            setVpnConnected(arg)
        })

        window.api.updateReposPath(arg => {
            // console.log(arg)
            setReposPath(arg)
        })

        window.api.getConfigData(arg => {
            // console.log(arg)
            setTasksList(arg)
        })

        // Indicate to Main that Renderer is ready and recieve List of repos from Main
        window.api.getRepos("DOM ready").then(results => setRepos(results))

        // Clean the listener after the component is dismounted
        return () => {
            console.log("removing all event")
            window.api.removeAll()
        };
    }, []);

    const onSelectFolder = () => {
        window.api.selectFolder('Select folder clicked').then(data => {
            console.log("data saved ready to ready1")
            console.log(data)
            if (data[0] === "saved") {
                // console.log("data saved ready to ready2")
                setReposPath(data[1])
                window.api.getRepos("DOM ready").then(results => setRepos(results))
            }
        })
    }

    // This function handle the Start button
    const handleSubmit = async () => {
        // Listen for progressbar updates from Main
        window.api.updateProgressbar(arg => {
            console.log("Updating progressbar")
            console.log(arg)
            setProgressbarValue(arg);
        })
        // Change state to show progressbar
        // setShowProgrebar(true)
        setIsProgressbarMounted(true)


        // Send to Main repos and tasks to execute
        const progress = await window.api.updateRepos(selectedRepos, selectedTasks)
        if (progress === "update") {
            console.log("Done")
        }
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
        }
        setSelectedTasks(newTasks);
    };

    // This function is passed to handle the close button pressed on progressbar
    const handleCloseProgressbar = () => {
        setIsProgressbarMounted(false)  // Hide progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
    }

    const [vpnConnected, setVpnConnected] = useState(false);
    // const [showProgrebar, setShowProgrebar] = useState(false);


    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} width={50} className="App-logo" alt="logo" />
                <h1>Repository Automation</h1>
            </header>

            <main className="container">
                <span id='vpnStatus'>{vpnConnected ? (<img src={vpnConnectedIcon} width={25} id="vpn-connected-icon" alt="vpn connected icon" />
                ) : (<img src={vpnDisconnectedIcon} width={25} id="vpn-disconnected-icon" alt="vpn disconnected icon" />
                )} VPN {vpnConnected ? "connected" : "disconnected"}</span>

                <div className="row">
                    <div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
                        <div className="step">
                            <h3>Step #1 - Select location of course repos</h3>
                            <p id='repos-path'>{reposPath}</p>
                            <input type="button" className="selectButton" onClick={onSelectFolder} value="Select folder" />
                        </div>
                    </div>
                    <div className="col-12 col-lg-6 col-xl-5">
                        {repos.length > 0 ? <TaskPrompt tasks={tasksList} handleTaskSelection={handleSelectedTasks} /> : <div id="warningDiv" >
                            <p><strong>There aren't course repos available</strong></p>
                        </div>}
                    </div>
                    <div className="col-12 col-xl-10 offset-xl-1">
                        {showDiv &&
                            <div style={isMounted ? mountedStyle : unmountedStyle}>
                                <ListGroup repos={repos} handleSelectedRepos={handleSelectedRepos} />
                                <input type="button" id="start-btn" value="START" onClick={handleSubmit} disabled={(selectedRepos.length === 0 || vpnConnected === false) ? true : false} tabIndex={0} />
                            </div>
                        }
                    </div>
                </div>

                {showProgressbar &&
                    <div style={isProgressbarMounted ? mountedStyle : unmountedStyle}>
                        <ProgressBar completed={progressbarValue} handleCloseProgressbar={handleCloseProgressbar} />
                    </div>
                }
            </main>
        </div>
    );
}

export default App;
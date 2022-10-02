import { useState, useEffect, useRef } from 'react';
import logo from './logo3.svg';
import './App.css';

import ListGroup from './components/ListGroup.js';
import TaskPrompt from './components/TaskPrompt.js';
import ProgressBar from "./components/ProgressBar.js";

import { CSSTransition } from "react-transition-group";  // For component rendering transition

// const testData = [
//     { bgcolor: "#6a1b9a", completed: 60 },
//     { bgcolor: "#00695c", completed: 30 },
//     { bgcolor: "#ef6c00", completed: 53 },
// ];


function App() {
    const [repos, setRepos] = useState([]);  // Store all repos
    const [selectedRepos, setSelectedRepos] = useState([]);   // Store all selected repos
    const [selectedTasks, setSelectedTasks] = useState([]);   // Store all selected tasks
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage



    // Array that containes all the tasks available to run in the App 
    const tasksList = [
        {
            "label": "Update course repos",
            "value": "update-course-repos"
        },
        {
            "label": "Rebuild K8 CSS and vendor.min.js",
            "value": "npm-rebuild"
        },
        {
            "label": "Update ILOs version",
            "value": "ilos-update"
        }
    ]

    const nodeRef = useRef(null);  // Reference for CSSTransition

    useEffect(() => {
        console.log("DOM ready")
        // Indicate to Main that Renderer is ready and recieve List of repos from Main
        window.api.getRepos("DOM ready").then(results => setRepos(results))

        // Clean the listener after the component is dismounted
        return () => {
            console.log("removing all event")
            window.api.removeAll()
        };
    }, []);


    const onSelectFolder = () => {
        window.api.selectFolder('Select folder clicked').then(message => {
            if (message === "saved") {
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
        setSelectedTasks(newTasks);
    };

    // const [coursesPath, setCoursesPath] = useState(null)

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} width={200} className="App-logo" alt="logo" />
                <a href="#">How it works</a>
            </header>
            <main className="container">
                <h2>Select location of course repos</h2>
                <div>
                    <button type="button" onClick={onSelectFolder}>Open file</button>
                </div>

                {repos.length > 0 ? <TaskPrompt tasks={tasksList} handleTaskSelection={handleSelectedTasks} /> : <p>Please select folder containing courses</p>}

                <CSSTransition nodeRef={nodeRef} in={selectedTasks.length ? true : false} timeout={300} classNames="repos-list" unmountOnExit>
                    <div ref={nodeRef}>
                        <ListGroup repos={repos} handleSelectedRepos={handleSelectedRepos} />
                        <input type="button" value="START" onClick={handleSubmit} disabled={selectedRepos.length === 0 ? true : false} />
                    </div>
                </CSSTransition>

                <ProgressBar bgcolor={"#ef6c00"} completed={progressbarValue} />

             
            </main>
        </div>
    );
}

export default App;
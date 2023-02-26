import { useState, useEffect, useContext } from "react";
import { DepartContext, SelectedTasksContext, SelectedReposContext } from '../context';   // import contexts

import styles from "./TaskPrompt.module.css";  // Import styles
import ReactMarkdown from 'react-markdown';

function TaskPrompt() {
    // Get contexts
    const { selectedDepart } = useContext(DepartContext);
    const { selectedTasks, setSelectedTasks } = useContext(SelectedTasksContext);
    const { setSelectedRepos } = useContext(SelectedReposContext);

    // Array that containes all the tasks available to run in the App 
    const [tasks, setTasks] = useState([])

    // Store all checkboxes checked state
    const [checked, setChecked] = useState([]);
    // Store opened details tab
    const [currentDetails, setCurrentDetails] = useState("");

    // Re-render component when selectedDepart context change
    useEffect(() => {
        console.log("Rendering Tasks Component")
        // Get tasks by depart
        window.api.getConfigData().then(arg => {
            const filtedTasks = arg.tasksList.filter(task => task.department === selectedDepart || task.department === "all")
            setTasks(filtedTasks)
            // Reset checked checkboxes
            setChecked(new Array(filtedTasks.length).fill(false));
        })
    }, [selectedDepart])

    // Handle updating selectedTasks context
    const updateSelectedTasks = (checkedTasks) => {
        let tasksName = [];
        checkedTasks.forEach((checkedTask, index) => {
            if (checkedTask === true) { tasksName.push(tasks[index].value) }
        })
        if (tasksName.length === 0 || (tasksName.length > 0 && selectedTasks.length === 0)) {
            // Reset selectedRepos context
            setSelectedRepos([])
        }
        // Reset selectedTasks context
        setSelectedTasks(tasksName);
    }

    // Handle toggled checkbox
    const handleOnChange = (position) => {
        let updatedCheckedState = checked.map((item, index) =>
            index === position ? !item : item
        );

        setChecked(updatedCheckedState);
        updateSelectedTasks(updatedCheckedState)
    };

    // Handle toggled details tab
    const toggleDetails = (event, detailsId) => {
        event.preventDefault();
        setCurrentDetails((detailsId === currentDetails) ? "" : detailsId);
    };

    return (
        <section>
            <h2>Step #3 - Select actions to perform</h2>
            {tasks.filter(task => task.department === selectedDepart || task.department === "all").map((task, index) => {
                return (
                    <div className={styles["list-item"]} key={index}>
                        <label className={styles["checkbox-label"]} htmlFor={task.label}>
                            <input type="checkbox" name={task.label} id={task.label} value={task.value} checked={checked[index] || false}
                                onChange={() => handleOnChange(index)} />
                            {task.label}
                        </label>
                        <details className={styles["details"]} key={index} open={currentDetails === index} onClick={(event) => toggleDetails(event, index)}>
                            <summary>More info</summary>
                            <div className={styles["details-content"]}>
                                <ReactMarkdown children={task.description} />
                            </div>
                        </details>
                    </div>
                )
            })}
        </section>
    )
}

export default TaskPrompt
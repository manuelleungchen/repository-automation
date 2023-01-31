import { useState, useEffect } from "react";
import './TaskPrompt.css';
import ReactMarkdown from 'react-markdown';

function TaskPrompt({ tasks, depart, handleTaskSelection }) {

    // Store all checkboxes checked state
    const [checked, setChecked] = useState([]);
    // Store opened details tab
    const [currentDetails, setCurrentDetails] = useState("");


    useEffect(() => {
        console.log(checked)
        console.log(tasks)

        setChecked(new Array(tasks.length).fill(false));
    }, [tasks])

    function updateSelectedTasks(checkedTasks) {
        let tasksName = [];
        checkedTasks.forEach((checkedTask, index) => {
            if (checkedTask === true) { tasksName.push(tasks[index].value) }
        })
        handleTaskSelection(tasksName)
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
        <div className="step">
            <h3>Step #2 - Select actions to perform</h3>
            {tasks.filter(task => task.department === depart || task.department === "all").map((task, index) => {
                return (
                    <div className="list-item" key={index}>
                        <label className="checkbox-label" htmlFor={task.label}>
                            <input type="checkbox" name={task.label} id={task.label} value={task.value} checked={checked[index] || false}
                            onChange={() => handleOnChange(index)} />
                            {task.label}
                        </label>
                        <details className="details" key={index} open={currentDetails === index} onClick={(event) => toggleDetails(event, index)}>
                            <summary>More info</summary>
                            <div className="details-content">
                                <ReactMarkdown children={task.description} />
                            </div>
                        </details>
                    </div>
                )
            })}
        </div>
    )
}

export default TaskPrompt
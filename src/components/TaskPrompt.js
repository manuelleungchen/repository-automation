import { useState, useEffect } from "react";
import './TaskPrompt.css'

function TaskPrompt({ tasks, handleTaskSelection }) {

    // Store all checkboxes checked state
    const [checked, setChecked] = useState(new Array(tasks.length).fill(false));


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


    return (
        <div>
            <h2>Select actions to perform:</h2>
            {tasks.map((task, index) => {
                return (
                    <div className="container" key={index}>
                <div className="toggle-switch">
                    <input type="checkbox" className="checkbox"
                        name={task.label} id={task.label} value={task.value} checked={checked[index] || false}
                        onChange={() => handleOnChange(index)} />

                    <label className="label" htmlFor={task.label}>
                        <span className="inner" />
                        <span className="switch" />
                    </label>
                </div>
                {" "}{task.label}
            </div>
                )
            })}
        </div>
    )
}

export default TaskPrompt
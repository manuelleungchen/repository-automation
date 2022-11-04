import { useState, useEffect } from "react";
import './TaskPrompt.css'

function TaskPrompt({ tasks, handleTaskSelection }) {

    // Store all checkboxes checked state
    const [checked, setChecked] = useState([]);

    useEffect(() => {
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

    return (
        <div className="step">
            <h3>Step #2 - Select actions to perform</h3>
            {tasks.map((task, index) => {
                return (
                    <div className="list-item" key={index}>
                        <input type="checkbox" className="checkbox" name={task.label} id={task.label} value={task.value} checked={checked[index] || false}
                            onChange={() => handleOnChange(index)} />
                        <label className="checkbox-label" htmlFor={task.label}>{task.label}</label>
                    </div>
                )
            })}
        </div>
    )
}

export default TaskPrompt
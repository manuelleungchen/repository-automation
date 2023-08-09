import { useContext } from 'react';
import { DepartContext, SelectedTasksContext } from '../context';   // import contexts

import styles from "./DepartDropDown.module.css";  // Import styles

const DepartDropDown = () => {
    // Get contexts
    const { selectedDepart, setSelectedDepart } = useContext(DepartContext);
    const { setSelectedTasks } = useContext(SelectedTasksContext);

    // Handle updating selectedDepart context
    const handleChange = (e) => {
        setSelectedDepart(e.target.value)
        // Reset selectedTasks and selectedRepos contexts
        setSelectedTasks([])
    }

    return (
        <div id={styles["depart-container"]}>
            <label id={styles["depart-label"]} htmlFor="depart-select">Department:</label>
            <select name="depart" id={styles["depart-select"]} value={selectedDepart} onChange={handleChange}>
                <option value="elem">Elementary</option>
                <option value="sec">Secondary</option>
            </select>
        </div>
    );
};

export default DepartDropDown;

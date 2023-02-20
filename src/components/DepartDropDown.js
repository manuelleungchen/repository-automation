import { useContext } from 'react';
import { DepartContext, SelectedTasksContext, SelectedReposContext } from '../context';   // import contexts

import "./DepartDropDown.css";  // Import styles

const DepartDropDown = () => {
    // Get contexts
    const { selectedDepart, setSelectedDepart } = useContext(DepartContext);
    const { setSelectedTasks } = useContext(SelectedTasksContext);
    const { setSelectedRepos } = useContext(SelectedReposContext);

    // Handle updating selectedDepart context
    const handleChange = (e) => {
        setSelectedDepart(e.target.value)
        // Reset selectedTasks and selectedRepos contexts
        setSelectedTasks([])
        setSelectedRepos([])
    }

    return (
        <div id="depart-container">
            <label id="depart-label" htmlFor="depart-select">Department:</label>
            <select name="depart" id="depart-select" value={selectedDepart} onChange={handleChange}>
                <option value="elem">Elementary</option>
                <option value="sec">Secondary</option>
            </select>
        </div>
    );
};

export default DepartDropDown;

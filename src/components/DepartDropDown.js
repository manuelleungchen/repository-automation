import React from "react";
import "./DepartDropDown.css";

const DepartDropDown = ({ value, handleChange }) => {
    // const handleChange = (e) => {
    //     setSelectedDepart(e.target.value );
    // }
    return (
        <div id="#depart-container">
            <label id="depart-label" htmlFor="depart-select">Department:</label>
            <select name="depart" id="depart-select" value={value} onChange={handleChange}>
                <option value="elem">Elementary</option>
                <option value="sec">Secondary</option>
            </select>
        </div>
    );
};

export default DepartDropDown;

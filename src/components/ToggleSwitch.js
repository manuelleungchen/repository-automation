import React from "react";
import "./ToggleSwitch.css";
  
const ToggleSwitch = ({ label, value, hangleOnChange }) => {
  return (
    <div className="container">
      <div className="toggle-switch">
        <input type="checkbox" className="checkbox" 
               name={label} id={label} value={value} onChange={() => hangleOnChange(value)} />

        <label className="label" htmlFor={label}>
          <span className="inner" />
          <span className="switch" />
        </label>
      </div>
      {" "}{label}
    </div>
  );
};
  
export default ToggleSwitch;
import React from 'react'
import './ProgressBar.css'

function ProgressBar({ completed, status, handleCloseProgressbar }) {
    let bgColor = ""

    if (completed < 50) {
        bgColor = "#ed4a3b"
    }
    else if (completed >= 50 && completed < 70) {
        bgColor = "#f09e4d"
    }
    else if (completed >= 70 && completed < 90) {
        bgColor = "#ffe599"
    }
    else if (completed >= 90) {
        bgColor = "#9EC899"
    }
    
    return (
        <div id="progressbarWrapper">
            {status}
            <div id='progressbar'>
                <div id='progressbarFiller' style={{
                    width: `${completed}%`,
                    backgroundColor: bgColor
                }}>
                    <span id='progressbarLabel'>{`${completed}%`}</span>
                </div>
            </div>
            {completed === 100 && <button id='returnButon' onClick={handleCloseProgressbar}>Close</button>}
        </div>
    )
}

export default ProgressBar





import React from 'react'
import './ProgressBar.css'

function ProgressBar(props) {
    const { completed, handleCloseProgressbar } = props;

    let bgColor = ""

    if (completed < 20) {
        bgColor = "#ed4a3b"
    }
    else if (completed >= 20 && completed < 40) {
        bgColor = "#f09e4d"
    }
    else if (completed >= 40 && completed < 60) {
        bgColor = "#f0eb5d"
    }
    else if (completed >= 60 && completed < 80) {
        bgColor = "#9EC899"
    }
    else if (completed >= 80) {
        bgColor = "#32e35d"
    }

    return (
        <div id="progressbarWrapper">
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





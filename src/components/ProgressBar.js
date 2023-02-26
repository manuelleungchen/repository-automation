import React from 'react'
import styles from "./ProgressBar.module.css";  // Import styles

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
        <div id={styles["progressbar-rapper"]}>
            {status}
            <div id={styles["progressbar"]}>
                <div id={styles["progressbar-filler"]} style={{
                    width: `${completed}%`,
                    backgroundColor: bgColor
                }}>
                    <span id={styles["progressbar-label"]}>{`${completed}%`}</span>
                </div>
            </div>
            {completed === 100 ? <button id={styles["close-buton"]} onClick={handleCloseProgressbar}>Close</button> : <div id={styles["empty-block"]}></div>
            }
        </div>
    )
}

export default ProgressBar





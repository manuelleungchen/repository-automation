import React, { useEffect, useState } from 'react'
import styles from "./UpdatePopUp.module.css";  // Import styles

function UpdatePopUp({ status, closeNotification, restartApp }) {
    let [message, setMessage] = useState("")

    useEffect(() => {
        setMessage(status === "available" ? "A new update is available. Downloading now..." : "Update Downloaded. Please restart to install it.")
    }, [status])

    return (
        <div id={styles["notification"]}>
            <p id="message">{message}</p>
            {status === "available" ?
                <button id="close-button" onClick={closeNotification}>
                    Close
                </button> :
                <button id="restart-button" onClick={restartApp}>
                    Restart
                </button>
            }
        </div>
    )
}

export default UpdatePopUp
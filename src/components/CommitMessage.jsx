import React from 'react'

import styles from "./CommitMessage.module.css";  // Import styles

function CommitMessage({ updateCommitMessage }) {
    return (
        <fieldset id={styles["commit-container"]}>
            <legend>Commit Message</legend>
            <input type="text" id={styles["commit-message"]} name="commit-message" placeholder='Enter commit message here' maxLength="72" onChange={updateCommitMessage} />
        </fieldset>
    )
}

export default CommitMessage
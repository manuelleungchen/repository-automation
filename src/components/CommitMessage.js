import React from 'react'

import "./CommitMessage.css";  // Import styles

function CommitMessage({ updateCommitMessage }) {
    return (
        <fieldset id='commitContainer'>
            <legend>Commit Message</legend>
            <input type="text" id="commitMessage" name="commitMessage" placeholder='Enter commit message here' maxLength="72" onChange={updateCommitMessage} />
        </fieldset>
    )
}

export default CommitMessage
import React, { useEffect, useState, useContext } from 'react'
import { ReposPathContext, TokenContext } from '../context';  // import contexts

// Import styles
import styles from "./Settings.module.css";

function Settings() {
    // Get contexts
    const { reposPath, setReposPath } = useContext(ReposPathContext);
    const { token, setToken } = useContext(TokenContext);

    const [repos, setRepos] = useState([])

    useEffect(() => {
        console.log("Rendering Settings component")

        // Setting event listeners
        
        // Get user data containing reposLocation and gitlabToken values
        window.api.getUserData().then(data => {
            setReposPath(data.reposLocation)
            setToken(data.gitlabToken)
        })
    }, []) 

    const onSelectFolder = () => {
        window.api.selectFolder('Select folder clicked').then(data => {
            if (data[0] === "saved") {
                console.log("saved new path")
                setReposPath(data[1])
            }
        })
    }
    
    const handleTokenChange = (event) => {
        event.preventDefault();
        setToken(event.target.value);
        window.api.saveToken(event.target.value);
    }

    return (
        <section id={styles.userDataSection}>
            <h2>User data</h2>
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Repos location</legend>
                <p id={styles.url}>{reposPath}</p>
                <input type="button" value="Select folder" className={styles.selectFolder} onClick={onSelectFolder} />
            </fieldset>
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Gitlab Token</legend>
                <input type="text" className={styles.textInput} name="token" value={token} placeholder='Enter Gitlab Token' onChange={handleTokenChange} />
            </fieldset>
        </section>
    )
}

export default Settings
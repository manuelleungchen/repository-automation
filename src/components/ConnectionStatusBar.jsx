import React, { useEffect, useContext } from 'react'
import { GitlabOnlineContext } from '../context';  // import contexts


// Import styles
import styles from "./ConnectionStatusBar.module.css";

// Import images
import connectedIcon from '../assets/img/cloud-check.svg';
import disconnectedIcon from '../assets/img/emoji-frown.svg';
import gitlabLogo from '../assets/img/gitlab-logo.svg';

function ConnectionStatusBar() {
    // Get contexts
    const { gitlabOnline, setGitlabOnline } = useContext(GitlabOnlineContext);

    useEffect(() => {
        console.log("Rendering Connection Status component")
        console.log(gitlabOnline)


        // Setting event listeners

        // Update gitlab connection status
        window.api.gitlabStatus(arg => {
            console.log(`Gitlab status : ${arg}`);
            setGitlabOnline(arg)
        })
    }, [])

    return (
        <div className="row">
            <div className="col-12">
                <span id={styles["vpn-status"]}>
                    <img src={gitlabLogo} height={40} alt="GitLab icon" />
                    {gitlabOnline ? (<img src={connectedIcon} width={25} id={styles["vpn-connected-icon"]} alt="Cloud check icon" />
                    ) : (<img src={disconnectedIcon} width={25} id={styles["vpn-disconnected-icon"]} alt="Emoji frown icon" />
                    )}
                </span>
            </div>
        </div>
    )
}

export default ConnectionStatusBar
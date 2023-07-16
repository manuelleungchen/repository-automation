import React from 'react'

// Import styles
import styles from "./ConnectionStatusBar.module.css";

// Import images
import connectedIcon from '../assets/img/cloud-check.svg';
import disconnectedIcon from '../assets/img/emoji-frown.svg';
import gitlabLogo from '../assets/img/gitlab-logo.svg';

function ConnectionStatusBar() {
    return (
        <div className="row">
            <div className="col-12">
                <span id={styles["vpn-status"]}>
                    <img src={gitlabLogo} height={40} alt="GitLab icon" />
                    {/* {gitlabConnected ? (<img src={connectedIcon} width={25} id={styles["vpn-connected-icon"]} alt="Cloud check icon" />
                    ) : (<img src={disconnectedIcon} width={25} id={styles["vpn-disconnected-icon"]} alt="Emoji frown icon" />
                    )} */}
                </span>
            </div>
        </div>
    )
}

export default ConnectionStatusBar
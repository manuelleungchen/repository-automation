import React, { useEffect, useRef, useState, useContext } from 'react'
import { ReposPathContext, TokenContext } from '../context';  // import contexts

// Import styles
import styles from "./Clone.module.css";

// Import components
import ListGroup from "../components/ListGroup"
import ProgressBar from "../components/ProgressBar";

function Clone() {
    const [repos, setRepos] = useState([]);  // Store all fetch from gitlab
    const [selectedRepos, setSelectedRepos] = useState([]);  // Store all repos selected

    const [search, setSearch] = useState("");
    const [repoType, setRepoType] = useState("");
    const [progressbarValue, setProgressbarValue] = useState(0)  // Store progressbar percentage
    const [progressbarStatus, setProgressbarStatus] = useState("")  // Store progressbar status
    const [showProgressbar, setShowProgressbar] = useState(false);   // State to toggle Progress bar component

    const selectEl = useRef(null);

    const { reposPath } = useContext(ReposPathContext);
    const { token } = useContext(TokenContext);

    useEffect(() => {
        console.log("Rendering App Clone component")

        setRepoType(selectEl.current.value)

    }, [reposPath, token, repos])

    const handleFetchAndCloneRequest = async (e) => {
        e.preventDefault();

        let gitlabRepos;

        // Fetch repos
        gitlabRepos = await window.api.getGitlabRepos(e.target.value).then(arg => {
            console.log(arg)
            return arg.map(repo => repo.path);
        })

        // Listen for progressbar updates from Main
        window.api.updateProgressbar((value, status) => {
            setProgressbarValue(value)
            setProgressbarStatus(status)
        })
        
        // Change state to show progressbar
        setShowProgressbar(!showProgressbar)

        // Send to Main repos list to clone
        await window.api.cloneRepos(gitlabRepos).then(arg => {
            console.log(arg)
        })
    }

    const handleCloneRequest = async (e) => {
        e.preventDefault();

        // Listen for progressbar updates from Main
        window.api.updateProgressbar((value, status) => {
            setProgressbarValue(value)
            setProgressbarStatus(status)
        })
        // Change state to show progressbar
        setShowProgressbar(!showProgressbar)

        // Send to Main repos list to clone
        await window.api.cloneRepos(selectedRepos).then(arg => {
            console.log(arg)
        })
    }

    const handleReposSearch = async (e) => {
        e.preventDefault();
        await window.api.searchGitlabRepos(repoType, search).then(arg => {
            setRepos(arg)
            console.log(arg)
        })
    }

    // Handle update of selectedRepos state
    const updateSelectedRepos = (reposPath) => {
        setSelectedRepos(reposPath)
    }

    // This function is passed to handle the close button pressed on progressbar
    const handleCloseProgressbar = () => {
        setSelectedRepos([]) // Reset selectedRepos context
        setShowProgressbar(!showProgressbar) // Change state to show progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
        setProgressbarStatus("")   // Reset progressbar status to ""
    }

    // This function is passed to handle the cancel button pressed on progressbar
    const handleCancelAutomation = () => {
        // window.api.cancelAutomation('Cancel Automation');
        setSelectedRepos([]) // Reset selectedRepos context
        setShowProgressbar(!showProgressbar) // Change state to show progressbar
        setProgressbarValue(0)   // Reset progressbar value to 0
        setProgressbarStatus("")   // Reset progressbar status to ""
    }

    return (
        <>{!showProgressbar ?
            (<main className="container">
                <div className="row">
                    <div className="col-12">
                        <section>
                            <h2>Clone all repos by categories</h2>
                            <div className={styles["cloneButtonsDiv"]}>
                                <button value={"elem"} onClick={handleFetchAndCloneRequest}>Elementary courses</button>
                                <button value={"sec"} onClick={handleFetchAndCloneRequest}>Secondary courses</button>
                                <button value={"ilo"} onClick={handleFetchAndCloneRequest}>Interactives</button>
                                <button value={"all"} onClick={handleFetchAndCloneRequest}>All courses</button>
                            </div>
                        </section>
                        <section>
                            <h2>Search and clone repos by name</h2>
                            <form className={styles.form} onSubmit={handleReposSearch}>
                                <label htmlFor="depart-select">Type:</label>
                                <select id={styles["department-option"]} name="depart" value={repoType} ref={selectEl} onChange={(e => setRepoType(e.target.value))}>
                                    <option value="elem">Elementary</option>
                                    <option value="sec">Secondary</option>
                                    <option value="ilo">Interactives</option>
                                    <option value="all">All</option>
                                </select>
                                <input id={styles["searchArea"]} type="search" value={search} placeholder="Enter repo name" onChange={(e => setSearch(e.target.value))} />
                                <input type="submit" value="Search" className={styles["formSubmit"]} />
                            </form>
                            {repos.length > 0 && <ListGroup repos={repos} updateSelectedRepos={updateSelectedRepos} />}
                        </section>
                        {selectedRepos.length > 0 && <button id={styles["clone-btn"]} onClick={handleCloneRequest}>Clone</button>}
                    </div>
                </div>
            </main>)
            : (<ProgressBar completed={progressbarValue} status={progressbarStatus} handleCloseProgressbar={handleCloseProgressbar} handleCancelAutomation={handleCancelAutomation} />)}
        </>

    )

}

export default Clone
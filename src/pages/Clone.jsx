import React, { useEffect, useState, useContext } from 'react'
import { ReposPathContext, TokenContext } from '../context';  // import contexts

// Import styles
import styles from "./Clone.module.css";


function Clone() {
    const [repos, setRepos] = useState([])
    const { reposPath } = useContext(ReposPathContext);
    const { token } = useContext(TokenContext);


    useEffect(() => {
        console.log("Rendering App Clone component")

        // Setting event listeners
       
    }, [reposPath, token])

    const handleGitlabRepos = (e) => {
        e.preventDefault();

        // Get gitlab repos
        window.api.getGitlabRepos().then(arg => {
            console.log(arg)
            // setReposPath(arg)
        })
    }

    const handleCloneRequest = (e) => {
        e.preventDefault();

        // Clone repos
        window.api.cloneRepos().then(arg => {
            console.log(arg)
            // setReposPath(arg)
        })

        // const url = "https://gitlab.com/api/v4/groups/61699189?private_token=glpat-Vh6qLJWTgaLZUhPxcf51";

        // // const { net } = require('electron')  // Import net module (client-side API for issuing HTTP(S) requests).
        // // const request = net.request("https://gitlab.com/api/v4/groups/61699189?private_token=glpat-Vh6qLJWTgaLZUhPxcf51")
        // // request.on('response', (response) => {
        // //     console.log("Gitlab connected")
        // //     mainWindow.webContents.send('gitlab-status', true)
        // // })
        // // request.end()
        // fetch(url)
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log(data.projects);
        //     });
    }

    {/* 61699189  elementary
        61538026  ilcdcc
        62115972  interactives */}


    return (
        <main className="container" style={{ paddingBottom: 15 }}>
            <div className="mainContainer">
                <div className="row">
                    <div className="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
                        {repos.length === 0 &&
                            <>
                                <section>
                                    <div className={styles["cloneButtons"]}>
                                        <h2>Step #2A - Clone all repos by categories</h2>
                                        <button onClick={handleCloneRequest}>Elementary courses</button>
                                        <button>Secondary courses</button>
                                        <button>ILC courses</button>
                                        <button>Interactives</button>
                                    </div>
                                </section>
                                <section>
                                    <h2>Step #2B - Search for repos by name</h2>
                                    <form className={styles.form} onSubmit={handleCloneRequest}>
                                        <label htmlFor="depart-select">Department:</label>
                                        <select id={styles["department-option"]} name="depart">
                                            <option value="elem">Elementary</option>
                                            <option value="moe">Secondary</option>
                                            <option value="ilc">ILC</option>
                                            <option value="ilo">Interactives</option>
                                        </select>
                                        <input id={styles["searchArea"]} type="search" name="" placeholder="Enter repo name" />
                                        <input type="submit" value="Clone" className={styles["formSubmit"]} />
                                    </form>
                                </section>
                            </>
                        }
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Clone
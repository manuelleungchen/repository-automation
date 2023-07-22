import React, { useEffect, useState, useContext } from 'react'
import { ReposPathContext, TokenContext } from '../context';  // import contexts

// Import styles
import styles from "./Clone.module.css";

// Import components
// import ListGroup from '../components/ListGroup';
// import TaskPrompt from '../components/TaskPrompt';

function Clone() {
    const [repos, setRepos] = useState([]);
    const { reposPath } = useContext(ReposPathContext);
    const { token } = useContext(TokenContext);

    useEffect(() => {
        console.log("Rendering App Clone component")

        // Setting event listeners
        
        // Get all gitlab repos
        if (token !== "") {
            window.api.getAllGitlabRepos().then(arg => {
                console.log(arg)
            })
        }
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
        window.api.cloneRepos(e.target.value).then(arg => {
            console.log(arg)
            // setReposPath(arg)
        })


    }



    return (
        <main className="container">
            <div className="row">
                <div className="col-12">
                    {repos.length === 0 &&
                        <>
                            <section>
                                <h2>Clone all repos by categories</h2>
                                <div className={styles["cloneButtons"]}>
                                    <button value={"elem"} onClick={handleCloneRequest}>Elementary courses</button>
                                    <button value={"ilcdcc"} onClick={handleCloneRequest}>Secondary courses</button>
                                    <button value={"all"} onClick={handleCloneRequest}>All courses</button>
                                    <button value={"interactives"} onClick={handleCloneRequest}>Interactives</button>
                                </div>
                            </section>
                            <section>
                                <h2>Search for repos by name</h2>
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
        </main>
    )
}

export default Clone
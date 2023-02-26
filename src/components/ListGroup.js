import { useState, useEffect, useRef, useContext } from "react";
import { DepartContext, SelectedReposContext } from '../context';   // import contexts

import styles from "./ListGroup.module.css";  // Import styles

// This function return the height and width
const getWindowSize = () => {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
}

function ListGroup({ repos }) {
    // Get contexts
    const { selectedDepart } = useContext(DepartContext);
    const { selectedRepos, setSelectedRepos } = useContext(SelectedReposContext);

    const [filtedRepos, setFiltedRepos] = useState([]);  // Store all course repos by depart

    const [cursor, setCursor] = useState(undefined);   // Store position of current checklist item in state
    const [windowSize, setWindowSize] = useState(getWindowSize());  // Store window width
    const [gripColsCount, setGripColsCount] = useState(0);  // Store Grip Cols Count

    // Add event listener for window resize
    useEffect(() => {
        function handleWindowResize() {
            setWindowSize(getWindowSize());
        }
        // Event listener for window resizing
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    // Update setGripColsCount when window resize
    useEffect(() => {
        getColsCount(windowSize.innerWidth)
    }, [windowSize.innerWidth])

    // Update repos list when props repos change
    useEffect(() => {
        // Create new array selected and hidden properties and filter items by depart
        setFiltedRepos(repos.map(repo => ({ ...repo, selected: false, hidden: false })).filter(repo => repo.name.includes((selectedDepart === "elem") ? "elem" : "html")))
    }, [repos, selectedDepart])

    // Use effect to update select all checkbox if all repos are checked
    useEffect(() => {
        // Update checked value on Select All checkbox
        selectedAllRef.current.checked = !(filtedRepos.filter((obj) => { return obj.hidden === false }).some((obj) => {
            return obj.selected === false;
        }))
    }, [filtedRepos])

    // Handle update of selectedRepos context
    const updateSelectedRepos = (checkedRepos) => {
        let reposPath = [];
        checkedRepos.forEach((checkedRepo, index) => {
            if (checkedRepo.selected === true) { reposPath.push(filtedRepos[index].path) }
        })
        setSelectedRepos(reposPath)
    }

    // Get the number of columns in grip
    const getColsCount = (width) => {
        if (width < 768) {
            setGripColsCount(1)
        }
        else if (width >= 768 && width < 992) {
            setGripColsCount(2)
        }
        else if (width >= 992 && width < 1200) {
            setGripColsCount(3)
        }
        else if (width >= 1200) {
            setGripColsCount(4)
        }
    }

    // This function will filte repos checklist
    const filterBySearch = (event) => {
        // Access input value
        const query = event.target.value;
        // Create copy of item list
        var updatedList = [...filtedRepos];
        // Include all elements which includes the search query
        updatedList = updatedList.map((item) => {
            if (item.name.includes(query.toLowerCase())) {
                item.hidden = false;
            }
            else {
                item.hidden = true;
            }
            return item;
        });
        // Updated Repos list with updated list
        setFiltedRepos(updatedList);
    };

    // Handle toggled checkbox
    const handleOnCheckboxChange = (position) => {
        let reposClone = [...filtedRepos]
        reposClone[position].selected = !reposClone[position].selected
        setFiltedRepos(reposClone)
        updateSelectedRepos(reposClone)
    };

    // This function set current checkbox on focus
    const setCheckboxFocus = (index) => {
        if (index >= 0 && index < repos.length) {
            checkboxesRefs.current[index].focus()
        }
    };

    // Handler for selectAll checkbox
    const handleSelectAll = (event) => {
        let newReposArr = filtedRepos.map(obj => {
            if (!obj.hidden) {
                return { ...obj, selected: event.target.checked };
            }
            else {
                return obj;
            }
        });
        setFiltedRepos(newReposArr)
        updateSelectedRepos(newReposArr)
    };

    // Call useKeyDown hook for each key (Arrows Up, Down, Right, Left, Space and Enter)
    // Handler for key down while focused on checkboxes-container
    const handleKeyDown = (event) => {
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                setCursor(prevState => (prevState > 0 ? prevState - gripColsCount : prevState));
                setCheckboxFocus(cursor - gripColsCount)
                break;
            case "ArrowDown":
                event.preventDefault();
                setCursor(prevState => (prevState < repos.length - 1 ? prevState + gripColsCount : prevState));
                setCheckboxFocus(cursor + gripColsCount)
                break;
            case "ArrowLeft":
                event.preventDefault();
                setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
                setCheckboxFocus(cursor - 1)
                break;
            case "ArrowRight":
                event.preventDefault();
                setCursor(prevState => (prevState < repos.length - 1 ? prevState + 1 : prevState));
                setCheckboxFocus(cursor + 1)
                break;
            case " ":
            case "Enter":
                event.preventDefault();
                handleOnCheckboxChange(cursor)
                break;
        }
    }

    // References
    const checkboxesRefs = useRef([]);
    const selectedAllRef = useRef(undefined);

    return (
        <section>
            <h2>Step #4 - Select course repositories</h2>
            <input type="search" id={styles["search-box"]} placeholder="Search for a course" onChange={filterBySearch} />
            <div className={styles["push-to-sides"]}>
                <label htmlFor="select-all" id={styles["select-all-label"]}>
                    <input type="checkbox"
                        name="select-all"
                        id="select-all"
                        onChange={handleSelectAll}
                        ref={selectedAllRef}
                    />
                    Select All
                </label>
                <p id={styles["selected-count"]}>{selectedRepos.length} selected</p>
            </div>
            <p id={styles["nav-instructions"]}><small>Use arrows and space/enter keys, or mouse to select.</small></p>
            <div id={styles["checklist-container"]} onKeyDown={handleKeyDown}>
                <div className="row">
                    {filtedRepos.map((repo, index) => {
                        if (!repo.hidden) {
                            return (
                                <div key={index} className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                                    <label
                                        ref={(element) => { checkboxesRefs.current[index] = element }}
                                        className={`${styles.item} ${(index === cursor) ? styles.active : ""}`}
                                        htmlFor={`checkbox-${index}`}
                                        onFocus={() => setCursor(index)}
                                        tabIndex={0}
                                    >
                                        <input
                                            type="checkbox"
                                            id={`checkbox-${index}`}
                                            checked={repo.selected || false}
                                            onChange={() => handleOnCheckboxChange(index)}
                                            tabIndex={-1}
                                        />
                                        <span>{repo.name}</span>
                                    </label>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </section>
    );
}

export default ListGroup;
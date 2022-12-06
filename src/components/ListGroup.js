import { useState, useEffect, useRef } from "react";
import "./ListGroup.css";

// This function return the height and width
const getWindowSize = () => {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
}

function ListGroup({ repos, handleSelectedRepos }) {

    const [reposList, setReposList] = useState(repos);  // Store all checkboxes checked state
    const [selectReposCount, setSelectReposCount] = useState(0);  // Store count of selected repos

    const [cursor, setCursor] = useState(undefined);   // Store position of current checklist item in state
    const [windowSize, setWindowSize] = useState(getWindowSize());  // Store window width
    const [gripColsCount, setGripColsCount] = useState(0);  // Store Grip Cols Count

    // Add event listener for window resize
    useEffect(() => {
        function handleWindowResize() {
            setWindowSize(getWindowSize());
        }

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    // Update repos list when props repos change
    useEffect(() => {
        setReposList(repos)
    }, [repos])

    // Update setGripColsCount when window resize
    useEffect(() => {
        getColsCount(windowSize.innerWidth)
    }, [windowSize.innerWidth])

    // Use effect to update select all checkbox
    useEffect(() => {
        // Update checked value on Select All checkbox
        selectedAllRef.current.checked = !(reposList.filter((obj) => { return obj.hidden === false }).some((obj) => {
            return obj.selected === false;
        }))
    }, [reposList])

    // This function pass an array with repos location to handleSelectedRepos callback
    const updateSelectedRepos = (checkedRepos) => {
        let reposPath = [];
        checkedRepos.forEach((checkedRepo, index) => {
            if (checkedRepo.selected === true) { reposPath.push(reposList[index].path) }
        })
        setSelectReposCount(reposPath.length) // Update selected repos count
        handleSelectedRepos(reposPath)
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

    // Call useKeyDown hook for each key (Arrows Up, Down, Right, Left, Space and Enter)

    // This function will filte repos checklist
    const filterBySearch = (event) => {
        // Access input value
        const query = event.target.value;
        // Create copy of item list
        var updatedList = [...reposList];
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
        setReposList(updatedList);
    };

    // Handle toggled checkbox
    const handleOnCheckboxChange = (position) => {
        let reposClone = [...reposList]
        reposClone[position].selected = !reposClone[position].selected
        setReposList(reposClone)
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
        let newReposArr = reposList.map(obj => {
            if (!obj.hidden) {
                return { ...obj, selected: event.target.checked };
            }
            else {
                return obj;
            }
        });
        setReposList(newReposArr)
        updateSelectedRepos(newReposArr)
    };

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
        <div className="step">
            <h3>Step #3 - Select Course Repos</h3>
            <input type="search" id="searchBox" placeholder="Search for a course" onChange={filterBySearch} />
            <div className="pushToSides">
                    <label htmlFor="selectAll" id="selectAllLabel">
                        <input type="checkbox"
                            name="selectAll"
                            id="selectAll"
                            onChange={handleSelectAll}
                            ref={selectedAllRef}
                        />
                        Select All
                    </label>
                    <p id="selectedCount">{selectReposCount} selected</p>
            </div>
            

            <p id="nav-instructions"><small>Use arrows and space/enter keys, or mouse to select.</small></p>

            <div id="checklist-container" onKeyDown={handleKeyDown}>
                <div className="row">
                    {reposList.map((repo, index) => {
                        if (!repo.hidden) {
                            return (
                                <div key={index} className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                                    <label
                                        ref={(element) => { checkboxesRefs.current[index] = element }}
                                        className={`item ${(index === cursor) ? "active" : ""}`}
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
                                        {repo.name}
                                    </label>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </div>
    );
}

export default ListGroup;
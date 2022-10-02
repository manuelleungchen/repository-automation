import { useState, useEffect, useRef } from "react";
import "./ListGroup.css";

// useKeyPress Hook
const useKeyPress = (targetKey) => {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    return keyPressed;
};

function ListGroup({ repos, handleSelectedRepos }) {

    // Store all checkboxes checked state
    const [checked, setChecked] = useState([]);

    // Call useKeyPress hook for each key (Arrow Down, Arrow Up, and Enter)
    const downArrowPress = useKeyPress("ArrowDown");
    const upArrowPress = useKeyPress("ArrowUp");
    const spacePress = useKeyPress(" ");
    const [cursor, setCursor] = useState(0);  // Store position of current checklist item in state
    const [hovered, setHovered] = useState(undefined);  // Store hovered state

    // This function pass an array with repos location to handleSelectedRepos callback
    function updateSelectedRepos(checkedRepos) {
        let reposPath = [];
        checkedRepos.forEach((checkedRepo, index) => {
            if (checkedRepo === true) { reposPath.push(repos[index].location) }
        })
        handleSelectedRepos(reposPath)
    }

    // useEffect 
    // Update checked state once client side gets repos data
    useEffect(() => {
        setChecked(new Array(repos.length).fill(false))
    }, [repos])

    // Update cursor state once DOWN arrow is pressed
    useEffect(() => {
        if (downArrowPress) {
            setCursor(prevState => (prevState < repos.length - 1 ? prevState + 1 : prevState));
        }
    }, [downArrowPress]);

    // Update cursor state once UP arrow is pressed
    useEffect(() => {
        if (upArrowPress) {
            setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
        }
    }, [upArrowPress]);

    // Update checked and selected repos state once SPACE is pressed
    useEffect(() => {
        if (spacePress) {
            var updatedList = [...checked]
            updatedList[cursor] = !updatedList[cursor]

            setChecked(updatedList)
            updateSelectedRepos(updatedList)

        }
    }, [spacePress]);

    // Update cursor state once hovering over a checkbox
    useEffect(() => {
        if (hovered) {
            setCursor(repos.indexOf(hovered));
        }
    }, [hovered]);

    // Handle toggled checkbox
    const handleOnChange = (position) => {
        let updatedCheckedState = checked.map((item, index) =>
            index === position ? !item : item
        );
        setChecked(updatedCheckedState);
        updateSelectedRepos(updatedCheckedState)
    };


    return (
        <div className="checklist">
            <h3>Select Course Repos</h3>
            <p>
                <small>
                    Use up down keys and hit enter to select, or use the mouse
                </small>
            </p>
            {repos.map((repo, index) =>
            (

                <label key={index} htmlFor={`custom-checkbox-${index}`}
                    className={`item ${(index === cursor) ? "active" : ""}`}
                    onMouseEnter={() => setHovered(repo)}
                    onMouseLeave={() => setHovered(undefined)}
                >
                    <input
                        className="checkmark"
                        type="checkbox"
                        id={`custom-checkbox-${index}`}
                        checked={checked[index] || false}
                        onChange={() => handleOnChange(index)}
                    />
                    {repo.name}

                </label>
            )
            )}

        </div>
    );
}

export default ListGroup;
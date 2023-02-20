import React, { createContext, useState } from "react";

// create context
const DepartContext = createContext();
const SelectedTasksContext = createContext();
const SelectedReposContext = createContext();


const DepartContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [selectedDepart, setSelectedDepart] = useState("elem")
    const value = React.useMemo(() => ({
        selectedDepart, setSelectedDepart
    }), [selectedDepart]);

    return (
        // the Provider gives access to the context to its children
        <DepartContext.Provider value={value}>
            {children}
        </DepartContext.Provider>
    );
};

const SelectedTasksContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [selectedTasks, setSelectedTasks] = useState([]);   // Store all selected tasks
    const value = React.useMemo(() => ({
        selectedTasks, setSelectedTasks
    }), [selectedTasks]);
    return (
        // the Provider gives access to the context to its children
        <SelectedTasksContext.Provider value={value}>
            {children}
        </SelectedTasksContext.Provider>
    );
};

const SelectedReposContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [selectedRepos, setSelectedRepos] = useState([]);   // Store all selected repos
    const value = React.useMemo(() => ({
        selectedRepos, setSelectedRepos
    }), [selectedRepos]);
    return (
        // the Provider gives access to the context to its children
        <SelectedReposContext.Provider value={value}>
            {children}
        </SelectedReposContext.Provider>
    );
};

export { DepartContext, DepartContextProvider, SelectedTasksContext, SelectedTasksContextProvider, SelectedReposContext, SelectedReposContextProvider };
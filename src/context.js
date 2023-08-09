import React, { createContext, useState } from "react";

// create context
const DepartContext = createContext();
const SelectedTasksContext = createContext();
const ReposPathContext = createContext();
const TokenContext = createContext();
const GitlabOnlineContext = createContext();

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

const ReposPathContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [reposPath, setReposPath] = useState("");   // Store repos path 
    const value = React.useMemo(() => ({
        reposPath, setReposPath
    }), [reposPath]);
    return (
        // the Provider gives access to the context to its children
        <ReposPathContext.Provider value={value}>
            {children}
        </ReposPathContext.Provider>
    );
};

const TokenContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [token, setToken] = useState("");   // Store gitlab token
    const value = React.useMemo(() => ({
        token, setToken
    }), [token]);
    return (
        // the Provider gives access to the context to its children
        <TokenContext.Provider value={value}>
            {children}
        </TokenContext.Provider>
    );
};

const GitlabOnlineContextProvider = ({ children }) => {
    // the value that will be given to the context
    const [gitlabOnline, setGitlabOnline] = useState(false);   // Store gitlab connection status
    const value = React.useMemo(() => ({
        gitlabOnline, setGitlabOnline
    }), [gitlabOnline]);
    return (
        // the Provider gives access to the context to its children
        <GitlabOnlineContext.Provider value={value}>
            {children}
        </GitlabOnlineContext.Provider>
    );
};

export { DepartContext, DepartContextProvider, SelectedTasksContext, SelectedTasksContextProvider, ReposPathContext, ReposPathContextProvider, TokenContext, TokenContextProvider, GitlabOnlineContext, GitlabOnlineContextProvider };
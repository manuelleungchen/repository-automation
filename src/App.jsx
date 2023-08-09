import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Automation from "./pages/Automation";
import Clone from "./pages/Clone";
import styles from "./App.module.css";  // Import styles

import { DepartContextProvider, SelectedTasksContextProvider, ReposPathContextProvider, TokenContextProvider, GitlabOnlineContextProvider } from './context';

export const ContextData = React.createContext();

function App() {
    return (
        <HashRouter>
            <ReposPathContextProvider>
                <TokenContextProvider>
                    <GitlabOnlineContextProvider>
                        <div className={styles["App"]}>
                            <Header />
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <DepartContextProvider>
                                            <SelectedTasksContextProvider>
                                                <Automation />
                                            </SelectedTasksContextProvider>
                                        </DepartContextProvider>
                                    }
                                />
                                <Route path="/clone" element={<Clone />} />
                            </Routes>
                        </div>
                    </GitlabOnlineContextProvider>
                </TokenContextProvider>
            </ReposPathContextProvider>
        </HashRouter>
    );
}

export default App;
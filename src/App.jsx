import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Settings from "./components/Settings";
import Nav from "./components/Nav";
import Automation from "./pages/Automation";
import Clone from "./pages/Clone";
import styles from "./App.module.css";  // Import styles

import { DepartContextProvider, SelectedTasksContextProvider, SelectedReposContextProvider, ReposPathContextProvider, TokenContextProvider } from './context';

export const ContextData = React.createContext();

function App() {
    return (
        <BrowserRouter>
            <ReposPathContextProvider>
                <TokenContextProvider>
                    <div className={styles["App"]}>
                        <Header />
                        <Settings />
                        <Nav />
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <DepartContextProvider>
                                        <SelectedTasksContextProvider>
                                            <SelectedReposContextProvider>
                                                <Automation />
                                            </SelectedReposContextProvider>
                                        </SelectedTasksContextProvider>
                                    </DepartContextProvider>
                                }
                            />
                            <Route path="/clone" element={<Clone />} />
                        </Routes>
                    </div>
                </TokenContextProvider>
            </ReposPathContextProvider>
        </BrowserRouter>
    );
}

export default App;
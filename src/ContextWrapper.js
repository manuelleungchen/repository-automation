import App from './App';
import { DepartContextProvider, SelectedTasksContextProvider, SelectedReposContextProvider } from './context';

function ContextWrapper() {
    return (
        <DepartContextProvider>
            <SelectedTasksContextProvider>
                <SelectedReposContextProvider>
                    <App />
                </SelectedReposContextProvider>
            </SelectedTasksContextProvider>
        </DepartContextProvider>
    );
}

export default ContextWrapper;
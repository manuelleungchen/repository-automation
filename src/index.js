import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));


if (window.process) {
    window.process.on('uncaughtException', function (error) {
        const {app, dialog} = window.require("electron").remote;
        dialog.showMessageBoxSync({type: 'error', message: "Unexpected error occurred. Restarting the application.", title: "Error"});
        // app.relaunch();
        // app.quit();
    });
}


root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

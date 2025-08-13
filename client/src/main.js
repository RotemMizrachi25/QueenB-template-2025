// client/src/main.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Safely grab the root element (no TypeScript non-null assertion here)
const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error('Root element with id="root" was not found in index.html');
}

ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
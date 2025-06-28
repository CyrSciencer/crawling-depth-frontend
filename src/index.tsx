import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Application startup logging | used for debugging and monitoring application initialization
console.log("🚀 Frontend application starting...");

// Root element retrieval and validation | used to ensure the DOM element exists before creating React root
const container = document.getElementById("root");
if (!container) {
  console.error("❌ Failed to find the root element");
  throw new Error("Failed to find the root element");
}
console.log("✅ Root element found");

// React root creation | used to create the React 18 root for rendering the application
const root = createRoot(container);
console.log("🏗️ React root created");

// Application rendering | used to render the main App component within React StrictMode
console.log("🎨 Rendering React application...");
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("✅ React application rendered successfully");

// Performance monitoring initialization | used to track and measure application performance metrics
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
console.log("📊 Initializing performance monitoring...");
reportWebVitals();
console.log("✅ Performance monitoring initialized");

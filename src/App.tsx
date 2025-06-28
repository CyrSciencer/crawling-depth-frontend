import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Layout from "./components/Layout";
import Home from "./components/Home";

// App component initialization logging | used for debugging component lifecycle
console.log("🎨 App component initializing...");

// Component imports (commented out) | used for future component additions
// Import your components here
// import Home from './components/Home';
// import About from './components/About';

// Main App component function | used as the root component for the entire application
function App() {
  // Component setup logging | used for debugging component structure
  console.log("🏗️ Setting up App component structure...");

  // Application structure with theme provider, routing, and layout | used to provide consistent theming, routing, and layout structure
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

// App component configuration completion logging | used for debugging component setup
console.log("✅ App component structure configured");

export default App;

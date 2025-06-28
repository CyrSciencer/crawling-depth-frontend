import { createTheme } from "@mui/material/styles";

// Theme module loading logging | used for debugging module initialization
console.log("🎨 Theme module loaded");

// Material-UI theme creation | used to create a consistent design system for the application
console.log("🏗️ Creating Material-UI theme...");
const theme = createTheme({
  // Color palette configuration | used to define primary and secondary colors for the application
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  // Typography configuration | used to define consistent font families across the application
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

// Theme creation completion logging | used for debugging theme setup
console.log("✅ Theme created successfully");
// Theme configuration logging | used for debugging and verifying theme settings
console.log("🎨 Theme configuration:", {
  primary: theme.palette.primary.main,
  secondary: theme.palette.secondary.main,
  fontFamily: theme.typography.fontFamily,
});

export default theme;

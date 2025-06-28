import React from "react";
import { Container, Box } from "@mui/material";

// Layout component module loading logging | used for debugging component initialization
console.log("🏗️ Layout component module loaded");

// Layout component props interface | used to define the expected props for the Layout component
interface LayoutProps {
  children: React.ReactNode;
}

// Layout component function | used to provide consistent layout structure for all pages
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Layout rendering logging | used for debugging component rendering
  console.log("🏗️ Layout component rendering...");
  // Children count logging | used for debugging to verify child components are passed
  console.log("👶 Children count:", React.Children.count(children));

  // Layout structure with flexbox container | used to create a responsive layout that takes full viewport height
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

// Layout component configuration completion logging | used for debugging component setup
console.log("✅ Layout component configured");

export default Layout;

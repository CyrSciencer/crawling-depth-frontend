import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { GameBoard } from "./GameBoard";
import { MapCreator } from "./mapCreator/MapCreator";
const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Crawling Depth
        </Typography>
        <GameBoard />
        <MapCreator />
      </Box>
    </Container>
  );
};

export default Home;

import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { GameBoard } from "./game/GameBoard";
import { MapCreator } from "./mapCreator/MapCreator";
import PlayerPawn from "./game/PlayerPawn";
import { Inventory, Position, Player } from "../models/PlayerModel";
import { Cell } from "../types/cells";
import { InventoryWindow } from "./game/Inventory";
import "./home.css";
import axios from "axios";

// Home component module loading logging | used for debugging component initialization
console.log("🏠 Home component module loaded");

// Main Home component function | used as the primary page component that orchestrates the game
const Home: React.FC = () => {
  // Home component initialization logging | used for debugging component lifecycle
  console.log("🏠 Home component initializing...");

  const [player, setPlayer] = useState<Player | null>(
    new Player({
      inventory: {
        resources: {
          stone: 0,
          iron: 0,
          silver: 0,
          gold: 0,
          tin: 0,
          zinc: 0,
          crystal: 0,
          copper: 0,
        },
        blocks: { stoneBlock: 0 },
        consumables: null,
        tools: { pickaxe: { charge: 10, power: 1, bonus: "none" } },
        equiped: { pickaxe: { charge: 10, power: 1, bonus: "none" } },
      },
      modifiedMaps: [],
      position: { row: 4, col: 4 },
      currentMap: "start",
      movementPerTurn: 5,
      health: 100,
      recoveryCode: 0,
    })
  );

  // Derive gameCells directly from the player state
  const gameCells = player?.getCurrentMap()?.modifiedCells || [];

  // Player change handler | used to update the entire player object when player data changes
  const handlePlayerChange = (newPlayer: Player) => {
    console.log("📊 New player:", newPlayer);
    setPlayer(newPlayer);
    console.log("✅ Player updated");
  };

  // Position change handler | used to update the player's position when they move on the game board
  const handlePositionChange = (newPosition: Position) => {
    if (!player) return;
    console.log("📊 New position:", newPosition);
    setPlayer(new Player({ ...player.toJSON(), position: newPosition }));
    console.log("✅ Position updated");
  };

  // Cell selection handler | used to handle when a player selects a cell on the game board
  const handleCellSelect = (cell: Cell | null) => {
    // This state is now managed within GameBoard, but we might need a handler here later.
  };

  // Show info handler | used to control the visibility of information panels and tooltips
  const handleShowInfo = (show: boolean) => {
    // This state is also local to other components now.
  };

  // Player save handler | used to save the current player state to the backend database
  const savePlayer = async (playerToSave: Player) => {
    if (!playerToSave) return;
    console.log("📊 Player data to save:", playerToSave);
    // Manually sync the current game cells with the player's map data before saving
    const finalPlayerState = playerToSave.updateCurrentMap(gameCells);

    try {
      console.log("🔗 Making API request to save player...");
      await axios.put(
        `http://localhost:3001/api/player`,
        finalPlayerState.toJSON() // Ensure we send clean data
      );
      console.log("✅ Player saved successfully");
    } catch (error) {
      console.error("❌ Failed to save player:", error);
    }
  };

  // Home component rendering logging | used for debugging component rendering
  console.log("🎨 Rendering Home component...");

  // Main component JSX structure | used to render the complete game interface with all components
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Page title | used to display the game title */}
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Crawling Depth
        </Typography>
        {/* Health bar display | used to show the player's current health status */}
        {player && (
          <div className="health-bar">
            <div
              className="health-bar-fill"
              style={{ width: `${(player.health as number) || 0}%` }}
            />
            <p>Health: {(player.health as number) || 0}</p>
          </div>
        )}
        {/* Game window container | used to hold all game-related components */}
        <div className="game-window">
          {/* Game container with relative positioning | used to position the game board and player pawn */}
          <div className="game-container" style={{ position: "relative" }}>
            {/* Game board component | used to render the main game grid and handle game logic */}
            <GameBoard player={player} setPlayer={setPlayer} />
            {/* Player container | used to position and render the player pawn */}
            {player && (
              <div className="player-container">
                <PlayerPawn
                  position={player.position}
                  onPositionChange={handlePositionChange}
                  cells={gameCells}
                  onCellSelect={handleCellSelect}
                  onShowInfo={handleShowInfo}
                  player={player}
                  onPlayerChange={handlePlayerChange}
                />
              </div>
            )}
          </div>
          {/* Save button | used to trigger player data saving */}
          {player && <button onClick={() => savePlayer(player)}>Save</button>}
          {/* Inventory window | used to display and manage player inventory */}
          {player && (
            <InventoryWindow
              inventory={player.inventory}
              onInventoryChange={(newInventory: Inventory) => {
                if (player) {
                  setPlayer(
                    new Player({ ...player.toJSON(), inventory: newInventory })
                  );
                }
              }}
              player={player}
              onPlayerChange={handlePlayerChange}
            />
          )}
        </div>
        {/* Map creator component | used to create and edit game maps */}
        <MapCreator />
      </Box>
    </Container>
  );
};

// Home component configuration completion logging | used for debugging component setup
console.log("✅ Home component configured");

export default Home;

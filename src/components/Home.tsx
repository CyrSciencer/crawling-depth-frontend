import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { GameBoard } from "./game/GameBoard";
import { MapCreator } from "./mapCreator/MapCreator";
import PlayerPawn from "./game/PlayerPawn";
import { Inventory, Position, PlayerData } from "../models/Player";
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

  // Game cells state management | used to store and update the current state of all game board cells
  const [gameCells, setGameCells] = useState<Cell[]>([]);
  console.log("🎮 Initial game cells set:", gameCells);

  // Selected cell state management | used to track which cell is currently selected by the player
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  console.log("🎯 Initial selected cell set:", selectedCell);

  // Show info state management | used to control the visibility of information panels
  const [showInfo, setShowInfo] = useState(false);
  console.log("ℹ️ Initial show info state set:", showInfo);

  // Player state management | used to store and manage all player data including inventory, position, and game state
  const [player, setPlayer] = useState<PlayerData>({
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
  });
  console.log("👤 Initial player state set:", player);

  // Inventory change handler | used to update the player's inventory when items are crafted, used, or equipped
  const handleInventoryChange = (newInventory: Inventory) => {
    console.log("📊 New inventory:", newInventory);
    setPlayer((prev: PlayerData) => ({
      ...prev,
      inventory: newInventory,
    }));
    console.log("✅ Inventory updated");
  };

  // Player change handler | used to update the entire player object when player data changes
  const handlePlayerChange = (newPlayer: PlayerData) => {
    console.log("📊 New player:", newPlayer);
    setPlayer(newPlayer);
    console.log("✅ Player updated");
  };

  // Position change handler | used to update the player's position when they move on the game board
  const handlePositionChange = (newPosition: Position) => {
    console.log("📊 New position:", newPosition);
    setPlayer((prev: PlayerData) => ({ ...prev, position: newPosition }));
    console.log("✅ Position updated");
  };

  // Cell selection handler | used to handle when a player selects a cell on the game board
  const handleCellSelect = (cell: Cell | null) => {
    console.log("📊 Selected cell:", cell);
    setSelectedCell(cell);
    console.log("✅ Cell selection updated");
  };

  // Show info handler | used to control the visibility of information panels and tooltips
  const handleShowInfo = (show: boolean) => {
    console.log("📊 Show info:", show);
    setShowInfo(show);
    console.log("✅ Show info updated");
  };

  // Player save handler | used to save the current player state to the backend database
  const savePlayer = async (player: PlayerData) => {
    console.log("📊 Player data to save:", player);
    // Map data update | used to sync the current game cells with the player's map data
    const { currentMap } = player;
    const mapToSave = player.modifiedMaps.find(
      (map: any) => map.personalID === currentMap
    );
    if (mapToSave) {
      // Type assertion to avoid property error
      (mapToSave as { modifiedCells: Cell[] }).modifiedCells = gameCells;
      console.log("🔍 Map to save:", mapToSave);
    }
    // API save request | used to persist player data to the backend
    try {
      console.log("🔗 Making API request to save player...");
      const playerToSave = await axios.put(
        `http://localhost:3001/api/player`,
        player
      );
      console.log("✅ Player saved successfully");
      console.log("📥 Response:", playerToSave);
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
        <div className="health-bar">
          <div
            className="health-bar-fill"
            style={{ width: `${(player.health as number) || 0}%` }}
          />
          <p>Health: {(player.health as number) || 0}</p>
        </div>
        {/* Game window container | used to hold all game-related components */}
        <div className="game-window">
          {/* Game container with relative positioning | used to position the game board and player pawn */}
          <div className="game-container" style={{ position: "relative" }}>
            {/* Game board component | used to render the main game grid and handle game logic */}
            <GameBoard
              player={player}
              setPlayer={setPlayer}
              onCellsChange={setGameCells}
            />
            {/* Player container | used to position and render the player pawn */}
            <div className="player-container">
              <PlayerPawn
                position={player.position}
                onPositionChange={handlePositionChange}
                cells={gameCells}
                onCellSelect={handleCellSelect}
                onShowInfo={handleShowInfo}
                player={player}
                onInventoryChange={handleInventoryChange}
                onCellsChange={setGameCells}
              />
            </div>
          </div>
          {/* Save button | used to trigger player data saving */}
          <button onClick={() => savePlayer(player)}>Save</button>
          {/* Inventory window | used to display and manage player inventory */}
          <InventoryWindow
            inventory={player.inventory}
            onInventoryChange={handleInventoryChange}
            player={player}
            onPlayerChange={handlePlayerChange}
          />
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

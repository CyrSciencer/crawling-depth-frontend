import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { GameBoard } from "./game/GameBoard";
import { MapCreator } from "./mapCreator/MapCreator";
import PlayerPawn from "./game/PlayerPawn";
import { Inventory, Position } from "../types/player";
import { Cell } from "../types/cells";
import Player from "../types/player";
import { InventoryWindow } from "./game/Inventory";
import "./home.css";
import axios from "axios";
import { log } from "console";

const Home: React.FC = () => {
  const [playerPosition, setPlayerPosition] = useState<Position>({
    row: 4,
    col: 4,
  });
  const [gameCells, setGameCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [player, setPlayer] = useState<Player>({
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
  const handleInventoryChange = (newInventory: Inventory) => {
    setPlayer((prev) => ({
      ...prev,
      inventory: newInventory,
    }));
  };
  const handlePlayerChange = (newPlayer: Player) => {
    setPlayer(newPlayer);
  };
  const handlePositionChange = (newPosition: Position) => {
    setPlayerPosition(newPosition);
  };

  const handleCellSelect = (cell: Cell | null) => {
    setSelectedCell(cell);
  };

  const handleShowInfo = (show: boolean) => {
    setShowInfo(show);
  };

  const savePlayer = async (player: Player) => {
    console.log({ player });
    const playerToSave = await axios.put(
      `http://localhost:3001/api/player`,
      player
    );
    console.log(playerToSave);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Crawling Depth
        </Typography>
        <div className="health-bar">
          <div
            className="health-bar-fill"
            style={{ width: `${(player.health as number) || 0}%` }}
          />
          <p>Health: {(player.health as number) || 0}</p>
        </div>
        <div className="game-window">
          <div className="game-container" style={{ position: "relative" }}>
            <GameBoard
              player={player}
              setPlayer={setPlayer}
              onCellsChange={setGameCells}
              playerPosition={playerPosition}
            />
            <div className="player-container">
              <PlayerPawn
                position={playerPosition}
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
          <button onClick={() => savePlayer(player)}>Save</button>
          <InventoryWindow
            inventory={player.inventory}
            onInventoryChange={handleInventoryChange}
            player={player}
            onPlayerChange={handlePlayerChange}
          />
        </div>
        <MapCreator />
      </Box>
    </Container>
  );
};

export default Home;

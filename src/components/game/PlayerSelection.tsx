import React, { useState } from "react";
import "./PlayerSelection.css";

interface PlayerSelectionProps {
  onNewPlayer: () => void;
  onGetPlayer: (recoveryCode: number) => void;
  recoveryCode?: number;
}

export const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  onNewPlayer,
  onGetPlayer,
  recoveryCode,
}) => {
  const [inputRecoveryCode, setInputRecoveryCode] = useState<string>("");
  return (
    <div className="player-selection">
      <h1>Welcome to the Game</h1>
      <div className="selection-buttons">
        <button onClick={onNewPlayer} className="selection-button">
          New Player
        </button>
        <button
          onClick={() => onGetPlayer(Number(inputRecoveryCode))}
          className="selection-button"
        >
          Get Player
        </button>
        <input
          type="number"
          value={inputRecoveryCode}
          onChange={(e) => setInputRecoveryCode(e.target.value)}
        />
      </div>
      {recoveryCode && (
        <div className="recovery-code-display">
          <p>Your Recovery Code:</p>
          <h2>{recoveryCode}</h2>
          <p className="recovery-code-note">
            Please save this code to recover your progress later!
          </p>
        </div>
      )}
    </div>
  );
};

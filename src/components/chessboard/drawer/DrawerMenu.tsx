import React, { useState } from "react";
import DrawerMenuOption from "./DrawerMenuOption";
import {
  faUserFriends,
  faLaptopCode,
  faChessBoard,
} from "@fortawesome/free-solid-svg-icons";
import GameOptionsForm from "./GameOptionsForm";

const DrawerMenu = () => {
  const [gameMode, setGameMode] = useState<GameModes | undefined>(undefined);

  const handleOnClick = (option: GameModes) => {
    setGameMode(option);
  };

  return (
    <>
      <div
        css={{
          position: "absolute",
          right: "2.5%",
          width: "66%",
          top: 0,
          bottom: "8%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: gameMode && 3,
        }}
      >
        {gameMode && (
          <GameOptionsForm
            gameMode={gameMode}
            onClose={() => setGameMode(undefined)}
          />
        )}
      </div>
      <div
        css={{
          boxShadow: "inset .1rem 1rem 1.5rem 0 #000000",
          position: "absolute",
          display: "flex",
          top: "0%",
          bottom: "10%",
          left: "2.5%",
          right: "2.5%",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <DrawerMenuOption
          onClick={() => handleOnClick("PLAY FRIEND")}
          text="PLAY A FRIEND ONLINE"
          icon={faUserFriends}
          selected={gameMode ? gameMode == "PLAY FRIEND" : undefined}
          position={0}
        />
        <DrawerMenuOption
          onClick={() => handleOnClick("PLAY COMPUTER")}
          text="PLAY THE COMPUTER"
          icon={faLaptopCode}
          selected={gameMode ? gameMode == "PLAY COMPUTER" : undefined}
          position={1}
        />
        <DrawerMenuOption
          onClick={() => handleOnClick("PLAY OVER THE BOARD")}
          text="PLAY OVER THE BOARD"
          icon={faChessBoard}
          selected={gameMode ? gameMode == "PLAY OVER THE BOARD" : undefined}
          position={2}
        />
      </div>
    </>
  );
};

export default DrawerMenu;

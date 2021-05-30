import React, { useState } from "react";
import DrawerMenuOption from "./DrawerMenuOption";
import {
  faUserFriends,
  faLaptopCode,
  faChessBoard,
} from "@fortawesome/free-solid-svg-icons";
import GameOptionsForm from "./GameOptionsForm";
import { mq } from "../../../styles/constants";
import useMobileView from "../../../hooks/useMobileView";

const DrawerMenu = ({ closeDrawer }) => {
  const [gameMode, setGameMode] = useState<PlayModes | undefined>(undefined);

  const handleOnClick = (option: PlayModes) => {
    setGameMode(option);
  };

  const mobileView = useMobileView();

  return (
    <div
      css={{
        boxShadow: "inset .1rem 1rem 1.5rem 0 #000000",
        position: "absolute",
        top: "0%",
        bottom: "8%",
        left: "2.5%",
        right: "2.5%",
        paddingTop: 12,
      }}
    >
      {gameMode && (
        <div
          css={{
            position: "absolute",
            width: "66%",
            top: 0,
            bottom: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: gameMode && 3,
            opacity: gameMode ? 1 : 0,
            transition: "all 0.5s",
            [mq[0]]: {
              left: 0,
              width: "100%",
            },
          }}
        >
          <GameOptionsForm
            playMode={gameMode}
            onClose={() => setGameMode(undefined)}
            closeDrawer={closeDrawer}
          />
        </div>
      )}
      <div
        css={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          [mq[0]]: {
            flexDirection: "column",
            display: gameMode && "none",
            paddingTop: 16,
          },
        }}
      >
        {mobileView && gameMode ? null : (
          <>
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
              selected={
                gameMode ? gameMode == "PLAY OVER THE BOARD" : undefined
              }
              position={2}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DrawerMenu;

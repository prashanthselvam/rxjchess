import React, { useEffect, useState } from "react";
import DrawerMenuOption from "./DrawerMenuOption";
import {
  faUserFriends,
  faLaptopCode,
  faChessBoard,
} from "@fortawesome/free-solid-svg-icons";
import { actions, store } from "src/store";
import { Formik, Form, Field, useFormikContext } from "formik";
import styled from "@emotion/styled";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const FormComponent = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    gameType: undefined,
    player: undefined,
    maxTime: undefined,
    increment: undefined,
  });

  const [gameType, setGameType] = useState(undefined);

  const gameTypeOptions = [{ value: "REGULAR", label: "regular" }];
  const playerOptions = [
    { value: "W", label: "white" },
    { value: "B", label: "black" },
    { value: "R", label: "random" },
  ];
  const maxTimeOptions = [
    { value: "unlimited", label: "unlimited" },
    ...[1, 2, 3, 5, 10, 15, 20, 30, 45, 60].map((t) => ({
      value: t,
      label: t,
    })),
  ];
  const incrementOptions = [0, 3, 5, 10, 30, 60].map((t) => ({
    value: t,
    label: t,
  }));

  const handleOnChange = (option, field) => {
    if (field === "maxTime" && option.value === "unlimited") {
      setFormValues({ ...formValues, maxTime: option, increment: undefined });
      return;
    }

    setFormValues({ ...formValues, [field]: option });
  };

  const StyledSelect = styled(Select)`
    width: 100%;
    font-size: 1.7rem;
    margin-top: 12px;
  `;

  useEffect(() => {
    console.log(formValues);
  }, [formValues]);

  return (
    <div
      css={{
        position: "relative",
        borderRadius: "1.5rem",
        backgroundColor: "rgba(250,245,245,1)",
        minWidth: 400,
        maxWidth: "fit-content",
        margin: "auto",
        minHeight: "100%",
        fontSize: "2rem",
        padding: 16,
        textAlign: "initial",
      }}
    >
      <FontAwesomeIcon
        css={{
          position: "absolute",
          fontSize: "1.5rem",
          right: 20,
          top: 15,
          "&:hover": {
            cursor: "pointer",
          },
        }}
        icon={faTimes}
        onClick={onClose}
      />
      <h3 css={{ textAlign: "center", marginBottom: 8 }}>Settings</h3>
      <StyledSelect
        options={gameTypeOptions}
        placeholder={"Game Type"}
        value={formValues.gameType}
        onChange={(option) => handleOnChange(option, "gameType")}
      />
      <StyledSelect
        options={playerOptions}
        placeholder={"Side"}
        value={formValues.player}
        onChange={(option) => handleOnChange(option, "player")}
      />
      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <StyledSelect
          options={maxTimeOptions}
          placeholder={"Max time (min)"}
          value={formValues.maxTime}
          onChange={(option) => handleOnChange(option, "maxTime")}
          css={{ width: "48%" }}
        />
        <StyledSelect
          options={incrementOptions}
          placeholder={"Increment"}
          onChange={(option) => handleOnChange(option, "increment")}
          value={formValues.increment}
          isDisabled={formValues.maxTime?.value === "unlimited"}
          css={{ width: "48%" }}
        />
      </div>
      <div>
        <button
          css={{
            width: "100%",
            padding: "12px 0",
            marginTop: 12,
            fontSize: "1.7rem",
          }}
        >
          CREATE GAME
        </button>
      </div>
    </div>
  );
};

interface GameOptionsFormProps {
  gameMode: GameModes;
  onClose: () => void;
}

interface GameOptions {
  gameType: GameTypes;
  player: Player;
  time: {
    maxTime: number | "unlimited";
    increment: number | undefined;
  };
}

const GameOptionsForm = ({ gameMode, onClose }: GameOptionsFormProps) => {
  const initialValues: GameOptions = {
    gameType: "REGULAR",
    player: "W",
    time: {
      maxTime: 5,
      increment: 0,
    },
  };

  const handleChange = (e) => {
    e.preventDefault();
    console.log(e.target.value);
  };

  return (
    <div>
      <FormComponent onClose={onClose} />
    </div>
  );
};

const DrawerMenu = () => {
  const [gameMode, setGameMode] = useState<GameModes | undefined>(undefined);

  const startNewGame = () => {
    store.dispatch(actions.initializeGame());
    setTimeout(
      () => store.dispatch(actions.newGame({ gameType: "REGULAR" })),
      700
    );
  };

  const handleOnClick = (option: GameModes) => {
    setGameMode(option);
    // startNewGame();
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

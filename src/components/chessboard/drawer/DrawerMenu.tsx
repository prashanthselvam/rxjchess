import React, { useState } from "react";
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

const FormComponent = () => {
  const { values, setFieldValue } = useFormikContext<GameOptions>();
  const incrementFormikValue = values.time.increment;

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

  const handleMaxTimeChange = (e) => {
    const value = e.target.value;
    if (value === "unlimited") {
      setFieldValue("time", { maxTime: value, increment: undefined });
      return;
    } else if (!incrementFormikValue) {
      setFieldValue("time", { maxTime: value, increment: 0 });
      return;
    }
    setFieldValue("time.maxTime", value);
  };

  const StyledSelect = styled(Select)`
    width: 100%;
    font-size: 1.7rem;
    margin-top: 12px;
  `;

  return (
    <Form>
      <div
        css={{
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
        <h3 css={{ textAlign: "center", marginBottom: 8 }}>Settings</h3>
        <StyledSelect
          options={gameTypeOptions}
          placeholder={"Game Type"}
          onChange={(e) => console.log(e)}
        />
        <StyledSelect
          options={playerOptions}
          placeholder={"Side"}
          onChange={(e) => console.log(e)}
        />
        <div css={{ display: "flex", justifyContent: "space-between" }}>
          <StyledSelect
            options={maxTimeOptions}
            placeholder={"Max time (min)"}
            onChange={(e) => console.log(e)}
            css={{ width: "48%" }}
          />
          <StyledSelect
            options={incrementOptions}
            placeholder={"Increment"}
            onChange={(e) => console.log(e)}
            disabled={true}
            css={{ width: "48%" }}
          />
        </div>
        <div>
          <button
            css={{
              width: "100%",
              padding: "12px 0",
              marginTop: 12,
            }}
          >
            CREATE GAME
          </button>
        </div>
      </div>
    </Form>
  );
};

interface GameOptionsFormProps {
  gameMode: GameModes;
}

interface GameOptions {
  gameType: GameTypes;
  player: Player;
  time: {
    maxTime: number | "unlimited";
    increment: number | undefined;
  };
}

const GameOptionsForm = ({ gameMode }: GameOptionsFormProps) => {
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
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => console.log(values)}
      >
        <FormComponent />
      </Formik>
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
        {gameMode && <GameOptionsForm gameMode={gameMode} />}
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

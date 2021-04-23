import React, { useState } from "react";
import DrawerMenuOption from "./DrawerMenuOption";
import {
  faUserFriends,
  faLaptopCode,
  faChessBoard,
} from "@fortawesome/free-solid-svg-icons";
import { actions, store } from "src/store";
import { Formik, Form, Field, useFormikContext } from "formik";

const FormComponent = () => {
  const { values, setFieldValue } = useFormikContext<GameOptions>();
  const incrementFormikValue = values.time.increment;

  const maxTimeOptions = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60];
  const incrementOptions = [0, 3, 5, 10, 30, 60];

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

  return (
    <Form>
      <div>
        <label>Game Type: </label>
        <Field as="select" name={"gameType"}>
          <option value="REGULAR">regular</option>
        </Field>
      </div>
      <div>
        <label>Pick a side: </label>
        <Field as="select" name={"player"}>
          <option value="W">white</option>
          <option value="B">black</option>
        </Field>
      </div>
      <div>
        <label>Max Duration: </label>
        <Field as="select" name={"time.maxTime"} onChange={handleMaxTimeChange}>
          {maxTimeOptions.map((time) => (
            <option value={time}>{time}</option>
          ))}
          <option value={"unlimited"}>unlimited</option>
        </Field>
        <span>min</span>

        {values.time.increment !== undefined && (
          <>
            <label>Increment: </label>
            <Field as="select" name={"time.increment"}>
              {incrementOptions.map((time) => (
                <option value={time}>{time}</option>
              ))}
            </Field>
          </>
        )}
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
    <div
      css={{
        position: "absolute",
        width: "60%",
        height: "80%",
        backgroundColor: "white",
        right: "5%",
      }}
    >
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
    <div
      css={{
        boxShadow: "inset .1rem 1rem 1.5rem 0 #000000",
        position: "absolute",
        display: "flex",
        left: "2.5%",
        width: "95%",
        height: "88%",
        padding: "3rem 0 10rem 0",
        justifyContent: "flex-start",
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
      {gameMode && <GameOptionsForm gameMode={gameMode} />}
    </div>
  );
};

export default DrawerMenu;

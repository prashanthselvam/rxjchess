import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { actions, store } from "src/store";
import Select from "react-select";
import { usePubNub } from "pubnub-react";

interface GameOptionsFormProps {
  playMode: PlayModes;
  onClose: () => void;
}

type Option<T> = {
  label: string;
  value: T;
};

interface FormValues {
  gameType: Option<GameTypes> | undefined;
  player: Option<Player | "R"> | undefined;
  maxTime: Option<number | "unlimited"> | undefined;
  increment: Option<number> | undefined;
}

const GameOptionsForm = ({ playMode, onClose }: GameOptionsFormProps) => {
  const pubNub = usePubNub();

  const gameIdRef = useRef<string>("");

  const [formValues, setFormValues] = useState<FormValues>({
    gameType: undefined,
    player: undefined,
    maxTime: undefined,
    increment: undefined,
  });
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);

  const gameTypeOptions: Option<GameTypes>[] = [
    { value: "REGULAR", label: "regular" },
  ];
  const playerOptions: Option<Player | "R">[] = [
    { value: "W", label: "white" },
    { value: "B", label: "black" },
    { value: "R", label: "random" },
  ];
  const maxTimeOptions: Option<number | "unlimited">[] = [
    { value: "unlimited", label: "unlimited" },
    ...[1, 2, 3, 5, 10, 15, 20, 30, 45, 60].map((t) => ({
      value: t,
      label: t.toString(),
    })),
  ];
  const incrementOptions: Option<number>[] = [0, 3, 5, 10, 30, 60].map((t) => ({
    value: t,
    label: t.toString(),
  }));

  const handleOnChange = (option: Option<any>, field: string) => {
    if (field === "maxTime" && option.value === "unlimited") {
      setFormValues({
        ...formValues,
        maxTime: option,
        increment: { value: 0, label: "0" },
      });
      return;
    }
    setFormValues({ ...formValues, [field]: option });
  };

  const getGameOptions = () => {
    const { gameType, player, increment, maxTime } = formValues;
    return {
      gameType: gameType!.value,
      player: player!.value,
      increment: increment!.value,
      maxTime: maxTime!.value,
      playMode: playMode,
      gameId: gameIdRef?.current,
    };
  };

  const StyledSelect = styled(Select)`
    width: 100%;
    font-size: 1.7rem;
    margin-top: 12px;
  `;

  const handleMessage = (event) => {
    const message = event.message;
    const options = getGameOptions();
    // console.log("OPTIONS FORM", message, gameIdRef.current);

    switch (message.type) {
      case "PLAYER_ARRIVED":
        pubNub.publish({
          channel: gameIdRef.current,
          message: { type: "SEND_GAME_OPTIONS", gameOptions: options },
        });
        break;
      case "GAME_OPTIONS_RECEIVED":
        store.dispatch(actions.newGame(options));
        break;
      default:
        console.log(`Did not recognize ${message.type} in options form`);
    }
  };

  const handleCreateGame = () => {
    const options = getGameOptions();

    if (playMode === "PLAY FRIEND") {
      gameIdRef.current = "some_game_id";

      pubNub.addListener({ message: handleMessage });
      pubNub.subscribe({ channels: [gameIdRef.current] });

      // create the game UUID url and display it to be copied and sent
    } else {
      store.dispatch(actions.newGame(options));
    }
  };

  useEffect(() => {
    setIsFormComplete(Object.values(formValues).every((option) => !!option));
  }, [formValues]);

  return (
    <div>
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
            disabled={!isFormComplete}
            css={{
              width: "100%",
              padding: "12px 0",
              marginTop: 12,
              fontSize: "1.7rem",
            }}
            onClick={handleCreateGame}
          >
            CREATE GAME
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOptionsForm;

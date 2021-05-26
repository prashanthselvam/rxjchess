import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCopy } from "@fortawesome/free-solid-svg-icons";
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
  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const [urlCopySuccess, setUrlCopySuccess] = useState<boolean>(false);

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
    const { player, increment, maxTime } = formValues;
    const playerArr: Player[] = ["W", "B"];

    const playerVal =
      player!.value === "R"
        ? playerArr[Math.round(Math.random())]
        : player!.value;

    return {
      gameType: gameTypeOptions[0].value,
      player: playerVal,
      increment: increment!.value,
      maxTime: maxTime!.value,
      playMode: playMode,
      gameId: gameIdRef.current,
    };
  };

  const StyledSelect = styled(Select)`
    width: 100%;
    font-size: 1.7rem;
    margin-top: 12px;
  `;

  const handleOnlineGameCreate = (event) => {
    const message = event.message;
    const options = getGameOptions();

    if (message.type === "PLAYER_ARRIVED") {
      pubNub
        .publish({
          channel: gameIdRef.current,
          message: { type: "GAME_OPTIONS", gameOptions: options },
        })
        .then(() => {
          store.dispatch(actions.newGame(options));
        })
        .catch((e) => console.log(e));
    }
  };

  const handleCreateGame = () => {
    const options = getGameOptions();

    if (playMode === "PLAY FRIEND") {
      const myGameId = (function () {
        return Math.random().toString(36).substr(2, 9);
      })();
      gameIdRef.current = myGameId;
      setGameId(myGameId);
      pubNub.subscribe({ channels: [myGameId] });
      pubNub.addListener({ message: handleOnlineGameCreate });
      setIsFormComplete(false);
    } else {
      store.dispatch(actions.newGame(options));
    }
  };

  useEffect(() => {
    const { gameType, ...rest } = formValues;
    setIsFormComplete(Object.values(rest).every((option) => !!option));
  }, [formValues]);

  const url = `${window.location.origin}?${gameId}`;

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
        {!gameId && (
          <>
            <h3 css={{ textAlign: "center", marginBottom: 8 }}>Settings</h3>
            <StyledSelect
              options={playerOptions}
              placeholder={"Your Side"}
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
          </>
        )}
        {gameId && (
          <>
            <div css={{ textAlign: "center", fontSize: "1.5rem" }}>
              Invite your friend using the link below
            </div>
            <div
              css={{
                textAlign: "center",
                fontSize: "1.2rem",
                marginTop: 8,
                padding: "4px 0px",
                background: "white",
                borderRadius: 4,
                border: "1px solid",
                borderColor: urlCopySuccess ? "green" : "black",
                position: "relative",
              }}
            >
              {url}
              <div
                css={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: "auto",
                  width: 30,
                  textAlign: "center",
                  paddingTop: 3,
                  height: "100%",
                  borderLeft: "1px solid grey",
                }}
              >
                <FontAwesomeIcon
                  css={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "1.7rem",
                    "&:hover": {
                      cursor: "pointer",
                      color: "grey",
                    },
                  }}
                  icon={faCopy}
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    setUrlCopySuccess(true);
                  }}
                />
              </div>
            </div>
          </>
        )}
        {urlCopySuccess && (
          <div
            css={{
              textAlign: "center",
              color: "green",
              fontSize: "1.2rem",
            }}
          >
            Copied successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOptionsForm;

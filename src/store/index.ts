import { createSlice, configureStore } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "redux-devtools-extension";
import { PieceIDs, TileIDs } from "src/data/constants";

type TileMapData = {
  pieceId: PieceIDs | undefined;
  highlight: boolean;
};

type ChessGameState = {
  status: GameStatus;
  currentTurn: Players; // black or white
  tileMap: Record<TileIDs, TileMapData>; // mapping of each tile to the piece ID that's on it
  selectedTile: TileIDs | undefined;
  isActiveCheck: boolean;
};

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    incremented: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decremented: (state) => {
      state.value -= 1;
    },
  },
});

export const { incremented, decremented } = counterSlice.actions;

export const store = configureStore(
  {
    reducer: counterSlice.reducer,
  },
  devToolsEnhancer()
);

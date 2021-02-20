import { store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import Chessboard from "./chessboard";

const App = () => (
  <Provider store={store}>
    <Chessboard />
  </Provider>
);

export default App;

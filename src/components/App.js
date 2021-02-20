import { store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import Game from "./Game";

const App = () => (
  <Provider store={store}>
    <Game />
  </Provider>
);

export default App;

import { combineEpics } from "redux-observable";
import gameEpics from "./gameEpics";

const rootEpic = combineEpics(...gameEpics);

export default rootEpic;

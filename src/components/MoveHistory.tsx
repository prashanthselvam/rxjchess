import { actions, ChessGameState, Move, store } from "src/store";
import { _getPieceType } from "src/store/utils";
import * as React from "react";
import { useSelector } from "react-redux";

const MoveHistory = () => {
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const moves: Move[] = useSelector(
    (state: ChessGameState) => state.movesState.moveHistory
  );

  React.useEffect(() => {
    setHighlightIndex(moves.length - 1);
  }, [moves]);

  return (
    <div
      css={{
        display: "grid",
        overflow: "scroll",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: 40,
        flexGrow: 3,
        fontSize: "2rem",
      }}
    >
      {moves.map(
        (
          {
            pieceId,
            takenPieceId,
            targetTileId,
            castledRook,
            isMoveCheck,
            promotedPiece,
          },
          index
        ) => {
          let label = "";
          const pieceType = _getPieceType(pieceId);

          if (castledRook) {
            const isQueenSideCastle = castledRook.slice(2) === "1";
            label = isQueenSideCastle ? "O-O-O" : "O-O";
          } else {
            label = `${pieceType !== "P" ? pieceType : ""}${
              !!takenPieceId && !promotedPiece ? "x" : ""
            }${targetTileId.toLowerCase()}${
              !!promotedPiece ? _getPieceType(promotedPiece) : ""
            }${isMoveCheck ? "+" : ""}`;
          }

          const onClick = () => {
            store.dispatch(actions.restoreBoardAtMove({ index }));
            setHighlightIndex(index);
          };

          return (
            <button
              key={index}
              onClick={onClick}
              css={{
                textAlign: "center",
                width: "100%",
                padding: 5,
                fontFamily: "Oswald",
                backgroundColor:
                  highlightIndex === index ? "lightblue" : "grey",
              }}
            >
              {label}
            </button>
          );
        }
      )}
    </div>
  );
};

export default MoveHistory;

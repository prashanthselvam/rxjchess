import { actions, ChessGameState, Move, store } from "src/store";
import { _getPieceType } from "src/store/utils";
import * as React from "react";
import { useSelector } from "react-redux";
import { useRef } from "react";

const MoveHistory = () => {
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const divRef = useRef(null);
  const moves: Move[] = useSelector(
    (state: ChessGameState) => state.movesState.moveHistory
  );

  React.useEffect(() => {
    setHighlightIndex(moves.length - 1);
    // @ts-ignore
    divRef.current.scrollTop = divRef.current.scrollHeight;
  }, [moves]);

  return (
    <div
      ref={divRef}
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

          const isHighlighted = highlightIndex === index;

          return (
            <button
              key={index}
              onClick={onClick}
              css={{
                border: "1px solid rgba(0,0,0,0.1)",
                textAlign: "center",
                width: "100%",
                padding: 5,
                fontFamily: "Oswald",
                color: isHighlighted ? "rgb(20,20,20)" : "rgb(220,220,220)",
                backgroundColor: isHighlighted
                  ? "rgb(237,205,132)"
                  : "rgb(80,80,80)",
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

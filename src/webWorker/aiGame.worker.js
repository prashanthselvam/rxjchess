const jsChess = require("js-chess-engine");
const game = new jsChess.Game();

export async function makeAiMove(lastMove) {
  // This will always be true unless human is playing with Black
  // and it's the first move
  if (lastMove) {
    game.move(lastMove.sourceTileId, lastMove.targetTileId);
  }

  // AI moves with difficulty set to 4 and returns the move it just made
  game.aiMove(3);
  return game.getHistory(true)[0];
}

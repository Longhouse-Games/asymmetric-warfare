define(['lib/helpers'], function(h) {
  var Pieces = h.Pieces;
  var Position = h.Position;
  var Board = h.Board;
  var InsurgentMove = h.InsurgentMove;
  var InsurgentTurn = h.InsurgentTurn;
  var StateMove = h.StateMove;
  var StateTurn = h.StateTurn;

  var StatePiece = Pieces.StatePiece;
  var InsurgentPiece = Pieces.InsurgentPiece;

  var INSURGENT = h.C.INSURGENT;
  var STATE = h.C.STATE;
  var INITIAL_INSURGENTS = h.C.INITIAL_INSURGENTS;
  var INITIAL_STATE_PIECES = h.C.INITIAL_STATE_PIECES;
  var CAPITAL = h.C.CAPITAL;
  var NUM_RANKS = h.C.NUM_RANKS;

  var Infowar = function() {
    var board = Board();
    var currentTurn = undefined;
    var initialInsurgents = INITIAL_INSURGENTS;
    var initialStatePieces = INITIAL_STATE_PIECES;
    for (var i = 0; i < initialStatePieces; i++) {
      board.addPiece(StatePiece(), Position(CAPITAL)(0));
    }

    var startGame = function() {
      currentTurn = InsurgentTurn();
    }

    var isStateTurn = function() {
      if (currentTurn) {
        return currentTurn.id() === StateTurn.ID;
      }
      return false;
    }

    var isInsurgentTurn = function() {
      if (currentTurn) {
        return currentTurn.id() === InsurgentTurn.ID;
      }
      return false;
    }

    var endOfTurn = function() {
      if (currentTurn.id() === StateTurn.ID) {
        currentTurn = InsurgentTurn();
      } else if (currentTurn.id() === InsurgentTurn.ID) {
        currentTurn = StateTurn();
      } else {
        throw "Invalid turn state", currentTurn;
      }
    }

    var gameOver = function() {
      var numAdjacent = 0;
      var REQUIRED = 4;
      var RANKS_PER_CIRCLE = NUM_RANKS;

      for (var i = 0; i < (REQUIRED+RANKS_PER_CIRCLE); i++) {
        var rank = i % NUM_RANKS;
        if (board.getInsurgentPiecesAt(Position(3)(rank)).length >= 1) {
          numAdjacent++;
          if (numAdjacent >= REQUIRED) {
            //Gameover
            currentTurn = undefined;
            return true;
          }
        } else {
          numAdjacent = 0;
        }
      }

      return false;
    }

    var movePiece = function(move) {
      currentTurn.applyMove(move);

      var piece = currentTurn.id() === StateTurn.ID ? StatePiece : InsurgentPiece;

      board.removePiece(piece(), move.src);
      board.addPiece(piece(), move.dest);

      if (gameOver()) {
        return;
      }

      if (currentTurn.isComplete()) {
        endOfTurn();
      }
    };

    return {
      currentTurn: function() {
        if (currentTurn) {
          return currentTurn.id();
        }
        return undefined;
      },
      initialInsurgents: function() {
        return initialInsurgents;
      },
      addInsurgent: function(position) {
        board.addPiece(InsurgentPiece(), position);
        initialInsurgents--;
        if (initialInsurgents === 0) {
          startGame();
        }
      },
      getPiecesAt: function(position) {
        return board.getPiecesAt(position);
      },
      insurgentMove: function(src, dest) {
        if (!isInsurgentTurn()) {
          throw "It's not your turn!";
        }
        var move = InsurgentMove(src)(dest);
        movePiece(move);
      },
      stateMove: function(src, dest) {
        if (!isStateTurn()) {
          throw "It's not your turn!";
        }
        var move = StateMove(src)(dest);
        movePiece(move);
      }
    };
  };

  Infowar.INSURGENT = INSURGENT;
  Infowar.STATE = STATE;
  Infowar.INITIAL_INSURGENTS = INITIAL_INSURGENTS;
  Infowar.CAPITAL = Board.CAPITAL;
  Infowar.NUM_CIRCLES = Board.NUM_CIRCLES;
  Infowar.NUM_RANKS = Board.NUM_RANKS;

  return Infowar;
});

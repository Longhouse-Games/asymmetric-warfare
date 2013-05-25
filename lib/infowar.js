define(['underscore', 'lib/helpers'], function(_, h) {
  var Pieces = h.Pieces;
  var Position = h.Position;
  var Board = h.Board;
  var InsurgentMove = h.InsurgentMove;
  var InsurgentTurn = h.InsurgentTurn;
  var StateMove = h.StateMove;
  var StateTurn = h.StateTurn;
  var Kill = h.Kill;
  var History = h.History;

  var StatePiece = Pieces.StatePiece;
  var InsurgentPiece = Pieces.InsurgentPiece;

  var INSURGENT = h.C.INSURGENT;
  var STATE = h.C.STATE;
  var INITIAL_INSURGENTS = h.C.INITIAL_INSURGENTS;
  var INITIAL_STATE_PIECES = h.C.INITIAL_STATE_PIECES;
  var CAPITAL = h.C.CAPITAL;
  var NUM_RANKS = h.C.NUM_RANKS;

  // actions
  var PLACEMENT = h.C.PLACEMENT;
  var MOVE = h.C.MOVE;

  var Infowar = function() {
    var board = Board();
    var currentTurn = undefined;
    var currentPhase = h.C.SETUP;
    var initialInsurgents = INITIAL_INSURGENTS;
    var initialStatePieces = INITIAL_STATE_PIECES;
    for (var i = 0; i < initialStatePieces; i++) {
      board.addPiece(StatePiece(), Position(CAPITAL)(0));
    }

    var startGame = function() {
      currentPhase = h.C.PLAYING;
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
            currentPhase = h.C.GAMEOVER;
            return true;
          }
        } else {
          numAdjacent = 0;
        }
      }

      return false;
    }

    var applyAction = function(action, args) {
      action.apply(this, args);

      if (gameOver()) {
        return;
      }

      if (currentTurn.isComplete()) {
        endOfTurn();
      }
    };

    var movePiece = function(move) {
      currentTurn.applyMove(move);

      var piece = currentTurn.id() === StateTurn.ID ? StatePiece : InsurgentPiece;

      board.removePiece(piece(), move.src);
      board.addPiece(piece(), move.dest);
    };

    var kill = function(kill) {
      currentTurn.applyKill(kill);

      var pieces = board.getPiecesAt(kill.position());
      if (!_.find(pieces, function(piece) { return piece.type() === h.C.STATE; })) {
        throw "No State piece at that location!";
      }

      _.each(pieces, function(piece) {
        if (piece.type() === h.C.INSURGENT) {
          board.removePiece(piece, kill.position());
        }
      });
    };

    var addInsurgent = function(position) {
      if (position.circle !== 0) {
        throw "Invalid placement!";
      }
      if (initialInsurgents === 0) {
        throw "Cannot add more insurgents!";
      }
      board.addPiece(InsurgentPiece(), position);
      initialInsurgents--;
      if (initialInsurgents === 0) {
        startGame();
      }
    };

    return {
      currentTurn: function() {
        return currentTurn;
      },
      currentPhase: function() {
        return currentPhase;
      },
      initialInsurgents: function() {
        return initialInsurgents;
      },
      addInsurgent: function(position) {
        return addInsurgent(position);
      },
      getPieces: function() {
        return board.getPieces();
      },
      getPiecesAt: function(position) {
        return board.getPiecesAt(position);
      },
      getPositionsByType: function(type) {
        if (type !== h.C.STATE && type !== h.C.INSURGENT) {
          throw "Invalid type: " + type;
        }
        return _.chain(board.getPieces())
          .map(function(piecesAt, poskey) {
            if (_.any(piecesAt, function(piece) { return piece.type() === type; })) {
              return Position(poskey);
            }
            return null;
          })
          .compact()
          .value();
      },
      endTurn: function() {
        if (gameOver()) {
          throw "Game is over!";
        }
        endOfTurn();
      },
      insurgentMove: function(src, dest) {
        if (!isInsurgentTurn()) {
          throw "It's not your turn!";
        }
        var move = InsurgentMove(src)(dest);
        applyAction(movePiece, [move]);
      },
      stateMove: function(src, dest) {
        if (!isStateTurn()) {
          throw "It's not your turn!";
        }
        var move = StateMove(src)(dest);
        applyAction(movePiece, [move]);
      },
      kill: function(location) {
        if (!isStateTurn()) {
          throw "It's not your turn!";
        }
        var killaction = Kill(location);
        applyAction(kill, [killaction]);
      }
    };
  };


  var InfowarWithHistory = function(_history) {
    var history = _history || [];
    var infowar = Infowar();

    if (!history || history.length === 0) {
      for (var i = 0; i < INITIAL_STATE_PIECES; i++) {
        history.push(History.Placement(STATE, Position(CAPITAL)(0)));
      }
    } else {
      for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        if (entry.type() === h.C.PLACEMENT && entry.player() === h.C.STATE) {
          //We don't want to apply State placements, as it's not a public method
          //on Infowar, and it's also already done during initialisation.
        } else {
          entry.apply(infowar);
        }
      }
    }

    var addInsurgent = infowar.addInsurgent;
    infowar.addInsurgent = function(position) {
      var retval = addInsurgent(position);
      history.push(History.Placement(INSURGENT, position));
      return retval;
    };

    var stateMove = infowar.stateMove;
    infowar.stateMove = function(src, dest) {
      var retval = stateMove(src, dest);
      history.push(History.Move(STATE, StateMove(src)(dest)));
      return retval;
    }

    var insurgentMove = infowar.insurgentMove;
    infowar.insurgentMove = function(src, dest) {
      var retval = insurgentMove(src, dest);
      history.push(History.Move(INSURGENT, InsurgentMove(src)(dest)));
      return retval;
    }

    var kill = infowar.kill;
    infowar.kill = function(position) {
      var retval = kill.apply(this, arguments);
      history.push(History.Kill(STATE, arguments));
      return retval;
    }

    var endTurn = infowar.endTurn;
    infowar.endTurn = function() {
      var player = infowar.currentTurn() ? infowar.currentTurn().id() : "";
      var retval = endTurn();
      history.push(History.EndTurn(player));
      return retval;
    }

    infowar.history = function() {
      return history;
    }

    return infowar;
  };

  InfowarWithHistory.INSURGENT = INSURGENT;
  InfowarWithHistory.STATE = STATE;
  InfowarWithHistory.INITIAL_INSURGENTS = INITIAL_INSURGENTS;
  InfowarWithHistory.CAPITAL = h.C.CAPITAL;
  InfowarWithHistory.NUM_CIRCLES = h.C.NUM_CIRCLES;
  InfowarWithHistory.NUM_RANKS = h.C.NUM_RANKS;

  return InfowarWithHistory;
});

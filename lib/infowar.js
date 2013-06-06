define(['underscore', 'lib/helpers'], function(_, h) {
  var Pieces = h.Pieces;
  var Position = h.Position;
  var Board = h.Board;
  var InsurgentMove = h.InsurgentMove;
  var InsurgentTurn = h.InsurgentTurn;
  var StateMove = h.StateMove;
  var StateTurn = h.StateTurn;
  var Kill = h.Kill;
  var Interrogate = h.Interrogate;
  var Grow = h.Grow;
  var History = h.History;

  var StatePiece = Pieces.StatePiece;
  var InsurgentPiece = Pieces.InsurgentPiece;

  var INSURGENT = h.C.INSURGENT;
  var STATE = h.C.STATE;
  var INITIAL_INSURGENTS = h.C.INITIAL_INSURGENTS;
  var INITIAL_STATE_PIECES = h.C.INITIAL_STATE_PIECES;
  var CAPITAL = h.C.CAPITAL;
  var INNER_CIRCLE = h.C.INNER_CIRCLE;
  var NUM_RANKS = h.C.NUM_RANKS;

  // actions
  var PLACEMENT = h.C.PLACEMENT;
  var MOVE = h.C.MOVE;

  var Infowar = function() {
    var board = Board();
    var currentTurn = undefined;
    var currentPhase = h.C.SETUP;
    var killedInsurgents = 0;
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
      var cleanup = function() {
        currentTurn = undefined;
        currentPhase = h.C.GAMEOVER;
      };

      if (killedInsurgents >= 12) {
        cleanup();
        return h.C.STATE;
      }

      if (board.getPositionsByType(h.C.INSURGENT).length === 0) {
        cleanup();
        return h.C.STATE;
      }

      // Insurgents hold any six spaces of the inner circle
      var occupiedInnerCircles = _.filter(board.getPositionsByType(h.C.INSURGENT), function(position) {
        return position.circle === INNER_CIRCLE;
      });
      if (occupiedInnerCircles.length >= 6) {
        cleanup();
        return h.C.INSURGENT;
      }

      // Insurgents hold any four adjacent spaces of the inner circle
      var numAdjacent = 0;
      var REQUIRED = 4;
      var RANKS_PER_CIRCLE = NUM_RANKS;

      for (var i = 0; i < (REQUIRED+RANKS_PER_CIRCLE); i++) {
        var rank = i % NUM_RANKS;
        if (board.getInsurgentPiecesAt(Position(3)(rank)).length >= 1) {
          numAdjacent++;
          if (numAdjacent >= REQUIRED) {
            //Gameover
            cleanup();
            return h.C.INSURGENT;
          }
        } else {
          numAdjacent = 0;
        }
      }

      return false;
    }

    var applyAction = function(action, args) {
      var retval = action.apply(this, args);

      if (gameOver()) {
        return;
      }

      if (currentTurn.isComplete()) {
        endOfTurn();
      }

      return retval;
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
          killedInsurgents++;
        }
      });
    };

    var grow = function(grow) {
      var insurgentsInPlay = _.chain(board.getPieces())
        .map(function(piecesAt, poskey) {
          return _.filter(piecesAt, function(piece) { return piece.type() === h.C.INSURGENT; });
        })
        .reduce(function(count, pieces) { return count + pieces.length }, 0)
        .value();

      if ((insurgentsInPlay + killedInsurgents) >= h.C.MAX_INSURGENTS) {
        throw "No more insurgents left!";
      }

      var adjacentPosition = _.find([grow.position()].concat(grow.position().adjacentPositions()), function(position) {
        return board.getInsurgentPiecesAt(position).length > 0;
      });
      if (!adjacentPosition) {
        throw "Must have an adjacent insurgent in order to grow!";
      }

      currentTurn.applyGrow(grow);
      board.addPiece(InsurgentPiece(), grow.position());
    };

    var interrogate = function(interrogate) {
      currentTurn.applyInterrogate(interrogate);

      var pieces = board.getPiecesAt(interrogate.position());
      if (!_.find(pieces, function(piece) { return piece.type() === h.C.STATE; })) {
        throw "No State piece at that location!";
      }
      if (!_.find(pieces, function(piece) { return piece.type() === h.C.INSURGENT; })) {
        throw "No Insurgent piece at that location!";
      }

      var positions = interrogate.position().adjacentPositions();

      var insurgents = _.chain(positions)
        .map(function(position) {
          var retval = [];
          _.times(board.getInsurgentPiecesAt(position).length, function() {
            retval.push(position);
          });
          return retval;
        })
        .flatten()
        .value();

      return insurgents;
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
      winner: function() {
        if (gameOver()) {
          return gameOver();
        }
        return null;
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
        return board.getPositionsByType(type);
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

        var statePiecesInInnerCircle = _.chain(board.getPieces())
          .map(function(piecesAt, poskey) {
            var position = Position(poskey);
            if (position.circle === INNER_CIRCLE) {
              return _.filter(piecesAt, function(piece) { return piece.type() === h.C.STATE; });
            }
          })
          .compact()
          .flatten()
          .value();

        if (statePiecesInInnerCircle.length >= h.C.MAX_STATE_PIECES_IN_INNER_CIRCLE)
        if (src.circle !== (INNER_CIRCLE))
        if (dest.circle === (INNER_CIRCLE)) {
          throw "No more than 3 State pieces permitted in the inner circle!";
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
      },
      // TODO : interrogate = stateOnly(function() { ... } );
      interrogate: function(position) {
        if (!isStateTurn()) {
          throw "It's not your turn!";
        }
        var interrogatAction = Interrogate(position);
        return applyAction(interrogate, [interrogatAction]);
      },
      grow: function(position) {
        if (!isInsurgentTurn()) {
          throw "It's not your turn!";
        }
        var growaction = Grow(position);
        applyAction(grow, [growaction]);
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

    var withHistory = function(infowarFunction, player, historyFunction) {
      return function() {
        var retval = infowarFunction.apply(infowar, arguments);
        var args = Array.prototype.slice.call(arguments);
        args.unshift(player);
        history.push(historyFunction.apply(null, args));
        return retval;
      };
    };
    infowar.kill = withHistory(infowar.kill, STATE, History.Kill);
    infowar.interrogate = withHistory(infowar.interrogate, STATE, History.Interrogate);
    infowar.grow = withHistory(infowar.grow, INSURGENT, History.Grow);
    infowar.addInsurgent = withHistory(infowar.addInsurgent, INSURGENT, History.Placement);
    infowar.insurgentMove = withHistory(infowar.insurgentMove, INSURGENT, History.Move);
    infowar.stateMove = withHistory(infowar.stateMove, STATE, History.Move);

    var endTurn = infowar.endTurn;
    infowar.endTurn = function() {
      var player = infowar.currentTurn() ? infowar.currentTurn().id() : "";
      return withHistory(endTurn, player, History.EndTurn)();
    };

    infowar.history = function(role) {
      if (role === h.C.STATE) {
        // State cannot see entire game history
        return _.map(history, function(entry) {
          return entry.mask();
        });
      }
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

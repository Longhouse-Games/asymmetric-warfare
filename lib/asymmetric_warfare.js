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

  var AsymmetricWarfare = function() {
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
      notify('end_of_turn', currentTurn.id());
    }

    var gameOver = function() {
      var cleanup = function(winner) {
        currentTurn = undefined;
        currentPhase = h.C.GAMEOVER;
        notify('gameover', winner);
        return winner;
      };

      if (currentPhase === h.C.SETUP) {
        return false;
      }

      if (killedInsurgents >= 12) {
        return cleanup(h.C.STATE);
      }

      if (board.getPositionsByType(h.C.INSURGENT).length === 0) {
        return cleanup(h.C.STATE);
      }

      // Insurgents hold any six spaces of the inner circle
      var occupiedInnerCircles = _.filter(board.getPositionsByType(h.C.INSURGENT), function(position) {
        return position.circle === INNER_CIRCLE;
      });
      if (occupiedInnerCircles.length >= 6) {
        return cleanup(h.C.INSURGENT);
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
            return cleanup(h.C.INSURGENT);
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

    var reserveInsurgents = function() {
      var insurgentsInPlay = _.chain(board.getPieces())
        .map(function(piecesAt, poskey) {
          return _.filter(piecesAt, function(piece) { return piece.type() === h.C.INSURGENT; });
        })
        .reduce(function(count, pieces) { return count + pieces.length }, 0)
        .value();

      return h.C.MAX_INSURGENTS - insurgentsInPlay - killedInsurgents;
    }

    var canGrow = function() {
      if (reserveInsurgents() <= 0) {
        return false;
      }
      var found = false;
      found = !!(_.find(board.getPositionsByType(h.C.INSURGENT), function(position) {
        var pieces = board.getInsurgentPiecesAt(position);
        return pieces.length >= 2;
      }));
      return found;
    };

    var grow = function(grow) {
      if (!canGrow()) {
        throw "No more insurgents left!";
      }

      var adjacentPosition = _.find([grow.position()].concat(grow.position().adjacentPositions()), function(position) {
        return board.getInsurgentPiecesAt(position).length > 1;
      });
      if (!adjacentPosition) {
        throw "Must have two adjacent insurgents in order to grow!";
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

      var insurgents = [];
      var seenPositions = [interrogate.position().asKey()];
      var positionsToCheck = interrogate.position().adjacentPositions();

      while(positionsToCheck.length > 0) {
        var position = positionsToCheck.shift();

        if (!_.contains(seenPositions, position.asKey())) {
          seenPositions.push(position.asKey());

          if (board.getInsurgentPiecesAt(position).length > 0) {
            if (board.getInsurgentPiecesAt(position).length === 1) {
              insurgents.push(position);
            }

            var newPositions = position.adjacentPositions();
            _.each(newPositions, function(pos) {
              positionsToCheck.push(pos);
            });
          }
        }
      }

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

    var listeners = {
      gameover: [],
      end_of_turn: []
    };
    function validateMessage(message) {
      if (message !== 'gameover' && message !== 'end_of_turn') {
        throw "Unknown message. Must be 'gameover' or 'end_of_turn'";
      }
    }
    function on(message, callback) {
      validateMessage(message);
      listeners[message].push(callback);
    }
    /*
     * Clears all listeners of 'message'
     */
    function off(message) {
      validateMessage(message);
      listeners[message] = [];
    }
    /*
     * `data` is passed to each listener
     */
    function notify(message, data) {
      validateMessage(message);
      _.each(listeners[message], function(callback) {
        callback(data);
      });
    }

    return {
      on: on,
      off: off,
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
      getBoard: function() {
        return board;
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
      canGrow: canGrow,
      grow: function(position) {
        if (!isInsurgentTurn()) {
          throw "It's not your turn!";
        }
        var growaction = Grow(position);
        applyAction(grow, [growaction]);
      },
      killedInsurgents: function() { return killedInsurgents; },
      reserveInsurgents: reserveInsurgents,
      state: function(role) {
        var statePieces = _.chain(board.getPositionsByType(h.C.STATE))
          .map(function(position) {
            return _.map(board.getStatePiecesAt(position), function(piece) { return position; });
          })
          .flatten()
          .map(function(position) { return position.asKey(); })
          .value();
        var visibleInsurgents = _.chain(board.getPositionsByType(h.C.INSURGENT))
          .map(function(position) {
            if (board.getInsurgentPiecesAt(position).length >= 2 || board.getStatePiecesAt(position).length >= 1) {
              return _.map(board.getInsurgentPiecesAt(position), function(piece) { return position; });
            }
            return [];
          })
          .flatten()
          .map(function(position) { return position.asKey(); })
          .value();
        var turnState = null;
        if (currentTurn && currentTurn.id() === role) {
          turnState = currentTurn.asDTO();
        }
        return {
          currentTurn: currentTurn ? currentTurn.id() : null,
          turnState: turnState,
          currentPhase: currentPhase,
          killedInsurgents: killedInsurgents,
          visibleInsurgents: visibleInsurgents,
          statePieces: statePieces
        };
      }
    };
  };


  var AsymmetricWarfareWithHistory = function(_history) {
    var history = _history || [];
    var asymwar = AsymmetricWarfare();

    if (_.detect(history, function(entry) { return entry.masked; })) {
      throw "Masked history cannot be reapplied.";
    }

    if (!history || history.length === 0) {
      for (var i = 0; i < INITIAL_STATE_PIECES; i++) {
        history.push(History.Placement(STATE, Position(CAPITAL)(0)));
      }
    } else {
      for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        if (entry.type() === h.C.PLACEMENT && entry.player() === h.C.STATE) {
          //We don't want to apply State placements, as it's not a public method
          //on AsymmetricWarfare, and it's also already done during initialisation.
        } else {
          entry.apply(asymwar);
        }
      }
    }

    var withHistory = function(asymwarFunction, player, historyFunction) {
      return function() {
        var retval = asymwarFunction.apply(asymwar, arguments);
        var args = Array.prototype.slice.call(arguments);
        args.unshift(player);
        history.push(historyFunction.apply(null, args));
        return retval;
      };
    };
    asymwar.kill = withHistory(asymwar.kill, STATE, History.Kill);
    asymwar.interrogate = withHistory(asymwar.interrogate, STATE, History.Interrogate);
    asymwar.grow = withHistory(asymwar.grow, INSURGENT, History.Grow);
    asymwar.addInsurgent = withHistory(asymwar.addInsurgent, INSURGENT, History.Placement);
    asymwar.insurgentMove = withHistory(asymwar.insurgentMove, INSURGENT, History.Move);
    asymwar.stateMove = withHistory(asymwar.stateMove, STATE, History.Move);

    var endTurn = asymwar.endTurn;
    asymwar.endTurn = function() {
      var player = asymwar.currentTurn() ? asymwar.currentTurn().id() : "";
      return withHistory(endTurn, player, History.EndTurn)();
    };

    asymwar.history = function(role) {
      if (role === h.C.STATE) {
        // State cannot see entire game history
        return _.map(history, function(entry) {
          return entry.mask();
        });
      }
      return history;
    }

    return asymwar;
  };

  AsymmetricWarfareWithHistory.INSURGENT = INSURGENT;
  AsymmetricWarfareWithHistory.STATE = STATE;
  AsymmetricWarfareWithHistory.INITIAL_INSURGENTS = INITIAL_INSURGENTS;
  AsymmetricWarfareWithHistory.CAPITAL = h.C.CAPITAL;
  AsymmetricWarfareWithHistory.NUM_CIRCLES = h.C.NUM_CIRCLES;
  AsymmetricWarfareWithHistory.NUM_RANKS = h.C.NUM_RANKS;

  return AsymmetricWarfareWithHistory;
});

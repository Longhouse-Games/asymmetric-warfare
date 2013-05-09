define(['lib/constants', 'lib/position', 'lib/insurgent_move', 'lib/state_move'], function(C, Position, InsurgentMove, StateMove) {
  var BasicEntry = function(player, type) {
    return {
      player: function() {
        return player;
      },
      type: function() {
        return type;
      }
    };
  };

  var Placement = function(player, position) {
    var Placement = BasicEntry(player, C.PLACEMENT);
    Placement.position = function() {
      return position;
    };
    Placement.apply = function(infowar) {
      if (player === C.INSURGENT) {
        infowar.addInsurgent(position);
      } else if (player === C.STATE) {
        infowar.addState(position);
      } else {
        throw "Invalid player value: " + player;
      }
    };
    Placement.toJSON = function() {
      return JSON.stringify({
        type: C.PLACEMENT,
        position: position.asKey(),
        player: player
      });
    };
    return Placement;
  };

  var Move = function(player, move) {
    var Move = BasicEntry(player, C.MOVE);
    Move.move = function() {
      return move;
    };
    Move.apply = function(infowar) {
      if (player === C.INSURGENT) {
        infowar.insurgentMove(move.src, move.dest);
      } else if (player === C.STATE) {
        infowar.stateMove(move.src, move.dest);
      } else {
        throw "Invalid player value: " + player;
      }
    };
    Move.toJSON = function() {
      return JSON.stringify({
        type: C.MOVE,
        player: player,
        src: move.src.asKey(),
        dest: move.dest.asKey()
      });
    };
    return Move;
  };

  var fromJSON = function(json) {
    var entry = JSON.parse(json);

    if (!entry.player || (entry.player !== C.STATE && entry.player !== C.INSURGENT)) {
      throw "Invalid player: " + entry.player;
    }

    if (entry.type === C.PLACEMENT) {
      return Placement(entry.player, Position(entry.position));
    } else if (entry.type === C.MOVE) {
      var _Move;
      if (entry.player === C.STATE) {
        _Move = StateMove;
      } else if (entry.player === C.INSURGENT) {
        _Move = InsurgentMove;
      }
      return Move(entry.player, _Move(Position(entry.src))(Position(entry.dest)));
    } else {
      throw "Invalid entry type: "+entry.type;
    }
  };

  return {
    Placement: Placement,
    Move: Move,
    fromJSON: fromJSON
  };
});

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

  var humanise = function(player) {
    return player.charAt(0).toUpperCase() + player.substring(1).toLowerCase();
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
    Placement.toDTO = function() {
      return {
        type: C.PLACEMENT,
        position: position.asKey(),
        player: player
      };
    };
    Placement.toString = function() {
      return "A " + humanise(player) + " piece was placed at " + position.asKey();
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
    Move.toDTO = function() {
      return {
        type: C.MOVE,
        player: player,
        src: move.src.asKey(),
        dest: move.dest.asKey()
      };
    };
    return Move;
  };

  var fromDTO = function(dto) {

    if (!dto.player || (dto.player !== C.STATE && dto.player !== C.INSURGENT)) {
      throw "Invalid player: " + dto.player;
    }

    if (dto.type === C.PLACEMENT) {
      return Placement(dto.player, Position(dto.position));
    } else if (dto.type === C.MOVE) {
      var _Move;
      if (dto.player === C.STATE) {
        _Move = StateMove;
      } else if (dto.player === C.INSURGENT) {
        _Move = InsurgentMove;
      }
      return Move(dto.player, _Move(Position(dto.src))(Position(dto.dest)));
    } else {
      throw "Invalid entry type: "+dto.type;
    }
  };

  return {
    Placement: Placement,
    Move: Move,
    fromDTO: fromDTO
  };
});

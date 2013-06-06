define(['lib/constants', 'lib/position', 'lib/insurgent_move', 'lib/state_move'], function(C, Position, InsurgentMove, StateMove) {
  var BasicEntry = function(player, type) {
    return {
      masked: false,
      player: function() {
        return player;
      },
      type: function() {
        return type;
      },
      mask: function() {
        return this;
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
    Placement.mask = function() {
      if (player === C.STATE) {
        return this;
      }

      var Mask = BasicEntry(player, C.PLACEMENT);
      Mask.toDTO = function() {
        return {
          masked: true,
          type: C.PLACEMENT,
          player: player,
          position: null,
          message: "A " + humanise(player) + " piece was placed."
        };
      };
      Mask.masked = true;
      return Mask;
    };
    Placement.toString = function() {
      return "A " + humanise(player) + " piece was placed at " + position.asKey();
    };
    return Placement;
  };

  var Move = function(player, src, dest) {
    var Move = BasicEntry(player, C.MOVE);
    Move.src = function() {
      return src;
    };
    Move.dest = function() {
      return dest;
    };
    Move.apply = function(infowar) {
      if (player === C.INSURGENT) {
        infowar.insurgentMove(src, dest);
      } else if (player === C.STATE) {
        infowar.stateMove(src, dest);
      } else {
        throw "Invalid player value: " + player;
      }
    };
    Move.toDTO = function() {
      return {
        type: C.MOVE,
        player: player,
        src: src.asKey(),
        dest: dest.asKey()
      };
    };
    Move.mask = function() {
      if (player === C.STATE) {
        return this;
      }

      var Mask = BasicEntry(player, C.MOVE);
      Mask.toDTO = function() {
        return {
          masked: true,
          type: C.MOVE,
          player: player,
          src: null,
          dest: null,
          message: "A " + humanise(player) + " piece was moved."
        };
      };
      Mask.masked = true;
      return Mask;
    };
    Move.toString = function() {
      return humanise(player) + " moved a piece from " + src.asKey() + " to " + dest.asKey();
    };
    return Move;
  };

  var Kill = function(player, position) {
    var type = C.KILL;
    var Kill = BasicEntry(player, type);
    Kill.toDTO = function() {
      return {
        type: type,
        player: player,
        position: position.asKey()
      };
    };
    Kill.apply = function(infowar) {
      infowar.kill(position);
    };
    Kill.toString = function() {
      return humanise(player) + " killed all the insurgents at " + position.asKey();
    };
    Kill.position = function() {
      return position;
    };
    return Kill;
  };

  var Interrogate = function(player, position) {
    var type = C.INTERROGATE;
    var Interrogate = BasicEntry(player, type);
    Interrogate.toDTO = function() {
      return {
        type: type,
        player: player,
        position: position.asKey()
      };
    };
    Interrogate.apply = function(infowar) {
      infowar.interrogate(position);
    };
    Interrogate.toString = function() {
      return humanise(player) + " interrogated an insurgent at " + position.asKey();
    };
    Interrogate.position = function() {
      return position;
    };
    return Interrogate;
  };

  var Grow = function(player, position) {
    var type = C.GROW;
    var Grow = BasicEntry(player, type);
    Grow.toDTO = function() {
      return {
        type: type,
        player: player,
        position: position.asKey()
      };
    };
    Grow.apply = function(infowar) {
      infowar.grow(position);
    };
    Grow.toString = function() {
      return humanise(player) + " grew an extra insurgent at " + position.asKey();
    };
    Grow.mask = function() {
      var Mask = BasicEntry(player, type);
      Mask.toDTO = function() {
        return {
          masked: true,
          type: type,
          player: player,
          position: null,
          message: "A " + humanise(player) + " piece grew somewhere."
        };
      };
      Mask.masked = true;
      return Mask;
    };
    Grow.position = function() {
      return position;
    };
    return Grow;
  };

  var EndTurn = function(player) {
    var EndTurn = BasicEntry(player, C.END_TURN);
    EndTurn.toDTO = function() {
      return {
        type: C.END_TURN,
        player: player
      };
    };
    EndTurn.apply = function(infowar) {
      infowar.endTurn();
    };
    EndTurn.toString = function() {
      return humanise(player) + " ended their turn.";
    };
    return EndTurn;
  };

  var fromDTO = function(dto) {

    if (!dto.player || (dto.player !== C.STATE && dto.player !== C.INSURGENT)) {
      throw "Invalid player: " + dto.player;
    }

    if (dto.type === C.PLACEMENT) {
      return Placement(dto.player, Position(dto.position));
    } else if (dto.type === C.MOVE) {
      return Move(dto.player, Position(dto.src), Position(dto.dest));
    } else if (dto.type === C.KILL) {
      return Kill(dto.player, Position(dto.position));
    } else if (dto.type === C.INTERROGATE) {
      return Interrogate(dto.player, Position(dto.position));
    } else if (dto.type === C.GROW) {
      return Grow(dto.player, Position(dto.position));
    } else if (dto.type === C.END_TURN) {
      return EndTurn(dto.player);
    } else {
      throw "Invalid entry type: "+dto.type;
    }
  };

  return {
    Placement: Placement,
    Move: Move,
    EndTurn: EndTurn,
    Kill: Kill,
    Interrogate: Interrogate,
    Grow: Grow,
    fromDTO: fromDTO
  };
});

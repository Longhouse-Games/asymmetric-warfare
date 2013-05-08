define(['lib/constants'], function(C) {
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
    return Placement;
  };

  var Move = function(player, move) {
    var Move = BasicEntry(player, C.MOVE);
    Move.move = function() {
      return move;
    };
    return Move;
  };

  return {
    Placement: Placement,
    Move: Move
  };
});

define([], function() {
  var MOVE = 'MOVE';
  var Turn = function() {
    var movementPoints = 2;
    return {
      validActions: function() {
        var actions = [];
        if (movementPoints > 0) {
          actions.push(MOVE);
        }
        return actions;
      },
      applyMove: function(move) {
        if (movementPoints <= 0) {
          throw "No movement points remaining!";
        }
        movementPoints -= move.distance();
      },
      movementPoints: function() {
        return movementPoints;
      }
    };
  };
  Turn.MOVE = MOVE;
  return Turn;
});

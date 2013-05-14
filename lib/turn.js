define([], function() {
  var MOVE = 'MOVE';
  var Turn = function(id) {
    var movementPoints = 2;

    var validActions = function() {
      var actions = [];
      if (movementPoints > 0) {
        actions.push(MOVE);
      }
      return actions;
    };

    return {
      validActions: validActions,
      isComplete: function() {
        return validActions().length === 0;
      },
      applyMove: function(move) {
        if (movementPoints <= 0) {
          throw "No movement points remaining!";
        }
        if (movementPoints - move.distance() < 0) {
          throw "Insufficient movement points!";
        }
        movementPoints -= move.distance();
      },
      movementPoints: function() {
        return movementPoints;
      },
      id: function() {
        return id;
      }
    };
  };
  Turn.MOVE = MOVE;
  return Turn;
});

define(['underscore', 'lib/constants'], function(_, C) {
  var MOVE = C.MOVE;
  var Turn = function(id, possibleActions) {
    var nonMoveActions = [];
    var movementPoints = C.MOVEMENT_POINTS;

    var validActions = function() {
      var actions = [];
      if (movementPoints > 0) {
        //players cannot MOVE, ACTION, MOVE
        actions.push(MOVE);
      }
      if (nonMoveActions.length === 0) {
        // Each player gets one non-move action per turn
        _.each(possibleActions, function(action) {
          actions.push(action);
        });
      }
      if (actions.length > 0) {
        actions.push(C.END_TURN);
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
      applyAction: function(action) {
        if (_.contains(nonMoveActions, action)) {
          throw "Action '"+action+"' has already been applied.";
        }
        // If they have already started moving, they can no longer move again now
        if (movementPoints !== C.MOVEMENT_POINTS) {
          movementPoints = 0;
        }
        nonMoveActions.push(action);
      },
      movementPoints: function() {
        return movementPoints;
      },
      id: function() {
        return id;
      },
      asDTO: function() {
        return {
          nonMoveActions: nonMoveActions,
          movementPoints: movementPoints
        };
      },
      fromDTO: function(dto) {
        nonMoveActions = dto.nonMoveActions;
        movementPoints = dto.movementPoints;
      }
    };
  };
  Turn.MOVE = MOVE;
  return Turn;
});

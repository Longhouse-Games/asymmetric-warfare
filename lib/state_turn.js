define(['lib/turn'], function(Turn) {
  var ID = "STATE";
  var StateTurn = function() {
    return Turn(ID);
  };
  StateTurn.ID = ID;
  StateTurn.MOVE = Turn.MOVE;
  return StateTurn;
});

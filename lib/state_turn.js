define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.STATE;
  var StateTurn = function() {
    return Turn(ID);
  };
  StateTurn.ID = ID;
  StateTurn.MOVE = Turn.MOVE;
  return StateTurn;
});

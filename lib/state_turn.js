define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.STATE;
  var StateTurn = function() {
    return Turn(ID, [C.END_TURN]);
  };
  StateTurn.ID = ID;
  StateTurn.MOVE = Turn.MOVE;
  StateTurn.END_TURN = C.END_TURN;
  return StateTurn;
});

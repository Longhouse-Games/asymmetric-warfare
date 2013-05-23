define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.INSURGENT;
  var InsurgentTurn = function() {
    return Turn(ID, [C.END_TURN]);
  };
  InsurgentTurn.ID = ID;
  InsurgentTurn.MOVE = Turn.MOVE;
  InsurgentTurn.END_TURN = C.END_TURN;
  return InsurgentTurn;
});

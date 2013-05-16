define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.INSURGENT;
  var InsurgentTurn = function() {
    return Turn(ID);
  };
  InsurgentTurn.ID = ID;
  InsurgentTurn.MOVE = Turn.MOVE;
  return InsurgentTurn;
});

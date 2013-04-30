define(['lib/turn'], function(Turn) {
  var ID = "INSURGENT";
  var InsurgentTurn = function() {
    return Turn(ID);
  };
  InsurgentTurn.ID = ID;
  InsurgentTurn.MOVE = Turn.MOVE;
  return InsurgentTurn;
});

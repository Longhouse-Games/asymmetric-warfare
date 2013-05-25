define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.INSURGENT;
  var InsurgentTurn = function() {
    var turn = Turn(ID, [C.GROW]);
    turn.applyGrow = function(position) {
      turn.applyAction(C.GROW);
    };
    return turn;
  };
  InsurgentTurn.ID = ID;
  InsurgentTurn.MOVE = Turn.MOVE;
  InsurgentTurn.GROW = C.GROW;
  InsurgentTurn.END_TURN = C.END_TURN;
  return InsurgentTurn;
});

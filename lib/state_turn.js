define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.STATE;
  var StateTurn = function() {
    var turn =  Turn(ID, [C.KILL]);
    turn.applyKill = function (kill) {
      turn.applyAction(C.KILL);
    };
    return turn;
  };
  StateTurn.ID = ID;
  StateTurn.MOVE = Turn.MOVE;
  StateTurn.END_TURN = C.END_TURN;
  StateTurn.KILL = C.KILL;
  return StateTurn;
});

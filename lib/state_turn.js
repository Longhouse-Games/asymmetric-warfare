define(['lib/turn', 'lib/constants'], function(Turn, C) {
  var ID = C.STATE;
  var StateTurn = function() {
    var turn = Turn(ID, [C.KILL, C.INTERROGATE]);
    turn.applyKill = function (kill) {
      turn.applyAction(C.KILL);
    };
    turn.applyInterrogate = function(interrogate) {
      turn.applyAction(C.INTERROGATE);
    };
    return turn;
  };
  StateTurn.ID = ID;
  StateTurn.MOVE = Turn.MOVE;
  StateTurn.END_TURN = C.END_TURN;
  StateTurn.KILL = C.KILL;
  StateTurn.INTERROGATE = C.INTERROGATE;
  return StateTurn;
});

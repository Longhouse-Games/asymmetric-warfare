define([], function() {
  var C = {};
  C.NUM_RANKS = 12;
  C.NUM_CIRCLES = 5;
  C.CAPITAL = 4;

  C.INSURGENT = "insurgent";
  C.STATE = "state";

  C.INITIAL_INSURGENTS = 5;
  C.INITIAL_STATE_PIECES = 5;

  C.PLACEMENT = "PLACEMENT";
  C.MOVE = "MOVE";
  C.END_TURN = "END_TURN";

  C.SETUP = "SETUP";
  C.PLAYING = "PLAYING";
  C.GAMEOVER = "GAMEOVER";

  return C;
});

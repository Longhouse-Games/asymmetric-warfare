define(['lib/constants'], function(C) {
  var INSURGENT_TYPE = C.INSURGENT;
  var STATE_TYPE = C.STATE;

  var Piece = function(type) {
    return function() {
      return {
        type: function() { return type }
      };
    }
  };
  return {
    INSURGENT_TYPE: INSURGENT_TYPE,
    STATE_TYPE: STATE_TYPE,
    InsurgentPiece: Piece(INSURGENT_TYPE),
    StatePiece: Piece(STATE_TYPE)
  };
});

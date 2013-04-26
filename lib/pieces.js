define([], function() {
  var INSURGENT_TYPE = "INSURGENT";
  var STATE_TYPE = "STATE";

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

define(['lib/constants', 'lib/move'],
  function(C, Move) {
    var CAPITAL = C.CAPITAL;

    var validate = function(src, dest) {
      if (src.circle === CAPITAL || dest.circle === CAPITAL) {
        throw "Invalid move";
      }
    };

    return function(src) {
      return function(dest) {
        validate(src, dest);

        return Move(src)(dest);
      };
    };
  }
);

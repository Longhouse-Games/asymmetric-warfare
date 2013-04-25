define(['lib/move'],
  function(Move) {
    var CAPITAL = 4;

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

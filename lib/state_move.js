define(['lib/move'],
  function(Move) {
    return function(src) {
      return function(dest) {
        return Move(src)(dest);
      };
    };
  }
);

define([], function() {

  var validateCircle = function(value) {
    if (value < 0 || value > 4) {
      throw "Invalid circle value";
    }
  };

  var validateRank = function(circle, rank) {
    if (rank < 0 || rank > 11 ||
      (circle === 4 && rank > 0)) {
      throw "Invalid rank value";
    }
  };

  return function(circle) {
    validateCircle(circle);
    return function(rank) {
      validateRank(circle, rank);
      return {
        circle: circle,
        rank: rank
      };
    };
  };
});

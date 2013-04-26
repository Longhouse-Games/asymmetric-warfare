define([], function() {

  var constructor = function(circle) {
    validateCircle(circle);

    return function(rank) {
      validateRank(circle, rank);
      return {
        circle: circle,
        rank: rank,
        asKey: function() {
          return asKey(circle, rank);
        }
      };
    };
  };

  var validateCircle = function(value) {
    if (value < 0 || value > 4 || isNaN(value) || !isFinite(value)) {
      throw "Invalid circle value";
    }
  };

  var validateRank = function(circle, rank) {
    if (rank < 0 || rank > 11 ||
      (circle === 4 && rank > 0) || isNaN(rank) || !isFinite(rank)) {
      throw "Invalid rank value";
    }
  };

  var asKey = function(circle, rank) {
    return circle + "," + rank;
  };

  return function(circle) {
    if (typeof circle === 'string') {
      var vals = circle.split(',');
      circle = parseInt(vals[0]);
      rank = parseInt(vals[1]);
      return constructor(circle)(rank);
    }
    return constructor(circle);
  };
});

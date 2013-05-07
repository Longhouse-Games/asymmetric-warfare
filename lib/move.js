define(['lib/constants', 'lib/position'],
  function(C, Position) {

    var CAPITAL = C.CAPITAL;

    /*
     * Direction denotes whether this move takes us closer (inwards) or further
     * out (outwards) from the capital. Take the circle values from `src` and
     * `dest`, then direction is `src.circle - dest.circle`.
     *
     * If this is zero, then we are moving within the same circle. If this is
     * positive, we are moving outwards. If it is negative, we are moving
     * inwards, towards the capital.
     */
    var direction = function(src, dest) {
      return src.circle - dest.circle;
    };

    /*
     * Determines if the two positions are adjacent. Within the same circle,
     * spaces are adjacent if their rank values only differ by one (modulo 12).
     *
     * Across circles, spaces are adjacent depending on if the destination 
     * circle we're moving to is outwards or inwards:
     *   outwards: same rank value, or rank+1
     *   inwards: same rank value, or rank-1
     *
     * Examples:
     *   B2 is adjacent to B1, B3, A2, A3, C1 and C2.
     *   B2 is not adjacent to B12, B4, A1, A4, C12 and C3.
     */
    var isAdjacent = function(src, dest) {
      var dir = direction(src, dest);
      if (dir === 0) {
        return (Math.abs(src.rank - dest.rank)) === 1;
      }
      if (dir <= -1) {
        return dest.circle === CAPITAL || src.rank === dest.rank || src.rank === dest.nextRank();
      }
      if (dir >= 1) {
        return src.circle === CAPITAL || src.rank === dest.rank || src.rank === dest.previousRank();
      }
      return null;
    };

    var validate = function(src, dest) {
      if (distance(src, dest) > 2 || distance(src, dest) === 0 ||
          (Math.abs(src.circle - dest.circle) > 1) ||
          (src.circle !== dest.circle && !isAdjacent(src, dest))) {
        throw "Invalid move";
      };
    };

    var distance = function(src, dest) {
      try {
        return src.distanceTo(dest);
      } catch (e) {
        if (e === "Distance across multiple circles is not supported") {
          throw "Invalid move";
        } else {
          throw e;
        }
      }
    };

    return function(src) {
      return function(dest) {
        validate(src, dest);

        return {
          src: src,
          dest: dest,
          distance: function() { return distance(src, dest) }
        };
      };
    };
  }
);

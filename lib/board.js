define([],
  function() {
    var NUM_CIRCLES = 5;
    var NUM_RANKS = 12;

    var CAPITAL = NUM_CIRCLES-1;

    var validatePiece = function(piece) {
      if (!piece) {
        throw "Invalid board: piece not specified";
      }
    };
    var validatePosition = function(position) {
      if (!position) {
        throw "Invalid board: position not specified";
      }
    };

    return function() {
      var pieces = {};

      return {
        addPiece: function(piece, position) {
          validatePiece(piece);
          validatePosition(position);

          if (pieces[position.asKey()]) {
            pieces[position.asKey()].push(piece);
          } else {
            pieces[position.asKey()] = [piece];
          }
        },
        removePiece: function(piece, position) {
          validatePiece(piece);
          validatePosition(position);

          if (!pieces[position.asKey()]) {
            throw "Piece not found at '"+position.asKey()+"'";
          } else {
            var localPieces = pieces[position.asKey()];
            for (var i = 0; i < localPieces.length; i++) {
              if (localPieces[i] === piece) {
                localPieces.splice(i, 1);
                break;
              }
            }
            if (localPieces.length === 0) {
              pieces[position.asKey()] = undefined;
            }
          }
        },
        getPieces: function() {
          return pieces;
        }
      };
    };
  }
);

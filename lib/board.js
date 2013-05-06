define(['lib/constants', 'lib/pieces'],
  function(C, Pieces) {
    var NUM_CIRCLES = C.NUM_CIRCLES;
    var NUM_RANKS = C.NUM_RANKS;
    var CAPITAL = C.CAPITAL;

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

    var Board = function() {
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
              if (localPieces[i].type() === piece.type()) {
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
        },
        getPiecesAt: function(position) {
          return pieces[position.asKey()];
        },
        getInsurgentPiecesAt: function(position) {
          var insurgents = [];
          var piecesAt = pieces[position.asKey()];
          if (piecesAt) {
            for (var i = 0; i < piecesAt.length; i++) {
              if (piecesAt[i].type() === Pieces.INSURGENT_TYPE) {
                insurgents.push(piecesAt[i]);
              }
            }
          }
          return insurgents;
        }
      };
    };

    return Board;
  }
);

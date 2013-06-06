define(['underscore', 'lib/constants', 'lib/pieces', 'lib/position'],
  function(_, C, Pieces, Position) {
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
          var retval = pieces[position.asKey()];
          if (retval) {
            return retval.slice(0); // clones the array
          }
        },
        getPositionsByType: function(type) {
          if (type !== C.STATE && type !== C.INSURGENT) {
            throw "Invalid type: " + type;
          }
          return _.chain(pieces)
            .map(function(piecesAt, poskey) {
              if (_.any(piecesAt, function(piece) { return piece.type() === type; })) {
                return Position(poskey);
              }
              return null;
            })
            .compact()
            .value();
        },
        getStatePiecesAt: function(position) {
          var statePieces = [];
          var piecesAt = pieces[position.asKey()];
          if (piecesAt) {
            for (var i = 0; i < piecesAt.length; i++) {
              if (piecesAt[i].type() === Pieces.STATE_TYPE) {
                statePieces.push(piecesAt[i]);
              }
            }
          }
          return statePieces;
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

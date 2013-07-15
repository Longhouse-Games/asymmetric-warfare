define(['underscore', 'lib/helpers', 'lib/asymmetric_warfare'], function(_, h, AsymmetricWarfare) {
var Position = h.Position;
var Pieces = h.Pieces;
var InsurgentMove = h.InsurgentMove;
var StateMove = h.StateMove;
var History = h.History;

var initInsurgents = function(asymwar) {
  var positions = [
    Position(0)(0),
    Position(0)(2),
    Position(0)(4),
    Position(0)(6),
    Position(0)(8)
  ];
  for (var i = 0; i < positions.length; i++) {
    asymwar.addInsurgent(positions[i]);
  }
  return positions;
};

describe("asymwar", function() {
  var asymwar;

  describe("initial setup", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
    });

    it("should be no one's turn", function() {
      expect(asymwar.currentTurn()).toBe(undefined);
    });
    it("should be the setup phase", function() {
      expect(asymwar.currentPhase()).toBe(h.C.SETUP);
    });
    it("should have five state pieces in the capital", function() {
      var pieces = asymwar.getPiecesAt(Position(4)(0));
      expect(pieces.length).toBe(5);
      for (var i = 0; i < pieces.length; i++) {
        expect(pieces[i].type()).toBe(Pieces.STATE_TYPE);
      }
    });
    it("should record the initial states pieces in the history log", function() {
      var history = asymwar.history();
      expect(history.length).toBe(5);
      for (var i = 0; i < 5; i++) {
        var move = history[i];
        expect(move.player()).toBe(AsymmetricWarfare.STATE);
      }
    });
    describe("insurgent placement", function() {
      it("should indicate that five insurgents can be placed", function() {
        expect(asymwar.initialInsurgents()).toBe(5);
      });
      it("should not accept too many placements", function() {
        initInsurgents(asymwar);
        expect(function() {
          asymwar.addInsurgent(Position(0)(0));
        }).toThrow("Cannot add more insurgents!");
      });
      it("should decrease initial insurgents as pieces are added", function() {
        asymwar.addInsurgent(Position(0)(0));
        expect(asymwar.initialInsurgents()).toBe(4);
        asymwar.addInsurgent(Position(0)(2));
        expect(asymwar.initialInsurgents()).toBe(3);
        asymwar.addInsurgent(Position(0)(4));
        expect(asymwar.initialInsurgents()).toBe(2);
        asymwar.addInsurgent(Position(0)(6));
        expect(asymwar.initialInsurgents()).toBe(1);
        asymwar.addInsurgent(Position(0)(8));
        expect(asymwar.initialInsurgents()).toBe(0);
      });
      it("should accept arbitrary positions in the outer ring for insurgents", function() {
        var positions = [
          Position(0)(0),
          Position(0)(2),
          Position(0)(4),
          Position(0)(6),
          Position(0)(8)
        ];
        for (var i = 0; i < positions.length; i++) {
          asymwar.addInsurgent(positions[i]);
        }
        for (var i = 0; i < positions.length; i++) {
          var pieces = asymwar.getPiecesAt(positions[i]);
          expect(pieces.length).toBe(1);
          expect(pieces[0].type()).toBe(Pieces.INSURGENT_TYPE);
        }
      });
      it("should not permit insurgents in other rings", function() {
        for (var i = 1; i < h.C.NUM_CIRCLES; i++) {
          expect(function() {
            asymwar.addInsurgent(Position(i)(0));
          }).toThrow("Invalid placement!");
        }
      });
      it("should permit insurgents to all start on the same spot", function() {
        var pos = Position(0)(0);
        for (var i = 0; i < 5; i++) {
          asymwar.addInsurgent(pos);
        }
        var pieces = asymwar.getPiecesAt(pos);
        expect(pieces.length).toBe(5);
        for (var i = 0; i < 5; i++) {
          expect(pieces[i].type()).toBe(Pieces.INSURGENT_TYPE);
        }
      });
      it("should indicate that it's the insurgent's turn after placement", function() {
        initInsurgents(asymwar);
        expect(asymwar.currentTurn().id()).toBe(AsymmetricWarfare.INSURGENT);
      });
      it("should change the phase to playing", function() {
        initInsurgents(asymwar);
        expect(asymwar.currentPhase()).toBe(h.C.PLAYING);
      });
      it("should add entries into the history log", function() {
        for (var i = 0; i < 5; i++) {
          asymwar.addInsurgent(Position(0)(i));
        }
        var history = asymwar.history();
        expect(history.length).toBe(10);
        for (var i = 0; i < 5; i++) {
          var entry = history[i+5];
          expect(entry.player()).toBe(AsymmetricWarfare.INSURGENT);
          expect(entry.position()).toBeDefined();
          expect(entry.position().asKey()).toBe(Position(0)(i).asKey());
        }
      });
    });
  });

  describe("ending a turn", function() {
    var initialHistory;
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      initInsurgents(asymwar);
      initialHistory = asymwar.history().length;
    });
    it("should record history for ending a turn", function() {
      asymwar.endTurn();
      var history = asymwar.history();
      expect(history.length).toBe(initialHistory + 1);
      expect(history[history.length-1].type()).toBe(h.C.END_TURN);
      expect(history[history.length-1].player()).toBe(h.C.INSURGENT);
    });
  });

  describe("creating from history", function() {
    var history;
    beforeEach(function() {
      history = [];
      for (var i = 0; i < 5; i++) {
        history.push(History.Placement(AsymmetricWarfare.STATE, Position(h.C.CAPITAL)(0)));
      }
      asymwar = AsymmetricWarfare(history);
    });
    describe("with minimal history", function() {
      it("should be at the same state after initial creation", function() {
        expect(asymwar.getPiecesAt(Position(h.C.CAPITAL)(0))).toBeDefined();
        expect(asymwar.getPiecesAt(Position(h.C.CAPITAL)(0)).length).toEqual(5);
      });
      it("should use the same history", function() {
        expect(asymwar.history().length).toBe(history.length);
        for (var i = 0; i < history.length; i++) {
          expect(asymwar.history()[i].type()).toEqual(history[i].type());
          expect(asymwar.history()[i].player()).toEqual(history[i].player());
          expect(asymwar.history()[i].position().asKey()).toEqual(history[i].position().asKey());
        }
      });
    });
    describe("with insurgents placed", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(AsymmetricWarfare.INSURGENT, Position(0)(0)));
        }
      });
      it("should be at the same state after placing insurgents", function() {
        var asymwar = AsymmetricWarfare(history);
        expect(asymwar.getPiecesAt(Position(0)(0))).toBeDefined();
        expect(asymwar.getPiecesAt(Position(0)(0)).length).toEqual(5);
      });
    });
    describe("with some moves", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(AsymmetricWarfare.INSURGENT, Position(0)(0)));
        }
        history.push(History.Move(AsymmetricWarfare.INSURGENT, Position(0)(0), Position(1)(0)));
        history.push(History.EndTurn(AsymmetricWarfare.INSURGENT));
        history.push(History.Move(AsymmetricWarfare.STATE, Position(h.C.CAPITAL)(0), Position(3)(0)));
        history.push(History.EndTurn(AsymmetricWarfare.STATE));
        history.push(History.Move(AsymmetricWarfare.INSURGENT, Position(1)(0), Position(1)(1)));
        history.push(History.EndTurn(AsymmetricWarfare.INSURGENT));

        asymwar = AsymmetricWarfare(history);
      });
      it("should be at the same state", function() {
        expect(asymwar.currentTurn().id()).toBe(AsymmetricWarfare.STATE);
        expect(asymwar.getPiecesAt(Position(1)(0))).toBeUndefined();
        expect(asymwar.getPiecesAt(Position(1)(1))).toBeDefined();
        expect(asymwar.getPiecesAt(Position(1)(1))[0].type()).toBe(Pieces.INSURGENT_TYPE);
        expect(asymwar.getPiecesAt(Position(3)(0))).toBeDefined();
        expect(asymwar.getPiecesAt(Position(3)(0))[0].type()).toBe(Pieces.STATE_TYPE);
        expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(4);
        expect(asymwar.getPiecesAt(Position(h.C.CAPITAL)(0)).length).toBe(4);
      });
    });
    describe("with a masked history", function() {
      var maskedHistory;
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          // Insurgent placements are masked
          history.push(History.Placement(AsymmetricWarfare.INSURGENT, Position(0)(i)));
        }
        asymwar = AsymmetricWarfare(history);
        maskedHistory = asymwar.history(h.C.STATE);
      });
      it("should throw an error", function() {
        expect(function() {
          asymwar = AsymmetricWarfare(maskedHistory);
        }).toThrow("Masked history cannot be reapplied.");
      });
    });
    describe("with an invalid history", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(AsymmetricWarfare.INSURGENT, Position(0)(0)));
        }
      });
      it("should not permit illegal moves", function() {
        history.push(History.Move(AsymmetricWarfare.STATE, StateMove(Position(h.C.CAPITAL)(0), Position(3)(0))));
        expect(function() {
          asymwar = AsymmetricWarfare(history);
        }).toThrow("It's not your turn!");
      });
      it("should not permit arbitrary placement", function() {
        history.push(History.Placement(AsymmetricWarfare.INSURGENT, Position(3)(0)));
        expect(function() {
          asymwar = AsymmetricWarfare(history);
        }).toThrow("Invalid placement!");
      });
    });
  });

  describe("insurgent turn", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      asymwar.addInsurgent(Position(0)(0));
      asymwar.addInsurgent(Position(0)(2));
      asymwar.addInsurgent(Position(0)(4));
      asymwar.addInsurgent(Position(0)(6));
      asymwar.addInsurgent(Position(0)(8));
    });
    it("should change to state's turn after insurgent finishes turn", function() {
      var src = Position(0)(2);
      var dest = Position(1)(2);
      asymwar.insurgentMove(src, dest);
      asymwar.endTurn();
      expect(asymwar.getPiecesAt(src)).toBe(undefined);
      expect(asymwar.getPiecesAt(dest).length).toBe(1);
      expect(asymwar.currentTurn().id()).toBe(AsymmetricWarfare.STATE);
    });
    it("should throw if a state's move is given", function() {
      expect(function() {
        asymwar.stateMove(Position(1)(2), Position(2)(2));
      }).toThrow("It's not your turn!");
    });
    it("should not change to the state's turn until the turn is complete", function() {
      var src = Position(0)(2);
      var dest = Position(0)(3);
      asymwar.insurgentMove(src, dest);
      expect(asymwar.getPiecesAt(src)).toBe(undefined);
      expect(asymwar.getPiecesAt(dest).length).toBe(1);
      expect(asymwar.currentTurn().id()).toBe(AsymmetricWarfare.INSURGENT);
    });
    it("should add an entry in the log", function() {
      var src = Position(0)(2);
      var dest = Position(0)(4);
      asymwar.insurgentMove(src, dest);
      var history = asymwar.history();
      expect(history.length).toBe(11);
      var entry = history[10];
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(AsymmetricWarfare.INSURGENT);
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
    });
  });
  describe("state turn", function() {
    var initialHistory;
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(i));
      }
      asymwar.insurgentMove(Position(0)(2), Position(1)(2));
      asymwar.endTurn();
      initialHistory = asymwar.history().length;
    });
    it("should throw if an insurgent's move is given", function() {
      expect(function() {
        asymwar.insurgentMove(Position(1)(2), Position(2)(2));
      }).toThrow("It's not your turn!");
    });
    it("should change to insurgent's turn after state finishes turn", function() {
      asymwar.endTurn();
      expect(asymwar.currentTurn().id()).toBe(AsymmetricWarfare.INSURGENT);
    });
    it("should add an entry in the log", function() {
      var src = Position(4)(0);
      var dest = Position(3)(0);
      asymwar.stateMove(src, dest);
      var history = asymwar.history();
      expect(history.length).toBe(initialHistory+1);
      var entry = history[history.length-1];
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(AsymmetricWarfare.STATE);
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
    });
  });

  describe("state has three pieces in the inner circle", function() {
    var innerCircle;
    beforeEach(function() {
      innerCircle = Position(h.C.CAPITAL-1);

      asymwar = AsymmetricWarfare();
      initInsurgents(asymwar);
      _.times(3, function() {
        asymwar.endTurn();
        asymwar.stateMove(Position(h.C.CAPITAL)(0), innerCircle(0));
        asymwar.endTurn();
      });
      asymwar.endTurn();
    });
    it("should permit moving one of those pieces around the circle", function() {
      expect(function() {
        asymwar.stateMove(innerCircle(0), innerCircle(2));
      }).not.toThrow();
    });
    it("should not permit moving another state piece into the inner circle", function() {
      expect(function() {
        asymwar.stateMove(Position(h.C.CAPITAL)(0), innerCircle(0));
      }).toThrow("No more than 3 State pieces permitted in the inner circle!");
    });
  });

  var endGameWithWinner = function(winner) {
    it("should end the game", function() {
      expect(asymwar.currentTurn()).toBe(undefined);
      expect(asymwar.currentPhase()).toBe(h.C.GAMEOVER);
    });
    it(winner+" should be the winner", function() {
      expect(asymwar.winner()).toBe(winner);
    });
  };

  describe("state kills 12 insurgents", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(0));
      }
      for (var i = 0; i < 12 - AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.grow(Position(0)(0));
        asymwar.endTurn();
        asymwar.endTurn();
      }
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(12);
      for (var i = h.C.CAPITAL; i > 0; i--) {
        asymwar.endTurn();
        asymwar.stateMove(Position(i)(0), Position(i-1)(0));
        asymwar.endTurn();
      }
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(13);
      asymwar.endTurn();
      asymwar.kill(Position(0)(0));
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(1);
    });
    endGameWithWinner(h.C.STATE);
  });
  describe("state clears the board of insurgents", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(0));
      }
      for (var i = h.C.CAPITAL; i > 0; i--) {
        asymwar.endTurn();
        asymwar.stateMove(Position(i)(0), Position(i-1)(0));
        asymwar.endTurn();
      }
      asymwar.endTurn();
      asymwar.kill(Position(0)(0));
    });
    endGameWithWinner(h.C.STATE);
  });
  describe("insurgents hold any six spaces in the inner ring", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(0));
      }
      asymwar.grow(Position(0)(0));
      asymwar.endTurn();
      asymwar.endTurn();
      _.times(6, function() {
        for (var i = 0; i < h.C.INNER_CIRCLE; i++) {
          asymwar.insurgentMove(Position(i)(0), Position(i+1)(0));
          asymwar.endTurn();
          asymwar.endTurn();
        }
      });
      expect(asymwar.getPiecesAt(Position(3)(0)).length).toBe(6);
      //Position them at 3,11, 3,0, 3,1 and 3,5, 3,6, 3,7
      //Move 3 of them to 3,6
      _.times(3, function() {
        asymwar.insurgentMove(Position(3)(0), Position(3)(2));
        asymwar.endTurn();
        asymwar.endTurn();
        asymwar.insurgentMove(Position(3)(2), Position(3)(4));
        asymwar.endTurn();
        asymwar.endTurn();
        asymwar.insurgentMove(Position(3)(4), Position(3)(6));
        asymwar.endTurn();
        asymwar.endTurn();
      });
      asymwar.insurgentMove(Position(3)(0), Position(3)(11));
      asymwar.endTurn();
      asymwar.endTurn();
      asymwar.insurgentMove(Position(3)(0), Position(3)(1));
      asymwar.endTurn();
      asymwar.endTurn();
      asymwar.insurgentMove(Position(3)(6), Position(3)(5));
      asymwar.endTurn();
      asymwar.endTurn();
      asymwar.insurgentMove(Position(3)(6), Position(3)(7));
    });
    endGameWithWinner(h.C.INSURGENT);
  });
  describe("insurgents hold four adjacent spaces in the inner ring", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(0));
      }
      var state_src = Position(4)(0);
      var state_dest = Position(3)(0);
      var moveState = function() {
        asymwar.stateMove(state_src, state_dest);
        var tmp = state_src;
        state_src = state_dest;
        state_dest = tmp;
        asymwar.endTurn();
      };
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
          asymwar.insurgentMove(Position(j)(0), Position(j+1)(0));
          asymwar.endTurn();
          moveState();
        }
      }
      // Four insurgents should be at 3,0
      asymwar.insurgentMove(Position(3)(0), Position(3)(2));
      asymwar.endTurn();
      moveState();
      asymwar.insurgentMove(Position(3)(0), Position(3)(1));
      asymwar.insurgentMove(Position(3)(0), Position(3)(11));
      // Four adjacent spaces now occupied: 3,11 to 3,2
    });
    endGameWithWinner(h.C.INSURGENT);
  });
  describe("kill action", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(i));
      }
      asymwar.insurgentMove(Position(0)(1), Position(0)(0));
      asymwar.endTurn();
    });
    it("should only be possible during State turn", function() {
      asymwar.endTurn(); // insurgent turn now
      expect(function() {
        asymwar.kill(Position(0)(0));
      }).toThrow("It's not your turn!");
    });
    it("should throw if there is no state piece at the location", function() {
      expect(function() {
        asymwar.kill(Position(0)(0));
      }).toThrow("No State piece at that location!");
    });
    it("should remove all insurgent pieces at the location", function() {
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(2);
      for (var i = h.C.CAPITAL; i > 0; i--) {
        asymwar.stateMove(Position(i)(0), Position(i-1)(0));
        asymwar.endTurn();
        asymwar.endTurn(); // insurgent turn
      }
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(3);

      asymwar.kill(Position(0)(0));
      expect(asymwar.getPiecesAt(Position(0)(0)).length).toBe(1);
      expect(asymwar.getPiecesAt(Position(0)(0))[0].type()).toBe(h.C.STATE);
    });
    it("should log an entry", function() {
      var initialHistory = asymwar.history().length;
      asymwar.kill(Position(4)(0));
      expect(asymwar.history().length).toBe(initialHistory+1);
    });
  });
  describe("interrogate action", function() {
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      for (var i = 0; i < AsymmetricWarfare.INITIAL_INSURGENTS; i++) {
        asymwar.addInsurgent(Position(0)(i));
      }
      asymwar.insurgentMove(Position(0)(2), Position(0)(0));
      asymwar.endTurn();
    });
    it("should only be possible during State turn", function() {
      asymwar.endTurn(); // insurgent turn now
      expect(function() {
        asymwar.interrogate(Position(0)(0));
      }).toThrow("It's not your turn!");
    });
    it("should throw if there is no state piece at the location", function() {
      expect(function() {
        asymwar.interrogate(Position(0)(0));
      }).toThrow("No State piece at that location!");
    });
    it("should throw if there is no insurgent piece at the location", function() {
      expect(function() {
        asymwar.interrogate(Position(4)(0));
      }).toThrow("No Insurgent piece at that location!");
    });
    it("should reveal all insurgent pieces adjacent to the location", function() {
      for (var i = h.C.CAPITAL; i > 0; i--) {
        asymwar.stateMove(Position(i)(0), Position(i-1)(0));
        asymwar.endTurn();
        asymwar.endTurn(); // insurgent turn
      }
      // State piece at 0,0 now
      // Should be two pieces at 0,0, and one at 0,1
      var positions = asymwar.interrogate(Position(0)(0));
      expect(positions.length).toBe(1);
      expect(positions[0].asKey()).toBe(Position(0)(1).asKey());
    });
    it("should log an entry", function() {
      for (var i = h.C.CAPITAL; i > 0; i--) {
        asymwar.stateMove(Position(i)(0), Position(i-1)(0));
        asymwar.endTurn();
        asymwar.endTurn(); // insurgent turn
      }
      var initialHistory = asymwar.history().length;
      asymwar.interrogate(Position(0)(0));
      expect(asymwar.history().length).toBe(initialHistory+1);
    });
  });
  describe("grow action", function() {
    var samePosition, adjacentPosition, badPosition;
    beforeEach(function() {
      asymwar = AsymmetricWarfare();
      asymwar.addInsurgent(Position(0)(0));
      asymwar.addInsurgent(Position(0)(1));
      asymwar.addInsurgent(Position(0)(2));
      asymwar.addInsurgent(Position(0)(4)); // Can Grow next to this position
      asymwar.addInsurgent(Position(0)(4));
      samePosition = Position(0)(4);
      adjacentPosition = Position(0)(5);
      badPosition = Position(1)(0);
    });
    it("should only be possible during Insurgent turn", function() {
      asymwar.endTurn(); // state turn now
      expect(function() {
        asymwar.grow(samePosition);
      }).toThrow("It's not your turn!");
    });
    it("should add an insurgent piece at the location", function() {
      expect(asymwar.getPiecesAt(samePosition).length).toBe(2);

      asymwar.grow(samePosition);

      expect(asymwar.getPiecesAt(samePosition).length).toBe(3);
      _.each(asymwar.getPiecesAt(samePosition), function(piece) {
        expect(piece.type()).toBe(h.C.INSURGENT);
      });
    });
    it("should permit adding at a location adjacent to an insurgent", function() {
      asymwar.grow(adjacentPosition);

      expect(asymwar.getPiecesAt(adjacentPosition).length).toBe(1);
      expect(asymwar.getPiecesAt(adjacentPosition)[0].type()).toBe(h.C.INSURGENT);
    });
    it("should throw when adding at a location not adjacent to a space with two insurgents", function() {
      expect(function() {
        asymwar.grow(badPosition);
      }).toThrow("Must have two adjacent insurgents in order to grow!");
    });
    it("should log an entry", function() {
      var initialHistory = asymwar.history().length;
      asymwar.grow(samePosition);
      expect(asymwar.history().length).toBe(initialHistory+1);
    });
    describe("when there are already 15 insurgents placed/grown", function() {
      beforeEach(function() {
        _.times(10, function() {
          asymwar.grow(samePosition);
          asymwar.endTurn();
          asymwar.endTurn();
        });
      });
      it("should not permit growing a 16th insurgent", function() {
        expect(function() {
          asymwar.grow(samePosition);
        }).toThrow("No more insurgents left!");
      });
    });
    describe("with some insurgents that have been killed", function() {
      beforeEach(function() {
        _.times(10, function() {
          asymwar.grow(samePosition);
          asymwar.endTurn();
          asymwar.endTurn();
        });
        _.times(h.C.NUM_CIRCLES-2, function(i) {
          asymwar.insurgentMove(Position(i)(0), Position(i+1)(0));
          asymwar.endTurn();
          asymwar.endTurn();
        });
        asymwar.endTurn();
        asymwar.stateMove(Position(h.C.CAPITAL)(0), Position(h.C.INNER_CIRCLE)(0));
        asymwar.kill(Position(h.C.INNER_CIRCLE)(0));
      });
      it("should not permit growing a 16th insurgent", function() {
        expect(function() {
          asymwar.grow(samePosition);
        }).toThrow("No more insurgents left!");
      });
    });
  });
});
return {
  name: 'asymwar_spec'
};
});

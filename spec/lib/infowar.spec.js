define(['underscore', 'lib/helpers', 'lib/infowar'], function(_, h, Infowar) {
var Position = h.Position;
var Pieces = h.Pieces;
var InsurgentMove = h.InsurgentMove;
var StateMove = h.StateMove;
var History = h.History;

var initInsurgents = function(infowar) {
  var positions = [
    Position(0)(0),
    Position(0)(2),
    Position(0)(4),
    Position(0)(6),
    Position(0)(8)
  ];
  for (var i = 0; i < positions.length; i++) {
    infowar.addInsurgent(positions[i]);
  }
  return positions;
};

describe("infowar", function() {
  var infowar;

  describe("initial setup", function() {
    beforeEach(function() {
      infowar = Infowar();
    });

    it("should be no one's turn", function() {
      expect(infowar.currentTurn()).toBe(undefined);
    });
    it("should be the setup phase", function() {
      expect(infowar.currentPhase()).toBe(h.C.SETUP);
    });
    it("should have five state pieces in the capital", function() {
      var pieces = infowar.getPiecesAt(Position(4)(0));
      expect(pieces.length).toBe(5);
      for (var i = 0; i < pieces.length; i++) {
        expect(pieces[i].type()).toBe(Pieces.STATE_TYPE);
      }
    });
    it("should record the initial states pieces in the history log", function() {
      var history = infowar.history();
      expect(history.length).toBe(5);
      for (var i = 0; i < 5; i++) {
        var move = history[i];
        expect(move.player()).toBe(Infowar.STATE);
      }
    });
    describe("insurgent placement", function() {
      it("should indicate that five insurgents can be placed", function() {
        expect(infowar.initialInsurgents()).toBe(5);
      });
      it("should not accept too many placements", function() {
        initInsurgents(infowar);
        expect(function() {
          infowar.addInsurgent(Position(0)(0));
        }).toThrow("Cannot add more insurgents!");
      });
      it("should decrease initial insurgents as pieces are added", function() {
        infowar.addInsurgent(Position(0)(0));
        expect(infowar.initialInsurgents()).toBe(4);
        infowar.addInsurgent(Position(0)(2));
        expect(infowar.initialInsurgents()).toBe(3);
        infowar.addInsurgent(Position(0)(4));
        expect(infowar.initialInsurgents()).toBe(2);
        infowar.addInsurgent(Position(0)(6));
        expect(infowar.initialInsurgents()).toBe(1);
        infowar.addInsurgent(Position(0)(8));
        expect(infowar.initialInsurgents()).toBe(0);
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
          infowar.addInsurgent(positions[i]);
        }
        for (var i = 0; i < positions.length; i++) {
          var pieces = infowar.getPiecesAt(positions[i]);
          expect(pieces.length).toBe(1);
          expect(pieces[0].type()).toBe(Pieces.INSURGENT_TYPE);
        }
      });
      it("should not permit insurgents in other rings", function() {
        for (var i = 1; i < h.C.NUM_CIRCLES; i++) {
          expect(function() {
            infowar.addInsurgent(Position(i)(0));
          }).toThrow("Invalid placement!");
        }
      });
      it("should permit insurgents to all start on the same spot", function() {
        var pos = Position(0)(0);
        for (var i = 0; i < 5; i++) {
          infowar.addInsurgent(pos);
        }
        var pieces = infowar.getPiecesAt(pos);
        expect(pieces.length).toBe(5);
        for (var i = 0; i < 5; i++) {
          expect(pieces[i].type()).toBe(Pieces.INSURGENT_TYPE);
        }
      });
      it("should indicate that it's the insurgent's turn after placement", function() {
        initInsurgents(infowar);
        expect(infowar.currentTurn().id()).toBe(Infowar.INSURGENT);
      });
      it("should change the phase to playing", function() {
        initInsurgents(infowar);
        expect(infowar.currentPhase()).toBe(h.C.PLAYING);
      });
      it("should add entries into the history log", function() {
        for (var i = 0; i < 5; i++) {
          infowar.addInsurgent(Position(0)(i));
        }
        var history = infowar.history();
        expect(history.length).toBe(10);
        for (var i = 0; i < 5; i++) {
          var entry = history[i+5];
          expect(entry.player()).toBe(Infowar.INSURGENT);
          expect(entry.position()).toBeDefined();
          expect(entry.position().asKey()).toBe(Position(0)(i).asKey());
        }
      });
    });
  });

  describe("ending a turn", function() {
    var initialHistory;
    beforeEach(function() {
      infowar = Infowar();
      initInsurgents(infowar);
      initialHistory = infowar.history().length;
    });
    it("should record history for ending a turn", function() {
      infowar.endTurn();
      var history = infowar.history();
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
        history.push(History.Placement(Infowar.STATE, Position(h.C.CAPITAL)(0)));
      }
      infowar = Infowar(history);
    });
    describe("with minimal history", function() {
      it("should be at the same state after initial creation", function() {
        expect(infowar.getPiecesAt(Position(h.C.CAPITAL)(0))).toBeDefined();
        expect(infowar.getPiecesAt(Position(h.C.CAPITAL)(0)).length).toEqual(5);
      });
      it("should use the same history", function() {
        expect(infowar.history().length).toBe(history.length);
        for (var i = 0; i < history.length; i++) {
          expect(infowar.history()[i].type()).toEqual(history[i].type());
          expect(infowar.history()[i].player()).toEqual(history[i].player());
          expect(infowar.history()[i].position().asKey()).toEqual(history[i].position().asKey());
        }
      });
    });
    describe("with insurgents placed", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(Infowar.INSURGENT, Position(0)(0)));
        }
      });
      it("should be at the same state after placing insurgents", function() {
        var infowar = Infowar(history);
        expect(infowar.getPiecesAt(Position(0)(0))).toBeDefined();
        expect(infowar.getPiecesAt(Position(0)(0)).length).toEqual(5);
      });
    });
    describe("with some moves", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(Infowar.INSURGENT, Position(0)(0)));
        }
        history.push(History.Move(Infowar.INSURGENT, Position(0)(0), Position(1)(0)));
        history.push(History.EndTurn(Infowar.INSURGENT));
        history.push(History.Move(Infowar.STATE, Position(h.C.CAPITAL)(0), Position(3)(0)));
        history.push(History.EndTurn(Infowar.STATE));
        history.push(History.Move(Infowar.INSURGENT, Position(1)(0), Position(1)(1)));
        history.push(History.EndTurn(Infowar.INSURGENT));

        infowar = Infowar(history);
      });
      it("should be at the same state", function() {
        expect(infowar.currentTurn().id()).toBe(Infowar.STATE);
        expect(infowar.getPiecesAt(Position(1)(0))).toBeUndefined();
        expect(infowar.getPiecesAt(Position(1)(1))).toBeDefined();
        expect(infowar.getPiecesAt(Position(1)(1))[0].type()).toBe(Pieces.INSURGENT_TYPE);
        expect(infowar.getPiecesAt(Position(3)(0))).toBeDefined();
        expect(infowar.getPiecesAt(Position(3)(0))[0].type()).toBe(Pieces.STATE_TYPE);
        expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(4);
        expect(infowar.getPiecesAt(Position(h.C.CAPITAL)(0)).length).toBe(4);
      });
    });
    describe("with an invalid history", function() {
      beforeEach(function() {
        for (var i = 0; i < 5; i++) {
          history.push(History.Placement(Infowar.INSURGENT, Position(0)(0)));
        }
      });
      it("should not permit illegal moves", function() {
        history.push(History.Move(Infowar.STATE, StateMove(Position(h.C.CAPITAL)(0), Position(3)(0))));
        expect(function() {
          infowar = Infowar(history);
        }).toThrow("It's not your turn!");
      });
      it("should not permit arbitrary placement", function() {
        history.push(History.Placement(Infowar.INSURGENT, Position(3)(0)));
        expect(function() {
          infowar = Infowar(history);
        }).toThrow("Invalid placement!");
      });
    });
  });

  describe("insurgent turn", function() {
    beforeEach(function() {
      infowar = Infowar();
      infowar.addInsurgent(Position(0)(0));
      infowar.addInsurgent(Position(0)(2));
      infowar.addInsurgent(Position(0)(4));
      infowar.addInsurgent(Position(0)(6));
      infowar.addInsurgent(Position(0)(8));
    });
    it("should change to state's turn after insurgent finishes turn", function() {
      var src = Position(0)(2);
      var dest = Position(1)(2);
      infowar.insurgentMove(src, dest);
      infowar.endTurn();
      expect(infowar.getPiecesAt(src)).toBe(undefined);
      expect(infowar.getPiecesAt(dest).length).toBe(1);
      expect(infowar.currentTurn().id()).toBe(Infowar.STATE);
    });
    it("should throw if a state's move is given", function() {
      expect(function() {
        infowar.stateMove(Position(1)(2), Position(2)(2));
      }).toThrow("It's not your turn!");
    });
    it("should not change to the state's turn until the turn is complete", function() {
      var src = Position(0)(2);
      var dest = Position(0)(3);
      infowar.insurgentMove(src, dest);
      expect(infowar.getPiecesAt(src)).toBe(undefined);
      expect(infowar.getPiecesAt(dest).length).toBe(1);
      expect(infowar.currentTurn().id()).toBe(Infowar.INSURGENT);
    });
    it("should add an entry in the log", function() {
      var src = Position(0)(2);
      var dest = Position(0)(4);
      infowar.insurgentMove(src, dest);
      var history = infowar.history();
      expect(history.length).toBe(11);
      var entry = history[10];
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(Infowar.INSURGENT);
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
    });
  });
  describe("state turn", function() {
    var initialHistory;
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(i));
      }
      infowar.insurgentMove(Position(0)(2), Position(1)(2));
      infowar.endTurn();
      initialHistory = infowar.history().length;
    });
    it("should throw if an insurgent's move is given", function() {
      expect(function() {
        infowar.insurgentMove(Position(1)(2), Position(2)(2));
      }).toThrow("It's not your turn!");
    });
    it("should change to insurgent's turn after state finishes turn", function() {
      infowar.endTurn();
      expect(infowar.currentTurn().id()).toBe(Infowar.INSURGENT);
    });
    it("should add an entry in the log", function() {
      var src = Position(4)(0);
      var dest = Position(3)(0);
      infowar.stateMove(src, dest);
      var history = infowar.history();
      expect(history.length).toBe(initialHistory+1);
      var entry = history[history.length-1];
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(Infowar.STATE);
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
    });
  });
  var endGameWithWinner = function(winner) {
    it("should end the game", function() {
      expect(infowar.currentTurn()).toBe(undefined);
      expect(infowar.currentPhase()).toBe(h.C.GAMEOVER);
    });
    it(winner+" should be the winner", function() {
      expect(infowar.winner()).toBe(winner);
    });
  };
  describe("state kills 12 insurgents", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(0));
      }
      for (var i = 0; i < 12 - Infowar.INITIAL_INSURGENTS; i++) {
        infowar.grow(Position(0)(0));
        infowar.endTurn();
        infowar.endTurn();
      }
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(12);
      for (var i = h.C.CAPITAL; i > 0; i--) {
        infowar.endTurn();
        infowar.stateMove(Position(i)(0), Position(i-1)(0));
        infowar.endTurn();
      }
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(13);
      infowar.endTurn();
      infowar.kill(Position(0)(0));
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(1);
    });
    endGameWithWinner(h.C.STATE);
  });
  describe("state clears the board of insurgents", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(0));
      }
      for (var i = h.C.CAPITAL; i > 0; i--) {
        infowar.endTurn();
        infowar.stateMove(Position(i)(0), Position(i-1)(0));
        infowar.endTurn();
      }
      infowar.endTurn();
      infowar.kill(Position(0)(0));
    });
    endGameWithWinner(h.C.STATE);
  });
  describe("insurgents hold any six spaces in the inner ring", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(0));
      }
      infowar.grow(Position(0)(0));
      infowar.endTurn();
      infowar.endTurn();
      _.times(6, function() {
        for (var i = 0; i < h.C.NUM_CIRCLES-2; i++) {
          infowar.insurgentMove(Position(i)(0), Position(i+1)(0));
          infowar.endTurn();
          infowar.endTurn();
        }
      });
      expect(infowar.getPiecesAt(Position(3)(0)).length).toBe(6);
      //Position them at 3,11, 3,0, 3,1 and 3,5, 3,6, 3,7
      //Move 3 of them to 3,6
      _.times(3, function() {
        infowar.insurgentMove(Position(3)(0), Position(3)(2));
        infowar.endTurn();
        infowar.endTurn();
        infowar.insurgentMove(Position(3)(2), Position(3)(4));
        infowar.endTurn();
        infowar.endTurn();
        infowar.insurgentMove(Position(3)(4), Position(3)(6));
        infowar.endTurn();
        infowar.endTurn();
      });
      infowar.insurgentMove(Position(3)(0), Position(3)(11));
      infowar.endTurn();
      infowar.endTurn();
      infowar.insurgentMove(Position(3)(0), Position(3)(1));
      infowar.endTurn();
      infowar.endTurn();
      infowar.insurgentMove(Position(3)(6), Position(3)(5));
      infowar.endTurn();
      infowar.endTurn();
      infowar.insurgentMove(Position(3)(6), Position(3)(7));
    });
    endGameWithWinner(h.C.INSURGENT);
  });
  describe("insurgents hold four adjacent spaces in the inner ring", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(0));
      }
      var state_src = Position(4)(0);
      var state_dest = Position(3)(0);
      var moveState = function() {
        infowar.stateMove(state_src, state_dest);
        var tmp = state_src;
        state_src = state_dest;
        state_dest = tmp;
        infowar.endTurn();
      };
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
          infowar.insurgentMove(Position(j)(0), Position(j+1)(0));
          infowar.endTurn();
          moveState();
        }
      }
      // Four insurgents should be at 3,0
      infowar.insurgentMove(Position(3)(0), Position(3)(2));
      infowar.endTurn();
      moveState();
      infowar.insurgentMove(Position(3)(0), Position(3)(1));
      infowar.insurgentMove(Position(3)(0), Position(3)(11));
      // Four adjacent spaces now occupied: 3,11 to 3,2
    });
    endGameWithWinner(h.C.INSURGENT);
  });
  describe("kill action", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(i));
      }
      infowar.insurgentMove(Position(0)(1), Position(0)(0));
      infowar.endTurn();
    });
    it("should only be possible during State turn", function() {
      infowar.endTurn(); // insurgent turn now
      expect(function() {
        infowar.kill(Position(0)(0));
      }).toThrow("It's not your turn!");
    });
    it("should throw if there is no state piece at the location", function() {
      expect(function() {
        infowar.kill(Position(0)(0));
      }).toThrow("No State piece at that location!");
    });
    it("should remove all insurgent pieces at the location", function() {
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(2);
      for (var i = h.C.CAPITAL; i > 0; i--) {
        infowar.stateMove(Position(i)(0), Position(i-1)(0));
        infowar.endTurn();
        infowar.endTurn(); // insurgent turn
      }
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(3);

      infowar.kill(Position(0)(0));
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(1);
      expect(infowar.getPiecesAt(Position(0)(0))[0].type()).toBe(h.C.STATE);
    });
    it("should log an entry", function() {
      var initialHistory = infowar.history().length;
      infowar.kill(Position(4)(0));
      expect(infowar.history().length).toBe(initialHistory+1);
    });
  });
  describe("interrogate action", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(i));
      }
      infowar.insurgentMove(Position(0)(2), Position(0)(0));
      infowar.endTurn();
    });
    it("should only be possible during State turn", function() {
      infowar.endTurn(); // insurgent turn now
      expect(function() {
        infowar.interrogate(Position(0)(0));
      }).toThrow("It's not your turn!");
    });
    it("should throw if there is no state piece at the location", function() {
      expect(function() {
        infowar.interrogate(Position(0)(0));
      }).toThrow("No State piece at that location!");
    });
    it("should throw if there is no insurgent piece at the location", function() {
      expect(function() {
        infowar.interrogate(Position(4)(0));
      }).toThrow("No Insurgent piece at that location!");
    });
    it("should reveal all insurgent pieces adjacent to the location", function() {
      for (var i = h.C.CAPITAL; i > 0; i--) {
        infowar.stateMove(Position(i)(0), Position(i-1)(0));
        infowar.endTurn();
        infowar.endTurn(); // insurgent turn
      }
      // State piece at 0,0 now
      // Should be two pieces at 0,0, and one at 0,1
      var positions = infowar.interrogate(Position(0)(0));
      expect(positions.length).toBe(1);
      expect(positions[0].asKey()).toBe(Position(0)(1).asKey());
    });
    it("should log an entry", function() {
      for (var i = h.C.CAPITAL; i > 0; i--) {
        infowar.stateMove(Position(i)(0), Position(i-1)(0));
        infowar.endTurn();
        infowar.endTurn(); // insurgent turn
      }
      var initialHistory = infowar.history().length;
      infowar.interrogate(Position(0)(0));
      expect(infowar.history().length).toBe(initialHistory+1);
    });
  });
  describe("grow action", function() {
    beforeEach(function() {
      infowar = Infowar();
      for (var i = 0; i < Infowar.INITIAL_INSURGENTS; i++) {
        infowar.addInsurgent(Position(0)(i));
      }
    });
    it("should only be possible during Insurgent turn", function() {
      infowar.endTurn(); // state turn now
      expect(function() {
        infowar.grow(Position(0)(0));
      }).toThrow("It's not your turn!");
    });
    it("should add an insurgent piece at the location", function() {
      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(1);

      infowar.grow(Position(0)(0));

      expect(infowar.getPiecesAt(Position(0)(0)).length).toBe(2);
      _.each(infowar.getPiecesAt(Position(0)(0)), function(piece) {
        expect(piece.type()).toBe(h.C.INSURGENT);
      });
    });
    it("should log an entry", function() {
      var initialHistory = infowar.history().length;
      infowar.grow(Position(0)(0));
      expect(infowar.history().length).toBe(initialHistory+1);
    });
  });
});
return {
  name: 'infowar_spec'
};
});

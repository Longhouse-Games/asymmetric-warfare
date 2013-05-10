define(['lib/helpers', 'lib/history'], function(h, History) {

var Position = h.Position;
var StateMove = h.StateMove;

describe("History", function() {
  describe("fromDTO", function() {
    it("should throw when given not an object", function() {
      expect(function() {
        History.fromDTO("{,fdjklj");
      }).toThrow();
    });
    it("should throw when given an invalid type", function() {
      expect(function() {
        History.fromDTO({player: h.C.STATE, type:"PANCAKE"});
      }).toThrow("Invalid entry type: PANCAKE");
    });
    it("should throw when giving an invalid player", function() {
      expect(function() {
        History.fromDTO({player:"BORK", type:h.C.PLACEMENT});
      }).toThrow("Invalid player: BORK");
    });
    it("should throw when missing type", function() {
      expect(function() {
        History.fromDTO({player:h.C.STATE});
      }).toThrow("Invalid entry type: undefined");
    });
    it("should throw when missing player", function() {
      expect(function() {
        History.fromDTO({type:h.C.PLACEMENT});
      }).toThrow("Invalid player: undefined");
    });
  });
  describe("Placement", function() {
    beforeEach(function() {
    });
    it("should create", function() {
      var entry = History.Placement(h.C.STATE, Position(0)(0));
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.PLACEMENT);
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.position()).toBeDefined();
      expect(entry.position().asKey()).toBe(Position(0)(0).asKey());
    });
    it("should serialise", function() {
      var entry = History.Placement(h.C.STATE, Position(0)(0));
      var dto = entry.toDTO();
      expect(dto).toBeDefined();
      expect(dto.type).toBe(h.C.PLACEMENT);
      expect(dto.player).toBe(h.C.STATE);
      expect(dto.position).toBe(Position(0)(0).asKey());
    });
    it("should deserialise", function() {
      var dto = {
        type: h.C.PLACEMENT,
        position: Position(0)(0).asKey(),
        player: h.C.STATE
      };
      var entry = History.fromDTO(dto);
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.PLACEMENT);
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.position().asKey()).toBe(Position(0)(0).asKey());
    });
    describe("apply", function() {
      var infowar;
      var position = Position(0)(0);
      beforeEach(function() {
        infowar = {
          addState: function(position) {
          },
          addInsurgent: function(position) {
          }
        };
        spyOn(infowar, 'addState');
        spyOn(infowar, 'addInsurgent');
      });

      it("should apply for state", function() {
        var entry = History.Placement(h.C.STATE, position);
        entry.apply(infowar);
        expect(infowar.addState).toHaveBeenCalled();
        expect(infowar.addState.calls.length).toEqual(1);
        expect(infowar.addState.calls[0].args[0]).toBe(position);
      });
      it("should apply for insurgents", function() {
        var entry = History.Placement(h.C.INSURGENT, position);
        entry.apply(infowar);
        expect(infowar.addInsurgent).toHaveBeenCalled();
        expect(infowar.addInsurgent.calls.length).toEqual(1);
        expect(infowar.addInsurgent.calls[0].args[0]).toBe(position);
      });
    });
  });
  describe("Move", function() {
    var src = Position(4)(0);
    var dest = Position(3)(0);
    var move = StateMove(src)(dest);

    it("should create", function() {
      var entry = History.Move(h.C.STATE, move);
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.move()).toBeDefined();
      expect(entry.move().src.asKey()).toBe(src.asKey());
      expect(entry.move().dest.asKey()).toBe(dest.asKey());
    });
    it("should serialise", function() {
      var entry = History.Move(h.C.STATE, move);
      var dto = entry.toDTO();
      expect(dto).toBeDefined();
      expect(dto.type).toBe(h.C.MOVE);
      expect(dto.player).toBe(h.C.STATE);
      expect(dto.src).toBe(src.asKey());
      expect(dto.dest).toBe(dest.asKey());
    });
    it("should deserialise", function() {
      var dto = {
        type: h.C.MOVE,
        player: h.C.STATE,
        src: Position(h.C.CAPITAL)(0).asKey(),
        dest: Position(3)(0).asKey()
      };
      var entry = History.fromDTO(dto);
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.move().src.asKey()).toBe(src.asKey());
      expect(entry.move().dest.asKey()).toBe(dest.asKey());
    });
    describe("apply", function() {
      var infowar;
      beforeEach(function() {
        infowar = {
          stateMove: function(position) {
          },
          insurgentMove: function(position) {
          }
        };
        spyOn(infowar, 'stateMove');
        spyOn(infowar, 'insurgentMove');
      });
      it("should apply for the state", function() {
        var entry = History.Move(h.C.STATE, move);
        entry.apply(infowar);
        expect(infowar.stateMove).toHaveBeenCalled();
        expect(infowar.stateMove.calls.length).toEqual(1);
        expect(infowar.stateMove.calls[0].args[0].asKey()).toBe(move.src.asKey());
        expect(infowar.stateMove.calls[0].args[1].asKey()).toBe(move.dest.asKey());
      });
      it("should apply for insurgents", function() {
        var entry = History.Move(h.C.INSURGENT, move);
        entry.apply(infowar);
        expect(infowar.insurgentMove).toHaveBeenCalled();
        expect(infowar.insurgentMove.calls.length).toEqual(1);
        expect(infowar.insurgentMove.calls[0].args[0].asKey()).toBe(move.src.asKey());
        expect(infowar.insurgentMove.calls[0].args[1].asKey()).toBe(move.dest.asKey());
      });
    });
  });
});
return {
  name: 'history_entry_spec'
};
});

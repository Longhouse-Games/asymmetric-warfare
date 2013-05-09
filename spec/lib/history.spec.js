define(['lib/helpers', 'lib/history'], function(h, History) {

var Position = h.Position;
var StateMove = h.StateMove;

describe("History", function() {
  describe("fromJSON", function() {
    it("should throw when given invalid json", function() {
      expect(function() {
        History.fromJSON("{,fdjklj");
      }).toThrow();
    });
    it("should throw when given an invalid type", function() {
      expect(function() {
        History.fromJSON('{"player":"STATE", "type":"PANCAKE"}');
      }).toThrow("Invalid entry type: PANCAKE");
    });
    it("should throw when giving an invalid player", function() {
      expect(function() {
        History.fromJSON('{"player":"BORK", "type":"PLACEMENT"}');
      }).toThrow("Invalid player: BORK");
    });
    it("should throw when missing type", function() {
      expect(function() {
        History.fromJSON('{"player":"STATE"}');
      }).toThrow("Invalid entry type: undefined");
    });
    it("should throw when missing player", function() {
      expect(function() {
        History.fromJSON('{"type":"PLACEMENT"}');
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
      var json = entry.toJSON();
      var obj = JSON.parse(json);
      expect(obj).toBeDefined();
      expect(obj.type).toBe(h.C.PLACEMENT);
      expect(obj.player).toBe(h.C.STATE);
      expect(obj.position).toBe(Position(0)(0).asKey());
    });
    it("should deserialise", function() {
      var json = '{"type":"PLACEMENT","position":"0,0","player":"STATE"}';
      var entry = History.fromJSON(json);
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
      var json = entry.toJSON();
      var obj = JSON.parse(json);
      expect(obj).toBeDefined();
      expect(obj.type).toBe(h.C.MOVE);
      expect(obj.player).toBe(h.C.STATE);
      expect(obj.src).toBe(src.asKey());
      expect(obj.dest).toBe(dest.asKey());
    });
    it("should deserialise", function() {
      var json = '{"type":"MOVE","player":"STATE","src":"4,0","dest":"3,0"}';
      var entry = History.fromJSON(json);
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

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
  var behaves_like_entry = function(options) {
    var type, player, args, constructor, infowarMethod, entry, dto;
    beforeEach(function() {
      type = options.type;
      player = options.player;
      args = [player];
      args = args.concat(options.args || []);
      func = options.constructor;
      infowarMethod = options.infowarMethod;
      dto = options.dto || {};
      entry = func.apply(History, args);
    });
    it("should create", function() {
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(type);
      expect(entry.player()).toBe(player);
    });
    it("should serialise", function() {
      var dto = entry.toDTO();
      expect(dto.type).toBe(type);
      expect(dto.player).toBe(player);
    });
    it("should deserialise", function() {
      dto.type = type;
      dto.player = player;

      entry = History.fromDTO(dto);

      expect(entry.type()).toBe(type);
      expect(entry.player()).toBe(player);
    });
    describe("apply", function() {
      var infowar;
      beforeEach(function() {
        infowar = {};
        infowar[infowarMethod] = function() {};
        spyOn(infowar, infowarMethod);
      });
      it("should apply", function() {
        entry.apply(infowar);
        expect(infowar[infowarMethod]).toHaveBeenCalled();
      });
    });
  };
  describe("Kill", function() {
    var entry;
    var position = Position(h.C.CAPITAL)(0);
    beforeEach(function() {
      entry = History.Kill(h.C.STATE, position);
    });
    behaves_like_entry({
      type: h.C.KILL,
      player: h.C.STATE,
      args: [Position(h.C.CAPITAL)(0)],
      constructor: History.Kill,
      infowarMethod: "kill",
      dto: { position: position.asKey() }
    });
    it("should support a position", function() {
      expect(entry.position().asKey()).toBe(position.asKey());
      expect(entry.toDTO().position).toBe(position.asKey());
      expect(History.fromDTO({type: h.C.KILL, player: h.C.STATE, position: "4,0"}).position().asKey()).toBe(position.asKey());
    });
  });
  describe("EndTurn", function() {
    var entry;
    beforeEach(function() {
      entry = History.EndTurn(h.C.STATE);
    });
    it("should create", function() {
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.END_TURN);
      expect(entry.player()).toBe(h.C.STATE);
    });
    it("should serialise", function() {
      var dto = entry.toDTO();
      expect(dto.type).toBe(h.C.END_TURN);
      expect(dto.player).toBe(h.C.STATE);
    });
    it("should deserialise", function() {
      var dto = { type: h.C.END_TURN, player: h.C.STATE };
      entry = History.fromDTO(dto);
      expect(entry.type()).toBe(h.C.END_TURN);
      expect(entry.player()).toBe(h.C.STATE);
    });
    describe("apply", function() {
      var infowar;
      beforeEach(function() {
        infowar = { endTurn: function() { } };
        spyOn(infowar, 'endTurn');
      });
      it("should apply", function() {
        entry.apply(infowar);
        expect(infowar.endTurn).toHaveBeenCalled();
      });
    });
  });
  describe("Move", function() {
    var src = Position(4)(0);
    var dest = Position(3)(0);

    it("should create", function() {
      var entry = History.Move(h.C.STATE, src, dest);
      expect(entry).toBeDefined();
      expect(entry.type()).toBe(h.C.MOVE);
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
    });
    it("should serialise", function() {
      var entry = History.Move(h.C.STATE, src, dest);
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
      expect(entry.src().asKey()).toBe(src.asKey());
      expect(entry.dest().asKey()).toBe(dest.asKey());
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
        var entry = History.Move(h.C.STATE, src, dest);
        entry.apply(infowar);
        expect(infowar.stateMove).toHaveBeenCalled();
        expect(infowar.stateMove.calls.length).toEqual(1);
        expect(infowar.stateMove.calls[0].args[0].asKey()).toBe(src.asKey());
        expect(infowar.stateMove.calls[0].args[1].asKey()).toBe(dest.asKey());
      });
      it("should apply for insurgents", function() {
        var entry = History.Move(h.C.INSURGENT, src, dest);
        entry.apply(infowar);
        expect(infowar.insurgentMove).toHaveBeenCalled();
        expect(infowar.insurgentMove.calls.length).toEqual(1);
        expect(infowar.insurgentMove.calls[0].args[0].asKey()).toBe(src.asKey());
        expect(infowar.insurgentMove.calls[0].args[1].asKey()).toBe(dest.asKey());
      });
    });
  });
});
return {
  name: 'history_entry_spec'
};
});

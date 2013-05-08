define(['lib/helpers', 'lib/history'], function(h, History) {

var Position = h.Position;
var StateMove = h.StateMove;

describe("History", function() {
  describe("Placement", function() {
    it("should create", function() {
      var entry = History.Placement(h.C.STATE, Position(0)(0));
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.position()).toBeDefined();
      expect(entry.position().asKey()).toBe(Position(0)(0).asKey());
    });
  });
  describe("Move", function() {
    it("should create", function() {
      var src = Position(4)(0);
      var dest = Position(3)(0);
      var move = StateMove(src)(dest);
      var entry = History.Move(h.C.STATE, move);
      expect(entry).toBeDefined();
      expect(entry.player()).toBe(h.C.STATE);
      expect(entry.move()).toBeDefined();
      expect(entry.move().src.asKey()).toBe(src.asKey());
      expect(entry.move().dest.asKey()).toBe(dest.asKey());
    });
  });
});
return {
  name: 'history_entry_spec'
};
});

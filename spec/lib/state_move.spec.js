define(['lib/helpers', 'spec/helpers'], function(h, SpecHelper) {
var Position = h.Position;
var StateMove = h.StateMove;
var MoveExamples = SpecHelper.MoveExamples;

describe("State move", function() {
  MoveExamples(Position, StateMove);

  describe("simultaneously changing rank and circle", function() {
    describe("capital circle", function() {
      it("should permit moving from the capital to any rank", function() {
        var src = Position(4)(0);
        var dest = Position(3)(5);
        var move = StateMove(src)(dest);
        expect(move.distance()).toBe(2);
      });

      it("should permit moving from any rank into the capital", function() {
        var src = Position(3)(6);
        var dest = Position(4)(0);
        var move = StateMove(src)(dest);
        expect(move.distance()).toBe(2);
      });
    });
  });

});
return {
  name: "state_move_spec"
};
});

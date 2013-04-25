define(['lib/helpers', 'spec/helpers'], function(h, SpecHelper) {
var Position = h.Position;
var InsurgentMove = h.InsurgentMove;
var MoveExamples = SpecHelper.MoveExamples;

describe("Insurgent move", function() {
  MoveExamples(Position, InsurgentMove);

  it("should be a move", function() {
    var src = Position(1)(1);
    var dest = Position(2)(1);
    var move = InsurgentMove(src)(dest);
    expect(move.src).toBe(src);
    expect(move.dest).toBe(dest);
    expect(move.distance()).toBe(2);
  });

  it("should not permit moving into the capital", function() {
    var src = Position(3)(1);
    var dest = Position(4)(0);
    expect(function() {InsurgentMove(src)(dest)}).toThrow("Invalid move");
  });

  it("should not permit moving from the capital", function() {
    var src = Position(4)(0);
    var dest = Position(3)(1);
    expect(function() {InsurgentMove(src)(dest)}).toThrow("Invalid move");
  });
});
return {
  name: "insurgent_move_spec"
};
});

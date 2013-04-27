define(['lib/helpers'], function(h) {
var InsurgentTurn = h.InsurgentTurn;
var InsurgentMove = h.InsurgentMove;
var Position = h.Position;

describe("insurgent turn", function() {
  var turn;
  beforeEach(function() {
    turn = InsurgentTurn();
  });
  describe("with no previous actions", function() {
    it("should list MOVE and GROW as valid actions", function() {
      var actions = turn.validActions();
      expect(actions[0]).toBe(InsurgentTurn.MOVE);
      // TODO
      //expect(actions[1]).toBe("GROW");
    });
    it("should give 2 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(2);
    });
  });
  describe("with a previous 1-point move", function() {
    beforeEach(function() {
      turn.applyMove(InsurgentMove(Position(0)(0))(Position(0)(1)));
    });
    it("should list MOVE and GROW as valid actions", function() {
      var actions = turn.validActions();
      expect(actions[0]).toBe(InsurgentTurn.MOVE);
      // TODO
      //expect(actions[1]).toBe("GROW");
    });
    it("should give 1 remaining movement point", function() {
      expect(turn.movementPoints()).toBe(1);
    });
  });
  describe("with a previous 2-point move", function() {
    beforeEach(function() {
      var move = InsurgentMove(Position(0)(0))(Position(0)(2));
      turn.applyMove(move);
    });
    it("should list only GROW as a valid action", function() {
      var actions = turn.validActions();
      expect(actions.length).toBe(0);
      // TODO expect(actions[0]).toBe("GROW");
    });
    it("should give 0 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(0);
    });
    it("should throw if another move is tried", function() {
      move = InsurgentMove(Position(0)(2))(Position(0)(4));
      expect(function() { turn.applyMove(move); }).toThrow("No movement points remaining!");
    });
  });
});
return {
  name: 'insurgent_turn_spec'
};
});

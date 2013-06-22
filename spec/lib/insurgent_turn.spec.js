define(['underscore', 'lib/helpers'], function(_, h) {
var InsurgentTurn = h.InsurgentTurn;
var InsurgentMove = h.InsurgentMove;
var Position = h.Position;
var Grow = h.Grow;

describe("insurgent turn", function() {
  var turn;
  beforeEach(function() {
    turn = InsurgentTurn();
  });
  it("should identify as insurgent", function() {
    expect(turn.id()).toBe(h.C.INSURGENT);
  });
  describe("with no previous actions", function() {
    it("should list MOVE and GROW as valid actions", function() {
      var actions = turn.validActions();
      expect(_.contains(actions, InsurgentTurn.MOVE)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.GROW)).toBe(true);
    });
    it("should give 2 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(2);
    });
    it("should mark the turn as not complete", function() {
      expect(turn.isComplete()).toBe(false);
    });
  });
  describe("with a previous 1-point move", function() {
    beforeEach(function() {
      turn.applyMove(InsurgentMove(Position(0)(0))(Position(0)(1)));
    });
    it("should list MOVE and GROW as valid actions", function() {
      var actions = turn.validActions();
      expect(_.contains(actions, InsurgentTurn.MOVE)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.GROW)).toBe(true);
    });
    it("should give 1 remaining movement point", function() {
      expect(turn.movementPoints()).toBe(1);
    });
    it("should mark the turn as not complete", function() {
      expect(turn.isComplete()).toBe(false);
    });
    it("should throw when given a 2 point move", function() {
      expect(function() {
        turn.applyMove(InsurgentMove(Position(0)(1))(Position(1)(1)));
      }).toThrow("Insufficient movement points!");
    });
    describe("and a GROW action", function() {
      beforeEach(function() {
        turn.applyGrow(Grow(Position(0)(0)));
      });
      it("should mark the turn as complete", function() {
        expect(turn.isComplete()).toBe(true);
      });
    });
  });
  describe("with a previous 2-point move", function() {
    beforeEach(function() {
      var move = InsurgentMove(Position(0)(0))(Position(0)(2));
      turn.applyMove(move);
    });
    it("should list only GROW as a valid action", function() {
      var actions = turn.validActions();
      expect(actions.length).toBe(2);
      expect(_.contains(actions, InsurgentTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.GROW)).toBe(true);
    });
    it("should give 0 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(0);
    });
    it("should not mark the turn as complete", function() {
      expect(turn.isComplete()).toBe(false);
    });
    it("should throw if another move is tried", function() {
      move = InsurgentMove(Position(0)(2))(Position(0)(4));
      expect(function() { turn.applyMove(move); }).toThrow("No movement points remaining!");
    });
  });
  describe("with a previous GROW action", function() {
    beforeEach(function() {
      turn.applyGrow(Grow(Position(0)(0)));
    });
    it("should give 2 remaining movement points", function() {
      expect(turn.movementPoints()).toBe(2);
    });
    it("should only list GROW and END_TURN as valid actions", function() {
      var actions = turn.validActions();
      expect(actions.length).toBe(2);
      expect(_.contains(actions, InsurgentTurn.END_TURN)).toBe(true);
      expect(_.contains(actions, InsurgentTurn.MOVE)).toBe(true);
    });
    it("should throw if a GROW is given", function() {
      expect(function() {
        turn.applyGrow(Grow(Position(0)(0)));
      }).toThrow();
    });
  });
});
return {
  name: 'insurgent_turn_spec'
};
});
